const aws = require('aws-sdk');
const ses = new aws.SES({region: process.env.AWS_REGION});
const nodemailer = require("nodemailer");
const smime = require('nodemailer-smime');
const fs = require('fs');
const path = require('path');
const htmlToText = require('nodemailer-html-to-text').htmlToText;

var options = {
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem'), 'binary'),
  key: fs.readFileSync(path.join(__dirname, 'server.key'), 'binary'),
  chain: [
    fs.readFileSync(path.join(__dirname, 'chain.pem'), 'binary'),
    fs.readFileSync(path.join(__dirname, 'cert.pem'), 'binary'),
  ],
};

exports.handler = function (event, context, callback) {
  //handle api-gateway
  if (event.httpMethod === 'POST') {
    event = JSON.parse(event.body);
  }
  try {
    if (event.key !== process.env.MANDRILL_KEY) {
      context.fail(
        {
          statusCode: 401,
          body: JSON.stringify({error: "Authentication error, wrong toke!"}),
        }
      );
    }
    var mailOptions = {
      from: event.message.from_name + " <" + event.message.from_email + ">",
      to: event.message.to.map(o => o.email),
      subject: event.message.subject,
      html: event.message.html,
      priority: (event.message.important) ? "high" : "normal",
      headers: event.message.headers
    };
    var transporter = nodemailer.createTransport({
      SES: ses
    });
    transporter.use('compile', htmlToText());
    if (event.message.smime) {
      transporter.use('stream', smime(options));
    }
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
        context.fail(
          {
            statusCode: 500,
            body: JSON.stringify({error: err}),
          }
        );
      } else {
        const response = {
          statusCode: 200,
          body: JSON.stringify([{_id: info.messageId, status: "queued"}]),
        };
        context.succeed(response);
      }
    });
  } catch (err) {
    console.log(err);
    context.fail(
      {
        statusCode: 500,
        body: JSON.stringify({error: err}),
      }
    );
  }
};
