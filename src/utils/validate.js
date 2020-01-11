const hasDangerousChar = str => /'|`/.test(str);

module.exports = {
  hasDangerousChar
};
