import { Files } from '@prisma/client';
import multer from 'multer';
import { PathServices, _contractPath } from '../services';
import AppError from '../utils/appError';
import { existsSync, mkdirSync } from 'fs';
import { TypeFileUser } from 'types/types';
import { convertToUtf8 } from '../utils/tools';

const MAX_SIZE = 1024 * 1000 * 1000 * 1000;
// const FILE_TYPES = ['.rar', '.zip'];
class StorageConfig {
  public ExtNotAllowed: string[] = ['exe', 'bat', 'sh'];

  public setUp(path: string, pattern?: string, name?: string) {
    return multer.diskStorage({
      destination: (req, file, callback) => {
        if (!existsSync(path)) mkdirSync(path, { recursive: true });
        callback(null, path);
      },
      filename: (req, { originalname }, callback) => {
        const ext = originalname.split('.').at(-1);
        try {
          if (this.ExtNotAllowed.includes(`${ext}`)) throw new Error();
          const patt = pattern ? pattern : '$$';
          const parseFileName = Date.now() + patt + originalname;
          const fileName = name ? name : convertToUtf8(parseFileName);
          callback(null, fileName);
        } catch (error) {
          callback(
            new AppError(`Oops! ,extension ${ext} no permitida`, 404),
            ''
          );
        }
      },
    });
  }

  public setUpPDF(path: string, name?: string) {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        const { id } = req.params;
        if (!existsSync(path)) {
          mkdirSync(path, { recursive: true });
        }
        cb(null, `${path}/${id}`);
      },
      filename: async (req, { originalname }, callback) => {
        try {
          const { id } = req.params;
          const ext = originalname.split('.').at(-1);
          if (!['pdf', 'PDF'].includes(`${ext}`)) throw new Error();
          const parseName: string = id + '.' + ext;
          const fileName = name ? name : parseName;
          callback(null, fileName);
        } catch (error) {
          callback(new AppError(`Oops! , archivo sin extension pdf`, 404), '');
        }
      },
    });
  }
}

const BlackList = new StorageConfig().ExtNotAllowed;

const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    try {
      const { id } = req.params;
      const _subtask_id = parseInt(id);
      const status = req.query.status as Files['type'];
      const path = await PathServices.subTask(_subtask_id, status);
      callback(null, path);
    } catch (error) {
      callback(new AppError(`No se pudo encontrar la ruta`, 404), '');
    }
  },
  filename: async (req, { originalname }, callback) => {
    const ext = originalname.split('.').at(-1) || '';
    try {
      if (BlackList.includes(ext) || originalname.includes('$'))
        throw new Error();
      const uniqueSuffix = Date.now();
      callback(null, convertToUtf8(uniqueSuffix + '$$' + originalname));
    } catch (error) {
      callback(
        new AppError(`Oops! , envie archivos con extension no repetida`, 404),
        ''
      );
    }
  },
});

const storageFileUser = multer.diskStorage({
  destination: function (req, file, cb) {
    const typeFileUser = req.query.typeFile as TypeFileUser;
    let uploadPath;
    if (typeFileUser) {
      uploadPath = `public/${typeFileUser}`;
    } else {
      uploadPath =
        file.fieldname === 'fileUserDeclaration'
          ? 'public/declaration'
          : `public/cv`;
    }
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, { originalname }, cb) {
    const ext = originalname.split('.').at(-1) || '';
    try {
      if (BlackList.includes(ext)) throw new Error();
      cb(null, convertToUtf8(Date.now() + '$$' + originalname));
    } catch (error) {
      cb(
        new AppError(`Oops! , envie archivos con extension no repetida`, 404),
        ''
      );
    }
  },
});

const storageFileSpecialist = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'public/cv';
    if (file.fieldname === 'fileAgreement') {
      uploadPath = `public/agreement`;
    }
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, { originalname }, cb) {
    const ext = originalname.split('.').at(-1) || '';
    try {
      if (BlackList.includes(ext)) throw new Error();
      cb(null, convertToUtf8(Date.now() + '$$' + originalname));
    } catch (error) {
      cb(new AppError(`Oops! ,extension ${ext} no permitida`, 404), '');
    }
  },
});

