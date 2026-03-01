// 🚨 เปลี่ยน API ของคุณที่นี่
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

let masterData = [];   
let filteredData = []; 
let currentStratLevel = 0; // 0=ชาติ, 1=แม่บท, 2=แผน13, 3=ภาค, 4=จังหวัด
let currentMode = 'count'; 

const stratKeys = [
    "ยุทธศาสตร์ชาติ 20 ปี",
    "แผนแม่บทภายใต้ยุทธศาสตร์ชาติ",
    "แผนพัฒนาฯ ฉบับที่ 13",
    "แผนพัฒนาภาคเหนือ",
    "ประเด็นการพัฒนาจังหวัด"
];
const stratNames = ["ยุทธศาสตร์ชาติ", "แผนแม่บท", "แผน 13", "แผนภาค", "แผนจังหวัด"];

const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];

let map, geoLayer, donut, trend, districtGeo;

$(document).ready(function() {
    // 🌟 Initialize Select2 (Dropdown อำเภอ)
    $('#districtFilter').select2({
        placeholder: "ค้นหาหรือเลือกอำเภอ (เลือกทั้งหมดได้)",
        allowClear: true,
        width: '100%'
    });

    // ใส่ Option 25 อำเภอ
    dNames.forEach(d => {
        let option = new Option(d, d, false, false);
        $('#districtFilter').append(option);
    });

    // เมื่อ Dropdown เปลี่ยน ให้ Update
    $('#districtFilter').on('change', function() { updateDashboard(); });

    // สวิตช์แผนที่
    $('#modeSwitch').on('change', function(e) {
        currentMode = e.target.checked ? 'budget' : 'count';
        updateDashboard();
    });

    init();
});

async function init() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        try {
            const geoRes = await fetch("districts.json");
            districtGeo = await geoRes.json();
        } catch(e) {}

        const years = new Set();
        masterData = data.filter(r => r["ชื่อโครงการ"]).map(r => {
            let b = parseFloat(String(r["งบประมาณ (ตัวเลข)"] || "0").replace(/,/g, '')) || 0;
            let y = String(r["ปีงบประมาณ"] || "ไม่ระบุ").split(".")[0];
            if(y !== "ไม่ระบุ" && y !== "") years.add(y);
            
            let area = String(r["พื้นที่เป้าหมายทั้งหมด"] || r["⚙️ ขอบเขตพื้นที่ (Auto)"] || r["อำเภอที่ตั้ง (หลัก)"] || "ไม่ระบุ").replace(/จังหวัดเชียงใหม่/g, "").trim();
            if(area.endsWith(",")) area = area.slice(0, -1);
            
            let aType = "Single";
            if (area.includes("ครอบคลุมทั้งจังหวัด") || area === "ทั้งจังหวัด") aType = "Provincial";
            else if (area.includes(",")) aType = "Multi";
            else if (area === "ไม่ระบุ" || area === "-") aType = "ไม่ระบุ";

            return { ...r, _b: b, _y: y, _a: area || "ไม่ระบุ", _aType: aType };
        });

        const yBox = document.getElementById('yearCheckboxes');
        [...years].sort((a,b)=>b-a).forEach((yr, i) => {
            yBox.innerHTML += `<li><label><input type="checkbox" class="y-cb" value="${yr}" ${i===0?'checked':''} onchange="handleYearChange()"> ปี ${yr}</label></li>`;
        });
        document.getElementById('checkAllYears').checked = false;

        updateDashboard();
        setTimeout(() => document.getElementById('loadingOverlay').style.display = 'none', 300);

    } catch (error) {
        document.getElementById('loadingOverlay').innerHTML = `<h3 style="color:red; font-family:'Sarabun';">❌ โหลดข้อมูลไม่สำเร็จ</h3>`;
    }
}

