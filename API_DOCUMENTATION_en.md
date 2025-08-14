# Motes API Documentation

<p align="center">
  <a href="./README_en.md">
    <img src="https://img.shields.io/badge/Main-README-blue?style=for-the-badge&logo=markdown" alt="Main README">
  </a>
  <a href="./motes-frontend/README_en.md">
    <img src="https://img.shields.io/badge/Frontend-README-blue?style=for-the-badge&logo=markdown" alt="Frontend README">
  </a>
  <a href="./motes-backend/README_en.md">
    <img src="https://img.shields.io/badge/Backend-README-blue?style=for-the-badge&logo=markdown" alt="Backend README">
  </a>
  <br />
  <a href="./API_DOCUMENTATION.md">
    <img src="https://img.shields.io/badge/中文-API DOCUMENTATION-green?style=for-the-badge&logo=markdown" alt="中文 API DOCUMENTATION">
  </a>
</p>

## Overview

Motes is a mind map outline note application that provides user management, document management, and mind map note editing functions. This document describes the backend API interface specifications.

## Technology Stack

- **Backend Framework**: Express.js + TypeScript
- **Database**: MongoDB
- **Authentication**: JWT
- **Data Validation**: Joi/Zod
- **AI Service**: OpenAI API / Ollama local model
- **Document Parsing**: Support for PDF, Word, Markdown

## Basic Information

- **Base URL**: `http://localhost:3000/api`
- **Authentication Method**: Bearer Token
- **Data Format**: JSON

## Health Check Endpoint

### Service Health Check
```http
GET /api/health
```

**Response**:
```json
{
  "success": true,
  "message": "Motes API service is running normally",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Data Models

### User Model (User)
```typescript
interface User {
  _id: string;           // MongoDB ObjectId
  username: string;      // Username, unique
  email: string;         // Email, unique
  password: string;      // Encrypted password
  createdAt: Date;       // Creation time
  updatedAt: Date;       // Update time
}
```

### Document Model (Doc)
```typescript
interface DocNode {
  key: string;           // Node unique identifier
  title: string;         // Node title
  type: 'folder' | 'mote'; // Node type: folder or note
  isDeleted?: boolean;   // Whether deleted (soft delete)
  children?: DocNode[];  // Child nodes array
}

interface Doc {
  _id: string;           // MongoDB ObjectId
  userId: string;        // Owner user ID
  docTree: DocNode;      // Entire document tree, root node's key is userId
  createdAt: Date;       // Creation time
  updatedAt: Date;       // Update time
}
```

### Mind Map Note Model (Mote)
```typescript
interface MoteNode {
  id: string;            // Node unique identifier
  text: string;          // Node text content
  collapsed: boolean;    // Whether collapsed
  parentId: string;      // Parent node ID, empty string for root node
  children?: MoteNode[]; // Child nodes array
}

