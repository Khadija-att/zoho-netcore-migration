import { sendNetcoreActivity } from './services/useEvents.mjs';

export const handler = async (event) => {
  try {
    console.log(event.Records.length, 'event.Records');
    const results = [];
    for (const record of event.Records || []) {
      const messageId = record.messageId;
      try {
        const messageBody = JSON.parse(record.body);
        console.log(`Processing message New ${messageId}:`, messageBody);
        const userType = messageBody.User_Type;
        let identity;
        if(userType == "Buyer"){
        identity =messageBody.Lead_Id || messageBody.Lead_Id === 0? String(messageBody.Lead_Id): null;
        }
        if(userType == "Seller"){
          identity =messageBody.Seller_Id || messageBody.Seller_Id === 0? String(messageBody.Seller_Id): null;
        }
        if(userType == "Property"){
          identity =messageBody.Property_Id || messageBody.Property_Id === 0? String(messageBody.Property_Id): null;
        }
        if(userType == "Channel Partner"){
          identity =messageBody.Channel_Partner_Id || messageBody.Channel_Partner_Id === 0? String(messageBody.Channel_Partner_Id): null;
        }
        const activity_name = messageBody.activity_name;

        if (!identity) {
          console.warn('No Id found for identity.');
          continue;
        }

        const { User_Type, ...messageBodyWithoutUserType } = messageBody;

        let response = await sendNetcoreActivity(
          activity_name,
          identity,
          messageBodyWithoutUserType,
          userType
        );

        console.log(JSON.stringify(response),'----------------------------sendNetcoreActivity')
        results.push({ 
          messageId, 
          response: response.data,  
        });

      } catch (error) {
        console.error(`Failed processing ${messageId}:`, error.message);
      }
    }
 

    return { statusCode: 200, data: results };

  } catch (Err) {
    console.log('Lambda error:', Err);
    return { statusCode: 500, error: Err.message };
  }
  return { statusCode: 200 };
};
