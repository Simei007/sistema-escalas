const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req,res)=>{
  if(req.user.role === 'ESCALANTE' || req.user.role === 'ADMIN'){
    const [rows] = await db.query("SELECT * FROM escalas");
    return res.json(rows);
  }

  const [rows] = await db.query(
    "SELECT * FROM escalas WHERE usuario_id=?",
    [req.user.id]
  );

  res.json(rows);
});

router.post('/', auth, async (req,res)=>{
  const {usuario_id,data,hora_inicio,hora_fim,servico} = req.body;

  await db.query(
    "INSERT INTO escalas VALUES (NULL,?,?,?,?,?)",
    [usuario_id,data,hora_inicio,hora_fim,servico]
  );

  res.json({ok:true});
});

router.put('/:id', auth, async (req,res)=>{
  const { id } = req.params;
  const {usuario_id,data,hora_inicio,hora_fim,servico} = req.body;

  if(req.user.role !== 'ESCALANTE' && req.user.role !== 'ADMIN'){
    const [escala] = await db.query(
      "SELECT id FROM escalas WHERE id=? AND usuario_id=?",
      [id, req.user.id]
    );

    if(!escala.length) return res.status(403).json({erro:'Sem permissao'});
  }

  await db.query(
    "UPDATE escalas SET usuario_id=?, data=?, hora_inicio=?, hora_fim=?, servico=? WHERE id=?",
    [usuario_id,data,hora_inicio,hora_fim,servico,id]
  );

  res.json({ok:true});
});

router.delete('/:id', auth, async (req,res)=>{
  const { id } = req.params;

  if(req.user.role === 'ESCALANTE' || req.user.role === 'ADMIN'){
    await db.query("DELETE FROM escalas WHERE id=?", [id]);
    return res.json({ok:true});
  }

  await db.query(
    "DELETE FROM escalas WHERE id=? AND usuario_id=?",
    [id, req.user.id]
  );

  res.json({ok:true});
});

module.exports = router;
