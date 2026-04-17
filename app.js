let machineData = [];
let chartInstances = {};
let historyMap = {};
let currentRole = 'engineer'; // engineer | technician

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

        populateAllPages();
        renderInsights();
        startSimulation();
        
        // Initial Role Setup
        loadDashboard();
    } catch (error) {
        console.error("Error loading machine data:", error);
    }
}

function loadDashboard() {
    const engDash = document.getElementById('engineerDashboard');
    const techDash = document.getElementById('technicianDashboard');
    const roleInd = document.getElementById('roleIndicator');

    if (currentRole === 'engineer') {
        engDash.style.display = 'block';
        techDash.style.display = 'none';
        roleInd.textContent = 'ENGINEER';
        roleInd.style.color = 'var(--accent-cyan)';
        
        document.getElementById('digitalTab').style.display = 'inline-block';
        document.getElementById('analyticsTab').style.display = 'inline-block';
        document.getElementById('alertsTab').style.display = 'none';

        showPage('digitalTwinPage');
    } else {
        engDash.style.display = 'none';
        techDash.style.display = 'block';
        roleInd.textContent = 'TECHNICIAN';
        roleInd.style.color = 'var(--accent-red)';

        document.getElementById('digitalTab').style.display = 'none';
        document.getElementById('analyticsTab').style.display = 'none';
        document.getElementById('alertsTab').style.display = 'inline-block';

        showPage('alertStackPage');
    }
}

function switchRole() {
    currentRole = (currentRole === 'engineer') ? 'technician' : 'engineer';
    loadDashboard();
}

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.style.display = "none");

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) selectedPage.style.display = "block";

    const tabs = {
        'digitalTwinPage': 'digitalTab',
        'alertStackPage': 'alertsTab',
        'analyticsPage': 'analyticsTab',
        'diagnosticsPage': 'diagnosticsTab'
    };
    
    document.querySelectorAll('.view-links a').forEach(tab => tab.classList.remove('active'));
    const activeTabId = tabs[pageId];
    if (activeTabId) document.getElementById(activeTabId).classList.add('active');

    if (pageId === 'digitalTwinPage' && currentRole === 'engineer') {
        setTimeout(renderDigitalTwinChart, 50);
    }
}

