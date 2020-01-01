require("dotenv").config();
const { Pool } = require("pg");
const expect = require("chai").expect;
const { validateUsername, validatePassword, signUp } = require("../src/auth");

describe("auth", () => {
  let pool;

  before(() => {
    pool = new Pool({
      connectionString: process.env.TEST_DB_CONNECTION_STRING,
      ssl: true
    });

    pool.connect();

    // Hash of "abcdef"
    const hashedPassword =
      "$2b$08$vHHU/SPPfWRZjhI5smBJ5ewOiAIeH.i4Yzw7j/6vq4VPz.wUcPrZ6";

    pool
      .query(`INSERT INTO users VALUES ('userAA', '${hashedPassword}')`)
      .catch(console.error);
  });

  after(async () => {
    await pool.query("DELETE FROM users");
    pool.end();
  });

  it("validates username correctly", async () => {
    expect(await validateUsername(pool)("usr", {})).equal(
      "Username should be at least 6 characters long."
    );

    expect(await validateUsername(pool)("userAA", { action: "Sign in" })).equal(
      true
    );
    expect(await validateUsername(pool)("userAA", { action: "Sign up" })).equal(
      "Username already exists."
    );

    expect(
      await validateUsername(pool)("ikurisu", { action: "Sign in" })
    ).equal("Username doesn't exist.");
    expect(
      await validateUsername(pool)("ikurisu", { action: "Sign up" })
    ).equal(true);
  });

  it("validates password correctly", async () => {
    expect(await validatePassword(pool)("abc", {})).equal(
      "Password should be at least 6 characters long."
    );

    expect(
      await validatePassword(pool)("abcdef", {
        action: "Sign in",
        username: "userAA"
      })
    ).equal(true);

    expect(
      await validatePassword(pool)("abcdefg", {
        action: "Sign in",
        username: "userAA"
      })
    ).equal("Password is incorrect.");

    expect(
      await validatePassword(pool)("a_random_password", {
        action: "Sign up",
        username: "ikurisu"
      })
    ).equal(true);
  });

  it("sign ups a valid user correctly", async () => {
    await signUp(pool)({
      username: "ikurisu",
      password: "mysupersecretpassword"
    });

    const res = await pool.query(
      `SELECT * FROM users WHERE username = 'ikurisu'`
    );

    expect(res.rowCount).equal(1);
  });
});
