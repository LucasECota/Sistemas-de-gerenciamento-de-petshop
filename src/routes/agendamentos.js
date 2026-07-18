const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar agendamentos com dados do pet, funcionário e serviços associados
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id_agendamento, a.data_hora, a.status,
             p.nome AS nome_pet, f.nome AS nome_funcionario,
             COALESCE(
               STRING_AGG(s.nome, ', ' ORDER BY s.nome), ''
             ) AS servicos
      FROM agendamento a
      JOIN pet p ON a.id_pet = p.id_pet
      JOIN funcionario f ON a.id_funcionario = f.id_funcionario
      LEFT JOIN agendamento_servico ags ON a.id_agendamento = ags.id_agendamento
      LEFT JOIN servico s ON ags.id_servico = s.id_servico
      GROUP BY a.id_agendamento, p.nome, f.nome
      ORDER BY a.data_hora DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const agendamento = await pool.query('SELECT * FROM agendamento WHERE id_agendamento = $1', [req.params.id]);
    if (agendamento.rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });

    const servicos = await pool.query(
      `SELECT s.id_servico, s.nome, s.preco FROM agendamento_servico ags
       JOIN servico s ON ags.id_servico = s.id_servico
       WHERE ags.id_agendamento = $1`,
      [req.params.id]
    );
    res.json({ ...agendamento.rows[0], servicos: servicos.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar agendamento' });
  }
});

// Criar agendamento + vincular serviços (recebe id_servicos: [1,2,3])
router.post('/', async (req, res) => {
  const { id_pet, id_funcionario, data_hora, status, id_servicos } = req.body;

  const dataObj = new Date(data_hora);
  const hora = dataObj.getHours();
  const minutos = dataObj.getMinutes();

  if (minutos !== 0 && minutos !== 30) {
    return res.status(400).json({ erro: 'O horário deve ser em intervalos de 30 minutos (00 ou 30).' });
  }
  if (hora < 6 || hora > 20 || (hora === 20 && minutos > 0)) {
    return res.status(400).json({ erro: 'O horário de atendimento é das 06:00 às 20:00.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const agendamento = await client.query(
      `INSERT INTO agendamento (id_pet, id_funcionario, data_hora, status)
       VALUES ($1, $2, $3, COALESCE($4, 'agendado')) RETURNING *`,
      [id_pet, id_funcionario, data_hora, status]
    );

    const idAgendamento = agendamento.rows[0].id_agendamento;

    if (Array.isArray(id_servicos)) {
      for (const idServico of id_servicos) {
        await client.query(
          `INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES ($1, $2)`,
          [idAgendamento, idServico]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(agendamento.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const { id_pet, id_funcionario, data_hora, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE agendamento SET id_pet=$1, id_funcionario=$2, data_hora=$3, status=$4
       WHERE id_agendamento=$5 RETURNING *`,
      [id_pet, id_funcionario, data_hora, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar agendamento' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM agendamento WHERE id_agendamento = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json({ mensagem: 'Agendamento removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover agendamento' });
  }
});

// Atualizar apenas o status do agendamento
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const statusValidos = ['agendado', 'concluido', 'cancelado'];

  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido. Use: agendado, concluido ou cancelado.' });
  }

  try {
    const result = await pool.query(
      `UPDATE agendamento SET status = $1 WHERE id_agendamento = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

module.exports = router;
