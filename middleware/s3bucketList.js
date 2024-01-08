const dotenv = require("dotenv").config();
const { ListBucketsCommand, S3Client } = require("@aws-sdk/client-s3");

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_S3_KEY_ID,
    secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
  },
  region: process.env.AWS_S3_REGION,
  // bucket: process.env.AWS_S3_BUCKET,
});

const s3bucketList = async () => {
  const command = new ListBucketsCommand({});

  try {
    const { Owner, Buckets } = await client.send(command);
    // console.log(
    //   `${Owner.DisplayName} owns ${Buckets.length} bucket${
    //     Buckets.length === 1 ? "" : "s"
    //   }:`
    // );
    // console.log(`${Buckets.map((b) => ` • ${b.Name}`).join("\n")}`);
    return (`${Buckets.map((b) => ` • ${b.Name}`).join("\n")}`)
  } catch (err) {
    console.error(err);
  }
};

module.exports = s3bucketList;
