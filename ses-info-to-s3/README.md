# SES info to S3

This lambda serializes events from SES -> SNS to S3.

## Install
#### Code
You need to upload (copy/paste) the index.js to the function editor.

You will need to set `BUCKET` envvar too.

#### Permissions / AccessControl
You should add the S3 access policy to the execution role under the Permissions tab;
```
{
    "Effect": "Allow",
    "Action": "s3:*",
    "Resource": [
        "arn:aws:s3:::email-bounce-delivery/*"
    ]
}
```
(If you use another s3 bucket name, you should change `email-bounce-delivery` to that.)

#### SNS Trigger
You should add an SNS Trigger too. Select the "Bounce, Complaint and Delivery notifications" topic.

## Test
I think this is pretty hard to test. The given `test.json` is a really minimalistic test case. 
