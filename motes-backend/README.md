# Motes 后端 API 服务

## 📖 项目简介

Motes 后端 API 服务是思维导图与笔记管理平台的核心服务层，提供 RESTful API 接口，支持用户认证、文档管理、思维导图数据存储等功能，为前端应用提供强大的数据支撑。

Motes 后端致力于提供稳定、高效、安全的 API 服务，通过 RESTful 设计原则和 JWT 认证机制，确保用户数据的安全性和系统的可扩展性。采用 MongoDB 作为数据存储，支持复杂的数据结构和高效的查询操作。

## ✨ 主要功能

### 🔐 用户认证系统
- **JWT 认证**：基于 JSON Web Token 的用户身份验证
- **密码加密**：使用 bcryptjs 进行密码安全加密
- **用户注册登录**：完整的用户注册和登录流程
- **Token 刷新**：支持访问令牌的自动刷新机制

### 📄 文档管理
- **文档 CRUD**：完整的文档创建、读取、更新、删除操作
- **用户权限控制**：基于用户身份的数据访问控制
- **文档元数据**：支持文档标题、描述、创建时间等元信息管理

### 🧠 思维导图数据
- **Mote 节点管理**：思维导图节点的增删改查操作
- **节点关系处理**：支持节点间的父子关系和连接关系
- **数据同步**：实时数据同步和一致性保证

### 🛡️ 安全特性
- **CORS 配置**：跨域资源共享的安全配置
- **请求限流**：API 请求频率限制保护
- **输入验证**：严格的数据输入验证和清理
- **错误处理**：统一的错误处理和响应格式

## 🛠 技术栈

### 核心框架
- **Node.js 18+** - JavaScript 运行时环境
- **Express.js 4.18.2** - 快速、灵活的 Node.js Web 应用框架
- **TypeScript 5.3.3** - 类型安全的 JavaScript 超集

### 数据库
- **MongoDB 8.0.3** - 文档型 NoSQL 数据库
- **Mongoose 8.0.3** - MongoDB 对象建模工具

### 认证与安全
- **JWT 9.0.2** - JSON Web Token 实现
- **bcryptjs 2.4.3** - 密码哈希加密
- **cors 2.8.5** - 跨域资源共享中间件

### 工具库
- **nanoid 5.1.5** - 唯一 ID 生成器
- **dotenv 16.3.1** - 环境变量管理
- **multer 1.4.5-lts.1** - 文件上传中间件
- **axios 1.11.0** - HTTP 客户端

### 开发工具
- **ESLint 9.32.0** - 代码质量检查
- **Prettier 3.5.3** - 代码格式化
- **ts-node 10.9.2** - TypeScript 执行环境
- **rimraf 5.0.10** - 跨平台文件删除工具

## 📁 项目结构

```
motes-backend/
├── src/
│   ├── config/           # 配置文件
│   │   ├── database.ts   # 数据库连接配置
│   │   └── defaultData.ts # 默认数据配置
│   ├── controllers/      # 控制器层
│   │   ├── userController.ts
│   │   ├── docController.ts
│   │   └── moteController.ts
│   ├── middleware/       # 中间件
│   │   └── auth.ts      # 认证中间件
│   ├── models/          # 数据模型
│   │   ├── User.ts
│   │   ├── Doc.ts
│   │   └── Mote.ts
│   ├── routes/          # 路由定义
│   │   ├── user.ts
│   │   ├── doc.ts
│   │   └── mote.ts
│   ├── services/        # 业务逻辑层
│   │   ├── userService.ts
│   │   ├── docService.ts
│   │   └── moteService.ts
│   ├── utils/           # 工具函数
│   │   ├── jwt.ts       # JWT 工具
│   │   └── idGenerator.ts # ID 生成器
│   └── app.ts          # 应用入口文件
├── .env.example        # 环境变量示例
├── eslint.config.js    # ESLint 配置
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
└── README.md          # 项目说明
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- MongoDB >= 5.0.0
- npm >= 8.0.0

### 安装依赖
```bash
cd motes-backend
npm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp env.example .env
```

2. 配置环境变量：
```bash
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/motes

