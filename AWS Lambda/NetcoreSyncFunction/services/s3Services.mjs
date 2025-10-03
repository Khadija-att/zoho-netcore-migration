// import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
// const s3Client = new S3Client({ region: process.env.AWS_REGION_MUMBAI || 'ap-south-1' });
// import config from "../config.mjs";
// const { BUCKET_PROCESSED, BUCKET_RAW } = config;

// function getISTDate(date = new Date()) {
//   const tzOffsetMin = date.getTimezoneOffset();
//   const utcMs = date.getTime() + tzOffsetMin * 60000;
//   const istOffsetMs = 5.5 * 60 * 60000;
//   return new Date(utcMs + istOffsetMs);
// }

// function getYMDParts(date = new Date()) {
//   const istDate = getISTDate(date);
//   const y = istDate.getFullYear();
//   const m = String(istDate.getMonth() + 1).padStart(2, '0');
//   const d = String(istDate.getDate()).padStart(2, '0');
//   return { y, m, d };
// }

// async function streamToString(stream) {
//   if (!stream) return '';
//   if (typeof stream.transformToString === 'function') {
//     return await stream.transformToString();
//   }
//   return await new Promise((resolve, reject) => {
//     const chunks = [];
//     stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
//     stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
//     stream.on('error', reject);
//   });
// }

// async function appendToBucket(bucketName, messageId, leadData, userType) {
//   const now = new Date();
//   const { y, m, d } = getYMDParts(now);
//   const key = `${userType}/${y}/${m}/${d}/data.json`;

//   const storedLeadData = (leadData && leadData.originalData) ? leadData.originalData : leadData;
//   const istNow = getISTDate(now);
//   const newEntry = { messageId, leadData: storedLeadData, savedAt: istNow.toISOString() };

//   let items = [];
//   try {
//     const getCmd = new GetObjectCommand({ Bucket: bucketName, Key: key });
//     const getResp = await s3Client.send(getCmd);
//     const bodyStr = await streamToString(getResp.Body);
//     if (bodyStr && bodyStr.trim().length > 0) {
//       const parsed = JSON.parse(bodyStr);
//       items = Array.isArray(parsed) ? parsed : [parsed];
//     }
//   } catch (err) {
//     const code = err?.name || err?.Code || err?.$metadata?.httpStatusCode;
//     if (code === 'NoSuchKey' || code === 'NotFound' || code === 404) {
//       console.log(`ℹ️ [${bucketName}] No existing data.json found — will create new one.`);
//       items = [];
//     } else {
//       console.error(`❌ [${bucketName}] Error reading existing data.json:`, err);
//     }
//   }

//   items.push(newEntry);
//   const putCmd = new PutObjectCommand({
//     Bucket: bucketName,
//     Key: key,
//     Body: JSON.stringify(items, null, 2),
//     ContentType: 'application/json',
//     Metadata: {
//       'message-id': messageId,
//       'processed-at': now.toISOString()
//     }
//   });
//   const putResp = await s3Client.send(putCmd);
//   return { success: true, location: `s3://${bucketName}/${key}`, key, etag: putResp.ETag, count: items.length };
// }

// export const saveToRawS3 = async (messageId, data, USER_TYPE) => {
//   return await appendToBucket(BUCKET_RAW, messageId, data, USER_TYPE);
// };

// export const saveToProcessedS3 = async (messageId, data, USER_TYPE) => {
//   return await appendToBucket(BUCKET_PROCESSED, messageId, data, USER_TYPE);
// };






import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import config from "../config.mjs";

const { BUCKET_PROCESSED, BUCKET_RAW } = config;

// ---- S3 client with keep-alive + higher concurrency
const s3Client = new S3Client({
  region: process.env.AWS_REGION_MUMBAI || "ap-south-1",
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 5_000,
    socketTimeout: 30_000,
    httpAgent: new (await import("http")).Agent({ keepAlive: true, maxSockets: 64 }),
    httpsAgent: new (await import("https")).Agent({ keepAlive: true, maxSockets: 64 }),
  }),
});

/** Fast IST without Intl */
function toIST(date = new Date()) {
  // getTimezoneOffset is minutes behind UTC; convert to ms and add +5:30h
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60_000;
  return new Date(utcMs + 5.5 * 60 * 60_000);
}

function ymdPath(date = new Date()) {
  const d = toIST(date);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return { y, m, d: day };
}

async function bodyToString(body) {
  if (!body) return "";
  // Modern runtimes (Node 18+) expose these fast helpers
  if (typeof body.transformToByteArray === "function") {
    const bytes = await body.transformToByteArray();
    return new TextDecoder("utf-8").decode(bytes);
  }
  if (typeof body.transformToString === "function") {
    return await body.transformToString();
  }
  // Fallback: stream accumulate
  return await new Promise((resolve, reject) => {
    const chunks = [];
    body.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    body.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    body.on("error", reject);
  });
}

async function appendToBucket(bucketName, messageId, leadData, userType) {
  const now = new Date();
  const { y, m, d } = ymdPath(now);
  const key = `${userType}/${y}/${m}/${d}/data.json`;

  // Preserve original shape exactly like before
  const storedLeadData = (leadData && leadData.originalData) ? leadData.originalData : leadData;
  const newEntry = { messageId, leadData: storedLeadData, savedAt: toIST(now).toISOString() };

  let items = [];
  try {
    const getResp = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: key }));
    const bodyStr = await bodyToString(getResp.Body);
    if (bodyStr && bodyStr.length > 0) {
      // If it was a single object historically, keep backward‑compat by wrapping
      const parsed = JSON.parse(bodyStr);
      items = Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch (err) {
    const code = err?.name || err?.Code || err?.$metadata?.httpStatusCode;
    if (!(code === "NoSuchKey" || code === "NotFound" || code === 404)) {
      // Non-404 error: log and continue with empty (same behavior as earlier code)
      console.error(`S3 read error for s3://${bucketName}/${key}`, err);
    }
  }

  items.push(newEntry);

  // Write compact JSON (no indentation) -> smaller payload, faster upload
  const body = JSON.stringify(items);

  const putResp = await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: "application/json",
      Metadata: {
        "message-id": messageId,
        "processed-at": now.toISOString(),
      },
    })
  );

  return {
    success: true,
    location: `s3://${bucketName}/${key}`,
    key,
    etag: putResp.ETag,
    count: items.length,
  };
}

export const saveToRawS3 = (messageId, data, USER_TYPE) =>
  appendToBucket(BUCKET_RAW, messageId, data, USER_TYPE);

export const saveToProcessedS3 = (messageId, data, USER_TYPE) =>
  appendToBucket(BUCKET_PROCESSED, messageId, data, USER_TYPE);
