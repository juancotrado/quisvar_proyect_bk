import { createWriteStream, rmSync } from 'fs';
import archiver, { ArchiverOptions } from 'archiver';

interface Options extends ArchiverOptions {
  removeDir: boolean;
}
export const archiverFolder = (
  sourceDir: string,
  outputFilePath: string,
  props?: Options
) => {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputFilePath);
    const archive = archiver('zip', {
      zlib: { level: 1 },
      ...props,
    });

    archive.on('error', err => {
      reject(err);
    });

    archive.on('warning', err => {
      reject(err);
    });

    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      resolve(outputFilePath);
    });

    output.on('finish', () => {
      try {
        if (props?.removeDir) rmSync(sourceDir, { recursive: true });
        console.log('end drainer');
      } catch (error) {
        reject(error);
      }
    });
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};
