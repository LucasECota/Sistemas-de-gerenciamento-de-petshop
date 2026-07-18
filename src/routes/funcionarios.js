const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM funcionario ORDER BY id_funcionario');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar funcionários' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM funcionario WHERE id_funcionario = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Funcionário não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar funcionário' });
  }
});

router.post('/', async (req, res) => {
  const { nome, cpf, cargo, data_contratacao } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO funcionario (nome, cpf, cargo, data_contratacao)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome, cpf, cargo, data_contratacao]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar funcionário' });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, cpf, cargo, data_contratacao } = req.body;
  try {
    const result = await pool.query(
      `UPDATE funcionario SET nome=$1, cpf=$2, cargo=$3, data_contratacao=$4
       WHERE id_funcionario=$5 RETURNING *`,
      [nome, cpf, cargo, data_contratacao, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Funcionário não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar funcionário' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM funcionario WHERE id_funcionario = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Funcionário não encontrado' });
    res.json({ mensagem: 'Funcionário removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover funcionário' });
  }
});

module.exports = router;
