const bcrypt = require('bcrypt');

const verifyCode = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const now = new Date();
    if (
      user.resetCode !== code ||
      !user.resetCodeExp ||
      new Date(user.resetCodeExp) < now
    ) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExp = null;
    await user.save();

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error en verifyCode:', error);
    res.status(500).json({ message: 'Error al verificar código' });
  }
};
