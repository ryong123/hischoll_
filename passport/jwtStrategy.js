require("dotenv").config();
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const { ExtractJwt, Strategy: JWTStrategy } = require("passport-jwt");

const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const JWTVerify = async (jwtPayload, done) => {
  try {
    // jwtPayload에 유저 정보가 담겨있다.
    // 해당 정보로 유저 식별 로직을 거친다.
    // console.log(jwtPayload);
    UserModel.findOne(jwtPayload.userid)
      .then((user) => {
        return done(null, user);
      })
      .catch((err) => {
        return done(err);
      });
    // 유효한 유저라면
    if (user) {
      done(null, user);
      return;
    }
    // 유저가 유효하지 않다면
    done(null, false, { message: "inaccurate token." });
  } catch (error) {
    console.error(error);
    done(error);
  }
};

module.exports = (passport) => {
  passport.use("jwt", new JWTStrategy(JWTConfig, JWTVerify));
};

// 토큰에 담길 유저명의 key를 지정하는 옵션. 패스워드도 지정할 수 있다.
// const passportConfig = { usernameField: "userid", passwordField: "password" };
