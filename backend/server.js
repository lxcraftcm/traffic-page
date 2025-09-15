const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

// 托管静态资源（前端文件）
app.use(express.static(path.join(__dirname, '../public')));

// 键值对数据文件路径
const DATA_FILE = path.join(__dirname, 'data.txt');

// 中间件配置
app.use(express.json());

// 允许同源访问（前后端整合后无需跨域）
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 开发时可保留
    next();
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log(`前端页面访问：http://localhost:${port}/index.html`);
});
