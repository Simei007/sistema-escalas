require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 3000;

const app = express();

const defaultOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'https://simei007.github.io'
];

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin nao permitida pelo CORS'));
  }
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', require('./routes/auth'));
app.use('/escalas', require('./routes/escalas'));
app.use('/motoristas', require('./routes/motoristas'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT} (0.0.0.0)`);
});
