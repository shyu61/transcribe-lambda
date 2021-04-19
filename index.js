console.log('Loading function');

const aws = require('aws-sdk');
const transcribeService = new aws.TranscribeService({ apiVersion: '2017-10-26' });
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.handler = async (event, context) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const filePath = `https://s3-ap-northeast-1.amazonaws.com/${bucket}/${key}`
  const fileType = key.split('.')[1];
  const jobName = context.awsRequestId;

  const params = {
    LanguageCode: 'ja-JP',
    Media: {
      MediaFileUri: filePath,
    },
    TranscriptionJobName: jobName,
    MediaFormat: fileType,
    OutputBucketName: bucket,
    OutputKey: key.replace(/input/, 'output').replace(/\.[^/.]+$/, '.txt'),
  }

  console.log('Transcribe start');
  try {
    const response = await transcribeService.startTranscriptionJob(params).promise();
    console.log(response);
    console.log('Transcribe finished');
  } catch (err) {
    console.log(err);
    const message = `Error getting object ${key} from bucket ${bucket}.`;
    console.log(message);
    throw new Error(message);
  }
};
