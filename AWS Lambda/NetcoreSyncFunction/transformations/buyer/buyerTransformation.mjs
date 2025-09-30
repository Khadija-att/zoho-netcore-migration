import { z } from "zod";
import { toInteger, toYesNo, toYYYYMMDD, trueFalseString, setIfDefined, arrayToString, cleanPhone } from '../../helpers/helpers.mjs';

const leadSchema = z.object({
  Lead_Id: z.any(),
  Phone: z.string().nullable().optional(),
  CP_Phone: z.string().optional().nullable(),
  Spouse_Phone: z.string().optional().nullable(),
  Email: z.string().nullable().optional(),
  Lead_Name: z.string().optional().nullable(),
  First_Name: z.string().optional().nullable(),
  Last_Name: z.string().optional().nullable(),
  Lead_Source: z.string().optional().nullable(),
  Lead_Status: z.string().optional().nullable(),
  Is_Active: z.any().optional().nullable(),
  User_Type: z.string().optional().nullable(),
  Duplicate_Lead: z
  .preprocess(
    (val) => val === "Duplicate" ? "Yes" : "No",
    z.string()
  )
  .nullable()
  .optional(),
  Lead_Owner: z.string().optional().nullable(),
  Listing_Platform: z.string().nullable().optional(),
  Campaign_Name: z.string().nullable().optional(),
  No_Of_attempts: z.any().nullable().optional(),
  lastVisitedOn:z.string().nullable().optional(),
  propertiesVisited:z.number().optional().nullable(),
  Created_Time: z.string().optional().nullable(),
  Modified_Time: z.string().optional().nullable(),
  Tag_Expiry_Date: z.string().nullable().optional(),
  Project_name: z.string().optional().nullable(),
  Form_Name: z.string().optional().nullable(),
  Campaign: z.string().optional().nullable(),
  Ad_set: z.string().optional().nullable(),
  Form_ID: z.string().optional().nullable(),
  Ad_ID: z.string().optional().nullable(),
  Social_Lead_ID: z.string().optional().nullable(),
  Ad_Name: z.string().optional().nullable(),
  Interested_in_visit: z.string().optional().nullable(),
  Preferred_Area: z.preprocess(
    (val) => Array.isArray(val) ? val.join(", ") : val,
    z.string().optional().nullable()
  ),
  Use_Case: z.string().optional().nullable(),
  Preferences: z.preprocess(
    (val) => Array.isArray(val) ? val.join(", ") : val,
    z.string().optional().nullable()
  ),
  Current_Stay: z.string().optional().nullable(),
  Budget: z.string().optional().nullable(),
  Preferred_time_of_Visit: z.string().optional().nullable(),
  Not_Qualified_Reason: z.string().nullable().optional(),
  Priority: z.string().nullable().optional(),
  CP_Name: z.string().nullable().optional(),
  CP_Contact_Name: z.string().optional().nullable(),
  Truva_Micromarket: z.preprocess(
    (val) => Array.isArray(val) ? val.join(", ") : val,
    z.string().optional().nullable()
  ),
  DND: z.string().nullable().optional(),
  Referred_by: z.string().optional().nullable(),
  Spouse_Name: z.string().optional().nullable(),
  lead_activity: z.string().optional().nullable(),
  Company_lookup: z.object({ name: z.string(), id: z.string() }).optional().nullable()
}).transform(src => {
  const result = { USER_ID: src.Lead_Id };
  setIfDefined(result, "EMAIL", src.Email);
  setIfDefined(result, "MOBILE", src.Phone ? cleanPhone(src.Phone) : src.Phone);
  setIfDefined(result, "TAGGED_CHANNEL_PARTNER_PHONE", src.CP_Phone ? cleanPhone(src.CP_Phone) : src.CP_Phone);
  setIfDefined(result, "SPOUSE_PHONE", src.Spouse_Phone ? cleanPhone(src.Spouse_Phone) : src.Spouse_Phone);
  setIfDefined(
    result,
    "NAME",
    (src?.Lead_Name ?? `${src?.First_Name ?? ""} ${src?.Last_Name ?? ""}`.trim()) || ""
  );
  
  setIfDefined(result, "USER_SOURCE", src.Lead_Source);
  setIfDefined(result, "USER_STATUS", src.Lead_Status);
  setIfDefined(result, "IS_ACTIVE", trueFalseString(src.Is_Active));
  setIfDefined(result, "USER_TYPE", src.User_Type);
  setIfDefined(result, "DUPLICATE", src.Duplicate_Lead);
  setIfDefined(result, "TRUVA_RM", src.Lead_Owner);
  setIfDefined(result, "3P_LISTING_PLATFORM", src.Listing_Platform);
  setIfDefined(result, "CAMPAIGN_NAME", src.Campaign_Name);
  setIfDefined(result, "NUMBER_OF_ATTEMPTS", toInteger(src.No_Of_attempts));
  setIfDefined(result, "NO_OF_PROPERTIES_VISITED", src.propertiesVisited);
  setIfDefined(result, "LAST_VISITED_ON", src.lastVisitedOn ? new Date(src.lastVisitedOn).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : undefined);
  setIfDefined(result, "USER_CREATED_TIME", src.Created_Time ? new Date(src.Created_Time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : undefined);
  setIfDefined(result, "USER_MODIFIED_TIME", src.Modified_Time ? new Date(src.Modified_Time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : undefined);
  setIfDefined(result, "CP_TAG_EXPIRY_DATE", toYYYYMMDD(src.Tag_Expiry_Date));
  setIfDefined(result, "3P_SOCIETY_NAME", src.Project_name || src.Form_Name);
  setIfDefined(result, "CAMPAIGN_ID", src.Campaign);
  setIfDefined(result, "AD_SET_ID", src.Ad_set);
  setIfDefined(result, "AD_SET_NAME", src.Form_ID);
  setIfDefined(result, "AD_ID", src.Ad_ID || src.Social_Lead_ID);
  setIfDefined(result, "AD_NAME", src.Ad_Name);
  setIfDefined(result, "INTERESTED_IN_VISIT", src.Interested_in_visit);
  setIfDefined(result, "PREFERENCES", arrayToString(src.Preferences));
  setIfDefined(result, "USE_CASE", src.Use_Case);
  setIfDefined(result, "PREFERRED_AREA", arrayToString(src.Preferred_Area));
  setIfDefined(result, "CURRENT_STAY", src.Current_Stay);
  setIfDefined(result, "BUDGET", src.Budget);
  setIfDefined(result, "PREFERRED_TIME_OF_VISIT", src.Preferred_time_of_Visit);
  setIfDefined(result, "NOT_QUALIFIED_REASON", src.Not_Qualified_Reason);
  setIfDefined(result, "CLOSING_TIMELINES", src.Priority);
  setIfDefined(result, "TAGGED_CHANNEL_PARTNER_NAME", src.CP_Name || src.CP_Contact_Name);
  setIfDefined(result, "TRUVA_MICROMARKET",src.Truva_Micromarket);
  setIfDefined(result, "DND", src.DND);
  setIfDefined(result, "REFERRED_BY", src.Referred_by);
  setIfDefined(result, "SPOUSE_NAME", src.Spouse_Name);
  setIfDefined(result, "ACTIVITY", src.lead_activity ?? "add");
  result._original_payload = src;
  return result;
});

export async function buyerTransformations(receivedZohoData) {
  try {
    console.log('receivedZohoData->>>>>>>>>>>>>',receivedZohoData);
    const data = typeof receivedZohoData === "string"
      ? JSON.parse(receivedZohoData)
      : receivedZohoData;
    const mapped = leadSchema.parse(data);
    return mapped;
  } catch (err) {
    if (err instanceof z.ZodError) console.error("Validation failed:", err.errors);
    else console.error("Unknown error:", err);
    throw err;
  }
}