function setStrat(idx) {
    currentStratLevel = idx;
    document.querySelectorAll('.strat-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });
    updateDashboard();
}

function toggleAllYears(cb) {
    document.querySelectorAll('.y-cb').forEach(el => el.checked = cb.checked);
    updateDashboard();
}

function handleYearChange() {
    let all = document.querySelectorAll('.y-cb').length === document.querySelectorAll('.y-cb:checked').length;
    document.getElementById('checkAllYears').checked = all;
    updateDashboard();
}

function clearAllFilters() {
    $('#districtFilter').val(null).trigger('change');
    document.querySelectorAll('.y-cb').forEach(el => el.checked = false);
    if(document.querySelectorAll('.y-cb').length > 0) document.querySelectorAll('.y-cb')[0].checked = true;
    document.getElementById('checkAllYears').checked = false;
    setStrat(0);
}

// 🌟 ฟังก์ชันใช้คลิกจากตาราง เพื่อกรองอำเภอ
function filterFromTable(dName) {
    let currentVals = $('#districtFilter').val() || [];
    if (!currentVals.includes(dName)) {
        currentVals.push(dName);
        $('#districtFilter').val(currentVals).trigger('change'); // Trigger ให้ updateDashboard ทำงานอัตโนมัติ
    }
}

// 🌟 ซิงค์ข้อมูลทุกส่วน
function updateDashboard() {
    const sYears = Array.from(document.querySelectorAll('.y-cb:checked')).map(el => el.value);
    const sDists = $('#districtFilter').val() || []; // อาร์เรย์ของอำเภอที่เลือก

    if(sYears.length === 0) document.getElementById('yearStatus').innerText = '(กรุณาเลือกปี)';
    else if(sYears.length === document.querySelectorAll('.y-cb').length) document.getElementById('yearStatus').innerText = '(ทุกปี)';
    else document.getElementById('yearStatus').innerText = `(${sYears.join(',')})`;

    // ดึง Key ยุทธศาสตร์ที่เลือก
    let targetKey = stratKeys[currentStratLevel];

    filteredData = masterData.filter(r => {
        let mY = sYears.includes(r._y);
        
        // เช็คว่ามีข้อมูลในคอลัมน์ยุทธศาสตร์นั้นหรือไม่
        let val = r[targetKey];
        if (val === undefined) {
            let searchKey = targetKey.split(" ")[0]; 
            if(targetKey.includes("ฉบับที่ 13")) searchKey = "ฉบับที่ 13";
            let foundKey = Object.keys(r).find(k => k.includes(searchKey));
            if (foundKey) val = r[foundKey];
        }
        let mS = (val && String(val).trim() !== "" && String(val) !== "-"); // ถ้ามีข้อมูลถือว่าสอดคล้องระดับนั้น
        
        // เช็คอำเภอแบบ Multi-select
        let mD = true;
        if (sDists.length > 0) {
            mD = sDists.some(d => r._a.includes(d)) || r._aType === "Provincial";
        }

        return mY && mS && mD;
    });

    document.getElementById('sumProjects').innerText = filteredData.length.toLocaleString();
    document.getElementById('sumBudget').innerText = filteredData.reduce((acc, cur) => acc + cur._b, 0).toLocaleString(undefined, {minimumFractionDigits:2});

    renderTrend(sYears);
    renderDonut();
    renderMap(sDists);
    renderTable(sYears);
}

function renderTrend(sYears) {
    const ctx = document.getElementById('trendChart');
    if(!ctx) return;
    let actY = sYears.length > 0 ? [...sYears].sort((a,b)=>a-b) : [...new Set(masterData.map(r=>r._y))].sort((a,b)=>a-b);
    
    let yC = {}, yB = {};
    actY.forEach(y => { yC[y] = 0; yB[y] = 0; });
    filteredData.forEach(r => { if(yC[r._y] !== undefined) { yC[r._y]++; yB[r._y] += r._b; } });
    
    let dC = actY.map(y => yC[y]);
    let dB = actY.map(y => yB[y]);

    if (trend) trend.destroy();
    trend = new Chart(ctx, {
        type: 'line',
        data: { labels: actY, datasets: [
            { type: 'bar', label: 'งบประมาณ', data: dB, backgroundColor: '#cbd5e1', yAxisID: 'y' }, 
            { type: 'line', label: 'จำนวนโครงการ', data: dC, borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.3, yAxisID: 'y1' }
        ]},
        options: { 
            responsive: true, maintainAspectRatio: false, 
            scales: {
                y: { display: true, position: 'left', title: {display:true, text:'บาท', font:{family:'Sarabun'}} },
                y1: { display: true, position: 'right', grid: {drawOnChartArea: false}, title: {display:true, text:'โครงการ', font:{family:'Sarabun'}} }
            },
            plugins: { datalabels: { display: false } } 
        }
    });
}

function renderDonut() {
    const ctx = document.getElementById('donutChart');
    if(!ctx) return;

    let cSingle = 0, cMulti = 0, cProv = 0;
    filteredData.forEach(r => {
        let v = currentMode === 'budget' ? r._b : 1;
        if(r._aType === 'Single') cSingle += v;
        else if(r._aType === 'Multi') cMulti += v;
        else if(r._aType === 'Provincial') cProv += v;
    });

    let total = cSingle + cMulti + cProv;
    let data = [cSingle, cMulti, cProv];
    let labels = ['เฉพาะพื้นที่ (Single)', 'เชื่อมโยงข้ามอำเภอ (Multi)', 'ภาพรวมทั้งจังหวัด'];
    
    let lPct = labels.map((l, i) => { return `${l} (${total>0 ? ((data[i]*100)/total).toFixed(1) : 0}%)`; });

    if(donut) donut.destroy();
    donut = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: lPct, datasets: [{ data: data, backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }] },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'right', labels: {font:{family:'Sarabun', size: 11}} },
                tooltip: { callbacks: { label: c => ` ${labels[c.dataIndex]}: ${c.raw.toLocaleString()} ${currentMode==='count'?'โครงการ':'บาท'}` } },
                datalabels: { color: '#fff', font: { weight: 'bold', size: 12 }, formatter: v => total > 0 && (v*100/total) >= 5 ? (v*100/total).toFixed(0) + "%" : "" }
            } 
        }
    });
}