interface Mote {
  _id: string;           // MongoDB ObjectId
  docId: string;         // Corresponding document node key
  moteTree: MoteNode;    // Entire mind map tree, root node's id is docId
  createdAt: Date;       // Creation time
  updatedAt: Date;       // Update time
}
```

## Database Design

### Collection Structure

#### 1. users Collection
```typescript
{
  _id: ObjectId,
  username: String,      // Unique index
  email: String,         // Unique index
  password: String,      // Encrypted storage
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. docs Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,      // Foreign key, associated with users collection
  docTree: {
    key: String,         // User ID
    title: String,       // "My Documents"
    type: String,        // "folder"
    isDeleted: Boolean,
    children: [
      {
        key: String,     // Node unique identifier
        title: String,   // Node title
        type: String,    // "folder" or "mote"
        isDeleted: Boolean,
        children: [...]
      }
    ]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. motes Collection
```typescript
{
  _id: ObjectId,
  docId: String,    // Corresponding document node key
  moteTree: {
    id: String,          // Document node key
    text: String,        // Root node text
    collapsed: Boolean,
    parentId: String,    // Empty string for root node
    children: [
      {
        id: String,      // Node unique identifier
        text: String,    // Node text content
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

### Index Design

```typescript
// User collection indexes
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// Document collection indexes
db.docs.createIndex({ "userId": 1 });
db.docs.createIndex({ "userId": 1, "docTree.key": 1 });

// Mind map note collection indexes
db.motes.createIndex({ "docId": 1 }, { unique: true });
```

### Data Relationships

1. **User and Document**: One-to-one relationship
   - Each user has only one document tree
   - The root node key of the document tree is the user ID

2. **Document and Note**: One-to-many relationship
   - One document tree contains multiple document nodes
   - Each mote-type document node corresponds to one mind map note

3. **Mind Map Note**: Independently stored
   - Each mind map note stores the entire moteTree in JSON format
   - The root node's id corresponds to the document node's key

### Example Data Structure

#### Document Example (docs collection)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439010",
  "docTree": {
    "key": "507f1f77bcf86cd799439010",
    "title": "My Documents",
    "type": "folder",
    "isDeleted": false,
    "children": [
      {
        "key": "aB3cD4eF",
        "title": "Development Projects",
        "type": "folder",
        "isDeleted": false,
        "children": [
          {
            "key": "mN7oP8qR",
            "title": "Vue.js Project",
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

#### Mind Map Note Example (motes collection)
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "docId": "mN7oP8qR",
  "moteTree": {
    "id": "mN7oP8qR",
    "text": "AI Development",
    "collapsed": false,
    "parentId": "",
    "children": [
      {
        "id": "Bq2Rf8vL",
        "text": "Machine Learning",
        "collapsed": false,
        "parentId": "mN7oP8qR",
        "children": [
          {
            "id": "Cw5Ht3nX",
            "text": "Supervised Learning",
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

## User Management Endpoints

### User Registration
```http
POST /api/user/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response**:
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

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data validation failed",
    "details": "Username, email, and password cannot be empty"
  }
}
```

### User Login
```http
POST /api/user/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Response**:
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

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Login failed",
    "details": "Incorrect username or password"
  }
}
```

### User Logout
```http
POST /api/user/logout
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Refresh Token
```http
POST /api/user/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized access",
    "details": "Invalid refresh token"
  }
}
```

## Document Management Endpoints

### Get Document Tree
```http
GET /api/doc/tree
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "docTree": {
      "key": "507f1f77bcf86cd799439010",
      "title": "My Documents",
      "type": "folder",
      "isDeleted": false,
      "children": [
        {
          "key": "aB3cD4eF",
          "title": "Development Projects",
          "type": "folder",
          "isDeleted": false,
          "children": [
            {
              "key": "gH5iJ6kL",
              "title": "Frontend Development",
              "type": "folder",
              "isDeleted": false,
              "children": [
                {
                  "key": "mN7oP8qR",
                  "title": "Vue.js Project",
                  "type": "mote",
                  "isDeleted": false
                }
              ]
            }
          ]
        },
        {
          "key": "cD1eF2gH",
          "title": "Design Resources",
          "type": "folder",
          "isDeleted": false,
          "children": [
            {
              "key": "iJ3kL4mN",
              "title": "UI Design Specifications",
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

### Update Document Tree
```http
PUT /api/doc/tree
Authorization: Bearer <token>
Content-Type: application/json

