# rollup-plugin-bundle-fonts

🍣 A Rollup plugin that downloads https fonts referenced by url() functions in your css files and places them in a specified target directory. The url() functions are then updated 
with relative url's that point to the target directory.

The font directory is not cleared between runs. The plugin will only download fonts if they don't already exist in the target folder.

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
      fontTargetDir: 'dist/fonts',
      cssBundleDir: 'dist'
    })
  ]
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Options

### `fontTargetDir` (required)
Type: `string`

This is the directory where all of the fonts will be downloaded to.

### `cssBundleDir` (required)
Type: `string`

This options tells this plugin where the final bundled css file will be located.
Since css `url()` function calls are relative to the
css file rather than the site root directory, 
this directory is required so that the plugin
can automatically update the `url()` calls to have a relative path from the css file directory
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

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files in the build the plugin should operate on. By default only `.css` files are targeted.

## Meta

[LICENSE (MIT)](/LICENSE)
