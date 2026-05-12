const fs = require('fs');

const TEAMS = [
  {
    id: 'team-01', number: '01', title: 'Digital Twin for Warehouse Opt',
    accent: '#0079BF', progress: 85, password: 'capstone2026',
    members: [
      { name: 'Khondakar Mujtaba Tahmid', sid: '220012117', role: 'Team Lead', mobile: '01533160416' },
      { name: 'Khandker Jami-Uz Zaman',   sid: '220012101', role: 'Member',    mobile: '01859664551' },
      { name: 'Sayed Mohammad Rejwan',    sid: '220012143', role: 'Member',    mobile: '01683411440' },
      { name: 'Ashrarul Haque',           sid: '220012130', role: 'Member',    mobile: '01300057062' },
      { name: 'Arafat Bin Hossain',       sid: '220012131', role: 'Member',    mobile: '01712613531' },
      { name: 'Mahdi Haider Bin Mosharaf',sid: '220012163', role: 'Member',    mobile: '01518349258' },
    ],
  },
  {
    id: 'team-02', number: '02', title: 'Pyrolysis Reactor Optimization',
    accent: '#EB5A46', progress: 42, password: 'capstone2026',
    members: [
      { name: 'Ashfakul Islam Tihami',    sid: '220012102', role: 'Team Lead', mobile: '01712345678' },
      { name: 'A.H.M. Fardil',            sid: '220012114', role: 'Member',    mobile: '01723456789' },
      { name: 'Md. Safi-Al-Tajrian',      sid: '220012142', role: 'Member',    mobile: '01734567890' },
      { name: 'M. S. Zaber',              sid: '220012144', role: 'Member',    mobile: '01745678901' },
      { name: 'Miraz Hossain',            sid: '220012161', role: 'Member',    mobile: '01756789012' },
      { name: 'A K M Faysal',             sid: '220012154', role: 'Member',    mobile: '01767890123' },
    ],
  },
  {
    id: 'team-03', number: '03', title: 'Ergonomic Workstation Redesign',
    accent: '#61BD4F', progress: 15, password: 'capstone2026',
    members: [
      { name: 'Shahrier Mahmud',          sid: '220012122', role: 'Team Lead', mobile: '01812345678' },
      { name: 'Md. Ishtiaque Morshed',    sid: '220012128', role: 'Member',    mobile: '01823456789' },
      { name: 'Mashrur Ahmed',            sid: '220012123', role: 'Member',    mobile: '01834567890' },
      { name: 'Rayan Ahmed',              sid: '220012124', role: 'Member',    mobile: '01845678901' },
      { name: 'Farhan Ishrak',            sid: '220012125', role: 'Member',    mobile: '01856789012' },
      { name: 'Anindo Podder',            sid: '220012126', role: 'Member',    mobile: '01867890123' },
    ],
  },
  {
    id: 'team-04', number: '04', title: 'IoT Water Purification Setup',
    accent: '#C377E0', progress: 92, password: 'capstone2026',
    members: [
      { name: 'Fabiha Binte Rahman',    sid: '220012120', role: 'Team Lead', mobile: '01511111111' },
      { name: 'Anika Tabassum',         sid: '220012110', role: 'Member',    mobile: '01522222222' },
      { name: 'Sanjida Akter',          sid: '220012115', role: 'Member',    mobile: '01533333333' },
      { name: 'Sumaiya Binte Hossain',  sid: '220012118', role: 'Member',    mobile: '01544444444' },
      { name: 'Sadia Afrin',            sid: '220012135', role: 'Member',    mobile: '01555555555' },
      { name: 'Nusrat Jahan',           sid: '220012140', role: 'Member',    mobile: '01566666666' },
    ],
  },
  {
    id: 'team-05', number: '05', title: 'Predictive Maintenance via AI',
    accent: '#D29034', progress: 71, password: 'capstone2026',
    members: [
      { name: 'Nabilah Ahnaf Noshin',   sid: '220012107', role: 'Team Lead', mobile: '01734176457' },
      { name: 'Jakia Yeasmin Prya',     sid: '220012153', role: 'Member',    mobile: '01628583229' },
      { name: 'Sadat Saif Zaman',       sid: '220012129', role: 'Member',    mobile: '01724904997' },
      { name: 'Syed Ahnaf Tahmid Haque',sid: '220012155', role: 'Member',    mobile: '01406485875' },
      { name: 'Md. Nafis Alam',         sid: '220012111', role: 'Member',    mobile: '01790212170' },
      { name: 'Tasnuva Parvez',         sid: '220012149', role: 'Member',    mobile: '01866690075' },
      { name: 'Shekh Adnan Uddin Antu', sid: '220012156', role: 'Member',    mobile: '01319784145' },
      { name: 'Umme Honey Bisma',       sid: '220012165', role: 'Member',    mobile: '01681707040' },
      { name: 'Md. Ahnaf Sabit',        sid: '220012138', role: 'Member',    mobile: '01327265009' },
    ],
  },
];

