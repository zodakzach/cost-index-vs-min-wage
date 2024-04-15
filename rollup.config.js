import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import polyfillNode from 'rollup-plugin-polyfill-node'; // Import the plugin

export default {
  input: 'src/js/index.js', 
  output: {
    file: 'dist/js/bundle.js', // Output bundle file
    format: 'iife', // Output format (immediately-invoked function expression)
    sourcemap: true, // Generate source maps
  },
  plugins: [
    resolve(), // Resolve Node.js modules
    commonjs(), // Convert CommonJS modules to ES6
    terser(), // Minify JavaScript
    postcss({
      plugins: [
        autoprefixer(), // Apply autoprefixer to add vendor prefixes
      ],
    }), // Process CSS with PostCSS
    polyfillNode(),
  ],
};
