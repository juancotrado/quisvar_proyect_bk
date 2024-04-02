import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { prisma } from '../utils/prisma.server';
import { Server as WebSocketServer } from 'socket.io';
import http from 'http';

import {
  userRouter,
  authRouter,
  projectRouter,
  subTaskRouter,
  profileRouter,
  speacilitiesRouter,
  filesRouter,
  reportsRouter,
  feedbacksRouter,
  duplicatesRouter,
  archiverRouter,
  stagesRouter,
  typeSpecialityRouter,
  sectorRouter,
  levelsRouter,
  listRouter,
  licenseRouter,
  MailRouter,
  companiesRouter,
  specialistRouter,
  areaSpecialtyRouter,
  trainingSpecialtyRouter,
  areaSpecialtyListRouter,
  trainingSpecialtyListRouter,
  workStationRouter,
  equipmentRouter,
  contractRoutes,
  consortiumRoutes,
  groupsRoutes,
  payMailRoutes,
  AttendanceGroupRoutes,
  DutyRoutes,
  DutyMembersRoutes,
  roleRoutes,
  BasiclevelsRoutes,
  BasicTasksRoutes,
  PDFGenerateRouter,
  EncryptRouter,
} from '../routes';
import AppError from '../utils/appError';
import globalErrorHandler from '../middlewares/error.middleware';
import morgan from 'morgan';
import Sockets from './sockets';
import { verifySecretEnv } from '../middlewares/auth.middleware';
import TimerCron from './timer';
import { setAdmin } from '../utils/tools';
import path from 'path';
import { docs } from '../middlewares';
import { env } from 'process';
// import GenerateFiles from '../utils/generateFile';
// import { exec } from 'child_process';

dotenv.config();
class Server {
  private app!: Application;
  private io: WebSocketServer;
  private httpServer: http.Server;
  private PORT: string = process.env.PORT || '8080';
  private HOST: string = process.env.HOST || 'localhost';
  private rootDir = path.resolve(__dirname, '../..');
  private path = {
    auth: `/${process.env.ROUTE}/auth`,
    users: `/${process.env.ROUTE}/users`,
    profile: `/${process.env.ROUTE}/profile`,
    specialities: `/${process.env.ROUTE}/specialities`,
    projects: `/${process.env.ROUTE}/projects`,
    subtasks: `/${process.env.ROUTE}/subtasks`,
    basictasks: `/${process.env.ROUTE}/basictasks`,
    files: `/${process.env.ROUTE}/files`,
    reports: `/${process.env.ROUTE}/reports`,
    feedbacks: `/${process.env.ROUTE}/feedbacks`,
    duplicates: `/${process.env.ROUTE}/duplicates`,
    archiver: `/${process.env.ROUTE}/archiver`,
    stages: `/${process.env.ROUTE}/stages`,
    typespecialities: `/${process.env.ROUTE}/typespecialities`,
    sector: `/${process.env.ROUTE}/sector`,
    levels: `/${process.env.ROUTE}/levels`,
    basiclevels: `/${process.env.ROUTE}/basiclevels`,
    resource: `/${process.env.ROUTE}/resource`,
    list: `/${process.env.ROUTE}/list`,
    license: `/${process.env.ROUTE}/license`,
    mail: `/${process.env.ROUTE}/mail`,
    paymail: `/${process.env.ROUTE}/paymail`,
    companies: `/${process.env.ROUTE}/companies`,
    specialists: `/${process.env.ROUTE}/specialists`,
    areaSpecialty: `/${process.env.ROUTE}/areaSpecialty`,
    trainingSpecialty: `/${process.env.ROUTE}/trainingSpecialty`,
    areaSpecialtyList: `/${process.env.ROUTE}/areaSpecialtyList`,
    trainingSpecialtyList: `/${process.env.ROUTE}/trainingSpecialtyList`,
    workStation: `/${process.env.ROUTE}/workStation`,
    equipment: `/${process.env.ROUTE}/equipment`,
    contract: `/${process.env.ROUTE}/contract`,
    consortium: `/${process.env.ROUTE}/consortium`,
    groups: `/${process.env.ROUTE}/groups`,
    attendanceGroup: `/${process.env.ROUTE}/attendanceGroup`,
    duty: `/${process.env.ROUTE}/duty`,
    dutyMembers: `/${process.env.ROUTE}/dutyMembers`,
    role: `/${process.env.ROUTE}/role`,
    generatepdf: `/${process.env.ROUTE}/generate-pdf`,
    encrypt: `/${process.env.ROUTE}/encrypt`,
  };

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.conectionCron();
    this.app.set('trust proxy', true);
    this.io = new WebSocketServer(this.httpServer, {
      connectionStateRecovery: {},
      cors: {
        origin: '*',
      },
    });
    this.conectionWebSockect();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use('/projects', express.static('uploads/projects'));
    this.app.use('/index', express.static('index'));
    this.app.use('/models', express.static('uploads/models'));
    this.app.use('/editables', express.static('uploads/editables'));
    this.app.use('/reviews', express.static('uploads/reviews'));
    this.app.use('/file-user', express.static('public'));
    this.app.use('/general', express.static('public/general'));
    this.app.use('/reports', express.static('public/reports'));
    this.app.use('/images', express.static('public'));
    this.app.use('/public', express.static('public'));

