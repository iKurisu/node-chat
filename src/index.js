require("dotenv").config();
const io = require("socket.io-client");
const inquirer = require("inquirer");
const connectClient = require("./client");
const { validateUsername, validatePassword, signUp } = require("./auth");

const client = connectClient();

const handleResult = async ({ action, username, password }) => {
  if (action === "Sign up") {
    await signUp(client)({ username, password });
  }

  const socket = io("ws://localhost:3000");
  socket.emit("username", username);
};

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
      validate: validateUsername(client)
    },
    {
      type: "password",
      name: "password",
      mask: "*",
      message: "Enter password",
      validate: validatePassword(client)
    }
  ])
  .then(handleResult);
