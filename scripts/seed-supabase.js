// CapTrack V2.0 — Seed Script
// Run once locally after creating your Supabase project:
//   node scripts/seed-supabase.js
//
// Prerequisites:
//   npm install @supabase/supabase-js
//
// Env vars (or replace inline):
//   SUPABASE_URL=https://<project>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=<service_role_key>  (NOT the anon key)

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
  console.error('❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.');
  console.error('   Get them from: Supabase Dashboard → Settings → API');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Seed data (mirrors data.js) ──
const TEAMS = [
  {
    id: 'team-01', number: '01',
    title: 'Optimization of a Warehouse using Digital Twin with implementation of ML/AI',
    accent: '#0079BF', progress: 62,
    members: [
      { name: 'Hossain Yousha',         sid: '220012148', role: 'Team Lead', mobile: '01735204680' },
      { name: 'Sabab Anzum Ananto',     sid: '220012146', role: 'Member',    mobile: '01776210150' },
      { name: 'Arpita Semin Sadat',     sid: '220012141', role: 'Member',    mobile: '01714703434' },
      { name: 'Md. Imamim Mubin',       sid: '220012143', role: 'Member',    mobile: '01886645143' },
      { name: 'Safwan Ishmam Bin Anam', sid: '220012164', role: 'Member',    mobile: '01977748280' },
      { name: 'MD. Mohammadul Haque',   sid: '220012157', role: 'Member',    mobile: '01779576060' },
    ],
  },
  {
    id: 'team-02', number: '02',
    title: 'Plastic Waste to Fuel Conversion Using Pyrolysis',
    accent: '#D29034', progress: 71,
    members: [
      { name: 'Nabilah Ahnaf Noshin',   sid: '220012107', role: 'Team Lead', mobile: '01734176457' },
      { name: 'Jakia Yeasmin Prya',     sid: '220012153', role: 'Member',    mobile: '01628583229' },
      { name: 'Sadat Saif Zaman',       sid: '220012129', role: 'Member',    mobile: '01724904997' },
      { name: 'Syed Ahnaf Tahmid Haque','sid: '220012155', role: 'Member',    mobile: '01406485875' },
      { name: 'Md. Nafis Alam',         sid: '220012111', role: 'Member',    mobile: '01790212170' },
      { name: 'Tasnuva Parvez',         sid: '220012149', role: 'Member',    mobile: '01866690075' },
    ],
  },
  {
    id: 'team-03', number: '03',
    title: 'Design and Fabrication of a Contemporary Ergonomic Workstation',
    accent: '#519839', progress: 48,
    members: [
      { name: 'Afra Syara Fyza',        sid: '220012105', role: 'Team Lead', mobile: '01978156746' },
      { name: 'Shah Umme Hani',         sid: '220012123', role: 'Member',    mobile: '01785640753' },
      { name: 'Samira Tabassum Zarin',  sid: '220012137', role: 'Member',    mobile: '01681447006' },
      { name: 'Shekh Adnan Uddin Antu', sid: '220012156', role: 'Member',    mobile: '01319784145' },
      { name: 'Umme Honey Bisma',       sid: '220012165', role: 'Member',    mobile: '01681707040' },
      { name: 'Md. Ahnaf Sabit',        sid: '220012138', role: 'Member',    mobile: '01327265009' },
    ],
  },
  {
    id: 'team-04', number: '04',
    title: 'Automated Water Quality Monitoring and Purification System',
    accent: '#B04632', progress: 55,
    members: [
      { name: 'Md. Nur Mehtab Nehal',   sid: '220012162', role: 'Team Lead', mobile: '01732609752' },
      { name: 'Abdullah Al Roman',      sid: '220012154', role: 'Member',    mobile: '01752565491' },
      { name: 'Md. Atiqur Rahman',      sid: '220012172', role: 'Member',    mobile: '01633769628' },
      { name: 'Tarek Hasan',            sid: '220012127', role: 'Member',    mobile: '01521740145' },
      { name: 'Md. Nurun Nafis Banzir', sid: '220012131', role: 'Member',    mobile: '01741584115' },
      { name: 'Shafayat Zaeem',         sid: '220012115', role: 'Member',    mobile: '01936080366' },
    ],
  },
  {
    id: 'team-05', number: '05',
    title: 'AI Predictive Maintenance CNC Machining for PCB Manufacturing',
    accent: '#89609E', progress: 67,
    members: [
      { name: 'Mustaeen Billah',        sid: '220012114', role: 'Team Lead', mobile: '01341907410' },
      { name: 'Rezwanul Marwa',         sid: '220012144', role: 'Member',    mobile: '01714403025' },
      { name: 'Tahmid Hasan',           sid: '220012147', role: 'Member',    mobile: '01790295596' },
      { name: 'Shah Fattah Faayed',     sid: '220012121', role: 'Member',    mobile: '01971175566' },
      { name: 'Md. Zayed Ahmed',        sid: '220012103', role: 'Member',    mobile: '01795029373' },
      { name: 'Omeo Al-morsalin',       sid: '220012158', role: 'Member',    mobile: '01308500180' },
    ],
  },
];

const AVATAR_COLORS = [
  '#0079BF', '#D29034', '#519839', '#B04632', '#89609E',
  '#CD5A91', '#4BBF6B', '#00AECC', '#838C91', '#E6C60D',
];

function initials(name) {
  return name.replace(/\./g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const TASK_TEMPLATES = {
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

const COMMENTS = {
  'team-01': [], 'team-02': [], 'team-03': [], 'team-04': [], 'team-05': [],
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

async function seed() {
  console.log('🌱 Seeding CapTrack into Supabase...\n');

  // ── Teams & Members ──
  for (const t of TEAMS) {
    const { error: terr } = await supabase.from('teams').upsert({
      id: t.id, number: t.number, title: t.title,
      accent: t.accent, progress: t.progress,
    });
    if (terr) { console.error('Team insert error:', terr); continue; }

    for (let i = 0; i < t.members.length; i++) {
      const m = t.members[i];
      const { error: merr } = await supabase.from('team_members').upsert({
        id: `${t.id}-${m.sid}`,
        team_id: t.id, name: m.name, sid: m.sid, role: m.role, mobile: m.mobile,
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        initials: initials(m.name),
        idx: i,
      });
      if (merr) console.error('Member insert error:', merr);
    }
    console.log(`  ✅ Team ${t.number} + ${t.members.length} members`);
  }

  // ── Tasks ──
  for (const [tid, list] of Object.entries(TASK_TEMPLATES)) {
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const { error } = await supabase.from('tasks').upsert({
        id: `${tid}-t${i + 1}`,
        team_id: tid, title: t.t, status: t.s,
        assignee_idx: t.a, week: t.w, labels: t.l,
        comment_count: ((i * 7) % 4),
        attachment_count: ((i * 3) % 3),
      });
      if (error) console.error('Task insert error:', error);
    }
    console.log(`  ✅ ${list.length} tasks for ${tid}`);
  }

  // ── Files ──
  for (const [tid, list] of Object.entries(FILES)) {
    for (const f of list) {
      const { error } = await supabase.from('files').insert({
        team_id: tid, name: f.name, kind: f.kind, size: f.size,
        week: f.wk, by_idx: f.by, link: f.link || null,
      });
      if (error) console.error('File insert error:', error);
    }
    console.log(`  ✅ ${list.length} files for ${tid}`);
  }

  // ── Comments ──
  for (const [tid, list] of Object.entries(COMMENTS)) {
    // all empty in seed; no-op
    console.log(`  ✅ 0 comments for ${tid}`);
  }

  // ── Meetings ──
  for (const [tid, list] of Object.entries(MEETINGS)) {
    for (const m of list) {
      const { error } = await supabase.from('meetings').insert({
        team_id: tid, week: m.wk, title: m.title,
        attendees: m.attendees, decisions: m.decisions,
      });
      if (error) console.error('Meeting insert error:', error);
    }
    console.log(`  ✅ ${list.length} meetings for ${tid}`);
  }

  // ── Auth Users (teams + supervisor) ──
  const authUsers = [
    { email: 'team01@captrack.local', password: 'capstone2026', team_id: 'team-01', role: 'team' },
    { email: 'team02@captrack.local', password: 'capstone2026', team_id: 'team-02', role: 'team' },
    { email: 'team03@captrack.local', password: 'capstone2026', team_id: 'team-03', role: 'team' },
    { email: 'team04@captrack.local', password: 'capstone2026', team_id: 'team-04', role: 'team' },
    { email: 'team05@captrack.local', password: 'capstone2026', team_id: 'team-05', role: 'team' },
    { email: 'supervisor@captrack.local', password: 'supervisor', team_id: null, role: 'supervisor' },
  ];
  for (const u of authUsers) {
    const { error: aerr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { team_id: u.team_id, role: u.role },
    });
    if (aerr) {
      if (aerr.message.includes('already been registered')) {
        console.log(`  ⚠️  Auth user ${u.email} already exists`);
      } else {
        console.error('Auth user error:', aerr);
      }
    } else {
      console.log(`  ✅ Auth user ${u.email} (${u.role})`);
    }
  }

  console.log('\n🎉 Seed complete.');
}

seed().catch(console.error);
