const moment = require('moment');

const config = require('../../config.json');
const logger = require('../../log.js')(module);

const ballot = require('../services/ballot')
const vote = require('../services/vote')

const fs = require('fs')
const { URL } = require('url');
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid/v4');

const i18n = require('../configs/i18n.js');

createBallot = (req, res) => {
  logger.info(req.body);
  if (req.body.endTime < moment())
    return res.status(400).json("Given end date is in the past");

  data = {
    "title": req.body.title,
    "description": req.body.description,
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

publishTokens = (ballot, emails, originUrl) => {
  return new Promise(async (resolve, reject) => {
    let tokens = [];
    for(let i = 0; i < emails.length; i++) {
      tokens.push(uuidv4());
    }

    vote.publishTokens(ballot, tokens)
      .then(async () => {
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: config.nodemailer.user, // generated ethereal user
            pass: config.nodemailer.password // generated ethereal password
          }
        });
    
        let votingUrl = originUrl + '/' + ballot;
        for (let [i, token] of tokens.entries()) {
          let mailOptions = {
            from: '"HyperVote admin" <a>',
            to: emails[i],
            subject: `[HyperVote] ${i18n.__("Voting token")} ${i18n.__("for")} ` + ballot,
            text: `${i18n.__("Hi")}\n` +
                  `${i18n.__("Your token for")} ${ballot}  ${"is"}: ${token}\n` + 
                  `${i18n.__("You can cast your vote at")}: ${votingUrl}`,
            html: '<html>' +
                    '<head></head>' +
                    '<body>' +
                      `<h4>${i18n.__("Hi")}</h4>`+
                      `<p>${i18n.__("Your token for")} ${ballot} ${i18n.__("is")}: <b>${token}</b></p>`+
                      `<p>${i18n.__("You can cast your vote at")}: <a href="${votingUrl}?token=${token}">${votingUrl}</a></p>`+
                    '</body>'+
                  '</html>'
          };

          logger.debug("Sending email to" + emails[i]);
          await transporter.sendMail(mailOptions)
            .then(info => {
              logger.info('Message sent: %s', info.messageId);
            })
            .catch(err => {
              logger.error(err);
              reject(err);
            });
        };
        logger.info('Tokens successfully created.');
        let successMessage = `${i18n.__("Tokens for")} ${ballot} ${i18n.__("successfully sent")}.`;
        resolve(successMessage);

      })
      .catch(err => {
        logger.error(err);
        reject(err);
      });
  });
};

createTokens = (req, res) => {
  let ballot = req.params.id;
  let emails = req.body["emails[]"];

  if(!emails && !config.nodemailer.list_path) {
    res.status(500).json("Emails were not provided and nodemailer list_path is undefined");
    return;
  }
  if(!config.nodemailer.user) {
    res.status(500).json("nodemailer user is undefined");
    return;
  }
  if(!config.nodemailer.password) {
    res.status(500).json("nodemailer password is undefined");
    return;
  }

  if(!emails) {
    fs.readFile(config.nodemailer.list_path, 'utf8', (err, fileData) => {
      if (err) {
        logger.error(err);
        return err;
      }

      if(!mails)
        emails = fileData.split(/,|\n/)
          .map(x => x.trim())
          .filter(x => x !== '');      
    });    
  }

  let originUrl = new URL(req.headers.referer).origin;
  publishTokens(ballot, emails, originUrl)
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
    .then( data => {
      logger.debug('getResultsResponse');
      res.status(200).json(data);
    })
    .catch( err => {
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