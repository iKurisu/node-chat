require("dotenv").config();
const io = require("socket.io")();
const { Pool } = require("pg");
const {
  validateUsername,
  validatePassword,
  signUp
} = require("./handlers/auth");
const { fetchRooms, joinRoom, createRoom } = require("./handlers/rooms");
const {
  VALIDATE_USERNAME,
  VALIDATE_PASSWORD,
  SIGN_UP,
  FETCH_ROOMS,
  JOIN_ROOM,
  CREATE_ROOM,
  ENTER_ROOM,
  SEND_MESSAGE
} = require("./events");

const pool = new Pool({
  connectionString: process.env.TEST_DB_CONNECTION_STRING,
  ssl: true
});

pool.connect();

io.on("connection", async socket => {
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

  socket.on(CREATE_ROOM, async ({ username, room }) => {
    const response = await createRoom(pool, { username, room });

    if (response === true) {
      socket.join(room);
    }

    socket.emit(CREATE_ROOM, response);
  });

  socket.on(JOIN_ROOM, async ({ username, room }) => {
    const response = await joinRoom(pool, { username, room });

    if (response === true) {
      socket.join(room);
    }

    socket.emit(JOIN_ROOM, response);
  });

  socket.on(ENTER_ROOM, ({ username, room }) => {
    socket.join(room, err => {
      if (err) console.log(err);

      io.to(room).emit(SEND_MESSAGE, { username, message: `joined the room` });
      socket.emit(ENTER_ROOM, true);
    });
  });

  socket.on(SEND_MESSAGE, ({ username, room, message }) => {
    io.to(room).emit(SEND_MESSAGE, {
      username,
      message
    });
  });
});

io.listen(3000);
