<!--
  AI生枝配置弹窗组件

  主要功能：
  - AI模型配置（模型名称、Base URL、API Key）
  - 预设配置选择和管理
  - 高级参数配置（温度、Top P、层级限制等）
  - 表单验证和错误处理
  - 选中节点信息显示

  Props:
  - open: 弹窗显示状态

  Events:
  - update:open: 弹窗状态变化事件
-->
<template>
  <a-modal
    v-model:open="modalOpen"
    title="AI生枝配置"
    width="600px"
    :confirm-loading="loading"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="ai-expand-modal">
      <a-alert
        v-if="selectedNodeText"
        type="info"
        :message="`选中节点: ${selectedNodeText}`"
        style="margin-bottom: 16px;"
      />

      <a-form ref="formRef" :model="form" layout="vertical">
        <!-- 预设选择 - 放在最显眼位置 -->
        <a-form-item label="预设">
          <a-select
            v-model:value="selectedPresetKey"
            placeholder="选择预设或手动配置"
            @change="handlePresetChange"
            style="width: 100%"
          >
            <a-select-option
              v-for="preset in aiStore.providerPresets"
              :key="preset.key"
              :value="preset.key"
            >
              <DesktopOutlined v-if="preset.type === 'ollama'" style="margin-right: 8px;" />
              <CloudOutlined v-else style="margin-right: 8px;" />
              {{ preset.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 核心配置 - 简化布局 -->
        <a-form-item label="模型" :required="true" name="provider.model">
          <a-input v-model:value="form.provider.model" placeholder="如 gpt-4o-mini 或 qwen2:7b-instruct" allow-clear>
            <template #prefix>
              <RobotOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="Base URL" :required="true" name="provider.baseUrl">
          <a-input v-model:value="form.provider.baseUrl" placeholder="请输入 Base URL" allow-clear>
            <template #prefix>
              <GlobalOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item v-if="form.provider.type === 'openai'" label="API Key" :required="true" name="provider.apiKey">
          <a-input-password v-model:value="form.provider.apiKey" placeholder="不保存，仅本次使用" allow-clear>
            <template #prefix>
              <KeyOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <!-- 更多配置 - 使用折叠面板 -->
        <a-collapse v-model:activeKey="activeCollapseKeys" ghost>
          <a-collapse-panel key="advanced" header="更多配置">
            <a-row :gutter="12">
              <a-col :span="12">
                <a-form-item label="温度">
                  <a-input-number
                    v-model:value="form.provider.temperature"
                    :min="0"
                    :max="2"
                    :step="0.1"
                    placeholder="0.7"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Top P">
                  <a-input-number
                    v-model:value="form.provider.top_p"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    placeholder="0.9"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="12">
              <a-col :span="12">
                <a-form-item label="最大层级">
                  <a-input-number
                    v-model:value="form.options.depthLimit"
                    :min="1"
                    :max="16"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="每层最大分支数">
                  <a-input-number
                    v-model:value="form.options.branchingFactor"
                    :min="1"
                    :max="16"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="输出语言">
              <a-select v-model:value="form.options.language" style="width: 100%">
                <a-select-option value="zh">中文</a-select-option>
                <a-select-option value="en">English</a-select-option>
              </a-select>
            </a-form-item>
          </a-collapse-panel>
        </a-collapse>

        <a-alert v-if="errorMsg" type="error" :message="errorMsg" :description="errorDetails" show-icon />
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  DesktopOutlined,
  CloudOutlined,
  RobotOutlined,
  GlobalOutlined,
  KeyOutlined
} from '@ant-design/icons-vue'
import { message, type FormInstance } from 'ant-design-vue'
import { useAiStore } from '@/stores/aiStore'
import { useMoteStore } from '@/stores/moteStore'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

/**
 * 加载状态
 *
 * 控制AI生枝操作的加载状态，
 * 防止重复提交和提供用户反馈。
 *
 * @type {Ref<boolean>}
 */
const loading = ref(false);

/**
 * 错误消息
 *
 * 显示AI生枝操作的主要错误信息。
 *
 * @type {Ref<string | null>}
 */
const errorMsg = ref<string | null>(null);

/**
 * 错误详情
 *
 * 显示AI生枝操作的详细错误信息，
 * 用于调试和用户了解具体错误原因。
 *
 * @type {Ref<string | null>}
 */
const errorDetails = ref<string | null>(null);

/**
 * 选中的预设配置
 *
 * 当前选中的AI模型预设配置的键值。
 *
 * @type {Ref<string>}
 */
const selectedPresetKey = ref<string>('');

/**
 * 表单实例引用
 *
 * 用于表单验证和重置操作。
 *
 * @type {Ref<FormInstance>}
 */
const formRef = ref<FormInstance>();

/**
 * 折叠面板激活状态
 *
 * 控制高级配置折叠面板的展开状态。
 *
 * @type {Ref<string[]>}
 */
const activeCollapseKeys = ref<string[]>([]);

const aiStore = useAiStore();
const moteStore = useMoteStore();
const { selectedNodeForExpand } = storeToRefs(aiStore);

// 复用aiStore的form配置
const form = aiStore.form;

/**
 * 弹窗显示状态计算属性
 *
 * 双向绑定弹窗的显示状态，
 * 支持v-model语法糖。
 *
 * @type {ComputedRef<boolean>}
 */
const modalOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

/**
 * 选中节点文本计算属性
 *
 * 根据选中的节点ID获取对应的文本内容，
 * 用于在弹窗中显示当前操作的节点。
 *
 * @type {ComputedRef<string>}
 *
 * @example
 * // 如果选中了节点 "node123"，返回该节点的文本内容
 */
const selectedNodeText = computed(() => {
  if (!selectedNodeForExpand.value) return '';
  return moteStore.findNodeText(moteStore.moteTree, selectedNodeForExpand.value);
});

/**
 * 处理预设选择
 *
 * 当用户选择预设配置时，更新表单数据并清除验证错误。
 *
 * @param {string} presetKey - 预设配置的键值
 *
 * @example
 * handlePresetChange('openai-gpt4')
 * // 自动填充OpenAI GPT-4的配置信息
 */
const handlePresetChange = (presetKey: string) => {
  selectedPresetKey.value = presetKey;
  aiStore.selectPreset(presetKey);
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate();
    }
  });
};

