# Motes 前端 Web 应用

## 📖 项目简介

Motes 前端是脑图笔记Web应用的用户界面层，基于 Vue 3 和 AntV X6 图形引擎构建，提供直观的思维导图编辑和便捷的大纲笔记操作功能，为用户打造流畅的知识管理体验。

Motes 前端致力于将碎片化的知识微粒连接起来，通过思维导图的视觉化展示和大纲笔记的结构化组织，帮助用户构建完整的知识网络。每个 mote（微粒）都是知识的最小单元，通过连接和组合，形成强大的知识体系。采用现代化的前端技术栈，提供流畅的用户交互体验。

## ✨ 主要功能

### 🤖 AI 智能生成
- **AI 文档生成**：基于主题、文本或文件自动生成脑图笔记
- **AI 节点扩展**：选中节点后使用 AI 自动扩展子节点
- **多模型支持**：支持 OpenAI 和 Ollama 等多种 AI 模型
- **预设配置**：内置常用模型预设，快速配置
- **文件解析**：支持 PDF、DOCX、Markdown 文件解析生成
- **实时预览**：生成成功可预览结果，确认后导入

### 🧠 思维导图
- **直观的节点连接**：基于 AntV X6 图形引擎，提供流畅的思维导图编辑体验
- **灵活的节点操作**：支持节点的添加、删除、编辑等操作
- **键盘快捷键**：丰富的快捷键支持，提升编辑效率
- **节点选择**：支持单选交互操作
- **自动布局**：智能的层次布局算法，自动排列节点位置
- **缩放控制**：支持图形缩放和平移操作

### 📝 大纲笔记
- **大纲视图**：结构化的笔记大纲，清晰展示内容层次
- **文本编辑**：支持节点文本的实时编辑和修改
- **实时同步**：与思维导图实时同步，数据一致性保证
- **滚动同步**：大纲与思维导图视图间的滚动位置同步
- **折叠展开**：支持节点的折叠和展开操作

### 🔐 用户系统
- **用户认证**：基于 JWT 的用户登录注册系统
- **数据隔离**：用户数据安全隔离，隐私保护
- **云端同步**：数据安全存储，支持多设备访问

### 💾 数据管理
- **自动保存**：支持文档的自动保存功能
- **导入导出**：支持文档的导入导出功能
- **版本控制**：文档修改状态跟踪

### 🛡️ 安全特性
- **JWT 认证**：基于 Token 的身份验证机制
- **数据验证**：前端数据输入验证和清理
- **错误处理**：统一的错误处理和用户提示
- **CORS 支持**：安全的跨域资源共享

## 🛠 技术栈

### 核心框架
- **Vue 3.5.17** - 渐进式 JavaScript 框架
- **TypeScript ~5.8.0** - 类型安全的 JavaScript 超集
- **Vite ^7.0.0** - 下一代前端构建工具

### UI 组件库
- **Ant Design Vue 4.2.6** - 企业级 UI 设计语言和 Vue 组件库
- **@ant-design/icons-vue 7.0.1** - Ant Design 图标库

### 图形引擎
- **@antv/x6 2.18.1** - 图编辑引擎
- **@antv/x6-plugin-keyboard 2.2.3** - 键盘快捷键插件
- **@antv/x6-plugin-selection 2.2.2** - 选择插件
- **@antv/hierarchy 0.6.14** - 层次布局算法

### 状态管理
- **Pinia 3.0.3** - Vue 的状态管理库

### 路由
- **Vue Router 4.5.1** - Vue.js 官方路由管理器

### 网络请求
- **Axios 1.11.0** - 基于 Promise 的 HTTP 客户端

### 工具库
- **nanoid 5.1.5** - 唯一 ID 生成器
- **jszip 3.10.1** - 文件压缩库
- **insert-css 2.0.0** - CSS 插入工具

### 开发工具
- **ESLint 9.29.0** - 代码质量检查
- **Prettier 3.5.3** - 代码格式化
- **Less 4.4.0** - CSS 预处理器

## 📁 项目结构

