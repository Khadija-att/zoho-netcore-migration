import { z } from "zod";
import { toInteger, toYesNo, toYYYYMMDD, trueFalseString, setIfDefined, arrayToString, cleanPhone } from '../../helpers/helpers.mjs';

const sellerSchema = z.object({
  Seller_Id: z.string(),
  Phone_Number: z.string().nullable().optional(),
  First_Name: z.string().optional().nullable(),
  Last_Name: z.string().optional().nullable(),
  Email: z.string().nullable().optional(),
  Name: z.string().nullable().optional(),
  User_Type: z.string().optional().nullable(),
  User_Source: z.string().optional().nullable(),
  User_CTA: z.string().optional().nullable(),
  Call_Status: z.string().optional().nullable(),
  Created_Time: z.string().optional().nullable(),
  Modified_Time: z.string().optional().nullable(),
  Truva_RM: z.string().optional().nullable(),
  Property_Created: z.any().optional().nullable(),
  Truva_Micromarket: z.string().nullable().optional(),
  Reason_for_not_Truva_Qualified: z.array(z.string()).nullable().optional(),
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
  lead_activity: z.string().optional().nullable()
}).transform(src => {
  const result = { USER_ID: src.Seller_Id };
  setIfDefined(result, "EMAIL", src.Email);
  setIfDefined(result, "MOBILE", src.Phone_Number ? cleanPhone(src.Phone_Number) : src.Phone_Number);
  setIfDefined(result, "SPOUSE_PHONE", src.Spouse_Phone_Number ? cleanPhone(src.Spouse_Phone_Number) : src.Spouse_Phone_Number);
  setIfDefined(result, "SPOUSE_NAME", src.Spouse_Name);
  setIfDefined(result, "NAME", src.Name || `${(src.First_Name || "")} ${(src.Last_Name || "")}`.trim());
  setIfDefined(result, "FIRST_NAME", src.First_Name);
  setIfDefined(result, "LAST_NAME", src.Last_Name);
  setIfDefined(result, "USER_SOURCE", src.User_Source);
  setIfDefined(result, "TRUVA_RM", src.Truva_RM);
  setIfDefined(result, "CALL_STATUS", src.Call_Status);
  setIfDefined(result, "USER_CTA", src.User_CTA);
  setIfDefined(result, "USER_TYPE", src.User_Type);
  setIfDefined(result, "PROPERTY_CREATED", trueFalseString(src.Property_Created));
  setIfDefined(result, "TRUVA_MICROMARKET", src.Truva_Micromarket);
  setIfDefined(result, "REASON_FOR_NOT_TRUVA_QUALIFIED", arrayToString(src.Reason_for_not_Truva_Qualified));
  setIfDefined(result, "SECONDARY_EMAIL", src.Secondary_Email);
  setIfDefined(result, "USER_CREATED_TIME", src.Created_Time ? new Date(src.Created_Time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : undefined);
  setIfDefined(result, "USER_MODIFIED_TIME", src.Modified_Time ? new Date(src.Modified_Time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : undefined);
  setIfDefined(result, "CALL_ATTEMPTS", toInteger(src.Call_Attempts));
  setIfDefined(result, "REASON_FOR_LEAD_DROP", src.Reason_for_lead_drop);
  setIfDefined(result, "FOLLOW_UP_ON", src.Follow_Up_on ? new Date(src.Follow_Up_on).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : undefined);
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
  result._original_payload = src;
  return result;
});

export async function sellerTransformations(receivedZohoData) {
  try {
    console.log('receivedZohoData->>>>>>>>>>>>>',receivedZohoData)
    const data = typeof receivedZohoData === "string"
      ? JSON.parse(receivedZohoData)
      : receivedZohoData;
    const mapped = sellerSchema.parse(data);
    return mapped;
  } catch (err) {
    if (err instanceof z.ZodError) console.error("Validation failed:", err.errors);
    else console.error("Unknown error:", err);
    throw err;
  }
}