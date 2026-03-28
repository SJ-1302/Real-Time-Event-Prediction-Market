import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Edit, Trash2, Pause, AlertTriangle, X, Save, Check, Plus,
} from 'lucide-react';
import type { ActiveEventAdmin as ActiveEvent } from '@/types/admin';

interface ActiveEventsSectionProps {
  events: ActiveEvent[];
  onEventUpdate?: (eventId: number, updatedData: Partial<ActiveEvent>) => void;
  onEventDelete?: (eventId: number) => void;
}

// ─── All sectors uniform blue (like PendingEventsSection) ────────────────────
const AVAILABLE_SECTORS = [
  'Technology', 'Business', 'Politics', 'Crypto', 'Sports', 'Finance', 'AI/ML',
  'Health', 'Climate', 'Entertainment', 'Science', 'Economics', 'Social Media',
  'Gaming', 'Real Estate', 'Energy', 'Space', 'Education', 'Transportation',
  'Food & Beverage', 'Fashion', 'Automotive', 'Defense', 'Agriculture',
  'Biotechnology', 'Cybersecurity', 'E-commerce', 'Media', 'Manufacturing',
  'Telecommunications', 'Insurance', 'Banking', 'Retail', 'Hospitality',
  'Construction', 'Mining', 'Pharmaceuticals', 'Logistics', 'Aviation',
  'Maritime', 'Legal', 'Consulting', 'Marketing', 'HR & Recruiting',
  'Economy', 'US', 'Japan', 'Environment', 'Movies', 'Apple', 'Tech',
];

const SECTOR_STYLE = { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.2)' };
const getSectorStyle = (_cat: string) => SECTOR_STYLE;


// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d: string) => {
  if (!d) return 'N/A';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return 'N/A'; }
};

const calcTimeLeft = (expirationDate: string, expirationTime = '23:59') => {
  if (!expirationDate) return { label: 'No expiration', color: '#71717a' };
  try {
    const diff = new Date(`${expirationDate}T${expirationTime}`).getTime() - Date.now();
    if (diff < 0) return { label: 'Expired', color: '#f87171' };
    const days  = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    if (days > 30) return { label: `${Math.floor(days / 30)}mo left`, color: '#71717a' };
    if (days > 7)  return { label: `${days}d left`,                   color: '#71717a' };
    if (days > 0)  return { label: `${days}d left`,                   color: '#facc15' };
                   return { label: `${hours}h left`,                  color: '#fb923c' };
  } catch { return { label: 'No expiration', color: '#71717a' }; }
};

const getCategories = (event: ActiveEvent): string[] => {
  if (!event.category) return [];
  return Array.isArray(event.category) ? event.category : [event.category];
};

// ─── Checkbox — fully inline styles so Tailwind purging can't hide it ─────────
const Checkbox: React.FC<{ checked: boolean; indeterminate?: boolean; onChange: () => void }> = ({
  checked, indeterminate, onChange,
}) => (
  <div
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    style={{
      width: 18, height: 18,
      borderRadius: 4,
      border: `2px solid ${checked || indeterminate ? '#3b82f6' : '#52525b'}`,
      backgroundColor: checked || indeterminate ? '#3b82f6' : '#27272a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0,
      transition: 'all 0.15s ease',
    }}
  >
    {checked     && <Check size={11} color="#fff" strokeWidth={3} />}
    {!checked && indeterminate && <div style={{ width: 8, height: 2, backgroundColor: '#fff', borderRadius: 2 }} />}
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, { bg: string; color: string; border: string; dot: string; pulse: boolean }> = {
    active: { bg: 'rgba(34,197,94,0.1)',  color: '#4ade80', border: 'rgba(34,197,94,0.25)',  dot: '#4ade80', pulse: true  },
    paused: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)', dot: '#fbbf24', pulse: false },
    closed: { bg: 'rgba(113,113,122,0.1)',color: '#a1a1aa', border: 'rgba(113,113,122,0.25)',dot: '#71717a', pulse: false },
  };
  const s = styles[status] ?? styles.closed;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 99,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', backgroundColor: s.dot, flexShrink: 0,
        animation: s.pulse ? 'pulse 2s infinite' : 'none',
      }} />
      {status}
    </span>
  );
};

