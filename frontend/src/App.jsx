import React, { useState, useEffect, useCallback } from 'react'
import { api } from './services/api'

const STATUSES = [
  { id: 'nova',             label: 'Nova',             dot: '#3b82f6', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'whatsapp_enviado', label: 'WhatsApp enviado', dot: '#10b981', color: '#10b981', bg: '#f0fdf4' },
  { id: 'email_enviado',    label: 'Email enviado',    dot: '#8b5cf6', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'contactada',       label: 'Contactada',       dot: '#f59e0b', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'perdida',          label: 'Perdida',          dot: '#ef4444', color: '#ef4444', bg: '#fef2f2' },
]

const PRIORITIES = {
  A: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  B: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  C: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
}

const SERVICES = ['Inteligência Comercial', 'Soluções à Medida', 'Ambos']

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
}

function PBadge({ p }) {
  const c = PRIORITIES[p] || PRIORITIES.C
  return <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:22, height:22, borderRadius:6, background:c.bg, border:`1px solid ${c.border}`, color:c.color, fontSize:11, fontWeight:600, fontFamily:"'DM Mono',monospace", flexShrink:0 }}>{p}</span>
}

function SBadge({ status }) {
  const s = STATUSES.find(x => x.id === status) || STATUSES[0]
  return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:20, background:s.bg, color:s.color, fontSize:11, fontWeight:500 }}><span style={{ width:6, height:6, borderRadius:'50%', background:s.dot, flexShrink:0 }}/>{s.label}</span>
}

