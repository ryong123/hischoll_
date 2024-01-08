const dotenv = require("dotenv").config();
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3')


// const client = new S3Client({});
const client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_S3_KEY_ID,
    secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
    // bucket: process.env.AWS_S3_BUCKET,
  },
  region: process.env.AWS_S3_REGION,
});

const s3objectList = async () => {
  const command = new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET,
    // The default and maximum number of keys returned is 1000. This limits it to
    // one for demonstration purposes.
    MaxKeys: 1,
  });

  try {
    let isTruncated = true;

    // console.log("버킷에 담겨있는 항목:\n");
    let contents = "";

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } =
        await client.send(command);
      const contentsList = Contents.map((c) => ` • ${c.Key}`).join("\n");
      contents += contentsList + "\n";
      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }
    // console.log(contents);
    return contents;
  } catch (err) {
    console.error(err);
  }
};

module.exports = s3objectList;