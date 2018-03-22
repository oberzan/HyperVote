const request = require('request');
const ballot = require('../services/ballot')
const vote = require('../services/vote')

const fs = require('fs')
const { URL } = require('url');
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid/v4');

var returnJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

function createTokens(req, res) {
  let ballot = req.params.id;

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
    
        let votingUrl = new URL(req.headers.referer).origin;
        tokens.forEach((token, i) => {
          let mailOptions = {
            from: '"Admin 👻" <a>',
            to: mails[i],
            subject: '[HyperVote] Voting token for ' + ballot,
            text: 'Hi.\n' +
                   `Your token for  ${ballot}  is: ${token}\n` + 
                   `You can cast your vote at: ${votingUrl}`,
            html: '<html>' +
                    '<head></head>' +
                    '<body>' +
                      '<h4>Hi</h4>'+
                      `<p>Your token for ${ballot} is: <b>${token}</b></p>`+
                      `<p>You can cast your vote at: ${votingUrl}</p>`+
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

function deleteBallot(req, res) {
  console.log("DELETE ballot: " + req.params.id);
  ballot.delete(req.params.id)
    .then( data => {
      returnJsonResponse(res, 204, data);
    })
    .catch( err => {
      returnJsonResponse(res, 1, err)
    });  
}

module.exports = {
  delete: deleteBallot,
  createTokens: createTokens
}