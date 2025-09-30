import { z } from "zod";

export const toInteger = (v) => (v ? parseInt(v, 10) : 0);
export const toYesNo = (v) => (v ? "Yes" : "No");
export const toYYYYMMDD = (v) => (v ? new Date(v).toISOString().split("T")[0] : "");
export const trueFalseString = v => v === true ? 'true' : v === false ? 'false' : v;
export const setIfDefined = (obj, key, v) => v !== undefined && v !== '' && (obj[key] = v);
export const arrayToString = v => Array.isArray(v) ? v.map(x => x == null ? '' : String(x).trim()).filter(Boolean).join(', ') : v;

// Country codes & subscriber overrides
export const KNOWN_COUNTRY_CODES = ["1","7","20","27","30","31","32","33","34","36","39","40","41","43","44","45","46","47","48","49","51","52","53","54","55",
"56","57","58","60","61","62","63","64","65","66","81","82","84","86","90","91","92","93","94","95","98","211","212","213","216","218","220","221","222","223","224","225","226","227","228","229","230","231","232","233","234","235","236",
"237","238","239","240","241","242","243","244","245","246","248","249","250","251","252","253","254","255","256","257","258","260","261","262","263","264","265","266","267","268","269","290","291","297","298","299","350","351","352","353",
"354","355","356","357","358","359","370","371","372","373","374","375","376","377","378","379","380","381","382","383","385","386","387","389","420","421","423","500","501","502","503","504","505","506","507","508","509","590","591","592",
"593","594","595","596","597","598","599","670","672","673","674","675","676","677","678","679","680","681","682","683","685","686","687","688","689","690","691","692","850","852","853","855","856","870","880","886","960","961","962","963",
"964","965","966","967","968","970","971","972","973","974","975","976","977","992","993","994","995","996","998"];

export const SUBSCRIBER_LENGTH_OVERRIDES = { "220":7, "230":7, "675":7, "65":8 };

export const cleanPhone = (phone) => {
  if (!phone) return "";
  let raw = String(phone).trim();
  if (!raw) return "";

  if (raw.startsWith("00")) raw = "+" + raw.slice(2);
  const hadExplicitCountryPrefix = raw.startsWith("+");
  raw = raw.replace(/[()\-\s\.]/g, "");

  if (raw.startsWith("+")) {
    const digitsOnly = raw.slice(1);
    const sortedCodes = KNOWN_COUNTRY_CODES.slice().sort((a,b)=>b.length - a.length);
    for (const code of sortedCodes) {
      if (digitsOnly.startsWith(code)) {
        const subscriber = digitsOnly.slice(code.length);
        if (!subscriber) return "";
        const expectedLen = SUBSCRIBER_LENGTH_OVERRIDES[code] ?? null;
        if (expectedLen !== null) {
          if (subscriber.length !== expectedLen && subscriber.length !== 4) return "";
        } else if (subscriber.length < 4 || subscriber.length > 15) return "";
        return code + subscriber;
      }
    }
    const fallback = digitsOnly.replace(/\D/g, "");
    return fallback || "";
  }

  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 11 && digits.startsWith("0")) digits = "91" + digits.slice(1);
  if (digits.length === 10 && !hadExplicitCountryPrefix) digits = "91" + digits;
  if (digits.length === 4 && !hadExplicitCountryPrefix) digits = "91" + digits;
  if (digits.length <=15) return digits;
  if (digits.length >4) return null;
  return "";
};

export const toIsActive = (v) => {
  if (v === undefined || v === null || v === '') return 'true';
  if (typeof v === 'string') {
    const lower = v.toLowerCase().trim();
    if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'inactive' || lower === 'disabled') {
      return 'false';
    }
    return 'true';
  }
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return v ? 'true' : 'false';
};