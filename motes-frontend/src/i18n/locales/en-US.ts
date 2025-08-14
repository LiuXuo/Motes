export default {
  // HomePage.vue component texts
  HomePageVue: {
    // Subtitle options
    subtitleOptions: {
      mindmap: 'Mind Map',
      outline: 'Outline Note'
    }
  },

  // LoginPage.vue component texts
  LoginPageVue: {
    // Form placeholders
    usernamePlaceholder: 'Username',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    confirmPasswordPlaceholder: 'Confirm Password',

    // Button texts
    loginButton: 'Login',
    registerButton: 'Register',
    loadingLogin: 'Logging in...',
    loadingRegister: 'Registering...',

    // Form validation errors
    validationErrors: {
      requiredFields: 'Please fill in all required fields',
      passwordMismatch: 'Passwords do not match',
      passwordLength: 'Password must be at least 6 characters',
      invalidEmail: 'Please enter a valid email address',
      loginFailed: 'Login failed, please try again',
      registerFailed: 'Registration failed, please try again'
    },

    // Success messages
    successMessages: {
      loginSuccess: 'Login successful',
      registerSuccess: 'Registration successful'
    },

    // Bottom hints
    loginHint: 'Please enter your username and password to login',
    registerHint: 'Please fill in all information to register'
  },

  // NotFoundPage.vue component texts
  NotFoundPageVue: {
    // Page title
    pageTitle: 'Page Not Found',

    // Error messages
    errorTitle: 'Page Does Not Exist',
    errorDescription: 'Sorry, the page you are looking for does not exist or has been removed. Please check if the URL is correct, or return to the homepage to continue browsing.',

    // Button texts
    backHomeButton: 'Back to Home',
    goBackButton: 'Go Back'
  },

  // AppLayout.vue component texts
  AppLayoutVue: {
    // Layout related texts (if any)
  },

  // AppHeader.vue component texts
  AppHeaderVue: {
    // Breadcrumb navigation
    breadcrumb: {
      documents: 'My Documents',
      trash: 'Trash',
      ai: 'AI Generate'
    },

    // Save button
    save: 'Save',
    saved: 'Saved',

    // View mode toggle
    viewMode: {
      map: 'Mind Map',
      note: 'Outline Note'
    },

    // User menu
    logout: 'Logout',

    // Messages
    messages: {
      saveSuccess: 'Save successful',
      saveFailed: 'Save failed',
      saveError: 'An error occurred during save'
    }
  },

  // AppAiGenrate.vue component texts
  AppAiGenrateVue: {
    // Page title
    title: 'AI Generate Configuration',

    // Form fields
    inputType: 'Input Type',
    importTo: 'Import To',
    theme: 'Theme',
    text: 'Text',
    documentFile: 'Document File',
    preset: 'Preset',
    model: 'Model',
    apiKey: 'API Key',
    baseUrl: 'Base URL',
    temperature: 'Temperature',
    topP: 'Top P',
    maxLevel: 'Max Level',
    maxBranches: 'Max Branches per Level',
    outputLanguage: 'Output Language',

    // Input type options
    inputTypeOptions: {
      theme: 'Theme',
      text: 'Text',
      file: 'File'
    },

    // Placeholders
    placeholders: {
      selectTargetFolder: 'Please select target folder',
      enterTheme: 'Please enter a theme',
      pasteOrEnterText: 'Paste or enter text',
      selectFile: 'Select file (PDF/DOCX/MD)',
      selectPreset: 'Select preset or configure manually',
      enterApiKey: 'Please enter API Key',
      enterBaseUrl: 'Please enter Base URL',
      enterModel: 'e.g. gpt-4o-mini or qwen2:7b-instruct',
      temperatureHint: 'Controls randomness, higher values are more divergent (0-2)',
      topPHint: 'Nucleus sampling threshold, smaller values are more conservative (0-1)',
      apiKeyHint: 'Not saved, only for this session'
    },

    // Button texts
    buttons: {
      generate: 'Generate Preview',
      generating: 'Generating...',
      selectFile: 'Select File',
      selectFolder: 'Select Folder',
      importCreate: 'Import & Create'
    },

    // Dividers
    dividers: {
      modelConfig: 'Model Configuration',
      generationConstraints: 'Generation Constraints'
    },

    // Language options
    languages: {
      zh: 'Chinese',
      en: 'English'
    },

    // Messages
    messages: {
      selectFolderFirst: 'Please select target folder first',
      fileUploadSuccess: 'File upload successful',
      fileUploadError: 'File upload failed',
      generationSuccess: 'Generation successful',
      generationFailed: 'Generation failed',
      invalidFileType: 'Unsupported file type',
      fileTooLarge: 'File size cannot exceed 10MB',
      importSuccess: 'Import successful',
      importFailed: 'Import failed',
      validationErrors: {
        selectTargetFolder: 'Please select target folder',
        enterModel: 'Please enter model name',
        enterBaseUrl: 'Please enter Base URL',
        enterApiKey: 'Please enter API Key',
        enterTheme: 'Please enter theme',
        enterText: 'Please enter text content',
        selectFile: 'Please select file'
      }
    }
  },

  // aiStore.ts component texts
  aiStoreTs: {
    // Preset configuration names
    presets: {
      manualOllamaCustom: 'Local (Ollama) - Manual Config',
      ollamaQwen2: 'Ollama - Qwen2:7b-instruct',
      ollamaLlama3: 'Ollama - Llama3.1:8b-instruct',
      ollamaMistral: 'Ollama - Mistral:7b-instruct',
      ollamaGemma3: 'Ollama - Gemma3:4b',
      manualOpenaiCustom: 'Cloud (OpenAI Compatible) - Manual Config',
      openaiGpt4oMini: 'OpenAI - GPT-4o-mini',
      openaiGpt35Turbo: 'OpenAI - GPT-3.5-turbo',
      deepseekChat: 'OpenAI Compatible - DeepSeek V3',
      deepseekReasoner: 'OpenAI Compatible - DeepSeek R1',
      gemini20Flash: 'OpenAI Compatible - Gemini 2.0 Flash',
      gemini20FlashExp: 'OpenAI Compatible - Gemini 2.0 Flash Exp',
      gemini15Flash: 'OpenAI Compatible - Gemini 1.5 Flash'
    },

    // AI expand related messages
    aiExpand: {
      success: 'Successfully generated {count} new nodes',
      failed: 'AI expand failed: {error}',
      unknownError: 'Unknown error'
    }
  },

  // AppDocGrid.vue component texts
  AppDocGridVue: {
    // Page titles
    titles: {
      documents: 'My Documents',
      folder: 'Folder',
      trash: 'Trash'
    },

    // Loading state
    loading: 'Loading documents...',

    // Empty state
    empty: 'No content',

    // Move modal
    moveModal: {
      title: 'Select Target Folder',
      okText: 'Move Here'
    },

    // Rename modal
    renameModal: {
      title: 'Rename',
      placeholder: 'Please enter new name'
    },

    // Messages
    messages: {
      createSuccess: 'Create successful',
      createFailed: 'Create failed',
      duplicateSuccess: 'Duplicate successful',
      duplicateFailed: 'Duplicate failed',
      moveSuccess: 'Move successful',
      moveFailed: 'Move failed',
      renameSuccess: 'Rename successful',
      renameFailed: 'Rename failed',
      deleteSuccess: 'Delete successful',
      deleteFailed: 'Delete failed',
      restoreSuccess: 'Restore successful',
      restoreFailed: 'Restore failed',
      permanentDeleteSuccess: 'Permanent delete successful',
      permanentDeleteFailed: 'Permanent delete failed'
    }
  },

  // AppSidebar.vue component texts
  AppSidebarVue: {
    // Menu items
    menuItems: {
      ai: 'AI Generate',
      documents: 'My Documents'
    },

    // Search
    search: 'Search',

    // Add menu
    addMenu: {
      newMote: 'New Mote',
      newFolder: 'New Folder',
      import: 'Import Mote',
      importJson: 'JSON Format',
      importMarkdown: 'Markdown Format',
      export: 'Export Mote',
      exportJson: 'JSON Format',
      exportMarkdown: 'Markdown Format'
    },

    // Messages
    messages: {
      createSuccess: 'Create successful',
      createFailed: 'Create failed',
      importSuccess: 'Import successful',
      importFailed: 'Import failed',
      exportSuccess: 'Export successful',
      exportFailed: 'Export failed',
      loading: 'Document tree is loading, please try again later',
      fetchDocTreeFailed: 'Unable to fetch document tree, please refresh the page',
      fetchRootFailed: 'Unable to fetch root node, please refresh the page'
    }
  },

  // AppMote.vue component texts
  AppMoteVue: {
    // Page title
    title: 'Mind Map Note',

    // Toolbar
    toolbar: {
      undo: 'Undo',
      redo: 'Redo',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      fitToScreen: 'Fit to Screen',
      centerView: 'Center View'
    },

    // Messages
    messages: {
      saveSuccess: 'Save successful',
      saveFailed: 'Save failed',
      saveError: 'An error occurred during save',
      loadFailed: 'Load failed',
      notFound: 'Mind map note does not exist'
    }
  },

  // AiExpandModal.vue component texts
  AiExpandModalVue: {
    // Dialog title
    title: 'AI Expand',

    // Form fields
    preset: 'Preset',
    model: 'Model',
    baseUrl: 'Base URL',
    apiKey: 'API Key',
    temperature: 'Temperature',
    topP: 'Top P',
    maxLevel: 'Max Level',
    maxBranches: 'Max Branches per Level',
    outputLanguage: 'Output Language',
    more: 'More Configuration',

    // Placeholders
    placeholders: {
      selectPreset: 'Select preset configuration',
      enterModel: 'e.g. gpt-4o-mini or qwen2:7b-instruct',
      enterBaseUrl: 'Please enter base URL',
      apiKeyHint: 'Not saved, only for this session',
      temperatureHint: '0.7',
      topPHint: '0.9'
    },

    // Language options
    languages: {
      zh: 'Chinese',
      en: 'English'
    },

    // Button texts
    buttons: {
      expand: 'Expand',
      expanding: 'Expanding...',
      cancel: 'Cancel'
    },

    // Messages
    messages: {
      expandSuccess: 'Expand successful',
      expandFailed: 'Expand failed',
      invalidPrompt: 'Please enter a valid prompt',
      validationErrors: {
        enterModel: 'Please enter model name',
        enterBaseUrl: 'Please enter base URL',
        enterApiKey: 'Please enter API Key'
      }
    }
  },

  // DocTreeModal.vue component texts
  DocTreeModalVue: {
    // Default title
    defaultTitle: 'Select Document',

    // Button texts
    buttons: {
      confirm: 'Confirm',
      cancel: 'Cancel'
    },

    // Messages
    messages: {
      selectRequired: 'Please select a document',
      noDocuments: 'No documents'
    }
  },

  // DocContextMenu.vue component texts
  DocContextMenuVue: {
    // Menu items
    menuItems: {
      open: 'Open',
      rename: 'Rename',
      move: 'Move To',
      delete: 'Delete',
      restore: 'Restore',
      export: 'Export',
      copy: 'Duplicate',
      cut: 'Cut',
      paste: 'Paste'
    },

    // Sub menus
    subMenus: {
      export: {
        json: 'JSON Format',
        markdown: 'Markdown Format'
      }
    }
  },

  // MapRender.vue component texts
  MapRenderVue: {
    // Zoom control
    zoomControl: {
      minZoom: 'Min Zoom',
      maxZoom: 'Max Zoom'
    }
  },

  // NodeCard.vue component texts
  NodeCardVue: {
    // Node ID display
    nodeId: 'ID',

    // Shortcut hints
    shortcuts: {
      clickNode: 'Click node to select',
      clickToEdit: 'Click selected node to edit',
      clickBlank: 'Click blank area to deselect',
      arrowKeys: 'Use arrow keys to move selected node'
    }
  },

  // NodeOperations.vue component texts
  NodeOperationsVue: {
    // Basic operation buttons
    basicOperations: {
      addChild: {
        title: 'Add Child Node (Enter)',
        shortcut: 'Enter'
      },
      addSibling: {
        title: 'Add Sibling Node (Shift+Enter)',
        shortcut: 'Shift+Enter'
      },
      delete: {
        title: 'Delete Node (Delete)',
        shortcut: 'Delete'
      },
      toggleCollapse: {
        title: 'Expand/Collapse (Alt+.)',
        shortcut: 'Alt+.'
      },
      promote: {
        title: 'Promote Node (Ctrl+Left)',
        shortcut: 'Ctrl+Left'
      },
      demote: {
        title: 'Demote Node (Ctrl+Right)',
        shortcut: 'Ctrl+Right'
      },
      moveUp: {
        title: 'Move Up (Ctrl+Up)',
        shortcut: 'Ctrl+Up'
      },
      moveDown: {
        title: 'Move Down (Ctrl+Down)',
        shortcut: 'Ctrl+Down'
      }
    },

    // AI expand operation
    aiExpand: {
      title: 'AI Expand (Ctrl+E)',
      shortcut: 'Ctrl+E'
    }
  },

    // ShortcutsPanel.vue component texts
  ShortcutsPanelVue: {
    // Shortcut descriptions
    descriptions: {
      aiExpand: 'AI Expand',
      clickSelect: 'Click to select',
      clickEdit: 'Click selected node to edit',
      previousNode: 'Previous node',
      nextNode: 'Next node',
      deselect: 'Deselect',
      addChild: 'Add child node',
      addSibling: 'Add sibling node',
      deleteNode: 'Delete node',
      demoteNode: 'Demote node',
      promoteNode: 'Promote node',
      moveUp: 'Move up',
      moveDown: 'Move down',
      toggleCollapse: 'Expand/Collapse'
    },

    // Tooltip text
    popupTooltip: 'Shortcuts'
  },

  // NoteRender.vue component texts
  NoteRenderVue: {
    // Component description
    description: 'Outline note rendering component'
  },

  // NoteOutline.vue component texts
  NoteOutlineVue: {
    // Component description
    description: 'Outline note container component'
  },

  // OutlineNode.vue component texts
  OutlineNodeVue: {
    // Component description
    description: 'Outline node component'
  },

  // LanguageSwitch.vue component texts
  LanguageSwitchVue: {
    // Language options
    languages: {
      zhCN: '中文',
      enUS: 'English'
    },

    // Tooltip texts
    tooltips: {
      zhCN: '切换语言 / Switch Language',
      enUS: 'Switch Language / 切换语言'
    }
  },

  // Common texts (used across files)
  common: {
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    import: 'Import',
    export: 'Export',
    move: 'Move',
    copy: 'Copy',
    cut: 'Cut',
    paste: 'Paste',
    rename: 'Rename',
    restore: 'Restore',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    submit: 'Submit',
    reset: 'Reset',
    clear: 'Clear',
    select: 'Select',
    upload: 'Upload',
    download: 'Download',
    preview: 'Preview',
    view: 'View',
    hide: 'Hide',
    show: 'Show',
    expand: 'Expand',
    collapse: 'Collapse',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    fitToScreen: 'Fit to Screen',
    centerView: 'Center View',
    undo: 'Undo',
    redo: 'Redo',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    itemCount: 'no items | 1 item | {count} items',
    root: 'Root Directory',
    selected: 'Selected Node',
    more: 'More Configuration',
    maxLevel: 'Max Level',
    maxBranches: 'Max Branches per Level',
    outputLanguage: 'Output Language'
  },

  // App-level texts
  app: {
    name: 'Motes',
    concept: 'Motes is dedicated to connecting fragmented knowledge particles, helping users build a complete knowledge system through visual display of mind maps and structured organization of outline notes.',
    slogan: 'Connect your motes',
    loginNow: 'Login Now',
    freeRegister: 'Free Register',
    enterApp: 'Enter App',
    copyright: '© 2025 Motes. Connect your motes.'
  },

  // Feature texts
  features: {
    aiGenerate: {
      title: 'AI Generate',
      description: 'Generate mind maps based on text or docs, quickly building knowledge structures'
    },
    mindMap: {
      title: 'Mind Map',
      description: 'Powered by AntV X6 graphics engine, provides a smooth mind map editing experience'
    },
    outlineNote: {
      title: 'Outline Note',
      description: 'Structured note editing with multi-level hierarchy and quick navigation'
    }
  },

  // Page-level texts
  pages: {
    notFound: 'Page Not Found'
  },

  // Error messages
  errors: {
    notFound: {
      title: 'Page Does Not Exist',
      description: 'Sorry, the page you are looking for does not exist or has been removed. Please check if the URL is correct, or return to the homepage to continue browsing.',
      backHome: 'Back to Home',
      goBack: 'Go Back'
    },
    networkError: 'Network connection failed, please check network settings',
    validationError: 'Input data validation failed',
    unknownError: 'An unknown error occurred, please try again later',
    fileUploadError: 'File upload failed',
    saveError: 'Save failed',
    loadError: 'Load failed',
    operationError: 'Operation failed'
  }
}
