import fs from 'fs';
import { basename, join, relative, extname } from 'path';
import { createFilter } from '@rollup/pluginutils';
import fetch from 'node-fetch';
import MagicString from 'magic-string';


export default function bundleFonts(options = {}) {
  const filter = createFilter(options.include || ['**/*.css'], options.exclude);
  
  const fontExtensions = options.fontExtensions || ['.woff', '.woff2', '.ttf'];

  if (!options.cssBundleDir || !options.fontTargetDir) {
    throw new Error('Must provide fontTargetDir and cssBundleDir config properties for the bundleFonts plugin in your rollup config file.');
  }
  
  const fontTargetDir = options.fontTargetDir;
  const cssBundleDir = options.cssBundleDir;

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
      let matches = [...code.matchAll(search)];

      matches = matches.filter( ([match, url]) => fontExtensions.includes(extname(url)) );

      if (matches.length === 0) {
        return {code: code, map: null}; 
      }

      let transformedCode = new MagicString(code);

      const promiseArray = [];
      const uniqueFontUrls = new Set();

      await createDestDirectory(fontTargetDir);

      for (const [match, url] of matches) {
        if (!uniqueFontUrls.has(url)) {
          uniqueFontUrls.add(url);
          const destFile = join(fontTargetDir, basename(url));
          const relFontPath = join(relative(cssBundleDir, fontTargetDir), basename(url));

          transformedCode.replaceAll(`"${url}"`, `"${relFontPath}"`);    
          
          promiseArray.push(downloadAndSave(url, destFile));
        }
      }

      const statuses = await Promise.allSettled(promiseArray);
      
      const rejected = statuses.filter( item => item.status === 'rejected');

      if (rejected.length > 0) {
        // at least one download failed
        throw new Error(rejected.reduce( (accum, current) => `${accum}, ${current}`, ''));
      }

      return {
        code: transformedCode.toString(),
        map: transformedCode.generateMap({source: id, hires: true})
      }; 
    },

  };
}


async function downloadAndSave(url, destFile) {
  try {
    await fs.promises.stat(destFile);
  } catch (e) {
    if (e.code === "ENOENT") {
      // file does not exist so download and save
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Unable to download font: ${url}`);
      }

      try {
        const fileStream = fs.createWriteStream(destFile);
        
        await new Promise((resolve, reject) => {
          response.body.pipe(fileStream);
          response.body.on("error", reject);
          fileStream.on("finish", resolve);
        });
      } catch (downloadError) {
        // Make sure destFile is deleted, if it exists
        // Cannot have partially downloaded font files around since they will not be re-downloaded
        // if they already exist
        try {
          await fs.promises.rm(destFile);
        } catch (deleteError) {
          if (e.code !== "ENOENT") {
            throw deleteError;
          }
        }

        throw downloadError; //re-throw error so that run fails
      }

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
