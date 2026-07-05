import type { ShikiTransformer } from 'shiki'

import {
  addCopyButton,
  addLanguage,
  addTitle,
  transformerNotationDiff,
  transformerNotationHighlight,
  updateStyle
} from '../plugins/shiki-transformers'

export function getCodeBlockTransformers(): ShikiTransformer[] {
  return [
    transformerNotationDiff(),
    transformerNotationHighlight(),
    updateStyle(),
    addTitle(),
    addLanguage(),
    addCopyButton(2000)
  ]
}
