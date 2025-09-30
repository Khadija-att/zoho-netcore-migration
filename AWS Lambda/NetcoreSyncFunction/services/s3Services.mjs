import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
const s3Client = new S3Client({ region: process.env.AWS_REGION_MUMBAI || 'ap-south-1' });
import config from "../config.mjs";
const { BUCKET_PROCESSED, BUCKET_RAW } = config;

function getISTDate(date = new Date()) {
  const tzOffsetMin = date.getTimezoneOffset();
  const utcMs = date.getTime() + tzOffsetMin * 60000;
  const istOffsetMs = 5.5 * 60 * 60000;
  return new Date(utcMs + istOffsetMs);
}

function getYMDParts(date = new Date()) {
  const istDate = getISTDate(date);
  const y = istDate.getFullYear();
  const m = String(istDate.getMonth() + 1).padStart(2, '0');
  const d = String(istDate.getDate()).padStart(2, '0');
  return { y, m, d };
}

async function streamToString(stream) {
  if (!stream) return '';
  if (typeof stream.transformToString === 'function') {
    return await stream.transformToString();
  }
  return await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
}

async function appendToBucket(bucketName, messageId, leadData, userType) {
  const now = new Date();
  const { y, m, d } = getYMDParts(now);
  const key = `${userType}/${y}/${m}/${d}/data.json`;

  const storedLeadData = (leadData && leadData.originalData) ? leadData.originalData : leadData;
  const istNow = getISTDate(now);
  const newEntry = { messageId, leadData: storedLeadData, savedAt: istNow.toISOString() };

  let items = [];
  try {
    const getCmd = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const getResp = await s3Client.send(getCmd);
    const bodyStr = await streamToString(getResp.Body);
    if (bodyStr && bodyStr.trim().length > 0) {
      const parsed = JSON.parse(bodyStr);
      items = Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch (err) {
    const code = err?.name || err?.Code || err?.$metadata?.httpStatusCode;
    if (code === 'NoSuchKey' || code === 'NotFound' || code === 404) {
      console.log(`ℹ️ [${bucketName}] No existing data.json found — will create new one.`);
      items = [];
    } else {
      console.error(`❌ [${bucketName}] Error reading existing data.json:`, err);
    }
  }

  items.push(newEntry);
  const putCmd = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: JSON.stringify(items, null, 2),
    ContentType: 'application/json',
    Metadata: {
      'message-id': messageId,
      'processed-at': now.toISOString()
    }
  });
  const putResp = await s3Client.send(putCmd);
  return { success: true, location: `s3://${bucketName}/${key}`, key, etag: putResp.ETag, count: items.length };
}

export const saveToRawS3 = async (messageId, data, USER_TYPE) => {
  return await appendToBucket(BUCKET_RAW, messageId, data, USER_TYPE);
};

export const saveToProcessedS3 = async (messageId, data, USER_TYPE) => {
  return await appendToBucket(BUCKET_PROCESSED, messageId, data, USER_TYPE);
};