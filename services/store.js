const { v4: uuidv4 } = require('uuid');

let leads = [
  {
    id: uuidv4(),
    nome: 'João Ferreira',
    empresa: 'MGC Transitários',
    telefone: '+351 912 345 678',
    email: 'joao@mgc.pt',
    servico: 'Inteligência Comercial',
    notas: 'Interesse em expansão para Espanha',
    status: 'nova',
    prioridade: 'A',
    research: 'Transitária com 120 colaboradores, 40M€ faturação.',
    origem: 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    nome: 'Ana Costa',
    empresa: 'Taguspark',
    telefone: '+351 965 432 100',
    email: 'ana.costa@taguspark.pt',
    servico: 'Soluções à Medida',
    notas: 'Quer automatizar onboarding de startups',
    status: 'whatsapp_enviado',
    prioridade: 'B',
    research: 'Parque tecnológico em Oeiras. 200+ empresas.',
    origem: 'meta',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    nome: 'Miguel Santos',
    empresa: 'LDC Group',
    telefone: '+351 934 567 890',
    email: 'm.santos@ldc.pt',
    servico: 'Ambos',
    notas: 'Reunião marcada para a próxima semana',
    status: 'email_enviado',
    prioridade: 'A',
    research: 'Grupo agro-industrial internacional, 100+ países.',
    origem: 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    nome: 'Carla Mendes',
    empresa: 'Salimpa',
    telefone: '+351 914 111 222',
    email: 'carla@salimpa.pt',
    servico: 'Inteligência Comercial',
    notas: '',
    status: 'contactada',
    prioridade: 'C',
    research: '',
    origem: 'meta',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getAll(filters = {}) {
  let result = [...leads];
  if (filters.status) result = result.filter(l => l.status === filters.status);
  if (filters.prioridade) result = result.filter(l => l.prioridade === filters.prioridade);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(l =>
      l.nome.toLowerCase().includes(q) ||
      l.empresa.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q)
    );
  }
  return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getById(id) {
  return leads.find(l => l.id === id) || null;
}

function create(data) {
  const lead = {
    id: uuidv4(),
    nome: data.nome || '',
    empresa: data.empresa || '',
    telefone: data.telefone || '',
    email: data.email || '',
    servico: data.servico || 'Inteligência Comercial',
    notas: data.notas || '',
    status: data.status || 'nova',
    prioridade: data.prioridade || 'B',
    research: data.research || '',
    origem: data.origem || 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  leads.unshift(lead);
  return lead;
}

function update(id, data) {
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return null;
  const allowed = ['nome','empresa','telefone','email','servico','notas','status','prioridade','research'];
  allowed.forEach(k => { if (data[k] !== undefined) leads[idx][k] = data[k]; });
  leads[idx].updated_at = new Date().toISOString();
  return leads[idx];
}

function remove(id) {
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return false;
  leads.splice(idx, 1);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
