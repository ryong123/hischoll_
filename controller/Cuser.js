const {
  User
} = require("../models/Index");


exports.register = async(req, res) => {
  const { userid, name, school, grade, classid, birthday, nickname, phone, password } = req.body;

  try {
    const newUser = await User.create({
      userid,
      name,
      school,
      grade,
      classid,
      birthday,
      nickname,
      phone,
      password
    }).then((result) => {
      console.log(result);
      res.send('회원가입 성공')
    })
  } catch(err) {
    console.log(err);
  }
}



exports.login = async(req, res) => {
  const { userid, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        userid,
        password
      }
    }).then((result) => {
      console.log(result);
      res.send('로그인 성공')
    })
  } catch(err) {
    console.log(err);
  }
}