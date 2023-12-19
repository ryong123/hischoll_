const{
    Public_post,
    Public_post_comment,
    Public_post_comment_like,
    Dm,
    Club_members,
    Club_members_wait,
    User
} = require('../models/Index');

// ===== publicPost =====

// GET /publicPostMain 익명 게시판 정보 가져오기
exports.getPost = async (req,res) =>{
    try{
        const Posts = await Public_post.findAll();
        res.render('/publicPost/publicPostMain', {data: Posts});
    }
    catch{
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// GET /publicNewPost 게시물 생성 페이지 로드
exports.getNewPost = async (req, res) => {
    try{
        res.render("/publicPost/publicNewPost");
    }
    catch{
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// POST /publicNewPost/:userid_num 게시물 생성
// POST /publicNewPost
exports.createPost = async (req,res) =>{
    try{
        // const {userid_num} = req.params.userid_num;
        const { 
            title,
            content,
            image,
            userid_num
        } = req.body;
        const newPost = await Public_post.create({
            title: title,
            content: content,
            image: image,
            userid_num: userid_num,
        })
        res.send(newPost)
    }
    catch(err){
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// GET /publicPostDetail/:post_id 특정 게시물 조회
exports.getPostDetail = async (req,res) =>{
    try{
        const {post_id} = req.params.post_id;
        const getPost = await Public_post.findOne({
            where:{post_id: post_id}
        });
        const getPostComment = await Public_post_comment.findAll({
            where:{post_id: post_id}
        });
        const getPostCommentLike = await Public_post_comment_like.findAll({
            where: {post_id: post_id}
        })
        res.render("/publicPost/publicPostDetail",{data: getPost, getPostComment, getPostCommentLike});
    }
    catch(err){
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// POST //publicPostDetail/:post_id 특정 게시글 댓글 작성
exports.createPostComment = async (req,res) => {
    try{
        const {post_id} = req.params.post_id;
        const {comment, comment_nickname, userid_num} = req.body;
        // content_nickname은 세션이름으로 받을까요?
        const newPublicPostComment = await Public_post_comment.create({
            comment: comment,
            comment_nickname : comment_nickname,
            post_id: post_id,
            userid_num: userid_num
            // userid_num 처리는 어떻게 해야할지
        })
        res.send(newPublicPostComment);
    }
    catch(err){
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// POST /publicPostDetail/:post_id/:comment_id 특정 댓글 좋아요
exports.createPostCommentLike = async (req,res) =>{
    try{
        const {post_id, comment_id} = req.params;
        const {like_id} = req.body;
        const publicPostCommentLike = await Public_post_comment_like.create({
            like_id : like_id,
            post_id: post_id,
            comment_id: comment_id
        })
        res.send(publicPostCommentLike)
    }
    catch(err){
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// ==== 수정 ====
// PATCH /publicPostDetail/:post_id 게시글 수정
exports.patchPost = async (req,res) => {
    try{
        const {post_id} = req.params.post_id;
        const { 
            title,
            content,
            image,
            userid_num
        } = req.body;
        const updatePost = await Public_post.update({
            title: title,
            content: content,
            image:image
        },{
            where:{
                post_id: post_id,
                userid_num: userid_num
            }
        }
        )
        res.send(updatePost);
    }
    catch(err){
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// PATCH /publicPostDetail/:post_id/:comment_id 특정 게시글 댓글 수정
exports.patchPostComment = async (req,res) =>{
    try{
        const {post_id, comment_id} = req.params;
        const {comment, userid_num} = req.body;
        if(req.session.id === userid_num){
            const updatePostComment = await Public_post_comment.update({
                comment: comment,
            },
            {
                where:{
                    comment_id: comment_id,
                    post_id: post_id
                }
            })
            res.send(updatePostComment)
        }
    }
    catch(err){
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// PATCH /publicPostDetail/:post_id/:comment_id 특정 개시물 댓글 라이크 수정
exports.patchPostCommentLike = async (req,res) =>{
    try{
        const {post_id, comment_id} = req.params;
        const {like_id, userid_num} = req.body;
        // 세션과 userid를 비교해서 맞으면 수정
        if(req.session.id === userid_num ){
            const updatePostCommentLike = await Public_post_comment_like.update({
                like_id: like_id,
            },{
                where:{
                    post_id: post_id,
                    comment_id: comment_id
                }
            })
            res.send(updatePostCommentLike)
        }
    }catch(err){
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// ==== 삭제 =====
// DELETE /publicPostDetail/:post_id 특정 게시물 삭제
exports.deletePost = async (req,res) => {
    try{
        const {post_id} = req.params.post_id;
        const {userid_num} = req.body;
        if(req.session.id === userid_num){
            const deletePost = await Public_post.destroy({
                where:{
                    post_id: post_id
                }
            })
            if(deletePost){
                res.send({isDeleted:true});
            }else {
                res.send({isDeleted:false});
            }
        }
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// DELETE /publicPostDetail/:post_id/:comment_id 특정 게시물 댓글 삭제
exports.deletePostComment = async (req,res) =>{
    try{
        const {post_id, comment_id} = req.params;
        const {userid_num} = req.body;
        if(req.session.id === userid_num){
            const deletePostComment = await Public_post_comment.destroy({
                where:{
                    post_id: post_id,
                    comment_id: comment_id
                }
            })
            if(deletePostComment){
                res.send({isDeleted:true});
            }else{
                res.send({isDeleted:false});
            }
        }
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// DM
// GET /dm => dm 가져오기
exports.dm = async (req,res) =>{
    try{
        const {userid_num, nickname} = req.body
        const getDm = await Dm.findAll({
            where:{
                [Sequelize.Op.or]: [{to_nickname: nickname}, {userid_num : userid_num}]
            }
        })
        res.render("/support/dm",getDm);
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// GET /dmDetail 채팅방 페이지 가져오기
exports.getDmDetail = async (req,res) => {
    try{
        res.render("/support/dmDetail");
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// POST /dmDetail
exports.postDm = async (req,res) =>{
    try{
        // const {userid_num} = req.params.userid_num;
        const {to_nickname, dm_content, userid_num} = req.body
        const sendDm = await Dm.create({
            to_nickname: to_nickname,
            dm_content: dm_content,
            userid_num: userid_num
        })
        res.send(sendDm);
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// DELETE /dm => dm 삭제
exports.deleteDm = async (req,res) =>{
    try{
        // const {userid_num} = req.params.userid_num;
        const {userid_num} = req.body;
        if(req.session.id === userid_num){
            const destroyDm = await Dm.destroy({
                where: note_id
            })
            if(destroyDm){
                res.send({isDeleted:true});
            }else {
                res.send({isDeleted:false});
            }
        }
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// ======= 동아리 회원 =======

// GET /clubAdminMemberlist/:club_id 회원 전체 조회
exports.getClubMembers = async (req,res) => {
    try{
        const {club_id} = req.params.club_id;
        const getMembers = await Club_members.findAll({
            where:{
                club_id: club_id
            }
        })
        res.render("clubAdmin/clubAdminMemberlist",{data: getMembers});
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// GET /clubAdminMemberDetail/:club_id 회원 상세정보 보기
exports.getClubMember = async (req,res) => {
    try{
        const {club_id} = req.params.club_id;
        const {userid_num} = req.body;
        const getMember = await Club_members.findOne({
            where:{
                club_id: club_id,
                userid_num: userid_num
            }
        })
        res.render("clubAdmin/clubAdminMemberDetail",{data: getMember});
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// GET /clubAdminApplyDetail 동아리 페이지 불러오기
exports.getClubAdminApplyDetail = async (req,res) =>{
    try{
        res.render("clubAdmin/clubAdminApplyDetail");
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// POST /clubAdminApplyDetail/:club_id 동아리 가입 신청
exports.createClubMembers = async (req,res) =>{
    try{
        // const {userid_num} = req.params.userid_num;
        const {club_id} = req.params.club_id;
        const {
            motivation,
            introduction,
            userid_num
        } = req.body;
        const newMembers = await Club_members_wait.create({
            club_id: club_id,
            motivation: motivation,
            introduction: introduction,
            userid_num: userid_num,
            include:[{model: User, attributes:['name']}]
        })
        res.send(newMembers);
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// GET /clubAdminApplyList/:club_id 클럽에 가입신청한 사람들 전체조회
exports.getClubMembersApplyList = async (req,res) => {
    try{
        const {club_id} =req.params.club_id;
        const getApplyList = await Club_members_wait.findAll({
            where:{
                club_id: club_id
            }
        })
        res.render("clubAdmin/clubAdminApplyList",{data: getApplyList});
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// DELETE /clubAdminApplyList/:club_id 클럽 가입 거절
exports.deleteMembersApplyList = async (req,res) =>{
    try{
        const {club_id} = req.params.userid_num;
        const {userid_num} = req.body
        const destroyMembersApplyList = await Club_members_wait.destroy({
            where:{
                userid_num:userid_num,
                club_id: club_id,
            }
        })
        if(destroyMembersApplyList){
            res.send({isDeleted:true});
        }else {
            res.send({isDeleted:false});
        } 
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// Delete /clubAdminMemberDetail 추방
exports.deleteMembers = async (req,res) =>{
    try{
        // 삭제 버튼클릭시 값이 넘어온다.
        const{userid_num} = req.body;
        if(req.session.id === userid_num){
            const destroyMembers = await Club_members.destroy({
                where: userid_num
            })
            if(destroyMembers){
                res.send({isDeleted:true});
            }else {
                res.send({isDeleted:false});
            }    
        }
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// GET /clubAdminTransfer 클럽 회장 위임 페이지 가져오기
exports.getClubAdminTransfer = async (req,res) =>{
    try{
        res.render("clubAdmin/clubAdminTransfer");
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// GET /clubAdminTransfer/:club_id 클럽 회장 위임페이지 회원 전체 조회
exports.getAllMembers = async (req,res) => {
    try {
        const {club_id} = req.params.club_id;
        const getAllMembersShow = await Club_members.findAll({
            where:{
                club_id: club_id
            }
        })
        res.render("clubAdmin/clubAdminTransfer",{data: getAllMembersShow});
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}

// DELETE /clubAdminTransfer/:club_id 신청 거절
exports.deleteClubAdminTransfer = async (req,res) => {
    try{
        const {club_id} = req.params.club_id;
        const {userid_num} = req.body;
        const deleteMember = await Club_members.destroy({
            where:{
                club_id: club_id,
                userid_num: userid_num
            }
        }) 
        if(deleteMember){
            res.send({isDeleted:true});
        }else {
            res.send({isDeleted:false});
        } 
    }
    catch(err){
        nsole.error(err);
        res.send("Internal Server Error!");
    }
}
