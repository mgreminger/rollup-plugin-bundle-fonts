import { promises as fs } from 'fs';
import test from 'ava';
import bundleFonts from "../dist/rollup-bundle-fonts.es.js";

test('Test transform', async t => {
  
  const exampleFile = "test/example.css";

  const code = await fs.readFile(exampleFile, 'utf8');

  const result = await bundleFonts({fontDir: "assets/fonts"}).transform(code, exampleFile);

  t.pass();

});
