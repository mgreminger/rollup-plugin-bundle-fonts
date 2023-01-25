import pkg from './package.json' assert {type: "json"};

export default {
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' }
  ],
  plugins: [],
  external: [...Object.keys({...pkg.dependencies, ...pkg.peerDependencies}), 'fs', 'path']
};
