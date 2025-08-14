# Motes Backend API Service

<p align="center">
  <a href="../README_en.md">
    <img src="https://img.shields.io/badge/Main-README-blue?style=for-the-badge&logo=markdown" alt="Main README">
  </a>
  <a href="../motes-frontend/README_en.md">
    <img src="https://img.shields.io/badge/Frontend-README-blue?style=for-the-badge&logo=markdown" alt="Frontend README">
  </a>
  <a href="../API_DOCUMENTATION_en.md">
    <img src="https://img.shields.io/badge/API-DOCUMENTATION-blue?style=for-the-badge&logo=markdown" alt="API DOCUMENTATION">
  <br />
  <a href="./README.md">
    <img src="https://img.shields.io/badge/中文-README-green?style=for-the-badge&logo=markdown" alt="中文 README">
  </a>
  </a>
</p>

## 📖 Introduction

The Motes Backend API Service is the core service layer for the mind map notes web application, providing RESTful API interfaces that support user authentication, document management, mind map notes data storage, and AI generation functions, offering strong data support for the frontend application.

The Motes backend is committed to providing stable, efficient, and secure API services. Through RESTful design principles and JWT authentication mechanisms, it ensures the security of user data and the scalability of the system. It uses MongoDB as the data storage, supporting complex data structures and efficient query operations. It integrates multiple large language model services to provide intelligent mind map notes generation and document processing functions.

## ✨ Main Features

### 🤖 AI Features
- **AI Generate Mote**: Automatically generate structured mind map notes based on themes or text content
- **Document Parsing and Processing**: Supports intelligent parsing of various document formats such as PDF, DOCX, Markdown, etc.
- **Node Intelligent Expansion**: Use AI to generate child nodes based on existing node content (AI branching)
- **Multi-Model Support**: Integrates OpenAI-compatible, Ollama, and other large language model services
- **Proxy Configuration**: Supports HTTP proxy configuration to adapt to different network environments

### 🧠 Mote Data
- **Mote Node Management**: CRUD operations for mind map notes nodes
- **Node Relationship Handling**: Supports parent-child relationships and connection relationships between nodes
- **Data Synchronization**: Real-time data synchronization and consistency guarantee

### 📄 Document Management
- **Document CRUD**: Complete create, read, update, delete operations for documents
- **User Permission Control**: Data access control based on user identity
- **Document Metadata**: Supports management of document title, description, creation time, and other metadata

### 🔐 User Authentication System
- **JWT Authentication**: User identity verification based on JSON Web Token
- **Password Encryption**: Use bcryptjs for secure password encryption
- **User Registration and Login**: Complete user registration and login process
- **Token Refresh**: Supports automatic refresh mechanism for access tokens

### 🛡️ Security Features
- **CORS Configuration**: Secure configuration for cross-origin resource sharing
- **Request Rate Limiting**: Protection against API request frequency limits
- **Input Validation**: Strict data input validation and sanitization
- **Error Handling**: Unified error handling and response format

## 🛠 Technology Stack

### Core Framework
- **Node.js 18+** - JavaScript runtime environment
- **Express.js 4.18.2** - Fast and flexible Node.js web application framework
- **TypeScript 5.3.3** - Typed superset of JavaScript

### Database
- **MongoDB 8.0.3** - Document-oriented NoSQL database
- **Mongoose 8.0.3** - MongoDB object modeling tool

### Authentication and Security
- **JWT 9.0.2** - JSON Web Token implementation
- **bcryptjs 2.4.3** - Password hashing encryption
- **cors 2.8.5** - Cross-origin resource sharing middleware

### AI and Document Processing
- **axios 1.11.0** - HTTP client for LLM API calls
- **https-proxy-agent 7.0.6** - HTTP proxy support
- **mammoth 1.6.0** - Word document parsing
- **pdf-parse 1.1.1** - PDF document parsing
- **compromise 14.14.4** - Natural language processing tool
- **multer 1.4.5-lts.1** - File upload middleware

### Utility Libraries
- **nanoid 5.1.5** - Unique ID generator
- **dotenv 16.3.1** - Environment variable management

### Development Tools
- **ESLint 9.32.0** - Code quality checker
- **Prettier 3.5.3** - Code formatter
- **ts-node 10.9.2** - TypeScript execution environment
- **rimraf 5.0.10** - Cross-platform file deletion tool

