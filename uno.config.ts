import { defineConfig, presetMini, presetTypography } from 'unocss'

import { createTypographyConfig, themeColors, utilityRules } from './src/modules/design-tokens.ts'
import { integ } from './src/site.config.ts'

export default defineConfig({
  presets: [
    presetMini(),
    presetTypography(createTypographyConfig(integ.typography))
  ],
  rules: utilityRules,
  theme: {
    colors: themeColors,
    fontFamily: {
      mono: [
        'JetBrains Mono'
      ]
    }
  },
  safelist: [
    // TOC
    'rounded-t-2xl',
    'rounded-b-2xl',
    // Typography
    'text-base',
    'prose'
  ]
})
