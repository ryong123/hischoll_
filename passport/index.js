const local = require("./localStrategy");
const jwt = require("./jwtStrategy");
// const kakao = require('./kakaoStrategy');
const { User } = require("./../models/Index");

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    console.log("serializeUser 실행");
    done(null, user);
  });
  passport.deserializeUser((id, done) => {
    console.log("deserializeUser 실행");
    console.log("deserializeUser id : ", id);
    User.findOne({ where: { userid: id.userid } })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });
  local(passport);
  jwt(passport);
  // kakao(passport);
};
