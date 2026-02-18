const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

const SAIDAS_PERMITIDAS = [
  'Fretamento',
  'Apresentação na Garagem',
  'Embarque na Ponta da Praia',
  'Embarque no Porto',
  'Embarque na Rodoviária',
  'Plantão'
];

function saidaValida(saida) {
  return SAIDAS_PERMITIDAS.includes(saida);
}

router.get('/', auth, async (req,res)=>{
  try {
    if(req.user.role === 'ESCALANTE' || req.user.role === 'ADMIN'){
      const [rows] = await db.query(
        "SELECT id, usuario_id, data, hora_inicio, hora_saida, saida FROM escalas"
      );
      return res.json(rows);
    }

    const [rows] = await db.query(
      "SELECT id, usuario_id, data, hora_inicio, hora_saida, saida FROM escalas WHERE usuario_id=?",
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar escalas:', err);
    res.status(500).json({ erro: 'Erro interno ao carregar escalas' });
  }
});

router.post('/', auth, async (req,res)=>{
  try {
    const {usuario_id,data,hora_inicio,hora_saida,saida} = req.body;

    if(!usuario_id || !data || !hora_inicio || !hora_saida || !saida){
      return res.status(400).json({erro:'Campos obrigatorios ausentes'});
    }

    if(!saidaValida(saida)){
      return res.status(400).json({
        erro: 'Saida invalida',
        saidasPermitidas: SAIDAS_PERMITIDAS
      });
    }

    const [result] = await db.query(
      "INSERT INTO escalas (id, usuario_id, data, hora_inicio, hora_saida, saida) VALUES (NULL,?,?,?,?,?)",
      [usuario_id,data,hora_inicio,hora_saida,saida]
    );

    res.json({
      ok: true,
      escala: {
        id: result.insertId,
        usuario_id,
        data,
        hora_inicio,
        hora_saida,
        saida
      }
    });
  } catch (err) {
    console.error('Erro ao criar escala:', err);
    res.status(500).json({ erro: 'Erro interno ao salvar escala' });
  }
});

router.put('/:id', auth, async (req,res)=>{
  try {
    const { id } = req.params;
    const {usuario_id,data,hora_inicio,hora_saida,saida} = req.body;

    if(!usuario_id || !data || !hora_inicio || !hora_saida || !saida){
      return res.status(400).json({erro:'Campos obrigatorios ausentes'});
    }

    if(!saidaValida(saida)){
      return res.status(400).json({
        erro: 'Saida invalida',
        saidasPermitidas: SAIDAS_PERMITIDAS
      });
    }

    if(req.user.role !== 'ESCALANTE' && req.user.role !== 'ADMIN'){
      const [escala] = await db.query(
        "SELECT id FROM escalas WHERE id=? AND usuario_id=?",
        [id, req.user.id]
      );

      if(!escala.length) return res.status(403).json({erro:'Sem permissao'});
    }

    await db.query(
      "UPDATE escalas SET usuario_id=?, data=?, hora_inicio=?, hora_saida=?, saida=? WHERE id=?",
      [usuario_id,data,hora_inicio,hora_saida,saida,id]
    );

    res.json({
      ok: true,
      escala: {
        id: Number(id),
        usuario_id,
        data,
        hora_inicio,
        hora_saida,
        saida
      }
    });
  } catch (err) {
    console.error('Erro ao atualizar escala:', err);
    res.status(500).json({ erro: 'Erro interno ao atualizar escala' });
  }
});

router.delete('/:id', auth, async (req,res)=>{
  try {
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
  } catch (err) {
    console.error('Erro ao excluir escala:', err);
    res.status(500).json({ erro: 'Erro interno ao excluir escala' });
  }
});

module.exports = router;

