const aws = require('aws-sdk');
const s3 = new aws.S3();
const bucket = process.env.BUCKET;

exports.handler = function (event, context) {
  if (!event.Records) {
    return;
  }
  event.Records.forEach(record => {
    if (!record.Sns) {
      return;
    }
    var messageJson = false;
    try {
      if (!record.Sns.Message) {
        throw new Error('Sns.Message IS NULL');
      }
      console.log(record.Sns.Message);
      messageJson = JSON.parse(record.Sns.Message);
      if (!messageJson.mail.messageId) {
        throw new Error('messageJson.mail.messageId IS NULL');
      }

      var params = {
        Bucket: bucket,
        Key: messageJson.mail.messageId,
        Body: record.Sns.Message
      };
      s3.putObject(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
      });
    } catch (err) {
      console.log(err);
      return;
    }
  });
};
