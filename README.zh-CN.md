# Traffic Page 导航中心

基于 Next.js 16 和 React 19 构建的现代化、可定制的导航中心。

## 功能特性

- **统一导航中心** - 在一个地方管理和访问所有网站
- **内外网切换** - 支持内部和外部 URL 一键切换
- **自定义分类** - 创建和管理自己的网站分类
- **丰富图标支持** - Font Awesome 图标，支持自定义颜色
- **多主题支持** - 浅色和深色模式
- **国际化** - 基于 i18next 的多语言支持
- **用户认证** - 基于 JWT 的安全认证系统
- **SQLite 数据库** - 使用 better-sqlite3 本地数据存储
- **响应式设计** - 基于 Tailwind CSS 4 的精美 UI

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI 库**: React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **图标**: Font Awesome 7
- **数据库**: better-sqlite3
- **认证**: JWT (jsonwebtoken)
- **国际化**: i18next, react-i18next
- **日志**: Winston

## 快速开始

### 环境要求

- Node.js 22+
- npm、yarn 或 pnpm

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd traffic-page

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)

### 生产环境构建

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start
```

## Docker 部署

```bash
# 构建 Docker 镜像
docker build -t traffic-page .

# 运行容器
docker run -p 3000:3000 -v $(pwd)/data:/app/data traffic-page
```

## 项目结构

```
traffic-page/
├── src/
│   ├── app/              # Next.js App Router 页面和 API 路由
│   ├── components/       # React 组件
│   ├── lib/              # 工具库（认证、数据库、日志、国际化）
│   ├── providers/        # React 上下文提供者
│   ├── types/            # TypeScript 类型定义
│   └── utils/            # 工具函数
├── public/               # 静态资源
└── package.json
```

## API 路由

- `POST /api/user/register` - 用户注册
- `POST /api/user/login` - 用户登录
- `GET /api/user/userinfo` - 获取用户信息
- `GET /api/user/page` - 获取用户导航页面
- `POST /api/user/page` - 保存用户导航页面
- `GET /api/user/checkSystemInit` - 检查系统初始化状态
- `GET/POST /api/systemSetting/generalSetting` - 系统设置

## 默认分类

应用预置了以下分类：

- 快速访问
- 常用工具
- 开发工具
- 娱乐
- 操作系统
- 购物
- 知识社区
- 游戏

## 配置

### 环境变量

在根目录创建 `.env` 文件：

```env
# 数据库
DATABASE_PATH=./data/traffic.db

# JWT 密钥（请生成您自己的密钥）
JWT_SECRET=your-secret-key

# 应用配置
NODE_ENV=production
PORT=3000
```

### 数据库初始化

数据库在首次运行时自动初始化，包含以下表：

- `t_user` - 用户账户
- `t_user_page` - 用户导航页面
- `t_system_setting` - 系统设置

## 许可证

本项目采用 MIT 许可证。
