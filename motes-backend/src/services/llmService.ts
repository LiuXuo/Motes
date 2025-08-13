/**
 * 大语言模型服务类
 * 
 * 负责与各种 LLM 提供商的交互，包括：
 * - OpenAI API 集成
 * - Ollama 本地模型集成
 * - 大纲生成功能
 * - 节点扩展功能
 * - 代理配置支持
 * 
 */
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import type { MoteTreeNode } from '../types/common';

// ==================== 类型定义 ====================

/**
 * 定义 LLM 提供商的基本配置参数。
 * 
 * @interface ProviderConfig
 */
export type ProviderConfig = {
  /** 提供商类型 */
  type: 'openai' | 'ollama'
  /** 基础 URL，可选 */
  baseUrl?: string
  /** API 密钥，可选 */
  apiKey?: string
  /** 模型名称 */
  model: string
  /** 温度参数，控制输出的随机性 */
  temperature?: number
  /** Top-p 参数，控制输出的多样性 */
  top_p?: number
}

/**
 * 定义大纲结构中的节点。
 * 
 * @interface OutlineNode
 */
export type OutlineNode = {
  /** 节点文本内容 */
  text: string
  /** 子节点数组，可选 */
  children?: OutlineNode[]
}

/**
 * 包含大纲的标题和节点结构。
 * 
 * @interface OutlineResult
 */
export type OutlineResult = {
  /** 大纲标题 */
  title: string
  /** 大纲节点数组 */
  nodes: OutlineNode[]
}

/**
 * 定义大纲生成的输入类型。
 * 
 * @interface GenerateInput
 */
type GenerateInput = {
  /** 输入类型：主题或文本 */
  inputType: 'theme' | 'text'
  /** 主题内容，当 inputType 为 'theme' 时使用 */
  theme?: string
  /** 文本内容，当 inputType 为 'text' 时使用 */
  text?: string
}

/**
 * 定义大纲生成的配置选项。
 * 
 * @interface GenerateOptions
 */
type GenerateOptions = {
  /** 最大层级深度 */
  depthLimit?: number
  /** 每层最大分支数 */
  branchingFactor?: number
  /** 输出语言 */
  language?: string
  /** 最大 token 数 */
  maxTokens?: number
}

/**
 * 定义节点扩展的输入参数。
 * 
 * @interface ExpandNodeInput
 */
type ExpandNodeInput = {
  /** 当前脑图树结构 */
  moteTree: MoteTreeNode
  /** 选中的节点文本 */
  selectedNodeText: string
  /** 扩展选项 */
  options: {
    /** 最大新节点数 */
    maxNewNodes: number
    /** 最大深度 */
    depth: number
    /** 输出语言 */
    language: string
  }
}

// ==================== LLM服务类 ====================

/**
 * 大语言模型服务类
 * 
 * 负责与各种 LLM 提供商的交互，支持大纲生成和节点扩展功能。
 * 支持 OpenAI 和 Ollama 两种提供商，具备代理配置和错误处理能力。
 * 
 * @class LLMService
 */
export class LLMService {
  /** 提供商配置 */
  private config: ProviderConfig;
  /** 是否使用了兜底方案 */
  private lastUsedFallback = false;

  /**
   * 构造函数
   * 
   * @param {ProviderConfig} config - 提供商配置
   */
  constructor(config: ProviderConfig) {
    this.config = config;
  }

  // ==================== 公共方法 ====================

