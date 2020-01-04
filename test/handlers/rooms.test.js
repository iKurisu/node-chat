const { Pool } = require("pg");
const expect = require("chai").expect;
const { fetchRooms } = require("../../src/handlers/rooms");

describe("rooms handlers", () => {
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

    await pool.query(
      `INSERT INTO users VALUES ('userAA', '${hashedPassword}', '{hello, world}')`
    );

    await pool.query(
      `INSERT INTO users VALUES ('userBB', '${hashedPassword}')`
    );
  });

  after(async () => {
    await pool.query("DELETE FROM users");
    pool.end();
  });

  it("fetches rooms correctly", async () => {
    expect(await fetchRooms(pool, { username: "userAA" })).to.eql([
      "hello",
      "world"
    ]);
    expect(await fetchRooms(pool, { username: "userBB" })).to.equal(null);
  });
});
