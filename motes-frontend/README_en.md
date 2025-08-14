# Motes Frontend Web Application

<p align="center">
  <a href="../README_en.md">
    <img src="https://img.shields.io/badge/Main-README-blue?style=for-the-badge&logo=markdown" alt="Main README">
  </a>
  <a href="../motes-backend/README_en.md">
    <img src="https://img.shields.io/badge/Backend-README-blue?style=for-the-badge&logo=markdown" alt="Backend README">
  </a>
  <a href="../API_DOCUMENTATION_en.md">
    <img src="https://img.shields.io/badge/API-DOCUMENTATION-blue?style=for-the-badge&logo=markdown" alt="API DOCUMENTATION">
  </a>
  <br />
  <a href="./README.md">
    <img src="https://img.shields.io/badge/中文-README-green?style=for-the-badge&logo=markdown" alt="中文 README">
  </a>
</p>

## 📖 Introduction

The Motes frontend is the user interface layer of a mind map note-taking web application, built on Vue 3 and the AntV X6 graph engine. It provides intuitive mind map editing and convenient outline note operations, creating a smooth knowledge management experience for users.

The Motes frontend is dedicated to connecting fragmented knowledge particles. Through visual mind map displays and structured outline note organization, it helps users build a complete knowledge network. Each mote (particle) is the smallest unit of knowledge, forming a powerful knowledge system through connections and combinations. It adopts a modern frontend technology stack to provide a fluid user interaction experience.

## ✨ Main Features

### 🤖 AI Generation
- **AI Generate Mote**: Automatically generate mind map notes based on topics, text, or files
- **AI Expand Node**: Automatically expand child nodes using AI after selecting a node
- **Multi-Model Support**: Supports multiple AI models such as OpenAI and Ollama
- **Preset Configurations**: Built-in presets for common models for quick setup
- **File Parsing**: Supports parsing PDF, DOCX, and Markdown files for generation
- **Real-Time Preview**: Preview results upon successful generation and import after confirmation

### 🧠 Mind Map
- **Intuitive Node Connections**: Based on the AntV X6 graph engine, providing a smooth mind map editing experience
- **Flexible Node Operations**: Supports adding, deleting, editing nodes, and more
- **Keyboard Shortcuts**: Rich shortcut support to improve editing efficiency
- **Node Selection**: Supports single-select interaction operations
- **Automatic Layout**: Intelligent hierarchical layout algorithm for automatic node positioning
- **Zoom Control**: Supports graph zooming and panning operations

### 📝 Outline Notes
- **Outline View**: Structured note outline for clear content hierarchy display
- **Text Editing**: Supports real-time editing and modification of node text
- **Real-Time Sync**: Real-time synchronization with mind maps to ensure data consistency
- **Scroll Sync**: Synchronized scrolling positions between outline and mind map views
- **Collapse/Expand**: Supports node collapse and expand operations

### 🔐 User System
- **User Authentication**: JWT-based user login and registration system
- **Data Isolation**: Secure isolation of user data for privacy protection
- **Cloud Sync**: Secure data storage supporting multi-device access

### 💾 Data Management
- **Auto Save**: Supports automatic saving of documents
- **Import/Export**: Supports document import and export functions
- **Version Control**: Tracks document modification status

### 🛡️ Security Features
- **JWT Authentication**: Token-based authentication mechanism
- **Data Validation**: Frontend data input validation and sanitization
- **Error Handling**: Unified error handling and user prompts
- **CORS Support**: Secure cross-origin resource sharing

## 🛠 Technology Stack

### Core Framework
- **Vue 3.5.17** - Progressive JavaScript framework
- **TypeScript ~5.8.0** - Typed superset of JavaScript
- **Vite ^7.0.0** - Next-generation frontend build tool

### UI Component Library
- **Ant Design Vue 4.2.6** - Enterprise-level UI design language and Vue component library
- **@ant-design/icons-vue 7.0.1** - Ant Design icon library

### Graph Engine
- **@antv/x6 2.18.1** - Graph editing engine
- **@antv/x6-plugin-keyboard 2.2.3** - Keyboard shortcut plugin
- **@antv/x6-plugin-selection 2.2.2** - Selection plugin
- **@antv/hierarchy 0.6.14** - Hierarchical layout algorithm

### State Management
- **Pinia 3.0.3** - State management library for Vue

### Routing Management
- **Vue Router 4.5.1** - Official router for Vue.js

### Network Requests
- **Axios 1.11.0** - Promise-based HTTP client

### Internationalization
- **Vue I18n 9.14.5** - Internationalization plugin for Vue.js

### Utility Libraries
- **nanoid 5.1.5** - Unique ID generator
- **jszip 3.10.1** - File compression library
- **insert-css 2.0.0** - CSS insertion tool

### Development Tools
- **ESLint 9.29.0** - Code quality checker
- **Prettier 3.5.3** - Code formatter
- **Less 4.4.0** - CSS preprocessor

## 📁 Project Structure

