import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export type ProviderConfig = {
  type: 'openai' | 'ollama'
  baseUrl?: string
  apiKey?: string
  model: string
  temperature?: number
  top_p?: number
}

export type OutlineNode = {
  text: string
  children?: OutlineNode[]
}

export type OutlineResult = {
  title: string
  nodes: OutlineNode[]
}

type GenerateInput = {
  inputType: 'theme' | 'text'
  theme?: string
  text?: string
}

type GenerateOptions = {
  depthLimit?: number
  branchingFactor?: number
  language?: string
  maxTokens?: number
}

export class LLMService {
  private config: ProviderConfig;
  private lastRawContent: string | null = null;
  private lastUsedFallback = false;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async generateOutline(input: GenerateInput, options?: GenerateOptions): Promise<OutlineResult> {
    const baseUrl = this.resolveBaseUrl();
    const temperature = this.config.temperature ?? (this.config.type === 'ollama' ? 0.2 : 0.7);
    const top_p = this.config.top_p ?? 0.9;
    const depthLimit = options?.depthLimit ?? 3;
    const branching = options?.branchingFactor ?? 4;
    const language = options?.language ?? '中文';
    const maxTokens = options?.maxTokens ?? 1200;

    const systemPrompt = this.buildSystemPrompt(depthLimit, branching, language);
    const userPrompt = this.buildUserPrompt(input, language);

    const requestBody: {
      model: string;
      temperature: number;
      top_p: number;
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
      max_tokens: number;
      // response_format?: { type: 'json_object' };
    } = {
      model: this.config.model,
      temperature,
      top_p,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      // 对于 OpenAI 兼容服务，尽量请求 JSON 输出；Ollama 可能忽略该字段
      // response_format: { type: 'json_object' },
      max_tokens: maxTokens,
    };

    const headers: AxiosRequestConfig['headers'] = {
      'Content-Type': 'application/json',
    };
    if (this.config.type === 'openai' && this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    }

    try {
      this.lastUsedFallback = false;
      const resp = await axios.post(
        `${baseUrl.replace(/\/$/, '')}/chat/completions`,
        requestBody,
        { headers, timeout: Number(process.env.LLM_REQ_TIMEOUT_MS || 300000) },
      );

      const content = resp.data?.choices?.[0]?.message?.content ?? '';
      this.lastRawContent = content;
      const parsed = this.tryParseOutline(content, input);
      if (parsed) return parsed;
      // 解析失败，直接抛错，不再使用兜底
      throw {
        status: 502,
        error: {
          code: 'LLM_INVALID_OUTPUT',
          message: '模型输出不符合要求（非合法JSON）',
          details: '请尝试更换模型或简化/收紧提示词后重试',
        },
      };
    } catch (err) {
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
  }

  getLastRawContent(): string | null {
    return this.lastRawContent;
  }

  getLastUsedFallback(): boolean {
    return this.lastUsedFallback;
  }

  private resolveBaseUrl(): string {
    if (this.config.baseUrl) return this.config.baseUrl;
    if (this.config.type === 'ollama') {
      return process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
    }
    return process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

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
        if (msg.includes('not found') || msg.includes('no such model') || msg.includes('unknown model')) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

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

  private safeParse<T>(text: string): T | null {
    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }

  private extractJson(text: string): string {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return text.slice(start, end + 1);
    }
    return text;
  }

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