function handleSidebarScroll(targetId, btnId) {
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    document.querySelectorAll('.nav-menu .nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(btnId).classList.add('active');
}

function populateAllPages() {
    renderDigitalTwinContent();
    renderAlertStackContent();
    renderAnalyticsContent();
    renderDiagnosticsContent();
}

/**
 * ENGINEER VIEW ENHANCEMENTS: Analytical & Multi-component
 */
function renderDigitalTwinContent() {
    const m = machineData[0] || { machine_id: "N/A", temperature: 85, vibration: 2.3 };
    const container = document.getElementById('digitalTwinPage');
    container.innerHTML = `
        <div id="overview" class="view-header">
            <div class="view-title">
                <h2>Digital Twin <span>Engine</span></h2>
                <div class="view-subtitle">${m.machine_id} Tactical Analysis Profile</div>
            </div>
        </div>

        <div id="telemetry" class="telemetry-focus">
            <div class="focus-header"><h3>Active vibration baseline</h3></div>
            <div class="big-chart-wrap"><canvas id="big-telemetry-chart"></canvas></div>
            
            <!-- Insight Layer below graph -->
            <div class="analytical-insights">
                <div class="insight-item warning">
                    <span class="icon">⚠️</span>
                    <div class="txt">
                        <strong>Trend Alert:</strong> Increasing vibration trend detected in sector 4.
                        <span class="sub">Estimated failure window: 4 hours @ current load.</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Summary Cards below graph -->
        <div id="riskMatrix" class="metric-row">
            <div class="metric-card summary">
                <div class="card-data">
                    <h4>Risk Score</h4>
                    <div class="val" style="color: var(--accent-red)">84<span>/100</span></div>
                    <div class="sub">HIGH SEVERITY</div>
                </div>
            </div>
            <div class="metric-card summary">
                <div class="card-data">
                    <h4>System Status</h4>
                    <div class="val">WARNING</div>
                    <div class="sub">DEGRADED PERFORMANCE</div>
                </div>
            </div>
            <div class="metric-card summary">
                <div class="card-data">
                    <h4>Active Alerts</h4>
                    <div class="val">02</div>
                    <div class="sub">UNACKNOWLEDGED</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * TECHNICIAN VIEW ENHANCEMENTS: Action-focused, Big text, No graphs
 */
function renderAlertStackContent() {
    const container = document.getElementById('alertStackPage');
    container.innerHTML = `
        <div id="overview" class="view-header">
            <div class="view-title">
                <h2>Maintenance <span>Actions</span></h2>
                <div class="view-subtitle">High-priority critical system instructions.</div>
            </div>
        </div>

        <div class="technician-portal">
            <!-- STATUS DISPLAY -->
            <div class="status-grid">
                <div class="status-block critical">
                    <div class="s-label">MACHINE STATUS</div>
                    <div class="s-val">CRITICAL</div>
                </div>
                <div class="status-block info">
                    <div class="s-label">CURRENT TEMP</div>
                    <div class="s-val live-temp-CNC_01">--°C</div>
                </div>
            </div>

            <!-- ACTION MESSAGES -->
            <div class="action-stack">
                <div class="action-card critical">
                    <div class="action-header">IMMEDIATE ACTION REQUIRED</div>
                    <div class="action-body">
                        <h3>Inspect Bearing #4 Assembly</h3>
                        <p>Extreme vibration detected in primary spindle. Shutdown likely if not addressed.</p>
                    </div>
                    <div class="action-footer">
                        <button class="call-to-action primary">COMPLETE INSPECTION</button>
                    </div>
                </div>

                <div class="action-card warning">
                    <div class="action-header">MAINTENANCE CHECK</div>
                    <div class="action-body">
                        <h3>Check Motor Temperature</h3>
                        <p>Thermal profile is 12% above nominal limits. Verification needed.</p>
                    </div>
                    <div class="action-footer">
                        <button class="call-to-action secondary">ACKNOWLEDGE</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAnalyticsContent() {
    const container = document.getElementById('analyticsPage');
    container.innerHTML = `<div id="overview" class="view-header"><h2>Operational <span>Analytics</span></h2></div>`;
}

function renderDiagnosticsContent() {
    const container = document.getElementById('diagnosticsPage');
    container.innerHTML = `<div id="overview" class="view-header"><h2>System <span>Diagnostics</span></h2></div>`;
}

function renderInsights() {
    const feed = document.getElementById('insight-feed');
    if (!feed) return;
    feed.innerHTML = `<div class="insight-card predictive"><h4>CNC_01: Vibration +12%</h4><button class="action-btn">REQUEST DIAGNOSTICS</button></div>`;
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
            data: { labels: Array(30).fill(''), datasets: [{ label: 'VIB', data: [...h.vib], borderColor: '#00f2ff', borderWidth: 2, pointRadius: 0, tension: 0.6, fill: false }] },
            options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false, min: 2, max: 9 } } }
        });
    }
}

function startSimulation() {
    setInterval(() => {
        machineData.forEach(m => {
            m.temperature += (Math.random() - 0.5) * 2;
            m.vibration += (Math.random() - 0.5) * 0.4;
            const h = historyMap[m.machine_id];
            h.temp.push(m.temperature); h.vib.push(m.vibration);
            if (h.temp.length > 30) { h.temp.shift(); h.vib.shift(); }
        });
        updateLiveValues(); updateCharts();
    }, 2000);
}

function updateLiveValues() {
    machineData.forEach(m => {
        document.querySelectorAll(`.live-temp-${m.machine_id}`).forEach(el => el.textContent = `${m.temperature.toFixed(1)}°C`);
    });
}

function initEventListeners() {
    document.getElementById('overviewBtn').addEventListener('click', () => handleSidebarScroll('overview', 'overviewBtn'));
    document.getElementById('telemetryBtn').addEventListener('click', () => handleSidebarScroll('telemetry', 'telemetryBtn'));
    
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const text = btn.textContent.trim().toUpperCase();
        if (text === 'REQUEST DIAGNOSTICS') alert("Diagnostics requested");
        else if (text === 'COMPLETE INSPECTION') alert("Task completed: Spindle bearing verified.");
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
window.switchRole = switchRole;
