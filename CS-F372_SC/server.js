// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const auth = require('./authController'); // 自己写的认证控制器

const app = express();
const port = 3000;

// ================= 中间件 =================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'Super_Secret_Key',
  resave: false,
  saveUninitialized: true
}));

// ================= 静态资源 =================
app.use(express.static(path.join(__dirname))); // 例如 login 页面、注册页面、主页等 html

// ================= 接口注册 =================
app.post('/api/account/login', auth.login);
app.post('/api/account/register', auth.register);
app.post('/api/account/update', auth.update);

app.post('/api/account/favorite/add', auth.addFavorites);
app.post('/api/account/favorite/get', auth.getFavorites);

app.post('/api/account/like/add', auth.addLikedMovie);
app.post('/api/account/like/get', auth.getLikedMovies);

app.post('/api/account/dislike/add', auth.addDislikedMovie);
app.post('/api/account/dislike/get', auth.getDislikedMovies);




// ================= Default Webpage to jump to =================
app.get('/', (req, res) => {
  res.redirect('/Viewer/ViewerLogin/index_ViewerLogin.html');
});

// ================= 启动服务 =================
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
