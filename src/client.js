const { Client } = require("pg");

const connectClient = () => {
  const client = new Client({
    user: process.env.TEST_DB_USER,
    host: process.env.TEST_DB_HOST,
    database: process.env.TEST_DB_DATABASE,
    password: process.env.TEST_DB_PASSWORD,
    port: process.env.TEST_DB_PORT,
    ssl: true
  });

  client.connect();

  return client;
};

module.exports = connectClient;