/**
 * 表单验证
 *
 * 验证AI配置表单的必填字段，
 * 返回验证结果和错误信息列表。
 *
 * @returns {{ isValid: boolean; errors: string[] }} 验证结果对象
 *
 * @example
 * const validation = validateForm()
 * if (!validation.isValid) {
 *   console.log('验证失败:', validation.errors)
 * }
 */
const validateForm = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!form.provider.model?.trim()) {
    errors.push('请输入模型名称');
  }

  if (!form.provider.baseUrl?.trim()) {
    errors.push('请输入服务地址');
  }

  if (form.provider.type === 'openai' && !form.provider.apiKey?.trim()) {
    errors.push('请输入 API Key');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 确认生成
 *
 * 执行AI生枝操作，包括表单验证、API调用和结果处理。
 * 成功后关闭弹窗并显示成功消息。
 *
 * @returns {Promise<void>}
 *
 * @throws {Error} 当AI生枝操作失败时
 * @throws {Error} 当表单验证失败时
 */
const handleConfirm = async () => {
  if (loading.value || !selectedNodeForExpand.value) return;

  const validation = validateForm();
  if (!validation.isValid) {
    message.error(validation.errors.join('、'));
    return;
  }

  errorMsg.value = null;
  errorDetails.value = null;
  loading.value = true;

  try {
    await aiStore.aiExpandNode(
      selectedNodeForExpand.value,
      {
        type: form.provider.type,
        model: form.provider.model,
        baseUrl: form.provider.baseUrl || '',
        apiKey: form.provider.apiKey
      },
      moteStore.moteTree,
      moteStore.findNodeText,
      moteStore.addExpandedNodeToTree,
      {
        maxNewNodes: form.options.branchingFactor,
        depth: form.options.depthLimit
      }
    );

    message.success('AI生枝成功');
    handleCancel();
  } catch (err: unknown) {
    const error = err as { message?: string; details?: string };
    errorMsg.value = error?.message || 'AI生枝失败';
    errorDetails.value = error?.details || null;
  } finally {
    loading.value = false;
  }
};

/**
 * 取消操作
 *
 * 关闭AI生枝弹窗并清理相关状态，
 * 包括错误信息和选中节点。
 *
 * @returns {void}
 */
const handleCancel = () => {
  modalOpen.value = false;
  errorMsg.value = null;
  errorDetails.value = null;
  aiStore.closeAiExpandModal();
};

// 监听弹窗打开，设置默认预设
watch(() => props.open, (newOpen) => {
  if (newOpen) {
    const defaultPreset = aiStore.providerPresets.find(preset =>
      preset.type === form.provider.type &&
      preset.model === form.provider.model &&
      preset.baseUrl === form.provider.baseUrl
    );
    if (defaultPreset) {
      selectedPresetKey.value = defaultPreset.key;
    }
  }
});
</script>

<style scoped lang="less">
.ai-expand-modal {
  .ant-form-item {
    margin-bottom: 16px;
  }

  .ant-collapse {
    border: none;
    background: transparent;

    .ant-collapse-item {
      border: 1px solid #f0f0f0;
      border-radius: 6px;
      margin-bottom: 8px;

      .ant-collapse-header {
        padding: 8px 12px;
        font-size: 14px;
        color: #666;
      }

      .ant-collapse-content {
        border-top: 1px solid #f0f0f0;
        padding: 12px;
      }
    }
  }
}
</style>