  /**
   * 生成大纲结构
   * 
   * 基于主题或文本内容生成多级结构化大纲。
   * 支持自定义深度、分支数和语言等参数。
   * 
   * @param {GenerateInput} input - 生成输入参数
   * @param {GenerateOptions} [options] - 生成选项
   * @returns {Promise<OutlineResult>} 生成的大纲结果
   * 
   * @throws {400} 当模型不存在或未安装时
   * @throws {502} 当模型调用失败或输出格式无效时
   * 
   * @example
   * const llm = new LLMService({ type: 'openai', model: 'gpt-3.5-turbo' });
   * const outline = await llm.generateOutline(
   *   { inputType: 'theme', theme: '人工智能' },
   *   { depthLimit: 3, language: '中文' }
   * );
   */
  async generateOutline(input: GenerateInput, options?: GenerateOptions): Promise<OutlineResult> {
    const baseUrl = this.resolveBaseUrl();
    const temperature = this.config.temperature ?? (this.config.type === 'ollama' ? 0.2 : 0.7);
    const top_p = this.config.top_p ?? 0.9;
    const depthLimit = options?.depthLimit ?? 4;
    const branching = options?.branchingFactor ?? 4;
    const language = options?.language ?? '中文';
    const maxTokens = options?.maxTokens ?? 1200;

    const systemPrompt = this.buildSystemPrompt(depthLimit, branching, language);
    const userPrompt = this.buildUserPrompt(input, language);

    const requestBody = {
      model: this.config.model,
      temperature,
      top_p,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
    };

    try {
      this.lastUsedFallback = false;
      const resp = await this.makeRequest(baseUrl, requestBody);
      const content = resp.data?.choices?.[0]?.message?.content ?? '';
      const parsed = this.tryParseOutline(content, input);
      
      if (parsed) return parsed;
      
      throw {
        status: 502,
        error: {
          code: 'LLM_INVALID_OUTPUT',
          message: '模型输出不符合要求（非合法JSON）',
          details: '请尝试更换模型或简化/收紧提示词后重试',
        },
      };
    } catch (err) {
      this.handleRequestError(err);
    }
  }

  /**
   * 扩展节点
   * 
   * 基于现有脑图结构为选中的节点生成相关子节点。
   * 支持多层嵌套结构生成。
   * 
   * @param {ExpandNodeInput} input - 扩展节点输入参数
   * @returns {Promise<MoteTreeNode>} 扩展后的节点结构
   * 
   * @throws {400} 当模型不存在或未安装时
   * @throws {502} 当模型调用失败或输出格式无效时
   * 
   * @example
   * const expandedNode = await llm.expandNode({
   *   moteTree: currentTree,
   *   selectedNodeText: '机器学习',
   *   options: { maxNewNodes: 5, depth: 2, language: '中文' }
   * });
   */
  async expandNode(input: ExpandNodeInput): Promise<MoteTreeNode> {
    const baseUrl = this.resolveBaseUrl();
    const temperature = this.config.temperature ?? (this.config.type === 'ollama' ? 0.2 : 0.7);
    const top_p = this.config.top_p ?? 0.9;
    const maxTokens = 4000; // 增加token限制以支持多层结构生成

    const systemPrompt = this.buildExpandSystemPrompt(input.options);
    const userPrompt = this.buildExpandUserPrompt(input);
    
    const requestBody = {
      model: this.config.model,
      temperature,
      top_p,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
    };

    try {
      this.lastUsedFallback = false;
      const resp = await this.makeRequest(baseUrl, requestBody);
      const content = resp.data?.choices?.[0]?.message?.content ?? '';
      const parsed = this.parseExpandedNode(content);
      
      if (parsed) return parsed;
      
      throw {
        status: 502,
        error: {
          code: 'LLM_INVALID_OUTPUT',
          message: '模型输出不符合要求（非合法JSON）',
          details: '请尝试更换模型或简化/收紧提示词后重试',
        },
      };
    } catch (err) {
      this.handleRequestError(err);
    }
  }

  /**
   * 获取是否使用了兜底方案
   * 
   * 返回最后一次请求是否使用了兜底方案。
   * 
   * @returns {boolean} 是否使用了兜底方案
   * 
   * @example
   * const usedFallback = llm.getLastUsedFallback();
   */
  getLastUsedFallback(): boolean {
    return this.lastUsedFallback;
  }

  // ==================== 私有方法 - 配置和URL处理 ====================

