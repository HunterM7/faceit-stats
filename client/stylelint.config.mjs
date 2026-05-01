export default {
  customSyntax: 'postcss-scss',
  rules: {
    'selector-nested-pattern': [
      '^&(?:(?:__[a-z0-9-]+)|(?:--[a-z0-9-]+)|(?:::{0,1}[a-z-]+(?:\\([^)]*\\))?))$',
      {
        message: 'Вложенные селекторы разрешены только в формате &:pseudo, &__element, &--modifier.',
      },
    ],
  },
}