```
motes-frontend/
├── src/
│   ├── components/          # Component directory
│   │   ├── LanguageSwitch.vue    # Language switch component
│   │   ├── layout/         # Layout components
│   │   │   ├── AppHeader.vue      # Application header
│   │   │   ├── AppSidebar.vue     # Sidebar
│   │   │   ├── AppDocGrid.vue     # Document grid
│   │   │   ├── AppMote.vue        # Mind map note main component
│   │   │   ├── AppAiGenrate.vue   # AI generation configuration page
│   │   │   ├── AiExpandModal.vue  # AI expansion configuration modal
│   │   │   ├── DocTreeModal.vue   # Document tree selection modal
│   │   │   └── DocContextMenu.vue # Document context menu
│   │   ├── map/           # Mind map components
│   │   │   ├── MapRender.vue      # Graph rendering main component
│   │   │   ├── graphRenderer.ts   # Graph rendering logic
│   │   │   ├── graphEvents.ts     # Graph event handling
│   │   │   ├── NodeCard.vue       # Node operation card
│   │   │   └── NodeOperations.vue # Node operation buttons
│   │   └── note/          # Outline note components
│   │       ├── NoteRender.vue     # Note rendering main component
│   │       ├── NoteOutline.vue    # Outline container
│   │       ├── OutlineNode.vue    # Outline node
│   │       ├── ShortcutsPanel.vue # Shortcuts panel
│   │       └── useNoteScroll.ts   # Scroll sync hook
│   ├── i18n/              # Internationalization configuration
│   │   ├── index.ts       # i18n instance configuration
│   │   └── locales/       # Language pack files
│   │       ├── zh-CN.ts   # Chinese language pack
│   │       └── en-US.ts   # English language pack
│   ├── views/             # Page views
│   │   ├── HomePage.vue   # Home page
│   │   ├── LoginPage.vue  # Login page
│   │   ├── AppLayout.vue  # Application layout
│   │   └── NotFoundPage.vue # 404 page
│   ├── stores/            # State management
│   │   ├── init.ts        # State initialization
│   │   ├── aiStore.ts     # AI feature state management
│   │   ├── userStore.ts   # User state management
│   │   ├── docStore.ts    # Document state management
│   │   ├── moteStore.ts   # Mind map note state management
│   │   └── mote/          # Mind map note sub-states
│   │       ├── index.ts           # Sub-state exports
│   │       ├── keyboardStore.ts   # Keyboard shortcut state
│   │       ├── nodeStateStore.ts  # Node state management
│   │       ├── nodeOperationsStore.ts # Node operation state
│   │       ├── nodeFinderStore.ts # Node finder state
│   │       └── importExportStore.ts # Import/export state
│   ├── services/          # API services
│   │   ├── api.ts         # API base configuration
│   │   ├── index.ts       # Service exports
│   │   ├── userApi.ts     # User-related APIs
│   │   ├── docApi.ts      # Document-related APIs
│   │   ├── moteApi.ts     # Mind map note-related APIs
│   │   └── aiApi.ts       # AI feature-related APIs
│   ├── router/            # Routing configuration
│   │   └── index.ts       # Route definitions
│   ├── utils/             # Utility functions
│   │   ├── index.ts       # Utility function exports
│   │   └── idGenerator.ts # ID generator
│   ├── types/             # TypeScript type definitions
│   │   └── global.d.ts    # Global type definitions
│   ├── styles/            # Style files
│   │   └── antd-overrides.less # Ant Design Vue style overrides
│   ├── App.vue           # Root component
│   └── main.ts           # Application entry
├── package.json         # Project configuration
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── README_en.md         # Project documentation
```

## 🚀 Quick Start

### Environment Requirements
- Node.js >= 18.0.0
- npm >= 8.0.0

### Install Dependencies
```bash
cd motes-frontend
npm install
```

### Development Mode
```bash
npm run dev
```
The application will start at `http://localhost:5173`

### Build Production Version
```bash
npm run build
```

### Preview Build Results
```bash
npm run preview
```

### Code Checks
```bash
# ESLint check
npm run lint

# Type check
npm run type-check

# Code formatting
npm run format
```

## 🔧 Development Guide

### Project Architecture
- **Component-Based Development**: Using Vue 3 Composition API
- **State Management**: Centralized state management with Pinia
- **Routing Management**: Single-page application routing based on Vue Router
- **API Integration**: Unified API service layer design
- **Internationalization Support**: Multi-language support based on Vue I18n

### Component Development
- Use Vue 3 Composition API
- Follow TypeScript type definitions
- Component naming uses PascalCase
- File naming uses kebab-case
- Support internationalized text

### State Management
- Use Pinia for state management
- Store files are placed in the `src/stores/` directory
- Divide stores by functional modules
- Mind map note-related states are further subdivided into sub-modules

### Style Specifications
- Use Less preprocessor
- Follow BEM naming conventions
- Component styles use scoped scope

### API Integration
- API services are placed in the `src/services/` directory
- Use Axios for HTTP requests
- Unified error handling mechanism

## 📱 Functional Features

