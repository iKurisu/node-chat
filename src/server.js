const io = require("socket.io")();

io.on("connection", socket => {
  socket.on("username", console.log);
});

io.listen(3000);
