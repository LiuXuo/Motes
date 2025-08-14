export default {
  // HomePage.vue 组件的文本
  HomePageVue: {
    // 副标题选项
    subtitleOptions: {
      mindmap: '思维导图',
      outline: '大纲笔记'
    }
  },

  // LoginPage.vue 组件的文本
  LoginPageVue: {
    // 表单占位符
    usernamePlaceholder: '用户名',
    emailPlaceholder: '邮箱',
    passwordPlaceholder: '密码',
    confirmPasswordPlaceholder: '确认密码',

    // 按钮文本
    loginButton: '登录',
    registerButton: '注册',
    loadingLogin: '登录中...',
    loadingRegister: '注册中...',

    // 表单验证错误
    validationErrors: {
      requiredFields: '请填写所有必填项',
      passwordMismatch: '两次输入的密码不一致',
      passwordLength: '密码长度至少6位',
      invalidEmail: '请输入有效的邮箱地址',
      loginFailed: '登录失败，请重试',
      registerFailed: '注册失败，请重试'
    },

    // 成功消息
    successMessages: {
      loginSuccess: '登录成功',
      registerSuccess: '注册成功'
    },

    // 底部提示
    loginHint: '请输入用户名和密码登录',
    registerHint: '请填写完整信息进行注册'
  },

  // NotFoundPage.vue 组件的文本
  NotFoundPageVue: {
    // 页面标题
    pageTitle: '页面未找到',

    // 错误信息
    errorTitle: '页面不存在',
    errorDescription: '抱歉，您访问的页面不存在或已被移除。请检查URL是否正确，或返回首页继续浏览。',

    // 按钮文本
    backHomeButton: '返回首页',
    goBackButton: '返回上页'
  },

  // AppLayout.vue 组件的文本
  AppLayoutVue: {
    // 布局相关文本（如果有的话）
  },

  // AppHeader.vue 组件的文本
  AppHeaderVue: {
    // 面包屑导航
    breadcrumb: {
      documents: '我的文档',
      trash: '回收站',
      ai: 'AI 生成'
    },

    // 保存按钮
    save: '保存',
    saved: '已保存',

    // 视图模式切换
    viewMode: {
      map: '思维导图',
      note: '大纲笔记'
    },

    // 用户菜单
    logout: '登出',

    // 消息提示
    messages: {
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      saveError: '保存过程中发生错误'
    }
  },

  // AppAiGenrate.vue 组件的文本
  AppAiGenrateVue: {
    // 页面标题
    title: 'AI 生成配置',

    // 表单字段
    inputType: '输入类型',
    importTo: '导入到',
    theme: '主题',
    text: '文本',
    documentFile: '文档文件',
    preset: '预设',
    model: '模型',
    apiKey: 'API Key',
    baseUrl: 'Base URL',
    temperature: '温度',
    topP: 'Top P',
    maxLevel: '最大层级',
    maxBranches: '每层最大分支数',
    outputLanguage: '输出语言',

    // 输入类型选项
    inputTypeOptions: {
      theme: '主题',
      text: '文本',
      file: '文件'
    },

    // 占位符
    placeholders: {
      selectTargetFolder: '请选择目标文件夹',
      enterTheme: '请输入一个主题',
      pasteOrEnterText: '粘贴或输入文本',
      selectFile: '选择文件（PDF/DOCX/MD）',
      selectPreset: '选择预设或手动配置',
      enterApiKey: '请输入 API Key',
      enterBaseUrl: '请输入 Base URL',
      enterModel: '如 gpt-4o-mini 或 qwen2:7b-instruct',
      temperatureHint: '控制随机性，越高越发散（0-2）',
      topPHint: '核采样阈值，越小越保守（0-1）',
      apiKeyHint: '不保存，仅本次使用'
    },

    // 按钮文本
    buttons: {
      generate: '生成预览',
      generating: '生成中...',
      selectFile: '选择文件',
      selectFolder: '选择文件夹',
      importCreate: '导入创建'
    },

    // 分割线
    dividers: {
      modelConfig: '模型配置',
      generationConstraints: '生成约束'
    },

    // 语言选项
    languages: {
      zh: '中文',
      en: '英文'
    },

    // 消息提示
    messages: {
      selectFolderFirst: '请先选择目标文件夹',
      fileUploadSuccess: '文件上传成功',
      fileUploadError: '文件上传失败',
      generationSuccess: '生成成功',
      generationFailed: '生成失败',
      invalidFileType: '不支持的文件类型',
      fileTooLarge: '文件大小不能超过 10MB',
      importSuccess: '导入成功',
      importFailed: '导入失败',
      validationErrors: {
        selectTargetFolder: '请选择目标文件夹',
        enterModel: '请输入模型名称',
        enterBaseUrl: '请输入 Base URL',
        enterApiKey: '请输入 API Key',
        enterTheme: '请输入主题',
        enterText: '请输入文本内容',
        selectFile: '请选择文件'
      }
    }
  },

  // aiStore.ts 的文本
  aiStoreTs: {
    // 预设配置名称
    presets: {
      manualOllamaCustom: '本地(Ollama) - 手动配置',
      ollamaQwen2: 'Ollama - Qwen2:7b-instruct',
      ollamaLlama3: 'Ollama - Llama3.1:8b-instruct',
      ollamaMistral: 'Ollama - Mistral:7b-instruct',
      ollamaGemma3: 'Ollama - Gemma3:4b',
      manualOpenaiCustom: '云端(OpenAI兼容) - 手动配置',
      openaiGpt4oMini: 'OpenAI - GPT-4o-mini',
      openaiGpt35Turbo: 'OpenAI - GPT-3.5-turbo',
      deepseekChat: 'OpenAI兼容 - DeepSeek V3',
      deepseekReasoner: 'OpenAI兼容 - DeepSeek R1',
      gemini20Flash: 'OpenAI兼容 - Gemini 2.0 Flash',
      gemini20FlashExp: 'OpenAI兼容 - Gemini 2.0 Flash Exp',
      gemini15Flash: 'OpenAI兼容 - Gemini 1.5 Flash'
    },

    // AI生枝相关消息
    aiExpand: {
      success: '成功生成 {count} 个新节点',
      failed: 'AI生枝失败: {error}',
      unknownError: '未知错误'
    }
  },

  // AppDocGrid.vue 组件的文本
  AppDocGridVue: {
    // 页面标题
    titles: {
      documents: '我的文档',
      folder: '文件夹',
      trash: '回收站'
    },

    // 加载状态
    loading: '正在加载文档...',

    // 空状态
    empty: '暂无内容',

    // 移动对话框
    moveModal: {
      title: '选择目标文件夹',
      okText: '移动到此处'
    },

    // 重命名对话框
    renameModal: {
      title: '重命名',
      placeholder: '请输入新名称'
    },

    // 消息提示
    messages: {
      createSuccess: '创建成功',
      createFailed: '创建失败',
      duplicateSuccess: '副本创建成功',
      duplicateFailed: '创建副本失败',
      moveSuccess: '移动成功',
      moveFailed: '移动失败',
      renameSuccess: '重命名成功',
      renameFailed: '重命名失败',
      deleteSuccess: '删除成功',
      deleteFailed: '删除失败',
      restoreSuccess: '恢复成功',
      restoreFailed: '恢复失败',
      permanentDeleteSuccess: '永久删除成功',
      permanentDeleteFailed: '永久删除失败'
    }
  },

  // AppSidebar.vue 组件的文本
  AppSidebarVue: {
    // 菜单项
    menuItems: {
      ai: 'AI 生成',
      documents: '我的文档'
    },

    // 搜索
    search: '搜索',

    // 新建菜单
    addMenu: {
      newMote: '新建文档',
      newFolder: '新建文件夹',
      import: '导入文档',
      importJson: 'JSON格式',
      importMarkdown: 'Markdown格式',
      export: '导出文档',
      exportJson: 'JSON格式',
      exportMarkdown: 'Markdown格式'
    },

    // 消息提示
    messages: {
      createSuccess: '创建成功',
      createFailed: '创建失败',
      importSuccess: '导入成功',
      importFailed: '导入失败',
      exportSuccess: '导出成功',
      exportFailed: '导出失败',
      loading: '文档树正在加载中，请稍后再试',
      fetchDocTreeFailed: '无法获取文档树，请刷新页面重试',
      fetchRootFailed: '无法获取根节点，请刷新页面重试'
    }
  },

  // AppMote.vue 组件的文本
  AppMoteVue: {
    // 页面标题
    title: '脑图笔记',

    // 工具栏
    toolbar: {
      undo: '撤销',
      redo: '重做',
      zoomIn: '放大',
      zoomOut: '缩小',
      fitToScreen: '适应屏幕',
      centerView: '居中显示'
    },

    // 消息提示
    messages: {
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      saveError: '保存过程中发生错误',
      loadFailed: '加载失败',
      notFound: '脑图笔记不存在'
    }
  },

  // AiExpandModal.vue 组件的文本
  AiExpandModalVue: {
    // 对话框标题
    title: 'AI 生枝',

    // 表单字段
    preset: '预设配置',
    model: '模型',
    baseUrl: '服务地址',
    apiKey: 'API Key',
    temperature: '温度',
    topP: 'Top P',
    maxLevel: '最大层级',
    maxBranches: '每层最大分支数',
    outputLanguage: '输出语言',
    more: '更多配置',

    // 占位符
    placeholders: {
      selectPreset: '选择预设配置',
      enterModel: '如 gpt-4o-mini 或 qwen2:7b-instruct',
      enterBaseUrl: '请输入服务地址',
      apiKeyHint: '不保存，仅本次使用',
      temperatureHint: '0.7',
      topPHint: '0.9'
    },

    // 语言选项
    languages: {
      zh: '中文',
      en: '英文'
    },

    // 按钮文本
    buttons: {
      expand: '生枝',
      expanding: '生枝中...',
      cancel: '取消'
    },

    // 消息提示
    messages: {
      expandSuccess: '生枝成功',
      expandFailed: '生枝失败',
      invalidPrompt: '请输入有效的提示词',
      validationErrors: {
        enterModel: '请输入模型名称',
        enterBaseUrl: '请输入服务地址',
        enterApiKey: '请输入 API Key'
      }
    }
  },

  // DocTreeModal.vue 组件的文本
  DocTreeModalVue: {
    // 默认标题
    defaultTitle: '选择文档',

    // 按钮文本
    buttons: {
      confirm: '确认',
      cancel: '取消'
    },

    // 消息提示
    messages: {
      selectRequired: '请选择一个文档',
      noDocuments: '暂无文档'
    }
  },

  // DocContextMenu.vue 组件的文本
  DocContextMenuVue: {
    // 菜单项
    menuItems: {
      open: '打开',
      rename: '重命名',
      move: '移动到',
      delete: '删除',
      restore: '恢复',
      export: '导出',
      copy: '创建副本',
      cut: '剪切',
      paste: '粘贴'
    },

    // 子菜单
    subMenus: {
      export: {
        json: 'JSON格式',
        markdown: 'Markdown格式'
      }
    }
  },

  // MapRender.vue 组件的文本
  MapRenderVue: {
    // 缩放控制
    zoomControl: {
      minZoom: '最小缩放',
      maxZoom: '最大缩放'
    }
  },

  // NodeCard.vue 组件的文本
  NodeCardVue: {
    // 节点ID显示
    nodeId: 'ID',

    // 快捷键说明
    shortcuts: {
      clickNode: '单击节点选中',
      clickToEdit: '点击选中节点编辑',
      clickBlank: '点击空白处取消选中',
      arrowKeys: '方向键移动所选节点'
    }
  },

  // NodeOperations.vue 组件的文本
  NodeOperationsVue: {
    // 基础操作按钮
    basicOperations: {
      addChild: {
        title: '新增子节点(Enter)',
        shortcut: 'Enter'
      },
      addSibling: {
        title: '新增同级节点(Shift+Enter)',
        shortcut: 'Shift+Enter'
      },
      delete: {
        title: '删除节点(Delete)',
        shortcut: 'Delete'
      },
      toggleCollapse: {
        title: '展开/折叠(Alt+.)',
        shortcut: 'Alt+.'
      },
      promote: {
        title: '升级节点(Ctrl+Left)',
        shortcut: 'Ctrl+Left'
      },
      demote: {
        title: '降级节点(Ctrl+Right)',
        shortcut: 'Ctrl+Right'
      },
      moveUp: {
        title: '上移节点(Ctrl+Up)',
        shortcut: 'Ctrl+Up'
      },
      moveDown: {
        title: '下移节点(Ctrl+Down)',
        shortcut: 'Ctrl+Down'
      }
    },

    // AI生枝操作
    aiExpand: {
      title: 'AI生枝(Ctrl+E)',
      shortcut: 'Ctrl+E'
    }
  },

    // ShortcutsPanel.vue 组件的文本
  ShortcutsPanelVue: {
    // 快捷键描述
    descriptions: {
      aiExpand: 'AI 生枝',
      clickSelect: '单击选中',
      clickEdit: '点击选中节点编辑',
      previousNode: '上一个节点',
      nextNode: '下一个节点',
      deselect: '取消选中',
      addChild: '添加子节点',
      addSibling: '添加同级节点',
      deleteNode: '删除节点',
      demoteNode: '降级节点',
      promoteNode: '升级节点',
      moveUp: '向上移动',
      moveDown: '向下移动',
      toggleCollapse: '折叠/展开'
    },

    // 提示文本
    popupTooltip: '快捷键'
  },

  // NoteRender.vue 组件的文本
  NoteRenderVue: {
    // 组件功能描述
    description: '大纲笔记渲染组件'
  },

  // NoteOutline.vue 组件的文本
  NoteOutlineVue: {
    // 组件功能描述
    description: '大纲笔记容器组件'
  },

  // OutlineNode.vue 组件的文本
  OutlineNodeVue: {
    // 组件功能描述
    description: '大纲节点组件'
  },

  // LanguageSwitch.vue 组件的文本
  LanguageSwitchVue: {
    // 语言选项
    languages: {
      zhCN: '中文',
      enUS: 'English'
    },

    // 提示文本
    tooltips: {
      zhCN: '切换语言 / Switch Language',
      enUS: 'Switch Language / 切换语言'
    }
  },

  // 通用文本（跨文件使用）
  common: {
    login: '登录',
    register: '注册',
    username: '用户名',
    password: '密码',
    loading: '加载中...',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    create: '新建',
    import: '导入',
    export: '导出',
    move: '移动',
    copy: '复制',
    cut: '剪切',
    paste: '粘贴',
    rename: '重命名',
    restore: '恢复',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    refresh: '刷新',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    finish: '完成',
    submit: '提交',
    reset: '重置',
    clear: '清空',
    select: '选择',
    upload: '上传',
    download: '下载',
    preview: '预览',
    view: '查看',
    hide: '隐藏',
    show: '显示',
    expand: '展开',
    collapse: '收起',
    zoomIn: '放大',
    zoomOut: '缩小',
    fitToScreen: '适应屏幕',
    centerView: '居中显示',
    undo: '撤销',
    redo: '重做',
    selectAll: '全选',
    deselectAll: '取消全选',
    itemCount: '没有项目 | 1 个项目 | {count} 个项目',
    root: '根目录',
    selected: '选中节点',
    more: '更多配置',
    maxLevel: '最大层级',
    maxBranches: '每层最大分支数',
    outputLanguage: '输出语言'
  },

  // 应用级文本
  app: {
    name: 'Motes',
    concept: 'Motes 致力于将碎片化的知识微粒连接起来，通过思维导图的视觉化展示和大纲笔记的结构化组织，帮助用户构建完整的知识体系。',
    slogan: '连接你的思维微粒',
    loginNow: '立即登录',
    freeRegister: '免费注册',
    enterApp: '进入应用',
    copyright: '© 2025 Motes. Connect your motes.'
  },

  // 功能特性文本
  features: {
    aiGenerate: {
      title: 'AI 生成',
      description: '基于文本或文档智能生成思维导图，快速构建知识结构'
    },
    mindMap: {
      title: '思维导图',
      description: '基于 AntV X6 图形引擎，提供流畅的思维导图编辑体验'
    },
    outlineNote: {
      title: '大纲笔记',
      description: '结构化的笔记编辑，支持多级层次和快速导航'
    }
  },

  // 页面级文本
  pages: {
    notFound: '页面未找到'
  },

  // 错误信息
  errors: {
    notFound: {
      title: '页面不存在',
      description: '抱歉，您访问的页面不存在或已被移除。请检查URL是否正确，或返回首页继续浏览。',
      backHome: '返回首页',
      goBack: '返回上页'
    },
    networkError: '网络连接失败，请检查网络设置',
    validationError: '输入数据验证失败',
    unknownError: '发生未知错误，请稍后重试',
    fileUploadError: '文件上传失败',
    saveError: '保存失败',
    loadError: '加载失败',
    operationError: '操作失败'
  }
}
