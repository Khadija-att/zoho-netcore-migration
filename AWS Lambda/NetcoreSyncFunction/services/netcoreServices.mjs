import axios from "axios";

async function addContactToZoho(data, NETCORE_CONTACT_URL, NETCORE_API_KEY, ASSET_ID) {
    let requestUrl;
    const urlObj = new URL(NETCORE_CONTACT_URL);
    urlObj.searchParams.set('type', 'contact');
    urlObj.searchParams.set('activity', data.ACTIVITY);
    urlObj.searchParams.set('apikey', NETCORE_API_KEY);
    requestUrl = urlObj.toString();
    const payloadToSend = { ...data };
    const Created_Time = payloadToSend._original_payload.Created_Time;
    const Modified_Time = payloadToSend._original_payload.Modified_Time;
    if (payloadToSend._original_payload) delete payloadToSend._original_payload;

    const contactJsonString = JSON.stringify(payloadToSend);
    const bodyParams = new URLSearchParams();
    bodyParams.append('data', contactJsonString);
    const axiosConfig = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 200000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    };
    console.log("Request URL: ", requestUrl, bodyParams);
    const resp = await axios.post(requestUrl, bodyParams, axiosConfig);
    const response = {
        status:resp.status,
        data:payloadToSend,
        Created_Time,Modified_Time
    }
    return response;
}

export default addContactToZoho;