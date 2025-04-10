// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const auth = require('./authController');


const app = express();
const port = 3000;

// ✅ 中间件
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'Super_Secret_Key',
  resave: false,
  saveUninitialized: true
}));

// ✅ 静态目录（放 login、register、home）
app.use(express.static(path.join(__dirname)));


// ✅ 接口
app.post('/api/account/login', auth.login);
app.post('/api/account/register', auth.register);
app.post('/api/account/update', auth.update); // 这个可选
app.post('/api/account/favorite/add' , auth.addFavorites);
app.post('/api/account/favorite/get', auth.getFavorites);
app.post('/api/account/like/add' , auth.addLikedMovie);
app.post('/api/account/like/get', auth.getLikedMovies);
app.post('/api/account/dislike/add', auth.addDislikedMovie);
app.post('/api/account/dislike/get', auth.getDislikedMovies);





// ✅ 启动服务器
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});


