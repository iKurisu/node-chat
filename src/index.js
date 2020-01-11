const io = require("socket.io-client");
const readline = require("readline");
const { prompt } = require("inquirer");
const chalk = require("chalk");
const {
  VALIDATE_USERNAME,
  VALIDATE_PASSWORD,
  SIGN_UP,
  FETCH_ROOMS,
  CREATE_ROOM,
  JOIN_ROOM,
  ENTER_ROOM,
  SEND_MESSAGE,
  LEAVE_ROOM
} = require("./events");
const { choicesFromRooms } = require("./utils/prompts");

const socket = io("ws://localhost:3000");

const { log, clear } = console;
const on = event => new Promise(res => socket.on(event, res));

const auth = async () => {
  const { action } = await prompt({
    type: "list",
    name: "action",
    message: "Choose action",
    choices: ["Sign in", "Sign up"]
  });

  const { username, password } = await prompt([
    {
      type: "input",
      name: "username",
      message: "Enter username",
      async validate(username) {
        socket.emit(VALIDATE_USERNAME, { username, action });
        return await on(VALIDATE_USERNAME);
      }
    },
    {
      type: "password",
      name: "password",
      message: "Enter password",
      async validate(password, { username }) {
        socket.emit(VALIDATE_PASSWORD, { action, username, password });
        return await on(VALIDATE_PASSWORD);
      }
    }
  ]);

  action === "Sign up"
    ? socket.emit(SIGN_UP, { username, password })
    : socket.emit(FETCH_ROOMS, { username });

  const rooms = await on(FETCH_ROOMS);

  return { username, rooms };
};

const askRoom = async ({ username, rooms = [] }) => {
  const { room, create, join } = await prompt([
    {
      type: "list",
      name: "room",
      message: rooms ? "Choose room" : "No rooms found",
      choices: choicesFromRooms(rooms)
    },
    {
      type: "input",
      name: "create",
      message: "Enter room name",
      when({ room }) {
        return room === "Create a room";
      },
      async validate(room) {
        socket.emit(CREATE_ROOM, { username, room });
        return await on(CREATE_ROOM);
      }
    },
    {
      type: "input",
      name: "join",
      message: "Enter room name",
      when({ room }) {
        return room === "Join a room";
      },
      async validate(room) {
        socket.emit(JOIN_ROOM, { username, room });
        return await on(JOIN_ROOM);
      }
    }
  ]);

  if (!create && !join) {
    socket.emit(ENTER_ROOM, { username, room });
    await on(ENTER_ROOM);

    return { username, room, rooms };
  }

  const newRoom = create ? create : join;

  return {
    username,
    room: newRoom,
    rooms: rooms.concat(newRoom)
  };
};

const handleChatRoom = ({ username, room, rooms }) => {
  clear();

  const rl = readline.createInterface(process.stdin, process.stdout);

  log(`Entered ${chalk.bold(room)}`);

  rl.on("line", answer => {
    if (answer[0] === "/") {
      switch (answer) {
        case "/quit":
          rl.close();
          process.exit(0);

        // eslint-disable-next-line no-fallthrough
        case "/exit":
          clear();
          rl.close();

          socket.off(SEND_MESSAGE);
          socket.emit(LEAVE_ROOM, { username, room });

          askRoom({ username, rooms }).then(handleChatRoom);

          break;
      }
    } else {
      socket.emit(SEND_MESSAGE, { username, room, message: answer });

      readline.moveCursor(process.stdout, 0, -1);
      process.stdout.clearLine();
    }
  });

  socket.on(SEND_MESSAGE, ({ username, message }) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    log(`${chalk.bold(username)} ${message}`);

    rl.prompt(true);
  });

  rl.prompt();
};

auth()
  .then(answer => askRoom(answer).then(handleChatRoom))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
