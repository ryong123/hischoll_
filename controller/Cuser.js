const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Club_post } = require("../models/Index");

const dotenv = require("dotenv").config();
const { getSignedFileUrl, uploadMultipleSignedUrl,  getSignedFile, deleteFile } = require("../middleware/s3");
const { post } = require("../routes");


exports.getRegister = async (req, res, next) => {
  res.render("register", { link: '/'});
}

exports.postRegister = async (req, res, next) => {
  const {
    userid,
    password,
    school,
    phone,
    birthday,
    name,
    grade,
    nickname,
    classid,
    profile_img,
  } = req.body;

  // console.log("profile_img : ", profile_img);

  try {
    const exUser = await User.findOne({ where: { userid: userid } });
    if (exUser) {
      // console.log("join Error : 이미 가입된 아이디입니다");
      return res.send("이미 가입된 아이디입니다");
      return res.redirect("/register");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      userid,
      school,
      phone,
      profile_img,
      nickname,
      birthday,
      name,
      grade,
      classid,
      password: hash,
    });
    return res.send({ success: true, message: "회원가입 성공" });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};




exports.postLogin = async (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    // console.log("/login user : ", user);
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      // console.log("유저가 존재하지 않습니다");
      return res.send("유저 정보가 일치하지 않습니다");
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        // console.log("로그인 에러");
        return next(loginError);
      }

      const payload = {
        userid: req.body.userid,
        userid_num: user.userid_num,
      };

      const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET);

      return (
        res
          .cookie("jwt", token, {
            httpOnly: true,
            secure: false, // https 사용시 true 설정해줄것
            maxAge: 1000 * 60 * 60 * 24 * 7,
          })
          .status(200)
          .send({ isLoggedIn: true })
      );
    });
  })(req, res, next);
};

exports.getLogout = async(req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); 
      res.clearCookie("jwt");
      res.redirect('/'); 
    });
  });
}



exports.s3upload = async (req, res) => {
  // printLog()

  if (req.method === "POST") {
    try {
      let { name, type } = req.body;
      const fileParams = {
        name: name,
        type: type,
      };
      // console.log("fileParams : ", fileParams);

      const signedUrl = await getSignedFileUrl(fileParams);
      // console.log("signedUrl : ", signedUrl);
      return res.send(signedUrl);
    } catch (e) {
      return res.status(500).send({
        message: "make url failed",
      });
    }
  }
};



exports.s3MultipleSignedUrl = async (req, res) => {
  if (req.method === "POST") {
    try {
      const payload = req.body
      console.log('Cuser 140 payload', payload)

      const signedUrl = await uploadMultipleSignedUrl(payload);
        console.log("Cuser 151 signedUrl : ", signedUrl);

      // for(i = 0; i < files.length; i++){
      //   let { name, type } = files[i];
      //   const fileParams = {
      //     name: name,
      //     type: type,
      //   };
      //   console.log("Cuser 148 fileParams : ", payload);

      //   const signedUrl = await uploadMultipleSignedUrl(payload);
      //   console.log("Cuser 151 signedUrl : ", signedUrl);
      // }

      return res.send(signedUrl);
    } catch (e) {
      return res.status(500).send({
        message: "make url failed",
      });
    }
  }
}



exports.s3Delete = async (req, res) => {
  if (req.method === "POST") {
    // console.log('s3Delete 실행');
    try {

      const { userid, userid_num } = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const { club_id, post_id } = req.params;

      const { key } = req.body

      // const deletedPostImage = await Club_post.update({
      //   post_img: null,
      // })


      const foundImage = await Club_post.findOne({
        where: {
          post_id: post_id
        },
        attributes: ["image"]
      })

      // console.log('foundImage :', foundImage);
      // { image: [ '5suekut3jq4', 'ts6uwba8pn', 'rybm7tz5o3p' ] }

      let filtered = foundImage.image.filter((element) => element !== key);

      // console.log('filtered', filtered);

      const updatedImage = await Club_post.update({
        image: filtered
      }, {
        where: {
          post_id: post_id,
        }
      })

      // console.log('updatedImage :', updatedImage);



      const isDeleted = await deleteFile(key);
      // console.log("Cuser 174 isDeleted : ", isDeleted);

      return res.send(isDeleted);
    } catch (e) {
      return res.status(500).send({
        message: "s3 파일 삭제 실패",
      });
    }
  }
}