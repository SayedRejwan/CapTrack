// Login screen — CapTrack V2.0 (Supabase Auth)
(function() {
function LoginScreen({ onLogin }) {
  const { TEAMS, SUPERVISOR } = window.CAPSTONE;
  const [mode, setMode] = useState('team'); // team | supervisor
  const [teamId, setTeamId] = useState('team-01');
  const [password, setPassword] = useState('');
  const [supPassword, setSupPassword] = useState('');
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const team = TEAMS.find(t => t.id === teamId);

  function teamEmail(tid) {
    return tid.replace('team-', 'team') + '@captrack.local';
  }

  async function tryTeamLogin(e) {
    e.preventDefault();
    const sec = window.CAPTRACK_SECURITY;
    const rateCheck = sec.checkLoginRate('team');
    if (!rateCheck.ok) { setErr(rateCheck.error); setShake(true); setTimeout(() => setShake(false), 400); return; }
    setErr(''); setLoading(true);
    try {
      const { data, error } = await window.CAPSTONE.supabaseSignIn(teamEmail(teamId), password.trim());
      if (error) throw error;
      const metaTeamId = data?.user?.user_metadata?.team_id;
      if (metaTeamId && metaTeamId !== teamId) {
        throw new Error('Team mismatch. Please contact your supervisor.');
      }
      sec.recordLoginAttempt('team', true);
      onLogin({ kind: 'team', teamId });
    } catch (e) {
      sec.recordLoginAttempt('team', false);
      setErr(e.message || 'Wrong password.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  }

  async function trySupLogin(e) {
    e.preventDefault();
    const sec = window.CAPTRACK_SECURITY;
    const rateCheck = sec.checkLoginRate('sup');
    if (!rateCheck.ok) { setErr(rateCheck.error); setShake(true); setTimeout(() => setShake(false), 400); return; }
    setErr(''); setLoading(true);
    try {
      const { data, error } = await window.CAPSTONE.supabaseSignIn('supervisor@captrack.local', supPassword.trim());
      if (error) throw error;
      const role = data?.user?.user_metadata?.role;
      if (role !== 'supervisor') {
        throw new Error('Not a supervisor account.');
      }
      sec.recordLoginAttempt('sup', true);
      onLogin({ kind: 'supervisor' });
    } catch (e) {
      sec.recordLoginAttempt('sup', false);
      setErr(e.message || 'Wrong password.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0079BF 0%, #026AA7 60%, #055A8C 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Charlie Display", system-ui, -apple-system, "Segoe UI", sans-serif',
      padding: 24,
    }}>
      {/* Decorative cards in background */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[
          { x: '8%',  y: '12%', r: -8,  c: '#FFAB00', w: 180 },
          { x: '78%', y: '18%', r: 12,  c: '#36B37E', w: 160 },
          { x: '12%', y: '70%', r: 10,  c: '#FF5630', w: 200 },
          { x: '82%', y: '72%', r: -14, c: '#5243AA', w: 170 },
          { x: '45%', y: '8%',  r: 4,   c: '#FFFFFF', w: 140, op: 0.18 },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: s.x, top: s.y,
            width: s.w, height: s.w * 0.6,
            background: s.c, opacity: s.op ?? 0.22,
            borderRadius: 12, transform: `rotate(${s.r}deg)`,
            boxShadow: '0 6px 16px rgba(9,30,66,0.18)',
          }} />
        ))}
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 980,
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 0,
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(9,30,66,0.35)',
        animation: shake ? 'shake 320ms' : 'popIn 320ms cubic-bezier(.2,.8,.2,1)',
      }}>
        {/* Left — branding */}
        <div style={{
          padding: '40px 44px',
          background: 'linear-gradient(160deg, #F4F5F7 0%, #EBECF0 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          minHeight: 540,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: '#0079BF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: 18,
                boxShadow: '0 2px 4px rgba(9,30,66,0.25)',
              }}>C</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#172b4d', letterSpacing: '-0.01em' }}>CapTrack</div>
                <div style={{ fontSize: 11, color: '#5e6c84', marginTop: 1 }}>IUT · IPE Capstone</div>
              </div>
            </div>
            <h1 style={{
              fontSize: 34, lineHeight: 1.1, color: '#172b4d',
              fontWeight: 800, margin: '20px 0 16px',
              letterSpacing: '-0.02em',
            }}>
              Where capstone teams<br />
              <span style={{ color: '#0079BF' }}>ship together.</span>
            </h1>
            <p style={{ color: '#42526e', fontSize: 14, lineHeight: 1.55, maxWidth: 380 }}>
              Track tasks, deliverables, files, and supervisor feedback across the full 28-week journey — from lit review to final defense.
            </p>

            <div style={{ marginTop: 32, display: 'grid', gap: 14 }}>
              {[
                { ic: 'check',   t: '5 teams · 30 students · 1 dashboard' },
                { ic: 'clock',   t: '28-week timeline · 2 semesters' },
                { ic: 'shield',  t: 'Each team sees only its own board' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: '#E9F2FF', color: '#0055cc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={f.ic} size={15} />
                  </div>
                  <div style={{ fontSize: 13, color: '#172b4d', fontWeight: 500 }}>{f.t}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#5e6c84', marginTop: 24 }}>
            Industrial & Production Engineering · Islamic University of Technology
          </div>
        </div>

        {/* Right — login form */}
        <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: '#F4F5F7', borderRadius: 8, marginBottom: 28 }}>
            {[
              { id: 'team', label: 'Team Login', icon: 'users' },
              { id: 'supervisor', label: 'Supervisor', icon: 'shield' },
            ].map(t => (
              <button key={t.id} onClick={() => { setMode(t.id); setErr(''); }}
                style={{
                  flex: 1, padding: '9px 12px',
                  border: 'none', cursor: 'pointer',
                  background: mode === t.id ? 'white' : 'transparent',
                  color: mode === t.id ? '#172b4d' : '#5e6c84',
                  fontWeight: 600, fontSize: 13,
                  borderRadius: 6,
                  boxShadow: mode === t.id ? '0 1px 2px rgba(9,30,66,0.15)' : 'none',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontFamily: 'inherit',
                }}>
                <Icon name={t.icon} size={14} /> {t.label}
              </button>
            ))}
          </div>

          {mode === 'team' ? (
            <form onSubmit={tryTeamLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 22, color: '#172b4d', fontWeight: 700, margin: 0 }}>Sign in to your team board</h2>
              <Field label="Select your team">
                <select value={teamId} onChange={(e) => { setTeamId(e.target.value); setErr(''); }} style={selectStyle}>
                  {TEAMS.map(t => (
                    <option key={t.id} value={t.id}>Team {t.number} — {t.title}</option>
                  ))}
                </select>
              </Field>
              <div style={{
                padding: 12, background: '#F4F5F7', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <AvatarStack members={team.members} size={26} max={6} />
                <div style={{ fontSize: 12, color: '#5e6c84' }}>
                  <div style={{ fontWeight: 700, color: '#172b4d' }}>{team.members.length} members</div>
                  <div>Lead: {team.members[0].name}</div>
                </div>
              </div>
              <Field label="Team password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErr(''); }}
                  placeholder="Shared team password"
                  style={inputStyle}
                  autoFocus
                />
              </Field>
              {err && <div style={errStyle}>{err}</div>}
              <button type="submit" disabled={loading} style={primaryBtn}>
                {loading ? 'Signing in…' : (
                  <>
                    Open Team Board
                    <Icon name="arrow-right" size={16} />
                  </>
                )}
              </button>
              <div style={{ fontSize: 11, color: '#5e6c84', textAlign: 'center', marginTop: -4 }}>
                Contact your supervisor if you need the team password.
              </div>
            </form>
          ) : (
            <form onSubmit={trySupLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 22, color: '#172b4d', fontWeight: 700, margin: 0 }}>Supervisor access</h2>
              <div style={{
                padding: 14, background: '#F4F5F7', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#5243AA', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800,
                }}>AS</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#172b4d', fontSize: 14 }}>{SUPERVISOR.name}</div>
                  <div style={{ fontSize: 12, color: '#5e6c84' }}>Full access · all 5 teams</div>
                </div>
              </div>
              <Field label="Supervisor password">
                <input
                  type="password"
                  value={supPassword}
                  onChange={(e) => { setSupPassword(e.target.value); setErr(''); }}
                  placeholder="supervisor"
                  style={inputStyle}
                  autoFocus
                />
              </Field>
              {err && <div style={errStyle}>{err}</div>}
              <button type="submit" disabled={loading} style={{ ...primaryBtn, background: '#5243AA' }}>
                {loading ? 'Signing in…' : (
                  <>
                    Open Supervisor Dashboard
                    <Icon name="arrow-right" size={16} />
                  </>
                )}
              </button>
              <div style={{ fontSize: 11, color: '#5e6c84', textAlign: 'center', marginTop: -4 }}>
                Contact the department for supervisor credentials.
              </div>
            </form>
          )}

          <div style={{ marginTop: 'auto', paddingTop: 24, fontSize: 11, color: '#8993a4', textAlign: 'center' }}>
            CapTrack V2.0 · End-to-end encrypted · Real-time sync via Supabase
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  padding: '10px 12px', fontSize: 14,
  border: '2px solid #dfe1e6', borderRadius: 6,
  background: '#fafbfc', color: '#172b4d',
  fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 120ms, background 120ms',
};
const selectStyle = { ...inputStyle, cursor: 'pointer' };
const primaryBtn = {
  padding: '12px 16px', fontSize: 14, fontWeight: 700,
  background: '#0079BF', color: 'white',
  border: 'none', borderRadius: 6, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  fontFamily: 'inherit',
  boxShadow: '0 1px 2px rgba(9,30,66,0.25)',
  transition: 'transform 100ms, box-shadow 100ms',
  opacity: 1,
};
const errStyle = {
  padding: '8px 12px', background: '#FFEBE5', color: '#AE2A19',
  borderRadius: 6, fontSize: 12, fontWeight: 600,
  border: '1px solid #FFD2CC',
};
const codeStyle = {
  background: '#F4F5F7', padding: '1px 6px', borderRadius: 3,
  fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 11,
  color: '#172b4d',
};

window.LoginScreen = LoginScreen;
})();
