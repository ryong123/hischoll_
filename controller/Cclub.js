const {
  Club,
  Club_chat,
  Club_post,
  Club_post_comment,
  Club_post_comment_like,
  Club_schedule,
  Club_members,
  User,
  Sequelize,
} = require("../models/Index");
const { trace } = require("../routes");
const { Op, where } = require("sequelize");
const jwt = require("jsonwebtoken");
const {
  uploadMultipleSignedUrl,
  getMultipleSignedUrl,
  getSignedFile,
  deleteFile,
} = require("./../middleware/s3");

// Club
// GET /clubMain : 전체 동아리 조회
exports.getClubs = async (req, res) => {
  try {
    let link = "/home"; //홈으로 이동
    const Clubs = await Club.findAll();
    res.render("club/clubMain", { data: Clubs, title: "전체 동아리", link });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /clubDetail/:club_id : 동아리 하나 상세 조회
exports.getClub = async (req, res) => {
  try {
    let link = "/clubMain"; // 전체 클럽화면으로 이동
    const club = await Club.findOne({
      where: { club_id: req.params.club_id },
    });
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const findmember = await Club_members.findOne({
      attributes: ["isMember"],
      where: { userid_num: userid_num, club_id: req.params.club_id },
    });
    // console.log("@@@@@@@@@@@@@@", findmember);
    let isMember;
    if (!findmember) isMember = "nonApply";
    else if (findmember.dataValues.isMember == "true") isMember = "true";
    else if (findmember.dataValues.isMember == "false") isMember = "false";

    // console.log("!!!!!!!!!!!!!!!!", isMember);
    console.log("ismember >>>>>>>>>>>>>>", isMember);
    const clubNum = await Club_members.findAll({
      where: {
        userid_num: userid_num,
        isMember: "true",
      },
    });
    res.render("club/clubDetail", {
      data: club,
      isMember,
      clubNum,
      title: "동아리",
      // link,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /clubAdminMain/:club_id : 동아리 관리페이지 불러오기
exports.getClubAdminMain = async (req, res) => {
  try {
    let link = `/myclubMain/${req.params.club_id}`;
    const { club_id } = req.params;
    res.render("clubAdmin/clubAdminMain", {
      data: club_id,
      title: "관리 페이지",
      link,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /clubAdminEdit/:club_id : 동아리 수정페이지 불러오기
exports.getClubAdminEdit = async (req, res) => {
  // console.log("getClubAdminEdit", req.params);
  try {
    let link = `/clubAdminMain/${req.params.club_id}`; //클럽 관리 페이지로 이동
    const { club_id } = req.params;
    const clubAdminEditDB = await Club.findOne({
      where: { club_id: club_id },
    });
    const leaderId = await Club.findOne({
      attributes: ["leader_id"],
      where: { club_id: club_id },
    });
    const leaderName = await User.findOne({
      attributes: ["name"],
      where: { userid_num: leaderId.dataValues.leader_id },
    });
    const clubmembers = await Club_members.findAll({
      where: {
        club_id: club_id,
        isMember: "true",
      },
    });

    const clubAdminEdit = clubAdminEditDB.toJSON();
    // console.log(clubAdminEdit);

    res.render("clubAdmin/clubAdminEdit", {
      clubAdminEdit,
      leaderName,
      clubmembers,
      title: "동아리 정보 관리",
      link,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// PATCH /clubAdminEdit/:club_id : 동아리 수정
exports.patchClub = async (req, res) => {
  try {
    const { club_id } = req.params;
    const {
      club_name,
      leader_id,
      limit,
      location,
      field,
      keyword,
      description,
    } = req.body;
    const updateClub = await Club.update(
      {
        club_name,
        leader_id,
        limit,
        location,
        field,
        keyword,
        description,
      },
      {
        where: { club_id },
      }
    );
    res.send(updateClub);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DELETE /clubAdminEdit/:club_id : 동아리 삭제
exports.deleteClub = async (req, res) => {
  try {
    const { club_id } = req.params;
    const isDeleted = await Club.destroy({
      where: { club_id },
    });
    if (isDeleted) {
      res.send({ isDeleted: true });
    } else {
      res.send({ isDeleted: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /createClub : 동아리 생성
exports.getCreateClub = async (req, res) => {
  try {
    let link = "/clubMain"; // 클럽 메인 페이지로 이동
    res.render("club/createClub", { title: "동아리 개설", link });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// POST /createClub : 동아리 생성
exports.postCreateClub = async (req, res) => {
  try {
    const { club_name, limit, location, field, keyword, description } =
      req.body;
    const { userid_num } = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    const img = [
      "https://images.unsplash.com/photo-1610380860077-a300a8d1ba73?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1578667343051-ff8c81d04408?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1682140999442-e9e2a5f55be6?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1613918702390-48771f69c133?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ];
    let randomNum = Math.random() * 5;
    let randomNumFloor = Math.floor(randomNum);
    const newClub = await Club.create({
      club_name: club_name,
      leader_id: userid_num,
      limit: limit,
      location: location,
      field: field,
      keyword: keyword,
      description: description,
      club_img: img[randomNumFloor],
    });

    const newMember = await Club_members.create({
      club_id: newClub.dataValues.club_id,
      userid_num: userid_num,
      // motivation: NULL,
      // introduction:
      isMember: "true",
    });
    // console("자기소개 들어가???!!!!! >>>>>>>>>>>>", newMember);
    res.send(newClub);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

//Club_post
// GET /myclubPostMain/:club_id : 동아리 게시글 전체 조회
exports.getClubPosts = async (req, res) => {
  // console.log("Cclub js 225 getClubPosts req.params", req.params);

  try {
    let link = `/myclubMain/${req.params.club_id}`; // 해당클럽 메인페이지로 이동

    // 동아리에 사용자의 아이디가 없을 경우 403 페이지 렌더
    const { userid_num } = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

    const club_id = req.params.club_id;

    const foundClub = await Club_members.findOne({
      where: { club_id: club_id },
    });

    const posts = await Club_post.findAll({
      where: { club_id: req.params.club_id },
      order: [["createdAt", "DESC"]],
      //clubClubId 수정 전
    });

    res.render("myclub/myclubPostMain", {
      data: posts,
      club_id: req.params.club_id, // club_id를 별도로 전달
      title: "게시판",
      link,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /myclubPostDetail/:club_id/:post_id : 동아리 게시글 하나 조회
// 게시글 전달할 때, 게시글마다의 댓글과 좋아요 수 함께 전달
exports.getClubPost = async (req, res) => {
  try {
    let link = `/myclubPostMain/${req.params.club_id}`; //전체 게시물로 이동
    const { club_id, post_id } = req.params;
    // console.log("params > ", req.params);
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    let preClick = await Club_post.findOne({
      attributes: ["click"],
      where: {
        club_id: club_id,
        post_id: post_id,
      },
    });
    // console.log("preClick", typeof preClick);
    preClick = preClick.click;
    preClick = JSON.stringify(preClick);
    // console.log("preClick", typeof preClick);

    const newClick = await Club_post.update(
      {
        click: Number(preClick) + 1,
      },
      {
        where: {
          club_id: club_id,
          post_id: post_id,
        },
      }
    );

    // console.log("newClick > ", newClick);

    // 게시글
    const clubPost = await Club_post.findOne({
      attributes: [
        "post_id",
        "title",
        "content",
        "image",
        "userid_num",
        "updatedAt",
        "club_id",
        "name",
        "click",
      ],
      where: {
        club_id: club_id,
        post_id: post_id,
      },
    });
    // 게시글에 달린 댓글들
    const clubPostComment = await Club_post_comment.findAll({
      attributes: [
        "comment_id",
        "comment_name",
        "content",
        "userid_num",
        "updatedAt",
        "post_id",
      ],
      where: {
        post_id: post_id,
      },
      include: [{ model: Club_post_comment_like }],
    });

    const commentId = await Club_post_comment.findAll({
      attributes: ["comment_id"],
      where: { post_id: post_id },
    });

    let commentIdArray = [];
    await commentId.forEach((element) => {
      commentIdArray.push(element.dataValues.comment_id);
    });

    // console.log("commentIdArray >>>>>", commentIdArray);

    // 댓글마다 있는 좋아요;
    let clubPostCommentLike = [];
    for (const element of commentIdArray) {
      const like = await Club_post_comment_like.findAll({
        where: { comment_id: element },
      });
      clubPostCommentLike.push(like);
      // console.log("@@@@@ clubPostCommentLike", clubPostCommentLike);
    }

    // s3 이미지 불러오기
    console.log("Cclub 328 clubPost.image", clubPost.image);
    const postImgOrigin = clubPost.image;

    let postImages = [];

    for (i = 0; i < postImgOrigin.length; i++) {
      postImages.push(await getSignedFile(postImgOrigin[i]));
    }

    console.log("Cclub 332 postImg", postImages);

    res.render("myclub/myclubPostDetail", {
      data: clubPost,
      clubPostComment,
      clubPostCommentLike,
      commentId,
      userid_num,
      // title: clubPost.title,
      title: "게시글",
      link,
      postImages,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /myclubEditPost/:club_id/:post_id 동아리 게시글 수정 페이지 불러오기
exports.getClubEditPost = async (req, res) => {
  try {
    let link = "/mypageMain"; // 프로필에 있는 내가 쓴 글 페이지 이동으로 이동할 거기 때문에
    const { club_id, post_id } = req.params;
    const clubPost = await Club_post.findOne({
      where: { club_id: club_id, post_id: post_id },
    });

    const postImgOrigin = clubPost.image;

    let postImages = [];

    for (i = 0; i < postImgOrigin.length; i++) {
      postImages.push(await getSignedFile(postImgOrigin[i]));
    }

    res.render("myclub/myclubEditPost", {
      data: clubPost,
      title: "게시글 수정",
      link,
      postImages,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// PATCH /myclubEditPost/:club_id/:post_id  : 동아리 게시글 수정
exports.patchPost = async (req, res) => {
  try {
    const { club_id, post_id } = req.params;
    const { title, content, image } = req.body;
    const link = "/";

    const previousImage = await Club_post.findOne({
      where: {
        post_id: post_id,
      },
      attributes: ["image"],
    });

    console.log("Cclub 407 previousImage : ", previousImage);

    let imageArr = previousImage.image;

    for (i = 0; i < image.length; i++) {
      imageArr.push(image[i]);
    }

    console.log(imageArr);

    const updatePost = await Club_post.update(
      {
        title,
        content,
        image: imageArr,
      },
      {
        where: {
          club_id: club_id,
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

// DELETE /myclubEditPost/:club_id/:post_id  : 동아리 게시글 삭제
exports.deletePost = async (req, res) => {
  try {
    const { club_id, post_id } = req.params;

    const postImages = await Club_post.findOne({
      where: {
        post_id: post_id,
      },
      attributes: ["image"],
    });

    const isDeleted = await Club_post.destroy({
      where: {
        club_id: club_id,
        post_id: post_id,
      },
    });

    let isImagesDeleted = "";
    for (i = 0; i < postImages.image.length; i++) {
      isImagesDeleted = await deleteFile(postImages.image[i]);
      console.log("Cclub 426 isImagesDeleted", isImagesDeleted);
      if (!isImagesDeleted) {
        break;
      }
    }

    if (isDeleted) {
      res.send({ isDeleted: true });
    } else {
      res.send({ isDeleted: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// POST  /myclubPostDetail/:club_id/:post_id : 동아리 게시글 댓글 생성
exports.createPostComment = async (req, res) => {
  // console.log("받은 데이터:", req.body);
  try {
    const { club_id, post_id } = req.params;
    const { content } = req.body;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const getName = await User.findOne({
      attributes: ["name"],
      where: { userid_num },
    });
    const newClubPostComment = await Club_post_comment.create({
      post_id: post_id,
      comment_name: getName.dataValues.name,
      content: content,
      userid_num: userid_num,
    });

    res.send(newClubPostComment);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// PATCH /myclubPostDetail/:club_id/:post_id/:comment_id : 동아리 게시글 댓글 수정
exports.patchPostComment = async (req, res) => {
  try {
    const { comment_id, post_id, club_id } = req.params;
    const { content } = req.body;
    // console.log("댓글 수정 데이터 받음>>>>>>>>>>>>>>>>>", req.params);
    // console.log("댓글 수정 데이터 받음>>>>>>>>>>>>>>>>>", content);

    const clubPostComment = await Club_post_comment.update(
      {
        content: content,
      },
      {
        where: {
          post_id: post_id,
          comment_id: comment_id,
        },
      }
    );
    res.send(clubPostComment);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DELETE  /myclubPostDetail/:club_id/:post_id/:comment_id : 동아리 게시글 댓글 삭제
exports.deletePostComment = async (req, res) => {
  try {
    const { comment_id, post_id, club_id } = req.params;
    // console.log(req.params);
    const isDeleted = await Club_post_comment.destroy({
      where: {
        post_id: post_id,
        comment_id: comment_id,
      },
    });
    if (isDeleted) {
      res.send({ isDeleted: true });
    } else {
      res.send({ isDeleted: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// 동아리 게시글 좋아요
// POST /myclubPostDetail/:club_id/:post_id/:comment_id
exports.postClubPostCommentLike = async (req, res) => {
  try {
    const { post_id, club_id, comment_id } = req.params;
    const { userid, userid_num } = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const clubPostCommentLike = await Club_post_comment_like.create({
      comment_id: comment_id,
      likeid_num: userid_num,
    });
    res.send(clubPostCommentLike);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DELETE /myclubPostDetail/:club_id/:post_id/:comment_id/:likeid_num
exports.deleteClubPostCommentLike = async (req, res) => {
  try {
    const { club_id, post_id, comment_id, likeid_num } = req.params;
    const isDeleted = await Club_post_comment_like.destroy({
      where: {
        comment_id: comment_id,
        likeid_num: likeid_num,
      },
    });
    if (isDeleted) {
      res.send({ isDeleted: true });
    } else {
      res.send({ isDeleted: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /myclubNewPost/:club_id : 동아리 게시글 생성 페이지 불러오기
exports.getCreateClubPost = async (req, res) => {
  try {
    // 수정
    let link = `/myclubPostMain/${req.params.club_id}`;
    const { club_id } = req.params;
    res.render("myclub/myclubNewPost", {
      data: club_id,
      title: "게시글 작성",
      link,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// POST /myclubNewPost/:club_id : 동아리 게시글 생성
exports.createClubPost = async (req, res) => {
  // console.log("createClubPost 실행: clubid", req.params.club_id);

  try {
    const { club_id } = req.params;
    const { title, content, image } = req.body;
    const { userid_num } = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    // console.log(club_id, title, content, image);

    const getName = await User.findOne({
      where: { userid_num: userid_num },
    });

    // image는 json 형태로 저장
    const newPost = await Club_post.create({
      club_id: club_id,
      title: title,
      content: content,
      image: image,
      userid_num: userid_num,
      name: getName.dataValues.name,
      click: 0,
    });
    // console.log("생성 완료");
    res.send(newPost);
  } catch (error) {
    console.error(error);
    res.send("Internal Server Error!");
  }
};

// Club_schedule
// GET /myclubSchedule/:club_id : 동아리 일정 전체 조회
exports.getClubSchedules = async (req, res) => {
  try {
    let link = "/myclubMain"; // 클럽 메인페이지 이동
    const { club_id } = req.params;
    const clubSchedules = await Club_schedule.findAll({
      where: { club_id: club_id },
    });
    const date = await Club_schedule.findAll({
      order: ["date"],
      attributes: ["date"],
      where: { club_id: club_id },
    });
    let scheduleDates = [];
    date.forEach((element) => {
      scheduleDates.push(element.dataValues.date);
    });
    let scheduleDate = [...new Set(scheduleDates)];
    res.render("./myclub/myclubSchedule", {
      data: clubSchedules,
      title: "일정",
      scheduleDate,
      club_id,
      // link,
    });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// GET /myclubSchedule/:club_id/:date : 특정 날짜 동아리 일정 조회
// exports.getClubSchedule = async (req, res) => {
//   try {
//     const { club_id, date } = req.params;
//     const clubSchedule = await Club_schedule.findAll({
//       where: { club_id: club_id, date: date },
//     });
//     res.send(clubSchedule);
//   } catch (err) {
//     console.error(err);
//     res.send("Internal Server Error!");
//   }
// };

// POST /myclubSchedule/:club_id/ : 특정 날짜에 동아리 일정 추가
exports.postClubSchedule = async (req, res) => {
  try {
    const { club_id } = req.params;
    // console.log(club_id);
    const { date, time, title, content } = req.body;
    const newClubSchedule = await Club_schedule.create({
      club_id: club_id,
      date: date,
      time: time,
      title: title,
      content: content,
    });
    res.send(newClubSchedule);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// PATCH /myclubSchedule/:club_id /:schedule_id : 동아리 일정 수정
exports.patchClubSchedule = async (req, res) => {
  try {
    const { club_id, schedule_id } = req.params;
    console.log("Cclub patchClubSchedule > ", req.body);
    const { date, time, title, content } = req.body;

    const clubSchedule = await Club_schedule.update(
      {
        date: date,
        time: time,
        title: title,
        content: content,
      },
      {
        where: {
          club_id: club_id,
          schedule_id: schedule_id,
        },
      }
    );
    res.send(clubSchedule);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DELETE /myclubSchedule/:club_id/:schedule_id : 동아리 일정 삭제
exports.deleteClubSchedule = async (req, res) => {
  const { club_id, schedule_id } = req.params;
  try {
    const isDeleted = await Club_schedule.destroy({
      where: {
        club_id: club_id,
        schedule_id: schedule_id,
      },
    });
    if (isDeleted) {
      res.send({ isDeleted: true });
    } else {
      res.send({ isDeleted: false });
    }
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// Club_chat
// GET /myclubChat/:club_id : 동아리 채팅방 조회
exports.getClubChat = async (req, res) => {
  try {
    let link = "myclubMain";
    const { club_id } = req.params;
    const clubChat = await Club_chat.findAll({
      where: { club_id: club_id },
    });
    res.render("myclub/socketTest", { club_id, link });
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};
// POST /myclubChat/:club_id : 동아리 채팅방에서 채팅 보내기
exports.postClubChat = async (req, res) => {
  try {
    const { club_id } = req.params;
    const { from_name, content } = req.body;
    // 프론트에서 세션에 저장되어 있는 userid_num 값을 찾아서 from_name에 담아서 보내줌
    const from_realName = await User.findOne({
      attributes: ["name"],
      where: { userid_num: from_name },
    });
    const newClubChat = await Club_chat.create({
      club_id: club_id,
      from_name: from_realName,
      content: content,
    });
    res.send(newClubChat);
  } catch (err) {
    console.error(err);
    res.send("Internal Server Error!");
  }
};

// DELETE  동아리 채팅방 삭제 -> 동아리가 삭제될 때 채팅방도 함께 삭제

// GET /myclubList 내가 가입한 동아리 목록 페이지 불러오기
exports.getMyclubList = async (req, res) => {
  let link = "/home";
  const { userid, userid_num } = jwt.verify(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );
  const myclubs = await Club_members.findAll({
    attributes: ["club_id"],
    where: { userid_num: userid_num },
  }); // [{},{},{}]
  const { club_id1, club_id2, club_id3 } = myclubs;
  const myclubList = await Club.findAll({
    where: {
      [Sequelize.Op.or]: [
        { club_id: club_id1 },
        { club_id: club_id2 },
        { club_id: club_id3 },
      ],
    },
  });
  res.render("myclub/myclubList", {
    data: myclubList,
    title: "내 동아리",
    link,
  });
};

// GET /myclubMain/:club_id 내가 가입한 동아리의 메인 페이지 불러오기
exports.getMyclubMain = async (req, res) => {
  let link = "/home";
  // console.log(req.params);
  const { club_id } = req.params;
  // console.log(club_id);
  // console.log({ club_id });
  const { userid, userid_num } = jwt.verify(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );

  const member =[];
  const foundMemberList = await Club_members.findAll({
    where: { club_id: club_id },
  });
  for(const ele of foundMemberList){

    member.push(ele.dataValues.userid_num);
  }
  const foundMember =[];
  const school =[];
  for(const element of member){
    const userName = await User.findOne({
      where:{userid_num:element}
    })
    foundMember.push(userName.name);
    school.push(userName.school);
  }
  





  

  const clubPosts = await Club_post.findAll({
    where: {
      club_id: club_id,
    },
    attributes: [
      "title",
      "post_id",
      "content",
      "image",
      "name",
      "createdAt",
      "club_id",
    ],
    order: [["createdAt", "DESC"]],
    limit: 3,
  });

  // console.log('Cclub 854 : ', clubPosts);

  const myClub = await Club.findOne({ where: { club_id: club_id } });
  let isLeader;
  if (myClub.leader_id == userid_num) isLeader = true;
  else isLeader = false;

  const title = myClub.club_name;

  console.log("Cclub 861 title : ", myClub.club_name);

  res.render("myclub/myclubMain", {
    data: myClub,
    userid_num,
    clubPosts,
    foundMember,
    school,
    isLeader,
    link,
    title,
  });
};

// GET /clubChat
exports.clubChat = (req, res) => {
  res.render("myclub/socketTest");
};
