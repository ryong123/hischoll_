const http = require("http");
const SocketIO = require("socket.io");
const express = require("express");
const app = express();
const server = http.createServer(app);
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const db = require("./models/Index.js");
const { Club, User, Dm, Club_chat } = require("./models/Index");
const jwt = require("jsonwebtoken");
const {
  isNotLoggedIn,
  isLoggedIn,
  preventIndex,
} = require("./middleware/loginCheck");

const cors = require("cors");
// const { sequelize } = require('./models/Index.js');

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT;

const io = SocketIO(server);

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static(path.join(__dirname, "static")));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false, // https
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// passport
const passport = require("passport");
const passportConfig = require("./passport");
passportConfig(passport);

app.use(passport.initialize());
app.use(passport.session());

// socket

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

const indexRouter = require("./routes");
const socketRouter = require("./routes/socket");

app.use("/", indexRouter);

let flag = true;

// DM
app.get("/chat/:room", isLoggedIn, async (req, res) => {
  if (flag) {
    flag = false;
    socketRouter.startSocket(io);
  }
  // 상대방 닉네임
  // const {nickname} = req.query;
  const { room } = req.params;
  const { userid, userid_num } = jwt.verify(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );
  const getName = await User.findOne({
    attributes: ["nickname"],
    where: {
      userid_num: userid_num,
    },
  });

  let otherNick = room.replace(`${getName.nickname}`, "")
  otherNick = otherNick.replace(`,`, "")
  otherNick = otherNick.replace(` `, "")
  console.log("otherNick >>>>> ", otherNick)

  const chats = await Dm.findAll({
    where: {room_name: room}
  })
console.log("index chats >>>>>>>>> ",chats);
  res.render("chat", { room, myNickname: getName.nickname, userid_num , chats, otherNick})
});

// Club
app.get("/myclubChat/:club_id", isLoggedIn, async (req, res) => {
  const { club_id } = req.params;
  const { userid, userid_num } = jwt.verify(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );

  console.log("user_id", userid_num);

  const name = await User.findOne({
    attributes: ["name"],
    where: {
      userid_num: userid_num,
    },
  });
  console.log("app get", name);
  if (flag) {
    flag = false;
    socketRouter.startClubSocket(io);
  }

  const chats = await Club_chat.findAll({
    where: { club_id: club_id },
  });

  console.log("!!!!!!!!!!!!!!", chats);

  res.render("myclub/myclubChat", {
    club_id: club_id,
    name: name.dataValues.name,
    userid_num,
    chats,
  });
});

app.get("*", (req, res) => {
  res.render("404");
}); // error 페이지 ?

db.sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () => {
    console.log(`${PORT}번 포트에서 실행중`);
  });
});
