let machineData = [];
let currentView = 'engineer';
let historyMap = {}; // { machine_id: { temp: [], vib: [] } }
let chartInstances = {};

async function init() {
    try {
        const response = await fetch('data.json');
        machineData = await response.json();
        
        // Initialize history
        machineData.forEach(m => {
            historyMap[m.machine_id] = {
                temp: Array(15).fill(m.temperature),
                vib: Array(15).fill(m.vibration)
            };
        });

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
    document.getElementById('role-tag').textContent = `ROLE: ${view.toUpperCase()}`;
    
    // Destroy all charts when switching to wipe state
    Object.values(chartInstances).forEach(c => c.destroy());
    chartInstances = {};
    
    renderDashboard();
}

function renderDashboard() {
    updateHeroStats();
    renderMachineGrid();
    renderCharts(); // Initialize charts after grid exists
    renderAlerts();
    renderPriority();
}

function updateHeroStats() {
    document.getElementById('stat-total').textContent = machineData.length;
    const critical = machineData.filter(m => getRisk(m.temperature, m.vibration) === 'HIGH').length;
    document.getElementById('stat-critical').textContent = critical;
    
    const healthy = machineData.filter(m => getRisk(m.temperature, m.vibration) === 'LOW').length;
    const healthPercent = Math.round((healthy / machineData.length) * 100);
    document.getElementById('stat-health').textContent = `${healthPercent}%`;
}

function renderMachineGrid() {
    const grid = document.getElementById('main-grid');
    grid.innerHTML = machineData.map(m => {
        const risk = getRisk(m.temperature, m.vibration);
        const color = `var(--accent-${risk.toLowerCase()})`;

        return `
            <div class="m-card">
                <div class="m-card-top">
                    <span class="m-id">${m.machine_id}</span>
                    <span class="risk-tag" style="color: ${color}">${risk}</span>
                </div>

                <div class="m-data-grid">
                    <div class="data-node">
                        <span class="node-label">Temperature</span>
                        <span class="node-val">${m.temperature.toFixed(1)}°C</span>
                    </div>
                    <div class="data-node">
                        <span class="node-label">Vibration</span>
                        <span class="node-val">${m.vibration.toFixed(2)} mm/s</span>
                    </div>
                    <div class="data-node">
                        <span class="node-label">RPM</span>
                        <span class="node-val">${m.rpm}</span>
                    </div>
                    <div class="data-node">
                        <span class="node-label">Current</span>
                        <span class="node-val">${m.current}A</span>
                    </div>
                </div>

                ${currentView === 'engineer' ? `
                    <div class="chart-wrap">
                        <canvas id="chart-${m.machine_id}"></canvas>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function renderCharts() {
    if (currentView !== 'engineer') return;

    machineData.forEach(m => {
        const ctx = document.getElementById(`chart-${m.machine_id}`).getContext('2d');
        const history = historyMap[m.machine_id];

        if (chartInstances[m.machine_id]) {
            chartInstances[m.machine_id].data.datasets[0].data = history.temp;
            chartInstances[m.machine_id].data.datasets[1].data = history.vib;
            chartInstances[m.machine_id].update('none'); // silent update
        } else {
            chartInstances[m.machine_id] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array(15).fill(''),
                    datasets: [
                        {
                            label: 'Temp',
                            data: history.temp,
                            borderColor: '#0088ff',
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.4
                        },
                        {
                            label: 'Vib',
                            data: history.vib,
                            borderColor: '#a855f7',
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false },
                        y1: { display: false, position: 'right' }
                    }
                }
            });
        }
    });
}

function renderAlerts() {
    const list = document.getElementById('alerts-list');
    const anomalies = machineData.filter(m => getRisk(m.temperature, m.vibration) !== 'LOW');
    
    if (anomalies.length === 0) {
        list.innerHTML = '<div style="color: #555; font-size: 0.8rem; padding: 1rem;">No diagnostic alerts.</div>';
        return;
    }

    list.innerHTML = anomalies.map(m => {
        const risk = getRisk(m.temperature, m.vibration);
        return `
            <div class="alert-row">
                <div class="alert-icon">⚠️</div>
                <div class="alert-body">
                    <h4 style="color: var(--accent-red)">${risk} PRIORITY</h4>
                    <p>${m.machine_id} exceeding threshold. Immediate inspection required.</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderPriority() {
    const list = document.getElementById('priority-list');
    const sorted = [...machineData].sort((a, b) => {
        const riskMap = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return riskMap[getRisk(b.temperature, b.vibration)] - riskMap[getRisk(a.temperature, a.vibration)];
    });

    list.innerHTML = sorted.map(m => {
        const risk = getRisk(m.temperature, m.vibration);
        return `
            <div class="priority-row">
                <span>${m.machine_id}</span>
                <span style="color: var(--accent-${risk.toLowerCase()})">${risk}</span>
            </div>
        `;
    }).join('');
}

function startSimulation() {
    setInterval(() => {
        machineData = machineData.map(m => {
            const tShift = (Math.random() - 0.5) * 6;
            const vShift = (Math.random() - 0.5) * 0.4;
            
            const newT = Math.max(30, Math.min(100, m.temperature + tShift));
            const newV = Math.max(0.1, Math.min(5, m.vibration + vShift));

            // Update history
            historyMap[m.machine_id].temp.push(newT);
            historyMap[m.machine_id].vib.push(newV);
            
            if (historyMap[m.machine_id].temp.length > 15) {
                historyMap[m.machine_id].temp.shift();
                historyMap[m.machine_id].vib.shift();
            }

            return { ...m, temperature: newT, vibration: newV };
        });
        renderDashboard();
    }, 4000);
}

init();
