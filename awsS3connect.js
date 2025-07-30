import { S3Client,GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import dotenv from 'dotenv';
import zlib from "zlib";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_SECRETACCESSKEY,
  },
});

const uploadFileS3 = async (filePath)=>{
  try{
  const readStream = fs.createReadStream(filePath);

  const gzipStream = zlib.createGzip();

  const upload = new Upload({
    client:s3,
    params:{
      Bucket:process.env.AWS_BUCKET_NAME,
      Key:"important/large-file.pdf.gz",
      Body: readStream.pipe(gzipStream),
      ContentEncoding: "gzip",
    }
  });

  await upload.done();
  console.log(`Done`)
}catch(err){console.error(err);}}

const downloadFileS3 = async (key, destinationPath) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const response = await s3.send(command);

    const writeStream = fs.createWriteStream(destinationPath);
    response.Body.pipe(writeStream);

    writeStream.on("close", () => {
      console.log("Download complete:", destinationPath);
    });

    writeStream.on("error", (err) => {
      console.error("Write stream error:", err);
    });

  } catch (err) {
    console.error("Download error:", err);
  }
};


//downloadFileS3("important/large-file.txt", "./downloaded-large-file.txt");


uploadFileS3("/home/leonid/awstest/uploads/test.pdf");