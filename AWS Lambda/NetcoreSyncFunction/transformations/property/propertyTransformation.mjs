import { z } from "zod";
import { toInteger, toYesNo, toYYYYMMDD, trueFalseString, setIfDefined, arrayToString, cleanPhone } from '../../helpers/helpers.mjs';

const propSchema = z.object({
  Property_Id: z.string(),
  Property_Name: z.string().optional().nullable(),
  Property_Source: z.string().optional().nullable(),
  Property_Status: z.string().optional().nullable(),
  Referror: z.string().optional().nullable(),
  User_Type: z.string().optional().nullable(),
  Unit_Number: z.string().optional().nullable(),
  Truva_RM: z.string().optional().nullable(),
  Priority: z.string().optional().nullable(),
  Created_Time: z.string().optional().nullable(),
  Modified_Time: z.string().optional().nullable(),
  Product_Category: z.string().optional().nullable(),
  Truva_Micromarket: z.string().optional().nullable(),
  Property_Seller_Source: z.string().optional().nullable(),
  Visit_Date: z.string().optional().nullable(),
  Visit_by: z.string().optional().nullable(),
  Go_Live_Date: z.string().optional().nullable(),
  Explore_Later_On: z.string().optional().nullable(),
  Seller_Profile: z.string().optional().nullable(),
  Likelihood: z.any().optional().nullable(),
  Acq_Status: z.string().nullable().optional(),
  Proposal_Link: z.string().optional().nullable(),
  Offer_Date: z.string().optional().nullable(),
  Deal_Closed_Date: z.string().optional().nullable(),
  Customer_Rejection_Reason: z.string().optional().nullable(),
  Seller_Interaction_Date: z.string().optional().nullable(),
  Truva_Rejection_reason: z.string().optional().nullable(),
  Offer_Revision: z.any().optional().nullable(),
  Date_of_Recycle: z.string().optional().nullable(),
  Possession_Date: z.string().optional().nullable(),
  Deal_Type: z.string().optional().nullable(),
  Tag_Expiry_Date: z.string().optional().nullable(),
  CP_Tagging_Status: z.string().optional().nullable(),
  Seller_MoU_Signing_Date: z.string().optional().nullable(),
  Buyer_MoU_Signing_Date: z.string().optional().nullable(),
  Tri_Party_MOU: z.string().optional().nullable(),
  Exclusivity_Agreement: z.string().optional().nullable(),
  Tower: z.string().optional().nullable(),
  Society: z.string().optional().nullable(),
  Township: z.string().optional().nullable(),
  Acq_Channel_Partner_Name: z.string().optional().nullable(),
  Acq_Channel_Partner_Number: z.string().optional().nullable(),
  Acq_Society_Partner_Name: z.string().optional().nullable(),
  Acq_Society_Partner_Number: z.string().optional().nullable(),
  Phone_Number: z.string().nullable().optional(),
  First_Name: z.string().optional().nullable(),
  Last_Name: z.string().optional().nullable(),
  Email: z.string().nullable().optional(),
  Name: z.string().nullable().optional(),
  User_Source: z.string().optional().nullable(),
  User_CTA: z.string().optional().nullable(),
  Call_Status: z.string().optional().nullable(),
  Property_Created: z.any().optional().nullable(),
  Reason_for_not_Truva_Qualified: z.any().nullable().optional(),
  Spouse_Phone_Number: z.string().nullable().optional(),
  Spouse_Name: z.string().nullable().optional(),
  Secondary_Email:z.string().nullable().optional(),
  Call_Attempts: z.string().nullable().optional(),
  Reason_for_lead_drop: z.string().optional().nullable(),
  Follow_Up_on: z.string().optional().nullable(),
  DND: z.any().optional().nullable(),
  Last_Called_on: z.string().optional().nullable(),
  Periscope_Sent: z.string().optional().nullable(),
  Periscope_Status: z.string().optional().nullable(),
  Campaign_Name: z.string().optional().nullable(),
  Campaign_Source: z.string().optional().nullable(),
  Adset_Name: z.string().optional().nullable(),
  Ad_Name: z.string().optional().nullable(),
  Is_Active: z.any().optional().nullable(),
  lead_activity: z.string().optional().nullable(),
  Archetype_Score_v1: z.any().optional().nullable(),
  Locality_Society_Name: z.string().optional().nullable(),
}).transform(src => {
  const result = { USER_ID: src.Property_Id };
  setIfDefined(result, "PROPERTY_NAME", src.Property_Name);
  setIfDefined(result, "PROPERTY_SOURCE", src.Property_Source);
  setIfDefined(result, "PROPERTY_STATUS", src.Property_Status);
  setIfDefined(result, "REFERROR", src.Referror);
  setIfDefined(result, "USER_TYPE", src.User_Type);
  setIfDefined(result, "UNIT_NUMBER", src.Unit_Number);
  setIfDefined(result, "TRUVA_RM", src.Truva_RM);
  setIfDefined(result, "PRIORITY", src.Priority);
  setIfDefined(result, "USER_CREATED_TIME", src.Created_Time ? new Date(src.Created_Time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : undefined);
  setIfDefined(result, "USER_MODIFIED_TIME", src.Modified_Time ? new Date(src.Modified_Time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : undefined);
  setIfDefined(result, "PRODUCT_CATEGORY", src.Product_Category);
  setIfDefined(result, "TRUVA_MICROMARKET", src.Truva_Micromarket);
  setIfDefined(result, "PROPERTY_SELLER_SOURCE", src.Property_Seller_Source);
  setIfDefined(result, "VISIT_DATE", toYYYYMMDD(src.Visit_Date));
  setIfDefined(result, "VISIT_BY", src.Visit_by);
  setIfDefined(result, "GO_LIVE_DATE", toYYYYMMDD(src.Go_Live_Date));
  setIfDefined(result, "EXPLORE_LATER_ON", toYYYYMMDD(src.Explore_Later_On));
  setIfDefined(result, "SELLER_PROFILE", src.Seller_Profile);
  setIfDefined(result, "LIKELIHOOD", src.Likelihood);
  setIfDefined(result, "ACQ_STATUS", src.Acq_Status);
  setIfDefined(result, "PROPOSAL_LINK", src.Proposal_Link);
  setIfDefined(result, "OFFER_DATE", toYYYYMMDD(src.Offer_Date));
  setIfDefined(result, "DEAL_CLOSED_DATE", toYYYYMMDD(src.Deal_Closed_Date));
  setIfDefined(result, "CUSTOMER_REJECTION_REASON", src.Customer_Rejection_Reason);
  setIfDefined(result, "SELLER_INTERACTION_DATE", toYYYYMMDD(src.Seller_Interaction_Date));
  setIfDefined(result, "TRUVA_REJECTION_REASON", src.Truva_Rejection_reason);
  setIfDefined(result, "OFFER_REVISION", src.Offer_Revision);
  setIfDefined(result, "DATE_OF_RECYCLE", toYYYYMMDD(src.Date_of_Recycle));
  setIfDefined(result, "POSSESSION_DATE", toYYYYMMDD(src.Possession_Date));
  setIfDefined(result, "DEAL_TYPE", src.Deal_Type);
  setIfDefined(result, "TAG_EXPIRY_DATE", toYYYYMMDD(src.Tag_Expiry_Date));
  setIfDefined(result, "CP_TAGGING_STATUS", src.CP_Tagging_Status);
  setIfDefined(result, "SELLER_MOU_SIGNING_DATE", toYYYYMMDD(src.Seller_MoU_Signing_Date));
  setIfDefined(result, "BUYER_MOU_SIGNING_DATE", toYYYYMMDD(src.Buyer_MoU_Signing_Date));
  setIfDefined(result, "TRI_PARTY_MOU", src.Tri_Party_MOU);
  setIfDefined(result, "EXCLUSIVITY_AGREEMENT", src.Exclusivity_Agreement);
  setIfDefined(result, "TOWER", src.Tower);
  setIfDefined(result, "SOCIETY", src.Society);
  setIfDefined(result, "TOWNSHIP", src.Township);
  setIfDefined(result, "ACQ_CHANNEL_PARTNER_NAME", src.Acq_Channel_Partner_Name);
  setIfDefined(result, "ACQ_CHANNEL_PARTNER_NUMBER", src.Acq_Channel_Partner_Number ? cleanPhone(src.Acq_Channel_Partner_Number) : null);
  setIfDefined(result, "ACQ_SOCIETY_PARTNER_NAME", src.Acq_Society_Partner_Name);
  setIfDefined(result, "ACQ_SOCIETY_PARTNER_NUMBER", src.Acq_Society_Partner_Number ? cleanPhone(src.Acq_Society_Partner_Number) : null);
  setIfDefined(result, "EMAIL", src.Email);
  setIfDefined(result, "MOBILE", src.Phone_Number ? cleanPhone(src.Phone_Number) : src.Phone_Number);
  setIfDefined(result, "SPOUSE_PHONE", src.Spouse_Phone_Number ? cleanPhone(src.Spouse_Phone_Number) : src.Spouse_Phone_Number);
  setIfDefined(result, "SPOUSE_NAME", src.Spouse_Name);
  setIfDefined(result, "NAME", src.Name);
  setIfDefined(result, "FIRST_NAME", src.First_Name);
  setIfDefined(result, "LAST_NAME", src.Last_Name);
  setIfDefined(result, "USER_SOURCE", src.User_Source);
  setIfDefined(result, "CALL_STATUS", src.Call_Status);
  setIfDefined(result, "USER_CTA", src.User_CTA);
  setIfDefined(result, "PROPERTY_CREATED", trueFalseString(src.Property_Created));
  setIfDefined(result, "REASON_FOR_NOT_TRUVA_QUALIFIED", arrayToString(src.Reason_for_not_Truva_Qualified));
  setIfDefined(result, "SECONDARY_EMAIL", src.Secondary_Email);
  setIfDefined(result, "CALL_ATTEMPTS", toInteger(src.Call_Attempts));
  setIfDefined(result, "REASON_FOR_LEAD_DROP", src.Reason_for_lead_drop);
  setIfDefined(result, "FOLLOW_UP_ON", src.Follow_Up_on ? new Date(src.Follow_Up_on).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : null);
  setIfDefined(result, "DND", toYesNo(src.DND));
  setIfDefined(result, "LAST_CALLED_ON", toYYYYMMDD(src.Last_Called_on));
  setIfDefined(result, "PERISCOPE_SENT", src.Periscope_Sent);
  setIfDefined(result, "PERISCOPE_STATUS", src.Periscope_Status);
  setIfDefined(result, "CAMPAIGN_SOURCE", src.Campaign_Source);
  setIfDefined(result, "CAMPAIGN_NAME", src.Campaign_Name);
  setIfDefined(result, "ADSET_NAME", src.Adset_Name);
  setIfDefined(result, "AD_NAME", src.Ad_Name);
  setIfDefined(result, "IS_ACTIVE", trueFalseString(src.Is_Active));
  setIfDefined(result, "ACTIVITY", src.lead_activity ?? "add");
  setIfDefined(result, "ARCHETYPE_SCORE_V1", src.Archetype_Score_v1);
  setIfDefined(result, "LOCALITY_SOCIETY_NAME", src.Locality_Society_Name);
  result._original_payload = src;
  return result;
});


export async function propertyTransformations(receivedZohoData) {
  try {
    console.log('receivedZohoData->>>>>>>>>>>>>',receivedZohoData)
    const data = typeof receivedZohoData === "string"
      ? JSON.parse(receivedZohoData)
      : receivedZohoData;
    const mapped = propSchema.parse(data);
    return mapped;
  } catch (err) {
    if (err instanceof z.ZodError) console.error("Validation failed:", err.errors);
    else console.error("Unknown error:", err);
    throw err;
  }
}