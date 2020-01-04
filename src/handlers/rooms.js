const fetchRooms = async (pool, { username }) => {
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const response = await pool.query(query);
  const { rooms } = response.rows[0];

  return rooms.length > 0 ? rooms : null;
};

const checkRoom = async (pool, room) => {
  const query = `SELECT * FROM rooms WHERE name = '${room}'`;
  const response = await pool.query(query);

  return response.rowCount !== 0;
};

const userAlreadyInRoom = async (pool, { username, room }) => {
  const query = `SELECT * FROM rooms WHERE name = '${room}' and members @> '{${username}}'`;
  const response = await pool.query(query);

  return response.rowCount !== 0;
};

const addRoomToUserList = async (pool, { username, room }) => {
  const query = `UPDATE users SET rooms = array_append(rooms, '${room}') WHERE username = '${username}'`;
  await pool.query(query);
};

const addUserToRoomList = async (pool, { username, room }) => {
  const query = `UPDATE rooms SET members = array_append(members, '${username}') WHERE name = '${room}'`;
  await pool.query(query);
};

const joinRoom = async (pool, { username, room }) => {
  const roomExists = await checkRoom(pool, room);

  if (!roomExists) {
    return "Room doesn't exist";
  }

  const userInRoom = await userAlreadyInRoom(pool, { username, room });

  if (userInRoom) {
    return "You already are in this room";
  }

  await addRoomToUserList(pool, { username, room });
  await addUserToRoomList(pool, { username, room });

  return true;
};

const createRoom = async (pool, { username, room }) => {
  if (room.length < 6) {
    return "Room name should be at least 6 characters long";
  }

  const roomExists = await checkRoom(pool, room);

  if (roomExists) {
    return "Room already exists";
  }

  const query = `INSERT INTO rooms VALUES ('${room}', '{${username}}')`;

  await pool.query(query);
  await addRoomToUserList(pool, { username, room });

  return true;
};

module.exports = {
  fetchRooms,
  joinRoom,
  createRoom
};
