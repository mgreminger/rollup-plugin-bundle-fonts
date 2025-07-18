import fs from 'fs';
import { join } from 'path';
import test from 'ava';
import bundleFonts from "../dist/rollup-plugin-bundle-fonts.es.js";

const fontTargetDir = "public/assets/fonts";
const cssBundleDir = "public";


const testFonts = [
  {name: "IBMPlexMono-Bold-Cyrillic.woff2", size: 16476, badLink: false, badLinkName: null},
  {name: "IBMPlexMono-Bold.woff", size: 63492, badLink: true, badLinkName: "IBMPlexMono-Bold-z.woff"},
  {name: "IBMPlexMono-Bold.woff2", size: 46684, badLink: false, badLinkName: null},
]


test.beforeEach( async t => {
  // delete any fonts downloaded in a previous run
  for( const { name } of testFonts) {
    try {
      await fs.promises.rm(join(fontTargetDir, name));
    } catch (e) {
      if (e.code !== "ENOENT") {
        throw e;
      }
    }
  }
});


// all tests must be run serially since the are saving fonts to the same file system
test.serial('Test run and re-run', async t => {
  const exampleFile = "test/example.css";
  const exampleFileTarget = "test/example_target.css";
  const exampleTargetSourceMap = "test/example_map.json";

  const code = await fs.promises.readFile(exampleFile, 'utf8');

  let result = await bundleFonts({ fontTargetDir: fontTargetDir, cssBundleDir: cssBundleDir }).transform(code, exampleFile);

  const targetCode = await fs.promises.readFile(exampleFileTarget, 'utf8');

  t.is(result.code, targetCode);

  // check to make sure sourcemap matches expected result
  const expectedSourceMap = await fs.promises.readFile(exampleTargetSourceMap, 'utf8');
  t.is(JSON.stringify(result.map), expectedSourceMap);

  // make sure each file was downloaded and is of the correct size
  const mtimes = [];
  for ( const { name, size } of testFonts) {
    const stat = await fs.promises.stat(join(fontTargetDir, name));
    t.is(stat.size, size);
    mtimes.push(stat.mtime);
  }

  // run plugin again on same input and make sure mtimes don't change
  result = await bundleFonts({ fontTargetDir: fontTargetDir, cssBundleDir: cssBundleDir }).transform(code, exampleFile);

  t.is(result.code, targetCode);
  t.not(result.map, null);

  for (const [i, {name, size}] of testFonts.entries()) {
    const stat = await fs.promises.stat(join(fontTargetDir, name));
    t.is(stat.size, size)
    t.deepEqual(stat.mtime, mtimes[i]);
  }
});


// run tests on target output that has already been processed, no fonts should be downloaded
test.serial('Test run with no fonts to download', async t => {
  const exampleFile = "test/example_target.css";

  const code = await fs.promises.readFile(exampleFile, 'utf8');

  const result = await bundleFonts({ fontTargetDir: fontTargetDir, cssBundleDir: cssBundleDir}).transform(code, exampleFile);

  // make sure input is unchanged
  t.is(result.code, code);

  // map should be null since no modifications were made
  t.is(result.map, null);

  // make sure font directory is empty
  const files = await fs.promises.readdir(fontTargetDir);

  t.is(files.length, 0);

});


// test case with bad link
test.serial('Test bad font link', async t => {
  const exampleFile = "test/example_bad_link.css";

  const code = await fs.promises.readFile(exampleFile, 'utf8');

  await t.throwsAsync(bundleFonts({ fontTargetDir: fontTargetDir, cssBundleDir: cssBundleDir}).transform(code, exampleFile));

  // Make sure file doesn't exist for bad the link
  // Also, make sure that any good links were downloaded in their entirety so that
  // corrupt font files don' impact future runs
  for ( const { name, size, badLink, badLinkName } of testFonts) {
    if (badLink) {
      await t.throwsAsync(fs.promises.stat(join(fontTargetDir, badLinkName)));
    } else {
      const stat = await fs.promises.stat(join(fontTargetDir, name));
      t.is(stat.size, size);
    }
  }

});


test.serial('Test run with custom font file extension', async t => {
  const exampleFile = "test/example.css";
  const exampleFileTarget = "test/example_target_custom_extensions.css";

  const code = await fs.promises.readFile(exampleFile, 'utf8');

  const result = await bundleFonts({
    fontTargetDir: fontTargetDir,
    cssBundleDir: cssBundleDir,
    fontExtensions: [".woff", ".ttf"]
  }).transform(code, exampleFile);

  const targetCode = await fs.promises.readFile(exampleFileTarget, 'utf8');

  t.is(result.code, targetCode);

});
