// CapTrack V2.0 — Supabase DB Adapter
// Loads after data.js. Wraps window.CAPSTONE so reads stay local,
// writes go to Supabase, and realtime pushes updates into memory.
//
// Config (set before this script loads, or edit inline):
//   window.CAPTRACK_SUPABASE_URL = 'https://<project>.supabase.co';
//   window.CAPTRACK_SUPABASE_ANON_KEY = '<key>';

(function() {
  const SUPABASE_URL = window.CAPTRACK_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
  const SUPABASE_ANON_KEY = window.CAPTRACK_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

  // If keys are missing, silently fall back to localStorage-only mode (dev/offline)
  const ONLINE = !SUPABASE_URL.includes('YOUR_PROJECT_ID');

  // ── Subscriptions (for React re-renders) ──
  const subs = new Set();
  function emit() { subs.forEach(fn => { try { fn(); } catch(e) {} }); }
  window.CAPSTONE.subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
  window.CAPSTONE.unsubscribe = (fn) => subs.delete(fn);

  // ── Supabase client (CDN must be loaded in index.html before this script) ──
  let supabase = null;
  if (ONLINE && typeof supabase !== 'undefined' && supabase.createClient) {
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }

  // ── Phase constants (static, not synced) ──
  const PHASES = [
    { name: 'Discovery & Lit Review',  weeks: [1, 4]  },
    { name: 'Concept & Design',        weeks: [5, 9]  },
    { name: 'Proposal Defense',        weeks: [10, 14] },
    { name: 'Build & Implementation',  weeks: [15, 22] },
    { name: 'Testing & Validation',    weeks: [23, 26] },
    { name: 'Final Defense & Report',  weeks: [27, 28] },
  ];
  const STATUS = ['todo', 'doing', 'review', 'done'];
  const STATUS_LABEL = { todo: 'To do', doing: 'Doing', review: 'Review', done: 'Done' };
  const CURRENT_WEEK = 18;
  const TOTAL_WEEKS  = 28;
  const MIDPOINT_WEEK = 14;

  // ── In-memory mutable stores ──
  const TEAMS = [];
  const TASKS = {};
  const FILES = {};
  const COMMENTS = {};
  const MEETINGS = {};
  let SUPERVISOR = { id: 'sup1', name: 'Dr. Md. Abu Shaid Sujon', role: 'Capstone Supervisor', email: 'shaid.sujon@iut-dhaka.edu' };
  let DRIVE_LINK = ''; // Fetched from Supabase app_settings at runtime
  let TEAM_PASSWORD = ''; // Fetched from Supabase app_settings at runtime — never hardcoded
  const RUBRIC_SCORES = {};

  // ── Helpers ──
  function initials(name) {
    return name.replace(/\./g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
  function teamMetrics(team) {
    const tasks = TASKS[team.id] || [];
    const counts = { todo: 0, doing: 0, review: 0, done: 0 };
    for (const t of tasks) counts[t.status]++;
    const done = counts.done;
    const total = tasks.length;
    const completion = total ? Math.round((done / total) * 100) : 0;
    return { ...counts, total, completion };
  }
  function memberContribution(team) {
    const weights = { todo: 1, doing: 2, review: 2, done: 3 };
    const total = team.members.map(() => 0);
    let sum = 0;
    for (const t of TASKS[team.id] || []) {
      const w = weights[t.status] || 1;
      total[t.assigneeIdx] = (total[t.assigneeIdx] || 0) + w;
      sum += w;
    }
    return team.members.map((m, i) => ({
      member: m, pct: sum ? Math.round((total[i] / sum) * 100) : 0, raw: total[i] || 0,
    }));
  }

  // ── DB helpers ──
  async function dbInsert(table, row) {
    if (!supabase) return;
    const { error } = await supabase.from(table).insert(row);
    if (error) console.warn('DB insert error:', table, error.message);
  }
  async function dbUpdate(table, id, updates, idCol = 'id') {
    if (!supabase) return;
    const { error } = await supabase.from(table).update(updates).eq(idCol, id);
    if (error) console.warn('DB update error:', table, error.message);
  }
  async function dbDelete(table, id, idCol = 'id') {
    if (!supabase) return;
    const { error } = await supabase.from(table).delete().eq(idCol, id);
    if (error) console.warn('DB delete error:', table, error.message);
  }

  // ── Save overrides ──
  const localSave = window.CAPSTONE.save;
  window.CAPSTONE.save = async function() {
    // Always write to localStorage as offline cache
    try {
      localStorage.setItem('captrack-data-v3', JSON.stringify({
        TEAMS, TASKS, FILES, COMMENTS, MEETINGS, SUPERVISOR, DRIVE_LINK, RUBRIC_SCORES,
      }));
    } catch(e) {}
    // Sync to Supabase is handled per-mutation, not bulk
  };

  const localReset = window.CAPSTONE.reset;
  window.CAPSTONE.reset = function() {
    localStorage.removeItem('captrack-data-v3');
    location.reload();
  };

  // ── Realtime channel setup ──
  let channels = [];
  function setupRealtime() {
    if (!supabase) return;

    const tables = [
      { name: 'tasks',    store: TASKS,    key: 'team_id', build: r => ({
        id: r.id, title: r.title, status: r.status,
        assigneeIdx: r.assignee_idx, week: r.week,
        labels: r.labels || [], commentCount: r.comment_count || 0, attachmentCount: r.attachment_count || 0,
      })},
      { name: 'files',    store: FILES,    key: 'team_id', build: r => ({
        name: r.name, kind: r.kind, size: r.size, week: r.week, by: r.by_idx, link: r.link || '',
      })},
      { name: 'comments', store: COMMENTS, key: 'team_id', build: r => ({
        wk: r.week, mood: r.mood, text: r.text,
      })},
      { name: 'meetings', store: MEETINGS, key: 'team_id', build: r => ({
        wk: r.week, title: r.title, attendees: r.attendees, decisions: r.decisions,
      })},
    ];

    for (const tbl of tables) {
      const chan = supabase.channel(`public:${tbl.name}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tbl.name }, (payload) => {
          const teamId = payload.new?.team_id || payload.old?.team_id;
          if (!teamId) return;
          if (!tbl.store[teamId]) tbl.store[teamId] = [];

          if (payload.eventType === 'INSERT') {
            tbl.store[teamId].push(tbl.build(payload.new));
          } else if (payload.eventType === 'UPDATE') {
            const list = tbl.store[teamId];
            const idx = tbl.name === 'tasks'
              ? list.findIndex(x => x.id === payload.new.id)
              : list.findIndex(x => JSON.stringify(x) === JSON.stringify(tbl.build(payload.old)));
            if (idx >= 0) list[idx] = tbl.build(payload.new);
          } else if (payload.eventType === 'DELETE') {
            const list = tbl.store[teamId];
            const idx = tbl.name === 'tasks'
              ? list.findIndex(x => x.id === payload.old.id)
              : list.findIndex(x => JSON.stringify(x) === JSON.stringify(tbl.build(payload.old)));
            if (idx >= 0) list.splice(idx, 1);
          }
          emit();
        })
        .subscribe();
      channels.push(chan);
    }
  }

  // ── Load from Supabase ──
  async function loadFromSupabase() {
    if (!supabase) return false;
    try {
      // Settings
      const { data: settings } = await supabase.from('app_settings').select('*').single();
      if (settings) {
        SUPERVISOR = { id: settings.supervisor_id, name: settings.supervisor_name, role: settings.supervisor_role, email: settings.supervisor_email };
        DRIVE_LINK = settings.drive_link;
        TEAM_PASSWORD = settings.team_password;
      }

      // Teams
      const { data: teamsData } = await supabase.from('teams').select('*');
      TEAMS.length = 0;
      for (const t of (teamsData || [])) {
        TEAMS.push({
          id: t.id, number: t.number, title: t.title,
          accent: t.accent, progress: t.progress, password: t.password,
          members: [],
        });
        TASKS[t.id] = [];
        FILES[t.id] = [];
        COMMENTS[t.id] = [];
        MEETINGS[t.id] = [];
      }

      // Members
      const { data: membersData } = await supabase.from('team_members').select('*').order('idx', { ascending: true });
      for (const m of (membersData || [])) {
        const team = TEAMS.find(t => t.id === m.team_id);
        if (!team) continue;
        team.members.push({
          id: m.sid, name: m.name, sid: m.sid, role: m.role,
          mobile: m.mobile, initials: m.initials || initials(m.name), color: m.color,
        });
      }

      // Tasks
      const { data: tasksData } = await supabase.from('tasks').select('*').order('created_at', { ascending: true });
      for (const r of (tasksData || [])) {
        if (!TASKS[r.team_id]) TASKS[r.team_id] = [];
        TASKS[r.team_id].push({
          id: r.id, title: r.title, status: r.status,
          assigneeIdx: r.assignee_idx, week: r.week,
          labels: r.labels || [], commentCount: r.comment_count || 0, attachmentCount: r.attachment_count || 0,
        });
      }

      // Files
      const { data: filesData } = await supabase.from('files').select('*');
      for (const r of (filesData || [])) {
        if (!FILES[r.team_id]) FILES[r.team_id] = [];
        FILES[r.team_id].push({ name: r.name, kind: r.kind, size: r.size, week: r.week, by: r.by_idx, link: r.link || '' });
      }

      // Comments
      const { data: commentsData } = await supabase.from('comments').select('*');
      for (const r of (commentsData || [])) {
        if (!COMMENTS[r.team_id]) COMMENTS[r.team_id] = [];
        COMMENTS[r.team_id].push({ wk: r.week, mood: r.mood, text: r.text });
      }

      // Meetings
      const { data: meetingsData } = await supabase.from('meetings').select('*');
      for (const r of (meetingsData || [])) {
        if (!MEETINGS[r.team_id]) MEETINGS[r.team_id] = [];
        MEETINGS[r.team_id].push({ wk: r.week, title: r.title, attendees: r.attendees, decisions: r.decisions });
      }

      return true;
    } catch (e) {
      console.warn('Supabase load failed, falling back to localStorage:', e.message);
      return false;
    }
  }

  // ── Load from localStorage (offline fallback) ──
  function loadFromLocal() {
    try {
      const raw = localStorage.getItem('captrack-data-v3');
      if (!raw) return false;
      const o = JSON.parse(raw);
      if (o.TASKS)    Object.keys(o.TASKS).forEach(k => { TASKS[k] = o.TASKS[k]; });
      if (o.FILES)    Object.keys(o.FILES).forEach(k => { FILES[k] = o.FILES[k]; });
      if (o.COMMENTS) Object.keys(o.COMMENTS).forEach(k => { COMMENTS[k] = o.COMMENTS[k]; });
      if (o.MEETINGS) Object.keys(o.MEETINGS).forEach(k => { MEETINGS[k] = o.MEETINGS[k]; });
      if (o.TEAMS) {
        TEAMS.length = 0;
        o.TEAMS.forEach(t => TEAMS.push(t));
      }
      if (o.SUPERVISOR) SUPERVISOR = o.SUPERVISOR;
      if (o.DRIVE_LINK) DRIVE_LINK = o.DRIVE_LINK;
      // TEAM_PASSWORD is never stored in localStorage — fetched from Supabase only
      if (o.RUBRIC_SCORES) Object.assign(RUBRIC_SCORES, o.RUBRIC_SCORES);
      return true;
    } catch (e) { return false; }
  }

  // ── Wire mutation interceptors ──
  // Task mutations
  const origTaskPush = Array.prototype.push;
  function interceptTaskMutations(teamId) {
    // We hook the TASKS[teamId] array methods to auto-sync
    const list = TASKS[teamId];
    if (!list || list._syncHooked) return;
    list._syncHooked = true;

    // Override push (addTask)
    const origPush = list.push.bind(list);
    list.push = function(...items) {
      const res = origPush(...items);
      for (const item of items) {
        dbInsert('tasks', {
          id: item.id, team_id: teamId, title: item.title, status: item.status,
          assignee_idx: item.assigneeIdx, week: item.week, labels: item.labels || [],
          comment_count: item.commentCount || 0, attachment_count: item.attachmentCount || 0,
        });
      }
      return res;
    };

    // Override splice (deleteTask)
    const origSplice = list.splice.bind(list);
    list.splice = function(start, deleteCount, ...items) {
      const deleted = list.slice(start, start + deleteCount);
      const res = origSplice(start, deleteCount, ...items);
      for (const d of deleted) {
        dbDelete('tasks', d.id);
      }
      for (const item of items) {
        dbInsert('tasks', {
          id: item.id, team_id: teamId, title: item.title, status: item.status,
          assignee_idx: item.assigneeIdx, week: item.week, labels: item.labels || [],
          comment_count: item.commentCount || 0, attachment_count: item.attachmentCount || 0,
        });
      }
      return res;
    };

    // Override direct assignment (updateTask)
    // We can't easily intercept property assignment on existing objects,
    // so we rely on the fact that updateTask in team-board.jsx calls
    // window.CAPSTONE.save() after mutation. We'll override save to scan for dirty tasks.
  }

  // Override save to push dirty records
  window.CAPSTONE.save = async function() {
    try {
      localStorage.setItem('captrack-data-v3', JSON.stringify({
        TEAMS, TASKS, FILES, COMMENTS, MEETINGS, SUPERVISOR, DRIVE_LINK, RUBRIC_SCORES,
      }));
    } catch(e) {}

    if (!supabase) return;

    // Push any pending task updates
    for (const [tid, list] of Object.entries(TASKS)) {
      for (const t of list) {
        if (t._dirty) {
          delete t._dirty;
          await dbUpdate('tasks', t.id, {
            title: t.title, status: t.status, assignee_idx: t.assigneeIdx,
            week: t.week, labels: t.labels || [],
            comment_count: t.commentCount || 0, attachment_count: t.attachmentCount || 0,
          });
        }
      }
    }

    // Push files
    for (const [tid, list] of Object.entries(FILES)) {
      // files are append-only via add/remove in the UI; we handle those separately
    }

    // Push comments
    for (const [tid, list] of Object.entries(COMMENTS)) {
      for (const c of list) {
        if (c._dirty) {
          delete c._dirty;
          await dbInsert('comments', { team_id: tid, week: c.wk, mood: c.mood, text: c.text });
        }
      }
    }

    // Push meetings
    for (const [tid, list] of Object.entries(MEETINGS)) {
      for (const m of list) {
        if (m._dirty) {
          delete m._dirty;
          await dbInsert('meetings', { team_id: tid, week: m.wk, title: m.title, attendees: m.attendees, decisions: m.decisions });
        }
      }
    }
  };

  // ── Patch data.js mutation paths ──
  // The existing code mutates arrays directly. We need to intercept those mutations.
  // Strategy: wrap the array accessor so every time code accesses TASKS[teamId], we return a Proxy.

  const taskProxies = {};
  Object.defineProperty(window.CAPSTONE, 'TASKS', {
    get() {
      return new Proxy(TASKS, {
        get(target, prop) {
          const val = target[prop];
          if (Array.isArray(val) && !taskProxies[prop]) {
            taskProxies[prop] = new Proxy(val, {
              set(arr, idx, item) {
                arr[idx] = item;
                if (item && typeof item === 'object') {
                  item._dirty = true;
                  if (supabase) {
                    dbUpdate('tasks', item.id, {
                      title: item.title, status: item.status, assignee_idx: item.assigneeIdx,
                      week: item.week, labels: item.labels || [],
                      comment_count: item.commentCount || 0, attachment_count: item.attachmentCount || 0,
                    });
                  }
                }
                return true;
              },
              deleteProperty(arr, idx) {
                const item = arr[idx];
                const res = delete arr[idx];
                if (item && item.id && supabase) {
                  dbDelete('tasks', item.id);
                }
                return res;
              },
            });
            // Intercept push/splice on the underlying array
            const origPush = val.push.bind(val);
            val.push = function(...items) {
              const r = origPush(...items);
              for (const item of items) {
                if (supabase) dbInsert('tasks', {
                  id: item.id, team_id: prop, title: item.title, status: item.status,
                  assignee_idx: item.assigneeIdx, week: item.week, labels: item.labels || [],
                  comment_count: item.commentCount || 0, attachment_count: item.attachmentCount || 0,
                });
              }
              return r;
            };
            const origSplice = val.splice.bind(val);
            val.splice = function(start, deleteCount, ...items) {
              const deleted = val.slice(start, start + deleteCount);
              const r = origSplice(start, deleteCount, ...items);
              for (const d of deleted) { if (d && d.id && supabase) dbDelete('tasks', d.id); }
              for (const item of items) {
                if (supabase) dbInsert('tasks', {
                  id: item.id, team_id: prop, title: item.title, status: item.status,
                  assignee_idx: item.assigneeIdx, week: item.week, labels: item.labels || [],
                  comment_count: item.commentCount || 0, attachment_count: item.attachmentCount || 0,
                });
              }
              return r;
            };
          }
          return taskProxies[prop] || val;
        },
      });
    },
    configurable: true,
  });

  // Similar proxy for FILES
  const fileProxies = {};
  Object.defineProperty(window.CAPSTONE, 'FILES', {
    get() {
      return new Proxy(FILES, {
        get(target, prop) {
          const val = target[prop];
          if (Array.isArray(val) && !fileProxies[prop]) {
            const origPush = val.push.bind(val);
            val.push = function(...items) {
              const r = origPush(...items);
              for (const item of items) {
                if (supabase) dbInsert('files', {
                  team_id: prop, name: item.name, kind: item.kind, size: item.size,
                  week: item.week, by_idx: item.by, link: item.link || null,
                });
              }
              return r;
            };
            const origSplice = val.splice.bind(val);
            val.splice = function(start, deleteCount, ...items) {
              const deleted = val.slice(start, start + deleteCount);
              const r = origSplice(start, deleteCount, ...items);
              // Files don't have stable IDs in the seed data; we approximate by link+name
              for (const d of deleted) {
                if (supabase) {
                  supabase.from('files').delete().match({ team_id: prop, name: d.name, week: d.week });
                }
              }
              for (const item of items) {
                if (supabase) dbInsert('files', {
                  team_id: prop, name: item.name, kind: item.kind, size: item.size,
                  week: item.week, by_idx: item.by, link: item.link || null,
                });
              }
              return r;
            };
            fileProxies[prop] = true;
          }
          return val;
        },
      });
    },
    configurable: true,
  });

  // Proxy for COMMENTS
  const commentProxies = {};
  Object.defineProperty(window.CAPSTONE, 'COMMENTS', {
    get() {
      return new Proxy(COMMENTS, {
        get(target, prop) {
          const val = target[prop];
          if (Array.isArray(val) && !commentProxies[prop]) {
            const origPush = val.push.bind(val);
            val.push = function(...items) {
              const r = origPush(...items);
              for (const item of items) {
                if (supabase) dbInsert('comments', {
                  team_id: prop, week: item.wk, mood: item.mood, text: item.text,
                });
              }
              return r;
            };
            const origSplice = val.splice.bind(val);
            val.splice = function(start, deleteCount, ...items) {
              const deleted = val.slice(start, start + deleteCount);
              const r = origSplice(start, deleteCount, ...items);
              for (const d of deleted) {
                if (supabase) {
                  supabase.from('comments').delete().match({ team_id: prop, week: d.wk, text: d.text });
                }
              }
              for (const item of items) {
                if (supabase) dbInsert('comments', {
                  team_id: prop, week: item.wk, mood: item.mood, text: item.text,
                });
              }
              return r;
            };
            commentProxies[prop] = true;
          }
          return val;
        },
      });
    },
    configurable: true,
  });

  // Proxy for MEETINGS
  const meetingProxies = {};
  Object.defineProperty(window.CAPSTONE, 'MEETINGS', {
    get() {
      return new Proxy(MEETINGS, {
        get(target, prop) {
          const val = target[prop];
          if (Array.isArray(val) && !meetingProxies[prop]) {
            const origPush = val.push.bind(val);
            val.push = function(...items) {
              const r = origPush(...items);
              for (const item of items) {
                if (supabase) dbInsert('meetings', {
                  team_id: prop, week: item.wk, title: item.title,
                  attendees: item.attendees, decisions: item.decisions,
                });
              }
              return r;
            };
            const origSplice = val.splice.bind(val);
            val.splice = function(start, deleteCount, ...items) {
              const deleted = val.slice(start, start + deleteCount);
              const r = origSplice(start, deleteCount, ...items);
              for (const d of deleted) {
                if (supabase) {
                  supabase.from('meetings').delete().match({ team_id: prop, week: d.wk, title: d.title });
                }
              }
              for (const item of items) {
                if (supabase) dbInsert('meetings', {
                  team_id: prop, week: item.wk, title: item.title,
                  attendees: item.attendees, decisions: item.decisions,
                });
              }
              return r;
            };
            meetingProxies[prop] = true;
          }
          return val;
        },
      });
    },
    configurable: true,
  });

  // ── Expose mutable globals ──
  window.CAPSTONE.TEAMS = TEAMS;
  window.CAPSTONE.SUPERVISOR = SUPERVISOR;
  window.CAPSTONE.PHASES = PHASES;
  window.CAPSTONE.STATUS = STATUS;
  window.CAPSTONE.STATUS_LABEL = STATUS_LABEL;
  window.CAPSTONE.CURRENT_WEEK = CURRENT_WEEK;
  window.CAPSTONE.TOTAL_WEEKS = TOTAL_WEEKS;
  window.CAPSTONE.MIDPOINT_WEEK = MIDPOINT_WEEK;
  window.CAPSTONE.TEAM_PASSWORD = TEAM_PASSWORD;
  window.CAPSTONE.DRIVE_LINK = DRIVE_LINK;
  window.CAPSTONE.RUBRIC_SCORES = RUBRIC_SCORES;
  window.CAPSTONE.memberContribution = memberContribution;
  window.CAPSTONE.teamMetrics = teamMetrics;

  // ── Auth helpers ──
  window.CAPSTONE.supabaseSignIn = async function(email, password) {
    if (!supabase) return { error: new Error('Supabase not configured') };
    return supabase.auth.signInWithPassword({ email, password });
  };
  window.CAPSTONE.supabaseSignOut = async function() {
    if (!supabase) return;
    return supabase.auth.signOut();
  };
  window.CAPSTONE.supabaseGetUser = async function() {
    if (!supabase) return { data: { user: null } };
    return supabase.auth.getUser();
  };

  // ── Init ──
  async function init() {
    // Try Supabase first; if offline or error, fall back to localStorage
    const ok = await loadFromSupabase();
    if (!ok) loadFromLocal();
    setupRealtime();
    emit();
    console.log(`CapTrack DB adapter ready. Mode: ${supabase ? 'ONLINE (Supabase)' : 'OFFLINE (localStorage)'}`);
  }

  init();
})();