  /**
   * 解析基础URL
   * 
   * 根据配置和环境变量解析提供商的基础URL。
   * 
   * @returns {string} 解析后的基础URL
   * 
   * @private
   */
  private resolveBaseUrl(): string {
    if (this.config.baseUrl) return this.config.baseUrl;
    if (this.config.type === 'ollama') {
      return process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
    }
    return process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  // ==================== 私有方法 - 请求处理 ====================

  /**
   * 发送HTTP请求
   * 
   * 向 LLM 提供商发送 HTTP 请求，支持代理配置和超时设置。
   * 
   * @param {string} baseUrl - 基础URL
   * @param {Record<string, unknown>} requestBody - 请求体
   * @returns {Promise<any>} 响应数据
   * 
   * @private
   * 
   * @throws {Error} 当请求失败时
   */
  private async makeRequest(baseUrl: string, requestBody: Record<string, unknown>) {
    const headers: AxiosRequestConfig['headers'] = {
      'Content-Type': 'application/json',
    };
    
    // 所有 OpenAI 兼容的 API（包括 Gemini）都使用标准的 Authorization 头
    if (this.config.type === 'openai' && this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    }
    
    const requestUrl = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    
    // 配置代理（如果环境变量中有设置）
    const axiosConfig: AxiosRequestConfig = {
      headers,
      timeout: Number(process.env.LLM_REQ_TIMEOUT_MS || 300000),
    };
    
    // 如果设置了代理环境变量，使用代理
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      if (proxyUrl) {
        axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
        console.log(`使用代理: ${proxyUrl}`);
      }
    }

    return await axios.post(requestUrl, requestBody, axiosConfig);
  }

  /**
   * 处理请求错误
   * 
   * 统一处理各种请求错误，包括模型缺失、网络错误等。
   * 
   * @param {unknown} err - 错误对象
   * @returns {never} 总是抛出错误
   * 
   * @private
   */
  private handleRequestError(err: unknown): never {
    // 模型不存在（Ollama 未安装/未拉取）时，直接抛出明确错误
    if (this.isModelMissingError(err)) {
      const model = this.config.model;
      const baseUrlInfo = this.resolveBaseUrl();
      throw {
        status: 400,
        error: {
          code: 'PROVIDER_MODEL_NOT_FOUND',
          message: '模型不存在或未安装',
          details: `Ollama 未找到模型: ${model}（baseUrl=${baseUrlInfo}）。请先运行: ollama pull ${model}`,
        },
      };
    }
    
    // 其他网络或服务错误，直接抛错
    throw {
      status: 502,
      error: {
        code: 'PROVIDER_ERROR',
        message: '模型调用失败',
        details: (err as Error)?.message || '上游服务异常',
      },
    };
  }

  /**
   * 检查是否为模型缺失错误
   * 
   * 检查错误是否为模型不存在或未安装导致的。
   * 
   * @param {unknown} error - 错误对象
   * @returns {boolean} 是否为模型缺失错误
   * 
   * @private
   */
  private isModelMissingError(error: unknown): boolean {
    try {
      const axErr = error as AxiosError<{ error?: unknown; message?: unknown }>;
      const status = axErr.response?.status;

      // 组装可读文本
      const errField = axErr.response?.data?.error;
      let text = '';
      if (typeof errField === 'string') {
        text = errField;
      } else if (errField && typeof errField === 'object') {
        const obj = errField as { code?: unknown; message?: unknown; details?: unknown };
        text = [obj.code, obj.message, obj.details]
          .filter((v): v is string => typeof v === 'string')
          .join(' ');
      }
      if (!text) {
        const fallbackMsg = axErr.response?.data?.message ?? axErr.message ?? '';
        text = String(fallbackMsg);
      }
      const msg = text.toLowerCase();

      // 常见情况：404/400 + 关键词
      if (status === 404 || status === 400) {
        if (msg.includes('not found') || msg.includes('no such model') || msg.includes('unknown model') || msg.includes('invalid model')) {
          return true;
        }
      }
      
      return false;
    } catch {
      return false;
    }
  }

  // ==================== 私有方法 - 提示词构建 ====================

