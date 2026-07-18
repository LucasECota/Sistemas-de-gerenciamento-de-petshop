const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produto ORDER BY id_produto');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produto WHERE id_produto = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar produto' });
  }
});

router.post('/', async (req, res) => {
  const { nome, preco, estoque } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO produto (nome, preco, estoque) VALUES ($1, $2, $3) RETURNING *`,
      [nome, preco, estoque]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar produto' });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, preco, estoque } = req.body;
  try {
    const result = await pool.query(
      `UPDATE produto SET nome=$1, preco=$2, estoque=$3 WHERE id_produto=$4 RETURNING *`,
      [nome, preco, estoque, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM produto WHERE id_produto = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json({ mensagem: 'Produto removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover produto' });
  }
});

module.exports = router;
