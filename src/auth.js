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

  return cantSignIn(action, res) ? "Password is incorrect." : true;
};

module.exports = {
  validateUsername,
  validatePassword
};
