require("dotenv").config();
const env = process.env;

const development = {
  username: env.AWS_DB_USERNAME,
  password: env.AWS_DB_PW,
  database: env.AWS_DB_NAME,
  host: env.AWS_HOST,
  dialect: "mysql",
  storage: "./session.mysql",
  timezone: "+09:00",
};



const production = {
  username: env.AWS_DB_USERNAME,
  password: env.AWS_DB_PW,
  database: env.AWS_DB_NAME,
  host: env.AWS_HOST,
  dialect: "mysql",
  storage: "./session.mysql",
  timezone: "+09:00",
}

module.exports = { development, production };
