// --- UI Interactions ---
function switchTab(tabId, event) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
    window.dispatchEvent(new Event('resize')); // Re-render Plotly charts properly
}

function updateWeight(id, val) {
    document.getElementById(id).innerText = (val / 100).toFixed(2);
}

// --- EXPORT FUNCTIONALITY ---
function exportCSV() {
    const headers = ["Region", "EAFBR", "VulnerabilityIndex", "AffectedCount", "Score", "Tier"];
    const rows = [
        ["SOCCSKSARGEN", "24.2%", "0.85", "1847", "0.89", "1"],
        ["Zamboanga Peninsula", "21.8%", "0.78", "1623", "0.84", "1"],
        ["Eastern Visayas", "18.8%", "0.60", "2104", "0.62", "2"],
        ["Central Luzon", "16.9%", "0.52", "1892", "0.55", "2"],
        ["NCR", "14.5%", "0.15", "1756", "0.21", "3"]
    ];

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "NDHS_Regional_Rankings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportPDF() {
    alert("Generating 1-page summary PDF.\n\nIncludes:\n- Current Filter Settings\n- Tier Assignments\n- Top 5 Regions\n- Recommended Actions");
    window.print();
}

// --- Plotly Chart Configurations ---
const config = { responsive: true, displayModeBar: false };
const layoutBase = {
    margin: { l: 40, r: 20, t: 30, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, sans-serif' }
};

// 1. Regional EAFBR Bubble Map (Native Plotly Geo)
Plotly.newPlot('map-chart', [{
    type: 'scattergeo',
    lat: [14.5995, 15.4828, 11.2430, 8.1542, 6.2467],
    lon: [120.9842, 120.7120, 125.0388, 122.9564, 124.6445],
    text: ['NCR: 14.5%', 'Central Luzon: 16.9%', 'Eastern Visayas: 18.8%', 'Zamboanga Pen.: 21.8%', 'SOCCSKSARGEN: 24.2%'],
    mode: 'markers',
    marker: {
        size: [15, 17, 19, 25, 30],
        color: ['#cbd5e1', '#94a3b8', '#f59e0b', '#ef4444', '#b91c1c'],
        line: { color: 'white', width: 1 }
    },
    hovertemplate: '<b>%{text}</b><extra></extra>'
}], {
    ...layoutBase,
    geo: {
        scope: 'asia',
        resolution: 50,
        center: { lat: 12.0, lon: 122.5 },
        projection: { type: 'mercator', scale: 4.5 },
        showcoastlines: true, coastlinecolor: '#e2e8f0',
        showland: true, landcolor: '#f8fafc',
        showcountries: true, countrycolor: '#cbd5e1',
        bgcolor: 'rgba(0,0,0,0)'
    }
}, config);

// 2. Education vs Wealth Heatmap
Plotly.newPlot('heatmap-overview', [{
    z: [[45, 30, 15, 5, 2], [35, 25, 20, 10, 5], [10, 20, 30, 25, 15], [2, 5, 15, 40, 50]],
    x: ['Q1 Poorest', 'Q2', 'Q3 Middle', 'Q4', 'Q5 Richest'],
    y: ['No Edu', 'Primary', 'Secondary', 'Higher'],
    type: 'heatmap', colorscale: 'Reds',
    hovertemplate: 'Wealth: %{x}<br>Edu: %{y}<br>Concentration: %{z}%<extra></extra>'
}], layoutBase, config);

// 3. Age by Wealth Box Plot
const boxData = ['Q1 Poorest', 'Q2', 'Q3 Middle', 'Q4', 'Q5 Richest'].map((w, i) => ({
    y: Array.from({ length: 50 }, () => Math.floor(Math.random() * 8) + 14 + (i * 1.2)),
    type: 'box', name: w, marker: { color: '#2563eb' }
}));
Plotly.newPlot('boxplot-chart', boxData, { ...layoutBase, yaxis: { title: 'Age at First Birth' } }, config);

// 4. Education Levels within Wealth Stacked Bar
Plotly.newPlot('stacked-bar', [
    { x: ['Q1 Poorest', 'Q2', 'Q3 Middle', 'Q4', 'Q5 Richest'], y: [42.1, 39.4, 20, 5, 2], name: 'No Edu', type: 'bar', marker: { color: '#dc2626' } },
    { x: ['Q1 Poorest', 'Q2', 'Q3 Middle', 'Q4', 'Q5 Richest'], y: [40, 40, 30, 15, 8], name: 'Primary', type: 'bar', marker: { color: '#f59e0b' } },
    { x: ['Q1 Poorest', 'Q2', 'Q3 Middle', 'Q4', 'Q5 Richest'], y: [10, 15, 35, 50, 40], name: 'Secondary', type: 'bar', marker: { color: '#3b82f6' } },
    { x: ['Q1 Poorest', 'Q2', 'Q3 Middle', 'Q4', 'Q5 Richest'], y: [7.9, 5.6, 15, 30, 50], name: 'Higher', type: 'bar', marker: { color: '#10b981' } }
], { ...layoutBase, barmode: 'stack', yaxis: { title: '% of Cohort' } }, config);

// 5. Pregnancy Status Heatmap
Plotly.newPlot('heatmap-explorer', [{
    z: [[1809, 1293, 872, 602, 403], [72, 69, 57, 48, 33]],
    x: ['Q1 Poorest', 'Q2', 'Q3 Middle', 'Q4', 'Q5 Richest'],
    y: ['Had First Birth', 'Currently Pregnant'],
    type: 'heatmap', colorscale: 'Blues',
    hovertemplate: 'Status: %{y}<br>Wealth: %{x}<br>Count: %{z}<extra></extra>'
}], layoutBase, config);