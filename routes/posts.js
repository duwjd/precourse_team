const express = require('express');
const router = express.Router();
const Post = require('../post');

// 새로운 게시글 작성
router.post('/', async (req, res) => {
    const { title, author, content, image, password } = req.body;

    try {
        await Post.create({ title, author, content, image, password })
        res.status(201).json({ message: "게시글을 생성하였습니다.", });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//게시글 조회
router.get('/', async (req, res) => {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.status(200).json({
        "data": posts
    })
});

// 게시글 수정
router.put('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const { password, title, content } = req.body;

        if (!password || !title || !content) {
            return res.status(400).json({
                message: "데이터 형식이 올바르지 않습니다."
            })
        }

        const existsPost = await Post.findOne({ _id: postId });

        if (!existsPost) {
            return res.status(404).json({
                message: "주어진 ID에 해당하는 게시물을 찾을 수 없습니다."
            });
        }

        if (existsPost.password === password) {
            await Post.updateOne({ _id: postId }, { $set: { title: title, content: content } });
            res.status(200).json({
                message: "게시물이 성공적으로 수정되었습니다."
            });
        } else {
            console.log("Password mismatch");
            res.status(401).json({
                message: "비밀번호가 일치하지 않습니다. 게시물을 편집할 수 없습니다."
            });
        }
    } catch (err) {
        res.status(404).json({
            message: "게시글 조회에 실패하였습니다."
        });
    }
});
// 게시글 삭제
router.delete('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "비밀번호를 입력해주세요."
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: '해당 게시물을 찾을 수 없습니다.' });
        }

        if (post.password === password) {
            await Post.deleteOne({ _id: postId });
            res.json({ message: '게시물이 삭제되었습니다.' });
        } else {
            res.status(401).json({ message: '비밀번호가 일치하지 않습니다. 게시물을 삭제할 수 없습니다.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 특정 게시글 조회
router.get('/:id', getPost, (req, res) => {
    res.json(res.post);
});
// 특정 게시물의 댓글 조회
router.get('/:id/comments', getPost, (req, res) => {
    try {
        const post = res.post;
        const comments = post.comments; // 게시물에서 댓글 배열 추출
        
        res.status(200).json(comments); // 댓글 반환
    } catch (error) {
        res.status(500).json({ message: "댓글을 불러오는 중에 오류가 발생했습니다." });
    }
});

// 포스트에 댓글을 작성하는 라우트 핸들러
router.post('/:id/comments', getPost, async (req, res) => {
    const { author, content, password } = req.body;

    // 필수 필드인 작성자, 내용, 비밀번호가 비어있는지 검사
    if (!author || !content || !password) {
        return res.status(400).json({
            message: "작성자, 내용 및 비밀번호는 필수 입력 사항입니다."
        });
    }

    try {
        const post = res.post;

        // 새로운 댓글 객체 생성
        const comment = {
            author: author,           // 댓글 작성자
            content: content,         // 댓글 내용
            password: password       // 댓글 비밀번호
        };

        // 포스트의 댓글 목록에 새로운 댓글 추가
        post.comments.push(comment);

        // 변경된 내용을 저장
        await post.save();

        // 새로 작성한 댓글을 응답으로 반환
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: "댓글을 저장하는 도중에 오류가 발생하였습니다." });
    }
});
// 댓글 수정
router.put('/:id/comments/:commentId', getPost, async (req, res) => {
    const commentId = req.params.commentId;
    const updatedContent = req.body.content;
    const password = req.body.password; // 비밀번호 가져오기

    try {
        const comment = res.post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: '해당 댓글을 찾을 수 없습니다.' });
        }
    
        if (comment.password !== password) { // 가져온 비밀번호 사용
            return res.status(401).json({ message: '비밀번호가 일치하지 않아 댓글을 수정할 수 없습니다.' });
        }
    
        comment.content = updatedContent;
        await res.post.save();
        res.json({ message: '댓글이 수정되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 댓글 삭제
router.delete('/:id/comments/:commentId', getPost, async (req, res) => {
    const commentId = req.params.commentId;

    try {
        const post = res.post; // 게시물 가져오기
        const comment = post.comments.id(commentId); // 해당 댓글 가져오기
        
        if (!comment) {
            return res.status(404).json({ message: '해당 댓글을 찾을 수 없습니다.' });
        }
        
        if (comment.password !== req.body.password) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않아 댓글을 삭제할 수 없습니다.' });
        }
        
        post.comments.pull(commentId); // 해당 댓글을 배열에서 삭제
        await post.save(); // 부모 문서(게시물) 저장하여 변경 반영
        res.json({ message: '댓글이 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




// 게시글 조회 미들웨어
async function getPost(req, res, next) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
        }
        res.post = post;
        next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = router;
