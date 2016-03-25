# sqs-to-lambda

> Trigger Lambda invocations from an SQS queue

This application listens to an SQS queue and creates a Lambda invocation whenever a message is received, bridging the gap between SQS and Lambda.

Having to run this application continually isn't ideal when your aim is to execute a function only when you need to – ~~it's a stop gap measure until SQS/SNS support (hopefully) arrives in Lambda~~.

**Update:** Lambda now [supports SNS notifications as an event source](http://docs.aws.amazon.com/sns/latest/dg/sns-lambda.html), which makes this hack entirely unneccessary for SNS notifcations. You might still find it useful if you like the idea of using a Lambda function to process jobs on an SQS queue.

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

Alternatively, you can also use environment variables to configure the application:

```
AWS_QUEUE_URL=<queue-url> AWS_FUNCTION_NAME=<function-name> AWS_REGION=<aws-region-id> sqs-to-lambda
```

> Note that if both environment variables are set and arguments are passed as flags, the arguments take precedence.

Additionally, when you have set `AWS_ENVIRONMENT` we will automatically append this behind your `<function-name>`.

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