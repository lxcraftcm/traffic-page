# 构建阶段
FROM node:22-alpine AS builder
WORKDIR /app

# 安装构建依赖（better-sqlite3 需要）
RUN apk add --no-cache python3 make g++

# 复制依赖文件并安装
COPY package.json package-lock.json ./
RUN npm ci

# 复制项目文件并构建
COPY . .
RUN npm run build

# 运行阶段
FROM node:22-alpine
WORKDIR /app

# 安装运行时依赖（better-sqlite3 需要）
RUN apk add --no-cache python3 make g++

# 从构建阶段复制必要文件
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/next.config.ts ./

# 复制数据库初始化脚本（运行时会自动创建数据库）
COPY --from=builder /app/db/sql ./db/sql
COPY --from=builder /app/.env ./.env

# 安装生产依赖
RUN npm ci --production

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口并启动应用
EXPOSE 3000
CMD ["npm", "start"]