{
  "docTree": {
    "key": "507f1f77bcf86cd799439010",
    "title": "My Documents",
    "type": "folder",
    "isDeleted": false,
    "children": [
      {
        "key": "aB3cD4eF",
        "title": "Development Projects",
        "type": "folder",
        "isDeleted": false,
        "children": [
          {
            "key": "gH5iJ6kL",
            "title": "Frontend Development",
            "type": "folder",
            "isDeleted": false,
            "children": [
              {
                "key": "mN7oP8qR",
                "title": "Vue.js Project",
                "type": "mote",
                "isDeleted": false
              }
            ]
          }
        ]
      },
      {
        "key": "cD1eF2gH",
        "title": "Design Resources",
        "type": "folder",
        "isDeleted": false,
        "children": [
          {
            "key": "iJ3kL4mN",
            "title": "UI Design Specifications",
            "type": "mote",
            "isDeleted": false
          }
        ]
      }
    ]
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Document tree updated successfully"
}
```

### Create Document Node
```http
POST /api/doc/node
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Document",
  "type": "mote",
  "parentKey": "aB3cD4eF"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "newNode": {
      "key": "newNodeKey123",
      "title": "New Document",
      "type": "mote",
      "isDeleted": false
    },
    "message": "Document node created successfully"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data validation failed",
    "details": "Title, type, and parent key cannot be empty"
  }
}
```

### Rename Document Node
```http
PUT /api/doc/node/:key/rename
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Title"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "updatedNode": {
      "key": "aB3cD4eF",
      "title": "New Title",
      "type": "folder",
      "isDeleted": false
    },
    "message": "Document node renamed successfully"
  }
}
```

### Move Document Node
```http
PUT /api/doc/node/:key/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "newParentKey": "cD1eF2gH",
  "position": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Document node moved successfully"
}
```

### Soft Delete Document Node
```http
PUT /api/doc/node/:key/delete
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Document node deleted successfully"
}
```

### Hard Delete Document Node
```http
DELETE /api/doc/node/:key/permanent
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Document node permanently deleted successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_OPERATION",
    "message": "Can only delete soft-deleted nodes, please perform soft delete first"
  }
}
```

### Duplicate Document Node
```http
POST /api/doc/node/:key/duplicate
Authorization: Bearer <token>
```

**Function Description**:
- Create a complete copy below the current node at the same level
- Includes all descendant nodes, all node IDs will be regenerated
- The copy title will automatically add " (Copy)" suffix
- The copy will be inserted directly below the original node

**Response**:
```json
{
  "success": true,
  "data": {
    "duplicatedNode": {
      "key": "newNodeKey456",
      "title": "Original Node Title (Copy)",
      "type": "folder",
      "isDeleted": false,
      "children": [
        {
          "key": "childNodeKey789",
          "title": "Child Node Title (Copy)",
          "type": "mote",
          "isDeleted": false
        }
      ]
    },
    "message": "Document node duplicate created successfully"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Node does not exist"
  }
}
```

### Restore Document Node
```http
PUT /api/doc/node/:key/restore
Authorization: Bearer <token>
```

**Function Description**:
- Reverse operation of soft delete, set `isDeleted` property to `false`
- Restore the node and all its child nodes
- Maintain the original node structure and hierarchy

**Response**:
```json
{
  "success": true,
  "message": "Document node restored successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Node does not exist"
  }
}
```

## Mind Map Note Endpoints

### Get Mind Map Note
```http
GET /api/mote/:docKey
Authorization: Bearer <token>
```

**Function Description**:
- If the note does not exist, the system will automatically create a default note
- The default note's title will be retrieved from the corresponding node title in the document tree
- If the corresponding title is not found, use "New Mind Map Note" as the default title

**Response**:
```json
{
  "success": true,
  "data": {
    "docKey": "mN7oP8qR",
    "moteTree": {
      "id": "mN7oP8qR",
      "text": "AI Development",
      "collapsed": false,
      "parentId": "",
      "children": [
        {
          "id": "Bq2Rf8vL",
          "text": "Machine Learning",
          "collapsed": false,
          "parentId": "mN7oP8qR",
          "children": [
            {
              "id": "Cw5Ht3nX",
              "text": "Supervised Learning",
              "collapsed": false,
              "parentId": "Bq2Rf8vL",
              "children": [
                {
                  "id": "Dm9Yk6pZ",
                  "text": "Classification Algorithms",
                  "collapsed": false,
                  "parentId": "Cw5Ht3nX",
                  "children": [
                    {
                      "id": "Ej4Vb7sQ",
                      "text": "Decision Tree is a tree-based classification and regression algorithm that builds a model by recursively splitting the dataset into smaller subsets, with each internal node representing a feature test and each leaf node representing a prediction result",
                      "collapsed": false,
                      "parentId": "Dm9Yk6pZ",
                      "children": []
                    },
                    {
                      "id": "Fk8Nc2wR",
                      "text": "Support Vector Machine is a powerful supervised learning algorithm that separates data points of different categories by finding the optimal hyperplane, with good generalization ability and handling high-dimensional data",
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
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error",
    "details": "Error details"
  }
}
```

### Update Mind Map Note
```http
PUT /api/mote/:docKey
Authorization: Bearer <token>
Content-Type: application/json

{
  "moteTree": {
    "id": "mN7oP8qR",
    "text": "AI Development",
    "collapsed": false,
    "parentId": "",
    "children": [
      {
        "id": "Bq2Rf8vL",
        "text": "Machine Learning",
        "collapsed": false,
        "parentId": "mN7oP8qR",
        "children": [
          {
            "id": "Cw5Ht3nX",
            "text": "Supervised Learning",
            "collapsed": false,
            "parentId": "Bq2Rf8vL",
            "children": [
              {
                "id": "Dm9Yk6pZ",
                "text": "Classification Algorithms",
                "collapsed": false,
                "parentId": "Cw5Ht3nX",
                "children": [
                  {
                    "id": "Ej4Vb7sQ",
                    "text": "Decision Tree is a tree-based classification and regression algorithm that builds a model by recursively splitting the dataset into smaller subsets, with each internal node representing a feature test and each leaf node representing a prediction result",
                    "collapsed": false,
                    "parentId": "Dm9Yk6pZ",
                    "children": []
                  },
                  {
                    "id": "Fk8Nc2wR",
                    "text": "Support Vector Machine is a powerful supervised learning algorithm that separates data points of different categories by finding the optimal hyperplane, with good generalization ability and handling high-dimensional data",
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

**Response**:
```json
{
  "success": true,
  "message": "Note updated successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data validation failed",
    "details": "Mind map tree cannot be empty"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error"
  }
}
```

### Export Mind Map Note
```http
GET /api/mote/:docKey/export?format=json
Authorization: Bearer <token>
```

**Query Parameters**:
- `format`: Export format (json, markdown)

**Response**:
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

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data validation failed",
    "details": "Unsupported export format"
  }
}
```

### Import Mind Map Note (Supports JSON and Markdown Formats)
```http
POST /api/mote/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "parentKey": "aB3cD4eF",
  "moteTree": {
    "id": "importedNodeKey123",
    "text": "Imported Note",
    "collapsed": false,
    "parentId": "",
    "children": []
  },
  "title": "Imported Note",
  "format": "json"
}
```

**Request Parameters Description**:
- `parentKey`: Parent node key, required
- `moteTree`: Mind map tree data (required for JSON format)
- `markdownContent`: Markdown content (required for Markdown format)
- `title`: Imported note title, default "Imported Note"
- `format`: Import format, supports "json" and "markdown", default "json"

**JSON Format Import Example**:
```json
{
  "parentKey": "aB3cD4eF",
  "moteTree": {
    "text": "Imported Note",
    "children": [
      {
        "text": "Child Node 1",
        "children": []
      },
      {
        "text": "Child Node 2",
        "children": []
      }
    ]
  },
  "title": "Imported Note",
  "format": "json"
}
```

**Markdown Format Import Example**:
```json
{
  "parentKey": "aB3cD4eF",
  "markdownContent": "# Main Title\n## Subtitle 1\nContent 1\n## Subtitle 2\nContent 2",
  "title": "Imported Note",
  "format": "markdown"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "newNode": {
      "key": "importedNodeKey123",
      "title": "Imported Note",
      "type": "mote",
      "isDeleted": false
    },
    "message": "Note imported successfully"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data validation failed",
    "details": "Parent key cannot be empty"
  }
}
```

## AI Function Endpoints

### AI Generate Mind Map Note
```http
POST /api/ai/generate-mote
Authorization: Bearer <token>
Content-Type: application/json

{
  "inputType": "theme",
  "theme": "History of AI Development",
  "docParentKey": "parent-key",
  "title": "AI Development History",
  "provider": {
    "type": "openai",
    "model": "gpt-3.5-turbo",
    "apiKey": "your-api-key"
  },
  "options": {
    "depthLimit": 4,
    "branchingFactor": 4,
    "language": "English",
    "maxTokens": 1200
  }
}
```

**Request Parameters Description**:
- `inputType`: Input type, supports "theme" or "text"
- `theme`: Theme content (used when inputType is "theme")
- `text`: Text content (used when inputType is "text")
- `docParentKey`: Parent document node key, required
- `title`: Generated mind map title, optional
- `provider`: LLM provider configuration
  - `type`: Provider type, supports "openai" or "ollama"
  - `model`: Model name
  - `apiKey`: API key (required for OpenAI)
  - `baseUrl`: Base URL (optional, supports custom endpoints)
  - `temperature`: Temperature parameter (optional, controls output randomness)
  - `top_p`: Top-p parameter (optional, controls output diversity)
- `options`: Generation options
  - `depthLimit`: Maximum hierarchy depth, default 4
  - `branchingFactor`: Maximum branches per level, default 4
  - `language`: Output language, default "English"
  - `maxTokens`: Maximum tokens, default 1200

**Response**:
```json
{
  "success": true,
  "data": {
    "title": "AI Development History",
    "moteTree": {
      "id": "Ab3cD4eF",
      "text": "AI Development History",
      "collapsed": false,
      "parentId": "",
      "children": [
        {
          "id": "Bq2Rf8vL",
          "text": "Early Development",
          "collapsed": false,
          "parentId": "Ab3cD4eF",
          "children": [
            {
              "id": "Cw5Ht3nX",
              "text": "Turing Test",
              "collapsed": false,
              "parentId": "Bq2Rf8vL",
              "children": []
            }
          ]
        }
      ]
    },
    "docParentKey": "parent-key",
    "created": false,
    "fallbackUsed": false
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Missing required parameters"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "PROVIDER_MODEL_NOT_FOUND",
    "message": "Model does not exist or is not installed",
    "details": "Ollama did not find model: llama2 (baseUrl=http://localhost:11434/v1). Please run first: ollama pull llama2"
  }
}
```

### AI Generate Mind Map Note (File Upload)
```http
POST /api/ai/generate-mote-file
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- document: Uploaded document file (PDF/DOCX/MD/TXT)
- docParentKey: Parent document node key
- title: Generated title (optional)
- create: Whether to create directly (optional, default false)
- provider: LLM provider configuration (JSON string)
- options: Generation options (JSON string)
```

**Supported File Formats**:
- PDF documents (.pdf)
- Word documents (.docx, .doc)
- Markdown files (.md)
- Plain text files (.txt)

**File Size Limit**: 20MB

**Response**:
```json
{
  "success": true,
  "data": {
    "title": "Document Parsing Result",
    "moteTree": {
      "id": "Ab3cD4eF",
      "text": "Document Parsing Result",
      "collapsed": false,
      "parentId": "",
      "children": [
        {
          "id": "Bq2Rf8vL",
          "text": "Chapter 1",
          "collapsed": false,
          "parentId": "Ab3cD4eF",
          "children": []
        }
      ]
    },
    "docParentKey": "parent-key",
    "created": false,
    "fallbackUsed": false,
    "parsedMeta": {
      "mimeType": "application/pdf",
      "fileName": "document.pdf",
      "ext": "pdf",
      "source": "pdf"
    }
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Missing uploaded file"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "EMPTY_CONTENT",
    "message": "Unable to extract valid text from the document"
  }
}
```

### AI Node Expansion (AI Branching)
```http
POST /api/ai/expand-node
Authorization: Bearer <token>
Content-Type: application/json

{
  "moteTree": {
    "id": "Ab3cD4eF",
    "text": "Artificial Intelligence",
    "collapsed": false,
    "parentId": "",
    "children": [
      {
        "id": "Bq2Rf8vL",
        "text": "Machine Learning",
        "collapsed": false,
        "parentId": "Ab3cD4eF",
        "children": []
      }
    ]
  },
  "selectedNodeId": "Bq2Rf8vL",
  "selectedNodeText": "Machine Learning",
  "provider": {
    "type": "openai",
    "model": "gpt-3.5-turbo",
    "apiKey": "your-api-key"
  },
  "options": {
    "maxNewNodes": 4,
    "depth": 2,
    "language": "English"
  }
}
```

**Request Parameters Description**:
- `moteTree`: Current complete mind map tree structure
- `selectedNodeId`: Selected node ID to expand
- `selectedNodeText`: Text content of the selected node
- `provider`: LLM provider configuration (same as generation interface)
- `options`: Expansion options
  - `maxNewNodes`: Maximum new nodes, default 4, max 16
  - `depth`: Maximum depth, default 4, max 16
  - `language`: Output language, default "English"

**Response**:
```json
{
  "success": true,
  "data": {
    "expandedNode": {
      "text": "Machine Learning",
      "children": [
        {
          "text": "Supervised Learning",
          "children": [
            {
              "text": "Classification Algorithms",
              "children": [
                {"text": "Decision Tree", "children": []},
                {"text": "Support Vector Machine", "children": []}
              ]
            },
            {"text": "Regression Algorithms", "children": []}
          ]
        },
        {
          "text": "Unsupervised Learning",
          "children": [
            {"text": "Clustering Algorithms", "children": []},
            {"text": "Dimensionality Reduction Techniques", "children": []}
          ]
        }
      ]
    },
    "fallbackUsed": false
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Missing required parameters"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "LLM_INVALID_OUTPUT",
    "message": "Model output does not meet requirements (not valid JSON)",
    "details": "Please try changing the model or simplifying/tightening the prompt and retry"
  }
}
```

## Error Response Formats

### Authentication Error
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized access",
    "details": "Token has expired"
  }
}
```

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data validation failed",
    "details": "Title cannot be empty"
  }
}
```

### Resource Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Document tree does not exist"
  }
}
```

### User Already Exists
```json
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "User already exists",
    "details": "Username already exists"
  }
}
```

### Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error"
  }
}
```

### AI Service Errors
```json
{
  "success": false,
  "error": {
    "code": "PROVIDER_MODEL_NOT_FOUND",
    "message": "Model does not exist or is not installed",
    "details": "Ollama did not find model: llama2. Please run first: ollama pull llama2"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "PROVIDER_ERROR",
    "message": "Model call failed",
    "details": "Upstream service exception"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "LLM_INVALID_OUTPUT",
    "message": "Model output does not meet requirements (not valid JSON)",
    "details": "Please try changing the model or simplifying/tightening the prompt and retry"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "EMPTY_CONTENT",
    "message": "Unable to extract valid text from the document"
  }
}
```

## Status Code Descriptions

- `200`: Request successful
- `201`: Creation successful
- `400`: Bad request parameters
- `401`: Unauthorized
- `403`: Forbidden access
- `404`: Resource not found
- `409`: Conflict (e.g., username already exists)
- `413`: Request entity too large (e.g., file exceeds size limit)
- `500`: Internal server error
- `502`: Gateway error (e.g., AI service call failed)

## Authentication Description

All endpoints requiring authentication must include `Authorization: Bearer <token>` in the request header.

The token is in JWT format, containing user ID and expiration time information.

## Special Function Descriptions

### Automatic Creation
- **Document Tree**: If the user has no document tree, the system will automatically create a default document tree
- **Mind Map Note**: If the requested note does not exist, the system will automatically create a default note

### Login Support
- Supports login using username or email

### Export Format Support
- **JSON**: Original data structure
- **Markdown**: Converted to Markdown list format

### Import Format Support
- **JSON**: Supports importing mind map tree data in JSON format
- **Markdown**: Supports importing Markdown content, automatically parsed into tree structure
  - Supports headings from `#` to `######`
  - Non-heading lines will be treated as child nodes of the nearest heading
  - When hierarchy skips, anonymous intermediate nodes will be automatically created
  - All node IDs will be automatically regenerated to avoid conflicts

### Deletion Mechanism
- **Soft Delete**: Mark the node as deleted, but retain it in the database
- **Hard Delete**: Permanently delete soft-deleted nodes
- **Restore Delete**: Restore soft-deleted nodes to normal state

### Duplicate Function
- **Create Duplicate**: Create a complete duplicate below the current node at the same level, including all descendant nodes
- **ID Regeneration**: All node IDs in the duplicate will be regenerated to avoid conflicts
- **Title Suffix**: The duplicate title will automatically add " (Copy)" suffix for distinction
- **Position Insertion**: The duplicate will be inserted directly below the original node

### AI Function Features
- **Multi-Model Support**: Supports OpenAI API and Ollama local models
- **Proxy Configuration**: Supports HTTP/HTTPS proxy configuration
- **Document Parsing**: Supports multiple document formats such as PDF, Word, Markdown
- **Text Preprocessing**: Automatically clean and standardize text content
- **Intelligent Expansion**: Intelligently generate related child nodes based on context
- **Error Handling**: Comprehensive error handling and fallback mechanisms
- **Format Validation**: Strict output format validation and parsing

### AI Provider Configuration

#### OpenAI Configuration
```json
{
  "type": "openai",
  "model": "gpt-3.5-turbo",
  "apiKey": "your-openai-api-key",
  "baseUrl": "https://api.openai.com/v1",
  "temperature": 0.7,
  "top_p": 0.9
}
```

#### Ollama Configuration
```json
{
  "type": "ollama",
  "model": "llama2",
  "baseUrl": "http://localhost:11434/v1",
  "temperature": 0.2,
  "top_p": 0.9
}
```

### Environment Variable Configuration

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/motes
MONGODB_DB_NAME=motes

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limit Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Service Configuration
OPENAI_BASE_URL=https://api.openai.com/v1
OLLAMA_BASE_URL=http://localhost:11434/v1
LLM_REQ_TIMEOUT_MS=300000

# Proxy Configuration (Optional)
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080
```

## Database Index Recommendations

```typescript
// User collection indexes
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// Document collection indexes
db.docs.createIndex({ "userId": 1 });
db.docs.createIndex({ "userId": 1, "docTree.key": 1 });

// Mind map note collection indexes
db.motes.createIndex({ "docId": 1 }, { unique: true });
```

## Deployment Instructions

### Startup Commands
```bash
# Development Environment
npm run dev

# Production Environment
npm run build
npm start
```

## Testing Endpoints

You can use the following tools to test the API:
- Postman
- Insomnia
- curl

Example curl commands:
```bash
# Login
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get Document Tree
curl -X GET http://localhost:3000/api/doc/tree \
  -H "Authorization: Bearer <your-token>"

# AI Generate Mind Map Note
curl -X POST http://localhost:3000/api/ai/generate-mote \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "inputType": "theme",
    "theme": "History of AI Development",
    "docParentKey": "parent-key",
    "title": "AI Development History",
    "provider": {
      "type": "openai",
      "model": "gpt-3.5-turbo",
      "apiKey": "your-api-key"
    },
    "options": {
      "depthLimit": 4,
      "branchingFactor": 4,
      "language": "English"
    }
  }'

# AI Node Expansion
curl -X POST http://localhost:3000/api/ai/expand-node \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "moteTree": {"id":"root","text":"Artificial Intelligence","children":[{"id":"node1","text":"Machine Learning","children":[]}]},
    "selectedNodeId": "node1",
    "selectedNodeText": "Machine Learning",
    "provider": {
      "type": "openai",
      "model": "gpt-3.5-turbo",
      "apiKey": "your-api-key"
    },
    "options": {
      "maxNewNodes": 4,
      "depth": 2,
      "language": "English"
    }
  }'
```