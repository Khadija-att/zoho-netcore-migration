import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import config from "../config.mjs";
const { BUCKET_PROCESSED, BUCKET_RAW, BUCKET_KEY_PREFIX } = config;
const s3Client = new S3Client({
  region: process.env.AWS_REGION_MUMBAI || "ap-south-1",
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 5_000,
    socketTimeout: 30_000,
    httpAgent: new (await import("http")).Agent({ keepAlive: true, maxSockets: 64 }),
    httpsAgent: new (await import("https")).Agent({ keepAlive: true, maxSockets: 64 }),
  }),
});

function toIST(date = new Date()) {
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
  if (typeof body.transformToByteArray === "function") {
    const bytes = await body.transformToByteArray();
    return new TextDecoder("utf-8").decode(bytes);
  }
  if (typeof body.transformToString === "function") {
    return await body.transformToString();
  }
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
  const key = `${BUCKET_KEY_PREFIX}/Module = ${userType}/Year = ${y}/Month = ${m}/Date = ${d}/data.json`;
  const storedLeadData = (leadData && leadData.originalData) ? leadData.originalData : leadData;
  const newEntry = { messageId, leadData: storedLeadData, savedAt: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) };
  let items = [];
  try {
    const getResp = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: key }));
    const bodyStr = await bodyToString(getResp.Body);
    if (bodyStr && bodyStr.length > 0) {
      const parsed = JSON.parse(bodyStr);
      items = Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch (err) {
    const code = err?.name || err?.Code || err?.$metadata?.httpStatusCode;
    if (!(code === "NoSuchKey" || code === "NotFound" || code === 404)) {
      console.error(`S3 read error for s3://${bucketName}/${key}`, err);
    }
  }
  items.push(newEntry);
  const body = JSON.stringify(items, null, 2) + "\n";
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