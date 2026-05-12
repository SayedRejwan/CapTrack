// Supervisor dashboard — overview, leaderboard, rubric, printable report
(function() {
const { TEAMS, TASKS, COMMENTS, FILES, MEETINGS,
        CURRENT_WEEK, TOTAL_WEEKS, MIDPOINT_WEEK, PHASES,
        SUPERVISOR, memberContribution, teamMetrics } = window.CAPSTONE;

function SupervisorDashboard({ onLogout, onOpenTeam }) {
  const [tab, setTab] = useState('overview');

  // Realtime sync: re-render when another client pushes an update
  useEffect(() => {
    const unsub = window.CAPSTONE.subscribe(() => setTab(t => t));
    return unsub;
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F4F5F7 0%, #EBECF0 100%)',
      fontFamily: '"Charlie Display", system-ui, -apple-system, sans-serif',
      color: '#172b4d',
    }}>
      <SupTopBar onLogout={onLogout} />
      <SupHeader />

      <div style={{ padding: '0 28px', borderBottom: '1px solid #dfe1e6' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { id: 'overview',    label: 'All teams overview',  icon: 'chart' },
            { id: 'leaderboard', label: 'Contribution leaderboard', icon: 'star' },
            { id: 'rubric',      label: 'Grading rubric',      icon: 'flag' },
            { id: 'report',      label: 'Evaluation report',   icon: 'print' },
          ].map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                color: active ? '#5243AA' : '#5e6c84',
                borderBottom: active ? '2px solid #5243AA' : '2px solid transparent',
                marginBottom: -1,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'inherit',
              }}>
                <Icon name={t.icon} size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '24px 28px 64px' }}>
        {tab === 'overview'    && <OverviewGrid onOpenTeam={onOpenTeam} />}
        {tab === 'leaderboard' && <Leaderboard />}
        {tab === 'rubric'      && <RubricView />}
        {tab === 'report'      && <ReportView />}
      </div>
    </div>
  );
}

