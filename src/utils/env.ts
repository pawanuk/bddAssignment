import * as dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  username: process.env.BETFAIR_USERNAME!,
  password: process.env.BETFAIR_PASSWORD!,
  url: process.env.BETFAIR_URL!,
};
