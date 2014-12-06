# sqs-to-lambda

> Trigger Lambda invocations from an SQS queue

[AWS Lambda](http://aws.amazon.com/lambda/) doesn't currently support [SQS](http://aws.amazon.com/sqs/) or [SNS](http://aws.amazon.com/sns/) as an event source. This application listens to an SQS queue and creates a Lambda invocation whenever a message is received, bridging the gap between SQS and Lambda.

Having to run this application continually isn't ideal when your aim is to execute a function only when you need to – it's a stop gap measure until SQS/SNS support (hopefully) arrives in Lambda.

## Installation

```
npm install -g sqs-to-lambda
```

## Usage

The application needs to run as an IAM user that has permission to consume from your queue and invoke any Lambda functions. If you're running it in EC2 then it will authenticate using an [instance profile](http://docs.aws.amazon.com/IAM/latest/UserGuide/instance-profiles.html), otherwise you need to export your credentials:

```
export AWS_SECRET_ACCESS_KEY=...
export AWS_ACCESS_KEY_ID=...
```

Start the application:

```
sqs-to-lambda --queue-url <queue-url> --function-name <function-name> --region <aws-region-id>
```

## SQS message format

The SQS message body should be in JSON format. The content of the message is passed to your Lambda function as its first argument. For example:

_SQS message body_

```json
{
  "name": "Robin Murphy",
  "email": "robin@robinmurphy.co.uk"
}
```

_Lambda function_

```js
exports.handler = function (data, context) {
  console.log("Name:", data.name);
  console.log("Email:", data.email);
  context.done();
}
```