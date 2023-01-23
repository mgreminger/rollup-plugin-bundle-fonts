import { createFilter } from 'rollup-pluginutils';

export default function starterPlugin( options = {} ) {
  const filter = createFilter( options.include, options.exclude );

  return {
    name: 'starter-plugin',

    /* Type: (options: InputOptions) => InputOptions | null */
    /* Kind: sync, sequential                               */
    options(options) { },

    /* Type: (options: InputOptions) => void */
    /* Kind: async, parallel                 */
    buildStart(options) { },

    /* Type: (source: string, importer: string) =>
         string |
         false |
         null |
         {id: string, external?: boolean, moduleSideEffects?: boolean | null} */
    /* Kind: async, first */
    resolveId(source, importer) { },

    /* Type: (specifier: string | ESTree.Node, importer: string) =>
         string |
         false |
         null |
         {id: string, external?: boolean} */
    /* Kind: async, first */
    resolveDynamicImport(specifier, importer) { },

    /* Type: (id: string) =>
         string |
         null |
         { code: string, map?: string | SourceMap, ast?: ESTree.Program, moduleSideEffects?: boolean | null } */
    /* Kind: async, first */
    load(id) {
      if (!filter(id)) return null;
    },

    /* Type: (code: string, id: string) =>
         string |
         null |
         { code: string, map?: string | SourceMap, ast?: ESTree.Program, moduleSideEffects?: boolean | null } */
    /* Kind: async, sequential */
    transform(code, id) {
      if (!filter(id)) return null;
    },

    /* Type: (error?: Error) => void */
    /* Kind: async, parallel         */
    buildEnd(error) { },

    /* Type: (id: string) => void */
    /* Kind: sync, sequential     */
    watchChange(id) { },

    /* Type: (outputOptions: OutputOptions) => OutputOptions | null */
    /* Kind: sync, sequential                                       */
    outputOptions(options) { },

    /* Type: () => void      */
    /* Kind: async, parallel */
    renderStart() { },

    /* Type: (
         property: string | null,
         {chunkId: string, moduleId: string, format: string}
       ) => string | null */
    /* Kind: sync, first  */
    resolveImportMeta(property, {chunkId, moduleId, format}) { },

    /* Type: ({
         assetReferenceId: string | null,
         chunkId: string,
         chunkReferenceId: string | null,
         fileName: string,
         format: string,
         moduleId: string,
         relativePath: string
       }) => string | null */
    /* Kind: sync, first   */
    resolveFileUrl(file) { },

    /* Type: (code: string, chunk: ChunkInfo, options: OutputOptions) =>
         string |
         { code: string, map: SourceMap } |
         null                  */
    /* Kind: async, sequential */
    renderChunk(code, chunk, options) { },

    /* Type: (options: OutputOptions, bundle: { [fileName: string]: AssetInfo | ChunkInfo }, isWrite: boolean) => void  */
    /* Kind: async, sequential                                                                                          */
    generateBundle(options, bundle, isWrite) { },

    /* Type: (bundle: { [fileName: string]: AssetInfo | ChunkInfo }) => void */
    /* Kind: async, parallel                                                  */
    writeBundle(bundle) { },

    /* Type: (error: Error) => void */
    /* Kind: async, parallel        */
    renderError(error) { },

    /* Type: string | (() => string)  */
    /* Kind: async, parallel          */
    banner: '',

    /* Type: string | (() => string)  */
    /* Kind: async, parallel          */
    footer: '',

    /* Type: string | (() => string)  */
    /* Kind: async, parallel          */
    intro: '',

    /* Type: string | (() => string)  */
    /* Kind: async, parallel          */
    outro: ''
  };
}
