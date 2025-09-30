import axios from "axios";
import config from "../config.mjs";
const {
    NETCORE_EVENT_URL,
    BUYER_ASSET_ID,
    BUYER_NETCORE_API_KEY,
    SELLER_ASSET_ID,
    SELLER_NETCORE_API_KEY,
    CHANNEL_PARTNER_NETCORE_API_KEY,
    CHANNEL_PARTNER_ASSET_ID
} = config;

function isUpdateEvent(createdTimeStr, modifiedTimeStr) {
    if (!createdTimeStr || !modifiedTimeStr) return false;

    const created = new Date(Date.parse(createdTimeStr));
    const modified = new Date(Date.parse(modifiedTimeStr));

    if (isNaN(created.getTime()) || isNaN(modified.getTime())) {
        console.warn("Invalid dates:", createdTimeStr, modifiedTimeStr);
        return false;
    }

    return modified.getTime() > created.getTime();
}


async function sendNetcoreEvent(data, USER_CREATED_TIME, USER_MODIFIED_TIME, USER_TYPE) {
    let eventType, apiKey, assetId;
    if (USER_TYPE === "Seller") {
        eventType = isUpdateEvent(USER_CREATED_TIME, USER_MODIFIED_TIME)
            ? "Seller_lead_updated"
            : "Seller_lead_created";
        apiKey = SELLER_NETCORE_API_KEY;
        assetId = SELLER_ASSET_ID;
    }
    if (USER_TYPE === "Property") {
        eventType = isUpdateEvent(USER_CREATED_TIME, USER_MODIFIED_TIME)
            ? "Property_updated"
            : "Property_added";
        apiKey = SELLER_NETCORE_API_KEY;
        assetId = SELLER_ASSET_ID;
    }
    if (USER_TYPE === "Buyer") {
        eventType = isUpdateEvent(USER_CREATED_TIME, USER_MODIFIED_TIME)
            ? "buyer_lead_updated"
            : "buyer_lead_created";
        apiKey = BUYER_NETCORE_API_KEY;
        assetId = BUYER_ASSET_ID;
    }
    if (USER_TYPE === "Channel Partner") {
        eventType = isUpdateEvent(USER_CREATED_TIME, USER_MODIFIED_TIME)
            ? "channel_partner_updated"
            : "channel_partner_created";
        apiKey = CHANNEL_PARTNER_NETCORE_API_KEY;
        assetId = CHANNEL_PARTNER_ASSET_ID;
    }
    const response = await sendEvent(
        eventType,
        data?.USER_ID,
        { USER_ID: data?.USER_ID || "" },
        apiKey,
        assetId
    );

    const statusResponse = {
        statusCode: response.status,
    };
    return statusResponse;
}

async function sendEvent(activity_name, identity, activity_params, apiKey, assetId) {
    try {
        const event = {
            asset_id: assetId,
            activity_name,
            timestamp: new Date().toISOString(),
            identity,
            activity_source: "web",
            activity_params,
        };

        const axiosConfig = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            timeout: 200000,
        };
        const response = await axios.post(NETCORE_EVENT_URL, [event], axiosConfig);
        return response;

    } catch (err) {
        console.log(err)
    }
}


export default sendNetcoreEvent;