const {
    Support
} = require("../models/Index");
const jwt = require("jsonwebtoken");

// GET /supportMain 고객센터 페이지 로드
exports.getSupport = async (req, res) => {
    try{
        const getSupport = await Support.findAll();
        res.render("/support/supportMain", getSupport);
    }
    catch (err) {
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// POST /supportMain 고객 문의 등록
exports.postSupport = async (req, res) => {
    try {
        const { userid, userid_num } = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
        const { content } = req.body
        const newSupport = await Support.create({
            userid_num: userid_num,
            content: content
        })
        res.send(newSupport,{isSuccess: true});
    }
    catch (err) {
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// PATCH /supportMain 고객 문의 답글
exports.postSupportComment = async (req,res) => {
    try{
        const {comment} = req.body;
        const postSupportComment = await Support.update({
            comment: comment
        })
        res.send(postSupportComment, {isSuccess:true});
    }
    catch (err) {
        console.error(err);
        res.send("Internal Server Error!");
    }
}

// DELETE /supportMain 문의글 삭제
exports.deleteSupport = async (req,res) => {
    try{
        const { userid, userid_num } = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
        const destroySupport = await Support.destroy({
            where:
            {
                userid_num: userid_num
            }
        })
        if (destroySupport) {
            res.send({ isDeleted: true });
        } else {
            res.send({ isDeleted: false });
        }
    }
    catch (err) {
        console.error(err);
        res.send("Internal Server Error!");
    }
}