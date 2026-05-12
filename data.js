// Seed data for the Capstone Progress Tracker
// All 5 IPE teams from the registration document, with simulated weekly progress

// Single shared password for all student teams. Easy to remember, tied to the year.
const TEAM_PASSWORD = 'capstone2026';

// Shared Google Drive folder where teams upload their files.
// (Standard /drive/folders/ format — the /drive/project/ URL doesn't open reliably.)
const DRIVE_LINK = 'https://drive.google.com/drive/folders/1a-cYelRQNGNbx0K2I0zfO3asZ72HWAmC?usp=sharing';

const SUPERVISOR = {
  id: 'sup1',
  name: 'Dr. Md. Abu Shaid Sujon',
  role: 'Capstone Supervisor',
  email: 'shaid.sujon@iut-dhaka.edu',
};

// Avatar palette — Trello-ish
const AVATAR_COLORS = [
  '#0079BF', '#D29034', '#519839', '#B04632', '#89609E',
  '#CD5A91', '#4BBF6B', '#00AECC', '#838C91', '#E6C60D',
];

function initials(name) {
  return name
    .replace(/\./g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

function mkMember(idx, name, sid, role, mobile) {
  return {
    id: sid,
    name: name.replace(/\s+/g, ' ').trim(),
    sid,
    role,
    mobile,
    initials: initials(name),
    color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
  };
}

const TEAMS = [
  {
    id: 'team-01',
    number: '01',
    title: 'Optimization of a Warehouse using Digital Twin with implementation of ML/AI',
    password: TEAM_PASSWORD,
    accent: '#0079BF',
    progress: 62,
    members: [
      mkMember(0, 'Hossain Yousha',         '220012148', 'Team Lead', '01735204680'),
      mkMember(1, 'Sabab Anzum Ananto',     '220012146', 'Member',    '01776210150'),
      mkMember(2, 'Arpita Semin Sadat',     '220012141', 'Member',    '01714703434'),
      mkMember(3, 'Md. Imamim Mubin',       '220012143', 'Member',    '01886645143'),
      mkMember(4, 'Safwan Ishmam Bin Anam', '220012164', 'Member',    '01977748280'),
      mkMember(5, 'MD. Mohammadul Haque',   '220012157', 'Member',    '01779576060'),
    ],
  },
  {
    id: 'team-02',
    number: '02',
    title: 'Plastic Waste to Fuel Conversion Using Pyrolysis',
    password: TEAM_PASSWORD,
    accent: '#D29034',
    progress: 71,
    members: [
      mkMember(0, 'Nabilah Ahnaf Noshin',   '220012107', 'Team Lead', '01734176457'),
      mkMember(1, 'Jakia Yeasmin Prya',     '220012153', 'Member',    '01628583229'),
      mkMember(2, 'Sadat Saif Zaman',       '220012129', 'Member',    '01724904997'),
      mkMember(3, 'Syed Ahnaf Tahmid Haque','220012155', 'Member',    '01406485875'),
      mkMember(4, 'Md. Nafis Alam',         '220012111', 'Member',    '01790212170'),
      mkMember(5, 'Tasnuva Parvez',         '220012149', 'Member',    '01866690075'),
    ],
  },
  {
    id: 'team-03',
    number: '03',
    title: 'Design and Fabrication of a Contemporary Ergonomic Workstation',
    password: TEAM_PASSWORD,
    accent: '#519839',
    progress: 48,
    members: [
      mkMember(0, 'Afra Syara Fyza',        '220012105', 'Team Lead', '01978156746'),
      mkMember(1, 'Shah Umme Hani',         '220012123', 'Member',    '01785640753'),
      mkMember(2, 'Samira Tabassum Zarin',  '220012137', 'Member',    '01681447006'),
      mkMember(3, 'Shekh Adnan Uddin Antu', '220012156', 'Member',    '01319784145'),
      mkMember(4, 'Umme Honey Bisma',       '220012165', 'Member',    '01681707040'),
      mkMember(5, 'Md. Ahnaf Sabit',        '220012138', 'Member',    '01327265009'),
    ],
  },
  {
    id: 'team-04',
    number: '04',
    title: 'Automated Water Quality Monitoring and Purification System',
    password: TEAM_PASSWORD,
    accent: '#B04632',
    progress: 55,
    members: [
      mkMember(0, 'Md. Nur Mehtab Nehal',   '220012162', 'Team Lead', '01732609752'),
      mkMember(1, 'Abdullah Al Roman',      '220012154', 'Member',    '01752565491'),
      mkMember(2, 'Md. Atiqur Rahman',      '220012172', 'Member',    '01633769628'),
      mkMember(3, 'Tarek Hasan',            '220012127', 'Member',    '01521740145'),
      mkMember(4, 'Md. Nurun Nafis Banzir', '220012131', 'Member',    '01741584115'),
      mkMember(5, 'Shafayat Zaeem',         '220012115', 'Member',    '01936080366'),
    ],
  },
  {
    id: 'team-05',
    number: '05',
    title: 'AI Predictive Maintenance CNC Machining for PCB Manufacturing',
    password: TEAM_PASSWORD,
    accent: '#89609E',
    progress: 67,
    members: [
      mkMember(0, 'Mustaeen Billah',        '220012114', 'Team Lead', '01341907410'),
      mkMember(1, 'Rezwanul Marwa',         '220012144', 'Member',    '01714403025'),
      mkMember(2, 'Tahmid Hasan',           '220012147', 'Member',    '01790295596'),
      mkMember(3, 'Shah Fattah Faayed',     '220012121', 'Member',    '01971175566'),
      mkMember(4, 'Md. Zayed Ahmed',        '220012103', 'Member',    '01795029373'),
      mkMember(5, 'Omeo Al-morsalin',       '220012158', 'Member',    '01308500180'),
    ],
  },
];

// 28-week timeline (2 semesters × 14 weeks). Current week = 18 (mid Sem 2).
const CURRENT_WEEK = 18;
const TOTAL_WEEKS  = 28;
const MIDPOINT_WEEK = 14;

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

// Per-team task seeds. Each task: id, title, status, assignee (member id), week, labels, dueIn (days), comments.
const TASK_TEMPLATES = {
  // Team 01 — Warehouse Digital Twin with ML/AI
  'team-01': [
    { t: 'Literature review — digital twin in warehousing',     s: 'done',   a: 1, w: 3,  l: ['research'] },
    { t: 'Partner warehouse site visit & layout capture',       s: 'done',   a: 0, w: 4,  l: ['fieldwork'] },
    { t: 'Define KPIs (throughput, picking time, utilisation)', s: 'done',   a: 2, w: 6,  l: ['analysis'] },
    { t: 'Historical order & SKU dataset extraction',           s: 'done',   a: 3, w: 7,  l: ['data'] },
    { t: 'Proposal defense slide deck',                         s: 'done',   a: 0, w: 12, l: ['defense'] },
    { t: 'Mid-term progress report',                            s: 'done',   a: 4, w: 14, l: ['report'] },
    { t: '3D warehouse model in Unity / FlexSim',               s: 'review', a: 2, w: 16, l: ['simulation'] },
    { t: 'Sensor data ingestion pipeline',                      s: 'review', a: 3, w: 17, l: ['software'] },
    { t: 'ML demand-forecasting model (XGBoost baseline)',      s: 'doing',  a: 5, w: 18, l: ['ml'] },
    { t: 'Slotting optimisation algorithm',                     s: 'doing',  a: 4, w: 18, l: ['analysis'] },
    { t: 'Twin ↔ live data sync prototype',                     s: 'doing',  a: 0, w: 19, l: ['software'] },
    { t: 'AGV path-planning RL experiments',                    s: 'todo',   a: 1, w: 20, l: ['ml'] },
    { t: 'What-if scenario dashboard',                          s: 'todo',   a: 2, w: 21, l: ['deliverable'] },
    { t: 'Final report — Chapter 4 (Results)',                  s: 'todo',   a: 0, w: 25, l: ['report'] },
  ],
  // Team 02 — Plastic Waste to Fuel via Pyrolysis
  'team-02': [
    { t: 'Lit review — pyrolysis of mixed plastic waste',       s: 'done',   a: 1, w: 2,  l: ['research'] },
    { t: 'Reactor BoM (steel chamber, condenser, heater)',      s: 'done',   a: 2, w: 5,  l: ['hardware'] },
    { t: 'Vendor quotes & procurement',                         s: 'done',   a: 0, w: 7,  l: ['procurement'] },
    { t: 'Feedstock collection & sorting protocol',             s: 'done',   a: 3, w: 9,  l: ['fieldwork'] },
    { t: 'Proposal defense',                                    s: 'done',   a: 0, w: 12, l: ['defense'] },
    { t: 'Reactor fabrication & leak test',                     s: 'done',   a: 4, w: 15, l: ['hardware'] },
    { t: 'Temperature controller & thermocouples wired',        s: 'done',   a: 5, w: 17, l: ['hardware'] },
    { t: 'First batch run — LDPE @ 400 °C',                     s: 'review', a: 3, w: 18, l: ['testing'] },
    { t: 'Condensate yield characterisation',                   s: 'doing',  a: 4, w: 18, l: ['analysis'] },
    { t: 'Catalyst trials (zeolite vs bentonite)',              s: 'doing',  a: 1, w: 19, l: ['testing'] },
    { t: 'Off-gas composition analysis',                        s: 'doing',  a: 2, w: 19, l: ['testing'] },
    { t: 'Fuel quality benchmarking vs diesel',                 s: 'todo',   a: 5, w: 21, l: ['testing'] },
    { t: 'Cost & emissions analysis',                           s: 'todo',   a: 0, w: 23, l: ['analysis'] },
    { t: 'Final report draft',                                  s: 'todo',   a: 0, w: 26, l: ['report'] },
  ],
  // Team 03 — Ergonomic Workstation
  'team-03': [
    { t: 'Lit review — RULA, REBA, OWAS methods',               s: 'done',   a: 1, w: 3,  l: ['research'] },
    { t: 'Partner industry onboarding',                         s: 'done',   a: 0, w: 5,  l: ['fieldwork'] },
    { t: 'Anthropometric survey — 40 workers',                  s: 'done',   a: 2, w: 8,  l: ['data'] },
    { t: 'Postural assessment with RULA',                       s: 'done',   a: 3, w: 10, l: ['analysis'] },
    { t: 'Proposal defense',                                    s: 'done',   a: 0, w: 13, l: ['defense'] },
    { t: 'Pain-point heatmap by station',                       s: 'review', a: 4, w: 15, l: ['analysis'] },
    { t: 'CAD redesign — adjustable workstation',               s: 'doing',  a: 5, w: 18, l: ['design'] },
    { t: 'Workshop — operator co-design session',               s: 'doing',  a: 0, w: 19, l: ['fieldwork'] },
    { t: 'Fabrication of adjustable seat & frame',              s: 'todo',   a: 3, w: 21, l: ['build'] },
    { t: 'Validation trial with workers',                       s: 'todo',   a: 1, w: 24, l: ['testing'] },
    { t: 'Cost & ROI estimation',                               s: 'todo',   a: 2, w: 25, l: ['analysis'] },
    { t: 'Final report',                                        s: 'todo',   a: 0, w: 27, l: ['report'] },
  ],
  // Team 04 — Automated Water Quality Monitoring & Purification
  'team-04': [
    { t: 'Lit review — water-quality sensing & purification',   s: 'done',   a: 1, w: 3,  l: ['research'] },
    { t: 'Source water sampling at 3 sites',                    s: 'done',   a: 2, w: 6,  l: ['fieldwork'] },
    { t: 'Sensor selection (pH, TDS, turbidity, ORP)',          s: 'done',   a: 3, w: 9,  l: ['hardware'] },
    { t: 'Proposal defense',                                    s: 'done',   a: 0, w: 13, l: ['defense'] },
    { t: 'Sensor integration with ESP32 + cloud logging',       s: 'done',   a: 4, w: 16, l: ['hardware'] },
    { t: 'Filter stack design (sand → carbon → UV)',            s: 'review', a: 5, w: 17, l: ['design'] },
    { t: 'Purification rig assembly',                           s: 'doing',  a: 3, w: 18, l: ['build'] },
    { t: 'Threshold-based auto-dosing logic',                   s: 'doing',  a: 4, w: 19, l: ['software'] },
    { t: 'Live monitoring dashboard',                           s: 'todo',   a: 0, w: 21, l: ['deliverable'] },
    { t: 'Field validation at partner site',                    s: 'todo',   a: 1, w: 24, l: ['fieldwork'] },
    { t: 'Final report',                                        s: 'todo',   a: 0, w: 27, l: ['report'] },
  ],
  // Team 05 — AI Predictive Maintenance for CNC PCB Machining
  'team-05': [
    { t: 'Lit review — PdM for CNC & PCB processes',            s: 'done',   a: 1, w: 3,  l: ['research'] },
    { t: 'CNC test bench design (spindle + accelerometer)',     s: 'done',   a: 2, w: 7,  l: ['design'] },
    { t: 'Procure sensors & DAQ (vibration, current, acoustic)',s: 'done',   a: 0, w: 9,  l: ['procurement'] },
    { t: 'Proposal defense',                                    s: 'done',   a: 0, w: 12, l: ['defense'] },
    { t: 'Bench assembly & baseline machining runs',            s: 'done',   a: 3, w: 15, l: ['hardware'] },
    { t: 'Seeded fault dataset (tool wear, misalignment)',      s: 'done',   a: 4, w: 17, l: ['data'] },
    { t: 'FFT + RMS feature extraction pipeline',               s: 'review', a: 5, w: 18, l: ['software'] },
    { t: 'CNN/LSTM classifier — first training run',            s: 'doing',  a: 5, w: 18, l: ['ml'] },
    { t: 'Edge deployment on Raspberry Pi',                     s: 'doing',  a: 2, w: 20, l: ['hardware'] },
    { t: 'PCB drilling trial with live PdM alerts',             s: 'todo',   a: 0, w: 23, l: ['fieldwork'] },
    { t: 'Final report',                                        s: 'todo',   a: 0, w: 27, l: ['report'] },
  ],
};

// Files / docs uploaded per team. Each file may carry a `link` (Google Drive,
// Dropbox, GitHub, etc.) — students paste the share URL when uploading.
const FILES = {
  'team-01': [
    { name: 'Warehouse_DT_LitReview.pdf', kind: 'pdf', size: '2.4 MB', wk: 3,  by: 1, link: '' },
    { name: 'Site_Layout_Capture.png',    kind: 'img', size: '1.1 MB', wk: 4,  by: 2, link: '' },
    { name: 'SKU_Order_Dataset.xlsx',     kind: 'xls', size: '480 KB', wk: 7,  by: 3, link: '' },
    { name: 'Proposal_Slides.pptx',       kind: 'ppt', size: '5.8 MB', wk: 12, by: 0, link: '' },
    { name: 'MidTerm_Report.pdf',         kind: 'pdf', size: '3.2 MB', wk: 14, by: 4, link: '' },
    { name: 'FlexSim_Twin_Model.fsm',     kind: 'sim', size: '210 KB', wk: 18, by: 5, link: '' },
  ],
  'team-02': [
    { name: 'Pyrolysis_LitReview.pdf',    kind: 'pdf', size: '2.1 MB', wk: 2,  by: 1, link: '' },
    { name: 'Reactor_BoM_v2.xlsx',        kind: 'xls', size: '95 KB',  wk: 5,  by: 2, link: '' },
    { name: 'Reactor_CAD.dwg',            kind: 'cad', size: '1.3 MB', wk: 9,  by: 3, link: '' },
    { name: 'Proposal_Defense.pptx',      kind: 'ppt', size: '6.4 MB', wk: 12, by: 0, link: '' },
    { name: 'Batch01_LDPE_Run.csv',       kind: 'csv', size: '320 KB', wk: 18, by: 4, link: '' },
    { name: 'Yield_Chromatograph.png',    kind: 'img', size: '740 KB', wk: 18, by: 5, link: '' },
  ],
  'team-03': [
    { name: 'RULA_REBA_Notes.pdf',        kind: 'pdf', size: '1.8 MB', wk: 3,  by: 1, link: '' },
    { name: 'Anthropometric_Data.xlsx',   kind: 'xls', size: '310 KB', wk: 8,  by: 2, link: '' },
    { name: 'Postural_Heatmap.png',       kind: 'img', size: '980 KB', wk: 15, by: 4, link: '' },
    { name: 'Workstation_Redesign.dwg',   kind: 'cad', size: '1.4 MB', wk: 18, by: 5, link: '' },
  ],
  'team-04': [
    { name: 'WaterQuality_LitReview.pdf', kind: 'pdf', size: '2.6 MB', wk: 3,  by: 1, link: '' },
    { name: 'Site_Sample_Results.xlsx',   kind: 'xls', size: '210 KB', wk: 6,  by: 2, link: '' },
    { name: 'Sensor_Wiring_Diagram.png',  kind: 'img', size: '880 KB', wk: 9,  by: 3, link: '' },
    { name: 'Filter_Stack_CAD.dwg',       kind: 'cad', size: '1.1 MB', wk: 17, by: 5, link: '' },
    { name: 'Live_Telemetry_Log.csv',     kind: 'csv', size: '1.7 MB', wk: 18, by: 4, link: '' },
  ],
  'team-05': [
    { name: 'CNC_PdM_LitReview.pdf',      kind: 'pdf', size: '2.0 MB', wk: 3,  by: 1, link: '' },
    { name: 'CNC_TestBench.dwg',          kind: 'cad', size: '1.6 MB', wk: 7,  by: 2, link: '' },
    { name: 'Baseline_Vibration.csv',     kind: 'csv', size: '4.2 MB', wk: 15, by: 3, link: '' },
    { name: 'Fault_Dataset.zip',          kind: 'zip', size: '38 MB',  wk: 17, by: 4, link: '' },
    { name: 'CNN_Training_Notebook.ipynb',kind: 'code',size: '720 KB', wk: 18, by: 5, link: '' },
  ],
};

// Supervisor comments per team — intentionally blank.
// Supervisor adds feedback live from the dashboard.
const COMMENTS = {
  'team-01': [],
  'team-02': [],
  'team-03': [],
  'team-04': [],
  'team-05': [],
};

// Meeting minutes per team
const MEETINGS = {
  'team-01': [
    { wk: 4,  title: 'Site visit debrief', attendees: 6, decisions: 3 },
    { wk: 11, title: 'Pre-defense rehearsal', attendees: 6, decisions: 5 },
    { wk: 17, title: 'Sim model planning', attendees: 5, decisions: 4 },
  ],
  'team-02': [
    { wk: 5,  title: 'Vendor selection', attendees: 6, decisions: 2 },
    { wk: 11, title: 'Pre-defense rehearsal', attendees: 6, decisions: 4 },
    { wk: 18, title: 'Calibration plan', attendees: 6, decisions: 3 },
  ],
  'team-03': [
    { wk: 8,  title: 'Survey design', attendees: 6, decisions: 4 },
    { wk: 13, title: 'Pre-defense rehearsal', attendees: 5, decisions: 3 },
    { wk: 18, title: 'CAD review', attendees: 4, decisions: 2 },
  ],
  'team-04': [
    { wk: 6,  title: 'Distributor interview prep', attendees: 6, decisions: 3 },
    { wk: 13, title: 'Pre-defense rehearsal', attendees: 6, decisions: 4 },
    { wk: 18, title: 'Sim framework kickoff', attendees: 5, decisions: 3 },
  ],
  'team-05': [
    { wk: 7,  title: 'Rig procurement', attendees: 6, decisions: 4 },
    { wk: 11, title: 'Pre-defense rehearsal', attendees: 6, decisions: 5 },
    { wk: 18, title: 'CNN architecture review', attendees: 6, decisions: 3 },
  ],
};

// Build full task objects with stable ids and comment counts
function buildTasks() {
  const out = {};
  for (const [tid, list] of Object.entries(TASK_TEMPLATES)) {
    out[tid] = list.map((t, i) => ({
      id: `${tid}-t${i + 1}`,
      title: t.t,
      status: t.s,
      assigneeIdx: t.a,
      week: t.w,
      labels: t.l,
      commentCount: ((i * 7) % 4),       // 0..3
      attachmentCount: ((i * 3) % 3),     // 0..2
    }));
  }
  return out;
}

const TASKS = buildTasks();

// Compute per-member contribution % within a team based on task counts (weighted: done=3, doing=2, review=2, todo=1)
function memberContribution(team) {
  const weights = { todo: 1, doing: 2, review: 2, done: 3 };
  const total = team.members.map(() => 0);
  let sum = 0;
  for (const t of TASKS[team.id]) {
    const w = weights[t.status];
    total[t.assigneeIdx] += w;
    sum += w;
  }
  return team.members.map((m, i) => ({
    member: m,
    pct: sum ? Math.round((total[i] / sum) * 100) : 0,
    raw: total[i],
  }));
}

function teamMetrics(team) {
  const tasks = TASKS[team.id];
  const counts = { todo: 0, doing: 0, review: 0, done: 0 };
  for (const t of tasks) counts[t.status]++;
  const done = counts.done;
  const total = tasks.length;
  const completion = total ? Math.round((done / total) * 100) : 0;
  return { ...counts, total, completion };
}

// ----- Persistence layer (localStorage) -----
const STORAGE_KEY = 'captrack-data-v3';
const RUBRIC_SCORES = {};

function saveAll() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      TASKS, FILES, COMMENTS, MEETINGS,
      TEAMS: TEAMS.map(t => ({
        id: t.id, number: t.number, title: t.title,
        password: t.password, accent: t.accent, progress: t.progress,
        members: t.members,
      })),
      SUPERVISOR,
      DRIVE_LINK_OVERRIDE: window.CAPSTONE && window.CAPSTONE.DRIVE_LINK !== DRIVE_LINK ? window.CAPSTONE.DRIVE_LINK : null,
      RUBRIC_SCORES,
    }));
  } catch (e) { console.warn('save failed', e); }
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const o = JSON.parse(raw);
    if (o.TASKS)    Object.keys(o.TASKS).forEach(k => { TASKS[k] = o.TASKS[k]; });
    if (o.FILES)    Object.keys(o.FILES).forEach(k => { FILES[k] = o.FILES[k]; });
    if (o.COMMENTS) Object.keys(o.COMMENTS).forEach(k => { COMMENTS[k] = o.COMMENTS[k]; });
    if (o.MEETINGS) Object.keys(o.MEETINGS).forEach(k => { MEETINGS[k] = o.MEETINGS[k]; });
    if (o.TEAMS) {
      o.TEAMS.forEach(saved => {
        const t = TEAMS.find(x => x.id === saved.id);
        if (t) Object.assign(t, saved);
      });
    }
    if (o.SUPERVISOR) Object.assign(SUPERVISOR, o.SUPERVISOR);
    if (o.RUBRIC_SCORES) Object.assign(RUBRIC_SCORES, o.RUBRIC_SCORES);
    if (o.DRIVE_LINK_OVERRIDE) window._driveOverride = o.DRIVE_LINK_OVERRIDE;
  } catch (e) { console.warn('load failed', e); }
}

loadAll();

function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

window.CAPSTONE = {
  SUPERVISOR, TEAMS, TASKS, FILES, COMMENTS, MEETINGS,
  PHASES, STATUS, STATUS_LABEL,
  CURRENT_WEEK, TOTAL_WEEKS, MIDPOINT_WEEK,
  TEAM_PASSWORD,
  DRIVE_LINK: window._driveOverride || DRIVE_LINK,
  RUBRIC_SCORES,
  memberContribution, teamMetrics,
  save: saveAll, reset: resetAll,
};