const AVATAR_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#6366F1', '#A855F7', '#EC4899'];

const TASK_TEMPLATES = {
  'team-01': [
    { t: 'Literature review — Discrete Event Simulation',       s: 'done',   a: 1, w: 2,  l: ['research'] },
    { t: 'Collect warehouse layout & flow data',                s: 'done',   a: 2, w: 5,  l: ['fieldwork'] },
    { t: 'Map existing value stream (VSM)',                     s: 'done',   a: 0, w: 7,  l: ['design'] },
    { t: 'Proposal defense',                                    s: 'done',   a: 0, w: 11, l: ['defense'] },
    { t: 'Build baseline FlexSim model',                        s: 'done',   a: 3, w: 14, l: ['software'] },
    { t: 'Model validation vs historical throughput',           s: 'done',   a: 4, w: 16, l: ['data'] },
    { t: 'Draft AGV routing scenarios',                         s: 'review', a: 5, w: 18, l: ['design'] },
    { t: 'Run scenario analysis (5 bots vs 10 bots)',           s: 'doing',  a: 3, w: 18, l: ['software'] },
    { t: 'Calculate ROI for optimal layout',                    s: 'todo',   a: 1, w: 22, l: ['report'] },
    { t: 'Final presentation prep',                             s: 'todo',   a: 0, w: 26, l: ['deliverable'] },
    { t: 'Submit thesis draft',                                 s: 'todo',   a: 2, w: 28, l: ['report'] },
  ],
  'team-02': [
    { t: 'Literature review — LDPE Pyrolysis',                  s: 'done',   a: 1, w: 3,  l: ['research'] },
    { t: 'Lab safety clearance',                                s: 'done',   a: 0, w: 4,  l: ['admin'] },
    { t: 'Procure reactor vessel & PID controller',             s: 'done',   a: 2, w: 7,  l: ['procurement'] },
    { t: 'Proposal defense',                                    s: 'done',   a: 0, w: 12, l: ['defense'] },
    { t: 'Assemble heating mantle & condenser',                 s: 'done',   a: 3, w: 14, l: ['build'] },
    { t: 'Leak testing with inert gas (N2)',                    s: 'done',   a: 4, w: 15, l: ['hardware'] },
    { t: 'First batch test (LDPE at 400°C)',                    s: 'review', a: 5, w: 17, l: ['fieldwork'] },
    { t: 'GC-MS analysis of oil sample #1',                     s: 'doing',  a: 1, w: 18, l: ['data'] },
    { t: 'Optimize temperature ramp rate',                      s: 'todo',   a: 3, w: 20, l: ['design'] },
    { t: 'Scale up batch size to 500g',                         s: 'todo',   a: 4, w: 23, l: ['build'] },
    { t: 'Final report compilation',                            s: 'todo',   a: 0, w: 27, l: ['report'] },
  ],
  'team-03': [
    { t: 'Literature review — RULA & REBA methodologies',       s: 'done',   a: 1, w: 2,  l: ['research'] },
    { t: 'Identify target manufacturing plant',                 s: 'done',   a: 2, w: 4,  l: ['admin'] },
    { t: 'Initial video capture of operator postures',          s: 'done',   a: 3, w: 6,  l: ['fieldwork'] },
    { t: 'Proposal defense',                                    s: 'done',   a: 0, w: 12, l: ['defense'] },
    { t: 'Analyze posture data (baseline RULA score)',          s: 'done',   a: 4, w: 15, l: ['data'] },
    { t: 'Identify high-risk bottlenecks',                      s: 'done',   a: 5, w: 16, l: ['design'] },
    { t: 'Draft new CAD layout for workstation',                s: 'review', a: 1, w: 18, l: ['design'] },
    { t: 'Fabricate 1:1 scale cardboard mockup',                s: 'doing',  a: 2, w: 19, l: ['build'] },
    { t: 'Operator feedback on mockup',                         s: 'todo',   a: 3, w: 21, l: ['fieldwork'] },
    { t: 'Cost-benefit analysis of redesign',                   s: 'todo',   a: 4, w: 25, l: ['report'] },
    { t: 'Final presentation prep',                             s: 'todo',   a: 0, w: 27, l: ['deliverable'] },
  ],
  'team-04': [
    { t: 'Literature review — Low-cost IoT water sensing',      s: 'done',   a: 1, w: 2,  l: ['research'] },
    { t: 'Site visit: Savar industrial effluent drain',         s: 'done',   a: 2, w: 5,  l: ['fieldwork'] },
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

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function escape(str) {
  if (!str) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

function generateSQL() {
  let sql = 'BEGIN;\n\n';

  // Teams
  for (const t of TEAMS) {
    sql += `INSERT INTO teams (id, number, title, accent, progress, password) VALUES (${escape(t.id)}, ${escape(t.number)}, ${escape(t.title)}, ${escape(t.accent)}, ${t.progress}, ${escape(t.password)}) ON CONFLICT (id) DO NOTHING;\n`;

    for (let i = 0; i < t.members.length; i++) {
      const m = t.members[i];
      const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
      const ini = initials(m.name);
      sql += `INSERT INTO team_members (id, team_id, name, sid, role, mobile, color, initials, idx) VALUES (${escape(t.id + '-' + m.sid)}, ${escape(t.id)}, ${escape(m.name)}, ${escape(m.sid)}, ${escape(m.role)}, ${escape(m.mobile)}, ${escape(color)}, ${escape(ini)}, ${i}) ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  // Tasks
  for (const [tid, list] of Object.entries(TASK_TEMPLATES)) {
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const id = `${tid}-t${i + 1}`;
      const labels = `'{${t.l.map(l => `"${l}"`).join(',')}}'`;
      const cc = ((i * 7) % 4);
      const ac = ((i * 3) % 3);
      sql += `INSERT INTO tasks (id, team_id, title, status, assignee_idx, week, labels, comment_count, attachment_count) VALUES (${escape(id)}, ${escape(tid)}, ${escape(t.t)}, ${escape(t.s)}, ${t.a}, ${t.w}, ${labels}, ${cc}, ${ac}) ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  // Files
  for (const [tid, list] of Object.entries(FILES)) {
    for (const f of list) {
      sql += `INSERT INTO files (team_id, name, kind, size, week, by_idx, link) VALUES (${escape(tid)}, ${escape(f.name)}, ${escape(f.kind)}, ${escape(f.size)}, ${f.wk}, ${f.by}, ${escape(f.link || '')});\n`;
    }
  }

  // Meetings
  for (const [tid, list] of Object.entries(MEETINGS)) {
    for (const m of list) {
      sql += `INSERT INTO meetings (team_id, week, title, attendees, decisions) VALUES (${escape(tid)}, ${m.wk}, ${escape(m.title)}, ${m.attendees}, ${m.decisions});\n`;
    }
  }

  sql += '\nCOMMIT;\n';
  fs.writeFileSync('seed.sql', sql);
  console.log('SQL generated successfully.');
}

generateSQL();
