const express = require('express');
const cors = require('cors');
const leadsRouter = require('./routes/leads');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use('/api/leads', leadsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(3001, () => console.log('ProEX Leads backend :3001'));
