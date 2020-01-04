require("dotenv").config();
const io = require("socket.io")();
const { Pool } = require("pg");
const {
  validateUsername,
  validatePassword,
  signUp
} = require("./handlers/auth");
const { fetchRooms } = require("./handlers/rooms");
const {
  VALIDATE_USERNAME,
  VALIDATE_PASSWORD,
  SIGN_UP,
  FETCH_ROOMS
} = require("./events");

const pool = new Pool({
  connectionString: process.env.TEST_DB_CONNECTION_STRING,
  ssl: true
});

pool.connect();

io.on("connection", socket => {
  socket.on(VALIDATE_USERNAME, async ({ username, action }) => {
    const response = await validateUsername(pool, { action, username });

    socket.emit(VALIDATE_USERNAME, response);
  });

  socket.on(VALIDATE_PASSWORD, async ({ action, username, password }) => {
    const response = await validatePassword(pool, {
      action,
      username,
      password
    });

    socket.emit(VALIDATE_PASSWORD, response);
  });

  socket.on(SIGN_UP, async ({ username, password }) => {
    await signUp(pool, { username, password });
    const response = await fetchRooms(pool, { username });
    socket.emit(FETCH_ROOMS, response);
  });

  socket.on(FETCH_ROOMS, async ({ username }) => {
    const response = await fetchRooms(pool, { username });

    socket.emit(FETCH_ROOMS, response);
  });
});

io.listen(3000);
