let machineData = [];
let currentView = 'engineer';

async function init() {
    try {
        const response = await fetch('data.json');
        machineData = await response.json();
        renderDashboard();
        startSimulation();
    } catch (error) {
        console.error('Error loading machine data:', error);
    }
}

function getRisk(temp, vib) {
    if (temp > 80 || vib > 2) return 'HIGH';
    if (temp > 65 || vib > 1) return 'MEDIUM';
    return 'LOW';
}

function switchView(view) {
    currentView = view;
    document.getElementById('engineerBtn').classList.toggle('active', view === 'engineer');
    document.getElementById('technicianBtn').classList.toggle('active', view === 'technician');
    
    document.body.classList.toggle('tech-mode', view === 'technician');
    document.getElementById('view-indicator').textContent = view === 'technician' ? 'Operational Tasks' : 'Predictive Diagnostics';
    
    renderDashboard();
}

function renderDashboard() {
    updateHeroStats();
    renderMachineGrid();
    renderAlerts();
    renderPriority();
    if (window.lucide) {
        lucide.createIcons();
    }
}

function updateHeroStats() {
    document.getElementById('count-total').textContent = machineData.length;
    const critical = machineData.filter(m => getRisk(m.temperature, m.vibration) === 'HIGH').length;
    document.getElementById('count-critical').textContent = critical;
    
    const healthy = machineData.filter(m => getRisk(m.temperature, m.vibration) === 'LOW').length;
    const healthPercent = Math.round((healthy / machineData.length) * 100);
    document.getElementById('sys-health').textContent = `${healthPercent}%`;
}

function renderMachineGrid() {
    const grid = document.getElementById('main-grid');
    grid.innerHTML = machineData.map((m, i) => {
        const risk = getRisk(m.temperature, m.vibration);
        const isHigh = risk === 'HIGH';
        const action = isHigh ? 'EMERGENCY REPAIR' : (risk === 'MEDIUM' ? 'INSPECT MOTOR' : 'OPTIMAL');

        return `
            <div class="machine-card ${isHigh ? 'high-risk' : ''} animate-in" style="animation-delay: ${i * 0.1}s">
                <div class="card-header">
                    <span class="id-tag">${m.machine_id}</span>
                    <span class="live-indicator">LIVE</span>
                </div>

                <div class="data-grid">
                    <div class="data-node">
                        <div class="node-icon"><i data-lucide="thermometer"></i></div>
                        <div>
                            <span class="node-label">Thermal</span>
                            <span class="node-value">${m.temperature.toFixed(1)}° <span class="live-dot"></span></span>
                        </div>
                    </div>
                    <div class="data-node">
                        <div class="node-icon"><i data-lucide="activity"></i></div>
                        <div>
                            <span class="node-label">Vibration</span>
                            <span class="node-value">${m.vibration.toFixed(2)} <span class="live-dot"></span></span>
                        </div>
                    </div>
                    <div class="data-node">
                        <div class="node-icon"><i data-lucide="rotate-cw"></i></div>
                        <div>
                            <span class="node-label">Rotation</span>
                            <span class="node-value">${m.rpm} <span style="font-size: 0.6rem; margin-left: 2px;">RPM</span></span>
                        </div>
                    </div>
                    <div class="data-node">
                        <div class="node-icon"><i data-lucide="zap"></i></div>
                        <div>
                            <span class="node-label">Consumption</span>
                            <span class="node-value">${m.current}A</span>
                        </div>
                    </div>
                </div>

                <div class="action-prompt" style="display: ${currentView === 'technician' ? 'block' : 'none'}">
                    ${action}
                </div>

                <div class="risk-foot">
                    <span class="risk-label" style="color: var(--text-muted)">UNIT HEALTH</span>
                    <span class="risk-label" style="color: var(--neon-${risk === 'HIGH' ? 'crimson' : (risk === 'MEDIUM' ? 'amber' : 'green')})">${risk}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderAlerts() {
    const feed = document.getElementById('alert-feed');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const alerts = machineData.filter(m => getRisk(m.temperature, m.vibration) !== 'LOW');
    
    if (alerts.length === 0) {
        feed.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; padding: 1.5rem; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed var(--border-glass);">No active anomalies. All systems stable.</div>';
        return;
    }

    feed.innerHTML = alerts.map(m => {
        const risk = getRisk(m.temperature, m.vibration);
        return `
            <div class="alert-item ${risk === 'HIGH' ? 'critical' : ''}">
                <div class="alert-top">
                    <span class="alert-type" style="background: var(--neon-${risk === 'HIGH' ? 'crimson' : 'amber'}); color: #000;">${risk}</span>
                    <span class="alert-time">${now}</span>
                </div>
                <div style="font-weight: 800; font-size: 0.9rem;">${m.machine_id}</div>
                <div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 6px; line-height: 1.4;">Critical ${m.temperature > 80 ? 'thermal' : 'stability'} threshold reached. Automatic diagnostics initiated.</div>
            </div>
        `;
    }).join('');
}

function renderPriority() {
    const stack = document.getElementById('priority-stack');
    const sorted = [...machineData].sort((a, b) => {
        const riskMap = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return riskMap[getRisk(b.temperature, b.vibration)] - riskMap[getRisk(a.temperature, a.vibration)];
    });

    stack.innerHTML = sorted.map((m, i) => {
        const risk = getRisk(m.temperature, m.vibration);
        const color = `var(--neon-${risk === 'HIGH' ? 'crimson' : (risk === 'MEDIUM' ? 'amber' : 'green')})`;
        const width = risk === 'HIGH' ? '100%' : (risk === 'MEDIUM' ? '60%' : '20%');
        
        return `
            <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-glass);">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700;">
                    <span><span style="color: var(--text-muted); margin-right: 12px;">${(i+1).toString().padStart(2, '0')}</span> ${m.machine_id}</span>
                    <span style="color: ${color}">${risk}</span>
                </div>
                <div class="priority-bar-bg">
                    <div class="priority-bar-fill" style="width: ${width}; background: ${color}"></div>
                </div>
            </div>
        `;
    }).join('');
}

function startSimulation() {
    setInterval(() => {
        machineData = machineData.map(m => {
            const tempChange = (Math.random() - 0.5) * 10;
            const vibChange = (Math.random() - 0.5) * 0.5;
            return {
                ...m,
                temperature: Math.max(30, Math.min(120, m.temperature + tempChange)),
                vibration: Math.max(0.1, Math.min(7, m.vibration + vibChange))
            };
        });
        renderDashboard();
    }, 4000);
}

init();
