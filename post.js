const { string } = require('joi');
const mongoose = require('mongoose');

// 게시글과 댓글을 위한 데이터 스키마 정의
// 게시글 스키마 생성
const commentSchema = new mongoose.Schema({
    author: String,   // 댓글 작성자
    content: String,  // 댓글 내용
    date: Date   , // 댓글 작성일
    password: String       // 댓글 비밀번호 (추가한 부분)
});
const postSchema = new mongoose.Schema({
    title: String,         // 게시글 제목
    content: String,       // 게시글 내용
    author: String,        // 게시글 작성자
    password: String,      // 게시글 비밀번호
    date: Date,            // 게시글 작성일
    image: String,         // 게시글 이미지 URL
    comments: [commentSchema]  // 게시글 댓글 배열
});
// 스키마를 기반으로 게시글 모델 생성
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
