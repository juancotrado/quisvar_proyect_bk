// nodemailerService.ts
import nodemailer, { Transporter } from 'nodemailer';

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
  verficationLink: string
): void => {
  const mailOptions = {
    from: '"Recuperar contraseña 👻" <coorporaciondhyriumsaa@gmail.com>',
    to,
    subject: 'Recuperar contraseña',
    html: `
    <b>Haz click al siguiente link, o pegalo en tu navegador para completa el proceso de recuperacion:</b>
    <a href="${verficationLink}">${verficationLink}</a>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo :', error);
    } else {
      console.log('Correo de agradecimiento enviado con éxito:', info.response);
    }
  });
};

export { enviarCorreoAgradecimiento, sendLinkToRecoveryPassword };
