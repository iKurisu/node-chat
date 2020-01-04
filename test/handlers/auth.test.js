require("dotenv").config();
const { Pool } = require("pg");
const expect = require("chai").expect;
const {
  validateUsername,
  validatePassword,
  signUp
} = require("../../src/handlers/auth");

describe("auth", () => {
  let pool;

  before(async () => {
    pool = new Pool({
      connectionString: process.env.TEST_DB_CONNECTION_STRING,
      ssl: true
    });

    await pool.connect();

    await pool.query("DELETE FROM users");

    // Hash of "abcdef"
    const hashedPassword =
      "$2b$08$vHHU/SPPfWRZjhI5smBJ5ewOiAIeH.i4Yzw7j/6vq4VPz.wUcPrZ6";

    await pool
      .query(`INSERT INTO users VALUES ('userAA', '${hashedPassword}')`)
      .catch(console.error);
  });

  after(async () => {
    await pool.query("DELETE FROM users");
    pool.end();
  });

  it("validates username correctly", async () => {
    expect(
      await validateUsername(pool, { action: "Sign in", username: "usr" })
    ).equal("Username should be at least 6 characters long.");

    expect(
      await validateUsername(pool, { action: "Sign in", username: "userAA" })
    ).equal(true);

    expect(
      await validateUsername(pool, { action: "Sign up", username: "userAA" })
    ).equal("Username already exists.");

    expect(
      await validateUsername(pool, { action: "Sign in", username: "ikurisu" })
    ).equal("Username doesn't exist.");

    expect(
      await validateUsername(pool, { action: "Sign up", username: "ikurisu" })
    ).equal(true);
  });

  it("validates password correctly", async () => {
    expect(
      await validatePassword(pool, {
        action: "Sign in",
        username: "abc",
        password: ""
      })
    ).equal("Password should be at least 6 characters long.");

    expect(
      await validatePassword(pool, {
        action: "Sign in",
        username: "userAA",
        password: "abcdef"
      })
    ).equal(true);

    expect(
      await validatePassword(pool, {
        action: "Sign in",
        username: "userAA",
        password: "abcdefg"
      })
    ).equal("Password is incorrect.");

    expect(
      await validatePassword(pool, {
        action: "Sign up",
        username: "ikurisu",
        password: "a_random_password"
      })
    ).equal(true);
  });

  it("sign ups a valid user correctly", async () => {
    await signUp(pool, {
      username: "ikurisu",
      password: "mysupersecretpassword"
    });

    const res = await pool.query(
      `SELECT * FROM users WHERE username = 'ikurisu'`
    );

    expect(res.rowCount).equal(1);
  });
});
