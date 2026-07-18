const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servico ORDER BY id_servico');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar serviços' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servico WHERE id_servico = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar serviço' });
  }
});

router.post('/', async (req, res) => {
  const { nome, descricao, preco } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO servico (nome, descricao, preco) VALUES ($1, $2, $3) RETURNING *`,
      [nome, descricao, preco]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar serviço' });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, descricao, preco } = req.body;
  try {
    const result = await pool.query(
      `UPDATE servico SET nome=$1, descricao=$2, preco=$3 WHERE id_servico=$4 RETURNING *`,
      [nome, descricao, preco, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar serviço' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM servico WHERE id_servico = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
    res.json({ mensagem: 'Serviço removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover serviço' });
  }
});

module.exports = router;
