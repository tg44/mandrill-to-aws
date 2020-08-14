# Mandrill Delivery Info

This lambda provides a [mandrill-info](https://mandrillapp.com/api/docs/messages.JSON.html#method=info) like endpoint 
from S3 saved delivery and bounce messages.

## Install
#### Code
You need to upload (copy/paste) the index.js to the function editor.

You will need to set `MANDRILL_KEY` and `BUCKET` envvar too.

#### Permissions / AccessControl
You should add the S3 access policy to the execution role under the Permissions tab;
```
{
    "Effect": "Allow",
    "Action": "s3:*",
    "Resource": [
        "arn:aws:s3:::email-bouce-delivery/*"
    ]
}
```
(If you use another s3 bucket name, you should change `email-bouce-delivery` to that.)

#### Api gateway
You should add an API Gateway Trigger too. (REST api with no security.)

## Test
You can test the function with customizing the given `test.json`. Also, you can test it with the endpoint;
`curl -X POST -d @test.json ENDPOINT_FROM_AWS`
