import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { GenerateMotePayload, GenerateMoteResponseData } from '@/services/aiApi'

export const useAiGenerateStore = defineStore('aiGenerateStore', () => {
  const defaultForm: GenerateMotePayload = {
    inputType: 'theme',
    theme: '',
    text: '',
    docParentKey: '6899d40c064072ebc4d01ae7',
    provider: { type: 'ollama', model: 'gemma3:4b', baseUrl: 'http://localhost:11434/v1' },
    options: { depthLimit: 3, branchingFactor: 4, language: 'zh' },
    create: false,
    debug: false,
  }

  const form = reactive<GenerateMotePayload>({ ...defaultForm })

  const preview = ref<GenerateMoteResponseData | null>(null)

  const resetToDefaults = () => {
    Object.assign(form, defaultForm)
  }

  const setPreview = (data: GenerateMoteResponseData | null) => {
    preview.value = data
  }

  const clearPreview = () => {
    preview.value = null
  }

  return {
    form,
    preview,
    resetToDefaults,
    setPreview,
    clearPreview,
  }
})


