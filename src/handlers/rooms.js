const fetchRooms = async (pool, { username }) => {
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const response = await pool.query(query);
  const { rooms } = response.rows[0];

  return rooms.length > 0 ? rooms : null;
};

module.exports = {
  fetchRooms
};
