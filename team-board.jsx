// Team board: Kanban + Week view, files, comments, meetings, members panel
(function() {
const { TASKS, FILES, COMMENTS, MEETINGS, TEAMS, STATUS, STATUS_LABEL,
        CURRENT_WEEK, TOTAL_WEEKS, MIDPOINT_WEEK, PHASES,
        memberContribution, teamMetrics } = window.CAPSTONE;

function TeamBoard({ team, layout, onLogout, isSupervisorView, onBackToOverview }) {
  const [tab, setTab] = useState('board');
  const [openTask, setOpenTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [, force] = useState(0);
  const refresh = () => force(n => n + 1);

  // Realtime sync: re-render when another client pushes an update
  useEffect(() => {
    const unsub = window.CAPSTONE.subscribe(refresh);
    return unsub;
  }, []);

  const tasks = TASKS[team.id];
  const files = FILES[team.id];
  const comments = COMMENTS[team.id];
  const meetings = MEETINGS[team.id];
  const metrics = teamMetrics(team);
  const contrib = memberContribution(team);

  function addTask(partial) {
    const list = TASKS[team.id];
    list.push({
      id: `${team.id}-t${Date.now()}`,
      title: partial.title,
      status: partial.status || 'todo',
      assigneeIdx: partial.assigneeIdx ?? 0,
      week: partial.week ?? CURRENT_WEEK,
      labels: partial.labels || [],
      commentCount: 0, attachmentCount: 0,
    });
    window.CAPSTONE.save(); refresh();
  }
  function updateTask(id, updates) {
    const list = TASKS[team.id];
    const i = list.findIndex(t => t.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...updates }; window.CAPSTONE.save(); refresh(); }
  }
  function deleteTask(id) {
    TASKS[team.id] = TASKS[team.id].filter(t => t.id !== id);
    window.CAPSTONE.save(); refresh(); setOpenTask(null);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F4F5F7 0%, #EBECF0 100%)',
      fontFamily: '"Charlie Display", system-ui, -apple-system, sans-serif',
      color: '#172b4d',
    }}>
      <TopBar team={team} onLogout={onLogout} isSupervisorView={isSupervisorView} onBackToOverview={onBackToOverview} />
      <ProjectHeader team={team} metrics={metrics} canEdit={isSupervisorView} onEdit={() => setEditing(true)} />
      <Tabs tab={tab} setTab={setTab} counts={{
        board: tasks.length, files: files.length, feedback: comments.length, meetings: meetings.length, members: team.members.length,
      }} />
      <div style={{ padding: '0 28px 48px' }}>
        {tab === 'board' && (
          layout === 'kanban'
            ? <KanbanBoard team={team} tasks={tasks} onOpenTask={setOpenTask} onAddTask={addTask} />
            : <WeekBoard team={team} tasks={tasks} onOpenTask={setOpenTask} onAddTask={addTask} />
        )}
        {tab === 'files' && <FilesView team={team} files={files} refresh={refresh} />}
        {tab === 'feedback' && <FeedbackView team={team} comments={comments} canEdit={isSupervisorView} refresh={refresh} />}
        {tab === 'meetings' && <MeetingsView team={team} meetings={meetings} refresh={refresh} />}
        {tab === 'members' && <MembersView team={team} contrib={contrib} tasks={tasks} showContribution={isSupervisorView} />}
      </div>
      <Modal open={!!openTask} onClose={() => setOpenTask(null)} width={620}>
        {openTask && <TaskDetail task={openTask} team={team} onClose={() => setOpenTask(null)} onUpdate={(u) => { updateTask(openTask.id, u); setOpenTask({ ...openTask, ...u }); }} onDelete={() => deleteTask(openTask.id)} />}
      </Modal>
      <Modal open={editing} onClose={() => setEditing(false)} width={680}>
        {editing && <EditTeamForm team={team} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); refresh(); }} />}
      </Modal>
    </div>
  );
}

