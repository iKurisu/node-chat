const io = require("socket.io-client");
const inquirer = require("inquirer");
const { VALIDATE_USERNAME, VALIDATE_PASSWORD, SIGN_UP } = require("./events");

const socket = io("ws://localhost:3000");

inquirer
  .prompt([
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
        const done = this.async();

        socket.emit(VALIDATE_USERNAME, { username, action });
        socket.on(VALIDATE_USERNAME, answer => done(answer));
      }
    },
    {
      type: "password",
      name: "password",
      mask: "*",
      message: "Enter password",
      validate(password, { action, username }) {
        const done = this.async();

        socket.emit(VALIDATE_PASSWORD, { action, username, password });
        socket.on(VALIDATE_PASSWORD, answer => done(answer));
      }
    }
  ])
  .then(async ({ action, username, password }) => {
    if (action === SIGN_UP) {
      socket.emit(SIGN_UP, { username, password });
    }
  });
