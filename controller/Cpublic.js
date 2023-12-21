const {
  Public_post,
  Public_post_comment,
  Public_post_comment_like,
  Dm,
  Club,
  Club_members,
  User,
} = require("../models/Index");
const jwt = require("jsonwebtoken");
const { OP } = require("sequelize");

// ===== publicPost =====

// GET /publicPostMain 익명 게시판 정보 가져오기
exports.getPost = async (req, res) => {
  try {
    const Posts = await Public_post.findAll();
    res.render("/publicPost/publicPostMain", { data: Posts });
  } catch {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /publicNewPost 게시물 생성 페이지 로드
exports.getNewPost = async (req, res) => {
  try {
    res.render("/publicPost/publicNewPost");
  } catch {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// POST /publicNewPost 새로운 포스트 생성
exports.createPost = async (req, res) => {
  try {
    // const {userid_num} = req.params.userid_num;
    const { title, content, image } = req.body;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const getName = await User.findOne({
      where: {
        userid_num: userid_num,
      },
    });
    const newPost = await Public_post.create({
      title: title,
      content: content,
      image: image,
      userid_num: userid_num,
      nickname: getName.dataValues.nickname,
    });
    res.send(newPost);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /publicPostDetail/:post_id 특정 게시물 조회 // 다시 보자
exports.getPostDetail = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const getPost = await Public_post.findOne({
      where: { post_id: post_id },
    });
    const getPostComment = await Public_post_comment.findAll({
      where: { post_id: post_id },
      include: [{ model: Public_post_comment_like }],
    });
    // const getComments = await Public_post_comment.findAll({

    // })
    // const getPostCommentLike = await Public_post_comment_like.findAll({
    //   where: {  },
    // });
    res.render("/publicPost/publicPostDetail", {
      data: getPost,
      getPostComment,
      getPostCommentLike,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// POST //publicPostDetail/:post_id 특정 게시글 댓글 작성
exports.createPostComment = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { comment } = req.body;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const getNickname = await User.findOne({
      where: {
        userid_num: userid_num,
      },
    });
    const newPublicPostComment = await Public_post_comment.create({
      comment: comment,
      comment_nickname: getNickname.dataValues.nickname,
      post_id: post_id,
      userid_num: userid_num,
    });
    res.send(newPublicPostComment);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// POST /publicPostDetail/:post_id/:comment_id 특정 댓글 좋아요
exports.createPostCommentLike = async (req, res) => {
  try {
    const { post_id, comment_id } = req.params;
    const { like_id } = req.body;
    const publicPostCommentLike = await Public_post_comment_like.create({
      like_id: like_id,
      comment_id: comment_id,
    });
    res.send(publicPostCommentLike);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// ==== 수정 ====
// PATCH /publicPostDetail/:post_id 게시글 수정
exports.patchPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { title, content, image } = req.body;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const updatePost = await Public_post.update(
      {
        title: title,
        content: content,
        image: image,
      },
      {
        where: {
          post_id: post_id,
          userid_num: userid_num,
        },
      }
    );
    res.send(updatePost);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// PATCH /publicPostDetail/:post_id/:comment_id 특정 게시글 댓글 수정
exports.patchPostComment = async (req, res) => {
  try {
    const { post_id, comment_id } = req.params;
    const { comment } = req.body;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    // 유저가 누구인지 어떻게 알고 내 아이디 글만 수정 하는거죠?
    const updatePostComment = await Public_post_comment.update(
      {
        comment: comment,
      },
      {
        where: {
          comment_id: comment_id,
          post_id: post_id,
        },
      }
    );
    res.send(updatePostComment);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// PATCH /publicPostDetail/:post_id/:comment_id 특정 개시물 댓글 라이크 수정
exports.patchPostCommentLike = async (req, res) => {
  try {
    const { post_id, comment_id } = req.params;
    const { like_id } = req.body;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const updatePostCommentLike = await Public_post_comment_like.update(
      {
        like_id: like_id,
      },
      {
        where: {
          comment_id: comment_id,
        },
      }
    );
    res.send(updatePostCommentLike);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// ==== 삭제 =====
// DELETE /publicPostDetail/:post_id 특정 게시물 삭제
exports.deletePost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const deletePost = await Public_post.destroy({
      where: {
        post_id: post_id,
      },
    });
    if (deletePost) {
      res.send({ isDeleted: true });
    } else {
      res.send({ isDeleted: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DELETE /publicPostDetail/:post_id/:comment_id 특정 게시물 댓글 삭제
exports.deletePostComment = async (req, res) => {
  try {
    const { post_id, comment_id } = req.params;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const deletePostComment = await Public_post_comment.destroy({
      where: {
        post_id: post_id,
        comment_id: comment_id,
      },
    });
    if (deletePostComment) {
      res.send({ isDeleted: true });
    } else {
      res.send({ isDeleted: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DM
// GET /dm => dm 가져오기
exports.dm = async (req, res) => {
  try {
    const { nickname } = req.body;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const getDm = await Dm.findAll({
      where: {
        [Sequelize.Op.or]: [
          { to_nickname: nickname },
          { userid_num: userid_num },
        ],
      },
    });
    res.render("/support/dm", getDm);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// POST /mypageProfile/:nickname => dm 생성
exports.newDm = async (req, res) => {
  try {
    const { nickname } = req.params;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const createDm = await Dm.create({
      userid_num: userid_num,
      to_nickname: nickname,
    });
    res.render("/mypage/mypageProfile", { data: createDm });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /dmDetail/:note_id 채팅방 페이지 가져오기
exports.getDmDetail = async (req, res) => {
  try {
    const { note_id } = this.params;
    const getRoom = await Dm.findAll({
      where: {
        note_id: note_id,
      },
    });
    res.render("/support/dmDetail", { data: getRoom });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// POST /dmDetail/:note_id
exports.postDm = async (req, res) => {
  try {
    const { note_id } = req.params;
    const { to_nickname, dm_content } = req.body;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const sendDm = await Dm.create({
      to_nickname: to_nickname,
      dm_content: dm_content,
      userid_num: userid_num,
      where: {
        note_id: note_id,
      },
    });
    res.send(sendDm);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DELETE /dm => dm 삭제
exports.deleteDm = async (req, res) => {
  try {
    // const {userid_num} = req.params.userid_num;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    if (req.session.id === userid_num) {
      const destroyDm = await Dm.destroy({
        where: note_id,
      });
      if (destroyDm) {
        res.send({ isDeleted: true });
      } else {
        res.send({ isDeleted: false });
      }
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /clubAdminApplyDetail/:club_id/:userid_num 회원 신청자 상세페이지 불러오기
exports.getClubAdminApplyDetail = async (req, res) => {
  try {
    const { club_id, userid_num } = req.params;

    const getClubAdminApplyDetail = await Club_members.findOne({
      where: {
        club_id: club_id,
        userid_num: userid_num,
        isMember: "false",
      },
      // include: [{ model: User }],
    });
    const userInfo = await User.findOne({
      attributes: ["name", "school", "classid", "grade"],
      where: {
        userid_num: userid_num,
      },
    });
    console.log("여기 봐봐 !!!>>>>>>>>>>", userInfo);
    console.log("여기!!!!!!", getClubAdminApplyDetail);

    res.render("clubAdmin/clubAdminApplyDetail", {getClubAdminApplyDetail, userInfo});
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /clubAdminTransfer 클럽 회장 위임 페이지 가져오기
exports.getClubAdminTransfer = async (req, res) => {
  try {
    res.render("clubAdmin/clubAdminTransfer");
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /clubAdminTransfer/:club_id 클럽 회장 위임페이지 회원 전체 조회
exports.getAllMembers = async (req, res) => {
  try {
    const { club_id } = req.params;
    const getAllMembersShow = await Club_members.findAll({
      where: {
        club_id: club_id,
        isMember: "true",
      },
    });

    // 회원 전체 조회
    const getusers = await Club_members.findAll({
      attributes: ["userid_num"],
      where: {
        club_id: club_id,
        isMember: "true"
      }
    });

    let getusersid = [];
    getusers.forEach((element) => {
      getusersid.push(element.dataValues.userid_num);
    });
    let userInfo = [];
    getusersid.forEach(async (element) => {
      console.log(element);
      let info = await User.findOne({ where: { userid_num: element } });
      await userInfo.push(info.name);
      console.log("userinfo >>>>>>>>>>>>>", userInfo);
    });
    console.log('getAllMembersShow >>>>>',getAllMembersShow)



    res.render("clubAdmin/clubAdminTransfer", { data: getAllMembersShow, userInfo, club_id });

  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// PATCH /clubAdminTransfer/:club_id 동아리장 위임 요청
exports.updateClubAdminTransfer = async (req, res) => {
  try {
    const { club_id,userid_num } = req.params;
    const { changeLeader } = req.body;


    const updateLeader = await Club.update({
      leader_id : userid_num
      },
      {
        where: {
        club_id: club_id,
      }
    });
    if (updateLeader) {
      res.send({ isSuccess: true });
    } else {
      res.send({ isSuccess: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// ======== Apply, Admin ======

// clubApply/:club_id 동아리 신청페이지
exports.clubApply = async (req, res) => {
  try {
    const { club_id } = req.params;
    console.log(club_id);
    res.render("club/clubApply", { data: club_id });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// clubApply/:club_id 동아리 신청 정보 전달
exports.clubApplyinfo = async (req, res) => {
  try {
    const { club_id } = req.params;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const { motivation, introduction } = req.body;
    const clubApplyinfo = await Club_members.create({
      club_id: club_id,
      motivation: motivation,
      introduction: introduction,
      userid_num: userid_num,
      isMember: "false",
    });
    res.send({ isApplySuccess: true });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /club

// PATCH /clubAdminApplyDetail/:club_id/:userid_num 동아리 가입 신청
exports.createClubMembers = async (req, res) => {
  try {
    // const {userid_num} = req.params.userid_num;
    let isApplySuccess;
    const { club_id, userid_num } = req.params;
    const { motivation, introduction, applyResult } = req.body;
    if (applyResult) {

      const newMembers = await Club_members.update({
        // club_id: club_id,
        // motivation: motivation,
        // introduction: introduction,
        // userid_num: userid_num,
        isMember: "true",
      },{
        where: {
          club_id:club_id,
          userid_num:userid_num
        }
      }
      );

      if (newMembers) {
        isApplySuccess = true;
      } else {
        isApplySuccess = false;
      }
      res.send(isApplySuccess);
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /clubAdminApplyList/:club_id 클럽에 가입신청한 사람들 전체조회
exports.getClubMembersApplyList = async (req, res) => {
  try {
    const { club_id } = req.params;

    const getApplyList = await Club_members.findAll({
      where: {
        club_id: club_id,
        isMember: "false",
      },
    });
    const getusers = await Club_members.findAll({
      attributes: ["userid_num"],
      where: {
        club_id: club_id,
        isMember: "false",
      },
    });
    let getusersid = [];
    getusers.forEach((element) => {
      console.log("여기!!!!!!!!!!!!!>>>>>>", element.dataValues.userid_num);
      getusersid.push(element.dataValues.userid_num);
    });
    let userInfo = [];
    getusersid.forEach(async (element) => {
      console.log(element);
      let info = await User.findOne({ where: { userid_num: element } });
      console.log("info >>>>>>>>", info.nickname);
      await userInfo.push(info.name);
      console.log("userinfo >>>>>>>>>>>>>", userInfo);
    });

    console.log("getuserid >>>>>>>>>>>>>", getusersid);

    res.render("clubAdmin/clubAdminApplyList", {
      getApplyList,
      userInfo,
      club_id: club_id,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DELETE /clubAdminApplyDetail/:club_id/:userid_num 클럽 가입 거절
exports.deleteApplyDetail = async (req, res) => {
  try {
    const { club_id, userid_num } = req.params;
    const destroyApplyDetail = await Club_members.destroy({
      where: {
        userid_num: userid_num,
        club_id: club_id,
        isMember: "false",
      },
    });
    if (destroyApplyDetail) {
      res.send({ isDeleted: true });
    } else {
      res.send({ isDeleted: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /clubAdminMemberlist/:club_id 클럽 회원 전체 조회
exports.getClubMembers = async (req, res) => {
  try {
    const { club_id } = req.params;
    const getMembers = await Club_members.findAll({
      where: {
        club_id: club_id,
        isMember: "true",
      },
      // include: [{ model: User }],
    });
    const getUsers = await Club_members.findAll({
      attributes: ["userid_num"],
      where:{
        club_id: club_id,
        isMember: true
      }
    });
    let getUserInfo = [];
    // getUsers에서 가져온 클럽에 속한 유저 userid_num 값들을 forEach문으로 
    getUsers.forEach((element) =>{
      console.log("여기!!!!!!!!!!!!!>>>>>>",element.dataValues.userid_num);
      getUserInfo.push(element.dataValues.userid_num);
    });
    
    if (!getMembers) {
      res.render("clubAdmin/clubAdminMemberList");
    } else {
      res.render("clubAdmin/clubAdminMemberList", { data: getMembers });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /clubAdminMemberDetail/:club_id/:userid_num 회원 상세정보 보기
exports.getClubMember = async (req, res) => {
  try {
    const { club_id, userid_num } = req.params;
    const getMember = await Club_members.findOne({
      where: {
        club_id: club_id,
        userid_num: userid_num,
        isMember: "true",
      },
      include: [{ model: User }],
    });
    res.render("clubAdmin/clubAdminMemberDetail", { data: getMember });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// Delete /clubAdminMemberDetail/:club_id 클럽회원 추방
exports.deleteMembers = async (req, res) => {
  try {
    // 삭제 버튼클릭시 값이 넘어온다.
    const { club_id, userid_num } = req.params;
    const destroyMembers = await Club_members.destroy({
      where: {
        club_id: club_id,
        userid_num: userid_num,
        isMember: "true",
      },
    });
    if (destroyMembers) {
      res.send({ isDeleted: true });
    } else {
      res.send({ isDeleted: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// myPage
// GET /mypageMain/ 내 페이지 가져오기 ver.동아리
exports.getMyPage = async (req, res) => {
  try {
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const myPageMain = await User.findOne({
      where: {
        userid: userid,
      },
    });
    res.render("/mypage/mypageMain", { data: myPageMain });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DELETE /mypageMain/
exports.deleteMyID = async (req, res) => {
  try {
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const destroyMyID = await User.destroy({
      where: {
        userid_num: userid_num,
      },
    });
    if (destroyMyID) {
      res.send({ isDeleted: true });
    } else {
      res.send({ isDeleted: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /mypageMainProfile/:nickname 내 페이지 가져오기 ver.닉네임
exports.getMyPageProfile = async (req, res) => {
  try {
    const { nickname } = req.params;
    const myPageMainProfile = await User.findOne({
      where: {
        nickname: nickname,
      },
    });
    res.render("/mypage/mypageProfile", { data: myPageMainProfile });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// =============== HOME =================
// GET /home 전체 동아리, 유저아이디가 가입되어있는 동아리 정보 로드
exports.home = async (req, res) => {
  try {
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const getClubs = await Club.findAll({
      limit: 3,
      order: [["club_id", "DESC"]],
    });

    const myclubList = await Club_members.findAll({
      attributes: ["club_id"],
      where: {
        userid_num: userid_num,
        isMember: "true",
      },
    });
    console.log("myclubList >>>>>>", myclubList);

    let myclubs = [];
    myclubList.forEach((element) => {
      console.log("여기!!!!!!!!!!!!!>>>>>>", element.club_id);
      myclubs.push(element.club_id);
      console.log("home myclubs >>>>>>", myclubs);
    });
    let clubInfo = [];
    myclubs.forEach(async (element) => {
      console.log("여기!!!!!!!!!!!!!>>>>>>", element);
      clubInfo.push(
        await Club.findOne({
          where: { club_id: element },
        })
      );
      console.log("home clubInfo >>>>>>", clubInfo);
    });

    res.render("home", { getClubs, clubInfo });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};
