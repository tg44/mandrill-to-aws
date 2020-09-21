const aws = require('aws-sdk');
const s3 = new aws.S3();
const bucket = process.env.BUCKET;

exports.handler = async (event, context) => {
  //handle api-gateway
  let data;
  if (event.httpMethod === 'POST') {
    data = JSON.parse(event.body);
  }
  if (data.key !== process.env.MANDRILL_KEY) {
    context.succeed(
      {
        statusCode: 401,
        body: JSON.stringify({error: "Authentication error, wrong token!"}),
      }
    );
  } else {
    const params = {
      Bucket: bucket,
      Key: data.id
    };
    try {
      const down = await s3.getObject(params).promise();
      const body = JSON.parse(down.Body);
      var notiType = 'unknown';
      if (body.notificationType === 'Delivery') {
        notiType = 'sent';
      } else if (body.notificationType === 'Bounce') {
        if (body.bounce.bounceType === 'Permanent') {
          notiType = 'rejected';
        } else {
          notiType = 'bounced';
        }
      }
      const response = {
        "_id": data.id,
        "sender": body.mail.source,
        "subject": body.mail.commonHeaders.subject,
        "email": body.mail.destination[0],
        "tags": [],
        "opens": 0,
        "opens_detail": [],
        "clicks": 0,
        "clicks_detail": [],
        "state": notiType,
        "metadata": {},
        "smtp_events": []
      };
      context.succeed(
        {
          statusCode: 200,
          body: JSON.stringify(response),
        }
      );
    } catch (err) {
      console.log(err);
      context.succeed(
        {
          statusCode: 404,
          body: JSON.stringify(
            {
              "status": "error",
              "code": 11,
              "name": "Unknown_Message",
              "message": "No message exists with the id '" + data.id + "'"
            }
          ),
        }
      );
    }
  }
};
