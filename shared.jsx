// Shared UI primitives for the Capstone Tracker
(function() {
const { useState, useEffect, useRef, useMemo } = React;

// ---------- Avatar ----------
function Avatar({ member, size = 28, ring }) {
  const s = {
    width: size, height: size,
    borderRadius: '50%',
    background: member.color,
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    fontWeight: 700,
    fontSize: size * 0.4,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    flexShrink: 0,
    boxShadow: ring ? `0 0 0 2px white, 0 0 0 4px ${member.color}` : 'none',
    letterSpacing: '0.02em',
  };
  return (
    <div style={s} title={`${member.name} · ${member.sid}`}>
      {member.initials}
    </div>
  );
}

function AvatarStack({ members, size = 24, max = 5 }) {
  const shown = members.slice(0, max);
  const extra = Math.max(0, members.length - max);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((m, i) => (
        <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -8, position: 'relative', zIndex: shown.length - i }}>
          <Avatar member={m} size={size} ring />
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          marginLeft: -8,
          width: size, height: size,
          borderRadius: '50%',
          background: '#dfe1e6',
          color: '#42526e',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: size * 0.36,
          boxShadow: '0 0 0 2px white',
        }}>+{extra}</div>
      )}
    </div>
  );
}

// ---------- Progress bar ----------
function ProgressBar({ value, color = '#0079BF', height = 8, showLabel = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <div style={{
        flex: 1, height, background: '#dfe1e6', borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${value}%`, height: '100%',
          background: color,
          borderRadius: height,
          transition: 'width 300ms cubic-bezier(.2,.8,.2,1)',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 700, color: '#172b4d', minWidth: 32, textAlign: 'right' }}>
          {value}%
        </span>
      )}
    </div>
  );
}

// ---------- Label / chip ----------
const LABEL_COLORS = {
  research:    { bg: '#FEF7E5', fg: '#7F5F01', border: '#F5CD47' },
  fieldwork:   { bg: '#E3FCEF', fg: '#216E4E', border: '#4BCE97' },
  data:        { bg: '#E9F2FF', fg: '#0055CC', border: '#579DFF' },
  vsm:         { bg: '#FFF7D6', fg: '#7F5F01', border: '#F5CD47' },
  defense:     { bg: '#FFEBE5', fg: '#AE2A19', border: '#F87168' },
  report:      { bg: '#FEDEC8', fg: '#A54800', border: '#FEA362' },
  hardware:    { bg: '#F3F0FF', fg: '#352C63', border: '#9F8FEF' },
  software:    { bg: '#E9F2FF', fg: '#0055CC', border: '#579DFF' },
  procurement: { bg: '#DCDFE4', fg: '#44546F', border: '#8590A2' },
  testing:     { bg: '#FFEBE5', fg: '#AE2A19', border: '#F87168' },
  analysis:    { bg: '#E3FCEF', fg: '#216E4E', border: '#4BCE97' },
  simulation:  { bg: '#F3F0FF', fg: '#352C63', border: '#9F8FEF' },
  plan:        { bg: '#FFF7D6', fg: '#7F5F01', border: '#F5CD47' },
  deliverable: { bg: '#FEDEC8', fg: '#A54800', border: '#FEA362' },
  design:      { bg: '#F3F0FF', fg: '#352C63', border: '#9F8FEF' },
  build:       { bg: '#FEDEC8', fg: '#A54800', border: '#FEA362' },
  model:       { bg: '#E9F2FF', fg: '#0055CC', border: '#579DFF' },
  ml:          { bg: '#F3F0FF', fg: '#352C63', border: '#9F8FEF' },
};
function Label({ name, small }) {
  const c = LABEL_COLORS[name] || { bg: '#dfe1e6', fg: '#42526e', border: '#c1c7d0' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: small ? '2px 8px' : '3px 10px',
      borderRadius: 999,
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      background: c.bg, color: c.fg,
      border: `1px solid ${c.border}`,
    }}>{name}</span>
  );
}

// ---------- Icons (inline SVG, Trello-ish line style) ----------
function Icon({ name, size = 16, color = 'currentColor' }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'comment':    return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case 'paperclip':  return <svg {...props}><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>;
    case 'check':      return <svg {...props}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'clock':      return <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case 'file':       return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'users':      return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case 'plus':       return <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'search':     return <svg {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'logout':     return <svg {...props}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
    case 'shield':     return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case 'chart':      return <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case 'star':       return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case 'download':   return <svg {...props}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    case 'message':    return <svg {...props}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>;
    case 'meeting':    return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'arrow-left':  return <svg {...props}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
    case 'arrow-right': return <svg {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case 'eye':         return <svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'print':       return <svg {...props}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
    case 'flag':        return <svg {...props}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
    case 'lock':        return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
    case 'folder':      return <svg {...props}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>;
    case 'edit':        return <svg {...props}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'save':        return <svg {...props}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
    case 'x':           return <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    default: return null;
  }
}

// ---------- Modal ----------
function Modal({ open, onClose, children, width = 720 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.54)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 1000, padding: '64px 16px',
      animation: 'fadeIn 140ms ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: width,
        background: '#f4f5f7',
        borderRadius: 12,
        boxShadow: '0 8px 16px -4px rgba(9,30,66,0.25), 0 0 0 1px rgba(9,30,66,0.08)',
        animation: 'popIn 180ms cubic-bezier(.2,.8,.2,1)',
      }}>
        {children}
      </div>
    </div>
  );
}

// ---------- Status pill ----------
const STATUS_STYLES = {
  todo:   { bg: '#dfe1e6', fg: '#42526e', dot: '#8590a2' },
  doing:  { bg: '#cce0ff', fg: '#0055cc', dot: '#1d7afc' },
  review: { bg: '#fdf4d3', fg: '#7f5f01', dot: '#e2b203' },
  done:   { bg: '#dcfff1', fg: '#216e4e', dot: '#1f845a' },
};
function StatusPill({ status, small }) {
  const s = STATUS_STYLES[status];
  const labels = { todo: 'To do', doing: 'Doing', review: 'Review', done: 'Done' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: small ? '3px 8px' : '4px 10px',
      borderRadius: 999, fontSize: small ? 11 : 12, fontWeight: 700,
      background: s.bg, color: s.fg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {labels[status]}
    </span>
  );
}

// ---------- Phase strip ----------
function PhaseStrip({ phases, totalWeeks, currentWeek, midpoint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', height: 28, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 0 rgba(9,30,66,0.13)' }}>
      {phases.map((p, i) => {
        const span = p.weeks[1] - p.weeks[0] + 1;
        const isCurrent = currentWeek >= p.weeks[0] && currentWeek <= p.weeks[1];
        const isPast = currentWeek > p.weeks[1];
        const isSem2 = p.weeks[0] > midpoint;
        const colors = isPast
          ? { bg: '#1f845a', fg: 'white' }
          : isCurrent
          ? { bg: isSem2 ? '#5d3fd3' : '#0079BF', fg: 'white' }
          : { bg: '#dfe1e6', fg: '#42526e' };
        return (
          <div key={i} style={{
            flex: span, padding: '4px 10px',
            background: colors.bg, color: colors.fg,
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderRight: i < phases.length - 1 ? '1px solid rgba(255,255,255,0.4)' : 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
            <span style={{ opacity: 0.85, fontSize: 10, marginLeft: 8 }}>W{p.weeks[0]}–{p.weeks[1]}</span>
          </div>
        );
      })}
    </div>
  );
}

// Expose
Object.assign(window, {
  Avatar, AvatarStack, ProgressBar, Label, Icon, Modal, StatusPill, PhaseStrip,
});
})();
