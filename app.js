const express = require('express');
const mongoose = require('mongoose');
const Post = require('./post');
const postsRouter = require('./routes/posts');
const app = express();
const port = 3000;
const connect = require("./index");
connect();


app.use(express.json());
app.use('/posts', postsRouter);
// Create a new guestbook post



// ... Update and delete routes similar to the previous example

app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});