  /**
   * 构建用于大纲生成的系统提示词，包含格式要求和约束条件。
   * 
   * @param {number} depthLimit - 最大层级深度
   * @param {number} branching - 每层最大分支数
   * @param {string} language - 输出语言
   * @returns {string} 系统提示词
   * 
   * @private
   */
  private buildSystemPrompt(depthLimit: number, branching: number, language: string): string {
    return [
      '你是一个严格遵守输出格式的结构化大纲生成助手。',
      '仅输出 JSON，不要包含任何解释或注释。',
      '确保所有节点均与主题紧密相关，避免无意义或随机词语。',
      '输出结构严格使用以下字段：',
      '{',
      '  "text": "string",',
      '  "children": [ ...递归同构... ]',
      '}',
      '约束：',
      `- 最大层级 depthLimit = ${depthLimit}`,
      `- 每层最大子项 branchingFactor = ${branching}`,
      '- 根节点和分支节点内容应简洁明了。',
      '- 所有节点文本最长不超过 100 个字符。',
      `- 输出语言为 ${language}`,
      '禁止生成 id/parentId/collapsed 等无关字段。',
      '示例：',
      '{"text":"人工智能","children":[{"text":"基础概念","children":[{"text":"机器学习"},{"text":"深度学习"}]},{"text":"应用场景","children":[{"text":"自然语言处理"},{"text":"计算机视觉"}]}]}',
    ].join('\n');
  }

  /**
   * 根据输入类型构建用户提示词。
   * 
   * @param {GenerateInput} input - 生成输入参数
   * @param {string} language - 输出语言
   * @returns {string} 用户提示词
   * 
   * @private
   */
  private buildUserPrompt(input: GenerateInput, language: string): string {
    if (input.inputType === 'theme') {
      return [
        `请基于以下主题生成多级结构化大纲（偏好语言：${language}）：`,
        `主题：${input.theme || ''}`,
      ].join('\n');
    }
    // 文本
    return [
      `请从以下文本中抽取并组织多级结构化大纲（偏好语言：${language}）：`,
      `${input.text || ''}`,
    ].join('\n');
  }

  /**
   * 构建用于节点扩展的系统提示词。
   * 
   * @param {Object} options - 扩展选项
   * @param {number} options.maxNewNodes - 最大新节点数
   * @param {number} options.depth - 最大深度
   * @param {string} options.language - 输出语言
   * @returns {string} 系统提示词
   * 
   * @private
   */
  private buildExpandSystemPrompt(options: { maxNewNodes: number; depth: number; language: string }): string {
    return `你是一个专业的思维导图扩展助手。基于给定的思维导图结构和选中的节点（用***标记），为该节点生成相关的子节点。

要求：
1. 生成${options.maxNewNodes}个相关子节点
2. 保持与现有结构的一致性和逻辑性
3. 使用${options.language}语言
4. 节点文本简洁明了，不超过100个字符
5. 只返回选中节点及其子节点的内容，格式为JSON对象
6. 选中节点保持原有文本（去掉***标记），只扩展其children
7. 确保每个层级的内容都有实际意义，避免空泛的词语
8. 根据内容需要，可以生成多层嵌套结构，最多${options.depth}层
9. 每个节点建议生成2-4个子节点，形成合理的分支结构

输出格式：
- 支持多层嵌套的children结构
- 每个children数组包含有意义的子节点
- 最深层的节点children为空数组[]

示例输出格式：
{
  "text": "选中节点文本",
  "children": [
    {
      "text": "子节点1",
      "children": [
        {
          "text": "子子节点1-1",
          "children": [
            {"text": "子子子节点1-1-1", "children": []},
            {"text": "子子子节点1-1-2", "children": []}
          ]
        },
        {"text": "子子节点1-2", "children": []}
      ]
    },
    {
      "text": "子节点2", 
      "children": [
        {"text": "子子节点2-1", "children": []},
        {"text": "子子节点2-2", "children": []}
      ]
    }
  ]
}`;
  }

  /**
   * 构建用于节点扩展的用户提示词。
   * 
   * @param {ExpandNodeInput} input - 扩展节点输入参数
   * @returns {string} 用户提示词
   * 
   * @private
   */
  private buildExpandUserPrompt(input: ExpandNodeInput): string {
    return `思维导图结构：
${JSON.stringify(input.moteTree, null, 2)}

请基于以上思维导图结构，为标记为***的节点生成相关子节点。

要求：
1. 生成${input.options.maxNewNodes}个相关子节点
2. 根据内容需要，可以生成多层嵌套结构，最多${input.options.depth}层
3. 每个节点建议有2-4个有意义的子节点
4. 确保生成的内容与选中节点主题高度相关
5. 避免生成过于宽泛或无关的内容
6. 保持思维导图的逻辑性和层次性`;
  }