# JWT配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# 跨域配置
CORS_ORIGIN=http://localhost:5173
```

### 开发模式
```bash
npm run dev
```
API 服务将在 `http://localhost:3000` 启动

### 构建生产版本
```bash
npm run build
```

### 启动生产服务
```bash
npm start
```

### 代码检查
```bash
# ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix
```

## 🔧 开发指南

### 项目架构
- **MVC 模式**：采用 Model-View-Controller 架构
- **分层设计**：Controller → Service → Model 的分层结构
- **中间件模式**：使用 Express 中间件处理通用逻辑

### API 设计规范
- **RESTful 设计**：遵循 REST API 设计原则
- **统一响应格式**：标准化的 API 响应结构
- **错误处理**：统一的错误码和错误信息

### 数据库设计
- **MongoDB 文档模型**：使用 Mongoose 进行数据建模
- **索引优化**：合理设置数据库索引提升查询性能
- **数据验证**：模型级别的数据验证和类型检查

### 安全规范
- **JWT 认证**：基于 Token 的身份验证机制
- **密码加密**：使用 bcryptjs 进行密码安全存储
- **输入验证**：严格的数据输入验证和清理
- **CORS 配置**：安全的跨域资源共享设置

## 📱 功能特性

### 用户管理
- ✅ 用户注册和登录
- ✅ JWT Token 认证
- ✅ 密码加密存储
- ✅ 用户信息管理

### 文档管理
- ✅ 文档的增删改查
- ✅ 用户权限控制
- ✅ 文档元数据管理

### 思维导图数据
- ✅ Mote 节点管理
- ✅ 节点关系处理
- ✅ 数据同步机制

### API 特性
- ✅ RESTful API 设计
- ✅ 统一响应格式
- ✅ 错误处理机制
- ✅ 请求限流保护
- ✅ CORS 跨域支持

## 🔗 API 接口

### 用户相关接口
- `POST /api/user/register` - 用户注册
- `POST /api/user/login` - 用户登录
- `POST /api/user/logout` - 用户登出
- `POST /api/user/refresh` - 刷新Token

### 文档相关接口
- `GET /api/doc/tree` - 获取文档树
- `PUT /api/doc/tree` - 更新文档树
- `POST /api/doc/node` - 创建文档节点
- `POST /api/doc/node/:key/duplicate` - 创建文档节点副本
- `PUT /api/doc/node/:key/rename` - 重命名文档节点
- `PUT /api/doc/node/:key/move` - 移动文档节点位置
- `PUT /api/doc/node/:key/delete` - 软删除文档节点
- `DELETE /api/doc/node/:key/permanent` - 硬删除文档节点
- `PUT /api/doc/node/:key/restore` - 恢复文档节点

### 思维导图相关接口
- `GET /api/mote/:docKey` - 获取脑图笔记
- `PUT /api/mote/:docKey` - 更新脑图笔记
- `GET /api/mote/:docKey/export` - 导出脑图笔记
- `POST /api/mote/import` - 导入脑图笔记

### 系统接口
- `GET /api/health` - 健康检查

## 🧪 代码质量检查

```bash
# ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 类型检查
npx tsc --noEmit
```

## 📊 性能优化

### 数据库优化
- 合理设置 MongoDB 索引
- 使用连接池管理数据库连接
- 实现数据分页查询

### API 优化
- 实现请求缓存机制
- 使用压缩中间件减少传输大小
- 实现 API 限流保护

## 🔗 相关链接

- [前端文档](../motes-frontend/README.md)
- [API 文档](../API_DOCUMENTATION.md)
- [Express.js 文档](https://expressjs.com/)
- [Mongoose 文档](https://mongoosejs.com/)
- [MongoDB 文档](https://docs.mongodb.com/)

## 📄 许可证

本项目采用 MIT 许可证。

## 🤝 贡献指南

**Motes** - Connect your motes. 
