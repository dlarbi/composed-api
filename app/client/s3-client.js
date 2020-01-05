import AWS from 'aws-sdk';
import fs from 'fs';
import uuid from 'uuid';
import Utils from '../utils/utils.js';

const BUCKET_NAME = 'composed-app-images';

const s3 = new AWS.S3({
  region: 'us-east-2',
  endpoint: 'https://s3.us-east-2.amazonaws.com',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    // Read content from the file
    const fileContent = fs.readFileSync(filePath);

    // Setting up S3 upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: filePath, // File name you want to save as in S3
      Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
      if (err) {
        throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      resolve(data);
    });
  });
};

export default {
  uploadFile
};
