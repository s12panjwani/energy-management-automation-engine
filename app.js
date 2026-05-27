// ──────────────────────────────────────────────────────────────
//  CIRCLE AI — INTELLIGENT ENERGY MANAGEMENT
//  Application Logic
// ──────────────────────────────────────────────────────────────

let workflowState = {
  currentStep: 1,
  stepStatus: {
    1: 'active',
    2: 'pending',
    3: 'pending',
    4: 'pending',
    5: 'pending',
    6: 'pending'
  },
  files: {
    eb: null,
    dg: null
  },
  processingProgress: 0
};

/* ── NAVIGATION ──────────────────────────────────────────────── */
function initNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const view = item.dataset.view;
      switchView(view);
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // If we go to dashboard, synchronize with active pipeline step
      if (view === 'dashboard') {
        switchWorkflowStep(workflowState.currentStep);
      } else {
        // Remove active highlights from pipeline when in other views
        document.querySelectorAll('.pipeline-step').forEach(step => step.classList.remove('active'));
      }
    });
  });
}


/* ── navTo: called by KPI cards & process-flow stages ─────────── */
function navTo(view) {
  switchView(view);
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const navEl = document.getElementById('nav-' + view);
  if (navEl) navEl.classList.add('active');
}

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  const titles = {
    dashboard: 'Command Centre',
    billing:   'Billing Batches',
    validation:'AI Validation Engine',
    vendors:   'Vendor Ranking & Scorecard',
    sites:     'Neighbouring Site Analysis',
    disputes:  'Dispute Management',
    agents:    'Agent Monitor'
  };
  document.getElementById('page-title').textContent = titles[view] || view;
}

/* ── KPI COUNTER ANIMATION ───────────────────────────────────── */
function animateKPI(el, target) {
  const hasLak = target.includes('Cr');
  const hasPct = target.includes('%');
  const hasHrs = target.includes('hrs');
  const hasRs  = target.includes('₹');

  let start = 0;
  const end = parseFloat(target.replace(/[^0-9.]/g,''));
  const dur = 1200;
  const step = 16;
  const inc  = end / (dur / step);
  const timer = setInterval(() => {
    start += inc;
    if (start >= end) { start = end; clearInterval(timer); }
    let disp = start.toFixed(hasLak ? 1 : hasPct ? 1 : 0);
    if (hasRs && hasLak)  disp = '₹' + disp + 'Cr';
    else if (hasPct)      disp = disp + '%';
    else if (hasHrs)      disp = disp + 'hrs';
    else                  disp = Number(disp).toLocaleString();
    el.textContent = disp;
  }, step);
}