## 📁 Project Structure

```
motes-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Database connection configuration
│   │   └── defaultData.ts # Default data configuration
│   ├── controllers/      # Controller layer
│   │   ├── userController.ts
│   │   ├── docController.ts
│   │   ├── moteController.ts
│   │   └── aiController.ts
│   ├── middleware/       # Middleware
│   │   └── auth.ts      # Authentication middleware
│   ├── models/          # Data models
│   │   ├── User.ts
│   │   ├── Doc.ts
│   │   └── Mote.ts
│   ├── routes/          # Route definitions
│   │   ├── user.ts
│   │   ├── doc.ts
│   │   ├── mote.ts
│   │   └── ai.ts
│   ├── services/        # Business logic layer
│   │   ├── userService.ts
│   │   ├── docService.ts
│   │   ├── moteService.ts
│   │   ├── llmService.ts
│   │   ├── documentParser.ts
│   │   └── textPreprocess.ts
│   ├── types/           # Type definitions
│   ├── utils/           # Utility functions
│   │   ├── jwt.ts       # JWT utilities
│   │   ├── idGenerator.ts # ID generator
│   │   └── outlineToMote.ts # Outline to mind map notes tool
│   └── app.ts          # Application entry file
├── .env.example        # Environment variable example
├── eslint.config.js    # ESLint configuration
├── package.json        # Project configuration
├── tsconfig.json       # TypeScript configuration
└── README.md          # Project documentation
```

## 🚀 Quick Start

### Environment Requirements
- Node.js >= 18.0.0
- MongoDB >= 5.0.0
- npm >= 8.0.0

### Install Dependencies
```bash
cd motes-backend
npm install
```

### Environment Configuration
1. Copy the environment variable file:
```bash
cp .env.example .env
```

2. Configure environment variables:
```bash
# Database configuration
MONGODB_URI=mongodb://localhost:27017/motes
MONGODB_DB_NAME=motes

# JWT configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=30d

# Server configuration
PORT=3000
NODE_ENV=development

# CORS configuration
CORS_ORIGIN=http://localhost:5173

# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=3000000
RATE_LIMIT_MAX_REQUESTS=100

# AI service configuration (optional)
# OpenAI API configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# Ollama configuration
OLLAMA_BASE_URL=http://localhost:11434

# Proxy configuration (optional)
HTTP_PROXY=http://proxy-server:port
HTTPS_PROXY=http://proxy-server:port
```

### Development Mode
```bash
npm run dev
```
The API service will start at `http://localhost:3000`

### Build Production Version
```bash
npm run build
```

### Start Production Service
```bash
npm start
```

### Code Checking
```bash
# ESLint check
npm run lint

# Automatically fix ESLint issues
npm run lint:fix
```

## 🔧 Development Guide

### Project Architecture
- **MVC Pattern**: Adopts Model-View-Controller architecture
- **Layered Design**: Controller → Service → Model layered structure
- **Middleware Pattern**: Uses Express middleware to handle common logic

### API Design Specifications
- **RESTful Design**: Follows REST API design principles
- **Unified Response Format**: Standardized API response structure
- **Error Handling**: Unified error codes and error messages

### Database Design
- **MongoDB Document Models**: Uses Mongoose for data modeling
- **Index Optimization**: Reasonably set database indexes to improve query performance
- **Data Validation**: Model-level data validation and type checking

### AI Service Integration
- **Multi-Model Support**: Supports OpenAI-compatible, Ollama, and other LLM services
- **Proxy Configuration**: Supports HTTP proxy for enterprise network environments
- **Document Parsing**: Supports PDF, DOCX, Markdown, and other formats
- **Intelligent Generation**: Automatically generates structured mind map notes based on content

### Security Specifications
- **JWT Authentication**: Token-based identity verification mechanism
- **Password Encryption**: Uses bcryptjs for secure password storage
- **Input Validation**: Strict data input validation and sanitization
- **CORS Configuration**: Secure cross-origin resource sharing settings

## 📱 Functional Features

### User Management
- ✅ User registration and login
- ✅ JWT Token authentication
- ✅ Password encrypted storage
- ✅ User information management

### Document Management
- ✅ Document CRUD
- ✅ User permission control
- ✅ Document metadata management

