const aws = require('aws-sdk');
const ses = new aws.SES({region: process.env.AWS_REGION});
const nodemailer = require("nodemailer");
const htmlToText = require('nodemailer-html-to-text').htmlToText;

exports.handler = function (event, context, callback) {
  //handle api-gateway
  let data;
  if (event.httpMethod === 'POST') {
    data = JSON.parse(event.body);
  }
  try {
    if (data.key !== process.env.MANDRILL_KEY) {
      context.succeed(
        {
          statusCode: 401,
          body: JSON.stringify({error: "Authentication error, wrong token!"}),
        }
      );
    }
    var mailOptions = {
      from: data.message.from_name + " <" + data.message.from_email + ">",
      to: data.message.to.map(o => o.email),
      subject: data.message.subject,
      html: data.message.html,
      priority: (data.message.important) ? "high" : "normal",
      headers: data.message.headers
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