```
motes-frontend/
├── src/
│   ├── components/          # 组件目录
│   │   ├── layout/         # 布局组件
│   │   │   ├── AppHeader.vue      # 应用头部
│   │   │   ├── AppSidebar.vue     # 侧边栏
│   │   │   ├── AppDocGrid.vue     # 文档网格
│   │   │   ├── AppMote.vue        # 脑图笔记主组件
│   │   │   ├── AppAiGenrate.vue   # AI生成配置页面
│   │   │   ├── AiExpandModal.vue  # AI生枝配置弹窗
│   │   │   ├── DocTreeModal.vue   # 文档树选择弹窗
│   │   │   └── DocContextMenu.vue # 文档右键菜单
│   │   ├── map/           # 思维导图组件
│   │   │   ├── MapRender.vue      # 图形渲染主组件
│   │   │   ├── graphRenderer.ts   # 图形渲染逻辑
│   │   │   ├── graphEvents.ts     # 图形事件处理
│   │   │   ├── NodeCard.vue       # 节点操作卡片
│   │   │   └── NodeOperations.vue # 节点操作按钮
│   │   └── note/          # 大纲笔记组件
│   │       ├── NoteRender.vue     # 笔记渲染主组件
│   │       ├── NoteOutline.vue    # 大纲容器
│   │       ├── OutlineNode.vue    # 大纲节点
│   │       ├── ShortcutsPanel.vue # 快捷键面板
│   │       └── useNoteScroll.ts   # 滚动同步钩子
│   ├── views/             # 页面视图
│   │   ├── HomePage.vue   # 首页
│   │   ├── LoginPage.vue  # 登录页
│   │   ├── AppLayout.vue  # 应用布局
│   │   └── NotFoundPage.vue # 404页面
│   ├── stores/            # 状态管理
│   │   ├── init.ts        # 状态初始化
│   │   ├── aiStore.ts     # AI功能状态管理
│   │   ├── userStore.ts   # 用户状态管理
│   │   ├── docStore.ts    # 文档状态管理
│   │   ├── moteStore.ts   # 脑图笔记状态管理
│   │   └── mote/          # 脑图笔记子状态
│   │       ├── index.ts           # 子状态导出
│   │       ├── keyboardStore.ts   # 键盘快捷键状态
│   │       ├── nodeStateStore.ts  # 节点状态管理
│   │       ├── nodeOperationsStore.ts # 节点操作状态
│   │       ├── nodeFinderStore.ts # 节点查找状态
│   │       └── importExportStore.ts # 导入导出状态
│   ├── services/          # API 服务
│   │   ├── api.ts         # API 基础配置
│   │   ├── index.ts       # 服务导出
│   │   ├── userApi.ts     # 用户相关 API
│   │   ├── docApi.ts      # 文档相关 API
│   │   ├── moteApi.ts     # 脑图笔记相关 API
│   │   └── aiApi.ts       # AI功能相关 API
│   ├── router/            # 路由配置
│   │   └── index.ts       # 路由定义
│   ├── utils/             # 工具函数
│   │   ├── index.ts       # 工具函数导出
│   │   └── idGenerator.ts # ID 生成器
│   ├── types/             # TypeScript 类型定义
│   │   └── global.d.ts    # 全局类型定义
│   ├── styles/            # 样式文件
│   │   └── antd-overrides.less # Ant Design Vue 样式覆写
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口
├── package.json         # 项目配置
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── README.md           # 项目说明
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
cd motes-frontend
npm install
```

### 开发模式
```bash
npm run dev
```
应用将在 `http://localhost:5173` 启动

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

### 代码检查
```bash
# ESLint 检查
npm run lint

# 类型检查
npm run type-check

# 代码格式化
npm run format
```

## 🔧 开发指南

### 项目架构
- **组件化开发**：采用 Vue 3 Composition API
- **状态管理**：使用 Pinia 进行集中状态管理
- **路由管理**：基于 Vue Router 的单页应用路由
- **API 集成**：统一的 API 服务层设计

### 组件开发
- 使用 Vue 3 Composition API
- 遵循 TypeScript 类型定义
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### 状态管理
- 使用 Pinia 进行状态管理
- Store 文件放在 `src/stores/` 目录
- 按功能模块划分 Store
- 脑图笔记相关状态进一步细分为子模块

### 样式规范
- 使用 Less 预处理器
- 遵循 BEM 命名规范
- 组件样式采用 scoped 作用域

### API 集成
- API 服务放在 `src/services/` 目录
- 使用 Axios 进行 HTTP 请求
- 统一的错误处理机制

## 📱 功能特性

### AI 智能功能
- ✅ AI 文档生成（基于主题、文本、文件）
- ✅ AI 节点扩展（选中节点自动生成子节点）
- ✅ 多模型支持（OpenAI、Ollama）
- ✅ 预设配置管理
- ✅ 文件解析（PDF、DOCX、Markdown）
- ✅ 实时预览和确认
- ✅ 高级参数配置（温度、Top P等）

