const inquirer = require("inquirer");

const choicesFromRooms = rooms => {
  const withOptionalSeparator = rooms
    ? rooms.length > 0
      ? rooms.concat(new inquirer.Separator())
      : rooms
    : [];

  return [...withOptionalSeparator, "Create a room", "Join a room"];
};

module.exports = {
  choicesFromRooms
};
