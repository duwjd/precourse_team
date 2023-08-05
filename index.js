const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect("mongodb://0.0.0.0:27017/mongodb_prac")
    .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("몽고디비 연결 에러", err);
});
mongoose.connection.on("open", () => {
  console.log("connect : 성공");
});
module.exports = connect;