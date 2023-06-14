import { createWriteStream } from 'fs';
import archiver from 'archiver';

export const archiverFolder = (folderPath: string, zipFilePath: string) => {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 1 },
    });

    output.on('close', () => {
      resolve('¡Carpeta comprimida exitosamente!');
    });

    archive.on('error', err => {
      reject(err);
    });

    archive.directory(folderPath, false);

    archive.pipe(output);
    archive.finalize();
  });
};
