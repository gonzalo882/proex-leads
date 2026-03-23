const express = require('express');
const cors = require('cors');
const leadsRouter = require('./routes/leads');

const app = express();

app.use(cors({
  origin: [
    'https://proex-leads.vercel.app',
    'https://proex-leads-84vtf1u57-gonzalo882s-projects.vercel.app',
    /\.vercel\.app$/
  ]
}));
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
