const moment = require('moment');

const config = require('../../config.json');
const logger = require('../../log.js')(module);

const ballot = require('../services/ballot')
const vote = require('../services/vote')

const fs = require('fs')
const { URL } = require('url');
const nodemailer = require('nodemailer');
const rp = require('request-promise-native');
const uuidv4 = require('uuid/v4');

const i18n = require('../configs/i18n.js');

createBallot = (req, res) => {
  logger.info(req.body);
  if (req.body.endTime < moment())
    return res.status(400).json("Given end date is in the past");

  data = {
    "title": req.body.title.trim(),
    "description": req.body.description.trim(),
    "options": req.body.option,
    //"start": new Date().toISOString(),
    "end": moment(req.body.endTime, 'DD.MM.YYYY HH:mm').toDate(), //TODO: Fix for timezones. Cnvert on the client side
    "votes": [],
    "voters": []
  };
  logger.info(data);
  ballot.createBallot(data)
    .then(x => {
      res.sendStatus(200);
    })
    .catch(err => {
      res.sendStatus(400);
    });
}

publishTokens = (ballot, addresses, originUrl) => {
  return new Promise(async (resolve, reject) => {
    let tokens = [],
      emails = [],
      phoneNumbers = [],
      invalidAddresses = [];

    for (let i = 0; i < addresses.length; i++) {
      tokens.push(uuidv4());
    }
    addresses.forEach(x => {
      if (x.indexOf('@') > 0)
        emails.push(x);
      else {
        let m = x.replace(/[\s|-]/g, "").match(/\+?\d{9,}/);
        if (m)
          phoneNumbers.push(m);
        else
          invalidAddresses.push(x);
      }
    });
    if (invalidAddresses.length) {
      return reject("The following addresses are invalid:" + invalidAddresses + ". Did not send any tokens.");
    }

    let resp = await vote.publishTokens(ballot, tokens).catch(err => {
      logger.error(err);
      return reject(err);
    });
    logger.debug(resp);

    let mailConfig;
    if (config.nodemailer.url) {
      mailConfig = {
        host: config.nodemailer.url,
        port: 25,
        tls: { rejectUnauthorized: false },
        secure: false, // true for 465, false for other ports
        // auth: {
        //     user: account.user, // generated ethereal user
        //     pass: account.pass  // generated ethereal password
        // }
      };
    } else {
      mailConfig = {
        service: 'gmail',
        auth: {
          user: config.nodemailer.user, // generated ethereal user
          pass: config.nodemailer.password // generated ethereal password
        }
      };
    }

    let transporter = nodemailer.createTransport(mailConfig);

    let votingUrl = originUrl + '/' + ballot;
    let failedAddresses = [];
    for (let [i, token] of tokens.entries()) {
      let email = emails.pop();
      let text = `${i18n.__("Hi")}\n` +
        `${i18n.__("Your token for")} ${ballot}  ${"is"}: ${token}\n` +
        `${i18n.__("You can cast your vote at")}: ${votingUrl}`;
      
      if (email) {
        let mailOptions = {
          from: {
            name: config.nodemailer.from.name,
            address: config.nodemailer.from.address
          },
          to: email,
          subject: `[${config.name}] ${i18n.__("Voting token")} ${i18n.__("for")} ` + ballot,
          text: text,
          html: '<html>' +
            '<head></head>' +
            '<body>' +
            `<h4>${i18n.__("Hi")}</h4>` +
            `<p>${i18n.__("Your token for")} ${ballot} ${i18n.__("is")}: <b>${token}</b></p>` +
            `<p>${i18n.__("You can cast your vote at")}: <a href="${votingUrl}?token=${token}">${votingUrl}</a></p>` +
            '</body>' +
            '</html>'
        };

        logger.debug("Sending email to " + email);
        let info = await transporter.sendMail(mailOptions).catch(err => {
          logger.error(err);
          failedAddresses.push(email);
        });
        if (info)
          logger.info('Message sent: %s', info.messageId);

      } else {
        let phoneNumber = phoneNumbers.pop();

        if (!phoneNumber) {
          reject('???');
          failedAddresses.push(phoneNumber);
        } else {
          sendSMS(text, phoneNumber)
            .catch(err => {
              failedAddresses.push(phoneNumber);
            });
        }
      }
    };

    if (failedAddresses.length) {
      if (failedAddresses.length === addresses.length)
        reject({
          type: "ERROR",
          msg: "Failed to send any tokens."
        });
      else
        reject({
          type: "WARNING",
          msg: "Failed to send tokens to the following addresses: " + failedAddresses + "\nOther addresses did receive tokens."
        });
      return;
    }

    logger.info('Tokens successfully created.');
    let successMessage = `${i18n.__("Tokens for")} ${ballot} ${i18n.__("successfully sent")}.`;
    resolve(successMessage);
  });
};

