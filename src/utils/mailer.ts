// nodemailerService.ts
import nodemailer, { Transporter } from 'nodemailer';

// Configuración del transportador (SMTP)
const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'j1mer0528@gmail.com',
    pass: 'gzuz vwud eeik iooa',
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

export { enviarCorreoAgradecimiento };
