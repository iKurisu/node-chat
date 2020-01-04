const {
  VALIDATE_USERNAME,
  VALIDATE_PASSWORD,
  SIGN_UP,
  FETCH_ROOMS,
  JOIN_ROOM,
  CREATE_ROOM
} = require("./events");
const { choicesFromRooms } = require("./utils/prompts");

const getPromps = socket => [
  {
    type: "list",
    name: "action",
    message: "Choose action",
    choices: ["Sign in", "Sign up"]
  },
  {
    type: "input",
    name: "username",
    message: "Enter username",
    validate(username, { action }) {
      return new Promise(res => {
        socket.emit(VALIDATE_USERNAME, { username, action });
        socket.on(VALIDATE_USERNAME, res);
      });
    }
  },
  {
    type: "password",
    name: "password",
    message: "Enter password",
    validate({ password }, { action, username }) {
      return new Promise(res => {
        socket.emit(VALIDATE_PASSWORD, { action, username, password });
        socket.on(VALIDATE_PASSWORD, res);
      });
    },
    /* 
      Work around since calling a new prompt in a callback after an async
      validation is bugged.
    */
    filter(password, { action, username }) {
      return new Promise(res => {
        action === SIGN_UP
          ? socket.emit(SIGN_UP, { username, password })
          : socket.emit(FETCH_ROOMS, { username });

        socket.on(FETCH_ROOMS, answer => {
          res({ password, rooms: answer });
        });
      });
    }
  },
  {
    type: "list",
    name: "room",
    message: ({ password }) => {
      return password.rooms ? "Choose a room" : "No rooms found";
    },
    choices: ({ password }) => choicesFromRooms(password.rooms)
  },
  {
    type: "input",
    name: "create room",
    message: "Enter room name",
    when({ room }) {
      return room === "Create a room";
    },
    validate(room, { username }) {
      return new Promise(res => {
        socket.emit(CREATE_ROOM, { username, room });
        socket.on(CREATE_ROOM, res);
      });
    }
  },
  {
    type: "input",
    name: "join room",
    message: "Enter room name",
    when({ room }) {
      return room === "Join a room";
    },
    validate(room, { username }) {
      return new Promise(res => {
        socket.emit(JOIN_ROOM, { username, room });
        socket.on(JOIN_ROOM, res);
      });
    }
  }
];

module.exports = getPromps;
