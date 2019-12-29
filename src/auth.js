const bcrypt = require("bcrypt");

const craftMsg = field => `${field} should be at least 6 characters long.`;

const cantSignUp = (action, res) => action === "Sign up" && res.rowCount !== 0;
const cantSignIn = (action, res) => action === "Sign in" && res.rowCount === 0;

const validateUsername = client => async (username, { action }) => {
  if (username.length < 6) {
    return craftMsg("Username");
  }

  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const res = await client.query(query);

  return cantSignUp(action, res)
    ? "Username already exists."
    : cantSignIn(action, res)
    ? "Username doesn't exist."
    : true;
};

const validatePassword = client => async (password, { action, username }) => {
  if (password.length < 6) {
    return craftMsg("Password");
  }

  const query = `SELECT * FROM users WHERE username = '${username}' and password = '${password}'`;
  const res = await client.query(query);


const signUp = client => async ({ username, password }) => {
  const hashedPassword = await bcrypt.hash(password, 8);

  await client.query(
    `INSERT INTO users VALUES('${username}', '${hashedPassword}')`
  );
};

module.exports = {
  validateUsername,
  validatePassword,
  signUp
};