function SupTopBar({ onLogout }) {
  return (
    <div style={{
      height: 48, background: '#5243AA',
      display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
      boxShadow: '0 1px 0 rgba(9,30,66,0.13)',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 6, background: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 800, fontSize: 14,
      }}>C</div>
      <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>CapTrack</div>
      <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.3)' }} />
      <div style={{ color: 'white', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="shield" size={14} /> Supervisor Console
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 11,
        }}>AS</div>
        <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{SUPERVISOR.name}</span>
      </div>
      <button onClick={onLogout} style={{
        height: 32, padding: '0 12px',
        background: 'rgba(255,255,255,0.18)', color: 'white',
        border: 'none', borderRadius: 4, cursor: 'pointer',
        fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <Icon name="logout" size={14} /> Sign out
      </button>
    </div>
  );
}

function SupHeader() {
  const allTasks = TEAMS.flatMap(t => TASKS[t.id]);
  const totalDone = allTasks.filter(t => t.status === 'done').length;
  const avgCompletion = Math.round(TEAMS.reduce((s, t) => s + teamMetrics(t).completion, 0) / TEAMS.length);

  return (
    <div style={{ padding: '20px 28px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ fontSize: 11, color: '#5243AA', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            IPE · Capstone 2025–26
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '2px 0 6px', letterSpacing: '-0.02em' }}>
            All teams · Week {CURRENT_WEEK} of {TOTAL_WEEKS}
          </h1>
          <div style={{ fontSize: 13, color: '#5e6c84' }}>
            5 teams · 30 students · {allTasks.length} tasks tracked · {totalDone} completed
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Avg completion', v: avgCompletion + '%', c: '#5243AA' },
            { label: 'Tasks done',     v: totalDone,           c: '#1f845a' },
            { label: 'On track',       v: TEAMS.filter(t => teamMetrics(t).completion >= 50).length + '/5', c: '#1d7afc' },
            { label: 'Behind',         v: TEAMS.filter(t => teamMetrics(t).completion < 50).length + '/5', c: '#C9372C' },
          ].map(s => (
            <div key={s.label} style={{
              minWidth: 100, padding: '10px 14px',
              background: 'white', borderRadius: 8,
              boxShadow: '0 1px 2px rgba(9,30,66,0.1)',
              borderTop: `3px solid ${s.c}`,
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#172b4d', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: '#5e6c84', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <PhaseStrip phases={PHASES} totalWeeks={TOTAL_WEEKS} currentWeek={CURRENT_WEEK} midpoint={MIDPOINT_WEEK} />
      </div>
    </div>
  );
}

// ---------- Overview Grid ----------
function OverviewGrid({ onOpenTeam }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
      {TEAMS.map(team => <TeamOverviewCard key={team.id} team={team} onOpen={() => onOpenTeam(team.id)} />)}
    </div>
  );
}

function TeamOverviewCard({ team, onOpen }) {
  const metrics = teamMetrics(team);
  const onTrack = metrics.completion >= 50;
  const lastFeedback = COMMENTS[team.id][COMMENTS[team.id].length - 1];

  return (
    <div onClick={onOpen} style={{
      background: 'white', borderRadius: 12,
      boxShadow: '0 1px 3px rgba(9,30,66,0.1)',
      cursor: 'pointer',
      overflow: 'hidden',
      borderTop: `4px solid ${team.accent}`,
      transition: 'transform 100ms, box-shadow 120ms',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(9,30,66,0.18)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(9,30,66,0.1)'; }}
    >
      <div style={{ padding: '16px 18px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 4,
            background: team.accent, color: 'white',
            fontSize: 11, fontWeight: 800, letterSpacing: '0.05em',
          }}>TEAM {team.number}</span>
          <span style={{
            padding: '3px 10px', borderRadius: 999,
            background: onTrack ? '#DCFFF1' : '#FFEBE5',
            color: onTrack ? '#216E4E' : '#AE2A19',
            fontSize: 11, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: onTrack ? '#1f845a' : '#C9372C' }} />
            {onTrack ? 'On track' : 'Behind'}
          </span>
        </div>
        <h3 style={{ margin: '4px 0 10px', fontSize: 16, fontWeight: 700, color: '#172b4d', lineHeight: 1.3 }}>
          {team.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <AvatarStack members={team.members} size={26} max={6} />
          <span style={{ fontSize: 12, color: '#5e6c84' }}>
            Lead: <strong style={{ color: '#172b4d' }}>{team.members[0].name.split(' ')[0]}</strong>
          </span>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Completion</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#172b4d' }}>{metrics.completion}%</span>
          </div>
          <ProgressBar value={metrics.completion} color={team.accent} height={8} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
          {[
            { label: 'Done',   v: metrics.done,   c: '#1f845a' },
            { label: 'Doing',  v: metrics.doing,  c: '#1d7afc' },
            { label: 'Review', v: metrics.review, c: '#e2b203' },
            { label: 'To do',  v: metrics.todo,   c: '#8590a2' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '6px 8px', background: '#F4F5F7', borderRadius: 6,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 10, color: '#5e6c84', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#5e6c84', paddingTop: 4 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="file" size={12} /> {FILES[team.id].length} files
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="meeting" size={12} /> {MEETINGS[team.id].length} meetings
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="message" size={12} /> {COMMENTS[team.id].length} feedback
          </span>
        </div>
      </div>
      {lastFeedback && (
        <div style={{
          padding: '10px 18px',
          background: '#FAFBFC',
          borderTop: '1px solid #f0f1f3',
          fontSize: 12, color: '#5e6c84',
          fontStyle: 'italic',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="message" size={12} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            "{lastFeedback.text}"
          </span>
        </div>
      )}
    </div>
  );
}

// ---------- Leaderboard ----------
function Leaderboard() {
  const [teamId, setTeamId] = useState('all');
  const allMembers = TEAMS.flatMap(t => {
    return memberContribution(t).map(c => ({ ...c, team: t }));
  });
  const filtered = teamId === 'all' ? allMembers : allMembers.filter(m => m.team.id === teamId);
  const sorted = filtered.slice().sort((a, b) => b.raw - a.raw);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Individual contribution leaderboard</h3>
        <select value={teamId} onChange={e => setTeamId(e.target.value)} style={{
          padding: '8px 12px', fontSize: 13, fontFamily: 'inherit',
          border: '2px solid #dfe1e6', borderRadius: 6, background: 'white',
        }}>
          <option value="all">All teams</option>
          {TEAMS.map(t => <option key={t.id} value={t.id}>Team {t.number}</option>)}
        </select>
      </div>
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #dfe1e6', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 100px 1fr 100px',
          padding: '10px 16px', background: '#FAFBFC',
          fontSize: 11, fontWeight: 800, color: '#5e6c84', textTransform: 'uppercase', letterSpacing: '0.05em',
          borderBottom: '1px solid #dfe1e6',
        }}>
          <div>Rank</div><div>Member</div><div>Team</div><div>Contribution</div><div>Score</div>
        </div>
        {sorted.map((row, i) => (
          <div key={row.member.id + row.team.id} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 100px 1fr 100px',
            padding: '12px 16px', alignItems: 'center',
            borderBottom: i < sorted.length - 1 ? '1px solid #f0f1f3' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RankBadge rank={i + 1} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar member={row.member} size={32} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#172b4d' }}>{row.member.name}</div>
                <div style={{ fontSize: 11, color: '#5e6c84' }}>{row.member.role} · {row.member.sid}</div>
              </div>
            </div>
            <div>
              <span style={{
                padding: '3px 8px', borderRadius: 4,
                background: row.team.accent, color: 'white',
                fontSize: 11, fontWeight: 700,
              }}>T{row.team.number}</span>
            </div>
            <div style={{ paddingRight: 16 }}>
              <ProgressBar value={row.pct} color={row.team.accent} height={8} />
            </div>
            <div style={{ fontWeight: 800, color: '#172b4d', fontSize: 14 }}>{row.raw} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function RankBadge({ rank }) {
  const colors = rank === 1 ? { bg: '#FFD700', fg: '#7F5F01' } :
                 rank === 2 ? { bg: '#C0C0C0', fg: '#42526e' } :
                 rank === 3 ? { bg: '#CD7F32', fg: 'white' } :
                              { bg: '#dfe1e6', fg: '#5e6c84' };
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: colors.bg, color: colors.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: 13,
    }}>{rank}</div>
  );
}

// ---------- Rubric ----------
const RUBRIC_CRITERIA = [
  { id: 'tech',        label: 'Technical depth',          weight: 25 },
  { id: 'progress',    label: 'On-time progress',         weight: 20 },
  { id: 'documentation', label: 'Documentation quality',  weight: 15 },
  { id: 'teamwork',    label: 'Teamwork & coordination',  weight: 15 },
  { id: 'innovation',  label: 'Innovation & impact',      weight: 15 },
  { id: 'presentation',label: 'Presentation & defense',   weight: 10 },
];
const SEED_SCORES = {
  'team-01': { tech: 8, progress: 7, documentation: 8, teamwork: 8, innovation: 7, presentation: 8 },
  'team-02': { tech: 9, progress: 9, documentation: 8, teamwork: 9, innovation: 8, presentation: 8 },
  'team-03': { tech: 7, progress: 6, documentation: 7, teamwork: 8, innovation: 7, presentation: 7 },
  'team-04': { tech: 8, progress: 7, documentation: 8, teamwork: 7, innovation: 8, presentation: 7 },
  'team-05': { tech: 9, progress: 8, documentation: 7, teamwork: 8, innovation: 9, presentation: 8 },
};
function RubricView() {
  const [teamId, setTeamId] = useState('team-01');
  const [scores, setScores] = useState(() => JSON.parse(JSON.stringify(SEED_SCORES)));
  const team = TEAMS.find(t => t.id === teamId);
  const teamScores = scores[teamId];
  const total = RUBRIC_CRITERIA.reduce((s, c) => s + (teamScores[c.id] / 10) * c.weight, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Grading rubric</h3>
        <div style={{ display: 'flex', gap: 6, background: '#F4F5F7', padding: 4, borderRadius: 8 }}>
          {TEAMS.map(t => (
            <button key={t.id} onClick={() => setTeamId(t.id)} style={{
              padding: '6px 12px',
              background: teamId === t.id ? 'white' : 'transparent',
              color: teamId === t.id ? '#172b4d' : '#5e6c84',
              border: 'none', cursor: 'pointer', borderRadius: 6,
              fontWeight: 700, fontSize: 12, fontFamily: 'inherit',
              boxShadow: teamId === t.id ? '0 1px 2px rgba(9,30,66,0.15)' : 'none',
            }}>T{t.number}</button>
          ))}
        </div>
      </div>

      <div style={{
        background: 'white', borderRadius: 12, padding: 24,
        border: '1px solid #dfe1e6',
        boxShadow: '0 1px 2px rgba(9,30,66,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: '#5243AA', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Team {team.number}
            </div>
            <h2 style={{ margin: '4px 0 6px', fontSize: 20, fontWeight: 800, color: '#172b4d' }}>{team.title}</h2>
            <div style={{ fontSize: 12, color: '#5e6c84' }}>Lead: {team.members[0].name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#5e6c84', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total score</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: team.accent, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {total.toFixed(1)}<span style={{ fontSize: 18, color: '#5e6c84' }}>/100</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {RUBRIC_CRITERIA.map(c => {
            const v = teamScores[c.id];
            return (
              <div key={c.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 1fr 60px',
                gap: 12, alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid #f0f1f3',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#172b4d' }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: '#5e6c84' }}>Weight {c.weight}%</div>
                </div>
                <div style={{ fontSize: 12, color: '#5e6c84', fontWeight: 600 }}>{v}/10</div>
                <input
                  type="range" min="0" max="10" step="1" value={v}
                  onChange={e => setScores(s => ({ ...s, [teamId]: { ...s[teamId], [c.id]: +e.target.value } }))}
                  style={{ accentColor: team.accent }}
                />
                <div style={{ fontWeight: 800, color: '#172b4d', fontSize: 14, textAlign: 'right' }}>
                  {((v / 10) * c.weight).toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, padding: 16, background: '#F4F5F7', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#5e6c84', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Per-member adjustment (multiplier on total)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {team.members.map(m => (
              <div key={m.id} style={{
                background: 'white', padding: 10, borderRadius: 6,
                display: 'flex', alignItems: 'center', gap: 10,
                border: '1px solid #dfe1e6',
              }}>
                <Avatar member={m} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#172b4d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: '#5e6c84' }}>{m.sid}</div>
                </div>
                <select defaultValue="1.0" style={{
                  padding: '4px 6px', fontSize: 11, border: '1px solid #dfe1e6',
                  borderRadius: 4, fontFamily: 'inherit',
                }}>
                  {['0.7','0.8','0.9','1.0','1.05','1.1'].map(v => <option key={v}>{v}×</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Evaluation Report ----------
function ReportView() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Evaluation report — printable</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.print()} style={{
            padding: '8px 14px', fontSize: 13, fontWeight: 700,
            background: '#5243AA', color: 'white',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'inherit',
          }}>
            <Icon name="print" size={14} /> Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="report-doc" style={{
        background: 'white', borderRadius: 8, padding: 40,
        border: '1px solid #dfe1e6',
        maxWidth: 900, margin: '0 auto',
        boxShadow: '0 1px 3px rgba(9,30,66,0.1)',
        fontSize: 13, color: '#172b4d', lineHeight: 1.5,
      }}>
        <div style={{ borderBottom: '3px solid #172b4d', paddingBottom: 14, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#5e6c84', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Islamic University of Technology · IPE Department
          </div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Capstone Progress Evaluation Report
          </h1>
          <div style={{ fontSize: 12, color: '#5e6c84' }}>
            Academic year 2025–26 · Week {CURRENT_WEEK} of {TOTAL_WEEKS} · Issued by {SUPERVISOR.name}
          </div>
        </div>

        <h2 style={reportH2}>Summary</h2>
        <p style={{ margin: '0 0 16px' }}>
          Five capstone teams (30 students total) were tracked across a 28-week timeline.
          As of week {CURRENT_WEEK}, the average task completion rate is{' '}
          <strong>{Math.round(TEAMS.reduce((s, t) => s + teamMetrics(t).completion, 0) / TEAMS.length)}%</strong>.
          Teams 02 and 05 are leading in delivery, while Team 03 is currently behind on the build phase
          and requires intervention.
        </p>

        <h2 style={reportH2}>Team performance</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Team</th>
              <th style={thStyle}>Project</th>
              <th style={thStyle}>Lead</th>
              <th style={thStyle}>Done</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>%</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {TEAMS.map(t => {
              const m = teamMetrics(t);
              const ok = m.completion >= 50;
              return (
                <tr key={t.id}>
                  <td style={tdStyle}><strong>T{t.number}</strong></td>
                  <td style={tdStyle}>{t.title}</td>
                  <td style={tdStyle}>{t.members[0].name}</td>
                  <td style={tdStyle}>{m.done}</td>
                  <td style={tdStyle}>{m.total}</td>
                  <td style={tdStyle}><strong>{m.completion}%</strong></td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: ok ? '#DCFFF1' : '#FFEBE5',
                      color: ok ? '#216E4E' : '#AE2A19',
                    }}>{ok ? 'On track' : 'Behind'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2 style={reportH2}>Per-team breakdown</h2>
        {TEAMS.map(t => {
          const contrib = memberContribution(t);
          const recentFeedback = COMMENTS[t.id].slice(-2);
          return (
            <div key={t.id} style={{ marginBottom: 28, pageBreakInside: 'avoid' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                paddingBottom: 6, borderBottom: `2px solid ${t.accent}`,
              }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 4, background: t.accent, color: 'white',
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.05em',
                }}>TEAM {t.number}</span>
                <strong style={{ fontSize: 14 }}>{t.title}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#5e6c84', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Members &amp; contribution</div>
                  {contrib.sort((a,b) => b.pct - a.pct).map(c => (
                    <div key={c.member.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                      <span>{c.member.name} <span style={{ color: '#5e6c84' }}>({c.member.sid})</span></span>
                      <strong>{c.pct}%</strong>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#5e6c84', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Recent supervisor notes</div>
                  {recentFeedback.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '4px 0', color: '#42526e' }}>
                      <strong>Wk {c.wk}:</strong> {c.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #dfe1e6', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#5e6c84' }}>
          <div>Generated automatically by CapTrack · {new Date().toLocaleDateString()}</div>
          <div>{SUPERVISOR.name}</div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-doc, .report-doc * { visibility: visible; }
          .report-doc { position: absolute; left: 0; top: 0; box-shadow: none; border: none; max-width: 100%; }
        }
      `}</style>
    </div>
  );
}
const reportH2 = { fontSize: 14, fontWeight: 800, color: '#172b4d', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 10px', paddingBottom: 4, borderBottom: '1px solid #dfe1e6' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 12 };
const thStyle = { textAlign: 'left', padding: '8px 10px', background: '#F4F5F7', borderBottom: '2px solid #dfe1e6', fontSize: 11, color: '#5e6c84', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '8px 10px', borderBottom: '1px solid #f0f1f3' };

window.SupervisorDashboard = SupervisorDashboard;
})();
