import { buyerTransformations } from './transformations/buyer/buyerTransformation.mjs'
import { sellerTransformations } from './transformations/seller/sellerTransformation.mjs'
import { propertyTransformations } from './transformations/property/propertyTransformation.mjs'
import { channelPartnerTransformations } from './transformations/channelPartner/channelPartnerTransformation.mjs'
import { saveToRawS3, saveToProcessedS3 } from './services/s3Services.mjs';
import addContactToZoho from './services/netcoreServices.mjs';
import sendNetcoreEvent from './services/useEvents.mjs';
import config from "./config.mjs";
const {
  AWS_REGION_MUMBAI,
  BUCKET_PROCESSED,
  BUCKET_RAW,
  NETCORE_CONTACT_URL,
  NETCORE_EVENT_URL,
  BUYER_ASSET_ID,
  BUYER_NETCORE_API_KEY,
  SELLER_ASSET_ID,
  SELLER_NETCORE_API_KEY,
  CHANNEL_PARTNER_ASSET_ID,
  CHANNEL_PARTNER_NETCORE_API_KEY
} = config;

export const handler = async (event) => {
  try {
    const results = await Promise.all(
      event.Records.map(async (record) => {
        const messageId = record.messageId;
        const receivedZohoData = record.body;
        const parsed =
          typeof receivedZohoData === "string"
            ? JSON.parse(receivedZohoData)
            : receivedZohoData;

        const userType = parsed.User_Type;
        console.log(`Processing messageId=${messageId}, userType=${userType}`);
        let transformationFn, apiKey, assetId;

        switch (userType) {
          case "Buyer":
            transformationFn = buyerTransformations;
            apiKey = BUYER_NETCORE_API_KEY;
            assetId = BUYER_ASSET_ID;
            break;
          case "Seller":
            transformationFn = sellerTransformations;
            apiKey = SELLER_NETCORE_API_KEY;
            assetId = SELLER_ASSET_ID;
            break;
          case "Property":
            transformationFn = propertyTransformations;
            apiKey = SELLER_NETCORE_API_KEY;
            assetId = SELLER_ASSET_ID;
            break;
          case "Channel Partner":
            transformationFn = channelPartnerTransformations;
            apiKey = CHANNEL_PARTNER_NETCORE_API_KEY;
            assetId = CHANNEL_PARTNER_ASSET_ID;
            break;
          default:
            return { messageId, statusCode: 400, reason: "Unknown User_Type" };
        }

        await saveToRawS3(messageId, receivedZohoData, userType);

        const transformationForNetCore = await transformationFn(receivedZohoData);
        console.log("transformationForNetCore->>>>>>>", transformationForNetCore);

        if (!transformationForNetCore) {
          return { messageId, statusCode: 400, reason: "Transformation failed" };
        }
        console.log("Keys", NETCORE_CONTACT_URL, apiKey, assetId);

        const netcoreResponse = await addContactToZoho(
          transformationForNetCore,
          NETCORE_CONTACT_URL,
          apiKey,
          assetId
        );

        console.log("NetCore Response:", netcoreResponse);

        if (netcoreResponse.status !== 200) {
          return { messageId, statusCode: 400, reason: "Netcore API failed" };
        }

          const sendEvent = await sendNetcoreEvent(
            netcoreResponse.data,
            netcoreResponse.Created_Time,
            netcoreResponse.Modified_Time,
            userType
          );
          


          await saveToProcessedS3(messageId, transformationForNetCore, userType);

          if (sendEvent.status === 200) {
            return { messageId, statusCode: 200 };
          } else {
            return { messageId, statusCode: 400, reason: "Event sending failed" };
          }

        return { messageId, statusCode: 200 };
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ results }),
    };
  } catch (error) {
    console.error("Error processing records:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
