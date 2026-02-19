const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: rows[0].id, role: rows[0].role }, process.env.JWT_SECRET);

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token ausente' });

  try {
    req.user = jwt.verify(token, 'segredo');
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido' });
  }
};
