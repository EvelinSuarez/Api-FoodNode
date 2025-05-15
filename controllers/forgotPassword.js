const nodemailer = require('nodemailer');

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    user.resetCode = code;
    user.resetCodeExp = expiration;
    await user.save();

    // Configura el transporte
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Soporte" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Código para restablecer contraseña',
      html: `<p>Tu código de verificación es:</p><h2>${code}</h2><p>Este código expirará en 10 minutos.</p>`,
    });

    res.json({ message: 'Código de verificación enviado al correo' });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ message: 'Error al enviar correo' });
  }
};
