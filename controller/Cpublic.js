const {
  Public_post,
  Public_post_comment,
  Public_post_comment_like,
  Dm,
  Club,
  Club_post,
  Club_members,
  User,
} = require("../models/Index");
const jwt = require("jsonwebtoken");
const { OP } = require("sequelize");
const { Sequelize } = require("sequelize");
const { isLoggedIn } = require("../middleware/loginCheck");
const { deleteFile, getSignedFile } = require("../middleware/s3");
const ClubPost = require("../models/Club_post");

// ===== publicPost =====

// GET /publicPostMain 익명 게시판 정보 가져오기
exports.getPost = async (req, res) => {
  try {
    let link = "/home"; //홈페이지 이동
    let title = "익명 게시판";

    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const Posts = await Public_post.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.render("publicPost/publicPostMain", { data: Posts, title, link });
  } catch {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /publicNewPost 게시물 생성 페이지 로드
exports.getNewPost = async (req, res) => {
  try {
    let link = "/publicPostMain"; // 익명게시판 이동
    let title = "게시글 작성";
    res.render("publicPost/publicNewPost", { title, link });
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
      attributes: ["nickname"],
    });

    const newPost = await Public_post.create({
      title: title,
      content: content,
      image: image,
      userid_num: userid_num,
      nickname: getName.nickname,
      click: 0,
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
    let link = "/publicPostMain"; // 전체 게시물로 이동
    let title = "게시글";
    const { post_id } = req.params;
    console.log(`>>>>>>>>>>>>>> ${post_id}`);
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    let preClick = await Public_post.findOne({
      attributes: ["click"],
      where: {
        post_id: post_id,
      },
    });
    // console.log("preClick", typeof preClick);
    preClick = preClick.click;
    preClick = JSON.stringify(preClick);
    // console.log("preClick", typeof preClick);

    const newClick = await Public_post.update(
      {
        click: Number(preClick) + 1,
      },
      {
        where: {
          post_id: post_id,
        },
      }
    );

    // 게시글
    const getPost = await Public_post.findOne({
      attributes: [
        "post_id",
        "title",
        "content",
        "image",
        "userid_num",
        "updatedAt",
        "nickname",
      ],
      where: {
        post_id: post_id,
      },
    });
    // 게시글에 달린 댓글들
    const getPostComment = await Public_post_comment.findAll({
      attributes: [
        "comment_id",
        "comment_nickname",
        "comment",
        "userid_num",
        "updatedAt",
        "post_id",
      ],
      where: {
        post_id: post_id,
      },
      include: [{ model: Public_post_comment_like }],
    });

    const commentId = await Public_post_comment.findAll({
      attributes: ["comment_id"],
      where: { post_id: post_id },
    });

    let commentIdArray = [];
    await commentId.forEach((element) => {
      commentIdArray.push(element.dataValues.comment_id);
    });

    console.log("commentIdArray >>>>>", commentIdArray);

    // 댓글마다 있는 좋아요;
    let getPostCommentLike = [];
    for (const element of commentIdArray) {
      const like = await Public_post_comment_like.findAll({
        where: { comment_id: element },
      });
      console.log(`like >>>>> ${like}`);
      getPostCommentLike.push(like);
      // console.log("@@@@@ clubPostCommentLike", clubPostCommentLike);
    }

    let postImages = [];

    // s3 이미지 불러오기
    if (getPost.image !== "") {
      console.log("Cclub 328 clubPost.image", getPost.image);
      const postImgOrigin = getPost.image;

      for (i = 0; i < postImgOrigin.length; i++) {
        postImages.push(await getSignedFile(postImgOrigin[i]));
      }
    }

    // console.log('Cclub 332 postImg', postImages);
    console.log(`commentLIKE >>>>>> ${getPostCommentLike}`);

    res.render("publicPost/publicPostDetail", {
      getPost,
      getPostComment,
      getPostCommentLike,
      title,
      link,
      userid_num,
      postImages,
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
    const { likeid_num } = req.body;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const publicPostCommentLike = await Public_post_comment_like.create({
      likeid_num: userid_num,
      comment_id: comment_id,
    });

    res.send(publicPostCommentLike);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// ==== 수정 ====
// GET /publicEditPost/:post_id 게시글 수정 페이지 불러오기
exports.getPublicEditPost = async (req, res) => {
  try {
    // let link = "/mypageMain"; // 프로필에 있는 내가 쓴 글 페이지 이동으로 이동할 거기 때문에
    const { post_id } = req.params;
    const post = await Public_post.findOne({
      where: { post_id: post_id },
    });
    res.render("publicPost/publicEditPost", {
      data: post,
      title: "게시글 수정",
      // link,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};
// PATCH /publicEditPost/:post_id 게시글 수정
exports.patchPublicEditPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { title, content, image } = req.body;
    const updatePost = await Public_post.update(
      {
        title,
        content,
        image,
      },
      {
        where: {
          post_id: post_id,
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
          userid_num: userid_num,
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
    const { likeid_num } = req.body;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const updatePostCommentLike = await Public_post_comment_like.update(
      {
        likeid_num: likeid_num,
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
// publicEditPost
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
        userid_num: userid_num,
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

// DELETE /publicPostDetail/:post_id/:comment_id/:userid_num
exports.deletePostCommentLike = async (req, res) => {
  try {
    const { post_id, comment_id, userid_num } = req.params;
    console.log(`>>>>>>>>>>>>>>>>>>>>> ${userid_num}`);
    console.log(`>>>>>>>>>>>>>>>>>>>>> ${post_id}`);
    console.log(`>>>>>>>>>>>>>>>>>>>>> ${comment_id}`);
    const deleteLike = await Public_post_comment_like.destroy({
      where: {
        likeid_num: userid_num,
        comment_id: comment_id,
      },
    });
    if (deleteLike) {
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
    let link = "/home"; // DM방으로 가는 경로가 여러가지 아닌가요? ex) 홈 => DM, 다른 곳에서 DM표시 클릭
    let title = "DM";
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
    res.render("support/dm", getDm, title, link);
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
    res.render("mypage/mypageProfile", { data: createDm });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /dmDetail/:note_id 채팅방 페이지 가져오기
// 채팅 방에서 title은 안주는게 깔끔할거 같아요
exports.getDmDetail = async (req, res) => {
  try {
    let link = "/dm"; //DM페이지
    const { note_id } = this.params;
    const getRoom = await Dm.findAll({
      where: {
        note_id: note_id,
      },
    });
    res.render("support/dmDetail", { data: getRoom, link });
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
    let link = "/clubAdminApplyList"; //클럽 신청자 리스트 페이지
    let title = "회원 상세페이지";
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
    // console.log("여기 봐봐 !!!>>>>>>>>>>", userInfo);
    // console.log("여기!!!!!!", getClubAdminApplyDetail);

    res.render("clubAdmin/clubAdminApplyDetail", {
      getClubAdminApplyDetail,
      userInfo,
      title,
      link,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// // GET /clubAdminTransfer 클럽 회장 위임 페이지 가져오기
// exports.getClubAdminTransfer = async (req, res) => {
//   try {
//     let link = "/clubAdminEdit"; //클럽 설정페이지
//     let title = "클럽권한 위임";
//     res.render("clubAdmin/clubAdminTransfer", title, link);
//   } catch (err) {
//     console.error(err);
//     res.send("Internal Server Error!");
//   }
// };

// GET /clubAdminTransfer/:club_id 클럽 회장 위임페이지 회원 전체 조회
exports.getAllMembers = async (req, res) => {
  try {
    let link = `/clubAdminEdit/${req.params.club_id}`; //클럽 설정 페이지

    let title = "클럽권한 위임";
    const { club_id } = req.params;

    const getleader = await Club.findOne({
      attributes: ["leader_id"],
      where: {
        club_id: club_id,
      },
    });

    const getAllMembersShow = await Club_members.findAll({
      where: {
        club_id: club_id,
        isMember: "true",
        userid_num: {
          [Sequelize.Op.not]: getleader.leader_id,
        },
      },
    });
    console.log(
      "Cpublic getAllMembers getAllMembersShow >>>>",
      getAllMembersShow
    );

    // 회원 전체 조회
    const getusers = await Club_members.findAll({
      attributes: ["userid_num"],
      where: {
        club_id: club_id,
        isMember: "true",
        userid_num: {
          [Sequelize.Op.not]: getleader.leader_id,
        },
      },
    });

    let getusersid = [];
    getusers.forEach((element) => {
      getusersid.push(element.dataValues.userid_num);
    });
    let userInfo = [];

    for (const element of getusersid) {
      // console.log(element);
      let info = await User.findOne({ where: { userid_num: element } });
      userInfo.push(info.name);
      // console.log("클럽 멤버 이름조회 >>>>>>>>>>>>>", userInfo);
      // console.log("getUserInfo까지 실행 완료");
    }
    await res.render("clubAdmin/clubAdminTransfer", {
      data: getAllMembersShow,
      userInfo,
      club_id,
      title,
      link,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// PATCH /clubAdminTransfer/:club_id 신청 거절
exports.updateClubAdminTransfer = async (req, res) => {
  try {
    const { club_id, userid_num } = req.params;

    const updateLeader = await Club.update(
      {
        leader_id: userid_num,
      },
      {
        where: {
          club_id: club_id,
        },
      }
    );
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

// GET /clubApply/:club_id 동아리 신청페이지
exports.clubApply = async (req, res) => {
  try {
    let link = "/clubMain"; // 전체 클럽 페이지
    let title = "동아리 신청";
    const { club_id } = req.params;
    // console.log(club_id);
    res.render("club/clubApply", { data: club_id, title, link });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// POST /clubApply/:club_id 동아리 신청 정보 전달
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

// PATCH /clubAdminApplyDetail/:club_id/:userid_num 동아리 가입 신청
exports.createClubMembers = async (req, res) => {
  try {
    let isApplySuccess;
    const { club_id, userid_num } = req.params;
    const { motivation, introduction, applyResult } = req.body;
    if (applyResult) {
      const newMembers = await Club_members.update(
        {
          isMember: "true",
        },
        {
          where: {
            club_id: club_id,
            userid_num: userid_num,
          },
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
    let link = `/clubAdminMain/${req.params.club_id}`; //클럽 관리자 페이지
    let title = "동아리 신청자";
    const { club_id } = req.params;

    const getApplyList = await Club_members.findAll({
      where: {
        club_id: club_id,
        isMember: "false",
      },
    });

    // console.log(
    //   "Cpublic.js 625 getClubMembersApplyList getApplyList 실행 완료",
    //   getApplyList
    // );

    const getusers = await Club_members.findAll({
      attributes: ["userid_num"],
      where: {
        club_id: club_id,
        isMember: "false",
      },
    });

    let getusersid = [];
    for (const element of getusers) {
      getusersid.push(element.dataValues.userid_num);
    }

    let userInfo = [];
    for (const element of getusersid) {
      let info = await User.findOne({ where: { userid_num: element } });
      userInfo.push(info.name);
    }
    res.render("clubAdmin/clubAdminApplyList", {
      getApplyList,
      userInfo,
      club_id: club_id,
      title,
      link,
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
    let link = `/clubAdminMain/${req.params.club_id}`; // 클럽 관리자 페이지
    let title = "동아리 전체 회원";
    const { club_id } = req.params;
    const getMembers = await Club_members.findAll({
      where: {
        club_id: club_id,
        isMember: "true",
      },
    });

    const getUsers = await Club_members.findAll({
      attributes: ["userid_num"],
      where: {
        club_id: club_id,
        isMember: "true",
      },
    });
    let getUserInfo = [];
    // getUsers에서 가져온 클럽에 속한 유저 userid_num 값들을 forEach문으로
    getUsers.forEach((element) => {
      getUserInfo.push(element.dataValues.userid_num);
    });

    let userInfo = [];
    for (const element of getUserInfo) {
      // console.log(element);
      let info = await User.findOne({ where: { userid_num: element } });
      userInfo.push(info.name);
      console.log("클럽 멤버 이름조회 >>>>>>>>>>>>>", userInfo);
      console.log("getUserInfo까지 실행 완료");
    }
    if (!getMembers) {
      res.render("clubAdmin/clubAdminMemberlist");
    } else {
      res.render("clubAdmin/clubAdminMemberlist", {
        data: getMembers,
        userInfo,
        club_id,
        title,
        link,
      });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /clubAdminMemberDetail/:club_id/:userid_num 회원 상세정보 보기
exports.getClubMember = async (req, res) => {
  try {
    let link = `/clubAdminMemberList/${req.params.club_id}`; // 클럽 회원 전체 리스트 페이지로 이동

    let title = "동아리 부원 정보";
    const { club_id, userid_num } = req.params;
    const getMember = await Club_members.findOne({
      where: {
        club_id: club_id,
        userid_num: userid_num,
        isMember: "true",
      },
      // include: [{ model: User }],
    });
    const userInfo = await User.findOne({
      attributes: ["name", "nickname", "school", "profile_img"],
      where: {
        userid_num: userid_num,
      },
    });

    res.render("clubAdmin/clubAdminMemberDetail", {
      data: getMember,
      userInfo,
      club_id,
      title,
      link,
    });
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
    let Leader;
    let Leader2;
    let Leader3;

    link = "/home"; //홈으로 이동
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // console.log("Cpublic userid_num", userid_num);

    const myPageMain = await User.findOne({
      where: {
        userid: userid,
      },
    });

    // 탈퇴전 동아리 리더인지 아닌지 체크

    // 해당 유저가 가지고 있는 모든 Club_id를 가지고 온다.
    const getClubId = await Club_members.findAll({
      attributes: ["club_id"],
      where: {
        userid_num: userid_num,
      },
    });

    let clubs = [];
    for (const element of getClubId) {
      clubs.push(element.dataValues.club_id);
    }
    const [club1, club2, club3] = clubs;

    // 구조분해한 변수로 leader_id를 가지고 있는지 찾는다.

    let getLeaderid1;
    let getLeaderid2;
    let getLeaderid3;

    if (club1 !== undefined) {
      getLeaderid1 = await Club.findOne({
        attributes: ["leader_id"],
        where: {
          club_id: club1,
        },
      });
    }

    if (club2 !== undefined) {
      getLeaderid2 = await Club.findOne({
        attributes: ["leader_id"],
        where: {
          club_id: club2,
        },
      });
    }

    if (club3 !== undefined) {
      getLeaderid3 = await Club.findOne({
        attributes: ["leader_id"],
        where: {
          club_id: club3,
        },
      });
    }

    if (getLeaderid1 == undefined) {
      Leader = false;
    } else if (getLeaderid1.leader_id == userid_num) {
      Leader = true;
    }

    if (getLeaderid2 == undefined) {
      Leader2 = false;
    } else if (getLeaderid2.leader_id == userid_num) {
      Leader2 = true;
    }

    if (getLeaderid3 == undefined) {
      Leader3 = false;
    } else if (getLeaderid3.leader_id == userid_num) {
      Leader3 = true;
    }

    res.render("mypage/mypageMain", {
      data: myPageMain,
      link,
      Leader,
      Leader2,
      Leader3,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DELETE /mypageMain/
exports.deleteMyID = async (req, res) => {
  console.log("Cpublic 954 deleteMyID 실행");
  try {
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const profileImg = await User.findOne({
      where: {
        userid_num: userid_num,
      },
      attributes: ["profile_img"],
    });

    console.log("Cpublic 969 profileImg", profileImg.profile_img);

    if (profileImg.profile_img !== "") {
      const isDeleted = await deleteFile(profileImg.profile_img);
    }

    if (isDeleted) {
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
    } else {
      console.error("S3 이미지 삭제 실패");
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// PATCH /mypageMain //마이페이지 수정
exports.updateMyPageMain = async (req, res) => {
  // console.log('Cpublic 999 updateMyPageMain 호출');
  try {
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const { name, school, phone, birthday, profile_img, grade, classid } =
      req.body;

    if (profile_img) {
      // 기존에 테이블에 있던 S3의 이미지 삭제 명령
      const extProfileImg = await User.findOne({
        where: {
          userid_num: userid_num,
        },
      });
      // console.log('Cpublic 1015 찾은 프로필 이미지 : ', extProfileImg, extProfileImg.profile_img);

      if (extProfileImg.profile_img) {
        deleteFile(extProfileImg.profile_img);
      }
    }

    const update = await User.update(
      {
        name: name,
        school: school,
        phone: phone,
        profile_img: profile_img,
        birthday: birthday,
        grade: grade,
        classid: classid,
      },
      {
        where: {
          userid_num: userid_num,
        },
      }
    );
    if (update) {
      res.send({ isUpdated: true, msg: "프로필 수정 완료" });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// // PATCH /mypageMainProfile // 프로필 사진 수정
// exports.updateMyPageProfileImg = async(req, res) => {
//   try {

//   } catch(err) {
//     console.error(err);
//     res.send("Internal Server Error!");
//   }
// }

// GET /mypageMainProfile/:nickname 내 페이지 가져오기 ver.닉네임
exports.getMyPageProfile = async (req, res) => {
  try {
    let link = "/publicPostMain"; // 익명게시판에서 사용자의 프로필로 이동하는 것이기 때문에? 잘 모르겠네요,,
    const { nickname } = req.params;

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

    const room = [getName.dataValues.nickname, nickname].sort();

    // console.log('Cpublic 1042 nickname :', nickname)
    const myPageMainProfile = await User.findOne({
      where: {
        nickname: nickname,
      },
    });

    const clubProfile = await Club_members.findOne({
      where: {
        userid_num: myPageMainProfile.userid_num,
      },
    });

    // console.log('Cpublic 1056 : ', myPageMainProfile.profile_img);
    if (myPageMainProfile.profile_img == "") {
      console.log("프로필 사진 없다");
    }

    if (myPageMainProfile.profile_img == "") {
      return res.render("mypage/mypageProfile", {
        data: myPageMainProfile,
        clubProfile,
        profileImg: null,
        room,
        userid_num,
        nickname,
      });
    } else {
      console.log("Cpublic 1123 myPageMainProfile :", myPageMainProfile);
      const profileImgOrigin = myPageMainProfile.profile_img;
      console.log("Cpublic 1123 profileImgOrigin :", profileImgOrigin);
      const profileImg = await getSignedFile(profileImgOrigin);
      console.log("getMyPageProfile ", nickname);

      return res.render("mypage/mypageProfile", {
        data: myPageMainProfile,
        clubProfile,
        profileImg,
        room,
        userid_num,
        nickname,
      });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// =============== HOME =================
// GET /home 전체 동아리, 유저아이디가 가입되어있는 동아리 정보 로드
exports.home = async (req, res) => {
  try {
    let title = "홈";
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const myclubs = await Club_members.findAll({
      where: {
        userid_num: userid_num,
        isMember: "true",
      },
    });
    let myclubList = [];
    for (let i = 0; i < myclubs.length; i++) {
      myclubList.push(myclubs[i].club_id);
    }
    console.log("Cpublic home myclubList >>> ", myclubList);

    const clubPosts = await Club_post.findAll({
      where: { club_id: myclubList },
      order: [["click", "DESC"]],
      limit: 3,
    });
    console.log("clubPosts", clubPosts);

    const publicPostImg = await Public_post.findAll({
      attributes: ["image"],
    });

    const recommendClub = await Club.findAll({
      order: [Sequelize.literal("rand()")],
      limit: 6,
    });

    const publicPosts = await Public_post.findAll({
      order: [["click", "DESC"]],
      limit: 6,
    });

    // console.log("recommendClub>>>>>>>>", recommendClub);

    /*
    const foundUser = await User.findOne({
      where: {
        userid: userid,
      },
    });

    // console.log("myclubList >>>>>>", myclubList);

    // let myclubs = [];
    myclubList.forEach((element) => {
      // console.log("여기!!!!!!!!!!!!!>>>>>>", element.club_id);
      myclubs.push(element.club_id);
      // console.log("home myclubs >>>>>>", myclubs);
    });

    let clubInfo = [];
    for (const element of myclubs) {
      const club = await Club.findOne({
        where: { club_id: element },
      });
      clubInfo.push(club);
      // console.log("home clubInfo >>>>>>", clubInfo);
    }

    // console.log("home clubInfo 내가 가입한 동아리 >>>>>>", clubInfo);
    // console.log("home getClubs 전체 동아리 >>>>>>", getClubs);
    */

    await res.render("home", {
      myclubs,
      clubPosts,
      publicPostImg,
      recommendClub,
      publicPosts,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /chatList
exports.getChatList = async (req, res) => {
  const { userid, userid_num } = jwt.verify(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );

  const myname = await User.findOne({
    attributes: ["nickname"],
    where: {
      userid_num: userid_num,
    },
  });

  // const findMyChat = await Dm.findAll({
  //   attributes: ["room_name"],
  //   where: {
  //     [Sequelize.Op.like]: `${myname}`,
  //   },
  // });
  // console.log(findMyChat);

  res.render("chatList")
};
