const aws = require('aws-sdk');
const ses = new aws.SES({region: process.env.AWS_REGION});
const nodemailer = require("nodemailer");
const htmlToText = require('nodemailer-html-to-text').htmlToText;

exports.handler = function (event, context, callback) {
  //handle api-gateway
  if (event.httpMethod === 'POST') {
    event = JSON.parse(event.body);
  }
  try {
    if (event.key !== process.env.MANDRILL_KEY) {
      context.succeed(
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
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
        context.succeed(
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
    context.succeed(
      {
        statusCode: 500,
        body: JSON.stringify({error: err}),
      }
    );
  }
};
