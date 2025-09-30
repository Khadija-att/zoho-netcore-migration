import { z } from "zod";
import { toInteger, toYesNo, toYYYYMMDD, trueFalseString, setIfDefined, arrayToString, cleanPhone, toIsActive } from '../../helpers/helpers.mjs';

const channelPartnerSchema = z.object({
  Channel_Partner_Id: z.string(),
  Phone: z.string().nullable().optional(),
  Email: z.string().nullable().optional(),
  Contact_Name: z.string().optional().nullable(),
  Company_Name: z.string().optional().nullable(),
  Created_Time: z.string().optional().nullable(),
  Channel_Partner_Owner: z.string().optional().nullable(),
  Type: z.string().optional().nullable(),
  Is_Active: z.any().nullable().optional(),
  Listing_Platform: z.string().optional().nullable(),
  Active_Micromarket: z.preprocess(
    (val) => arrayToString(val),
    z.string().optional().nullable()
  ),
  Modified_Time: z.string().optional().nullable(),
}).transform(src => {
  const result = { USER_ID: src.Channel_Partner_Id };
  setIfDefined(result, "EMAIL", src.Email);
  setIfDefined(result, "NAME", src.Contact_Name);
  setIfDefined(result, "MOBILE", src.Phone ? cleanPhone(src.Phone) : src.Phone);
  setIfDefined(result, "COMPANY_NAME", src.Company_Name);
  setIfDefined(result, "USER_CREATED_TIME", src.Created_Time ? new Date(src.Created_Time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : undefined);
  setIfDefined(result, "USER_MODIFIED_TIME", src.Created_Time ? new Date(src.Modified_Time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : undefined);
  setIfDefined(result, "TRUVA_RM", src.Channel_Partner_Owner);
  setIfDefined(result, "CP_POSITION", src.Type);
  setIfDefined(result, "IS_ACTIVE", toIsActive(src.Is_Active));
  setIfDefined(result, "3P_LISTING_PLATFORM", src.Listing_Platform);
  setIfDefined(result, "TRUVA_MICROMARKET", src.Active_Micromarket);
  setIfDefined(result, "ACTIVITY", src.lead_activity ?? "add");
  result._original_payload = src;
  return result;
});

export async function channelPartnerTransformations(receivedZohoData) {
  try {
    console.log('receivedZohoData->>>>>>>>>>>>>',receivedZohoData)
    const data = typeof receivedZohoData === "string"
      ? JSON.parse(receivedZohoData)
      : receivedZohoData;
    const mapped = channelPartnerSchema.parse(data);
    return mapped;
  } catch (err) {
    if (err instanceof z.ZodError) console.error("Validation failed:", err.errors);
    else console.error("Unknown error:", err);
    throw err;
  }
}