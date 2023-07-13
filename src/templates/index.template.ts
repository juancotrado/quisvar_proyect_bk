import PDFDocument, { x } from 'pdfkit';
import { Projects } from '@prisma/client';
type SubTasks = {
  id: number;
  item: string;
  name: string;
};
type Tasks_3 = {
  id: number;
  item: string;
  name: string;
  subTasks: SubTasks[];
};
type Tasks_2 = {
  id: number;
  name: string;
  item: string;
  subTasks: SubTasks[];
  tasks_3: Tasks_3[];
};
type Tasks = {
  id: number;
  name: string;
  item: string;
  subTasks: SubTasks[];
  tasks_2: Tasks_2[];
};
type IndexTasks = {
  id: number;
  name: string;
  item: string;
  subTasks: SubTasks[];
  tasks: Tasks[];
};
type Areas = {
  id: number;
  name: string;
  item: string;
  indexTasks: IndexTasks[];
};

type dataType = {
  CUI: string | null;
  typeSpeciality: string;
  name: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  untilDate: Date;
  areas: Areas[];
  moderator: { profile: { firstName: string; lastName: string } | null };
  stage: { id: number; name: string } | null;
} | null;
export const indexTemplate = (
  dataCallback: any,
  endCallback: any,
  data: dataType
) => {
  const doc = new PDFDocument({
    bufferPages: true,
    font: 'Helvetica',
    size: 'A4',
    margins: { top: 80, left: 40, bottom: 80, right: 40 },
  });
  doc.on('data', dataCallback);
  doc.on('end', endCallback);
  if (!data) return false;
  // doc
  //   .fontSize(12)
  //   .text(
  //     `_____________________________________________________________________________`
  //   );
  // doc
  //   .font('Helvetica-Bold')
  //   .fontSize(16)
  //   .text(`Datos del Proyecto`, { align: 'center', underline: true });
  // doc
  //   .font('Helvetica')
  //   .fontSize(11.5)
  //   .list(
  //     [
  //       `CUI: ${data.CUI}`,
  //       `TIPO DE ESPECIALIDAD: ${data.typeSpeciality}`,
  //       `NOMBRE CORTO: ${data.name}`,
  //       // `ETAPA: ${data?.stage?.name}`,
  //       // `COORDINADOR: ${data?.moderator.profile?.lastName} ${data?.moderator.profile?.firstName}`,
  //       // `DISTRITO: ${newLocation}`,
  //       // `FECHA INICIO: ${data.startDate}`,
  //       // `FECHA FIN: ${data.untilDate}`,
  //       // `NOMBRE COMPLETO: ${data.description}`,
  //     ],
  //     {
  //       columns: 1,
  //       columnGap: 3,
  //       listType: 'bullet',
  //       bulletRadius: 0.01,
  //     }
  //   );
  doc
    .fontSize(12)
    .text(
      `_____________________________________________________________________________`
    );
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .text(`Índice del Proyecto`, { align: 'center', underline: true });
  data.areas.forEach(area => {
    doc.font('Helvetica').fontSize(15).text(`${area.item}.${area.name} `, {
      align: 'left',
    });
    area.indexTasks.forEach(indexTask => {
      doc
        .font('Helvetica')
        .fillColor('#C62525')
        .fontSize(14)
        .text(`${indexTask.item}.${indexTask.name}`, {
          align: 'left',
        });
      indexTask.subTasks.forEach(subtask => {
        doc
          .font('Helvetica')
          .fillColor('red')
          .fontSize(12)
          .text(`  ${subtask.item}.${subtask.name} `, {
            align: 'left',
          });
      });
      indexTask.tasks.forEach(task => {
        doc
          .font('Helvetica')
          .fillColor('#3F9EDE')
          .fontSize(13)
          .text(`${task.item}.${task.name} `, {
            align: 'left',
          });
        task.subTasks.forEach(subtask => {
          doc
            .font('Helvetica')
            .fillColor('red')
            .fontSize(12)
            .text(`  ${subtask.item}.${subtask.name} `, {
              align: 'left',
            });
        });
        task.tasks_2.forEach(task2 => {
          doc
            .font('Helvetica')
            .fontSize(12)
            .fillColor('green')
            .text(`${task2.item}.${task2.name} `, {
              align: 'left',
            });
          task2.subTasks.forEach(subtask => {
            doc
              .font('Helvetica')
              .fillColor('red')
              .fontSize(12)
              .text(`  ${subtask.item}.${subtask.name} `, {
                align: 'left',
              });
          });
          task2.tasks_3.forEach(task3 => {
            doc
              .font('Helvetica')
              .fillColor('#6923B9')
              .fontSize(11)
              .text(`${task3.item}.${task3.name} `, {
                align: 'left',
              });
            task3.subTasks.forEach(subtask => {
              doc
                .font('Helvetica')
                .fillColor('red')
                .fontSize(12)
                .text(`  ${subtask.item}.${subtask.name} `, {
                  align: 'left',
                });
            });
          });
        });
      });
    });
  });
  doc
    .fontSize(12)
    .fillColor('#000')
    .text(
      `_____________________________________________________________________________`
    );
  doc.end();
  return true;
};
