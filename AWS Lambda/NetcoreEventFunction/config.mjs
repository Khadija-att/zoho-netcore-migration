const ENV = process.env.NODE_ENV || "DEV";

const envConfig = {
  DEV: {
    BUYER_ASSET_ID: process.env.DEV_BUYER_ASSET_ID,
    BUYER_NETCORE_API_KEY: process.env.DEV_BUYER_NETCORE_API_KEY,
    SELLER_ASSET_ID: process.env.DEV_SELLER_ASSET_ID,
    SELLER_NETCORE_API_KEY: process.env.DEV_SELLER_NETCORE_API_KEY,
    CP_ASSET_ID: process.env.DEV_CP_ASSET_ID,
    CP_NETCORE_API_KEY: process.env.DEV_CP_NETCORE_API_KEY,
    NETCORE_EVENT_URL: process.env.NETCORE_EVENT_URL,
  },
  PROD: {
    BUYER_ASSET_ID: process.env.PROD_BUYER_ASSET_ID,
    BUYER_NETCORE_API_KEY: process.env.PROD_BUYER_NETCORE_API_KEY,
    SELLER_ASSET_ID: process.env.PROD_SELLER_ASSET_ID,
    SELLER_NETCORE_API_KEY: process.env.PROD_SELLER_NETCORE_API_KEY,
    CP_ASSET_ID: process.env.PROD_CP_ASSET_ID,
    CP_NETCORE_API_KEY: process.env.PROD_CP_NETCORE_API_KEY,
    NETCORE_EVENT_URL: process.env.NETCORE_EVENT_URL,
  },
};

const config = {
  ...(envConfig[ENV] || envConfig.DEV),
};

export default config;