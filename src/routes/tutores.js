const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar todos os tutores
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tutor ORDER BY id_tutor');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar tutores' });
  }
});

// Buscar tutor por id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tutor WHERE id_tutor = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Tutor não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar tutor' });
  }
});

// Criar tutor
router.post('/', async (req, res) => {
  const { nome, cpf, telefone, email, endereco } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tutor (nome, cpf, telefone, email, endereco)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nome, cpf, telefone, email, endereco]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar tutor' });
  }
});

// Atualizar tutor
router.put('/:id', async (req, res) => {
  const { nome, cpf, telefone, email, endereco } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tutor SET nome=$1, cpf=$2, telefone=$3, email=$4, endereco=$5
       WHERE id_tutor=$6 RETURNING *`,
      [nome, cpf, telefone, email, endereco, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Tutor não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar tutor' });
  }
});

// Deletar tutor
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tutor WHERE id_tutor = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Tutor não encontrado' });
    }
    res.json({ mensagem: 'Tutor removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover tutor' });
  }
});

module.exports = router;
