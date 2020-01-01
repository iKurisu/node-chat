require("dotenv").config();
const io = require("socket.io")();
const { Pool } = require("pg");
const { validateUsername, validatePassword, signUp } = require("./auth");
const { VALIDATE_USERNAME, VALIDATE_PASSWORD, SIGN_UP } = require("./events");

const pool = new Pool({
  connectionString: process.env.TEST_DB_CONNECTION_STRING,
  ssl: true
});

pool.connect();

io.on("connection", socket => {
  socket.on(VALIDATE_USERNAME, async ({ username, action }) => {
    const response = await validateUsername(pool)(username, { action });

    socket.emit(VALIDATE_USERNAME, response);
  });

  socket.on(VALIDATE_PASSWORD, async ({ action, username, password }) => {
    const response = await validatePassword(pool)(password, {
      action,
      username
    });

    socket.emit(VALIDATE_USERNAME, response);
  });

  socket.on(SIGN_UP, async ({ username, password }) => {
    await signUp(pool)({ username, password });
  });
});

io.listen(3000);
