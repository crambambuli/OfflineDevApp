import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'dist/offline-dev-app/browser/sw.ts',
  output: {
    file: 'dist/offline-dev-app/browser/sw.js',
    format: 'cjs'
  },
  plugins: [
    typescript(),
    resolve(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
      preventAssignment: true
    }),
    terser()
  ]
};