sendSMS = async (text, phoneNumber) => {
  let body =
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:adm="http://mobitel.si/AdmLib/si/mobitel/mpro/administration/smsc/interf/AdmSmscInterface">
      <soapenv:Header>
        <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
          <wsse:UsernameToken wsu:Id="XWSSGID-1349973313023-787497544" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
              <wsse:Username>${config.sms.username, soa_ibm_sms}</wsse:Username>
              <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${config.sms.password}qHGUKtFWeJw</wsse:Password>
              <!-- <wsse:Nonce>WScqanjCEAC4mQoBE07sAQ==</wsse:Nonce> -->
          </wsse:UsernameToken>
        </wsse:Security>
      </soapenv:Header>
      <soapenv:Body>
        <adm:smscSendSms>
          <input>
              <from>${config.sms.from}</from>
              <msisdnTo>${phoneNumber}</msisdnTo>
              <text>${text}</text>
          </input>
        </adm:smscSendSms>
      </soapenv:Body>
    </soapenv:Envelope>`;
  
  let options = {
    method: 'POST',
    uri: 'http://services.ts.telekom.si:80/services/SMSProxy',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      // 'Content-Length': newOrder.length.toString(),
      // 'SOAPAction': 'http://shipping_software/AddOrder',
      // 'Host': 'myserver.com',
      'Connection': 'keep-alive'
    },
    body: body
  };

  rp(options)
    .catch(err => {
      throw new Error(err);
    });
}

createTokens = (req, res) => {
  let ballot = req.params.id;
  let addresses = req.body["addresses[]"];

  if (!addresses && !config.nodemailer.list_path) {
    res.status(500).json("Addresses were not provided and nodemailer list_path is undefined");
    return;
  }
  if (!config.nodemailer.url || !config.nodemailer.from) {
    if (!config.nodemailer.user) {
      res.status(500).json("nodemailer user is undefined");
      return;
    }
    if (!config.nodemailer.password) {
      res.status(500).json("nodemailer password is undefined");
      return;
    }
  }

  if (!addresses) {
    fs.readFile(config.nodemailer.list_path, 'utf8', (err, fileData) => {
      if (err) {
        logger.error(err);
        return err;
      }

      addresses = fileData.split(/,|\n/)
        .map(x => x.replace(/\s/g, ""))
        .filter(x => x !== '');
    });
  }

  if (typeof addresses === 'string') {
    addresses = [addresses];
  }

  let originUrl = new URL(req.headers.referer).origin;
  publishTokens(ballot, addresses, originUrl)
    .then(msg => {
      res.status(200).json(msg);
    })
    .catch(err => {
      res.status(400).json(err);
    });
}

deleteBallot = (req, res) => {
  logger.info("DELETE ballot: " + req.params.id);
  ballot.delete(req.params.id)
    .then(data => {
      res.status(204).json(data);
    })
    .catch(err => {
      res.status(400).json(err);
    });
}

getResults = (req, res) => {
  logger.debug('getResults');
  ballot.getResults(req.params.id)
    .then(data => {
      logger.debug('getResultsResponse');
      res.status(200).json(data);
    })
    .catch(err => {
      logger.debug('getResultsError');
      logger.error(err);
      res.status(400).json(err);
    });
}

publishVote = (req, res, next) => {
  let ballot = req.params.id;
  let option = req.body.option;
  vote.publishVote(ballot, req.body.token, option)
    .then(() => {
      res.status(200).send({
        message: `${res.__("You successfully voted")} ${ballot}. ${res.__("Your vote was")} ${option}.`
      });
    })
    .catch((err) => {
      res.status(400).send({
        message: `${res.__("Invalid token")}`
      });
    });
}

module.exports = {
  createBallot: createBallot,
  delete: deleteBallot,
  createTokens: createTokens,
  publishVote: publishVote,
  getResults: getResults
}