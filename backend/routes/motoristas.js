const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

router.get('/', auth, async (req,res)=>{
  const [rows] = await db.query(
    "SELECT id,nome FROM usuarios WHERE role='MOTORISTA'"
  );
  res.json(rows);
});

router.post('/', auth, async (req,res)=>{
  const {nome,login,senha} = req.body;
  const hash = await bcrypt.hash(senha,10);

  await db.query(
    "INSERT INTO usuarios (nome,login,senha,role) VALUES (?,?,?,'MOTORISTA')",
    [nome,login,hash]
  );

  res.json({ok:true});
});

router.delete('/:id', auth, async (req,res)=>{
  const { id } = req.params;

  try{
    const [userRows] = await db.query(
      "SELECT role FROM usuarios WHERE id=?",
      [req.user.id]
    );

    const roleAtual = userRows[0]?.role;
    if(roleAtual !== 'ESCALANTE' && roleAtual !== 'ADMIN'){
      return res.status(403).json({erro:'Sem permissao'});
    }

    await db.query("DELETE FROM escalas WHERE usuario_id=?", [id]);

    const [result] = await db.query(
      "DELETE FROM usuarios WHERE id=? AND role='MOTORISTA'",
      [id]
    );

    if(result.affectedRows === 0){
      return res.status(404).json({erro:'Motorista nao encontrado'});
    }

    res.json({ok:true});
  }catch(err){
    res.status(500).json({erro:'Erro interno ao excluir motorista'});
  }
});

module.exports = router;
