import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    // Prettier owns void-element formatting, so accept either style here.
    'vue/html-self-closing': ['warn', { html: { void: 'any' } }]
  }
})
