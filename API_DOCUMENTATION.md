# Motes API 文档

## 概述

Motes 是一个思维导图/大纲笔记应用，提供用户管理、文档管理和脑图笔记编辑功能。本文档描述了后端API接口规范。

## 技术栈

- **后端框架**: Express.js + TypeScript
- **数据库**: MongoDB
- **认证**: JWT
- **数据验证**: Joi/Zod

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token
- **数据格式**: JSON

## 健康检查接口

### 服务健康检查
```http
GET /api/health
```

**响应**:
```json
{
  "success": true,
  "message": "Motes API 服务运行正常",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 数据模型

### 用户模型 (User)
```typescript
interface User {
  _id: string;           // MongoDB ObjectId
  username: string;      // 用户名，唯一
  email: string;         // 邮箱，唯一
  password: string;      // 加密后的密码
  createdAt: Date;       // 创建时间
  updatedAt: Date;       // 更新时间
}
```

### 文档模型 (Doc)
```typescript
interface DocNode {
  key: string;           // 节点唯一标识
  title: string;         // 节点标题
  type: 'folder' | 'mote'; // 节点类型：文件夹或笔记
  isDeleted?: boolean;   // 是否已删除（软删除）
  children?: DocNode[];  // 子节点数组
}

interface Doc {
  _id: string;           // MongoDB ObjectId
  userId: string;        // 所属用户ID
  docTree: DocNode;      // 整个文档树，根节点的key为userId
  createdAt: Date;       // 创建时间
  updatedAt: Date;       // 更新时间
}
```

### 脑图笔记模型 (Mote)
```typescript
interface MoteNode {
  id: string;            // 节点唯一标识
  text: string;          // 节点文本内容
  collapsed: boolean;    // 是否折叠
  parentId: string;      // 父节点ID，根节点为空字符串
  children?: MoteNode[]; // 子节点数组
}

