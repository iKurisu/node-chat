const { choicesFromRooms } = require("../../src/utils/prompts");
const { expect } = require("chai");
const inquirer = require("inquirer");
const sinon = require("sinon");

describe("prompt utils", () => {
  let separator;

  before(() => {
    separator = sinon.stub(inquirer, "Separator").returns({});
  });

  after(() => {
    sinon.restore();
  });

  it("generates correct choices from falsy 'rooms'", () => {
    expect(choicesFromRooms(null)).eql(["Create a room", "Join a room"]);
  });

  it("generates correct choices from a list of rooms", () => {
    expect(choicesFromRooms(["Room A", "Room B"])).eql([
      "Room A",
      "Room B",
      {},
      "Create a room",
      "Join a room"
    ]);

    expect(separator.calledOnce).to.equal(true);
  });
});
