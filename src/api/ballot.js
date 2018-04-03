const request = require('request');
const ballot = require('../services/ballot')
const vote = require('../services/vote')

const fs = require('fs')
const { URL } = require('url');
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid/v4');

returnJsonResponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

createTokens = (req, res) => {
  let ballot = req.params.id;

  if(process.env.NODEMAILER_LIST_PATH == undefined) {
    returnJsonResponse(res, 500, "NODEMAILER_LIST_PATH is undefined");
    return;
  }
  if(process.env.NODEMAILER_USER == undefined) {
    returnJsonResponse(res, 500, "NODEMAILER_USER is undefined");
    return;
  }
  if(process.env.NODEMAILER_PASS == undefined) {
    returnJsonResponse(res, 500, "NODEMAILER_PASS is undefined");
    return;
  }
  fs.readFile(process.env.NODEMAILER_LIST_PATH, 'utf8', (err, fileData) => {
    if (err) {
      console.log(err);
      return err;
    }

    console.log(req.headers.referer);
    console.log(new URL(req.headers.referer).origin)
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
                      `<p>${res.__("Your token for")} ${ballot} ${"is"}: <b>${token}</b></p>`+
                      `<p>${res.__("You can cast your vote at")}: ${votingUrl}</p>`+
                    '</body>'+
                  '</html>'
          };
    
          transporter.sendMail(mailOptions)
            .then(info => {
              console.log('Message sent: %s', info.messageId);
            })
            .catch(err => {
              returnJsonResponse(res, 1, err);
            });
        });
        returnJsonResponse(res, 200, "Success");

      })
      .catch(err => {
        console.log(err);
        returnJsonResponse(res, 1, err);
      });
  });    
}

deleteBallot = (req, res) => {
  console.log("DELETE ballot: " + req.params.id);
  ballot.delete(req.params.id)
    .then( data => {
      returnJsonResponse(res, 204, data);
    })
    .catch( err => {
      returnJsonResponse(res, 400, err)
    });  
}

getResults = (req, res) => {
  console.log('getResults');
  ballot.getResults(req.params.id)
    .then( data => {
      console.log('getResultsResponse');
      returnJsonResponse(res, 200, data);
    })
    .catch( err => {
      console.log('getResultsError');
      returnJsonResponse(res, 400, err)
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
  delete: deleteBallot,
  createTokens: createTokens,
  publishVote: publishVote,
  getResults: getResults
}