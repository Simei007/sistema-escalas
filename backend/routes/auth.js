const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'segredo';

router.post('/login', async (req,res)=>{
  const {login,senha} = req.body;

  const [rows] = await db.query(
    "SELECT * FROM usuarios WHERE login=?",
    [login]
  );

  if(!rows.length) return res.status(401).json({erro:'Login inválido'});

  const ok = await bcrypt.compare(senha, rows[0].senha);
  if(!ok) return res.status(401).json({erro:'Senha inválida'});

  const token = jwt.sign(
    {id:rows[0].id, role:rows[0].role},
    JWT_SECRET
  );

  res.json({token, role: rows[0].role, nome: rows[0].nome});
});

module.exports = router;