### AI Features
- ✅ AI Document Generation (based on topics, text, files)
- ✅ AI Node Expansion (automatically generate child nodes for selected nodes)
- ✅ Multi-Model Support (OpenAI, Ollama)
- ✅ Preset Configuration Management
- ✅ File Parsing (PDF, DOCX, Markdown)
- ✅ Real-Time Preview and Confirmation
- ✅ Advanced Parameter Configuration (Temperature, Top P, etc.)

### Mind Map Features
- ✅ Node Creation, Editing, Deletion
- ✅ Keyboard Shortcut Support (Enter, Shift+Enter, Delete, etc.)
- ✅ Node Selection and Editing Operations
- ✅ Automatic Layout Algorithm
- ✅ Zoom and Pan Operations
- ✅ Node Collapse/Expand
- ✅ Node Promote/Demote Operations

### Outline Notes Features
- ✅ Outline View Display
- ✅ Text Editing and Modification
- ✅ Real-Time Data Sync
- ✅ Scroll Position Sync
- ✅ Shortcut Support
- ✅ Node Hierarchy Management

### User Experience
- ✅ Responsive Design
- ✅ Modern UI Interface
- ✅ Smooth Interaction Animations
- ✅ Error Handling and User Prompts
- ✅ Auto Save Function
- ✅ View Switching (Mind Map/Outline Notes)

### Data Management
- ✅ Document Import/Export
- ✅ Auto Save Mechanism
- ✅ Modification Status Tracking
- ✅ Cloud Data Sync

## ⌨️ Keyboard Shortcuts

### Mind Map Note Shortcuts
- **Enter**: Add child node
- **Shift+Enter**: Add sibling node
- **Delete**: Delete node
- **Alt+.**: Expand/Collapse node
- **Ctrl+Left**: Promote node
- **Ctrl+Right**: Demote node
- **Ctrl+Up**: Move node up
- **Ctrl+Down**: Move node down
- **Arrow Keys**: Move selected node
- **Ctrl+E**: AI Expansion (expand selected node)

### General Shortcuts
- **Ctrl+S**: Save document
- **Ctrl+Z**: Undo operation (TODOs)
- **Ctrl+Y**: Redo operation (TODOs)

## 🤖 AI Features in Detail

### AI Document Generation
Supports three input methods to generate mind map notes:

1. **Topic Generation**: Input a topic, and AI automatically generates a related mind map note structure
2. **Text Generation**: Paste or input text content, and AI parses and generates a structured mind map note
3. **File Generation**: Upload PDF, DOCX, or Markdown files, and AI parses the file content to generate a mind map note

### AI Node Expansion
During mind map note editing, after selecting any node:
- Click the "AI Expansion" button in the node operation buttons
- Or use the shortcut `Ctrl+E`
- Configure AI model parameters
- AI automatically generates related child nodes for the selected node

### Preset AI Models

#### Ollama Local Models
- **Qwen2:7b-instruct** - Tongyi Qianwen 2 7B instruction model
- **Llama3.1:8b-instruct** - Meta Llama3.1 8B instruction model
- **Mistral:7b-instruct** - Mistral 7B instruction model
- **Gemma3:4b** - Google Gemma3 4B model

#### OpenAI Compatible Models
- **GPT-4o-mini** - OpenAI GPT-4o mini version
- **GPT-3.5-turbo** - OpenAI GPT-3.5 Turbo
- **DeepSeek V3** - DeepSeek Chat model
- **DeepSeek R1** - DeepSeek Reasoner model
- **Gemini 2.0 Flash** - Google Gemini 2.0 Flash model
- **Gemini 2.0 Flash Exp** - Google Gemini 2.0 Flash Exp model
- **Gemini 1.5 Flash** - Google Gemini 1.5 Flash model

#### Manual Configuration
In addition to preset models, it also supports manual configuration of any OpenAI-compatible API services, including:
- Custom local models
- Third-party AI service providers
- Privately deployed model services

### AI Configuration Parameters
- **Temperature**: Controls generation randomness, range 0-2
- **Top P**: Controls generation diversity, range 0-1
- **Max Tokens**: Limits the length of generated content
- **Depth Limit**: Controls the depth of mind map note levels
- **Branch Factor**: Controls the number of child nodes per node
- **Language Preference**: Supports generation in Chinese and English

## 🧪 Code Quality Checks

```bash
# ESLint check
npm run lint

# Automatically fix ESLint issues
npm run lint:fix

# Type check
npm run type-check

# Code formatting
npm run format
```

## 📊 Performance Optimization

### Build Optimization
- Use Vite for fast builds
- Code splitting and lazy loading
- Static resource optimization

### Runtime Optimization
- Vue 3 reactivity system optimization
- Component lazy loading
- Virtual scrolling (TODOs)

## 🔗 Related Links

- [Vue.js Documentation](https://vuejs.org/)
- [Vue I18n Documentation](https://vue-i18n.intlify.dev/)
- [Ant Design Vue Documentation](https://antdv.com/)
- [AntV X6 Documentation](https://x6.antv.antgroup.com/)

**Motes** - Connect your motes.