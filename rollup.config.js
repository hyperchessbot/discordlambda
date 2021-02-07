import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'rawfunctions/index.js',
  output: {
    dir: 'functions',
    format: 'cjs'
  },
  plugins: [nodeResolve()]
};
