require("dotenv").config();
const { Client } = require("pg");
const expect = require("chai").expect;
const { validateUsername, validatePassword, signUp } = require("../src/auth");

describe("auth", () => {
  let client;

  before(() => {
    client = new Client({
      user: process.env.TEST_DB_USER,
      host: process.env.TEST_DB_HOST,
      database: process.env.TEST_DB_DATABASE,
      password: process.env.TEST_DB_PASSWORD,
      port: process.env.TEST_DB_PORT,
      ssl: true
    });

    client.connect();

    client
      .query("INSERT INTO users VALUES ('userAA', 'abcdef')")
      .catch(console.error);
  });

  after(async () => {
    await client.query("DELETE FROM users");
    client.end();
  });

  it("validates username correctly", async () => {
    expect(await validateUsername(client)("usr", {})).equal(
      "Username should be at least 6 characters long."
    );

    expect(
      await validateUsername(client)("userAA", { action: "Sign in" })
    ).equal(true);
    expect(
      await validateUsername(client)("userAA", { action: "Sign up" })
    ).equal("Username already exists.");

    expect(
      await validateUsername(client)("ikurisu", { action: "Sign in" })
    ).equal("Username doesn't exist.");
    expect(
      await validateUsername(client)("ikurisu", { action: "Sign up" })
    ).equal(true);
  });

  it("validates password correctly", async () => {
    expect(await validatePassword(client)("abc", {})).equal(
      "Password should be at least 6 characters long."
    );

    expect(
      await validatePassword(client)("abcdef", {
        action: "Sign in",
        username: "userAA"
      })
    ).equal(true);

    expect(
      await validatePassword(client)("abcdefg", {
        action: "Sign in",
        username: "userAA"
      })
    ).equal("Password is incorrect.");

    expect(
      await validatePassword(client)("a_random_password", {
        action: "Sign up",
        username: "ikurisu"
      })
    ).equal(true);
  });

  it("sign ups a valid user correctly", async () => {
    await signUp(client)({
      username: "ikurisu",
      password: "mysupersecretpassword"
    });

    const res = await client.query(
      `SELECT * FROM users WHERE username = 'ikurisu'`
    );

    expect(res.rowCount).equal(1);
  });
});