### 思维导图功能
- ✅ 节点创建、编辑、删除
- ✅ 键盘快捷键支持（Enter、Shift+Enter、Delete等）
- ✅ 节点选择和编辑操作
- ✅ 自动布局算法
- ✅ 缩放和平移操作
- ✅ 节点折叠展开
- ✅ 节点升级降级操作

### 大纲笔记功能
- ✅ 大纲视图展示
- ✅ 文本编辑和修改
- ✅ 实时数据同步
- ✅ 滚动位置同步
- ✅ 快捷键支持
- ✅ 节点层级管理

### 用户体验
- ✅ 响应式设计
- ✅ 现代化 UI 界面
- ✅ 流畅的交互动画
- ✅ 错误处理和用户提示
- ✅ 自动保存功能
- ✅ 视图切换（思维导图/大纲笔记）

### 数据管理
- ✅ 文档导入导出
- ✅ 自动保存机制
- ✅ 修改状态跟踪
- ✅ 云端数据同步

## ⌨️ 快捷键说明

### 脑图笔记快捷键
- **Enter**: 新增子节点
- **Shift+Enter**: 新增同级节点
- **Delete**: 删除节点
- **Alt+.**: 展开/折叠节点
- **Ctrl+Left**: 升级节点
- **Ctrl+Right**: 降级节点
- **Ctrl+Up**: 上移节点
- **Ctrl+Down**: 下移节点
- **方向键**: 移动选中节点
- **Ctrl+E**: AI生枝（扩展选中节点）

### 通用快捷键
- **Ctrl+S**: 保存文档
- **Ctrl+Z**: 撤销操作（待实现）
- **Ctrl+Y**: 重做操作（待实现）

## 🤖 AI 功能详解

### AI 文档生成
支持三种输入方式生成脑图笔记：

1. **主题生成**：输入一个主题，AI 自动生成相关的脑图笔记结构
2. **文本生成**：粘贴或输入文本内容，AI 解析并生成结构化脑图笔记
3. **文件生成**：上传 PDF、DOCX 或 Markdown 文件，AI 解析文件内容生成脑图笔记

### AI 节点扩展
在脑图笔记编辑过程中，选中任意节点后：
- 点击节点操作按钮中的"AI生枝"
- 或使用快捷键 `Ctrl+E`
- 配置 AI 模型参数
- AI 自动为选中节点生成相关的子节点

### 预设的 AI 模型

#### Ollama 本地模型
- **Qwen2:7b-instruct** - 通义千问2 7B 指令模型
- **Llama3.1:8b-instruct** - Meta Llama3.1 8B 指令模型
- **Mistral:7b-instruct** - Mistral 7B 指令模型
- **Gemma3:4b** - Google Gemma3 4B 模型

#### OpenAI 兼容模型
- **GPT-4o-mini** - OpenAI GPT-4o 迷你版
- **GPT-3.5-turbo** - OpenAI GPT-3.5 Turbo
- **DeepSeek V3** - DeepSeek Chat 模型
- **DeepSeek R1** - DeepSeek Reasoner 模型
- **Gemini 2.0 Flash** - Google Gemini 2.0 Flash 模型
- **Gemini 2.0 Flash Exp** - Google Gemini 2.0 Flash Exp 模型
- **Gemini 1.5 Flash** - Google Gemini 1.5 Flash 模型

#### 手动配置
除了预设模型外，还支持手动配置任何 OpenAI 兼容的 API 服务，包括：
- 自定义本地模型
- 第三方 AI 服务提供商
- 私有部署的模型服务

### AI 配置参数
- **温度 (Temperature)**：控制生成随机性，0-2 范围
- **Top P**：控制生成多样性，0-1 范围
- **最大 Token 数**：限制生成内容长度
- **深度限制**：控制脑图笔记层级深度
- **分支因子**：控制每个节点的子节点数量
- **语言偏好**：支持中文和英文生成

## 🧪 代码质量检查

```bash
# ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 类型检查
npm run type-check

# 代码格式化
npm run format
```

## 📊 性能优化

### 构建优化
- 使用 Vite 进行快速构建
- 代码分割和懒加载
- 静态资源优化

### 运行时优化
- Vue 3 响应式系统优化
- 组件懒加载
- 虚拟滚动（待实现）

## 🔗 相关链接

- [本项目后端文档](../motes-backend/README.md)
- [本项目 API 文档](../API_DOCUMENTATION.md)
- [Vue.js 文档](https://vuejs.org/)
- [Ant Design Vue 文档](https://antdv.com/)
- [AntV X6 文档](https://x6.antv.antgroup.com/)

**Motes** - Connect your motes.
