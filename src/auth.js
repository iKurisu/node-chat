const bcrypt = require("bcrypt");

const craftMsg = field => `${field} should be at least 6 characters long.`;

const cantSignUp = (action, res) => action === "Sign up" && res.rowCount !== 0;
const cantSignIn = (action, res) => action === "Sign in" && res.rowCount === 0;

const validateUsername = async (pool, { action, username }) => {
  if (username.length < 6) {
    return craftMsg("Username");
  }

  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const res = await pool.query(query);

  return cantSignUp(action, res)
    ? "Username already exists."
    : cantSignIn(action, res)
    ? "Username doesn't exist."
    : true;
};

const validatePassword = async (pool, { action, username, password }) => {
  if (password.length < 6) {
    return craftMsg("Password");
  }

  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const res = await pool.query(query);

  const matches =
    action === "Sign in" && res.rowCount !== 0
      ? await bcrypt.compare(password, res.rows[0].password)
      : true;

  return !matches ? "Password is incorrect." : true;
};

const signUp = async (pool, { username, password }) => {
  const hashedPassword = await bcrypt.hash(password, 8);

  await pool.query(
    `INSERT INTO users VALUES('${username}', '${hashedPassword}')`
  );
};

module.exports = {
  validateUsername,
  validatePassword,
  signUp
};
