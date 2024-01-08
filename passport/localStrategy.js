const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const passport = require("passport");
const { User } = require("../models/Index");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "userid",
        passwordFiled: "password",
      },
      async (userid, password, done) => {
        try {
          const exUser = await User.findOne({ where: { userid: userid } });
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              // console.log("비밀번호 일치함");
              done(null, exUser);
            } else {
              // console.log("비밀번호 일치하지 않습니다");
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            // console.log("가입하지 않은 회원입니다");
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