function Modal({ lead, onClose, onSave, onDelete }) {
  const isNew = !lead?.id
  const [form, setForm] = useState(lead || { nome:'', empresa:'', telefone:'', email:'', servico:SERVICES[0], notas:'', status:'nova', prioridade:'B', research:'' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.nome.trim()) return setError('Nome é obrigatório')
    try { setSaving(true); setError(null); await onSave(form) }
    catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Eliminar lead de ${lead.nome}?`)) return
    await onDelete(lead.id)
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="modal-title">{isNew ? 'Nova lead' : form.nome}</div>
            {!isNew && <div className="modal-sub">{form.empresa}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><IcoX/></button>
        </div>
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}
          <div className="form-grid">
            <div className="fg"><label>Nome</label><input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome completo"/></div>
            <div className="fg"><label>Empresa</label><input value={form.empresa} onChange={e => set('empresa', e.target.value)} placeholder="Nome da empresa"/></div>
            <div className="fg"><label>Telefone</label><input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="+351 9XX XXX XXX"/></div>
            <div className="fg"><label>Email</label><input value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@empresa.pt" type="email"/></div>
            <div className="fg"><label>Serviço</label>
              <select value={form.servico} onChange={e => set('servico', e.target.value)}>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="fg"><label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="fg"><label>Prioridade</label>
            <div className="ptoggle">
              {Object.entries(PRIORITIES).map(([p, c]) => (
                <button key={p} className="pbtn" style={form.prioridade === p ? { background:c.bg, borderColor:c.border, color:c.color, fontWeight:600 } : {}} onClick={() => set('prioridade', p)}>{p}</button>
              ))}
            </div>
          </div>
          <div className="fg"><label>Notas</label><textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={3} placeholder="Notas sobre a lead..."/></div>
          <div className="fg"><label>Research <span className="hint">— Perplexity (Fase 2)</span></label><textarea value={form.research} onChange={e => set('research', e.target.value)} rows={3} placeholder="Pesquisa automática em breve..."/></div>
        </div>
        <div className="modal-foot">
          {!isNew && <button className="btn-danger" onClick={handleDelete}>Eliminar</button>}
          <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
            <button className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'A guardar...' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('pipeline')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (filterStatus) params.status = filterStatus
      if (filterPriority) params.prioridade = filterPriority
      if (search) params.search = search
      setLeads(await api.getLeads(params))
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [filterStatus, filterPriority, search])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load])

  const handleSave = async (form) => {
    if (form.id) {
      const updated = await api.updateLead(form.id, form)
      setLeads(ls => ls.map(l => l.id === updated.id ? updated : l))
    } else {
      const created = await api.createLead(form)
      setLeads(ls => [created, ...ls])
    }
    setSelected(null); setShowNew(false)
  }

  const handleDelete = async (id) => {
    await api.deleteLead(id)
    setLeads(ls => ls.filter(l => l.id !== id))
    setSelected(null)
  }

  const handleWA = (lead) => {
    const phone = lead.telefone.replace(/\D/g, '')
    const msg = encodeURIComponent(`Olá ${lead.nome},\n\nO meu nome é Gonçalo, da ProEX Consulting.\n\nGostaria de perceber melhor o contexto da ${lead.empresa} e explorar se faz sentido trabalharmos juntos.\n\nTem 15 minutos esta semana?`)
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    if (lead.status === 'nova') {
      api.updateLead(lead.id, { status: 'whatsapp_enviado' })
      setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, status: 'whatsapp_enviado' } : l))
    }
  }

  const statA = leads.filter(l => l.prioridade === 'A').length

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">PX</div>
          <div><div className="brand-name">ProEX</div><div className="brand-sub">Leads CRM</div></div>
        </div>
        <nav className="nav">
          <button className={`nav-btn ${view==='pipeline'?'active':''}`} onClick={() => setView('pipeline')}><IcoPipeline/> Pipeline</button>
          <button className={`nav-btn ${view==='list'?'active':''}`} onClick={() => setView('list')}><IcoList/> Lista</button>
        </nav>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-num">{leads.length}</div><div className="stat-label">Total leads</div></div>
          <div className="stat-card"><div className="stat-num" style={{ color:'#16a34a' }}>{statA}</div><div className="stat-label">Prioridade A</div></div>
        </div>
        <div className="pipeline-stats">
          {STATUSES.map(s => (
            <div key={s.id} className="ps-row">
              <span className="ps-dot" style={{ background:s.dot }}/>
              <span className="ps-label">{s.label}</span>
              <span className="ps-count">{leads.filter(l => l.status === s.id).length}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-l">
            <div className="search-wrap">
              <IcoSearch className="search-icon"/>
              <input className="search" placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <select className="fsel" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select className="fsel" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">Todas prioridades</option>
              <option value="A">Prioridade A</option>
              <option value="B">Prioridade B</option>
              <option value="C">Prioridade C</option>
            </select>
          </div>
          <div className="topbar-r">
            <button className="btn-primary" onClick={() => setShowNew(true)}><IcoPlus/> Nova lead</button>
          </div>
        </div>

        {loading && leads.length === 0
          ? <div className="loading">A carregar...</div>
          : view === 'pipeline'
            ? <PipelineView leads={leads} onSelect={setSelected} onWA={handleWA}/>
            : <ListView leads={leads} onSelect={setSelected} onWA={handleWA}/>
        }
      </main>

      {(selected || showNew) && (
        <Modal lead={selected} onClose={() => { setSelected(null); setShowNew(false) }} onSave={handleSave} onDelete={handleDelete}/>
      )}
    </div>
  )
}

function PipelineView({ leads, onSelect, onWA }) {
  return (
    <div className="pipeline-view">
      {STATUSES.map(col => {
        const cards = leads.filter(l => l.status === col.id)
        return (
          <div key={col.id} className="p-col">
            <div className="col-head">
              <div className="col-title"><span className="col-dot" style={{ background:col.dot }}/>{col.label}</div>
              <span className="col-count">{cards.length}</span>
            </div>
            <div className="col-cards">
              {cards.map(l => <LeadCard key={l.id} lead={l} onSelect={onSelect} onWA={onWA}/>)}
              {cards.length === 0 && <div className="empty-col">Sem leads</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ListView({ leads, onSelect, onWA }) {
  return (
    <div className="list-view">
      <table>
        <thead><tr><th>Nome</th><th>Empresa</th><th>Serviço</th><th>Status</th><th>Pri.</th><th>Data</th><th></th></tr></thead>
        <tbody>
          {leads.length === 0 && <tr><td colSpan="7" style={{ textAlign:'center', color:'var(--text3)', padding:40 }}>Sem leads</td></tr>}
          {leads.map(l => (
            <tr key={l.id} onClick={() => onSelect(l)}>
              <td><div style={{ display:'flex', alignItems:'center', gap:9 }}><div className="tav">{l.nome.charAt(0)}</div><div><div className="t-name">{l.nome}</div><div className="t-email">{l.email}</div></div></div></td>
              <td className="t-co">{l.empresa}</td>
              <td className="t-svc">{l.servico}</td>
              <td><SBadge status={l.status}/></td>
              <td><PBadge p={l.prioridade}/></td>
              <td className="t-date">{fmtDate(l.created_at)}</td>
              <td><button className="act-btn" onClick={e => { e.stopPropagation(); onWA(l) }} title="WhatsApp"><IcoWA/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LeadCard({ lead, onSelect, onWA }) {
  return (
    <div className="lead-card" onClick={() => onSelect(lead)}>
      <div className="card-top">
        <div className="card-av">{lead.nome.charAt(0)}</div>
        <div className="card-info"><div className="card-name">{lead.nome}</div><div className="card-co">{lead.empresa}</div></div>
        <PBadge p={lead.prioridade}/>
      </div>
      <div className="card-svc">{lead.servico}</div>
      {lead.notas && <div className="card-notes">{lead.notas}</div>}
      {lead.origem === 'meta' && <span className="origin-badge">Meta</span>}
      <div className="card-foot">
        <span className="card-date">{fmtDate(lead.created_at)}</span>
        <button className="act-btn" onClick={e => { e.stopPropagation(); onWA(lead) }} title="WhatsApp"><IcoWA/></button>
      </div>
    </div>
  )
}

const IcoPipeline = () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="1" width="5" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
const IcoList = () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 3h13M1 7.5h13M1 12h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IcoSearch = ({ className }) => <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/><path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const IcoPlus = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
const IcoX = () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 3l9 9M12 3L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
const IcoWA = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.062.527 4.002 1.452 5.695L.014 23.5l5.97-1.411A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.527-5.382-1.448l-.385-.228-3.99.943.958-3.894-.248-.402A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