function renderMap(sDists) {
    if (!map) {
        map = L.map('map', {scrollWheelZoom: false, preferCanvas: true}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    let dStats = {};
    dNames.forEach(d => { dStats[d] = { cS: 0, bS: 0, cM: 0, bM: 0, cP: 0 }; });

    filteredData.forEach(r => {
        if (r._aType === "Single" || r._aType === "Multi") {
            dNames.filter(d => r._a.includes(d)).forEach(d => {
                if (r._aType === "Single") { dStats[d].cS++; dStats[d].bS += r._b; }
                if (r._aType === "Multi") { dStats[d].cM++; dStats[d].bM += r._b; }
            });
        } else if (r._aType === "Provincial") {
            dNames.forEach(d => { dStats[d].cP++; });
        }
    });

    if (!districtGeo) return;
    if(geoLayer) map.removeLayer(geoLayer);
    
    geoLayer = L.geoJSON(districtGeo, {
        style: (f) => {
            let d = f.properties.amp_th || f.properties.AMP_TH;
            let s = dStats[d];
            let color = '#f1f5f9';
            
            if (currentMode === 'budget') {
                let v = s.bS; 
                color = v > 50000000 ? '#1e3a8a' : v > 10000000 ? '#2563eb' : v > 1000000 ? '#60a5fa' : v > 0 ? '#93c5fd' : '#f1f5f9';
            } else {
                let v = s.cS + s.cM; 
                color = v > 10 ? '#1e3a8a' : v > 5 ? '#2563eb' : v > 2 ? '#60a5fa' : v > 0 ? '#93c5fd' : '#f1f5f9';
            }
            
            // ดรอปสีถ้าไม่ได้เลือกใน Dropdown
            if (sDists.length > 0 && !sDists.includes(d)) return { fillColor: '#e2e8f0', weight: 1, opacity: 0.5, color: '#fff', fillOpacity: 0.3 };
            return { fillColor: color, weight: 1, opacity: 1, color: '#fff', fillOpacity: 0.8 };
        },
        onEachFeature: (f, l) => {
            let d = f.properties.amp_th || f.properties.AMP_TH;
            let s = dStats[d];
            
            let pop = `<div style="font-family:'Sarabun'; width: 220px;">
                <b style="font-size:15px; color:#1e3a8a;">📍 อ.${d}</b>
                <hr style="margin:5px 0;">
                <div style="font-size:12px; line-height: 1.5;">
                    <b style="color:#10b981;">✅ พื้นที่เดี่ยว (Single):</b><br>${s.cS} โครงการ | ${s.bS.toLocaleString()} บาท<br>
                    <b style="color:#f59e0b;">📦 พื้นที่ร่วม (Multi):</b><br>${s.cM} โครงการ <small>(กรอบงบ ${s.bM.toLocaleString()} บ.)</small><br>
                    <b style="color:#ef4444;">🌐 ภาพรวมจังหวัด:</b><br>${s.cP} โครงการ
                </div>
            </div>`;
            l.bindPopup(pop);
            l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
            l.on('mouseout', e => geoLayer.resetStyle(e.target));
        }
    }).addTo(map);
}

// 🌟 7. ตารางสรุป (คลิกที่ปี เพื่อ Expand อำเภอ)
function toggleYearRow(year) {
    const detailRow = document.getElementById(`detail-${year}`);
    const mainRow = document.getElementById(`row-${year}`);
    if(detailRow.classList.contains('open')) {
        detailRow.classList.remove('open');
        mainRow.classList.remove('open');
    } else {
        detailRow.classList.add('open');
        mainRow.classList.add('open');
    }
}

function renderTable(sYears) {
    let tbody = document.getElementById('summaryTableBody');
    tbody.innerHTML = '';

    let actY = sYears.length > 0 ? [...sYears].sort((a,b)=>b-a) : [...new Set(masterData.map(r=>r._y))].sort((a,b)=>b-a);

    actY.forEach(y => {
        let yData = filteredData.filter(r => r._y === y);
        let yCount = yData.length;
        let yBudget = yData.reduce((s, r) => s + r._b, 0);

        // หาผลรวมแต่ละอำเภอในปีนี้
        let dStats = {};
        dNames.forEach(d => { dStats[d] = { cS: 0, bS: 0, cM: 0, bM: 0, cP: 0 }; });

        yData.forEach(r => {
            if (r._aType === "Single" || r._aType === "Multi") {
                dNames.filter(d => r._a.includes(d)).forEach(d => {
                    if (r._aType === "Single") { dStats[d].cS++; dStats[d].bS += r._b; }
                    if (r._aType === "Multi") { dStats[d].cM++; dStats[d].bM += r._b; }
                });
            } else if (r._aType === "Provincial") {
                dNames.forEach(d => { dStats[d].cP++; });
            }
        });

        // แถวหลัก (ปี)
        let mainTr = document.createElement('tr');
        mainTr.className = 'year-row';
        mainTr.id = `row-${y}`;
        mainTr.onclick = () => toggleYearRow(y);
        mainTr.innerHTML = `
            <td><span class="toggle-icon">▶</span> ปีงบประมาณ ${y}</td>
            <td style="text-align:center;">${yCount}</td>
            <td style="text-align:right; color:#059669;">${yBudget.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
        `;
        tbody.appendChild(mainTr);

        // แถวรายละเอียด (อำเภอ)
        let detailTr = document.createElement('tr');
        detailTr.className = 'district-details';
        detailTr.id = `detail-${y}`;
        
        let distRowsHtml = '';
        dNames.forEach(d => {
            let s = dStats[d];
            if(s.cS > 0 || s.cM > 0 || s.cP > 0) {
                // คลิกที่อำเภอ -> ไปกรองที่ Dropdown
                distRowsHtml += `
                    <tr onclick="filterFromTable('${d}')">
                        <td>📍 อ.${d}</td>
                        <td style="text-align:center;">${s.cS} <span style="color:#f59e0b; font-size:10px;">(+${s.cM} Multi)</span></td>
                        <td style="text-align:right;">${s.bS.toLocaleString()}</td>
                    </tr>
                `;
            }
        });

        if(distRowsHtml === '') distRowsHtml = '<tr><td colspan="3" style="text-align:center; color:gray;">ไม่มีข้อมูลลงพื้นที่</td></tr>';

        detailTr.innerHTML = `
            <td colspan="3" style="padding:0;">
                <div style="max-height: 180px; overflow-y: auto;">
                    <table class="district-table">
                        <thead style="background:#e2e8f0; position:sticky; top:0;">
                            <tr>
                                <th>อำเภอ (คลิกเพื่อกรอง)</th>
                                <th>โครงการ (เดี่ยว+ร่วม)</th>
                                <th>งบลงพื้นที่โดยตรง (บาท)</th>
                            </tr>
                        </thead>
                        <tbody>${distRowsHtml}</tbody>
                    </table>
                </div>
            </td>
        `;
        tbody.appendChild(detailTr);
    });
}
