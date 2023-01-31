module.exports = {
  ignorePatterns: ["lib/parser/querypack.js", "coverage/**/*"],
  env: {
    node: true,
    commonjs: true,
    // Use es2019 for Node 12+ support (https://node.green/)
    es2019: true,
  },
  extends: ["eslint:recommended", "prettier"],
  overrides: [],
  rules: {},
};
