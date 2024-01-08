const controller = require("../controller/Csocket");

exports.startSocket = (io) => {
  io.on("connection", (socket) => {
    controller.connection(io, socket);
  });
};