interface Mote {
  _id: string;           // MongoDB ObjectId
  docId: string;         // 对应的文档节点key
  moteTree: MoteNode;    // 整个脑图树，根节点的id为docId
  createdAt: Date;       // 创建时间
  updatedAt: Date;       // 更新时间
}
```

## 数据库设计

### 集合结构

#### 1. users 集合
```typescript
{
  _id: ObjectId,
  username: String,      // 唯一索引
  email: String,         // 唯一索引
  password: String,      // 加密存储
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. docs 集合
```typescript
{
  _id: ObjectId,
  userId: ObjectId,      // 外键，关联users集合
  docTree: {
    key: String,         // 用户ID
    title: String,       // "我的文档"
    type: String,        // "folder"
    isDeleted: Boolean,
    children: [
      {
        key: String,     // 节点唯一标识
        title: String,   // 节点标题
        type: String,    // "folder" 或 "mote"
        isDeleted: Boolean,
        children: [...]
      }
    ]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. motes 集合
```typescript
{
  _id: ObjectId,
  docId: String,    // 对应文档节点的key
  moteTree: {
    id: String,          // 文档节点的key
    text: String,        // 根节点文本
    collapsed: Boolean,
    parentId: String,    // 根节点为空字符串
    children: [
      {
        id: String,      // 节点唯一标识
        text: String,    // 节点文本内容
        collapsed: Boolean,
        parentId: String,
        children: [...]
      }
    ]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 索引设计

```typescript
// 用户集合索引
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// 文档集合索引
db.docs.createIndex({ "userId": 1 });
db.docs.createIndex({ "userId": 1, "docTree.key": 1 });

// 脑图笔记集合索引
db.motes.createIndex({ "docId": 1 }, { unique: true });
```

### 数据关系

1. **用户与文档**: 一对一关系
   - 每个用户只有一个文档树
   - 文档树的根节点key为用户ID

2. **文档与笔记**: 一对多关系
   - 一个文档树包含多个文档节点
   - 每个mote类型的文档节点对应一个脑图笔记

3. **脑图笔记**: 独立存储
   - 每个脑图笔记以JSON格式存储整个moteTree
   - 根节点的id对应文档节点的key

### 示例数据结构

#### 文档示例 (docs集合)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439010",
  "docTree": {
    "key": "507f1f77bcf86cd799439010",
    "title": "我的文档",
    "type": "folder",
    "isDeleted": false,
    "children": [
      {
        "key": "aB3cD4eF",
        "title": "开发项目",
        "type": "folder",
        "isDeleted": false,
        "children": [
          {
            "key": "mN7oP8qR",
            "title": "Vue.js 项目",
            "type": "mote",
            "isDeleted": false
          }
        ]
      }
    ]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 脑图笔记示例 (motes集合)
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "docId": "mN7oP8qR",
  "moteTree": {
    "id": "mN7oP8qR",
    "text": "人工智能发展",
    "collapsed": false,
    "parentId": "",
    "children": [
      {
        "id": "Bq2Rf8vL",
        "text": "机器学习",
        "collapsed": false,
        "parentId": "mN7oP8qR",
        "children": [
          {
            "id": "Cw5Ht3nX",
            "text": "监督学习",
            "collapsed": false,
            "parentId": "Bq2Rf8vL",
            "children": []
          }
        ]
      }
    ]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 用户管理接口

### 用户注册
```http
POST /api/user/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "testuser",
      "email": "test@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "数据验证失败",
    "details": "用户名、邮箱和密码不能为空"
  }
}
```

### 用户登录
```http
POST /api/user/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "登录失败",
    "details": "用户名或密码错误"
  }
}
```

### 用户登出
```http
POST /api/user/logout
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "message": "登出成功"
}
```

### 刷新Token
```http
POST /api/user/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未授权访问",
    "details": "无效的刷新令牌"
  }
}
```

## 文档管理接口

### 获取文档树
```http
GET /api/doc/tree
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "docTree": {
      "key": "507f1f77bcf86cd799439010",
      "title": "我的文档",
      "type": "folder",
      "isDeleted": false,
      "children": [
        {
          "key": "aB3cD4eF",
          "title": "开发项目",
          "type": "folder",
          "isDeleted": false,
          "children": [
            {
              "key": "gH5iJ6kL",
              "title": "前端开发",
              "type": "folder",
              "isDeleted": false,
              "children": [
                {
                  "key": "mN7oP8qR",
                  "title": "Vue.js 项目",
                  "type": "mote",
                  "isDeleted": false
                }
              ]
            }
          ]
        },
        {
          "key": "cD1eF2gH",
          "title": "设计资源",
          "type": "folder",
          "isDeleted": false,
          "children": [
            {
              "key": "iJ3kL4mN",
              "title": "UI 设计规范",
              "type": "mote",
              "isDeleted": false
            }
          ]
        }
      ]
    }
  }
}
```

### 更新文档树
```http
PUT /api/doc/tree
Authorization: Bearer <token>
Content-Type: application/json

{
  "docTree": {
    "key": "507f1f77bcf86cd799439010",
    "title": "我的文档",
    "type": "folder",
    "isDeleted": false,
    "children": [
      {
        "key": "aB3cD4eF",
        "title": "开发项目",
        "type": "folder",
        "isDeleted": false,
        "children": [
          {
            "key": "gH5iJ6kL",
            "title": "前端开发",
            "type": "folder",
            "isDeleted": false,
            "children": [
              {
                "key": "mN7oP8qR",
                "title": "Vue.js 项目",
                "type": "mote",
                "isDeleted": false
              }
            ]
          }
        ]
      },
      {
        "key": "cD1eF2gH",
        "title": "设计资源",
        "type": "folder",
        "isDeleted": false,
        "children": [
          {
            "key": "iJ3kL4mN",
            "title": "UI 设计规范",
            "type": "mote",
            "isDeleted": false
          }
        ]
      }
    ]
  }
}
```

**响应**:
```json
{
  "success": true,
  "message": "文档树更新成功"
}
```

### 创建文档节点
```http
POST /api/doc/node
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新文档",
  "type": "mote",
  "parentKey": "aB3cD4eF"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "newNode": {
      "key": "newNodeKey123",
      "title": "新文档",
      "type": "mote",
      "isDeleted": false
    },
    "message": "文档节点创建成功"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "数据验证失败",
    "details": "标题、类型和父节点key不能为空"
  }
}
```

### 重命名文档节点
```http
PUT /api/doc/node/:key/rename
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新标题"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "updatedNode": {
      "key": "aB3cD4eF",
      "title": "新标题",
      "type": "folder",
      "isDeleted": false
    },
    "message": "文档节点重命名成功"
  }
}
```

### 移动文档节点位置
```http
PUT /api/doc/node/:key/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "newParentKey": "cD1eF2gH",
  "position": 1
}
```

**响应**:
```json
{
  "success": true,
  "message": "文档节点移动成功"
}
```

### 软删除文档节点
```http
PUT /api/doc/node/:key/delete
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "message": "文档节点删除成功"
}
```

### 硬删除文档节点
```http
DELETE /api/doc/node/:key/permanent
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "message": "文档节点永久删除成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_OPERATION",
    "message": "只能删除已软删除的节点，请先进行软删除操作"
  }
}
```

### 创建文档节点副本
```http
POST /api/doc/node/:key/duplicate
Authorization: Bearer <token>
```

**功能说明**:
- 在当前节点同级下方创建一份完整副本
- 包含所有子孙节点，所有节点的ID都会重新生成
- 副本标题会自动添加 " (副本)" 后缀
- 副本会插入到原节点的正下方位置

**响应**:
```json
{
  "success": true,
  "data": {
    "duplicatedNode": {
      "key": "newNodeKey456",
      "title": "原节点标题 (副本)",
      "type": "folder",
      "isDeleted": false,
      "children": [
        {
          "key": "childNodeKey789",
          "title": "子节点标题 (副本)",
          "type": "mote",
          "isDeleted": false
        }
      ]
    },
    "message": "文档节点副本创建成功"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "节点不存在"
  }
}
```

### 恢复文档节点
```http
PUT /api/doc/node/:key/restore
Authorization: Bearer <token>
```

**功能说明**:
- 软删除的逆操作，将 `isDeleted` 属性设置为 `false`
- 恢复节点及其所有子节点
- 保持原有的节点结构和层级关系

**响应**:
```json
{
  "success": true,
  "message": "文档节点恢复成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "节点不存在"
  }
}
```

## 脑图笔记接口

### 获取脑图笔记
```http
GET /api/mote/:docKey
Authorization: Bearer <token>
```

**功能说明**:
- 如果笔记不存在，系统会自动创建一个默认的笔记
- 默认笔记的标题会从文档树中查找对应的节点标题
- 如果找不到对应标题，则使用"新脑图笔记"作为默认标题

**响应**:
```json
{
  "success": true,
  "data": {
    "docKey": "mN7oP8qR",
    "moteTree": {
      "id": "mN7oP8qR",
      "text": "人工智能发展",
      "collapsed": false,
      "parentId": "",
      "children": [
        {
          "id": "Bq2Rf8vL",
          "text": "机器学习",
          "collapsed": false,
          "parentId": "mN7oP8qR",
          "children": [
            {
              "id": "Cw5Ht3nX",
              "text": "监督学习",
              "collapsed": false,
              "parentId": "Bq2Rf8vL",
              "children": [
                {
                  "id": "Dm9Yk6pZ",
                  "text": "分类算法",
                  "collapsed": false,
                  "parentId": "Cw5Ht3nX",
                  "children": [
                    {
                      "id": "Ej4Vb7sQ",
                      "text": "决策树是一种基于树形结构的分类和回归算法，通过递归地将数据集分割成更小的子集来构建模型，每个内部节点表示一个特征测试，每个叶节点表示一个预测结果",
                      "collapsed": false,
                      "parentId": "Dm9Yk6pZ",
                      "children": []
                    },
                    {
                      "id": "Fk8Nc2wR",
                      "text": "支持向量机是一种强大的监督学习算法，通过寻找最优超平面来分离不同类别的数据点，具有很好的泛化能力和处理高维数据的能力",
                      "collapsed": false,
                      "parentId": "Dm9Yk6pZ",
                      "children": []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "服务器内部错误",
    "details": "错误详细信息"
  }
}
```

### 更新脑图笔记
```http
PUT /api/mote/:docKey
Authorization: Bearer <token>
Content-Type: application/json

{
  "moteTree": {
    "id": "mN7oP8qR",
    "text": "人工智能发展",
    "collapsed": false,
    "parentId": "",
    "children": [
      {
        "id": "Bq2Rf8vL",
        "text": "机器学习",
        "collapsed": false,
        "parentId": "mN7oP8qR",
        "children": [
          {
            "id": "Cw5Ht3nX",
            "text": "监督学习",
            "collapsed": false,
            "parentId": "Bq2Rf8vL",
            "children": [
              {
                "id": "Dm9Yk6pZ",
                "text": "分类算法",
                "collapsed": false,
                "parentId": "Cw5Ht3nX",
                "children": [
                  {
                    "id": "Ej4Vb7sQ",
                    "text": "决策树是一种基于树形结构的分类和回归算法，通过递归地将数据集分割成更小的子集来构建模型，每个内部节点表示一个特征测试，每个叶节点表示一个预测结果",
                    "collapsed": false,
                    "parentId": "Dm9Yk6pZ",
                    "children": []
                  },
                  {
                    "id": "Fk8Nc2wR",
                    "text": "支持向量机是一种强大的监督学习算法，通过寻找最优超平面来分离不同类别的数据点，具有很好的泛化能力和处理高维数据的能力",
                    "collapsed": false,
                    "parentId": "Dm9Yk6pZ",
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**响应**:
```json
{
  "success": true,
  "message": "笔记更新成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "数据验证失败",
    "details": "脑图树不能为空"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "服务器内部错误"
  }
}
```

### 导出脑图笔记
```http
GET /api/mote/:docKey/export?format=json
Authorization: Bearer <token>
```

**查询参数**:
- `format`: 导出格式 (json, markdown)

**响应**:
```json
{
  "success": true,
  "data": {
    "filename": "vue-project.json",
    "content": "data:application/json;base64,eyJ0aXRsZSI6...",
    "size": 1024
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "数据验证失败",
    "details": "不支持的导出格式"
  }
}
```

### 导入脑图笔记（支持JSON和Markdown格式）
```http
POST /api/mote/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "parentKey": "aB3cD4eF",
  "moteTree": {
    "id": "importedNodeKey123",
    "text": "导入的笔记",
    "collapsed": false,
    "parentId": "",
    "children": []
  },
  "title": "导入的笔记",
  "format": "json"
}
```

**请求参数说明**:
- `parentKey`: 父节点key，必填
- `moteTree`: 脑图树数据（JSON格式时必填）
- `markdownContent`: Markdown内容（Markdown格式时必填）
- `title`: 导入的笔记标题，默认为"导入的笔记"
- `format`: 导入格式，支持"json"和"markdown"，默认为"json"

**JSON格式导入示例**:
```json
{
  "parentKey": "aB3cD4eF",
  "moteTree": {
    "text": "导入的笔记",
    "children": [
      {
        "text": "子节点1",
        "children": []
      },
      {
        "text": "子节点2",
        "children": []
      }
    ]
  },
  "title": "导入的笔记",
  "format": "json"
}
```

**Markdown格式导入示例**:
```json
{
  "parentKey": "aB3cD4eF",
  "markdownContent": "# 主标题\n## 子标题1\n内容1\n## 子标题2\n内容2",
  "title": "导入的笔记",
  "format": "markdown"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "newNode": {
      "key": "importedNodeKey123",
      "title": "导入的笔记",
      "type": "mote",
      "isDeleted": false
    },
    "message": "笔记导入成功"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "数据验证失败",
    "details": "父节点key不能为空"
  }
}
```

## 错误响应格式

### 认证错误
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未授权访问",
    "details": "Token已过期"
  }
}
```

### 验证错误
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "数据验证失败",
    "details": "标题不能为空"
  }
}
```

### 资源不存在
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "文档树不存在"
  }
}
```

