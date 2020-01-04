const { Pool } = require("pg");
const expect = require("chai").expect;
const {
  fetchRooms,
  joinRoom,
  createRoom
} = require("../../src/handlers/rooms");

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

    await pool.query(`INSERT INTO rooms VALUES ('Room A', '{userBB}')`);
  });

  after(async () => {
    await pool.query("DELETE FROM users");
    await pool.query("DELETE FROM rooms");
    pool.end();
  });

  it("fetches rooms correctly", async () => {
    expect(await fetchRooms(pool, { username: "userAA" })).to.eql([
      "hello",
      "world"
    ]);
    expect(await fetchRooms(pool, { username: "userBB" })).to.equal(null);
  });

  it("handles joining to an invalid room", async () => {
    expect(await joinRoom(pool, { username: "userAA", room: "A" })).to.equal(
      "Room doesn't exist"
    );

    expect(
      await joinRoom(pool, { username: "userBB", room: "Room A" })
    ).to.equal("You already are in this room");
  });

  it("handles joining to a valid room", async () => {
    expect(
      await joinRoom(pool, { username: "userAA", room: "Room A" })
    ).to.equal(true);

    const query = `SELECT * FROM users WHERE username = 'userAA'`;
    expect(await pool.query(query)).to.include({ rowCount: 1 });
  });

  it("handles creating an invalid room", async () => {
    expect(
      await createRoom(pool, { username: "userAA", room: "ABC" })
    ).to.equal("Room name should be at least 6 characters long");

    expect(
      await createRoom(pool, { username: "userAA", room: "Room A" })
    ).to.equal("Room already exists");
  });

  it("handles creating a valid room", async () => {
    expect(
      await createRoom(pool, { username: "userAA", room: "Room B" })
    ).to.equal(true);

    const query = `SELECT * FROM users WHERE rooms @> '{Room B}'`;
    expect(await pool.query(query)).to.include({ rowCount: 1 });

    const query2 = `SELECT * FROM rooms WHERE name = 'Room B'`;
    expect(await pool.query(query2)).to.include({ rowCount: 1 });
  });
});
