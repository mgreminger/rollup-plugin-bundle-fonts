import fs from 'fs';
import { basename, join } from 'path';
import { createFilter } from '@rollup/pluginutils';
import fetch from 'node-fetch';


export default function bundleFonts(options = {}) {
  const filter = createFilter(options.include || ['**/*.css'], options.exclude);
  
  if (!options.fontDir) {
    throw Error('Must provide fontDir property for the bundleFonts plugin.');
  }
  
  const fontDir = options.fontDir;

  return {
    name: 'bundleFonts',

    /* Type: (code: string, id: string) =>
         string |
         null |
         { code: string, map?: string | SourceMap, ast?: ESTree.Program, moduleSideEffects?: boolean | null } */
    /* Kind: async, sequential */
    async transform(code, id) {
    
      if (!filter(id)) {
        return null;
      }

      const search = /url\("(http[^"]*)"\)/g;  // important to only match absolute urls starting with http
      const matches = code.matchAll(search);

      if (matches.length === 0) {
        return {code: code, map: null}; 
      }

      let transformedCode = code;

      const promiseArray = [];
      const uniqueFontUrls = new Set();

      await createDestDirectory(fontDir);

      for (const [match, url] of matches) {
        if (!uniqueFontUrls.has(url)) {
          uniqueFontUrls.add(url);
          const destFile = join(fontDir, basename(url));

          transformedCode = transformedCode.replaceAll(search, `url("${destFile}")`);    
          
          promiseArray.push(downloadAndSave(url, destFile));

        }
      }

      await Promise.all(promiseArray);
      
      return {code: transformedCode, map: null}; // since code has been transformed, should be regenerating sourcemap 
    },

  };
}


async function downloadAndSave(url, destFile) {
  try {
    await fs.promises.stat(destFile);
  } catch (e) {
    if (e.code === "ENOENT") {
      // file does not exist so download and save
      //console.log(`fetching: ${url}`);
      const response = await fetch(url);
      
      const fileStream = fs.createWriteStream(destFile);
      
      await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on("error", reject);
        fileStream.on("finish", resolve);
      });

    } else {
      throw e;
    }
  }
}

async function createDestDirectory(destDir) {
  try {
    await fs.promises.stat(destDir);
  } catch (e) {
    if (e.code === "ENOENT") {
      // directory doesn't exist, create with any necessary sub directories
      await fs.promises.mkdir(destDir, {recursive: true});
    } else {
      throw e;
    }
  }
}