/* ── CHART (vanilla canvas) ──────────────────────────────────── */
function drawConsumptionChart() {
  const canvas = document.getElementById('consumptionChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const d   = DATA.consumptionTrend;
  const W   = canvas.offsetWidth;
  const H   = 160;
  canvas.width  = W;
  canvas.height = H;

  const pad  = { l:40, r:20, t:15, b:28 };
  const cW   = W - pad.l - pad.r;
  const cH   = H - pad.t - pad.b;
  const maxV = Math.max(...d.eb, ...d.dg) * 1.15;
  const n    = d.labels.length;

  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + cH - (cH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cW, y); ctx.stroke();
  }
  ctx.fillStyle = '#475569';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  d.labels.forEach((lbl, i) => {
    const x = pad.l + (i / (n-1)) * cW;
    ctx.fillText(lbl, x, H - 8);
  });

  function plotLine(vals, color, fillColor) {
    const points = vals.map((v,i) => [
      pad.l + (i/(n-1)) * cW,
      pad.t + cH - (v/maxV) * cH
    ]);
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(points[0][0], pad.t + cH);
    points.forEach(([x,y]) => ctx.lineTo(x, y));
    ctx.lineTo(points[n-1][0], pad.t + cH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const [x0,y0] = points[i-1], [x1,y1] = points[i];
      const cx = (x0+x1)/2;
      ctx.bezierCurveTo(cx,y0,cx,y1,x1,y1);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    points.forEach(([x,y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  plotLine(d.dg, '#f59e0b', 'rgba(245,158,11,0.12)');
  plotLine(d.eb, '#3b82f6', 'rgba(59,130,246,0.15)');
}

/* ── QUICK ACTIONS STRIP ─────────────────────────────────────── */
function renderQuickActions() {
  const el = document.getElementById('quick-actions');
  if (!el) return;
  const actions = [
    { icon:'⚡', label:'Run Full Validation', sub:'All 2,847 sites', color:'blue',   onclick:`showToast('Starting full validation cycle…','info')` },
    { icon:'✅', label:'Approve Clean Batches', sub:'8 batches ready',  color:'green',  onclick:`bulkApproveBatches()` },
    { icon:'📤', label:'Submit to SAP/AP',     sub:'₹18.2Cr queued',  color:'purple', onclick:`showToast('Submitting approved batches to SAP…','success')` },
    { icon:'⚖️', label:'Resolve Disputes',     sub:'7 open items',    color:'amber',  onclick:`navTo('disputes')` },
  ];
  el.innerHTML = actions.map(a => `
    <button class="qa-btn qa-${a.color}" onclick="${a.onclick}">
      <div class="qa-icon">${a.icon}</div>
      <div class="qa-text">
        <div class="qa-label">${a.label}</div>
        <div class="qa-sub">${a.sub}</div>
      </div>
      <div class="qa-chevron">›</div>
    </button>`).join('');
}

function bulkApproveBatches() {
  showToast('Approving 8 clean batches…', 'info');
  setTimeout(() => showToast('8 batches approved & queued for SAP ✓', 'success'), 1800);
}

/* ── FLAGGED ITEMS ───────────────────────────────────────────── */
function renderFlaggedList() {
  const el = document.getElementById('flagged-list');
  if (!el) return;

  const itemActions = {
    high: [
      { label:'Review Now',  cls:'btn-review',  fn:(t) => `openFlaggedDetail('${t}')` },
      { label:'Escalate',    cls:'btn-reject',  fn:(t) => `showToast('Escalated to DOA ⚠️','warn')` },
    ],
    med:  [
      { label:'Review',      cls:'btn-review',  fn:(t) => `openFlaggedDetail('${t}')` },
      { label:'Dismiss',     cls:'btn-outline', fn:(t) => `dismissFlagged(this)` },
    ],
    low:  [
      { label:'Acknowledge', cls:'btn-outline', fn:(t) => `dismissFlagged(this)` },
    ],
  };

  el.innerHTML = DATA.flaggedItems.map((item, idx) => {
    const acts = itemActions[item.sev] || itemActions.low;
    const btns = acts.map(a =>
      `<button class="btn btn-sm ${a.cls}" onclick="${a.fn(item.title)}">${a.label}</button>`
    ).join('');
    return `
    <div class="flagged-item" id="fi-${idx}">
      <div class="flagged-dot ${item.sev}"></div>
      <div style="flex:1;min-width:0">
        <div class="fi-title">${item.title}</div>
        <div class="fi-sub">${item.sub}</div>
        <div class="fi-actions">${btns}</div>
      </div>
      <div class="fi-badge ${item.sev}">${item.sev.toUpperCase()}</div>
    </div>`;
  }).join('');
}

function openFlaggedDetail(title) {
  const modal = document.getElementById('modal-overlay');
  const mTitle = document.getElementById('modal-title');
  const mBody  = document.getElementById('modal-body');
  const mBtn   = document.getElementById('modal-confirm-btn');
  mTitle.textContent = 'Flagged Item Review';
  mBody.innerHTML = `
    <div style="background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:1rem;margin-bottom:1rem">
      <div style="font-size:.72rem;font-weight:700;color:var(--red);margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.06em">🚨 High Priority Flag</div>
      <div style="font-size:.85rem;font-weight:600;color:var(--text)">${title}</div>
    </div>
    <p style="font-size:.82rem;color:var(--text-2);line-height:1.7">
      The Billing AI Agent has flagged this item after detecting a statistically significant deviation from historical patterns and peer-site benchmarks.<br/><br/>
      <strong>Recommended action:</strong> Review the underlying meter readings and DG vendor invoice, then either approve the variance (requires DOA sign-off) or send back to vendor for correction.
    </p>`;
  mBtn.textContent = 'Approve Variance (DOA)';
  mBtn.onclick = () => { closeModal(); showToast('Variance approved — logged for DOA ✓', 'success'); };
  modal.classList.add('open');
}

function dismissFlagged(btn) {
  const item = btn.closest('.flagged-item');
  if (item) {
    item.style.transition = 'opacity .3s, max-height .4s, padding .4s';
    item.style.opacity = '0';
    item.style.maxHeight = '0';
    item.style.padding = '0';
    item.style.overflow = 'hidden';
    setTimeout(() => item.remove(), 450);
    showToast('Item acknowledged and dismissed', 'info');
  }
}

/* ── AI INSIGHTS ─────────────────────────────────────────────── */
function renderInsights() {
  const el = document.getElementById('insights-list');
  if (!el) return;

  const insightActions = [
    { label:'View Sites →',     view:'sites',      cls:'btn-review' },
    { label:'Fix Tariffs →',    view:'validation',  cls:'btn-review' },
    { label:'View Flagged →',   view:'billing',     cls:'btn-review' },
    { label:'View Validation →',view:'validation',  cls:'btn-outline' },
    { label:'View Vendors →',   view:'vendors',     cls:'btn-review' },
  ];

  el.innerHTML = DATA.aiInsights.map((item, i) => {
    const act = insightActions[i] || insightActions[0];
    return `
    <div class="insight-item">
      <div class="insight-icon">${item.icon}</div>
      <div style="flex:1;min-width:0">
        <div class="insight-text">${item.text}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.45rem">
          <div class="insight-time">${item.time}</div>
          <button class="btn btn-sm ${act.cls} insight-cta-btn" onclick="navTo('${act.view}')">${act.label}</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ── BILLING TABLE ───────────────────────────────────────────── */
function renderBillingTable() {
  const tbody = document.getElementById('billing-tbody');
  if (!tbody) return;
  tbody.innerHTML = DATA.billingBatches.map(b => {
    const statusClass = b.status.toLowerCase();
    const verdictColor = b.verdict === 'Clean' ? 'color:var(--green)' : 'color:var(--amber)';
    return `
    <tr data-status="${b.status}">
      <td class="mono">${b.id}</td>
      <td>${b.circle}</td>
      <td class="mono">${b.sites}</td>
      <td class="mono">₹${b.eb}Cr</td>
      <td class="mono">₹${b.dg}Cr</td>
      <td class="mono" style="font-weight:700">₹${b.total}Cr</td>
      <td style="${verdictColor};font-size:.76rem;font-weight:600">${b.verdict}</td>
      <td><span class="status-pill ${statusClass}">${b.status}</span></td>
      <td>
        <div class="td-actions">
          ${b.status === 'Flagged'  ? `<button class="btn btn-sm btn-review"  onclick="openModal('${b.id}','review')">Review</button>` : ''}
          ${b.status === 'Pending'  ? `<button class="btn btn-sm btn-approve" onclick="openModal('${b.id}','approve')">Approve</button>` : ''}
          ${b.status === 'Approved' ? `<button class="btn btn-sm btn-approve" style="opacity:.6;cursor:default">Submitted</button>` : ''}
          <button class="btn btn-sm btn-outline" onclick="showToast('Downloading ${b.id}…','info')" title="Download">↓</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ── VALIDATION ──────────────────────────────────────────────── */
function renderValidationChecks() {
  const grid = document.querySelector('.validation-checks-grid');
  if (!grid) return;

  const cardActions = {
    pass: { label:'View Details',    cls:'btn-outline' },
    warn: { label:'Fix Issues →',    cls:'btn-review'  },
    fail: { label:'Escalate Now →',  cls:'btn-reject'  },
    run:  { label:'View Progress',   cls:'btn-outline' },
  };

  grid.innerHTML = DATA.validationChecks.map(c => {
    const act = cardActions[c.type] || cardActions.pass;
    return `
    <div class="val-check-card ${c.type}">
      <div class="vc-header">
        <div class="vc-name">${c.name}</div>
        <div class="vc-icon">${c.icon}</div>
      </div>
      <div class="vc-stat ${c.color}">${c.stat}</div>
      <div style="font-size:.7rem;color:var(--muted);margin-bottom:.4rem">${c.label}</div>
      <div class="vc-desc">${c.desc}</div>
      <div class="vc-bar-wrap">
        <div class="vc-bar ${c.color}" style="width:${c.pct}%"></div>
      </div>
      <button class="btn btn-sm ${act.cls} vc-cta-btn"
        onclick="handleValidationAction('${c.type}','${c.name}')">${act.label}</button>
    </div>`;
  }).join('');

  const outEl = document.getElementById('outlier-list');
  if (outEl) {
    outEl.innerHTML = DATA.outliers.map(o => `
      <div class="ol-item">
        <span class="ol-site">${o.site}</span>
        <span style="font-size:.75rem;color:var(--text-2)">${o.detail}</span>
        <span class="ol-dev">${o.dev}</span>
        <button class="btn btn-sm btn-reject" onclick="showToast('Flagging ${o.site} for DOA review…','warn')" style="margin-left:.5rem">Flag DOA</button>
      </div>`).join('');
  }

  const dcEl = document.getElementById('dcem-list');
  if (dcEl) {
    dcEl.innerHTML = DATA.dcemItems.map(d => {
      const col = d.status === 'Matched' ? 'var(--green)' : d.status === 'Missing' ? 'var(--amber)' : 'var(--red)';
      const actionBtn = d.status !== 'Matched'
        ? `<button class="btn btn-sm btn-review" onclick="showToast('Raising field query for ${d.site}…','info')">Query Field</button>`
        : `<button class="btn btn-sm btn-outline" onclick="showToast('${d.site} match confirmed ✓','success')">Confirm</button>`;
      return `
        <div class="dcem-item">
          <span class="ol-site">${d.site}</span>
          <span style="font-size:.72rem;color:var(--text-2)">${d.detail}</span>
          <span style="font-size:.72rem;font-weight:600;color:${col}">${d.status}</span>
          ${actionBtn}
        </div>`;
    }).join('');
  }
}

function handleValidationAction(type, name) {
  if (type === 'fail') {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = 'Escalate Validation Failure';
    document.getElementById('modal-body').innerHTML = `
      <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:1rem;margin-bottom:1rem">
        <div style="font-size:.72rem;color:var(--red);font-weight:700;margin-bottom:.3rem">CRITICAL — ${name}</div>
        <div style="font-size:.82rem;color:var(--text-2)">14 sites exceed the combined DG+EB 24-hour cap. Immediate DOA approval required before payments can be released.</div>
      </div>
      <p style="font-size:.82rem;color:var(--text-2)">Escalating will notify the DOA approver and put a payment hold on the affected batches. Do you want to proceed?</p>`;
    document.getElementById('modal-confirm-btn').textContent = 'Escalate to DOA';
    document.getElementById('modal-confirm-btn').onclick = () => { closeModal(); showToast('Escalated to DOA — payment hold placed on 14 sites ✓','warn'); };
    overlay.classList.add('open');
  } else if (type === 'warn') {
    showToast(`Opening fix workflow for: ${name}…`, 'warn');
    setTimeout(() => navTo('billing'), 600);
  } else {
    showToast(`${name}: Detailed report loading…`, 'info');
  }
}

/* ── VENDOR SCORECARD ────────────────────────────────────────── */
function renderVendors() {
  const grid = document.getElementById('vendor-grid');
  if (!grid) return;
  grid.innerHTML = DATA.vendors.map((v, idx) => {
    const scoreColor = v.score >= 90 ? '#10b981' : v.score >= 80 ? '#3b82f6' : v.score >= 70 ? '#f59e0b' : '#ef4444';
    const r = 36, cx = 44, cy = 44;
    const circ = 2 * Math.PI * r;
    const offset = circ - (v.score / 100) * circ;
    const renegotiate = v.score < 80 ? `<button class="btn btn-sm btn-reject" style="flex:1;justify-content:center" onclick="showToast('Opening negotiation workflow for ${v.name}…','warn')">Renegotiate Contract</button>` : '';
    return `
    <div class="vendor-card">
      <div class="vendor-rank"><span class="vendor-rank-num">#${v.rank}</span> Ranking</div>
      <div class="vendor-name">${v.name}</div>
      <div class="vendor-region">📍 ${v.region}</div>
      <div class="score-ring-wrap">
        <div class="score-ring">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${scoreColor}" stroke-width="8"
              stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
              stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"
              style="transition:stroke-dashoffset 1.5s ease"/>
          </svg>
          <div class="score-val" style="color:${scoreColor}">${v.score}</div>
        </div>
        <div class="vendor-metrics">
          <div class="vm-row"><span class="vm-label">Reliability</span><span class="vm-val ${v.reliability>=90?'good':'ok'}">${v.reliability}%</span></div>
          <div class="vm-row"><span class="vm-label">Invoice Accuracy</span><span class="vm-val ${v.invoiceAcc>=90?'good':'ok'}">${v.invoiceAcc}%</span></div>
          <div class="vm-row"><span class="vm-label">Compliance</span><span class="vm-val ${v.compliance>=85?'good':'ok'}">${v.compliance}%</span></div>
          <div class="vm-row"><span class="vm-label">Disputes (90d)</span><span class="vm-val ${v.disputes<=3?'good':v.disputes<=6?'ok':'bad'}">${v.disputes}</span></div>
        </div>
      </div>
      <div style="display:flex;gap:.5rem;margin-top:.75rem">
        <button class="btn btn-outline btn-sm" style="flex:1;justify-content:center" onclick="openVendorScorecard(${idx})">View Scorecard</button>
        ${renegotiate}
      </div>
      ${v.disputes > 5 ? `<div class="vendor-alert-row"><span>⚠️ ${v.disputes} disputes in 90 days — </span><button class="inline-link-btn" onclick="navTo('disputes')">Review disputes →</button></div>` : ''}
    </div>`;
  }).join('');
}

function openVendorScorecard(idx) {
  const v = DATA.vendors[idx];
  if (!v) return;

  const overlay = document.getElementById('modal-overlay');
  const title   = document.getElementById('modal-title');
  const body    = document.getElementById('modal-body');
  const footer  = document.getElementById('modal-footer');

  title.innerHTML = `<span style="font-size:1.15rem;margin-right:.4rem;">📊</span> Circle AI Vendor Scorecard: ${v.name}`;

  const scoreColor = v.score >= 90 ? 'var(--green)' : v.score >= 80 ? 'var(--blue)' : v.score >= 70 ? 'var(--amber)' : 'var(--red)';
  
  let grade = 'D';
  if (v.score >= 90) grade = 'A+';
  else if (v.score >= 80) grade = 'B';
  else if (v.score >= 70) grade = 'C';

  let auditVerdict = '';
  let auditDetail = '';
  let verdictColor = '';
  let verdictBg = '';

  if (v.score >= 90) {
    auditVerdict = '✅ Green Channel Candidate';
    verdictColor = 'var(--green)';
    verdictBg = 'rgba(16, 185, 129, 0.06)';
    auditDetail = `<strong>${v.name}</strong> demonstrates superior invoice accuracy (${v.invoiceAcc}%) and SLA reliability (${v.reliability}%). Very low dispute rate (${v.disputes} ticket in 90 days). Qualified for Circle AI's automated green-channel billing release program to bypass human auditing for standard cycles.`;
  } else if (v.score >= 80) {
    auditVerdict = '⚠️ Standard Audit Required';
    verdictColor = 'var(--amber)';
    verdictBg = 'rgba(245, 158, 11, 0.06)';
    auditDetail = `Maintains stable operational uptime (${v.reliability}%) but shows elevated invoice discrepancies (${100 - v.invoiceAcc}% variance rate). Moderate active disputes (${v.disputes} tickets in 90 days). Recommend matching all DG run logs against DCEM load telemetry.`;
  } else {
    auditVerdict = '🔴 Continuous Auditing & Contract Renegotiation';
    verdictColor = 'var(--red)';
    verdictBg = 'rgba(239, 68, 68, 0.06)';
    auditDetail = `High discrepancy rate (${100 - v.invoiceAcc}% invoice mismatch) and excessive active disputes (${v.disputes} open tickets). Uptime compliance (${v.compliance}%) is below circle SLA requirements. Recommend immediate payment release hold and structured contract renegotiation.`;
  }

  body.innerHTML = `
    <!-- Top summary row -->
    <div style="display:flex; align-items:center; gap:1.25rem; margin-bottom:1.25rem; background:rgba(15,23,42,0.02); border:1px solid var(--border); border-radius:10px; padding:1rem;">
      <!-- Score Ring representation -->
      <div style="position:relative; width:68px; height:68px; display:grid; place-items:center; background:#fff; border-radius:50%; border:3px solid ${scoreColor}; flex-shrink:0;">
        <span style="font-size:1.3rem; font-weight:800; color:${scoreColor}">${v.score}</span>
      </div>
      <div>
        <div style="font-size:1rem; font-weight:800; color:var(--text)">Grade: <span style="color:${scoreColor}">${grade}</span></div>
        <div style="font-size:.78rem; color:var(--muted); margin-top:2px;">Ranked: <strong>#${v.rank} of 6</strong> suppliers · Region: <strong>${v.region}</strong></div>
      </div>
    </div>

    <!-- AI Verdict Callout -->
    <div style="background:${verdictBg}; border:1px solid ${scoreColor}40; border-radius:8px; padding:1rem; margin-bottom:1.25rem;">
      <div style="font-size:.72rem; font-weight:700; color:${verdictColor}; text-transform:uppercase; letter-spacing:.08em; margin-bottom:.35rem;">🔮 AI Recommendation</div>
      <div style="font-size:.82rem; font-weight:700; color:var(--text); margin-bottom:.25rem">${auditVerdict}</div>
      <p style="font-size:.8rem; color:var(--text-2); line-height:1.55; margin:0">${auditDetail}</p>
    </div>

    <!-- Metrics Detail Grid -->
    <div style="background:var(--bg-card-2); border:1px solid var(--border); border-radius:8px; padding:.4rem .85rem; margin-bottom:1.25rem;">
      <div style="display:flex; justify-content:space-between; padding:.5rem 0; border-bottom:1px solid rgba(15,23,42,0.04); font-size:.8rem;">
        <span style="color:var(--muted);">SLA Reliability</span>
        <span style="font-weight:700; color:${v.reliability >= 90 ? 'var(--green)' : 'var(--amber)'};">${v.reliability}%</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:.5rem 0; border-bottom:1px solid rgba(15,23,42,0.04); font-size:.8rem;">
        <span style="color:var(--muted);">Invoice Accuracy</span>
        <span style="font-weight:700; color:${v.invoiceAcc >= 90 ? 'var(--green)' : 'var(--amber)'};">${v.invoiceAcc}%</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:.5rem 0; border-bottom:1px solid rgba(15,23,42,0.04); font-size:.8rem;">
        <span style="color:var(--muted);">Regulatory Compliance</span>
        <span style="font-weight:700; color:${v.compliance >= 85 ? 'var(--green)' : 'var(--amber)'};">${v.compliance}%</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:.5rem 0; font-size:.8rem;">
        <span style="color:var(--muted);">Disputes (Past 90 days)</span>
        <span style="font-weight:700; color:${v.disputes <= 3 ? 'var(--green)' : v.disputes <= 6 ? 'var(--amber)' : 'var(--red)'};">${v.disputes} active</span>
      </div>
    </div>

    <!-- Action buttons inside modal footer -->
    <div style="display:flex; gap:.5rem; flex-wrap:wrap; justify-content:flex-end; border-top:1px solid var(--border); padding-top:1rem;">
      <button class="btn btn-sm btn-outline" onclick="closeModal()">Close Scorecard</button>
      <button class="btn btn-sm btn-primary" onclick="closeModal(); showToast('Exporting ${v.name} performance audit to PDF…', 'success')">📥 Export Audit Report</button>
      ${v.score < 80 ? `<button class="btn btn-sm btn-reject" onclick="closeModal(); showToast('Opening SLA renegotiation room for ${v.name}…', 'warn')">⚠️ Renegotiate SLA</button>` : ''}
    </div>
  `;

  // Hide the global modal footer
  if (footer) footer.style.display = 'none';

  overlay.classList.add('open');
}

/* ── SITE MAP ────────────────────────────────────────────────── */
function renderSiteMap() {
  const mapEl = document.getElementById('site-map');
  if (!mapEl) return;

  let bgHtml = `
    <svg style="position:absolute;inset:0;width:100%;height:100%;opacity:.08" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(15, 23, 42, 0.12)" stroke-width=".5"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>
    </svg>
    <div style="position:absolute;top:.75rem;left:.75rem;font-size:.68rem;color:var(--muted);font-weight:600">MAHARASHTRA CIRCLE</div>
    <div style="position:absolute;bottom:.75rem;right:.75rem;display:flex;gap:.75rem;align-items:center;font-size:.68rem;color:var(--muted)">
      <span style="display:flex;align-items:center;gap:.3rem"><span style="width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block"></span> Normal</span>
      <span style="display:flex;align-items:center;gap:.3rem"><span style="width:8px;height:8px;border-radius:50%;background:var(--amber);display:inline-block"></span> Warning</span>
      <span style="display:flex;align-items:center;gap:.3rem"><span style="width:8px;height:8px;border-radius:50%;background:var(--red);display:inline-block"></span> Critical</span>
    </div>`;

  DATA.sites.forEach(s => {
    bgHtml += `
      <div class="site-dot ${s.status}" style="left:${s.x}%;top:${s.y}%" onclick="showSiteDetail('${s.id}')" title="${s.id}">
        <div class="site-dot-label">${s.id}</div>
      </div>`;
  });

  mapEl.innerHTML = bgHtml;
}

function showSiteDetail(siteId) {
  const s = DATA.sites.find(x => x.id === siteId);
  if (!s) return;
  const panel = document.getElementById('site-detail-panel');
  const statusColor = s.status === 'normal' ? 'var(--green)' : s.status === 'warning' ? 'var(--amber)' : 'var(--red)';
  const urgencyBtns = s.status === 'critical'
    ? `<button class="btn btn-sm btn-reject"   onclick="showToast('Payment hold placed on ${s.id} ✓','warn')">Hold Payment</button>
       <button class="btn btn-sm btn-review"   onclick="showToast('Dispatching field team to ${s.id}…','info')">Dispatch Field Team</button>
       <button class="btn btn-sm btn-primary"  onclick="showToast('AI report generated for ${s.id}','success')">AI Report</button>`
    : s.status === 'warning'
    ? `<button class="btn btn-sm btn-review"  onclick="showToast('Raising DCEM query for ${s.id}…','info')">Query DCEM</button>
       <button class="btn btn-sm btn-primary" onclick="showToast('AI report generated for ${s.id}','success')">AI Report</button>`
    : `<button class="btn btn-sm btn-approve"  onclick="showToast('${s.id} cleared ✓','success')">Mark Clear</button>
       <button class="btn btn-sm btn-outline"  onclick="showToast('Downloading site report…','info')">Download</button>`;

  panel.innerHTML = `
    <div style="margin-bottom:1rem">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-family:var(--mono);font-size:1rem;font-weight:700">${s.id}</div>
        <span class="status-pill ${s.status === 'normal' ? 'approved' : s.status === 'warning' ? 'pending' : 'flagged'}">${s.status.toUpperCase()}</span>
      </div>
      <div style="font-size:.72rem;color:var(--muted);margin-top:.25rem">${s.circle} Circle</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
      <div style="background:var(--bg-card-2);border-radius:8px;padding:.75rem">
        <div style="font-size:.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">EB Consumption</div>
        <div style="font-size:1.1rem;font-weight:700;font-family:var(--mono);margin-top:.2rem">${s.eb} kWh</div>
      </div>
      <div style="background:var(--bg-card-2);border-radius:8px;padding:.75rem">
        <div style="font-size:.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">DG Run Hours</div>
        <div style="font-size:1.1rem;font-weight:700;font-family:var(--mono);margin-top:.2rem">${s.dg} hrs</div>
      </div>
    </div>
    <div style="background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:8px;padding:.85rem;margin-bottom:1rem">
      <div style="font-size:.68rem;font-weight:700;color:${statusColor};text-transform:uppercase;letter-spacing:.06em;margin-bottom:.3rem">AI Anomaly Detection</div>
      <div style="font-size:.8rem;color:var(--text-2)">Type: <strong style="color:var(--text)">${s.type}</strong></div>
      <div style="font-size:.8rem;color:var(--text-2);margin-top:.25rem">Deviation from peer average: <strong style="color:${statusColor}">+${s.deviation}%</strong></div>
    </div>
    <div style="display:flex;gap:.5rem;flex-wrap:wrap">${urgencyBtns}</div>`;
}

/* ── ANOMALY TABLE ───────────────────────────────────────────── */
function renderAnomalyTable() {
  const tbody = document.getElementById('anomaly-tbody');
  if (!tbody) return;
  tbody.innerHTML = DATA.anomalySites.map(s => `
    <tr>
      <td class="mono">${s.site}</td>
      <td>${s.circle}</td>
      <td style="color:var(--amber);font-weight:500">${s.type}</td>
      <td style="color:var(--red);font-weight:600">${s.deviation}</td>
      <td class="mono">${s.neighbourAvg}</td>
      <td class="mono">${s.siteVal}</td>
      <td>
        <div style="display:flex;align-items:center;gap:.5rem">
          <div style="height:4px;width:60px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${s.confidence}%;background:var(--purple);border-radius:2px"></div>
          </div>
          <span style="font-size:.72rem;font-family:var(--mono)">${s.confidence}%</span>
        </div>
      </td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-review" onclick="navTo('sites');setTimeout(()=>showSiteDetail('${s.site}'),100)">Inspect</button>
          <button class="btn btn-sm btn-reject" onclick="showToast('Payment hold placed on ${s.site}','warn')">Hold</button>
        </div>
      </td>
    </tr>`).join('');
}

/* ── DISPUTES ────────────────────────────────────────────────── */
function renderDisputes() {
  const el = document.getElementById('dispute-list');
  if (!el) return;
  el.innerHTML = DATA.disputes.map(d => `
    <div class="dispute-card ${d.status}" id="dispute-${d.id}">
      <div class="dc-top">
        <div>
          <div class="dc-id">${d.id} · ${d.age} old</div>
          <div class="dc-title">${d.title}</div>
          <div class="dc-meta">
            <div class="dc-meta-item">MNO: <span>${d.mnr}</span></div>
            <div class="dc-meta-item">Circle: <span>${d.circle}</span></div>
            <div class="dc-meta-item">Amount: <span style="color:var(--amber)">${d.amount}</span></div>
          </div>
        </div>
        <span class="status-pill ${d.status === 'open' ? 'flagged' : 'pending'}" style="flex-shrink:0">${d.status.toUpperCase()}</span>
      </div>
      <div class="dc-ai-analysis">
        <div class="dc-ai-label">⚖️ Dispute Management Agent Analysis</div>
        <div class="dc-ai-text">${d.analysis}</div>
      </div>
      <div class="dc-actions">
        <button class="btn btn-sm btn-approve" onclick="resolveDispute('${d.id}', 'cn')">Issue CN/DN</button>
        <button class="btn btn-sm btn-review"  onclick="resolveDispute('${d.id}', 'escalate')">Escalate</button>
        <button class="btn btn-sm btn-reject"  onclick="resolveDispute('${d.id}', 'reject')">Reject Claim</button>
        <button class="btn btn-sm btn-outline" onclick="showToast('Downloading dispute report…','info')">Export</button>
      </div>
    </div>`).join('');
}

function resolveDispute(id, action) {
  const msgs = {
    cn:       [`Issuing Credit/Debit Note for ${id}…`, 'CN issued & MNO notified ✓', 'success'],
    escalate: [`Escalating ${id} to Collections Team…`, 'Escalated — team notified ⚠️', 'warn'],
    reject:   [`Preparing rejection response for ${id}…`, 'Claim rejected with AI evidence ✓', 'info'],
  };
  const [msg1, msg2, type] = msgs[action];
  showToast(msg1, 'info');
  setTimeout(() => {
    showToast(msg2, type);
    const card = document.getElementById('dispute-' + id);
    if (card) {
      card.style.transition = 'opacity .4s, transform .4s';
      card.style.opacity = '0.35';
      card.style.transform = 'scale(0.98)';
      const pill = card.querySelector('.status-pill');
      if (pill) { pill.textContent = action === 'cn' ? 'RESOLVED' : action === 'escalate' ? 'ESCALATED' : 'CLOSED'; pill.className = 'status-pill ' + (action === 'cn' ? 'approved' : 'pending'); }
    }
  }, 1400);
}

/* ── AGENT MONITOR ───────────────────────────────────────────── */
function renderAgentMonitor() {
  const logIds = ['orchestrator-log','billing-agent-log','dispute-agent-log','intel-agent-log'];
  const keys   = ['orchestrator','billing','dispute','intel'];

  keys.forEach((key, i) => {
    const el = document.getElementById(logIds[i]);
    if (!el) return;
    el.innerHTML = DATA.agentLogs[key].map((line, idx) => {
      const cls = line.includes('✓') ? 'success' : line.includes('⚠️') ? 'warn' : line.includes('🔴') ? 'error' : idx === DATA.agentLogs[key].length - 1 ? 'info' : 'muted';
      return `<div class="log-line ${cls}">${line}</div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  });

  // Approval Queue
  const aqEl = document.getElementById('approval-queue');
  if (aqEl) {
    aqEl.innerHTML = DATA.approvalQueue.map((item, i) => `
      <div class="aq-item" id="aq-${i}">
        <div class="aq-type">${item.type}</div>
        <div class="aq-desc">${item.desc}</div>
        <div class="aq-meta">${item.meta}</div>
        <div class="aq-actions">
          <button class="btn btn-sm btn-approve" onclick="approveQueueItem(${i})">Approve</button>
          <button class="btn btn-sm btn-reject"  onclick="rejectQueueItem(${i})">Reject</button>
        </div>
      </div>`).join('');
  }

  streamAgentLog('billing-agent-log', 'billing');
}

function approveQueueItem(idx) {
  showToast('Approved ✓', 'success');
  const el = document.getElementById('aq-' + idx);
  if (el) { el.style.transition='opacity .3s'; el.style.opacity='.35'; el.querySelector('.btn-approve').textContent='Approved ✓'; el.querySelector('.btn-approve').disabled=true; el.querySelector('.btn-reject').disabled=true; }
}

function rejectQueueItem(idx) {
  showToast('Rejected — sent back to Billing AI Agent', 'warn');
  const el = document.getElementById('aq-' + idx);
  if (el) { el.style.transition='opacity .3s'; el.style.opacity='.35'; el.querySelector('.btn-reject').textContent='Rejected'; el.querySelector('.btn-approve').disabled=true; el.querySelector('.btn-reject').disabled=true; }
}

function streamAgentLog(elId, key) {
  const newLines = [
    { cls:'info',    text:'> [07:17:03] Processing batch BB-MAY-005 (Gujarat)…' },
    { cls:'success', text:'> [07:17:11] 221 sites validated — no anomalies ✓' },
    { cls:'warn',    text:'> [07:17:22] Rate anomaly in GJ-4401: tariff mismatch ⚠️' },
    { cls:'muted',   text:'> [07:17:35] Queuing GJ-4401 for human review…' },
  ];
  let i = 0;
  const interval = setInterval(() => {
    if (i >= newLines.length) { clearInterval(interval); return; }
    const el = document.getElementById(elId);
    if (!el) { clearInterval(interval); return; }
    const div = document.createElement('div');
    div.className = 'log-line ' + newLines[i].cls;
    div.textContent = newLines[i].text;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    i++;
  }, 2200);
}

/* ── NOTIFICATIONS ───────────────────────────────────────────── */
function renderNotifications() {
  const el = document.getElementById('notif-items');
  if (!el) return;
  const notifViews = ['validation','validation','billing','validation','disputes','vendors'];
  el.innerHTML = DATA.notifications.map((n, i) => `
    <div class="notif-item">
      <div class="ni-dot" style="background:${n.color}"></div>
      <div style="flex:1">
        <div class="ni-text"><strong>${n.title}</strong></div>
        <div class="ni-text">${n.sub}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.35rem">
          <div class="ni-time">${n.time}</div>
          <button class="btn btn-sm btn-review" style="font-size:.65rem;padding:2px 8px"
            onclick="document.getElementById('notif-panel').classList.remove('open');document.getElementById('notif-overlay').classList.remove('open');navTo('${notifViews[i]||'dashboard'}')">
            View →
          </button>
        </div>
      </div>
    </div>`).join('');
}

/* ── TABLE FILTER ────────────────────────────────────────────── */
function filterTable(tableId, query) {
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
  });
}

function filterChip(chipEl, tableId, status) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chipEl.classList.add('active');
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(row => {
    if (!status) { row.style.display = ''; return; }
    row.style.display = row.dataset.status === status ? '' : 'none';
  });
}

/* ── MODAL ───────────────────────────────────────────────────── */
function openModal(batchId, type) {
  const b = DATA.billingBatches.find(x => x.id === batchId);
  const overlay = document.getElementById('modal-overlay');
  const title   = document.getElementById('modal-title');
  const body    = document.getElementById('modal-body');
  const btn     = document.getElementById('modal-confirm-btn');
  const footer  = document.getElementById('modal-footer');
  if (footer) footer.style.display = 'flex';

  if (type === 'approve') {
    title.textContent = 'Approve Billing Batch';
    body.innerHTML = `
      <p>You are about to approve <strong>${batchId}</strong> for submission to AP/SAP.</p>
      <br/>
      <table style="width:100%;font-size:.82rem">
        <tr><td style="color:var(--muted);padding:.3rem 0">Circle</td><td><strong>${b.circle}</strong></td></tr>
        <tr><td style="color:var(--muted);padding:.3rem 0">Sites</td><td><strong>${b.sites}</strong></td></tr>
        <tr><td style="color:var(--muted);padding:.3rem 0">EB Amount</td><td><strong>₹${b.eb}Cr</strong></td></tr>
        <tr><td style="color:var(--muted);padding:.3rem 0">DG Amount</td><td><strong>₹${b.dg}Cr</strong></td></tr>
        <tr><td style="color:var(--muted);padding:.3rem 0">Total</td><td><strong style="color:var(--green)">₹${b.total}Cr</strong></td></tr>
        <tr><td style="color:var(--muted);padding:.3rem 0">AI Verdict</td><td><strong style="color:var(--green)">${b.verdict}</strong></td></tr>
      </table>`;
    btn.textContent = 'Confirm Approval';
    btn.onclick = () => { closeModal(); showToast(`${batchId} approved & submitted to SAP ✓`, 'success'); };
  } else {
    title.textContent = 'Review Flagged Batch';
    body.innerHTML = `
      <p>Batch <strong>${batchId}</strong> has been flagged by the AI Validation Engine.</p>
      <br/>
      <div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:8px;padding:.85rem;margin-bottom:1rem">
        <div style="font-size:.72rem;font-weight:700;color:var(--amber);margin-bottom:.3rem">⚠️ AI Verdict: ${b.verdict}</div>
        <div style="font-size:.8rem;color:var(--text-2)">The Billing AI Agent has identified an anomaly. Review before approving or rejecting.</div>
      </div>
      <p style="font-size:.82rem;color:var(--text-2)">Override and approve, or send back to the AI agent for further analysis?</p>`;
    btn.textContent = 'Override & Approve';
    btn.onclick = () => { closeModal(); showToast(`${batchId} approved with override ⚠️`, 'warn'); };
  }
  overlay.classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  const footer = document.getElementById('modal-footer');
  if (footer) footer.style.display = 'flex';
}

/* ── TOAST ───────────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const icons = { success:'✓', info:'ℹ', warn:'⚠' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/* ── NOTIFICATION BUTTON ─────────────────────────────────────── */
function initNotifButton() {
  const btn     = document.getElementById('notif-btn');
  const panel   = document.getElementById('notif-panel');
  const overlay = document.getElementById('notif-overlay');
  btn.addEventListener('click', () => {
    panel.classList.add('open');
    overlay.classList.add('open');
  });
}

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initNotifButton();

  renderQuickActions();
  renderFlaggedList();
  renderInsights();
  renderBillingTable();
  renderValidationChecks();
  renderVendors();
  renderSiteMap();
  renderAnomalyTable();
  renderDisputes();
  renderAgentMonitor();
  renderNotifications();

  // Initialize the first step in the pipeline Command Centre on load
  switchWorkflowStep(1);

  setTimeout(() => {
    document.querySelectorAll('.kpi-value[data-target]').forEach(el => {
      animateKPI(el, el.dataset.target);
    });
    drawConsumptionChart();
  }, 200);

  window.addEventListener('resize', drawConsumptionChart);

  setTimeout(() => {
    const bar = document.querySelector('.ap-bar');
    if (bar) bar.style.width = '78.2%';
  }, 3000);
});

/* ── WORKFLOW PIPELINE ENGINE ──────────────────────────────── */
function switchWorkflowStep(stepNum) {
  // Go to the dashboard view
  switchView('dashboard');
  
  // Update state currentStep
  workflowState.currentStep = stepNum;
  
  // Highlight sidebar pipeline
  document.querySelectorAll('.pipeline-step').forEach(step => {
    step.classList.remove('active');
    const sNum = parseInt(step.dataset.step);
    if (sNum === stepNum) {
      step.classList.add('active');
    }
  });
  
  // Highlight horizontal stepper nodes
  document.querySelectorAll('.step-node').forEach(node => {
    node.classList.remove('active');
    const sNum = parseInt(node.dataset.step);
    if (sNum === stepNum) {
      node.classList.add('active');
    }
  });
  
  // Set stepper line fill width
  const fillPct = ((stepNum - 1) / 5) * 100;
  const fillEl = document.getElementById('stepper-line-fill');
  if (fillEl) fillEl.style.width = fillPct + '%';
  
  // Show active step panel
  document.querySelectorAll('.step-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  const activePanel = document.getElementById('step-panel-' + stepNum);
  if (activePanel) activePanel.classList.add('active');
  
  // Update overall progress percentage
  updateOverallProgress();
  
  // Trigger specific step initializations
  if (stepNum === 3) {
    renderStep3Flags();
  } else if (stepNum === 4) {
    renderStep4Batches();
  }
}

function updateOverallProgress() {
  const progressPercent = Math.round((workflowState.currentStep / 6) * 100);
  const progBar = document.getElementById('cycle-progress-bar');
  const progTxt = document.getElementById('cycle-progress-text');
  if (progBar) progBar.style.width = progressPercent + '%';
  if (progTxt) progTxt.textContent = progressPercent + '% Complete';
}

function handleFileSelect(input, type) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    workflowState.files[type] = {
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      rows: type === 'eb' ? 1423 : 847
    };
    
    // Hide content upload, show preview row
    document.getElementById(type + '-upload-content').style.display = 'none';
    document.getElementById(type + '-file-preview').style.display = 'flex';
    document.getElementById(type + '-filename').textContent = file.name;
    document.getElementById(type + '-filemeta').textContent = `Sheet 'Consolidated' · ${workflowState.files[type].rows} rows found · ${workflowState.files[type].size}`;
    
    // Mark zone as attached
    document.getElementById(type + '-upload-zone').classList.add('attached');
    
    showToast(`Attached ${file.name} ✓`, 'success');
    
    // Check if both files are attached to enable start button
    checkInputsReady();
    
    // Render mini preview table of 5 rows
    renderFileTablePreview();
  }
}

function renderFileTablePreview() {
  const container = document.getElementById('attached-preview-section');
  if (!container) return;
  
  let ebHtml = '';
  let dgHtml = '';
  
  if (workflowState.files.eb) {
    ebHtml = `
      <div class="preview-table-container">
        <div class="preview-table-title">⚡ EB Invoice Preview (May 2026 - First 5 rows)</div>
        <table class="mini-preview-table">
          <thead>
            <tr><th>Site ID</th><th>Circle</th><th>Period</th><th>Consumed Units</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${DATA.mockEBBillsPreview.map(r => `
              <tr>
                <td class="mono" style="font-weight:700">${r.siteId}</td>
                <td>${r.circle}</td>
                <td>${r.period}</td>
                <td class="mono">${r.units}</td>
                <td class="mono" style="color:var(--blue-2)">${r.amount}</td>
                <td><span style="color:var(--muted);font-size:.65rem;font-weight:600">${r.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  if (workflowState.files.dg) {
    dgHtml = `
      <div class="preview-table-container">
        <div class="preview-table-title">🛢️ DG Invoice Preview (May 2026 - First 5 rows)</div>
        <table class="mini-preview-table">
          <thead>
            <tr><th>Site ID</th><th>Circle</th><th>Vendor</th><th>Run Hours</th><th>Diesel Qty</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${DATA.mockDGInvoicesPreview.map(r => `
              <tr>
                <td class="mono" style="font-weight:700">${r.siteId}</td>
                <td>${r.circle}</td>
                <td style="font-weight:500">${r.vendor}</td>
                <td class="mono">${r.runHours}</td>
                <td class="mono">${r.dieselQty}</td>
                <td class="mono" style="color:var(--amber-2)">${r.amount}</td>
                <td><span style="color:var(--muted);font-size:.65rem;font-weight:600">${r.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  if (ebHtml || dgHtml) {
    container.style.display = 'block';
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
        <div>${ebHtml}</div>
        <div>${dgHtml}</div>
      </div>
    `;
  } else {
    container.style.display = 'none';
  }
}

function downloadMockTemplate(type) {
  showToast(`Generating and downloading May 2026 ${type === 'eb' ? 'EB' : 'DG'} invoice template…`, 'info');
  setTimeout(() => {
    showToast(`Template ${type === 'eb' ? 'EB_Invoices_Template.xlsx' : 'DG_Invoices_Template.xlsx'} downloaded successfully ✓`, 'success');
  }, 1200);
}

function removeAttachedFile(type) {
  workflowState.files[type] = null;
  
  // Hide preview, show upload content
  document.getElementById(type + '-file-preview').style.display = 'none';
  document.getElementById(type + '-upload-content').style.display = 'flex';
  document.getElementById(type + '-file-input').value = '';
  
  // Remove attached class
  document.getElementById(type + '-upload-zone').classList.remove('attached');
  
  showToast(`Removed ${type === 'eb' ? 'EB' : 'DG'} attachment`, 'info');
  checkInputsReady();
  renderFileTablePreview();
}

function checkInputsReady() {
  const startBtn = document.getElementById('btn-start-ai');
  if (startBtn) {
    startBtn.disabled = !(workflowState.files.eb && workflowState.files.dg);
  }
}

let aiProcessingInterval = null;
function startAIScan() {
  switchWorkflowStep(2);
  
  workflowState.stepStatus[1] = 'completed';
  workflowState.stepStatus[2] = 'active';
  
  const step1Badge = document.getElementById('pipe-status-1');
  const step2Badge = document.getElementById('pipe-status-2');
  if (step1Badge) {
    step1Badge.textContent = '✓ Done';
    step1Badge.className = 'step-status-badge completed';
  }
  if (step2Badge) {
    step2Badge.textContent = '⚡ Active';
    step2Badge.className = 'step-status-badge active';
  }
  
  const node1 = document.getElementById('step-node-1');
  const node2 = document.getElementById('step-node-2');
  if (node1) node1.className = 'step-node completed';
  if (node2) node2.className = 'step-node active';
  
  const consoleEl = document.getElementById('step-ai-console');
  if (consoleEl) consoleEl.innerHTML = '<div class="log-line info">> [07:18:00] Initializing Billing AI Agent orchestration...</div>';
  
  let progress = 0;
  let logsCount = 0;
  
  const stepLogs = [
    { text: '> [07:18:05] Unified Orchestrator: Parsing May 2026 EB invoices...', type: 'info' },
    { text: '> [07:18:08] Unified Orchestrator: Parsing May 2026 DG vendor invoices...', type: 'info' },
    { text: '> [07:18:12] Billing Agent: Matching 1,423 EB rows against DCEM readings...', type: 'muted' },
    { text: '> [07:18:15] Rate Check: LT tariff code validation started for all circles...', type: 'info' },
    { text: '> [07:18:20] Rate Check: Billed rates cross-referenced against master tariff sheets...', type: 'info' },
    { text: '> [07:18:25] Rate Check: 47 LT category tariff anomalies flagged in Tamil Nadu ⚠️', type: 'warn' },
    { text: '> [07:18:30] 24hr Check: High deviation analysis running for EB + DG combined...', type: 'muted' },
    { text: '> [07:18:35] 24hr Check: 14 sites exceed the 24-hour limit combined! Release for DOA approval ⚠️', type: 'warn' },
    { text: '> [07:18:40] Diesel Check: Reconciling DG vendor run hours against DCEM logs...', type: 'muted' },
    { text: '> [07:18:45] DCEM Check: Match accuracy calculated at 98.1% across validated sites ✓', type: 'success' },
    { text: '> [07:18:50] Intel Engine: Site anomaly detection and peer comparison complete ✓', type: 'success' },
    { text: '> [07:18:55] Billing Agent: All checks completed. 8 anomalies queued for human review.', type: 'success' }
  ];
  
  for (let i = 1; i <= 6; i++) {
    const bar = document.getElementById('vp-bar-' + i);
    const pctTxt = document.getElementById('vp-pct-' + i);
    if (bar) {
      bar.style.width = '0%';
      bar.className = 'vp-bar';
    }
    if (pctTxt) pctTxt.textContent = '0%';
  }
  
  if (aiProcessingInterval) clearInterval(aiProcessingInterval);
  
  aiProcessingInterval = setInterval(() => {
    progress += 2.5;
    if (progress > 100) progress = 100;
    
    const overallPct = document.getElementById('validation-overall-pct');
    if (overallPct) overallPct.textContent = Math.round(progress) + '%';
    
    if (Math.round(progress) % 8 === 0 && logsCount < stepLogs.length) {
      const log = stepLogs[logsCount];
      const logLine = document.createElement('div');
      logLine.className = 'log-line ' + log.type;
      logLine.textContent = log.text;
      if (consoleEl) {
        consoleEl.appendChild(logLine);
        consoleEl.scrollTop = consoleEl.scrollHeight;
      }
      logsCount++;
    }
    
    if (progress < 20) {
      const pct = Math.round((progress / 20) * 100);
      updateBar(1, pct, 'green');
    } else if (progress < 40) {
      updateBar(1, 100, 'green');
      const pct = Math.round(((progress - 20) / 20) * 100);
      updateBar(2, pct, 'amber');
    } else if (progress < 55) {
      updateBar(2, 100, 'amber');
      const pct = Math.round(((progress - 40) / 15) * 100);
      updateBar(3, pct, 'red');
    } else if (progress < 70) {
      updateBar(3, 100, 'red');
      const pct = Math.round(((progress - 55) / 15) * 100);
      updateBar(4, pct, 'green');
    } else if (progress < 85) {
      updateBar(4, 100, 'green');
      const pct = Math.round(((progress - 70) / 15) * 100);
      updateBar(5, pct, 'green');
    } else {
      updateBar(5, 100, 'green');
      const pct = Math.round(((progress - 85) / 15) * 100);
      updateBar(6, pct, 'green');
    }
    
    if (progress === 100) {
      clearInterval(aiProcessingInterval);
      updateBar(6, 100, 'green');
      
      showToast('Billing AI Agent Scan Complete! 8 anomalies found.', 'success');
      
      const pauseBtn = document.getElementById('btn-pause-ai');
      const proceedBtn = document.getElementById('btn-proceed-to-review');
      if (pauseBtn) pauseBtn.style.display = 'none';
      if (proceedBtn) proceedBtn.style.display = 'block';
    }
  }, 150);
}

function updateBar(barId, pct, color) {
  const bar = document.getElementById('vp-bar-' + barId);
  const text = document.getElementById('vp-pct-' + barId);
  if (bar) {
    bar.style.width = pct + '%';
    bar.className = 'vp-bar ' + color;
  }
  if (text) text.textContent = pct + '%';
}

function pauseAIScan() {
  if (aiProcessingInterval) {
    clearInterval(aiProcessingInterval);
    showToast('AI validation scan paused.', 'warn');
    const pauseBtn = document.getElementById('btn-pause-ai');
    if (pauseBtn) {
      pauseBtn.textContent = 'Resume Scan';
      pauseBtn.onclick = resumeAIScan;
    }
  }
}

function resumeAIScan() {
  showToast('Resuming AI validation scan...', 'info');
  const pauseBtn = document.getElementById('btn-pause-ai');
  if (pauseBtn) {
    pauseBtn.textContent = 'Pause Scan';
    pauseBtn.onclick = pauseAIScan;
  }
  const currPct = parseInt(document.getElementById('validation-overall-pct').textContent);
  startAIScanFromPct(currPct);
}

function startAIScanFromPct(startPct) {
  const consoleEl = document.getElementById('step-ai-console');
  let progress = startPct;
  
  if (aiProcessingInterval) clearInterval(aiProcessingInterval);
  
  aiProcessingInterval = setInterval(() => {
    progress += 2.5;
    if (progress > 100) progress = 100;
    
    const overallPct = document.getElementById('validation-overall-pct');
    if (overallPct) overallPct.textContent = Math.round(progress) + '%';
    
    if (progress < 20) {
      const pct = Math.round((progress / 20) * 100);
      updateBar(1, pct, 'green');
    } else if (progress < 40) {
      updateBar(1, 100, 'green');
      const pct = Math.round(((progress - 20) / 20) * 100);
      updateBar(2, pct, 'amber');
    } else if (progress < 55) {
      updateBar(2, 100, 'amber');
      const pct = Math.round(((progress - 40) / 15) * 100);
      updateBar(3, pct, 'red');
    } else if (progress < 70) {
      updateBar(3, 100, 'red');
      const pct = Math.round(((progress - 55) / 15) * 100);
      updateBar(4, pct, 'green');
    } else if (progress < 85) {
      updateBar(4, 100, 'green');
      const pct = Math.round(((progress - 70) / 15) * 100);
      updateBar(5, pct, 'green');
    } else {
      updateBar(5, 100, 'green');
      const pct = Math.round(((progress - 85) / 15) * 100);
      updateBar(6, pct, 'green');
    }
    
    if (progress === 100) {
      clearInterval(aiProcessingInterval);
      updateBar(6, 100, 'green');
      
      showToast('Billing AI Agent Scan Complete! 8 anomalies found.', 'success');
      
      const pauseBtn = document.getElementById('btn-pause-ai');
      const proceedBtn = document.getElementById('btn-proceed-to-review');
      if (pauseBtn) pauseBtn.style.display = 'none';
      if (proceedBtn) proceedBtn.style.display = 'block';
    }
  }, 150);
}

let stepFlagsState = [];
function renderStep3Flags() {
  const el = document.getElementById('step-flags-list');
  if (!el) return;
  
  if (stepFlagsState.length === 0) {
    stepFlagsState = DATA.flaggedItems.map(item => ({
      ...item,
      reviewed: false,
      verdict: null,
      selected: false
    }));
  }
  
  const trueSiteIds = [
    'MH-3421',
    'DL-0892',
    'TN-0441',
    'RJ-1104',
    'OD-0772',
    'MP-2201',
    'DL-0119',
    'GJ-2201'
  ];

  const cleanAnomalies = [
    'DG vs EB Combined Exceeds 24-Hour Cap',
    'Diesel Fuel Consumption Mismatch',
    'Tariff Rate Classification Mismatch',
    'DCEM Telematics Meter Mismatch',
    '24-Hour Cap Outlier Deviation',
    'Tariff Code Misclassification',
    'Diesel Volume Input vs Consumption Gap > 8%',
    'Electricity Board Invoice Missing'
  ];

  const rows = stepFlagsState.map((f, idx) => {
    let statusBadge = '';
    if (f.verdict === 'approved') statusBadge = '<span class="status-pill approved" style="font-size:.65rem;padding:2px 8px;font-weight:700">✓ Approved</span>';
    else if (f.verdict === 'escalated') statusBadge = '<span class="status-pill flagged" style="font-size:.65rem;padding:2px 8px;font-weight:700">⚠️ Escalated</span>';
    else if (f.verdict === 'dismissed') statusBadge = '<span class="status-pill pending" style="font-size:.65rem;padding:2px 8px;color:var(--text-2);background:rgba(15, 23, 42, 0.04)">✕ Dismissed</span>';
    else statusBadge = `<span class="status-pill pending" style="font-size:.65rem;padding:2px 8px">⏳ Pending</span>`;

    const rowOpacity = f.reviewed ? 'opacity:.5' : '';
    const siteId = trueSiteIds[idx] || 'Site Specific';
    const anomalyFound = cleanAnomalies[idx] || f.title;
    const isChecked = f.selected ? 'checked' : '';
    const isDisabled = f.reviewed ? 'disabled' : '';

    return `
      <tr class="flagged-row" id="flag-row-${idx}" onclick="showStepFlagDetail(${idx})" style="cursor:pointer; ${rowOpacity}">
        <td style="padding:.65rem .75rem; text-align:center; vertical-align:middle;" onclick="event.stopPropagation();">
          <input type="checkbox" class="bac-checkbox" ${isChecked} ${isDisabled} onclick="toggleFlagSelection(${idx}, this.checked)" style="width:14px; height:14px; cursor:pointer;" />
        </td>
        <td style="padding:.65rem .75rem; vertical-align:middle;">
          <div style="display:flex; align-items:center; gap:.4rem;">
            <div class="flagged-dot ${f.sev}" style="margin:0; flex-shrink:0;"></div>
            <span class="fi-badge ${f.sev}" style="font-size:.58rem">${f.sev.toUpperCase()}</span>
          </div>
        </td>
        <td style="padding:.65rem .75rem; color:var(--text); font-family:var(--mono); font-weight:700; font-size:.78rem; vertical-align:middle;">${siteId}</td>
        <td style="padding:.65rem .75rem; font-weight:600; color:var(--text-2); vertical-align:middle; font-size:.76rem;">${anomalyFound}</td>
        <td style="padding:.65rem .75rem; vertical-align:middle;">${statusBadge}</td>
        <td style="padding:.65rem .75rem; text-align:right; vertical-align:middle;">
          <button class="btn btn-sm btn-review" style="font-size:.68rem; padding:3px 9px;" onclick="event.stopPropagation(); showStepFlagDetail(${idx})">Inspect</button>
        </td>
      </tr>
    `;
  }).join('');

  el.innerHTML = `
    <div class="table-wrap" style="margin:0; max-height:360px; overflow-y:auto;">
      <table class="data-table" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th style="font-size:.68rem; padding:.6rem .75rem; text-align:center; width:40px;">
              <input type="checkbox" id="select-all-flags" onclick="selectAllFlags(this.checked)" style="width:14px; height:14px; cursor:pointer;" />
            </th>
            <th style="font-size:.68rem; padding:.6rem .75rem;">Severity</th>
            <th style="font-size:.68rem; padding:.6rem .75rem;">Site ID</th>
            <th style="font-size:.68rem; padding:.6rem .75rem;">Anomaly Found</th>
            <th style="font-size:.68rem; padding:.6rem .75rem;">Status</th>
            <th style="font-size:.68rem; padding:.6rem .75rem; text-align:right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
  updateStep3KPIs();
  updateFlagsSelectionSummary();
}

function updateStep3KPIs() {
  if (stepFlagsState.length === 0) return;
  const highUnreviewed = stepFlagsState.filter(f => !f.reviewed && f.sev === 'high').length;
  const medUnreviewed  = stepFlagsState.filter(f => !f.reviewed && f.sev === 'med').length;
  const reviewedCount   = stepFlagsState.filter(f => f.reviewed).length;
  const totalCount      = stepFlagsState.length;

  const highEl = document.getElementById('s3-kpi-high');
  const medEl  = document.getElementById('s3-kpi-med');
  const revEl  = document.getElementById('s3-kpi-reviewed');
  const iconEl = document.getElementById('s3-kpi-reviewed-icon');

  if (highEl) highEl.textContent = highUnreviewed;
  if (medEl) medEl.textContent = medUnreviewed;
  if (revEl) revEl.textContent = `${reviewedCount} / ${totalCount}`;
  
  if (iconEl) {
    if (reviewedCount === totalCount) {
      iconEl.innerHTML = '<span style="line-height: 1;">✅</span>';
      iconEl.style.background = 'rgba(16,185,129,.12)';
      iconEl.style.color = 'var(--green)';
    } else {
      iconEl.innerHTML = '<span style="line-height: 1;">⏳</span>';
      iconEl.style.background = 'rgba(59,130,246,.12)';
      iconEl.style.color = 'var(--blue)';
    }
  }

  // Update Reason-level breakdown counts (unreviewed only)
  const categories = { cap: 0, diesel: 0, tariff: 0, dcem: 0, gap: 0 };
  const flagCategories = ['cap', 'diesel', 'tariff', 'dcem', 'cap', 'tariff', 'diesel', 'gap'];
  
  stepFlagsState.forEach((f, idx) => {
    if (!f.reviewed) {
      const cat = flagCategories[idx];
      if (categories[cat] !== undefined) {
        categories[cat]++;
      }
    }
  });

  const capEl = document.getElementById('reason-cap-count');
  const dieselEl = document.getElementById('reason-diesel-count');
  const tariffEl = document.getElementById('reason-tariff-count');
  const dcemEl = document.getElementById('reason-dcem-count');
  const gapEl = document.getElementById('reason-gap-count');

  if (capEl) capEl.textContent = categories.cap;
  if (dieselEl) dieselEl.textContent = categories.diesel;
  if (tariffEl) tariffEl.textContent = categories.tariff;
  if (dcemEl) dcemEl.textContent = categories.dcem;
  if (gapEl) gapEl.textContent = categories.gap;
}

function toggleFlagSelection(idx, checked) {
  stepFlagsState[idx].selected = checked;
  updateFlagsSelectionSummary();
}

function selectAllFlags(checked) {
  stepFlagsState.forEach(f => {
    if (!f.reviewed) f.selected = checked;
  });
  renderStep3Flags();
  updateFlagsSelectionSummary();
}

function updateFlagsSelectionSummary() {
  const selectedItems = stepFlagsState.filter(f => f.selected && !f.reviewed);
  const count = selectedItems.length;
  
  const container = document.getElementById('s3-bulk-actions-container');
  const label = document.getElementById('s3-selected-count');
  
  if (container && label) {
    if (count > 0) {
      container.style.display = 'flex';
      label.innerHTML = `Selected: <strong>${count}</strong>`;
    } else {
      container.style.display = 'none';
    }
  }
  
  // Update Select All Checkbox state in the table header
  const selectAllCheckbox = document.getElementById('select-all-flags');
  if (selectAllCheckbox) {
    const activeUnreviewed = stepFlagsState.filter(f => !f.reviewed).length;
    selectAllCheckbox.checked = count === activeUnreviewed && activeUnreviewed > 0;
  }
}

function bulkResolveFlags(verdict) {
  const selectedItems = stepFlagsState.filter(f => f.selected && !f.reviewed);
  const count = selectedItems.length;
  if (count === 0) return;
  
  selectedItems.forEach(f => {
    f.reviewed = true;
    f.verdict = verdict;
    f.selected = false;
  });
  
  const verdictsText = {
    approved: 'Approved',
    escalated: 'Escalated to DOA',
    dismissed: 'Dismissed'
  };
  
  const types = {
    approved: 'success',
    escalated: 'warn',
    dismissed: 'info'
  };
  
  showToast(`Bulk resolved ${count} flags as: ${verdictsText[verdict]} ✓`, types[verdict]);
  
  renderStep3Flags();
  checkFlagsReviewComplete();
  updateFlagsSelectionSummary();
}


function showStepFlagDetail(idx, openModalWindow = true) {
  const f = stepFlagsState[idx];
  
  const trueSiteIds = [
    'MH-3421',
    'DL-0892',
    'TN-0441',
    'RJ-1104',
    'OD-0772',
    'MP-2201',
    'DL-0119',
    'GJ-2201'
  ];

  const cleanAnomalies = [
    'DG vs EB Combined Exceeds 24-Hour Cap',
    'Diesel Fuel Consumption Mismatch',
    'Tariff Rate Classification Mismatch',
    'DCEM Telematics Meter Mismatch',
    '24-Hour Cap Outlier Deviation',
    'Tariff Code Misclassification',
    'Diesel Volume Input vs Consumption Gap > 8%',
    'Electricity Board Invoice Missing'
  ];

  const siteId = trueSiteIds[idx] || 'Site Specific';
  const anomalyFound = cleanAnomalies[idx] || f.title;
  
  // Highlight the selected row in the full-width table
  document.querySelectorAll('.flagged-row').forEach((row, i) => {
    if (i === idx) {
      row.style.background = 'rgba(59, 130, 246, 0.08)';
    } else {
      row.style.background = '';
    }
  });

  if (!openModalWindow) return;

  // Open inspection modal
  const overlay = document.getElementById('modal-overlay');
  const title   = document.getElementById('modal-title');
  const body    = document.getElementById('modal-body');
  const footer  = document.getElementById('modal-footer');

  title.innerHTML = `<span style="font-size:1.15rem;margin-right:.4rem;">🔍</span> Audit Inspection: ${siteId} - ${anomalyFound}`;
  
  const reasoning = {
    high: 'Billing AI Agent detected a critical deviation where the combined diesel generator hours and electricity board active hours exceeded the 24-hour limit in a single calendar day. This suggests either a data entry error, meter drift, or fuel theft. A physical load study and calibration audit is recommended.',
    med: 'Billing AI Agent matched the current tariff category against the historical contract catalog. Identified LT commercial units misclassified under domestic infrastructure pricing. Retrospective savings estimated at ₹3.9 Lakhs.',
    low: 'Minor diesel discrepancy detected where vendor volume is slightly outside the normal 8% peer cluster variance. Release for normal payout recommended after standard query dispatch.'
  };

  body.innerHTML = `
    <div style="background:rgba(15, 23, 42, 0.02); border:1px solid var(--border); border-radius:8px; padding:1rem; margin-bottom:1.1rem;">
      <div style="font-size:.65rem; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin-bottom:.2rem;">Batch Reference</div>
      <div style="font-size:.82rem; font-weight:600; color:var(--text); font-family:var(--mono);">${f.sub}</div>
    </div>

    <div class="flag-reasoning-box ${f.sev}" style="margin-bottom:1.1rem; padding:1.1rem; border-radius:8px; border:1px solid ${f.sev === 'high' ? 'rgba(239, 68, 68, 0.2)' : f.sev === 'med' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)'}; background:${f.sev === 'high' ? 'rgba(239, 68, 68, 0.06)' : f.sev === 'med' ? 'rgba(245, 158, 11, 0.06)' : 'rgba(59, 130, 246, 0.06)'};">
      <div class="flag-reason-title ${f.sev}" style="font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:.4rem; color:${f.sev === 'high' ? 'var(--red)' : f.sev === 'med' ? 'var(--amber)' : 'var(--blue)'};">🧠 AI Agent Insights & Recommendation</div>
      <p style="font-size:.8rem; color:var(--text-2); line-height:1.55; margin:0;">${reasoning[f.sev] || reasoning.low}</p>
    </div>
    
    <div style="margin-bottom:1.25rem; background:var(--bg-card-2); border:1px solid var(--border); border-radius:8px; padding:.4rem .85rem;">
      <div class="fd-row" style="display:flex; justify-content:space-between; padding:.4rem 0; border-bottom:1px solid rgba(15,23,42,0.04); font-size:.8rem;"><span class="fd-label" style="color:var(--muted);">Circle</span><span class="fd-val" style="font-weight:600; color:var(--text);">${f.sub.split(' · ')[0]}</span></div>
      <div class="fd-row" style="display:flex; justify-content:space-between; padding:.4rem 0; border-bottom:1px solid rgba(15,23,42,0.04); font-size:.8rem;"><span class="fd-label" style="color:var(--muted);">Anomaly Risk Score</span><span class="fd-val" style="font-weight:600; color:var(--red);">92% Confidence</span></div>
      <div class="fd-row" style="display:flex; justify-content:space-between; padding:.4rem 0; border-bottom:1px solid rgba(15,23,42,0.04); font-size:.8rem;"><span class="fd-label" style="color:var(--muted);">Impact Amount</span><span class="fd-val" style="font-weight:600; color:var(--amber); font-family:var(--mono);">₹1,24,000</span></div>
      <div class="fd-row" style="display:flex; justify-content:space-between; padding:.4rem 0; font-size:.8rem;"><span class="fd-label" style="color:var(--muted);">DCEM Meter Matches</span><span class="fd-val" style="font-weight:600; color:var(--green);">Unmatched Variance</span></div>
    </div>
    
    <div style="display:flex; gap:.5rem; flex-wrap:wrap; justify-content:flex-end; border-top:1px solid var(--border); padding-top:1rem;">
      <button class="btn btn-sm btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-sm btn-approve" onclick="resolveStepFlagModal(${idx}, 'approved')" ${f.verdict === 'approved' ? 'disabled' : ''}>✓ Approve Variance</button>
      <button class="btn btn-sm btn-reject" onclick="resolveStepFlagModal(${idx}, 'escalated')" ${f.verdict === 'escalated' ? 'disabled' : ''}>⚠️ Escalate to DOA</button>
      <button class="btn btn-sm btn-outline" style="color:var(--muted);" onclick="resolveStepFlagModal(${idx}, 'dismissed')" ${f.verdict === 'dismissed' ? 'disabled' : ''}>✕ Dismiss Flag</button>
    </div>
  `;

  // Hide global footer
  if (footer) footer.style.display = 'none';
  
  overlay.classList.add('open');
}

function resolveStepFlag(idx, verdict) {
  stepFlagsState[idx].reviewed = true;
  stepFlagsState[idx].verdict = verdict;
  
  const msgs = {
    approved: ['Approved billing variance.', 'success'],
    escalated: ['Escalated flag to DOA panel.', 'warn'],
    dismissed: ['Dismissed invoice discrepancy.', 'info']
  };
  
  showToast(msgs[verdict][0], msgs[verdict][1]);
  renderStep3Flags();
  
  showStepFlagDetail(idx, false);
  
  checkFlagsReviewComplete();
}

function resolveStepFlagModal(idx, verdict) {
  resolveStepFlag(idx, verdict);
  closeModal();
}

function checkFlagsReviewComplete() {
  const unreviewedImportant = stepFlagsState.filter(f => !f.reviewed && (f.sev === 'high' || f.sev === 'med')).length;
  const proceedBtn = document.getElementById('btn-proceed-to-approval');
  if (proceedBtn) {
    proceedBtn.disabled = unreviewedImportant > 0;
  }
}

function autoApproveRemainingFlags() {
  stepFlagsState.forEach((f, idx) => {
    if (!f.reviewed && f.sev === 'low') {
      f.reviewed = true;
      f.verdict = 'approved';
    }
  });
  showToast('Auto-approved remaining low risk flags ✓', 'success');
  renderStep3Flags();
  checkFlagsReviewComplete();
}

let stepBatchesState = [];
function renderStep4Batches() {
  const el = document.getElementById('step-batches-grid');
  if (!el) return;
  
  if (stepBatchesState.length === 0) {
    stepBatchesState = DATA.billingBatches.map(b => ({
      ...b,
      selected: false,
      approved: b.status === 'Approved'
    }));
  }
  
  el.innerHTML = stepBatchesState.map((b, idx) => `
    <div class="batch-approval-card ${b.selected ? 'selected' : ''}" 
         onclick="toggleBatchSelection(${idx})">
      <div class="bac-header">
        <span class="bac-circle" style="font-weight:700">${b.circle}</span>
        <span class="bac-verdict ${b.verdict === 'Clean' ? 'clean' : 'flagged'}">${b.verdict}</span>
      </div>
      <div style="font-size:.65rem;color:var(--muted);margin-bottom:.5rem">${b.id} · ${b.sites} sites</div>
      <div class="bac-amount-row"><span>EB Amount:</span><span class="mono">₹${b.eb}Cr</span></div>
      <div class="bac-amount-row"><span>DG Amount:</span><span class="mono">₹${b.dg}Cr</span></div>
      <div class="bac-total-row">
        <span>Total:</span>
        <span class="mono" style="color:${b.approved ? 'var(--green)' : 'var(--text)'}">₹${b.total}Cr</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.75rem">
        <input type="checkbox" class="bac-checkbox" ${b.selected ? 'checked' : ''} ${b.approved ? 'disabled' : ''} onclick="event.stopPropagation(); toggleBatchSelection(${idx})" />
        <span style="font-size:.68rem;font-weight:700;color:${b.approved ? 'var(--green)' : 'var(--amber)'}">
          ${b.approved ? '✓ Approved & SAP Posted' : '⏳ Awaiting Release'}
        </span>
      </div>
    </div>
  `).join('');
  
  updateBatchesSelectionSummary();
}

function toggleBatchSelection(idx) {
  if (stepBatchesState[idx].approved) return;
  stepBatchesState[idx].selected = !stepBatchesState[idx].selected;
  renderStep4Batches();
}

function selectAllBatchesForApproval(select) {
  stepBatchesState.forEach(b => {
    if (!b.approved) b.selected = select;
  });
  
  const selectAllBtn = document.getElementById('btn-select-all');
  if (selectAllBtn) {
    if (select) {
      selectAllBtn.textContent = 'Deselect All';
      selectAllBtn.onclick = () => selectAllBatchesForApproval(false);
    } else {
      selectAllBtn.textContent = 'Select All';
      selectAllBtn.onclick = () => selectAllBatchesForApproval(true);
    }
  }
  
  renderStep4Batches();
}

function updateBatchesSelectionSummary() {
  const selectedBatches = stepBatchesState.filter(b => b.selected);
  const count = selectedBatches.length;
  const value = selectedBatches.reduce((acc, b) => acc + b.total, 0).toFixed(2);
  
  const summaryEl = document.getElementById('selection-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `Selected: <strong>${count}</strong> batches · <strong style="color:var(--green)">₹${value} Cr</strong> total value`;
  }
  
  const approveBtn = document.getElementById('btn-bulk-approve');
  if (approveBtn) {
    approveBtn.disabled = count === 0;
  }
}

function approveSelectedBatches() {
  const selectedBatches = stepBatchesState.filter(b => b.selected);
  const count = selectedBatches.length;
  const value = selectedBatches.reduce((acc, b) => acc + b.total, 0).toFixed(2);
  
  showToast(`Submitting ${count} batches worth ₹${value}Cr to SAP ERP/AP module...`, 'info');
  
  setTimeout(() => {
    stepBatchesState.forEach(b => {
      if (b.selected) {
        b.approved = true;
        b.selected = false;
      }
    });
    
    showToast(`SAP posting confirmed successfully for ₹${value}Cr!`, 'success');
    
    workflowState.stepStatus[2] = 'completed';
    workflowState.stepStatus[3] = 'completed';
    workflowState.stepStatus[4] = 'completed';
    workflowState.stepStatus[5] = 'active';
    
    const step2 = document.getElementById('pipe-status-2');
    const step3 = document.getElementById('pipe-status-3');
    const step4 = document.getElementById('pipe-status-4');
    const step5 = document.getElementById('pipe-status-5');
    if (step2) { step2.textContent = '✓ Done'; step2.className = 'step-status-badge completed'; }
    if (step3) { step3.textContent = '✓ Done'; step3.className = 'step-status-badge completed'; }
    if (step4) { step4.textContent = '✓ Done'; step4.className = 'step-status-badge completed'; }
    if (step5) { step5.textContent = '⚡ Active'; step5.className = 'step-status-badge active'; }
    
    const node2 = document.getElementById('step-node-2');
    const node3 = document.getElementById('step-node-3');
    const node4 = document.getElementById('step-node-4');
    const node5 = document.getElementById('step-node-5');
    if (node2) node2.className = 'step-node completed';
    if (node3) node3.className = 'step-node completed';
    if (node4) node4.className = 'step-node completed';
    if (node5) node5.className = 'step-node active';
    
    switchWorkflowStep(5);
    startOBRMInvoiceGenerationAnimation();
  }, 2000);
}

let obrmInvoiceInterval = null;
function startOBRMInvoiceGenerationAnimation() {
  const progBar = document.getElementById('ob-invoice-progress');
  if (!progBar) return;
  
  progBar.style.width = '0%';
  let progress = 0;
  
  if (obrmInvoiceInterval) clearInterval(obrmInvoiceInterval);
  
  obrmInvoiceInterval = setInterval(() => {
    progress += 4;
    if (progress > 100) progress = 100;
    
    progBar.style.width = progress + '%';
    
    if (progress === 100) {
      clearInterval(obrmInvoiceInterval);
      
      const viStatus = document.getElementById('ob-vi-status');
      if (viStatus) {
        viStatus.textContent = '✓ Generated';
        viStatus.className = 'status-tag success';
      }
      
      const nodeSub = document.getElementById('ob-node-submission');
      if (nodeSub) nodeSub.className = 'ob-node completed';
      
      const circSub = document.getElementById('ob-circle-submission');
      if (circSub) {
        circSub.textContent = '✓';
        circSub.style.background = 'var(--green)';
        circSub.style.borderColor = 'var(--green-2)';
      }
      const timeSub = document.getElementById('ob-time-submission');
      if (timeSub) timeSub.textContent = 'May 27, 2026 - 14:24';
      
      const circObrm = document.getElementById('ob-circle-obrm');
      if (circObrm) {
        circObrm.textContent = '✓';
        circObrm.className = 'ob-circle';
        circObrm.style.background = 'var(--green)';
        circObrm.style.borderColor = 'var(--green-2)';
      }
      
      showToast('OBRM generated all tax invoices! secure SFTP submissions completed ✓', 'success');
      
      const completeBtn = document.getElementById('btn-complete-billing');
      if (completeBtn) completeBtn.disabled = false;
    }
  }, 120);
}

function completeOperatorBilling() {
  workflowState.stepStatus[5] = 'completed';
  workflowState.stepStatus[6] = 'active';
  
  const step5 = document.getElementById('pipe-status-5');
  const step6 = document.getElementById('pipe-status-6');
  if (step5) { step5.textContent = '✓ Done'; step5.className = 'step-status-badge completed'; }
  if (step6) { step6.textContent = '⚡ Active'; step6.className = 'step-status-badge active'; }
  
  const node5 = document.getElementById('step-node-5');
  const node6 = document.getElementById('step-node-6');
  if (node5) node5.className = 'step-node completed';
  if (node6) node6.className = 'step-node active';
  
  showToast('Invoicing cycle finalized! AI Dispute agent active.', 'success');
  switchWorkflowStep(6);
}

function resetWorkflowCycle() {
  workflowState = {
    currentStep: 1,
    stepStatus: { 1: 'active', 2: 'pending', 3: 'pending', 4: 'pending', 5: 'pending', 6: 'pending' },
    files: { eb: null, dg: null },
    processingProgress: 0
  };
  
  removeAttachedFile('eb');
  removeAttachedFile('dg');
  
  for (let i = 1; i <= 6; i++) {
    const badge = document.getElementById('pipe-status-' + i);
    const node = document.getElementById('step-node-' + i);
    if (badge) {
      badge.textContent = i === 1 ? '⚡ Active' : '⏳ Pending';
      badge.className = 'step-status-badge ' + (i === 1 ? 'active' : 'pending');
    }
    if (node) {
      node.className = 'step-node ' + (i === 1 ? 'active' : '');
    }
  }
  
  stepFlagsState = [];
  stepBatchesState = [];
  
  showToast('Billing cycle reset to Step 1', 'info');
  switchWorkflowStep(1);
}

function startNewCycle() {
  showToast('Initializing a brand new billing cycle...', 'info');
  setTimeout(() => {
    resetWorkflowCycle();
    document.getElementById('ch-cycle-title').textContent = 'June 2026 Billing Cycle';
    
    const badge = document.querySelector('.cycle-badge');
    if (badge) {
      badge.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Billing Cycle: June 2026
      `;
    }
    showToast('June 2026 cycle started successfully! Attach raw EB/DG inputs.', 'success');
  }, 1000);
}