// ---------- Top bar ----------
function TopBar({ team, onLogout, isSupervisorView, onBackToOverview }) {
  return (
    <div style={{
      height: 48,
      background: team.accent,
      display: 'flex', alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      boxShadow: '0 1px 0 rgba(9,30,66,0.13)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isSupervisorView && (
          <button onClick={onBackToOverview} style={topBtnStyle} title="Back to overview">
            <Icon name="arrow-left" size={16} /> Overview
          </button>
        )}
        <div style={{
          width: 30, height: 30, borderRadius: 6,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: 14,
        }}>C</div>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>CapTrack</div>
      </div>
      <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.3)' }} />
      <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>
        Team {team.number}
      </div>
      <div style={{ flex: 1 }} />
      {isSupervisorView && (
        <div style={{
          padding: '4px 10px', borderRadius: 4,
          background: 'rgba(255,255,255,0.18)',
          color: 'white', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.05em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="eye" size={12} /> Supervisor view
        </div>
      )}
      <button onClick={onLogout} style={topBtnStyle}>
        <Icon name="logout" size={14} /> Sign out
      </button>
    </div>
  );
}
const topBtnStyle = {
  height: 32, padding: '0 12px',
  background: 'rgba(255,255,255,0.18)', color: 'white',
  border: 'none', borderRadius: 4, cursor: 'pointer',
  fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', gap: 6,
};

// ---------- Project header ----------
function ProjectHeader({ team, metrics, canEdit, onEdit }) {
  return (
    <div style={{ padding: '20px 28px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              padding: '3px 10px', borderRadius: 4,
              background: team.accent, color: 'white',
              fontSize: 11, fontWeight: 800, letterSpacing: '0.05em',
            }}>TEAM {team.number}</span>
            <span style={{ fontSize: 12, color: '#5e6c84', fontWeight: 600 }}>
              Week {CURRENT_WEEK} of {TOTAL_WEEKS} · Semester 2
            </span>
            {canEdit && (
              <button onClick={onEdit} style={{
                marginLeft: 4, padding: '4px 10px',
                background: '#F4F5F7', color: '#5243AA',
                border: '1px solid #dfe1e6', borderRadius: 4,
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
                fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                <Icon name="edit" size={11} /> Edit team details
              </button>
            )}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 8px', letterSpacing: '-0.02em' }}>{team.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#5e6c84', fontSize: 13 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="users" size={14} /> {team.members.length} members
            </span>
            <span>•</span>
            <span>Lead: <strong style={{ color: '#172b4d' }}>{team.members[0].name}</strong></span>
            <span>•</span>
            <span>Supervisor: <strong style={{ color: '#172b4d' }}>{window.CAPSTONE.SUPERVISOR.name}</strong></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Done',   v: metrics.done,   c: '#1f845a' },
            { label: 'Doing',  v: metrics.doing,  c: '#1d7afc' },
            { label: 'Review', v: metrics.review, c: '#e2b203' },
            { label: 'To do',  v: metrics.todo,   c: '#8590a2' },
          ].map(s => (
            <div key={s.label} style={{
              minWidth: 76, padding: '10px 14px',
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

    </div>
  );
}

// ---------- Tabs ----------
function Tabs({ tab, setTab, counts }) {
  const tabs = [
    { id: 'board',    label: 'Board',           icon: 'check' },
    { id: 'files',    label: 'Files',           icon: 'file' },
    { id: 'feedback', label: 'Supervisor feedback', icon: 'message' },
    { id: 'meetings', label: 'Meetings',        icon: 'meeting' },
    { id: 'members',  label: 'Members',         icon: 'users' },
  ];
  return (
    <div style={{
      padding: '0 28px',
      borderBottom: '1px solid #dfe1e6',
      background: 'transparent',
    }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 14px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              color: active ? '#0079BF' : '#5e6c84',
              borderBottom: active ? '2px solid #0079BF' : '2px solid transparent',
              marginBottom: -1,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'inherit',
            }}>
              <Icon name={t.icon} size={14} /> {t.label}
              <span style={{
                padding: '1px 6px', borderRadius: 8,
                background: active ? '#E9F2FF' : '#dfe1e6',
                color: active ? '#0055cc' : '#5e6c84',
                fontSize: 11, fontWeight: 700,
              }}>{counts[t.id]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Kanban board ----------
function KanbanBoard({ team, tasks, onOpenTask, onAddTask }) {
  const grouped = STATUS.map(s => ({ s, tasks: tasks.filter(t => t.status === s) }));
  return (
    <div style={{
      paddingTop: 20,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: 14,
      alignItems: 'flex-start',
    }}>
      {grouped.map(({ s, tasks: list }) => (
        <KanbanColumn key={s} status={s} tasks={list} team={team} onOpenTask={onOpenTask} onAddTask={onAddTask} />
      ))}
    </div>
  );
}

function KanbanColumn({ status, tasks, team, onOpenTask, onAddTask }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState(0);

  function submit() {
    const t = title.trim();
    if (!t) { setAdding(false); return; }
    onAddTask({ title: t, status, assigneeIdx: assignee, week: window.CAPSTONE.CURRENT_WEEK, labels: [] });
    setTitle(''); setAssignee(0); setAdding(false);
  }

  return (
    <div style={{
      background: '#EBECF0',
      borderRadius: 10,
      padding: 8,
      maxHeight: 'calc(100vh - 320px)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '6px 10px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <StatusPill status={status} small />
          <span style={{ fontSize: 12, color: '#5e6c84', fontWeight: 600 }}>{tasks.length}</span>
        </div>
        <button style={iconBtn} title="Add card" onClick={() => setAdding(true)}><Icon name="plus" size={14} /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', padding: '0 2px 2px' }}>
        {tasks.map(t => <TaskCard key={t.id} task={t} team={team} onClick={() => onOpenTask(t)} />)}
        {adding ? (
          <div style={{
            background: 'white', borderRadius: 6, padding: 8,
            boxShadow: '0 1px 0 rgba(9,30,66,0.13)',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <textarea
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } if (e.key === 'Escape') setAdding(false); }}
              placeholder="Enter a title for this card…"
              style={{
                border: 'none', outline: 'none', resize: 'none',
                fontFamily: 'inherit', fontSize: 13.5, color: '#172b4d',
                minHeight: 56, padding: 4, background: 'transparent',
              }}
            />
            <select value={assignee} onChange={e => setAssignee(+e.target.value)} style={{
              padding: '4px 6px', fontSize: 11, border: '1px solid #dfe1e6',
              borderRadius: 4, fontFamily: 'inherit', background: 'white',
            }}>
              {team.members.map((m, i) => <option key={m.id} value={i}>{m.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={submit} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 700,
                background: '#0079BF', color: 'white',
                border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit',
              }}>Add card</button>
              <button onClick={() => { setAdding(false); setTitle(''); }} style={{
                padding: '6px 8px', background: 'transparent', border: 'none',
                cursor: 'pointer', color: '#5e6c84', fontSize: 16, fontFamily: 'inherit',
              }}>×</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{
            padding: '8px 10px', textAlign: 'left',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#5e6c84', fontSize: 13, fontFamily: 'inherit',
            borderRadius: 6,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="plus" size={14} /> Add a card
          </button>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, team, onClick, compact }) {
  const member = team.members[task.assigneeIdx];
  return (
    <div onClick={onClick} style={{
      background: 'white', borderRadius: 6,
      padding: compact ? '6px 8px' : '8px 10px',
      boxShadow: '0 1px 0 rgba(9,30,66,0.13)',
      cursor: 'pointer',
      transition: 'box-shadow 100ms, transform 80ms',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(9,30,66,0.25)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 0 rgba(9,30,66,0.13)'}>
      {task.labels && task.labels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {task.labels.map(l => <Label key={l} name={l} small />)}
        </div>
      )}
      <div style={{ fontSize: 13.5, color: '#172b4d', lineHeight: 1.35, marginBottom: 8, fontWeight: 500 }}>
        {task.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#5e6c84', fontSize: 11 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={12} /> Wk {task.week}
          </span>
          {task.commentCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Icon name="comment" size={12} /> {task.commentCount}
            </span>
          )}
          {task.attachmentCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Icon name="paperclip" size={12} /> {task.attachmentCount}
            </span>
          )}
        </div>
        <Avatar member={member} size={22} />
      </div>
    </div>
  );
}

// ---------- Week board (alternative layout) ----------
function WeekBoard({ team, tasks, onOpenTask, onAddTask }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [wk, setWk] = useState(CURRENT_WEEK);
  const [assignee, setAssignee] = useState(0);

  const weeks = useMemo(() => {
    const map = {};
    tasks.forEach(t => { (map[t.week] = map[t.week] || []).push(t); });
    return Object.entries(map).sort((a, b) => +a[0] - +b[0]);
  }, [tasks]);

  function submit() {
    const t = title.trim();
    if (!t) { setAdding(false); return; }
    onAddTask({ title: t, status: 'todo', assigneeIdx: assignee, week: +wk, labels: [] });
    setTitle(''); setAssignee(0); setAdding(false);
  }

  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        {adding ? (
          <div style={{
            background: 'white', borderRadius: 8, padding: 10,
            border: '1px solid #dfe1e6',
            display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
          }}>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setAdding(false); }}
              placeholder="Card title" style={{
                padding: '6px 10px', fontSize: 13, border: '1px solid #dfe1e6',
                borderRadius: 4, fontFamily: 'inherit', minWidth: 220,
              }} />
            <select value={wk} onChange={e => setWk(+e.target.value)} style={{
              padding: '6px 8px', fontSize: 12, border: '1px solid #dfe1e6',
              borderRadius: 4, fontFamily: 'inherit',
            }}>
              {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(n => <option key={n} value={n}>Week {n}</option>)}
            </select>
            <select value={assignee} onChange={e => setAssignee(+e.target.value)} style={{
              padding: '6px 8px', fontSize: 12, border: '1px solid #dfe1e6',
              borderRadius: 4, fontFamily: 'inherit',
            }}>
              {team.members.map((m, i) => <option key={m.id} value={i}>{m.name}</option>)}
            </select>
            <button onClick={submit} style={{
              padding: '6px 12px', fontSize: 12, fontWeight: 700,
              background: '#0079BF', color: 'white', border: 'none',
              borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit',
            }}>Add</button>
            <button onClick={() => setAdding(false)} style={{
              padding: '6px 8px', background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#5e6c84', fontSize: 16, fontFamily: 'inherit',
            }}>×</button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={uploadBtn}>
            <Icon name="plus" size={14} /> Add card
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {weeks.map(([wk, list]) => {
          const wkNum = +wk;
          const isPast = wkNum < CURRENT_WEEK;
          const isCurrent = wkNum === CURRENT_WEEK;
          return (
            <div key={wk} style={{
              background: isCurrent ? '#FFF7D6' : '#EBECF0',
              border: isCurrent ? '2px solid #E2B203' : '2px solid transparent',
              borderRadius: 10, padding: 10,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '2px 4px 10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, color: '#172b4d', fontSize: 14 }}>Week {wk}</span>
                  {isCurrent && <span style={{
                    padding: '2px 6px', background: '#E2B203', color: 'white',
                    fontSize: 10, fontWeight: 800, borderRadius: 3, letterSpacing: '0.05em',
                  }}>NOW</span>}
                  {isPast && <Icon name="check" size={14} color="#1f845a" />}
                </div>
                <span style={{ fontSize: 11, color: '#5e6c84', fontWeight: 600 }}>{list.length} tasks</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {list.map(t => <TaskCard key={t.id} task={t} team={team} onClick={() => onOpenTask(t)} compact />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Task detail modal (editable) ----------
function TaskDetail({ task, team, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status);
  const [assigneeIdx, setAssigneeIdx] = useState(task.assigneeIdx);
  const [week, setWeek] = useState(task.week);
  const [labels, setLabels] = useState((task.labels || []).join(', '));

  function save() {
    onUpdate({
      title: title.trim() || task.title,
      status,
      assigneeIdx: +assigneeIdx,
      week: +week || task.week,
      labels: labels.split(',').map(s => s.trim()).filter(Boolean),
    });
  }
  function remove() {
    if (confirm('Delete this task?')) { onDelete(); onClose(); }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#5e6c84', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Edit task</div>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{
            ...efInput, fontSize: 18, fontWeight: 700, padding: '8px 10px',
          }} />
        </div>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: 6, border: 'none',
          background: '#dfe1e6', cursor: 'pointer', fontSize: 18, color: '#42526e', fontFamily: 'inherit',
        }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <FormField label="Status">
          <select value={status} onChange={e => setStatus(e.target.value)} style={efInput}>
            {STATUS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </FormField>
        <FormField label="Assignee">
          <select value={assigneeIdx} onChange={e => setAssigneeIdx(e.target.value)} style={efInput}>
            {team.members.map((m, i) => <option key={m.id} value={i}>{m.name}</option>)}
          </select>
        </FormField>
        <FormField label="Week (1–28)">
          <input type="number" min="1" max="28" value={week} onChange={e => setWeek(e.target.value)} style={efInput} />
        </FormField>
        <FormField label="Labels (comma-separated)">
          <input value={labels} onChange={e => setLabels(e.target.value)} placeholder="research, fieldwork" style={efInput} />
        </FormField>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
        <button onClick={remove} style={{
          padding: '9px 14px', fontSize: 12, fontWeight: 700,
          background: 'white', color: '#AE2A19',
          border: '1px solid #FFD2CC', borderRadius: 6, cursor: 'pointer',
          fontFamily: 'inherit',
        }}>Delete task</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{
            padding: '9px 14px', fontSize: 13, fontWeight: 700,
            background: 'white', color: '#172b4d',
            border: '1px solid #dfe1e6', borderRadius: 6, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>Cancel</button>
          <button onClick={() => { save(); onClose(); }} style={{
            padding: '9px 16px', fontSize: 13, fontWeight: 700,
            background: '#0079BF', color: 'white',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="save" size={14} /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#5e6c84', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
function SidePanel({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#5e6c84', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{title}</div>
      <div style={{ background: 'white', padding: 10, borderRadius: 6, border: '1px solid #dfe1e6' }}>
        {children}
      </div>
    </div>
  );
}
function ActivityItem({ avatar, text, when }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <Avatar member={avatar} size={28} />
      <div style={{ flex: 1, fontSize: 13, color: '#172b4d', lineHeight: 1.45 }}>
        <div>{text}</div>
        <div style={{ fontSize: 11, color: '#5e6c84', marginTop: 2 }}>{when}</div>
      </div>
    </div>
  );
}

// ---------- Files view ----------
const FILE_KIND_STYLES = {
  pdf:  { bg: '#FFEBE5', fg: '#AE2A19', label: 'PDF'   },
  img:  { bg: '#E3FCEF', fg: '#216E4E', label: 'IMG'   },
  xls:  { bg: '#DCFFF1', fg: '#1f845a', label: 'XLS'   },
  ppt:  { bg: '#FEDEC8', fg: '#A54800', label: 'PPT'   },
  csv:  { bg: '#DCFFF1', fg: '#1f845a', label: 'CSV'   },
  fig:  { bg: '#F3F0FF', fg: '#352C63', label: 'FIG'   },
  cad:  { bg: '#E9F2FF', fg: '#0055CC', label: 'DWG'   },
  sim:  { bg: '#FEF7E5', fg: '#7F5F01', label: 'SIM'   },
  zip:  { bg: '#dfe1e6', fg: '#42526e', label: 'ZIP'   },
  code: { bg: '#1d212a', fg: '#a4ffba', label: 'CODE'  },
};
function FilesView({ team, files, refresh }) {
  const driveLink = window.CAPSTONE.DRIVE_LINK;
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', kind: 'pdf', size: '', wk: window.CAPSTONE.CURRENT_WEEK, by: 0, link: '' });

  function add() {
    if (!form.name.trim()) return;
    let link = (form.link || '').trim();
    if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
    window.CAPSTONE.FILES[team.id].push({ ...form, name: form.name.trim(), wk: +form.wk, by: +form.by, link });
    window.CAPSTONE.save(); setAdding(false); setForm({ name: '', kind: 'pdf', size: '', wk: window.CAPSTONE.CURRENT_WEEK, by: 0, link: '' }); refresh();
  }
  function remove(idx) {
    if (!confirm('Remove this file entry?')) return;
    window.CAPSTONE.FILES[team.id].splice(idx, 1);
    window.CAPSTONE.save(); refresh();
  }
  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Documents &amp; deliverables</h3>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setAdding(a => !a)} style={{ ...uploadBtn, background: '#5243AA' }}>
            <Icon name="plus" size={14} /> Add file entry
          </button>
          <a href={driveLink} target="_blank" rel="noopener noreferrer" style={{
            ...uploadBtn, textDecoration: 'none',
          }}>
            <Icon name="plus" size={14} /> Upload to Drive
          </a>
        </div>
      </div>

      {adding && (
        <div style={{ background: 'white', borderRadius: 10, padding: 16, border: '1px solid #dfe1e6', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="File name (with extension, e.g. Report_v1.pdf)"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Report_v1.pdf" style={efInput} /></FormField>
          <FormField label="Share link (Google Drive / Dropbox / GitHub URL)">
            <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://drive.google.com/file/d/…" style={efInput} />
          </FormField>
          <FormField label="Type">
            <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })} style={efInput}>
              {Object.keys(FILE_KIND_STYLES).map(k => <option key={k}>{k}</option>)}
            </select>
          </FormField>
          <FormField label="Size"><input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="1.2 MB" style={efInput} /></FormField>
          <FormField label="Week"><input type="number" min="1" max="28" value={form.wk} onChange={e => setForm({ ...form, wk: e.target.value })} style={efInput} /></FormField>
          <FormField label="Uploaded by">
            <select value={form.by} onChange={e => setForm({ ...form, by: e.target.value })} style={efInput}>
              {team.members.map((m, i) => <option key={m.id} value={i}>{m.name}</option>)}
            </select>
          </FormField>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{ ...uploadBtn, background: 'white', color: '#172b4d', border: '1px solid #dfe1e6' }}>Cancel</button>
            <button onClick={add} style={uploadBtn}><Icon name="save" size={14} /> Save file entry</button>
          </div>
        </div>
      )}

      <div style={{
        background: 'white', borderRadius: 10, padding: 16,
        border: '1px solid #dfe1e6',
        marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: '#E9F2FF', color: '#0055CC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="folder" size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#172b4d', marginBottom: 2 }}>
            Upload all deliverables to the shared Google Drive folder
          </div>
          <div style={{ fontSize: 12, color: '#5e6c84', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <a href={driveLink} target="_blank" rel="noopener noreferrer" style={{ color: '#0055CC' }}>{driveLink}</a>
          </div>
        </div>
        <a href={driveLink} target="_blank" rel="noopener noreferrer" style={{
          ...uploadBtn, textDecoration: 'none', flexShrink: 0,
        }}>
          <Icon name="plus" size={14} /> Upload to Drive
        </a>
      </div>
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #dfe1e6', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 110px 120px 110px 100px',
          padding: '10px 16px', background: '#FAFBFC',
          fontSize: 11, fontWeight: 800, color: '#5e6c84', textTransform: 'uppercase', letterSpacing: '0.05em',
          borderBottom: '1px solid #dfe1e6',
        }}>
          <div>Type</div><div>Name</div><div>Size</div><div>Uploaded by</div><div>Week</div><div>Actions</div>
        </div>
        {files.map((f, i) => {
          const k = FILE_KIND_STYLES[f.kind] || FILE_KIND_STYLES.zip;
          const m = team.members[f.by];
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 110px 120px 110px 100px',
              padding: '12px 16px', alignItems: 'center',
              borderBottom: i < files.length - 1 ? '1px solid #f0f1f3' : 'none',
              fontSize: 13,
            }}>
              <div>
                <div style={{
                  width: 38, height: 46, borderRadius: 4,
                  background: k.bg, color: k.fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
                  border: `1px solid ${k.fg}22`,
                }}>{k.label}</div>
              </div>
              <div style={{ fontWeight: 600, color: '#172b4d', minWidth: 0 }}>
                {f.link
                  ? <a href={f.link} target="_blank" rel="noopener noreferrer" style={{ color: '#0055CC', textDecoration: 'none' }} title={f.link}>{f.name}</a>
                  : f.name}
                {f.link && (
                  <div style={{
                    fontSize: 11, color: '#5e6c84', marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }} title={f.link}>
                    <Icon name="paperclip" size={10} /> {f.link.replace(/^https?:\/\//, '')}
                  </div>
                )}
              </div>
              <div style={{ color: '#5e6c84' }}>{f.size}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar member={m} size={22} />
                <span style={{ color: '#5e6c84', fontSize: 12 }}>{m.name.split(' ')[0]}</span>
              </div>
              <div style={{ color: '#5e6c84' }}>Week {f.wk}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <a href={f.link || driveLink} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, textDecoration: 'none' }} title={f.link ? 'Open shared link' : 'Open in Google Drive'}>
                  <Icon name="download" size={14} />
                </a>
                <button onClick={() => remove(i)} style={iconBtn} title="Remove"><Icon name="x" size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Feedback ----------
const MOOD_STYLES = {
  praise:  { bg: '#E3FCEF', fg: '#216E4E', dot: '#1f845a', label: 'Praise' },
  note:    { bg: '#E9F2FF', fg: '#0055CC', dot: '#1d7afc', label: 'Note' },
  concern: { bg: '#FFEBE5', fg: '#AE2A19', dot: '#C9372C', label: 'Concern' },
};
function FeedbackView({ team, comments, canEdit, refresh }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ wk: window.CAPSTONE.CURRENT_WEEK, mood: 'note', text: '' });

  function add() {
    if (!form.text.trim()) return;
    window.CAPSTONE.COMMENTS[team.id].push({ ...form, wk: +form.wk, text: form.text.trim() });
    window.CAPSTONE.save(); setAdding(false); setForm({ wk: window.CAPSTONE.CURRENT_WEEK, mood: 'note', text: '' }); refresh();
  }
  function remove(realIdx) {
    if (!confirm('Delete this feedback?')) return;
    window.CAPSTONE.COMMENTS[team.id].splice(realIdx, 1);
    window.CAPSTONE.save(); refresh();
  }

  return (
    <div style={{ paddingTop: 24, maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Supervisor feedback</h3>
        {canEdit && <button onClick={() => setAdding(a => !a)} style={{ ...uploadBtn, background: '#5243AA' }}><Icon name="plus" size={14} /> Add feedback</button>}
      </div>
      {adding && canEdit && (
        <div style={{ background: 'white', borderRadius: 10, padding: 16, border: '1px solid #dfe1e6', marginBottom: 12, display: 'grid', gridTemplateColumns: '90px 130px 1fr auto', gap: 8, alignItems: 'end' }}>
          <FormField label="Week"><input type="number" min="1" max="28" value={form.wk} onChange={e => setForm({ ...form, wk: e.target.value })} style={efInput} /></FormField>
          <FormField label="Mood">
            <select value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })} style={efInput}>
              <option value="praise">Praise</option><option value="note">Note</option><option value="concern">Concern</option>
            </select>
          </FormField>
          <FormField label="Comment"><input value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Your feedback…" style={efInput} /></FormField>
          <button onClick={add} style={{ ...uploadBtn, height: 34 }}><Icon name="save" size={14} /> Save</button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {comments.map((c, ri) => ({ c, ri })).slice().reverse().map(({ c, ri }, i) => {
          const m = MOOD_STYLES[c.mood];
          return (
            <div key={ri} style={{
              background: 'white', borderRadius: 10, padding: 16,
              border: '1px solid #dfe1e6',
              borderLeft: `4px solid ${m.dot}`,
              boxShadow: '0 1px 2px rgba(9,30,66,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#5243AA', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13,
                  }}>{(window.CAPSTONE.SUPERVISOR.name.match(/\b\w/g) || []).slice(0,2).join('').toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#172b4d' }}>{window.CAPSTONE.SUPERVISOR.name}</div>
                    <div style={{ fontSize: 11, color: '#5e6c84' }}>Capstone Supervisor · Week {c.wk}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: 999,
                    background: m.bg, color: m.fg,
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{m.label}</span>
                  {canEdit && <button onClick={() => remove(ri)} style={iconBtn} title="Delete"><Icon name="x" size={14} /></button>}
                </div>
              </div>
              <div style={{ fontSize: 14, color: '#172b4d', lineHeight: 1.55 }}>{c.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Meetings ----------
function MeetingsView({ team, meetings, refresh }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ wk: window.CAPSTONE.CURRENT_WEEK, title: '', attendees: 6, decisions: 0 });

  function add() {
    if (!form.title.trim()) return;
    window.CAPSTONE.MEETINGS[team.id].push({ ...form, wk: +form.wk, title: form.title.trim(), attendees: +form.attendees, decisions: +form.decisions });
    window.CAPSTONE.save(); setAdding(false); setForm({ wk: window.CAPSTONE.CURRENT_WEEK, title: '', attendees: 6, decisions: 0 }); refresh();
  }
  function remove(realIdx) {
    if (!confirm('Delete this meeting?')) return;
    window.CAPSTONE.MEETINGS[team.id].splice(realIdx, 1);
    window.CAPSTONE.save(); refresh();
  }

  return (
    <div style={{ paddingTop: 24, maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Meeting minutes</h3>
        <button onClick={() => setAdding(a => !a)} style={uploadBtn}><Icon name="plus" size={14} /> New meeting</button>
      </div>
      {adding && (
        <div style={{ background: 'white', borderRadius: 10, padding: 16, border: '1px solid #dfe1e6', marginBottom: 12, display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
          <FormField label="Week"><input type="number" min="1" max="28" value={form.wk} onChange={e => setForm({ ...form, wk: e.target.value })} style={efInput} /></FormField>
          <FormField label="Title"><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Meeting topic…" style={efInput} /></FormField>
          <FormField label="Attendees"><input type="number" min="0" max="6" value={form.attendees} onChange={e => setForm({ ...form, attendees: e.target.value })} style={efInput} /></FormField>
          <FormField label="Decisions"><input type="number" min="0" value={form.decisions} onChange={e => setForm({ ...form, decisions: e.target.value })} style={efInput} /></FormField>
          <button onClick={add} style={{ ...uploadBtn, height: 34 }}><Icon name="save" size={14} /> Save</button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {meetings.map((m, ri) => ({ m, ri })).slice().reverse().map(({ m, ri }) => (
          <div key={ri} style={{
            background: 'white', borderRadius: 10, padding: 16,
            border: '1px solid #dfe1e6',
            display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 14, alignItems: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 8,
              background: team.accent + '20', color: team.accent,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800,
            }}>
              <span style={{ fontSize: 9, letterSpacing: '0.1em' }}>WEEK</span>
              <span style={{ fontSize: 20, lineHeight: 1 }}>{m.wk}</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#172b4d' }}>{m.title}</div>
              <div style={{ fontSize: 12, color: '#5e6c84', marginTop: 4, display: 'flex', gap: 14 }}>
                <span><Icon name="users" size={11} /> {m.attendees}/6 attended</span>
                <span><Icon name="check" size={11} /> {m.decisions} decisions</span>
              </div>
            </div>
            <button onClick={() => remove(ri)} style={iconBtn} title="Delete"><Icon name="x" size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Members ----------
function MembersView({ team, contrib, tasks, showContribution }) {
  return (
    <div style={{ paddingTop: 24 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>
        Team members{showContribution ? ' & contribution' : ''}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {contrib.sort((a,b) => b.pct - a.pct).map(({ member, pct, raw }, idx) => {
          const memberTasks = tasks.filter(t => t.assigneeIdx === team.members.indexOf(member));
          const done = memberTasks.filter(t => t.status === 'done').length;
          return (
            <div key={member.id} style={{
              background: 'white', borderRadius: 10, padding: 16,
              border: '1px solid #dfe1e6',
              boxShadow: '0 1px 2px rgba(9,30,66,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar member={member} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#172b4d' }}>{member.name}</div>
                  <div style={{ fontSize: 11, color: '#5e6c84' }}>
                    {member.role} · ID {member.sid}
                  </div>
                </div>
                {member.role === 'Team Lead' && <Icon name="star" size={16} color="#E2B203" />}
              </div>
              {showContribution && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#5e6c84', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contribution</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#172b4d' }}>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color={team.accent} height={8} />
                </>
              )}
              <div style={{ marginTop: 10, fontSize: 11, color: '#5e6c84' }}>
                {memberTasks.length} tasks assigned · {done} done
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const iconBtn = {
  width: 28, height: 28, borderRadius: 4,
  border: 'none', background: 'transparent', cursor: 'pointer',
  color: '#42526e', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
const uploadBtn = {
  padding: '7px 12px', fontSize: 12, fontWeight: 700,
  background: '#0079BF', color: 'white',
  border: 'none', borderRadius: 4, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontFamily: 'inherit',
};

// ---------- Edit Team Form (supervisor only) ----------
const ACCENT_PALETTE = ['#0079BF', '#D29034', '#519839', '#B04632', '#89609E', '#CD5A91', '#00AECC', '#5243AA', '#E2B203'];

function EditTeamForm({ team, onClose, onSaved }) {
  const [title, setTitle] = useState(team.title);
  const [number, setNumber] = useState(team.number);
  const [accent, setAccent] = useState(team.accent);
  const [progress, setProgress] = useState(team.progress);
  const [members, setMembers] = useState(() => team.members.map(m => ({ ...m })));
  const [supName, setSupName] = useState(window.CAPSTONE.SUPERVISOR.name);
  const [supEmail, setSupEmail] = useState(window.CAPSTONE.SUPERVISOR.email);

  function updateMember(idx, key, val) {
    setMembers(ms => ms.map((m, i) => i === idx ? { ...m, [key]: val } : m));
  }

  function save() {
    const _save = window.CAPSTONE.save;
    team.title = title.trim() || team.title;
    team.number = number.trim() || team.number;
    team.accent = accent;
    team.progress = +progress || 0;
    team.members = members.map(m => ({
      ...m,
      name: m.name.trim(),
      sid: m.sid.trim(),
      role: m.role,
      mobile: m.mobile.trim(),
      initials: (m.name.trim().replace(/\./g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('') || '??').toUpperCase(),
    }));
    window.CAPSTONE.SUPERVISOR.name = supName.trim() || window.CAPSTONE.SUPERVISOR.name;
    window.CAPSTONE.SUPERVISOR.email = supEmail.trim() || window.CAPSTONE.SUPERVISOR.email;
    _save && _save();
    onSaved();
  }

  return (
    <div style={{ padding: 24, maxHeight: '85vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: '#5243AA', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Supervisor edit · Team {team.number}
          </div>
          <h2 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: '#172b4d' }}>Edit team details</h2>
        </div>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: 6,
          border: 'none', background: '#dfe1e6', cursor: 'pointer',
          fontSize: 18, color: '#42526e', fontFamily: 'inherit',
        }}>×</button>
      </div>

      <FormSection title="Project">
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10 }}>
          <FormField label="Team #">
            <input value={number} onChange={e => setNumber(e.target.value)} style={efInput} />
          </FormField>
          <FormField label="Project title">
            <input value={title} onChange={e => setTitle(e.target.value)} style={efInput} />
          </FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <FormField label="Accent color">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ACCENT_PALETTE.map(c => (
                <button key={c} type="button" onClick={() => setAccent(c)} style={{
                  width: 28, height: 28, borderRadius: 6, background: c,
                  border: accent === c ? '3px solid #172b4d' : '2px solid #dfe1e6',
                  cursor: 'pointer', padding: 0,
                }} />
              ))}
            </div>
          </FormField>
          <FormField label={`Progress override (${progress}%)`}>
            <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(+e.target.value)} style={{ accentColor: accent, width: '100%' }} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Supervisor">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Name">
            <input value={supName} onChange={e => setSupName(e.target.value)} style={efInput} />
          </FormField>
          <FormField label="Email">
            <input value={supEmail} onChange={e => setSupEmail(e.target.value)} style={efInput} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title={`Members (${members.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {members.map((m, i) => (
            <div key={m.id} style={{
              display: 'grid', gridTemplateColumns: '32px 1.6fr 1fr 1fr 1fr',
              gap: 8, alignItems: 'center',
              padding: 8, background: '#F4F5F7', borderRadius: 6,
            }}>
              <Avatar member={m} size={28} />
              <input value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} placeholder="Name" style={efInput} />
              <input value={m.sid} onChange={e => updateMember(i, 'sid', e.target.value)} placeholder="Student ID" style={efInput} />
              <select value={m.role} onChange={e => updateMember(i, 'role', e.target.value)} style={efInput}>
                <option>Team Lead</option>
                <option>Member</option>
              </select>
              <input value={m.mobile} onChange={e => updateMember(i, 'mobile', e.target.value)} placeholder="Mobile" style={efInput} />
            </div>
          ))}
        </div>
      </FormSection>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
        <button onClick={onClose} style={{
          padding: '9px 16px', fontSize: 13, fontWeight: 700,
          background: 'white', color: '#172b4d',
          border: '1px solid #dfe1e6', borderRadius: 6, cursor: 'pointer',
          fontFamily: 'inherit',
        }}>Cancel</button>
        <button onClick={save} style={{
          padding: '9px 16px', fontSize: 13, fontWeight: 700,
          background: '#5243AA', color: 'white',
          border: 'none', borderRadius: 6, cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="save" size={14} /> Save changes
        </button>
      </div>
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#5e6c84', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
function FormField({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#5e6c84' }}>{label}</span>
      {children}
    </label>
  );
}
const efInput = {
  padding: '7px 10px', fontSize: 13,
  border: '1.5px solid #dfe1e6', borderRadius: 5,
  background: 'white', color: '#172b4d',
  fontFamily: 'inherit', outline: 'none', width: '100%',
};

window.TeamBoard = TeamBoard;
window.EditTeamForm = EditTeamForm;
})();
