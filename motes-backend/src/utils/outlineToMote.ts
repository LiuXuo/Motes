import { customAlphabet } from 'nanoid'
import type { OutlineNode, OutlineResult } from '../services/llmService.js'
import type { IMoteNode } from '../models/Mote'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 8)

function mapOutlineNodeToMoteNode(node: OutlineNode, parentId: string): IMoteNode {
  const id = nanoid()
  const children = (node.children || []).map((child) => mapOutlineNodeToMoteNode(child, id))
  return {
    id,
    text: String(node.text || '').slice(0, 200),
    collapsed: false,
    parentId,
    children,
  }
}

export function outlineToMote(outline: OutlineResult): IMoteNode {
  const rootId = nanoid()
  return {
    id: rootId,
    text: outline.title || 'AI 生成',
    collapsed: false,
    parentId: '',
    children: (outline.nodes || []).map((n) => mapOutlineNodeToMoteNode(n, rootId)),
  }
}


