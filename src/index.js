const io = require("socket.io-client");
const inquirer = require("inquirer");
const getPrompts = require("./prompts");

const socket = io("ws://localhost:3000");

inquirer.prompt(getPrompts(socket));
