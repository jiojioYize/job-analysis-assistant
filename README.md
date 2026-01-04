# 智能岗位分析与规划助手

基于 [Dify](https://dify.ai) 工作流搭建的智能对话助手，帮助用户分析 AI 产品实习岗位 JD 并给出准备建议，或解答 AI 产品相关知识问题。

## ✨ 功能特性

- 🎯 **岗位 JD 分析** - 解析招聘信息中的关键要求和技能点
- 📝 **准备建议** - 针对目标岗位提供个性化的学习和面试准备建议
- 💡 **知识问答** - 解答 AI 产品领域的相关问题
- 🔄 **对话管理** - 支持多轮对话、会话历史管理
- ⏹️ **停止响应** - 支持中断 AI 回复
- 👍 **反馈系统** - 对回答进行点赞/点踩和反馈

## 🛠️ 技术栈

- **前端框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS
- **国际化**: i18next
- **AI 后端**: Dify 工作流
- **部署**: Vercel

## 🚀 快速开始

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 配置 `.env.local`：
```env
# Dify 应用 ID（在 Dify 应用详情页 URL 中获取）
NEXT_PUBLIC_APP_ID=your_app_id

# Dify API 密钥（在应用的 API 访问页面生成）
NEXT_PUBLIC_APP_KEY=your_api_key

# Dify API 地址（云服务使用 https://api.dify.ai/v1）
NEXT_PUBLIC_API_URL=https://api.dify.ai/v1
```

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

### Docker 部署

```bash
# 构建镜像
docker build . -t job-analysis-assistant:latest

# 运行容器
docker run -p 3000:3000 job-analysis-assistant:latest
```

### Vercel 部署

1. Fork 本仓库到你的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（`NEXT_PUBLIC_APP_ID`、`NEXT_PUBLIC_APP_KEY`、`NEXT_PUBLIC_API_URL`）
4. 部署完成

> ⚠️ Vercel Hobby 套餐有响应时长限制，长回复可能被截断。

## 📁 项目结构

```
├── app/
│   ├── api/          # API 路由（代理 Dify 接口）
│   └── components/   # React 组件
├── config/           # 应用配置
├── hooks/            # 自定义 Hooks
├── i18n/             # 国际化
├── service/          # API 服务层
├── types/            # TypeScript 类型定义
└── utils/            # 工具函数
```

## 📄 开源协议

本项目基于 [Dify WebApp 模板](https://github.com/langgenius/webapp-conversation) 二次开发，遵循 MIT 协议。