// ─── Shared Modal Overlay ─────────────────────────────────────────────────────
const Overlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.96, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.96, opacity: 0, y: 12 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
      style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 448, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
    >
      {children}
    </motion.div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const ActiveEventsSection: React.FC<ActiveEventsSectionProps> = ({
  events: propEvents, onEventUpdate, onEventDelete,
}) => {
  // Local copy of events so edits/pauses/deletes reflect immediately in the UI
  const [localEvents,   setLocalEvents]   = useState<ActiveEvent[]>(propEvents);
  const [pauseId,       setPauseId]       = useState<number | null>(null);
  const [deleteId,      setDeleteId]      = useState<number | null>(null);
  const [editEvent,     setEditEvent]     = useState<ActiveEvent | null>(null);
  const [editDraft,     setEditDraft]     = useState<Partial<ActiveEvent>>({});
  const [draftCats,     setDraftCats]     = useState<string[]>([]);
  const [showSectorDD,  setShowSectorDD]  = useState(false);
  const [sectorSearch,  setSectorSearch]  = useState('');
  const [selectMode,    setSelectMode]    = useState(false);
  const [selectedIds,   setSelectedIds]   = useState<Set<number>>(new Set());
  const [bulkPauseOpen, setBulkPauseOpen] = useState(false);
  const [bulkDelOpen,   setBulkDelOpen]   = useState(false);

  // Keep local in sync if parent re-passes new events (e.g. initial load)
  React.useEffect(() => { setLocalEvents(propEvents); }, [propEvents]);

  const updateLocal = (id: number, patch: Partial<ActiveEvent>) =>
    setLocalEvents(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  const deleteLocal = (id: number) =>
    setLocalEvents(prev => prev.filter(e => e.id !== id));

  const toggleSelectMode = () => { setSelectMode(v => !v); setSelectedIds(new Set()); };
  const toggleOne = (id: number) => setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => setSelectedIds(selectedIds.size === localEvents.length ? new Set() : new Set(localEvents.map(e => e.id)));
  const allSelected  = selectedIds.size === localEvents.length && localEvents.length > 0;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const confirmBulkPause = () => {
    selectedIds.forEach(id => { updateLocal(id, { status: 'paused' }); onEventUpdate?.(id, { status: 'paused' }); });
    setSelectedIds(new Set()); setSelectMode(false); setBulkPauseOpen(false);
  };
  const confirmBulkDelete = () => {
    selectedIds.forEach(id => { deleteLocal(id); onEventDelete?.(id); });
    setSelectedIds(new Set()); setSelectMode(false); setBulkDelOpen(false);
  };
  const openEdit = (e: ActiveEvent) => {
    setEditEvent(e);
    setEditDraft({ ...e });
    setDraftCats(Array.isArray(e.category) ? [...e.category] : e.category ? [e.category] : []);
    setShowSectorDD(false);
    setSectorSearch('');
  };
  const saveEdit = () => {
    if (!editEvent) return;
    const patch = { ...editDraft, category: draftCats, expirationTime: '23:59' };
    updateLocal(editEvent.id, patch);
    onEventUpdate?.(editEvent.id, patch);
    setEditEvent(null);
    setShowSectorDD(false);
  };
  const confirmPause = (id: number) => {
    updateLocal(id, { status: 'paused' });
    onEventUpdate?.(id, { status: 'paused' });
    setPauseId(null);
  };
  const confirmDelete = (id: number) => {
    deleteLocal(id);
    onEventDelete?.(id);
    setDeleteId(null);
  };

  // ── shared cell/header styles ──────────────────────────────────────────────
  const th = (left = false): React.CSSProperties => ({
    padding: '14px 20px',
    fontSize: 11, fontWeight: 700, color: '#d4d4d8',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    textAlign: left ? 'left' : 'center',
    borderBottom: '1px solid #27272a',
    backgroundColor: 'rgba(39,39,42,0.6)',
    whiteSpace: 'nowrap',
  });
  const td = (center = true): React.CSSProperties => ({
    padding: '10px 20px',
    verticalAlign: 'middle',
    textAlign: center ? 'center' : 'left',
  });

  return (
    <>
      {/* ══ TOOLBAR ════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={toggleSelectMode}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', border: 'none',
              backgroundColor: selectMode ? '#2563eb' : '#27272a',
              color: selectMode ? '#fff' : '#d4d4d8',
              transition: 'all 0.15s',
            }}
          >
            {selectMode ? 'Cancel' : 'Select'}
          </button>

          {selectMode && (
            <button
              onClick={toggleAll}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                backgroundColor: '#27272a', color: '#d4d4d8', cursor: 'pointer', border: 'none',
                transition: 'all 0.15s',
              }}
            >
              <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              Select All ({localEvents.length})
            </button>
          )}
        </div>

        <AnimatePresence>
          {selectMode && selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span style={{ fontSize: 12, color: '#71717a', marginRight: 4 }}>{selectedIds.size} selected</span>
              <button
                onClick={() => setBulkPauseOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', backgroundColor: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)', transition: 'all 0.15s' }}
              >
                <Pause size={13} /> Pause ({selectedIds.size})
              </button>
              <button
                onClick={() => setBulkDelOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', transition: 'all 0.15s' }}
              >
                <Trash2 size={13} /> Delete ({selectedIds.size})
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ TABLE ══════════════════════════════════════════════════════════════ */}
      <div style={{ borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden', backgroundColor: 'rgba(24,24,27,0.6)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 880 }}>
            <colgroup>
              {selectMode && <col style={{ width: 44 }} />}
              <col style={{ width: selectMode ? '31%' : '33%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>

            <thead>
              <tr>
                {selectMode && (
                  <th style={{ ...th(), padding: '14px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                    </div>
                  </th>
                )}
                <th style={th(true)}>Event</th>
                <th style={th()}>Status</th>
                <th style={th()}>Expiration Date</th>
                <th style={th()}>Current Probability</th>
                <th style={th()}>Total Volume</th>
                <th style={th()}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {localEvents.map((event, idx) => {
                const cats       = getCategories(event);
                const tl         = calcTimeLeft(event.expirationDate, event.expirationTime);
                const isSelected = selectedIds.has(event.id);
                const isLast     = idx === localEvents.length - 1;
                const rowBg      = isSelected ? 'rgba(59,130,246,0.06)' : 'transparent';

                return (
                  <tr
                    key={event.id}
                    onClick={selectMode ? () => toggleOne(event.id) : undefined}
                    style={{
                      backgroundColor: rowBg,
                      borderBottom: isLast ? 'none' : '1px solid rgba(39,39,42,0.7)',
                      cursor: selectMode ? 'pointer' : 'default',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(39,39,42,0.3)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = rowBg; }}
                  >
                    {/* Checkbox */}
                    {selectMode && (
                      <td style={{ ...td(), padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <Checkbox checked={isSelected} onChange={() => toggleOne(event.id)} />
                        </div>
                      </td>
                    )}

                    {/* Event + sector tags */}
                    <td style={td(false)}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>
                        {event.question}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {cats.map((cat, i) => {
                          const s = getSectorStyle(cat);
                          return (
                            <span key={i} style={{
                              display: 'inline-flex', alignItems: 'center',
                              padding: '2px 8px', borderRadius: 6,
                              fontSize: 10, fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.06em',
                              backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}`,
                            }}>
                              {cat}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={td()}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <StatusBadge status={event.status ?? 'unknown'} />
                      </div>
                    </td>

                    {/* Expiration */}
                    <td style={td()}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{formatDate(event.expirationDate)}</p>
                      <p style={{ fontSize: 11, fontWeight: 500, color: tl.color, marginTop: 4, lineHeight: 1 }}>{tl.label}</p>
                    </td>

                    {/* Probability */}
                    <td style={td()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <div style={{ width: 64, height: 5, backgroundColor: '#27272a', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{ width: `${event.probability}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#2563eb,#60a5fa)' }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>
                          {event.probability}%
                        </span>
                      </div>
                    </td>

                    {/* Volume */}
                    <td style={td()}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{event.volume}</span>
                    </td>

                    {/* Actions */}
                    <td style={td()}>
                      {!selectMode ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          {[
                            { icon: <Edit size={13} />, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', hbg: 'rgba(59,130,246,0.2)', action: () => openEdit(event),       title: 'Edit'   },
                            { icon: <Pause size={13} />, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', hbg: 'rgba(245,158,11,0.2)', action: () => setPauseId(event.id),  title: 'Pause'  },
                            { icon: <Trash2 size={13} />, color: '#f87171', bg: 'rgba(239,68,68,0.1)',  hbg: 'rgba(239,68,68,0.2)',  action: () => setDeleteId(event.id), title: 'Delete' },
                          ].map(({ icon, color, bg, action, title }) => (
                            <button
                              key={title}
                              onClick={(e) => { e.stopPropagation(); action(); }}
                              title={title}
                              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', backgroundColor: bg, color, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
                              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#52525b' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ EDIT MODAL ═════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editEvent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => { setEditEvent(null); setShowSectorDD(false); }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ padding: 10, backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Edit size={16} color="#60a5fa" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>Edit Event</h3>
                    <p style={{ fontSize: 11, color: '#71717a', margin: '2px 0 0' }}>ID #{editEvent.id}</p>
                  </div>
                </div>
                <button onClick={() => { setEditEvent(null); setShowSectorDD(false); }} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', backgroundColor: 'transparent', color: '#71717a', cursor: 'pointer' }}>
                  <X size={15} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Question */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Question</label>
                  <textarea rows={2} style={{ width: '100%', backgroundColor: 'rgba(39,39,42,0.8)', border: '1px solid #3f3f46', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                    value={editDraft.question ?? ''} onChange={(e) => setEditDraft({ ...editDraft, question: e.target.value })} />
                </div>

                {/* Status (full width) */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Status</label>
                  <select style={{ width: '100%', backgroundColor: 'rgba(39,39,42,0.8)', border: '1px solid #3f3f46', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                    value={editDraft.status ?? 'active'} onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value as any })}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Expiration Date (time always 23:59) */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Expiration Date</label>
                  <input type="date" style={{ width: '100%', backgroundColor: 'rgba(39,39,42,0.8)', border: '1px solid #3f3f46', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    value={editDraft.expirationDate ?? ''} onChange={(e) => setEditDraft({ ...editDraft, expirationDate: e.target.value })} />
                  <p style={{ fontSize: 11, color: '#52525b', marginTop: 5, marginBottom: 0 }}>Time defaults to 23:59</p>
                </div>

                {/* Sectors editor */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Sectors / Categories</label>
                  {/* Current sectors as removable tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {draftCats.map((cat, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                        {cat}
                        <button
                          onClick={() => setDraftCats(draftCats.filter((_, idx) => idx !== i))}
                          style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}

                    {/* Add sector button */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => { setShowSectorDD(v => !v); setSectorSearch(''); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, backgroundColor: '#27272a', color: '#a1a1aa', border: '1px solid #3f3f46', cursor: 'pointer' }}
                      >
                        <Plus size={11} /> Add
                      </button>

                      {/* Dropdown */}
                      {showSectorDD && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ position: 'absolute', top: '110%', left: 0, zIndex: 100, width: 220, backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: 10, boxShadow: '0 12px 32px rgba(0,0,0,0.5)', overflow: 'hidden' }}
                        >
                          {/* Search */}
                          <div style={{ padding: 8, borderBottom: '1px solid #3f3f46' }}>
                            <input
                              autoFocus
                              type="text"
                              placeholder="Search sectors..."
                              value={sectorSearch}
                              onChange={(e) => setSectorSearch(e.target.value)}
                              style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                          {/* List */}
                          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                            {[...new Set(AVAILABLE_SECTORS)]
                              .filter(s => s.toLowerCase().includes(sectorSearch.toLowerCase()))
                              .map(sector => {
                                const already = draftCats.includes(sector);
                                return (
                                  <button
                                    key={sector}
                                    onClick={() => {
                                      if (!already) setDraftCats([...draftCats, sector]);
                                      setShowSectorDD(false);
                                      setSectorSearch('');
                                    }}
                                    disabled={already}
                                    style={{ width: '100%', textAlign: 'left', padding: '7px 12px', fontSize: 12, color: already ? '#52525b' : '#d4d4d8', background: 'none', border: 'none', cursor: already ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                    onMouseEnter={e => { if (!already) (e.currentTarget as HTMLElement).style.backgroundColor = '#3f3f46'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                                  >
                                    {sector}
                                    {already && <Check size={12} color="#4ade80" />}
                                  </button>
                                );
                              })
                            }
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingTop: 20, borderTop: '1px solid #27272a' }}>
                <button onClick={() => { setEditEvent(null); setShowSectorDD(false); }} style={{ flex: 1, padding: '10px 0', backgroundColor: '#27272a', color: '#d4d4d8', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveEdit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <Save size={13} /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ REUSABLE CONFIRM HELPER (inline) ═══════════════════════════════════ */}
      {/* Single Pause */}
      <AnimatePresence>
        {pauseId !== null && (
          <Overlay onClose={() => setPauseId(null)}>
            <ConfirmModal
              icon={<Pause size={16} color="#fbbf24" />} iconBg="rgba(245,158,11,0.1)" iconBorder="rgba(245,158,11,0.2)"
              title="Pause Event?" subtitle="This will suspend all market activity"
              warnings={['Pausing will halt all trading activity until manually resumed.', 'Existing positions and data will be preserved.']}
              warningColor="#fbbf24" warningBg="rgba(245,158,11,0.05)" warningBorder="rgba(245,158,11,0.15)"
              confirmLabel="Yes, Pause Event" confirmColor="#f59e0b"
              onCancel={() => setPauseId(null)} onConfirm={() => confirmPause(pauseId!)}
            />
          </Overlay>
        )}
      </AnimatePresence>

      {/* Single Delete */}
      <AnimatePresence>
        {deleteId !== null && (
          <Overlay onClose={() => setDeleteId(null)}>
            <ConfirmModal
              icon={<Trash2 size={16} color="#f87171" />} iconBg="rgba(239,68,68,0.1)" iconBorder="rgba(239,68,68,0.2)"
              title="Delete Event?" subtitle="This cannot be undone"
              warnings={['All trades and participant positions will be permanently removed.', 'Historical data and analytics for this event will be lost.']}
              warningColor="#f87171" warningBg="rgba(239,68,68,0.05)" warningBorder="rgba(239,68,68,0.2)"
              confirmLabel="Yes, Delete Event" confirmColor="#ef4444"
              onCancel={() => setDeleteId(null)} onConfirm={() => confirmDelete(deleteId!)}
            />
          </Overlay>
        )}
      </AnimatePresence>

      {/* Bulk Pause */}
      <AnimatePresence>
        {bulkPauseOpen && (
          <Overlay onClose={() => setBulkPauseOpen(false)}>
            <ConfirmModal
              icon={<Pause size={16} color="#fbbf24" />} iconBg="rgba(245,158,11,0.1)" iconBorder="rgba(245,158,11,0.2)"
              title={`Pause ${selectedIds.size} Events?`} subtitle="Bulk pause selected markets"
              warnings={[`All ${selectedIds.size} selected events will have trading halted until manually resumed.`, 'Existing positions and data will be preserved.']}
              warningColor="#fbbf24" warningBg="rgba(245,158,11,0.05)" warningBorder="rgba(245,158,11,0.15)"
              confirmLabel="Yes, Pause All" confirmColor="#f59e0b"
              onCancel={() => setBulkPauseOpen(false)} onConfirm={confirmBulkPause}
            />
          </Overlay>
        )}
      </AnimatePresence>

      {/* Bulk Delete */}
      <AnimatePresence>
        {bulkDelOpen && (
          <Overlay onClose={() => setBulkDelOpen(false)}>
            <ConfirmModal
              icon={<Trash2 size={16} color="#f87171" />} iconBg="rgba(239,68,68,0.1)" iconBorder="rgba(239,68,68,0.2)"
              title={`Delete ${selectedIds.size} Events?`} subtitle="This cannot be undone"
              warnings={[`All ${selectedIds.size} events and their trades will be permanently removed.`, 'Historical data and analytics for these events will be lost.']}
              warningColor="#f87171" warningBg="rgba(239,68,68,0.05)" warningBorder="rgba(239,68,68,0.2)"
              confirmLabel="Yes, Delete All" confirmColor="#ef4444"
              onCancel={() => setBulkDelOpen(false)} onConfirm={confirmBulkDelete}
            />
          </Overlay>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Reusable Confirm Modal Body ──────────────────────────────────────────────
const ConfirmModal: React.FC<{
  icon: React.ReactNode; iconBg: string; iconBorder: string;
  title: string; subtitle: string;
  warnings: string[]; warningColor: string; warningBg: string; warningBorder: string;
  confirmLabel: string; confirmColor: string;
  onCancel: () => void; onConfirm: () => void;
}> = ({ icon, iconBg, iconBorder, title, subtitle, warnings, warningColor, warningBg, warningBorder, confirmLabel, confirmColor, onCancel, onConfirm }) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ padding: 10, backgroundColor: iconBg, borderRadius: 12, border: `1px solid ${iconBorder}` }}>{icon}</div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h3>
          <p style={{ fontSize: 11, color: '#71717a', margin: '2px 0 0' }}>{subtitle}</p>
        </div>
      </div>
      <button onClick={onCancel} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', backgroundColor: 'transparent', color: '#71717a', cursor: 'pointer' }}><X size={15} /></button>
    </div>
    <div style={{ padding: 14, backgroundColor: warningBg, border: `1px solid ${warningBorder}`, borderRadius: 12, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {warnings.map((msg, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertTriangle size={13} color={warningColor} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: warningColor, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{msg}</p>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={onCancel} style={{ flex: 1, padding: '10px 0', backgroundColor: '#27272a', color: '#d4d4d8', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
      <button onClick={onConfirm} style={{ flex: 1, padding: '10px 0', backgroundColor: confirmColor, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{confirmLabel}</button>
    </div>
  </>
);