import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import analyze from 'rollup-plugin-analyzer';
import filesize from 'rollup-plugin-filesize';
import { visualizer } from 'rollup-plugin-visualizer';
import strip from '@rollup/plugin-strip';

// Enhanced terser configuration for maximum minification
const terserConfig = {
  ecma: 2020,
  module: true,
  compress: {
    passes: 3,
    unsafe: true,
    unsafe_math: true,
    unsafe_methods: true,
    unsafe_proto: true,
    unsafe_regexp: true,
    pure_getters: true,
    pure_funcs: [
      'console.log',
      'console.info',
      'console.debug',
      'console.trace',
      'console.time',
      'console.timeEnd'
    ],
    drop_console: process.env.NODE_ENV === 'production',
    drop_debugger: true,
    global_defs: {
      DEBUG: false
    }
  },
  mangle: {
    properties: {
      regex: /^_/,
      keep_quoted: true
    }
  },
  format: {
    comments: false,
    ecma: 2020
  }
};

// Enhanced babel configuration
const babelConfig = {
  babelHelpers: 'runtime',
  exclude: 'node_modules/**',
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead',
      modules: false,
      loose: true,
      bugfixes: true
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
};

// Enhanced common plugins
const commonPlugins = [
  resolve({
    browser: true,
    preferBuiltins: false
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  babel(babelConfig),
  strip({
    debugger: true,
    functions: ['console.log', 'console.info', 'console.debug', 'console.trace'],
    sourceMap: true
  })
];

// Enhanced production plugins
const productionPlugins = process.env.NODE_ENV === 'production' ? [
  terser(terserConfig),
  analyze({
    summaryOnly: true,
    limit: 10,
    outFile: 'examples/bundle-analysis.txt'
  }),
  filesize(),
  visualizer({
    filename: 'examples/bundle-analysis.html',
    gzipSize: true
  })
] : [];

export default [
  // Modern ESM build
  {
    input: 'src/AFS.js',
    output: {
      file: 'dist/afs.modern.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      ...commonPlugins,
      ...productionPlugins
    ],
    external: [/@babel\/runtime/],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    }
  },

  // Legacy UMD build
  {
    input: 'src/AFS.js',
    output: {
      name: 'AFS',
      file: 'dist/afs.legacy.js',
      format: 'umd',
      sourcemap: true
    },
    plugins: [
      ...commonPlugins,
      ...productionPlugins
    ],
    external: [/@babel\/runtime/],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    }
  }
];