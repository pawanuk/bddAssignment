// import * as dotenv from 'dotenv';

// dotenv.config();

// export const ENV = {
//   username: process.env.BETFAIR_USERNAME!,
//   password: process.env.BETFAIR_PASSWORD!,
//   url: process.env.BETFAIR_URL!,
// };

import * as dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  username: process.env.BETFAIR_USERNAME!,
  password: process.env.BETFAIR_PASSWORD!,
  url: process.env.BETFAIR_URL!,
  pageLoadTimeout: parseInt(process.env.PAGE_LOAD_TIMEOUT || '10000', 10),
  inputDelay: parseInt(process.env.INPUT_DELAY || '3000', 10),
  elementTimeout: parseInt(process.env.ELEMENT_TIMEOUT || '60000', 10),
};