    this.app.use(express.json());
    this.morganConfiguration();
    this.app.use(verifySecretEnv);
  }

  morganConfiguration() {
    const prodConfig =
      ':method :url :status :response-time ms - :res[content-length] / IP:[:remote-addr] - :date[clf]';
    if (env.NODE_ENV === 'production') {
      this.app.use(morgan(prodConfig));
    } else {
      this.app.use(morgan('dev'));
    }
  }
  //ms-word:ofe|u|http://localhost:8081/file-user/cv%20%2015-03-2024.docx
  // ms-word:ofe|u|http://localhost:8081/api-docs/file-user/cv%20%2015-03-2024.docx
  conectionCron() {
    const time = new TimerCron('00 20 * * *');
    // GenerateFiles.coverFirma(
    //   'compress_cp/servicio.pdf',
    //   'compress_cp/servicio_firma.pdf',
    //   {
    //     pos: 10,
    //     title: 'Gerencia General',
    //     numberPage: 123,
    //     to: 'Diego Adolfo Romani Cotohuanca Puerquisimo Diego ',
    //     date: '2024/11/12',
    //     observation:
    //       'Se encontraron nuevas irregularidades en el documento presentado sin folio',
    //   }
    // );
    // new ZipUtil()
    time.crontimer(() => {
      // exec('ls', (error, stdout, stderr) => {
      //   if (error) {
      //     console.error(`exec error: ${error}`);
      //     return;
      //   }
      //   console.log(`stdout: ${stdout}`);
      //   console.error(`stderr: ${stderr}`);
      // });
    });
  }
  conectionWebSockect() {
    new Sockets(this.io);
  }
  routes() {
    this.app.use(this.path.auth, authRouter);
    this.app.use(this.path.users, userRouter);
    this.app.use(this.path.profile, profileRouter);
    this.app.use(this.path.projects, projectRouter);
    this.app.use(this.path.specialities, speacilitiesRouter);
    this.app.use(this.path.subtasks, subTaskRouter);
    this.app.use(this.path.basictasks, BasicTasksRoutes);
    this.app.use(this.path.files, filesRouter);
    this.app.use(this.path.reports, reportsRouter);
    this.app.use(this.path.feedbacks, feedbacksRouter);
    this.app.use(this.path.duplicates, duplicatesRouter);
    this.app.use(this.path.archiver, archiverRouter);
    this.app.use(this.path.stages, stagesRouter);
    this.app.use(this.path.typespecialities, typeSpecialityRouter);
    this.app.use(this.path.sector, sectorRouter);
    this.app.use(this.path.levels, levelsRouter);
    this.app.use(this.path.basiclevels, BasiclevelsRoutes);
    this.app.use(this.path.list, listRouter);
    this.app.use(this.path.license, licenseRouter);
    this.app.use(this.path.mail, MailRouter);
    this.app.use(this.path.paymail, payMailRoutes);
    this.app.use(this.path.companies, companiesRouter);
    this.app.use(this.path.specialists, specialistRouter);
    this.app.use(this.path.areaSpecialty, areaSpecialtyRouter);
    this.app.use(this.path.trainingSpecialty, trainingSpecialtyRouter);
    this.app.use(this.path.areaSpecialtyList, areaSpecialtyListRouter);
    this.app.use(this.path.trainingSpecialtyList, trainingSpecialtyListRouter);
    this.app.use(this.path.workStation, workStationRouter);
    this.app.use(this.path.equipment, equipmentRouter);
    this.app.use(this.path.contract, contractRoutes);
    this.app.use(this.path.consortium, consortiumRoutes);
    this.app.use(this.path.groups, groupsRoutes);
    this.app.use(this.path.attendanceGroup, AttendanceGroupRoutes);
    this.app.use(this.path.duty, DutyRoutes);
    this.app.use(this.path.dutyMembers, DutyMembersRoutes);
    this.app.use(this.path.role, roleRoutes);
    this.app.use(this.path.generatepdf, PDFGenerateRouter);
    this.app.use(this.path.encrypt, EncryptRouter);
    this.app.use(docs);
    this.app.all('*', (req: Request, res: Response, next: NextFunction) => {
      res.locals.pageNotFound = this.rootDir + '/404_page/index.html';
      return next(
        new AppError(`can't find ${req.originalUrl} on this server`, 404)
      );
    });
    this.app.use(globalErrorHandler);
  }
  listen() {
    this.httpServer.listen(this.PORT, async () => {
      if (this.PORT && this.HOST) {
        prisma;
        const server = `http://${this.HOST}:${this.PORT}`;
        console.log(`🚀 Server deployed at: ${server}`);
        console.log(`📝 View docs at: ${server}/api-docs`);
        await setAdmin();
      } else {
        console.log('No se pudo conectar al servidor 😥');
      }
    });
  }
}
export default Server;
