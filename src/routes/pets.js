const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, t.nome AS nome_tutor
       FROM pet p JOIN tutor t ON p.id_tutor = t.id_tutor
       ORDER BY p.id_pet`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pets' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pet WHERE id_pet = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Pet não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pet' });
  }
});

router.post('/', async (req, res) => {
  const { id_tutor, nome, especie, raca, data_nascimento, peso } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO pet (id_tutor, nome, especie, raca, data_nascimento, peso)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id_tutor, nome, especie, raca, data_nascimento, peso]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar pet' });
  }
});

router.put('/:id', async (req, res) => {
  const { id_tutor, nome, especie, raca, data_nascimento, peso } = req.body;
  try {
    const result = await pool.query(
      `UPDATE pet SET id_tutor=$1, nome=$2, especie=$3, raca=$4, data_nascimento=$5, peso=$6
       WHERE id_pet=$7 RETURNING *`,
      [id_tutor, nome, especie, raca, data_nascimento, peso, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Pet não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar pet' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pet WHERE id_pet = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Pet não encontrado' });
    res.json({ mensagem: 'Pet removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover pet' });
  }
});

module.exports = router;
