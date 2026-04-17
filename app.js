let machineData = [];
let chartInstances = {};
let historyMap = {};

// Initialize machine history and populate pages
async function init() {
    try {
        const response = await fetch('data.json');
        machineData = await response.json();
        
        machineData.forEach(m => {
            historyMap[m.machine_id] = {
                temp: Array(30).fill(m.temperature),
                vib: Array(30).fill(m.vibration)
            };
        });

        // Initial population of all static page sections
        populateAllPages();
        renderInsights();
        startSimulation();
        
        // Default View
        showPage('digitalTwinPage');
    } catch (error) {
        console.error("Error loading machine data:", error);
    }
}

// Data Simulation
function startSimulation() {
    setInterval(() => {
        machineData.forEach(m => {
            const shiftT = (Math.random() - 0.5) * 4;
            const shiftV = (Math.random() - 0.5) * 0.6;
            
            m.temperature = Math.max(30, Math.min(110, m.temperature + shiftT));
            m.vibration = Math.max(0.1, Math.min(7, m.vibration + shiftV));

            const h = historyMap[m.machine_id];
            h.temp.push(m.temperature);
            h.vib.push(m.vibration);
            if (h.temp.length > 30) {
                h.temp.shift();
                h.vib.shift();
            }
        });
        
        updateLiveValues();
        updateCharts();
    }, 2000);
}

function updateLiveValues() {
    machineData.forEach(m => {
        const tempEls = document.querySelectorAll(`.live-temp-${m.machine_id}`);
        tempEls.forEach(el => el.textContent = `${m.temperature.toFixed(1)}°C`);
    });
}

/**
 * REQ: NAVIGATION SYSTEM FIX
 * Switches between persistent page sections
 */
function showPage(pageId) {
    // 1. Hide all pages
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.style.display = "none");

    // 2. Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.style.display = "block";
    }

    // 3. Update tab highlighting
    const tabs = {
        'digitalTwinPage': 'digitalTab',
        'alertStackPage': 'alertsTab',
        'analyticsPage': 'analyticsTab',
        'diagnosticsPage': 'diagnosticsTab'
    };
    
    document.querySelectorAll('.view-links a').forEach(tab => tab.classList.remove('active'));
    const activeTabId = tabs[pageId];
    if (activeTabId) {
        document.getElementById(activeTabId).classList.add('active');
    }

    // 4. Specific logic for re-rendering charts if digital twin is shown
    if (pageId === 'digitalTwinPage') {
        setTimeout(renderDigitalTwinChart, 50);
    }
}

function populateAllPages() {
    renderDigitalTwinContent();
    renderAlertStackContent();
    renderAnalyticsContent();
    renderDiagnosticsContent();
}

function renderDigitalTwinContent() {
    const m = machineData[0] || { machine_id: "N/A", temperature: 0 };
    const container = document.getElementById('digitalTwinPage');
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Digital Twin <span>Engine</span></h2>
                <div class="view-subtitle">
                    <span>${m.machine_id} Hybrid Reality Sync</span> • <span>Latency 4ms</span>
                </div>
            </div>
            <div class="view-metrics">
                <div class="metric-badge"><div class="m-label">Risk Score</div><div class="m-value">12<span>/100</span></div></div>
                <div class="metric-badge"><div class="m-label">Anomaly Timer</div><div class="m-value">00:04:12</div></div>
            </div>
        </div>
        <div class="telemetry-focus">
            <div class="focus-header"><h3>Vibration Baseline Analysis</h3></div>
            <div class="big-chart-wrap"><canvas id="big-telemetry-chart"></canvas></div>
        </div>
        <div class="metric-row">
            <div class="metric-card">
                <div class="metric-icon">🌡️</div>
                <div class="card-data">
                    <h4>Thermal Buffer</h4>
                    <div class="val live-temp-${m.machine_id}">${m.temperature.toFixed(1)}°C</div>
                    <div class="sub"><span>NOMINAL</span><span>LIMIT: 95°C</span></div>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">⚡</div>
                <div class="card-data">
                    <h4>Load Torque</h4>
                    <div class="val">1,240<span> Nm</span></div>
                    <div class="sub"><span>STABLE</span><span>PEAK: 1,800 Nm</span></div>
                </div>
            </div>
            <div class="metric-card" style="border-left: 2px solid var(--accent-red)">
                <div class="metric-icon" style="color: var(--accent-red)">📉</div>
                <div class="card-data">
                    <h4 style="color: var(--accent-red)">Drift Factor</h4>
                    <div class="val">0.082<span>σ</span></div>
                    <div class="sub"><span style="color:var(--accent-red); font-weight:800">ELEVATED VIBRATION DETECTED</span></div>
                </div>
            </div>
        </div>
    `;
}

function renderAlertStackContent() {
    const container = document.getElementById('alertStackPage');
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Smart <span>Prioritization</span></h2>
                <div class="view-subtitle"><span>Tactical overlay ranking critical system failures.</span></div>
            </div>
        </div>
        <div class="threat-stack">
            <div class="stack-card critical">
                <div class="stack-info">
                    <div class="m-label" style="color: var(--accent-red)">CRITICAL • ID: TK-9844-B</div>
                    <h3>Thermal Runaway: Primary Injector #4</h3>
                    <p>Vibration patterns suggest imminent structural failure. Projected business impact: <b>$12,400/hr</b>.</p>
                    <div class="stack-stats">
                        <div class="s-metric"><div class="l">Urgency</div><div class="v" style="color: var(--accent-red);">04m 12s</div></div>
                        <div class="s-metric"><div class="l">Confidence</div><div class="v">98.4%</div></div>
                    </div>
                </div>
                <div class="stack-actions">
                    <button class="call-to-action primary">TRIGGER WORK ORDER</button>
                    <button class="call-to-action secondary">ACKNOWLEDGE</button>
                </div>
            </div>
        </div>
    `;
}

