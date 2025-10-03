import axios from 'axios';
import config from "../config.mjs";
const { BUYER_ASSET_ID, BUYER_NETCORE_API_KEY, SELLER_ASSET_ID, SELLER_NETCORE_API_KEY, NETCORE_EVENT_URL, CP_NETCORE_API_KEY, CP_ASSET_ID } = config;

async function sendNetcoreActivity(activity_name, identity, activity_params, userType) {
  try {
    let apiKey, assetId;
    if (userType === "Seller") {
      apiKey = SELLER_NETCORE_API_KEY;
      assetId = SELLER_ASSET_ID;
    }
    if (userType === "Property") {
      apiKey = SELLER_NETCORE_API_KEY;
      assetId = SELLER_ASSET_ID;
    }
    if (userType === "Buyer") {
      apiKey = BUYER_NETCORE_API_KEY;
      assetId = BUYER_ASSET_ID;
    } 
    if (userType === "Channel Partner") {
      apiKey = CP_NETCORE_API_KEY;
      assetId = CP_ASSET_ID;
    } 

    const event = {
      asset_id: assetId,
      activity_name,
      timestamp: new Date().toISOString(),
      identity,
      activity_source: "web",
      activity_params,
    };  
    console.log(JSON.stringify(event) + "--------------------> Event h")
    const axiosConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 20000,
    };

    const response = await axios.post(NETCORE_EVENT_URL, [event], axiosConfig);
    return { 
      data: response.data,    
    };   
  } catch (error) {
    console.error("Netcore activity upload failed:", error?.response?.data || error.message);
    throw error; 
  }
}

export { sendNetcoreActivity };
