# rollup-plugin-bundle-fonts

🍣 A Rollup plugin that downloads https fonts in your css files that are included by the url() function and places them in the specified target directory. The url() functions are then updated 
with relative url's that point to the target directory.

## Requirements

This plugin requires an [LTS](https://github.com/nodejs/Release) Node version (v16.0.0+) and Rollup v3.0.0+.

## Install

Using npm:

```console
npm install rollup-plugin-bundle-fonts --save-dev
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin. The example below will place fonts in the `dist/fonts`
folder relative to the project directory:

```js
import bundleFonts from 'rollup-plugin-bundle-fonts';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  plugins: [
    bundleFonts({
      fontTargetDir: ['dist/fonts'],
      cssBundleDir: ['dist']
    })
  ]
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Options

### `fontTargetDir`
Type: `string`
Default: none, this is a required option

This is the directory where all of the fonts will be downloaded to.

### `cssBundleDir`
Type: `string`
Default: none, this is a required option

Since css `url()` function calls are relative to the css file rather than the site root directory, 
it is necessary to provide the path where the bundled css file will be located. This plugin
will automatically update the `url()` calls to have a relative path from the css file directory
to the font directory.

### `fontExtensions`
Type: `string[]`
Default: `['.woff', '.woff2', '.ttf']`

### `exclude`

Type: `string` | `string[]`
Default: `null`

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files in the build the plugin should _ignore_. By default no files are ignored.

### `include`

Type: `string` | `string[]`
Default: `['**/*.css']`

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files in the build the plugin should operate on. By default only .css files are targeted.

## Meta

[LICENSE (MIT)](/LICENSE)