function renderAnalyticsContent() {
    const container = document.getElementById('analyticsPage');
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <h2>Operational <span>Analytics</span></h2>
                <div class="view-subtitle"><span>Performance trends across all nodes.</span></div>
            </div>
        </div>
        <div class="metric-row">
            <div class="metric-card"><div class="card-data"><h4>OEE Score</h4><div class="val">92.4%</div></div></div>
            <div class="metric-card"><div class="card-data"><h4>Yield Rate</h4><div class="val">99.1%</div></div></div>
            <div class="metric-card"><div class="card-data"><h4>MTBF</h4><div class="val">428h</div></div></div>
        </div>
    `;
}

function renderDiagnosticsContent() {
    const container = document.getElementById('diagnosticsPage');
    container.innerHTML = `
        <div class="view-header"><div class="view-title"><h2>System <span>Diagnostics</span></h2></div></div>
        <div class="stack-card" style="border-left: 2px solid var(--accent-cyan)">
            <div class="stack-info">
                <div class="m-label">DIAGNOSTIC SCAN • ACTIVE</div>
                <h3>Spectral Analysis: Axis-Y</h3>
                <div style="margin-top:1rem; height:8px; background:var(--bg-surface-high); border-radius:99px; overflow:hidden">
                    <div style="width:87%; height:100%; background:var(--accent-cyan)"></div>
                </div>
            </div>
        </div>
    `;
}

function renderInsights() {
    const feed = document.getElementById('insight-feed');
    if (!feed) return;
    feed.innerHTML = `
        <div class="insight-card predictive">
            <div class="card-meta"><span class="tag-predictive">PREDICTIVE</span><span>2m ago</span></div>
            <h4>CNC_01: Vibration +12%</h4>
            <button class="action-btn">REQUEST DIAGNOSTICS</button>
        </div>
        <div class="insight-card critical">
            <div class="card-meta"><span class="tag-critical">CRITICAL</span><span>15m ago</span></div>
            <h4>Thermal Drift detected</h4>
            <button class="action-btn primary">ISOLATE AXIS</button>
        </div>
    `;
}

function updateCharts() {
    if (document.getElementById('digitalTwinPage').style.display === 'none') return;
    renderDigitalTwinChart();
}

function renderDigitalTwinChart() {
    const canvas = document.getElementById('big-telemetry-chart');
    if (!canvas) return;
    
    const m = machineData[0];
    const h = historyMap[m.machine_id];
    
    if (chartInstances['big']) {
        const c = chartInstances['big'];
        c.data.datasets[0].data = h.vib.map(v => v + Math.sin(Date.now()/800) * 0.3);
        c.update('none');
    } else {
        const ctx = canvas.getContext('2d');
        chartInstances['big'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(30).fill(''),
                datasets: [{ label: 'ACTU', data: [...h.vib], borderColor: '#00f2ff', borderWidth: 3, pointRadius: 0, tension: 0.6, fill: false }]
            },
            options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false, min: 0, max: 9 } } }
        });
    }
}

// Global Event Listeners
function initEventListeners() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const text = btn.textContent.trim().toUpperCase();
        if (text === 'REQUEST DIAGNOSTICS') alert("Diagnostics requested");
        else if (text === 'ISOLATE AXIS') alert("Axis isolated successfully");
        else if (text === 'TRIGGER WORK ORDER') alert("Work order created");
        else if (text === 'ACKNOWLEDGE' || text === 'DISMISS' || text.includes('✖')) {
            const card = btn.closest('.insight-card, .stack-card');
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(-10px)';
                card.style.transition = '0.3s';
                setTimeout(() => card.remove(), 300);
            }
        }
    });

    const emergencyBtn = document.querySelector('.emergency-btn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', () => {
            if (confirm("ACTIVATE EMERGENCY STOP?")) {
                document.body.classList.add('emergency-halt');
                alert("SYSTEM HALTED.");
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    initEventListeners();
});
window.showPage = showPage;
