const moment = require('moment');

const config = require('../../config.json');

const ballot = require('../services/ballot')
const vote = require('../services/vote')

const fs = require('fs')
const { URL } = require('url');
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid/v4');

createBallot = (req, res) => {
  console.log(req.body);
  console.log(req.body.endTime);

  data = {
    "title": req.body.title,
    "description": req.body.description,
    "options": req.body.option,
    //"start": new Date().toISOString(),
    "end": moment(req.body.endTime, 'DD.MM.YYYY HH:mm').toDate(), //TODO: Fix for timezones. Cnvert on the client side
    "votes": [],
    "voters": []
  };
  console.log(data);
  ballot.createBallot(data)
    .then(x => {
        console.log("RESPONSE: ")
        console.log(x);
        res.status(200).end();
    });
}

createTokens = (req, res) => {
  let ballot = req.params.id;

  if(!config.nodemailer.list_path) {
    res.status(500).json("nodemailer list_path is undefined");
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
  fs.readFile(config.nodemailer.list_path, 'utf8', (err, fileData) => {
    if (err) {
      console.log(err);
      return err;
    }

    let mails = fileData.split(/,|\n/);

    let tokens = [];
    for(let i = 0; i < mails.length; i++) {
      tokens.push(uuidv4());
    }

    vote.publishTokens(req.params.id, tokens)
      .then(() => {
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.NODEMAILER_USER, // generated ethereal user
            pass: process.env.NODEMAILER_PASS // generated ethereal password
          }
        });
    
        let votingUrl = new URL(req.headers.referer).origin + '/' + ballot;
        tokens.forEach((token, i) => {
          let mailOptions = {
            from: '"HyperVote admin" <a>',
            to: mails[i],
            subject: '[HyperVote] Voting token for ' + ballot,
            text: `${res.__("Hi")}\n` +
                  `${res.__("Your token for")} ${ballot}  ${"is"}: ${token}\n` + 
                  `${res.__("You can cast your vote at")}: ${votingUrl}`,
            html: '<html>' +
                    '<head></head>' +
                    '<body>' +
                      `<h4>${res.__("Hi")}</h4>`+
                      `<p>${res.__("Your token for")} ${ballot} ${res.__("is")}: <b>${token}</b></p>`+
                      `<p>${res.__("You can cast your vote at")}: ${votingUrl}</p>`+
                    '</body>'+
                  '</html>'
          };
    
          transporter.sendMail(mailOptions)
            .then(info => {
              console.log('Message sent: %s', info.messageId);
            })
            .catch(err => {
              res.status(400).json(err);
            });
        });
        let successMessage = `${res.__("Tokens for")} ${ballot} ${res.__("successfully sent")}.`;
        res.status(200).json(successMessage);

      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  });    
}

deleteBallot = (req, res) => {
  console.log("DELETE ballot: " + req.params.id);
  ballot.delete(req.params.id)
    .then( data => {
      res.status(204).json(data);
    })
    .catch( err => {
      res.status(400).json(err);
    });  
}

getResults = (req, res) => {
  console.log('getResults');
  ballot.getResults(req.params.id)
    .then( data => {
      console.log('getResultsResponse');
      res.status(200).json(data);
    })
    .catch( err => {
      console.log('getResultsError');
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
      // res.render('voted', {
      //   ballot: ballot,
      //   option: option,
      //   i18n: res
      // });
    })
    .catch((err) => {
      res.status(400).send({
        message: `${res.__("Invalid token")}`
      });

      // if(err.toString().indexOf("does not exist") > -1){
      //   console.log("Does not exist");
      // }
      // res.render('error', {
      //   error: {
      //     stack: err.stack
      //   }
      // });
    });
}

module.exports = {
  createBallot: createBallot,
  delete: deleteBallot,
  createTokens: createTokens,
  publishVote: publishVote,
  getResults: getResults
}