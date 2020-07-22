module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'no-console': 'off', // console.log
    'no-use-before-define': 'off', // 变量需要在轻易之前
    'array-callback-return': 'off', // 循环里面必须返回
    'no-await-in-loop': 'off', // 禁止在循环里面使用async awiat
    'consistent-return': 'off', // JavaScript允许函数中的不同代码路径返回不同类型的值。
    'no-restricted-syntax': 'off', // 禁止使用特定的语法
    'no-loop-func': 'off', // 禁止在循环内的函数中出现循环体条件语句中定义的变量，比如： for (var i = 0; i < 10; i++) { (function () { return i })();}
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'no-unused-vars': 'off',
    'no-param-reassign': 'off',

  },
};
