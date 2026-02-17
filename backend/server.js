require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/escalas', require('./routes/escalas'));
app.use('/motoristas', require('./routes/motoristas'));

app.listen(3000, '0.0.0.0', () =>
  console.log('Servidor rodando na porta 3000 (0.0.0.0)')
);
