import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

export default {
  input: 'dist/offline-dev-app/browser/sw.js',
  output: {
    file: 'dist/offline-dev-app/browser/sw.js',
    format: 'cjs'
  },
  plugins: [
    resolve(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
      preventAssignment: true
    }),
    terser()
  ]
};
