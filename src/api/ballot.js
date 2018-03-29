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

deleteBallot = (req, res) => {
  console.log("DELETE ballot: " + req.params.id);
  ballot.delete(req.params.id)
    .then( data => {
      returnJsonResponse(res, 204, data);
    })
    .catch( err => {
      returnJsonResponse(res, 1, err)
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
  publishVote: publishVote
}