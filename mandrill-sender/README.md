# Mandrill Sender

This is a [mandrill-send json](https://mandrillapp.com/api/docs/messages.JSON.html#method=send) compatible lambda-function endpoint which can send with amazon ses.
(Only a limited feature set is implemented, for reference see the `test.json`)

It also handles s/mime. (If you add `smime: true` to your message json.)

Also creates a html -> text conversion.

## Install
#### Layer
```
cd nodejs
npm i
cd ..
zip -r smime-lambda-layer.zip nodejs/
```
Copy the zip file as a new layer. (You can add dependencies in the nodejs folder with npm, and after rezip the dir, and upload it as a new version of the layer.)

#### Code (SMIME support)
You need to upload (copy/paste) the index.js to the function editor.

Also if you get a .pfx file from your cert provider you should [prepare the files](https://uly.me/convert-pfx-to-pem-format/) as;
```
openssl pkcs12 -in cert.pfx -nocerts -out key.pem
openssl rsa -in key.pem -out server.key
openssl pkcs12 -in cert.pfx -clcerts -nokeys -out cert.pem
openssl pkcs12 -in cert.pfx -nodes -nokeys -out chain.pem
```
Copy the `server.key`, `cert.pem` and `chain.pem` files to the lambda editor.

You will need to set `MANDRILL_KEY` envvar too.
 
#### Code (no SMIME support)
You need to upload (copy/paste) the `index.on-smime.js` as `index.js` to the function editor.

You will need to set `MANDRILL_KEY` envvar too.

#### Permissions / AccessControl
You should add the SES sendMail policy to the execution role under the Permissions tab;
```
{
    "Effect": "Allow",
    "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
    ],
    "Resource": "*"
}
```

#### Api gateway
You should add an API Gateway Trigger too. (REST api with no security.)

#### Resources
Signing and sending a mail is timeconsumeing! You need to tune the timeout at least to 5s (but 10s is preferred).

## Test
You can test the function with customizing the given test.json. Also, you can test it with the endpoint;
`curl -X POST -d @test.json ENDPOINT_FROM_AWS`
