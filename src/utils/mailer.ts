// nodemailerService.ts
import nodemailer, { Transporter } from 'nodemailer';
import { recoveryPasswordHtml } from './htmlString';

// Configuración del transportador (SMTP)
const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'coorporaciondhyriumsaa@gmail.com',
    pass: 'hrwe bwtz hcrm uvin',
  },
});

// Función para enviar un correo de agradecimiento
const enviarCorreoAgradecimiento = (
  correoDestinatario: string,
  description: string
): void => {
  // Configuración del mensaje
  const mailOptions = {
    from: 'coorporaciondhyriumsaa@gmail.com',
    to: correoDestinatario,
    subject: 'De parte de DHYRIUM',
    text: `${description}\n\nSaludos`,
  };

  // Envío del correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo de agradecimiento:', error);
    } else {
      console.log('Correo de agradecimiento enviado con éxito:', info.response);
    }
  });
};
const sendLinkToRecoveryPassword = (
  to: string,
  name: string,
  verficationLink: string
): void => {
  const mailOptions = {
    from: '"Recuperar contraseña 👻" <coorporaciondhyriumsaa@gmail.com>',
    to,
    subject: 'Recuperar contraseña',
    html: recoveryPasswordHtml(name, verficationLink),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo :', error);
    } else {
      console.log(
        'Correo para restablece la contraseña enviado con éxito:',
        info.response
      );
    }
  });
};

export { enviarCorreoAgradecimiento, sendLinkToRecoveryPassword };
