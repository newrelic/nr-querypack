module.exports = {
  ignorePatterns: ['lib/parser/querypack.js', 'coverage/**/*'],
  env: {
    node: true,
    commonjs: true,
    // Use es2019 for Node 12+ support (https://node.green/)
    es2019: true
  },
  extends: ['standard'],
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        jest: true
      }
    }
  ],
  rules: {
    'no-var': 'off',
    'no-void': 'off',
    'object-shorthand': 'off',
    'no-use-before-define': 'off',
    'dot-notation': 'off'
  }
}
