#! /usr/bin/env node

var AWS = require('aws-sdk');
var argv = require('yargs').argv;
var Consumer = require('sqs-consumer');
var debug = require('debug')('sqs-to-lambda');

var region = argv.region;
var queueUrl = argv.queueUrl;
var functionName = argv.functionName;

if (!region || !queueUrl || !functionName) {
  console.log('Usage: sqs-to-lambda --queue-url <queue-url> --function-name <function-name> --region <region>');
  process.exit();
}

var app = new Consumer({
  queueUrl: queueUrl,
  region: region,
  handleMessage: handleMessage
});

var lambda = new AWS.Lambda({
  region: region
});

function handleMessage(message, done) {
  lambda.invokeAsync({
    FunctionName: functionName,
    InvokeArgs: message.Body
  }, function (err, res) {
    if (err) {
      debug('Failed to invoke function for message %s', message.MessageId);
      debug(err);

      return done(err);
    }

    debug('Function invoked for message %s', message.MessageId);
    debug(res);

    done();
  });
}

function verifyLambdaFunction(cb) {
  lambda.getFunction({
    FunctionName: functionName
  }, cb);
}

app.on('error', function (err) {
  console.error(err.message);
});

verifyLambdaFunction(function (err) {
  if (err) {
    console.error('Could not get Lambda function with name', functionName + ':', err.message);
    process.exit(1);
  }

  debug('Starting polling for SQS messages');
  app.start();
});