const storageReportUser = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = `public/reports`;
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: async (req, file, callback) => {
    try {
      const uniqueSuffix = Date.now();
      const { originalname } = file;
      if (!originalname.includes('.pdf') || originalname.includes('$'))
        throw new Error();
      const nameFile = uniqueSuffix + '$' + originalname;
      callback(null, convertToUtf8(nameFile));
    } catch (error) {
      callback(
        new AppError(`Oops! , archivo sin extension pdf o contiene "$"`, 404),
        ''
      );
    }
  },
});

class Stogares extends StorageConfig {
  public companies: multer.Multer = multer({
    storage: this.setUp('public/img/companies'),
  });

  public consortium: multer.Multer = multer({
    storage: this.setUp('public/img/consortium'),
  });

  public equipment: multer.Multer = multer({
    storage: this.setUp('public/equipment'),
  });

  public trainingSpecialty: multer.Multer = multer({
    storage: this.setUp('public/training'),
  });

  public generalFiles: multer.Multer = multer({
    storage: this.setUp('public/general'),
  });

  public contractFile: multer.Multer = multer({
    storage: this.setUpPDF(_contractPath),
  });

  public areaSpecialty: multer.Multer = multer({
    storage: this.setUpPDF('public/specialty'),
  });

  public workStation: multer.Multer = multer({
    storage: this.setUpPDF('public/workStation'),
  });

  public fileVoucher: multer.Multer = multer({
    storage: this.setUp('public/voucher'),
  });

  public fileMail: multer.Multer = multer({
    storage: this.setUp('public/mail'),
  });

  public fileGroup: multer.Multer = multer({
    storage: this.setUp('public/groups/daily'),
  });

  public upload: multer.Multer = multer({
    storage: storage,
    limits: { fileSize: MAX_SIZE },
  });

  public fileUser: multer.Multer = multer({
    storage: storageFileUser,
  });

  public reportUser: multer.Multer = multer({
    storage: storageReportUser,
  });

  public fileSpecialist: multer.Multer = multer({
    storage: storageFileSpecialist,
  });
}

// export const acceptFormData = multer().any();

export default new Stogares();

// export const upload = multer({
//   storage: storage,
//   limits: { fileSize: MAX_SIZE },
// });

// export const uploadFileUser = multer({
//   storage: storageFileUser,
// });

// export const uploadReportUser = multer({
//   storage: storageReportUser,
// });

// export const uploadFileSpecialist = multer({
//   storage: storageFileSpecialist,
// });

// const storageGeneralFiles = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadPath = `public/general`;
//     if (!existsSync(uploadPath)) {
//       mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '$$' + convertToUtf8(file.originalname));
//   },
// });

// const storageFileMail = multer.diskStorage({
//   destination: (req, file, callback) => {
//     try {
//       const uploadPath = `public/mail`;
//       if (!existsSync(uploadPath)) {
//         mkdirSync(uploadPath, { recursive: true });
//       }
//       callback(null, uploadPath);
//     } catch (error) {
//       callback(new AppError(`Oops! ,no existe la ruta`, 404), '');
//     }
//   },
//   filename: (req, file, callback) => {
//     try {
//       const uniqueSuffix = Date.now();
//       const { originalname } = file;
//       if (originalname.includes('$')) throw new Error();
//       const nameFile = uniqueSuffix + '$' + originalname;
//       callback(null, nameFile);
//     } catch (error) {
//       callback(new AppError(`Oops! , archivo contiene "$"`, 404), '');
//     }
//   },
// });

// const storageFileVoucher = multer.diskStorage({
//   destination: (req, file, callback) => {
//     try {
//       const uploadPath = `public/voucher`;
//       if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
//       callback(null, uploadPath);
//     } catch (error) {
//       callback(new AppError(`Oops! ,no existe la ruta`, 404), '');
//     }
//   },
//   filename: (req, file, callback) => {
//     try {
//       const uniqueSuffix = Date.now();
//       const { originalname } = file;
//       if (originalname.includes('$')) throw new Error();
//       const nameFile = uniqueSuffix + '$' + originalname;
//       callback(null, nameFile);
//     } catch (error) {
//       callback(new AppError(`Oops! , archivo contiene "$"`, 404), '');
//     }
//   },
// });