  // ==================== 私有方法 - 响应解析 ====================

  /**
   * 尝试多种方式解析 LLM 返回的大纲响应。
   * 
   * @param {string} content - LLM 返回的内容
   * @param {GenerateInput} input - 原始输入参数
   * @returns {OutlineResult | null} 解析后的大纲结果，失败时返回 null
   * 
   * @private
   */
  private tryParseOutline(content: string, input: GenerateInput): OutlineResult | null {
    // 直接尝试解析
    const directAny = this.safeParse<unknown>(content);
    const direct = this.toOutlineResult(directAny, input);
    if (direct) return direct;

    // 尝试提取 JSON 子串后再解析
    const extracted = this.extractJson(content);
    const parsedAny = this.safeParse<unknown>(extracted);
    const parsed = this.toOutlineResult(parsedAny, input);
    if (parsed) return parsed;
    return null;
  }

  /**
   * 将解析的数据转换为标准的大纲结果格式。
   * 
   * @param {unknown} data - 解析的数据
   * @param {GenerateInput} input - 原始输入参数
   * @returns {OutlineResult | null} 转换后的大纲结果，失败时返回 null
   * 
   * @private
   */
  private toOutlineResult(data: unknown, input: GenerateInput): OutlineResult | null {
    if (!data) return null;
    
    // { text: string, children?: [] }
    const maybeRoot = data as { text?: unknown; children?: unknown };
    if (typeof maybeRoot?.text === 'string') {
      const childrenRaw = Array.isArray(maybeRoot.children) ? maybeRoot.children as OutlineNode[] : [];
      return this.normalizeOutline({ title: String(maybeRoot.text), nodes: childrenRaw });
    }

    // 直接是数组 => 作为节点数组处理
    if (Array.isArray(data)) {
      const title = input.inputType === 'theme' && input.theme ? input.theme : 'AI 生成大纲';
      return this.normalizeOutline({ title, nodes: data as OutlineNode[] });
    }
    return null;
  }

  /**
   * 解析 LLM 返回的扩展节点响应。
   * 
   * @param {string} content - LLM 返回的内容
   * @returns {MoteTreeNode} 解析后的节点结构
   * 
   * @private
   * 
   * @throws {Error} 当解析失败时
   */
  private parseExpandedNode(content: string): MoteTreeNode {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      
      throw new Error('无法解析LLM返回的JSON格式');
    } catch (error) {
      console.error('解析扩展节点失败:', error);
      throw new Error('解析LLM响应失败');
    }
  }

  /**
   * 安全地解析 JSON 字符串，失败时返回 null。
   * 
   * @template T - 解析结果的类型
   * @param {string} text - JSON 字符串
   * @returns {T | null} 解析结果，失败时返回 null
   * 
   * @private
   */
  private safeParse<T>(text: string): T | null {
    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }

  /**
   * 从文本中提取 JSON 字符串部分。
   * 
   * @param {string} text - 原始文本
   * @returns {string} 提取的 JSON 字符串
   * 
   * @private
   */
  private extractJson(text: string): string {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return text.slice(start, end + 1);
    }
    return text;
  }

  /**
   * 标准化大纲结构，确保数据格式的一致性。
   * 
   * @param {OutlineResult} o - 原始大纲结果
   * @returns {OutlineResult} 标准化后的大纲结果
   * 
   * @private
   */
  private normalizeOutline(o: OutlineResult): OutlineResult {
    // 剔除异常字段，确保 children 为数组
    type RawChild = { text?: unknown; children?: unknown };
    const normalizeNode = (n: RawChild): OutlineNode => {
      const childrenRaw = Array.isArray(n?.children) ? (n.children as RawChild[]) : [];
      const children: OutlineNode[] = childrenRaw.map((c) => normalizeNode(c));
      const rawText = String(n?.text ?? '');
      const text = rawText.length > 100 ? rawText.slice(0, 100) : rawText;
      return { text, children };
    };
    return {
      title: String(o.title || 'AI 生成大纲'),
      nodes: Array.isArray(o.nodes) ? o.nodes.map(normalizeNode) : [],
    };
  }
}