### Mind Map Notes Data
- ✅ Mote node management
- ✅ Node relationship handling
- ✅ Data synchronization mechanism

### AI Features
- ✅ AI-generated mind map notes
- ✅ Intelligent document parsing
- ✅ Node intelligent expansion
- ✅ Multi-model service support
- ✅ Proxy configuration support

### API Features
- ✅ RESTful API design
- ✅ Unified response format
- ✅ Error handling mechanism
- ✅ Request rate limiting protection
- ✅ CORS cross-origin support

## 🔗 API Interfaces

### User-Related Interfaces
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/user/logout` - User logout
- `POST /api/user/refresh` - Refresh Token

### Document-Related Interfaces
- `GET /api/doc/tree` - Get document tree
- `PUT /api/doc/tree` - Update document tree
- `POST /api/doc/node` - Create document node
- `POST /api/doc/node/:key/duplicate` - Create document node duplicate
- `PUT /api/doc/node/:key/rename` - Rename document node
- `PUT /api/doc/node/:key/move` - Move document node position
- `PUT /api/doc/node/:key/delete` - Soft delete document node
- `DELETE /api/doc/node/:key/permanent` - Hard delete document node
- `PUT /api/doc/node/:key/restore` - Restore document node

### Mind Map Notes-Related Interfaces
- `GET /api/mote/:docKey` - Get mind map notes
- `PUT /api/mote/:docKey` - Update mind map notes
- `GET /api/mote/:docKey/export` - Export mind map notes
- `POST /api/mote/import` - Import mind map notes

### AI-Related Interfaces
- `POST /api/ai/generate-mote` - AI generate mind map notes (based on text)
- `POST /api/ai/generate-mote-file` - AI generate mind map notes (based on file)
- `POST /api/ai/expand-node` - AI node expansion (AI branching)

### System Interfaces
- `GET /api/health` - Health check

## 🤖 AI Features in Detail

### AI-Generated Mind Map Notes
Supports two input methods for generating mind map notes:

#### Text-Based Generation
```bash
POST /api/ai/generate-mote
Content-Type: application/json

{
  "inputType": "theme",
  "theme": "History of Artificial Intelligence Development",
  "docParentKey": "parent-key",
  "title": "AI Development History",
  "provider": {
    "type": "openai",
    "model": "gpt-3.5-turbo"
  },
  "options": {
    "depthLimit": 4,
    "branchingFactor": 4,
    "language": "English"
  }
}
```

#### File-Based Generation
```bash
POST /api/ai/generate-mote-file
Content-Type: multipart/form-data

document: [PDF/DOCX/MD file]
title: "Document Title"
options: {
  "depthLimit": 4,
  "branchingFactor": 4
}
```

### Document Parsing Support
- **PDF Documents**: Use pdf-parse to parse text content
- **Word Documents**: Use mammoth to parse DOCX/DOC formats
- **Markdown**: Directly parse Markdown text
- **Plain Text**: Supports TXT and other plain text formats

### Node Intelligent Expansion
```bash
POST /api/ai/expand-node
Content-Type: application/json

{
  "nodeText": "Current node content",
  "context": "Context information",
  "options": {
    "childCount": 3,
    "direction": "expand"
  }
}
```

### Supported LLM Services
- **OpenAI**: GPT-3.5-turbo, GPT-4, etc. models
- **Ollama**: Locally deployed Llama, Mistral, etc. models
- **Custom Proxy**: Supports enterprise intranet proxy configuration

## 🧪 Code Quality Checks

```bash
# ESLint check
npm run lint

# Automatically fix ESLint issues
npm run lint:fix

# Type checking
npx tsc --noEmit
```

## 📊 Performance Optimization

### Database Optimization
- Reasonably set MongoDB indexes
- Use connection pool to manage database connections
- Implement data pagination queries

### API Optimization
- Implement request caching mechanism
- Use compression middleware to reduce transmission size
- Implement API rate limiting protection

### AI Service Optimization
- Support concurrent request processing
- Implement request timeout and retry mechanisms
- Optimize document parsing performance

## 🔗 Related Links

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs/openai)
- [Deepseek API Documentation](https://api-docs.deepseek.com/)
- [Ollama Documentation](https://ollama.ai/docs)

**Motes** - Connect your motes.