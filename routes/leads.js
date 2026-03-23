const express = require('express');
const router = express.Router();
const store = require('../services/store');

router.get('/', (req, res) => {
  res.json(store.getAll(req.query));
});

router.get('/:id', (req, res) => {
  const lead = store.getById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Não encontrada' });
  res.json(lead);
});

router.post('/', (req, res) => {
  const lead = store.create(req.body);
  res.status(201).json(lead);
});

router.patch('/:id', (req, res) => {
  const lead = store.update(req.params.id, req.body);
  if (!lead) return res.status(404).json({ error: 'Não encontrada' });
  res.json(lead);
});

router.delete('/:id', (req, res) => {
  const ok = store.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Não encontrada' });
  res.json({ deleted: req.params.id });
});

module.exports = router;
