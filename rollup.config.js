import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'rawfunctions/index.js',
  output: {
    dir: 'functions',
    format: 'cjs'
  },
  plugins: [commonjs(), nodeResolve()]  
};
