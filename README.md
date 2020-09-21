# Mandrill to AWS

The scope of this project/repo to make a low-effort migration from Mandrill to Amazon SES.

## Architecture and use-case

Flow:
 - Your app calls the mandrill-sender api endpoint.
 - The mandrill-sender converts your post body to an email and send it with SES (also returns with an emailId)
 - SES tries to deliver the email, if it bounces or delivers sends info to an SNS queue
 - ses-info-to-s3 gets the info from the SNS topic, and serialize the SES response to S3 (using the emailId as a key(/filename))
 - Your app calls the mandrill-delivery-info api endpoint, which will convert the S3 saved file and return with a mandrill like json
 
Our app only use the send and info endpoints. 
With a bit of thinkering other features can be implemented (also the currently implemented ones can be extended for better capabilities/mimic.

## Install

#### SES config
For starters you will need to do the [5 steps from the official quickstart guide](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/quick-start.html)

After it is done, you will need to enable Bounce, Complaint and Delivery notifications with original headers to a new sns topic.

#### S3 config
We should serialize the notifications, so we will need a new bucket to do so.
I named mine `email-bounce-delivery`, but you can name it as you wish. 
After you created your bucket, you probably want to configure some kind of expiry on that bucket!

#### SMIME cert (optional)
If you want to send emails with s/mime signs, you need to get a cert for the sender mail address.

#### Add ses info to s3
Follow the readme in the [ses-info-to-s3](./ses-info-to-s3/README.md) subfolder.

#### Add mandrill sender
Follow the readme in the [madrill-sender](./mandrill-sender/README.md)) subfolder.
(If you send out emails here as a test, your S3 bucket should populate with some example documents.)

#### Add mandrill delivery info
Follow the readme in the [mandrill-delivery-info](./mandrill-delivery-info/README.md) subfolder.

## After install
If you did all the steps in the install section, you will have two new api endpoints. Those can be used as a [send](https://mandrillapp.com/api/docs/messages.JSON.html#method=send) and [info](https://mandrillapp.com/api/docs/messages.JSON.html#method=info) endpoint.

## Price consideration
Sending 1m emails per month is;

720$ on [mandrill](https://mailchimp.com/pricing/transactional-email/)

100$ of [mailsend](https://aws.amazon.com/ses/pricing/) and 
31-40$ [lambda cost](https://aws.amazon.com/lambda/pricing/) (1m req, 6s runtime, and 384Mb ram sum for the three functions) and 
6$ [S3 cost](https://aws.amazon.com/s3/pricing/) (per request + some Gigs)
SUM: ~150$

Sending 1k emails per month is;

20$ on mandrill, and free tier on AWS.

(We started to migrate because of the lack of s/mime support, but the price can be a good selling point too.)

# Contribution and disclaimer
I'm quite new with AWS, and also a hacky javascript/node coder. 
Only use my functions/code, if you have time to understand and maintain it! 

PRs and contributions are welcome. 
