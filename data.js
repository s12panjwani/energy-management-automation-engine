// ──────────────────────────────────────────────────────────────
//  CIRCLE AI — INTELLIGENT ENERGY MANAGEMENT
//  Mock Data Layer
// ──────────────────────────────────────────────────────────────

const DATA = {

  billingBatches: [
    { id:'BB-MAY-001', circle:'Maharashtra', sites:312, eb:4.2, dg:1.8, total:6.0, verdict:'Clean', status:'Approved' },
    { id:'BB-MAY-002', circle:'Delhi',       sites:198, eb:3.1, dg:0.9, total:4.0, verdict:'Outlier Detected', status:'Flagged' },
    { id:'BB-MAY-003', circle:'Karnataka',   sites:247, eb:3.8, dg:1.4, total:5.2, verdict:'Clean', status:'Approved' },
    { id:'BB-MAY-004', circle:'Tamil Nadu',  sites:183, eb:2.9, dg:1.2, total:4.1, verdict:'Rate Anomaly', status:'Flagged' },
    { id:'BB-MAY-005', circle:'Gujarat',     sites:221, eb:3.5, dg:0.7, total:4.2, verdict:'Clean', status:'Pending' },
    { id:'BB-MAY-006', circle:'Rajasthan',   sites:156, eb:2.2, dg:1.6, total:3.8, verdict:'DG Mismatch', status:'Flagged' },
    { id:'BB-MAY-007', circle:'UP East',     sites:289, eb:4.6, dg:2.1, total:6.7, verdict:'Clean', status:'Approved' },
    { id:'BB-MAY-008', circle:'AP',          sites:174, eb:2.8, dg:0.9, total:3.7, verdict:'Clean', status:'Pending' },
    { id:'BB-MAY-009', circle:'Odisha',      sites:141, eb:2.1, dg:1.1, total:3.2, verdict:'24hr Deviation', status:'Flagged' },
    { id:'BB-MAY-010', circle:'Punjab',      sites:162, eb:2.4, dg:0.8, total:3.2, verdict:'Clean', status:'Approved' },
    { id:'BB-MAY-011', circle:'Haryana',     sites:128, eb:1.9, dg:0.6, total:2.5, verdict:'Clean', status:'Pending' },
    { id:'BB-MAY-012', circle:'MP',          sites:209, eb:3.3, dg:1.5, total:4.8, verdict:'Tariff Mismatch', status:'Flagged' },
    { id:'BB-MAY-013', circle:'West Bengal', sites:237, eb:3.7, dg:1.3, total:5.0, verdict:'Clean', status:'Approved' },
    { id:'BB-MAY-014', circle:'Kerala',      sites:136, eb:2.0, dg:0.5, total:2.5, verdict:'Clean', status:'Pending' },
  ],

  flaggedItems: [
    { title:'Site MH-3421 — DG vs EB Combined Exceeds 24hr', sub:'Maharashtra · BB-MAY-001', sev:'high' },
    { title:'Vendor INV-DL-0892 — Diesel Consumption Mismatch', sub:'Delhi · BB-MAY-002', sev:'high' },
    { title:'Rate Anomaly — TN Tariff Category C Sites', sub:'Tamil Nadu · BB-MAY-004', sev:'med' },
    { title:'DCEM Reading Unmatched — RJ-1104', sub:'Rajasthan · BB-MAY-006', sev:'high' },
    { title:'24hr Outlier Detected — OD-772 Cluster', sub:'Odisha · BB-MAY-009', sev:'med' },
    { title:'Tariff Code Mismatch — MP Commercial Sites', sub:'MP · BB-MAY-012', sev:'med' },
    { title:'Diesel Input vs Consumption Gap > 8%', sub:'Delhi · 14 sites', sev:'low' },
    { title:'EB Bill Missing — GJ-2201 to GJ-2215', sub:'Gujarat · 15 sites', sev:'low' },
  ],

  aiInsights: [
    { icon:'🔍', text:'<strong>Trend Alert:</strong> Maharashtra DG consumption up 12.4% vs last 3-month average. Possible generator inefficiency or theft.', time:'2 min ago' },
    { icon:'⚡', text:'<strong>Rate Validation:</strong> 47 sites in TN Circle are billed under incorrect LT-II tariff. AI recommends reclassification to LT-VII.', time:'8 min ago' },
    { icon:'📊', text:'<strong>Outlier Cluster:</strong> Delhi sector D-7 shows 5 sites with DG+EB > 24hr combined — flagged for DOA approval.', time:'15 min ago' },
    { icon:'✅', text:'<strong>DCEM Match:</strong> 2,109 of 2,156 validated sites have matching DCEM readings within tolerance.', time:'22 min ago' },
    { icon:'💡', text:'<strong>Next Best Action:</strong> Negotiate revised diesel rate with M/s Aggarwal Fuels — current rate 4.2% above market index.', time:'34 min ago' },
  ],

  validationChecks: [
    { name:'Trend Analysis', icon:'📈', stat:'2,156', label:'sites passed trend check', color:'green', pct:98, type:'pass', desc:'Month-on-month and 3-month rolling average comparison complete. 3 sites show >20% deviation.' },
    { name:'Rate & Tariff Validation', icon:'💰', stat:'47', label:'misclassified tariff codes', color:'amber', pct:42, type:'warn', desc:'LT category mismatches found in TN and MP circles. Auto-correction recommendations generated.' },
    { name:'24hr Check', icon:'⏱️', stat:'14', label:'sites exceed 24hr combined', color:'red', pct:14, type:'fail', desc:'DG + EB combined consumption exceeds 24-hour limit at 14 sites. DOA approval required.' },
    { name:'Diesel Input & Consumption', icon:'🛢️', stat:'92.3%', label:'invoice match rate', color:'green', pct:92, type:'pass', desc:'DG vendor invoices cross-validated against MWFM field readings. 63 invoices pending reconciliation.' },
    { name:'DCEM Reading vs EB', icon:'⚡', stat:'98.1%', label:'EB match accuracy', color:'green', pct:98, type:'pass', desc:'DCEM meter readings matched against EB bills. 41 mismatches under review by field team.' },
    { name:'DCEM vs DG Hours', icon:'🔄', stat:'Running…', label:'in progress', color:'blue', pct:75, type:'run', desc:'Cross-validation of DCEM consumption against diesel generator run-hours. 75% complete.' },
  ],

  outliers: [
    { site:'MH-3421', dev:'+34.2%', detail:'DG+EB > 24hr cap' },
    { site:'DL-0892', dev:'+28.7%', detail:'Diesel consumption spike' },
    { site:'OD-0772', dev:'+21.4%', detail:'EB 24hr anomaly' },
    { site:'RJ-1104', dev:'+18.9%', detail:'DG hours mismatch' },
    { site:'MP-2201', dev:'+17.2%', detail:'Tariff rate outlier' },
  ],

  dcemItems: [
    { site:'MH-3421', status:'Mismatch', detail:'EB: 88 kWh | DCEM: 101 kWh' },
    { site:'KA-1182', status:'Matched',  detail:'EB: 72 kWh | DCEM: 73 kWh' },
    { site:'DL-0119', status:'Mismatch', detail:'DG: 6.4hr | DCEM: 4.9hr' },
    { site:'GJ-2201', status:'Missing',  detail:'No EB bill received' },
    { site:'TN-0441', status:'Matched',  detail:'EB: 95 kWh | DCEM: 94 kWh' },
  ],

  vendors: [
    { rank:1, name:'M/s Suraj Diesel Pvt. Ltd.', region:'West & North India', score:94, reliability:98, accuracy:96, compliance:91, invoiceAcc:97, disputes:1 },
    { rank:2, name:'M/s Bharat Energy Services', region:'South India',        score:91, reliability:95, accuracy:93, compliance:88, invoiceAcc:94, disputes:2 },
    { rank:3, name:'M/s Aggarwal Fuels',         region:'Delhi & Haryana',    score:83, reliability:87, accuracy:81, compliance:82, invoiceAcc:86, disputes:4 },
    { rank:4, name:'M/s Raju Generators Ltd.',   region:'AP & Telangana',     score:79, reliability:83, accuracy:77, compliance:79, invoiceAcc:80, disputes:6 },
    { rank:5, name:'M/s Nath Power Corp.',       region:'Odisha & WB',        score:74, reliability:78, accuracy:72, compliance:71, invoiceAcc:76, disputes:9 },
    { rank:6, name:'M/s Pioneer DG Solutions',   region:'Rajasthan',          score:68, reliability:71, accuracy:65, compliance:70, invoiceAcc:67, disputes:11 },
  ],

  sites: [
    { id:'MH-3421', x:38, y:55, status:'critical', circle:'Maharashtra', eb:101, dg:6.4, deviation:34.2, type:'DG+EB Excess' },
    { id:'MH-2201', x:42, y:61, status:'warning',  circle:'Maharashtra', eb:88,  dg:5.1, deviation:12.1, type:'Rate Anomaly' },
    { id:'MH-1102', x:35, y:65, status:'normal',   circle:'Maharashtra', eb:74,  dg:4.8, deviation:2.3,  type:'Clean' },
    { id:'MH-0891', x:47, y:58, status:'normal',   circle:'Maharashtra', eb:82,  dg:5.3, deviation:1.8,  type:'Clean' },
    { id:'MH-4401', x:30, y:48, status:'warning',  circle:'Maharashtra', eb:96,  dg:7.1, deviation:18.4, type:'24hr Deviation' },
    { id:'MH-3302', x:52, y:50, status:'normal',   circle:'Maharashtra', eb:70,  dg:4.6, deviation:3.1,  type:'Clean' },
    { id:'MH-5501', x:44, y:42, status:'normal',   circle:'Maharashtra', eb:78,  dg:5.0, deviation:0.9,  type:'Clean' },
    { id:'MH-6611', x:28, y:70, status:'critical', circle:'Maharashtra', eb:109, dg:7.8, deviation:41.2, type:'EB Outlier' },
    { id:'MH-7721', x:60, y:72, status:'normal',   circle:'Maharashtra', eb:65,  dg:4.2, deviation:2.0,  type:'Clean' },
    { id:'MH-8831', x:55, y:38, status:'warning',  circle:'Maharashtra', eb:91,  dg:6.6, deviation:15.7, type:'DCEM Mismatch' },
    { id:'MH-9941', x:22, y:38, status:'normal',   circle:'Maharashtra', eb:68,  dg:4.4, deviation:1.5,  type:'Clean' },
    { id:'MH-1051', x:68, y:55, status:'normal',   circle:'Maharashtra', eb:76,  dg:5.0, deviation:2.8,  type:'Clean' },
  ],

  anomalySites: [
    { site:'MH-6611', circle:'Maharashtra', type:'EB Outlier',       deviation:'+41.2%', neighbourAvg:'72 kWh', siteVal:'109 kWh', confidence:97 },
    { site:'MH-3421', circle:'Maharashtra', type:'DG+EB Excess',     deviation:'+34.2%', neighbourAvg:'76 kWh', siteVal:'101 kWh', confidence:95 },
    { site:'MH-4401', circle:'Maharashtra', type:'24hr Deviation',   deviation:'+18.4%', neighbourAvg:'81 kWh', siteVal:'96 kWh',  confidence:91 },
    { site:'MH-2201', circle:'Maharashtra', type:'Rate Anomaly',     deviation:'+12.1%', neighbourAvg:'79 kWh', siteVal:'88 kWh',  confidence:88 },
    { site:'MH-8831', circle:'Maharashtra', type:'DCEM Mismatch',    deviation:'+15.7%', neighbourAvg:'78 kWh', siteVal:'91 kWh',  confidence:86 },
  ],

  disputes: [
    {
      id:'DSP-MAY-001', title:'MNO Dispute — EB Overbilling at DL-0892 Cluster',
      mnr:'Airtel', amount:'₹12.4L', circle:'Delhi', status:'open', age:'3 days',
      analysis:'AI Classification: <strong>Metering Discrepancy.</strong> DCEM readings at 5 DL sites indicate 14.2% lower consumption than billed EB units. Root cause: EB board meter calibration drift detected in Q4. Recommended resolution: Issue CN for ₹12.4L with supporting DCEM data. P&F billing adjustment required.'
    },
    {
      id:'DSP-MAY-002', title:'MNO Dispute — DG Invoice Rate Overcharge (RJ Circle)',
      mnr:'Vodafone Idea', amount:'₹8.7L', circle:'Rajasthan', status:'escalated', age:'7 days',
      analysis:'AI Classification: <strong>Rate & Tariff Dispute.</strong> M/s Pioneer DG Solutions billed ₹98.4/L vs contracted rate ₹94.0/L across 156 sites. Overcharge delta: ₹4.4/L × 19,700L = ₹8.67L. Recommendation: Vendor negotiation with penalty clause invocation per contract Section 7.3.'
    },
    {
      id:'DSP-MAY-003', title:'P&F Billing Query — Field Load Mismatch at MH Sites',
      mnr:'Jio', amount:'₹6.2L', circle:'Maharashtra', status:'open', age:'1 day',
      analysis:'AI Classification: <strong>Field Load Validation Error.</strong> DC load images from MWFM for 23 MH sites show load readings 9.8% lower than billed P&F charges. Image analysis confidence: 94%. Recommendation: Request field team re-validation of DC load at flagged sites before issuing DN.'
    },
    {
      id:'DSP-MAY-004', title:'Tariff Mismatch — TN LT Category Reclassification',
      mnr:'BSNL', amount:'₹3.9L', circle:'Tamil Nadu', status:'open', age:'2 days',
      analysis:'AI Classification: <strong>Tariff Classification Dispute.</strong> 47 TN sites incorrectly classified under LT-II (domestic) vs correct LT-VII (commercial infrastructure). Rate differential: ₹1.84/kWh. AI recommends immediate reclassification and retrospective credit note for 6 months.'
    },
  ],

  approvalQueue: [
    { type:'High Variance', desc:'MH-3421 — DG consumption 34% above peer average. Release for DOA review.', meta:'₹2.8L · 2h ago' },
    { type:'Rate Approval', desc:'TN Circle — 47 sites tariff reclassification batch.', meta:'₹3.9L · 4h ago' },
    { type:'Vendor Pmt',   desc:'M/s Suraj Diesel — ₹4.2Cr invoice validated, approve for AP/SAP.', meta:'₹4.2Cr · 1h ago' },
    { type:'EB Payment',   desc:'Maharashtra EB Board — May cycle invoice ₹6.1Cr cleared.', meta:'₹6.1Cr · 30m ago' },
    { type:'High Variance', desc:'DL-0892 Cluster — 5 sites DG+EB exceeds 24hr cap. Escalate.', meta:'₹12.4L · 3h ago' },
    { type:'DG Outlier',  desc:'OD-0772 — Diesel consumption spike 21.4%. Hold payment pending review.', meta:'₹0.8L · 5h ago' },
  ],

  notifications: [
    { color:'#ef4444', title:'Critical: 14 sites exceed DG+EB 24hr cap', sub:'Immediate DOA approval required', time:'2m ago' },
    { color:'#f59e0b', title:'Billing AI Agent flagged 47 TN tariff anomalies', sub:'Auto-reclassification recommendation ready', time:'8m ago' },
    { color:'#3b82f6', title:'BB-MAY-003 (Karnataka) approved and queued for SAP', sub:'247 sites · ₹5.2Cr', time:'22m ago' },
    { color:'#10b981', title:'DCEM matching complete — 98.1% accuracy', sub:'2,109 of 2,156 sites matched', time:'35m ago' },
    { color:'#8b5cf6', title:'New dispute received from Airtel (Delhi)', sub:'DSP-MAY-001 · ₹12.4L · Metering dispute', time:'3h ago' },
    { color:'#06b6d4', title:'Intelligence Engine: RJ vendor overcharge detected', sub:'₹8.7L recovery opportunity identified', time:'5h ago' },
  ],

  agentLogs: {
    orchestrator: [
      '> [07:12:41] Routing EB invoice batch → Billing Agent',
      '> [07:12:43] Routing DG invoice batch → Billing Agent',
      '> [07:13:01] Email from shared mailbox: 3 EB bills → parsed',
      '> [07:14:22] Security scan: all attachments clean',
      '> [07:15:08] Task queue: 2,847 sites dispatched',
    ],
    billing: [
      '> [07:13:01] EB validation started: 1,423 bills',
      '> [07:14:15] Rate/tariff check: TN 47 anomalies flagged ⚠️',
      '> [07:15:03] 24hr check: 14 sites exceed threshold ⚠️',
      '> [07:15:44] DCEM vs EB matching: 98.1% accuracy ✓',
      '> [07:16:22] DG diesel reconciliation: 63 pending...',
    ],
    dispute: [
      '> [07:10:00] Agent idle. Awaiting new disputes.',
      '> [07:10:01] Last run: DSP-MAY-004 auto-resolved ✓',
      '> [07:10:02] CN-DN automation: 18 cases closed',
      '> [07:10:03] Classification model v2.3 active',
    ],
    intel: [
      '> [07:12:00] Neighbouring site analysis: MH circle',
      '> [07:13:30] Anomaly detected: MH-6611 (+41.2%) 🔴',
      '> [07:14:10] Insight: TN tariff reclassification opportunity',
      '> [07:15:05] Vendor benchmark: Aggarwal rate 4.2% above index',
      '> [07:16:00] Generated 8 action recommendations',
    ],
  },

  consumptionTrend: {
    labels: ['Dec','Jan','Feb','Mar','Apr','May'],
    eb:  [18.2, 19.1, 17.8, 20.3, 22.1, 24.7],
    dg:  [ 6.8,  7.1,  6.5,  7.4,  7.8,  8.2],
  },

  mockEBBillsPreview: [
    { siteId: 'MH-3421', circle: 'Maharashtra', period: 'May 2026', units: '12,450 kWh', amount: '₹1,05,825', status: 'Pending Scan' },
    { siteId: 'MH-2201', circle: 'Maharashtra', period: 'May 2026', units: '8,890 kWh', amount: '₹75,565', status: 'Pending Scan' },
    { siteId: 'DL-0892', circle: 'Delhi', period: 'May 2026', units: '14,210 kWh', amount: '₹1,34,995', status: 'Pending Scan' },
    { siteId: 'KA-1182', circle: 'Karnataka', period: 'May 2026', units: '9,120 kWh', amount: '₹82,080', status: 'Pending Scan' },
    { siteId: 'TN-0441', circle: 'Tamil Nadu', period: 'May 2026', units: '11,400 kWh', amount: '₹1,02,600', status: 'Pending Scan' }
  ],

  mockDGInvoicesPreview: [
    { siteId: 'MH-3421', circle: 'Maharashtra', vendor: 'M/s Suraj Diesel', runHours: '124.5 hrs', dieselQty: '2,840 L', amount: '₹2,67,200', status: 'Pending Scan' },
    { siteId: 'MH-2201', circle: 'Maharashtra', vendor: 'M/s Suraj Diesel', runHours: '98.2 hrs', dieselQty: '1,960 L', amount: '₹1,84,300', status: 'Pending Scan' },
    { siteId: 'DL-0892', circle: 'Delhi', vendor: 'M/s Aggarwal Fuels', runHours: '148.0 hrs', dieselQty: '3,120 L', amount: '₹2,96,400', status: 'Pending Scan' },
    { siteId: 'KA-1182', circle: 'Karnataka', vendor: 'M/s Bharat Energy', runHours: '86.4 hrs', dieselQty: '1,810 L', amount: '₹1,70,140', status: 'Pending Scan' },
    { siteId: 'RJ-1104', circle: 'Rajasthan', vendor: 'M/s Pioneer DG', runHours: '112.5 hrs', dieselQty: '2,420 L', amount: '₹2,27,480', status: 'Pending Scan' }
  ]

};