### 用户已存在
```json
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "用户已存在",
    "details": "用户名已存在"
  }
}
```

### 服务器错误
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "服务器内部错误"
  }
}
```

## 状态码说明

- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `409`: 冲突（如用户名已存在）
- `500`: 服务器内部错误

## 认证说明

所有需要认证的接口都需要在请求头中包含 `Authorization: Bearer <token>`。

Token 格式为 JWT，包含用户ID和过期时间信息。

## 特殊功能说明

### 自动创建功能
- **文档树**: 如果用户没有文档树，系统会自动创建一个默认的文档树
- **脑图笔记**: 如果请求的笔记不存在，系统会自动创建一个默认的笔记

### 登录支持
- 支持使用用户名或邮箱进行登录

### 导出格式支持
- **JSON**: 原始数据结构
- **Markdown**: 转换为Markdown格式的列表

### 导入格式支持
- **JSON**: 支持导入JSON格式的脑图树数据
- **Markdown**: 支持导入Markdown格式的内容，自动解析为树结构
  - 支持 `#` 到 `######` 的标题层级
  - 非标题行会作为最近标题的子节点
  - 层级跳跃时会自动创建匿名中间节点
  - 所有节点ID会自动重新生成，避免冲突

### 删除机制
- **软删除**: 将节点标记为已删除，但保留在数据库中
- **硬删除**: 永久删除已软删除的节点
- **恢复删除**: 将已软删除的节点恢复为正常状态

### 副本功能
- **创建副本**: 在当前节点同级下方创建完整副本，包含所有子孙节点
- **ID重新生成**: 副本中所有节点的ID都会重新生成，避免冲突
- **标题后缀**: 副本标题会自动添加 " (副本)" 后缀以区分
- **位置插入**: 副本会插入到原节点的正下方位置

## 数据库索引建议

```typescript
// 用户集合索引
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// 文档集合索引
db.docs.createIndex({ "userId": 1 });
db.docs.createIndex({ "userId": 1, "docTree.key": 1 });

// 脑图笔记集合索引
db.motes.createIndex({ "docId": 1 }, { unique: true });
```

## 部署说明

### 环境变量
```bash
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/motes
MONGODB_DB_NAME=motes

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# 服务器配置
PORT=3000
NODE_ENV=development

# 跨域配置
CORS_ORIGIN=http://localhost:5173

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 启动命令
```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

## 测试接口

可以使用以下工具测试API：
- Postman
- Insomnia
- curl

示例curl命令：
```bash
# 登录
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 获取文档树
curl -X GET http://localhost:3000/api/doc/tree \
  -H "Authorization: Bearer <your-token>"
``` 