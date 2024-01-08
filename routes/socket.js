const controller = require("../controller/Csocket");
const Ccontroller = require("../controller/CclubSocket");

exports.startSocket = (io) => {
  io.on("connection", (socket) => {
    controller.connection(io, socket);
  });
};

exports.startClubSocket = (io) => {
  io.on("connection", (socket) => {
    Ccontroller.connection(io, socket);
  });
};
