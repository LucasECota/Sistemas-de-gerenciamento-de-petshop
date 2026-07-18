const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.id_venda, v.data, v.valor_total, t.nome AS nome_tutor
      FROM venda v JOIN tutor t ON v.id_tutor = t.id_tutor
      ORDER BY v.data DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar vendas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const venda = await pool.query('SELECT * FROM venda WHERE id_venda = $1', [req.params.id]);
    if (venda.rows.length === 0) return res.status(404).json({ erro: 'Venda não encontrada' });

    const itens = await pool.query(
      `SELECT vi.id_produto, p.nome, vi.quantidade, vi.preco_unitario
       FROM venda_item vi JOIN produto p ON vi.id_produto = p.id_produto
       WHERE vi.id_venda = $1`,
      [req.params.id]
    );
    res.json({ ...venda.rows[0], itens: itens.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar venda' });
  }
});

// Criar venda + itens (recebe itens: [{id_produto, quantidade, preco_unitario}])
// Também baixa o estoque do produto dentro da mesma transação
router.post('/', async (req, res) => {
  const { id_tutor, itens } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (!Array.isArray(itens) || itens.length === 0) {
      throw new Error('A venda precisa de ao menos um item');
    }

    const valorTotal = itens.reduce((soma, item) => soma + item.quantidade * item.preco_unitario, 0);

    const venda = await client.query(
      `INSERT INTO venda (id_tutor, valor_total) VALUES ($1, $2) RETURNING *`,
      [id_tutor, valorTotal]
    );
    const idVenda = venda.rows[0].id_venda;

    for (const item of itens) {
      await client.query(
        `INSERT INTO venda_item (id_venda, id_produto, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)`,
        [idVenda, item.id_produto, item.quantidade, item.preco_unitario]
      );

      const estoqueAtual = await client.query(
        'SELECT estoque FROM produto WHERE id_produto = $1',
        [item.id_produto]
      );
      if (estoqueAtual.rows[0].estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto ${item.id_produto}`);
      }

      await client.query(
        `UPDATE produto SET estoque = estoque - $1 WHERE id_produto = $2`,
        [item.quantidade, item.id_produto]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(venda.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: err.message || 'Erro ao criar venda' });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM venda WHERE id_venda = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Venda não encontrada' });
    res.json({ mensagem: 'Venda removida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover venda' });
  }
});

module.exports = router;
