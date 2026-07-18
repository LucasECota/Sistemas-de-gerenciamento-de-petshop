const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const tutoresRouter = require('./routes/tutores');
const petsRouter = require('./routes/pets');
const funcionariosRouter = require('./routes/funcionarios');
const servicosRouter = require('./routes/servicos');
const agendamentosRouter = require('./routes/agendamentos');
const produtosRouter = require('./routes/produtos');
const vendasRouter = require('./routes/vendas');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/tutores', tutoresRouter);
app.use('/api/pets', petsRouter);
app.use('/api/funcionarios', funcionariosRouter);
app.use('/api/servicos', servicosRouter);
app.use('/api/agendamentos', agendamentosRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/vendas', vendasRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