// export const uploadGeneralFiles = multer({
//   storage: storageGeneralFiles,
// });

// export const uploadFileMail = multer({
//   storage: storageFileMail,
// });
// export const uploadFileVoucher = multer({
//   storage: storageFileVoucher,
// });

// const storageImgCompanies = multer.diskStorage({
//   destination: function (req, file, cb) {
//     let uploadPath = 'public/img/companies';
//     if (!existsSync(uploadPath)) {
//       mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, files, cb) {
//     const { originalname } = files;

//     cb(null, Date.now() + '$$' + originalname);
//   },
// });

// const storageImgConsortium = multer.diskStorage({
//   destination: function (req, file, cb) {
//     let uploadPath = 'public/img/consortium';
//     if (!existsSync(uploadPath)) {
//       mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, files, cb) {
//     const { originalname } = files;
//     cb(null, Date.now() + '$$' + originalname);
//   },
// });

// const storageAddEquipment = multer.diskStorage({
//   destination: function (req, file, cb) {
//     let uploadPath = 'public/equipment';
//     if (!existsSync(uploadPath)) {
//       mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, files, cb) {
//     const { originalname } = files;
//     cb(null, Date.now() + '$$' + originalname);
//   },
// });

// const storageTrainingSpecialty = multer.diskStorage({
//   destination: function (req, file, cb) {
//     let uploadPath = 'public/training';
//     if (!existsSync(uploadPath)) {
//       mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, files, cb) {
//     const { originalname } = files;
//     cb(null, Date.now() + '$$' + originalname);
//   },
// });
// const storageAreaSpecialty = multer.diskStorage({
//   destination: function (req, file, cb) {
//     let uploadPath = 'public/specialty';
//     if (!existsSync(uploadPath)) {
//       mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, files, cb) {
//     const { originalname } = files;
//     cb(null, Date.now() + '$$' + originalname);
//   },
// });

// const storageAddWorkStation = multer.diskStorage({
//   destination: function (req, file, cb) {
//     let uploadPath = 'public/workStation';
//     if (!existsSync(uploadPath)) {
//       mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, files, cb) {
//     const { originalname } = files;
//     cb(null, Date.now() + '$$' + originalname);
//   },
// });
// const storageContractsFiles = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const { id } = req.params;
//     if (!existsSync(_contractPath)) {
//       mkdirSync(_contractPath, { recursive: true });
//     }
//     cb(null, `${_contractPath}/${id}`);
//   },
//   filename: async (req, file, callback) => {
//     try {
//       // const { fileName } = req.body;
//       const { id } = req.params;
//       const ext = file.originalname.split('.').at(-1);
//       if (!['pdf', 'PDF'].includes(`${ext}`)) throw new Error();
//       const name: string = id + '.' + ext;
//       // const uniqueSuffix = Date.now();
//       // const { originalname } = file;
//       // if (!originalname.includes('.pdf') || originalname.includes('$'))
//       // const fileName = uniqueSuffix + '$' + originalname;
//       callback(null, name);
//     } catch (error) {
//       callback(new AppError(`Oops! , archivo sin extension pdf`, 404), '');
//     }
//   },
// });

// export const uploadFileAreaSpecialty = multer({
//   storage: storageAreaSpecialty,
// });
// export const uploadFileWorkStation = multer({
//   storage: storageAddWorkStation,
// });
// export const uploadFileEquipment = multer({
//   storage: storageAddEquipment,
// });
// export const uploadFileTrainingSpecialty = multer({
//   storage: storageTrainingSpecialty,
// });
// export const uploadFileContracts = multer({
//   storage: storageContractsFiles,
// });
// export const uploadImgCompanies = multer({
//   storage: storageImgCompanies,
// });
// export const uploadImgConsortium = multer({
//   storage: storageImgConsortium,
// });
// export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     res.status(200).json({ message: 'Archivo subido exitosamente' });
//   } catch (error) {
//     next(error);
//   }
// };
