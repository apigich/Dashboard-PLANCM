// 🚨 เปลี่ยน API_URL ตรงนี้ให้เป็นของคุณครับ
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

let masterData = [];   
let filteredData = []; 
let currentStratIdx = 0; // ล็อกค่าเริ่มต้นไว้ที่ยุทธศาสตร์ที่ 1 (แทนที่จะเป็นภาพรวม)
let currentMode = 'count'; 
let mapFilterDistrict = 'all';

// ชื่อเต็มเพื่อใช้ค้นหา
const stratNames = [
    "การส่งเสริมอุตสาหกรรมท่องเที่ยวเน้นคุณค่า สร้างสรรค์บนอัตลักษณ์ล้านนา และอุตสาหกรรมไมซ์",
    "การขับเคลื่อนเกษตรเพิ่มมูลค่า และเกษตรแปรรูปมูลค่าสูง",
    "การยกระดับการค้าการลงทุนบนฐานเศรษฐกิจสร้างสรรค์ (Creative Economy) นวัตกรรม (Innovation) และการพัฒนาอย่างยั่งยืน (SDGs)",
    "การจัดการเชิงรุกในปัญหาฝุ่นควัน (PM 2.5) และการรักษาทรัพยากรธรรมชาติและสิ่งแวดล้อมแบบมีส่วนร่วม",
    "การเสริมสร้างสังคมแห่งโอกาสและเป็นธรรม เมืองน่าอยู่ มีความปลอดภัย เพื่อคุณภาพชีวิตที่ดีของประชาชน"
];

const stratShort = ["ท่องเที่ยวและไมซ์", "เกษตรมูลค่าสูง", "การค้า/นวัตกรรม", "ฝุ่นควัน/สิ่งแวดล้อม", "สังคม/คุณภาพชีวิต"];

let map = null, geoLayer = null, donut = null, trend = null, districtGeo = null;

// สลับสวิตช์ แผนที่
document.getElementById('modeSwitch').addEventListener('change', (e) => { 
    currentMode = e.target.checked ? 'budget' : 'count'; 
    document.getElementById('mapContext').innerText = currentMode === 'count' ? '(ระบายสีตามความหนาแน่นโครงการ)' : '(ระบายสีตามงบประมาณลงเฉพาะพื้นที่เท่านั้น)';
    updateDashboard(); 
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
            if(y !== "ไม่ระบุ") years.add(y);
            
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
            yBox.innerHTML += `<li><label><input type="checkbox" class="y-cb" value="${yr}" ${i===0?'checked':''} onchange="handleYearChange()"> ปีงบประมาณ ${yr}</label></li>`;
        });
        document.getElementById('checkAllYears').checked = false;

        updateDashboard();
        
        document.getElementById('loadingOverlay').style.opacity = '0';
        setTimeout(() => document.getElementById('loadingOverlay').style.display = 'none', 300);

    } catch (error) {
        document.getElementById('loadingOverlay').innerHTML = `<h3 style="color:red; font-family:'Sarabun';">❌ โหลดข้อมูลไม่สำเร็จ</h3>`;
    }
}

// 🌟 กดปุ่มบุ๋ม
function setStrat(idx) {
    currentStratIdx = idx;
    document.querySelectorAll('.strat-btn').forEach((btn, i) => {
        if (i === idx) btn.classList.add('active'); // ทำให้ปุ่มบุ๋ม
        else btn.classList.remove('active'); // ทำให้ปุ่มอื่นเด้งขึ้นมา
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

function resetMap() { mapFilterDistrict = 'all'; if(map) map.closePopup(); updateDashboard(); }

function updateDashboard() {
    const sYears = Array.from(document.querySelectorAll('.y-cb:checked')).map(el => el.value);
    const targetStrat = stratNames[currentStratIdx];

    // อัปเดต Title บอกให้รู้ว่าดูอะไรอยู่
    document.getElementById('titleProjects').innerText = `📌 จำนวนโครงการ (${stratShort[currentStratIdx]})`;
    document.getElementById('titleBudget').innerText = `💰 งบประมาณ (${stratShort[currentStratIdx]})`;
    document.getElementById('donutContext').innerText = `(รวมปี ${sYears.join(',')})`;

    filteredData = masterData.filter(r => {
        let mY = sYears.includes(r._y);
        let mS = String(r['ประเด็นการพัฒนาจังหวัด'] || "").includes(targetStrat);
        let mD = mapFilterDistrict === 'all' || r._a.includes(mapFilterDistrict) || r._aType === "Provincial";
        return mY && mS && mD;
    });

    const sumC = filteredData.length;
    const sumB = filteredData.reduce((acc, cur) => acc + cur._b, 0);
    document.getElementById('sumProjects').innerText = sumC.toLocaleString();
    document.getElementById('sumBudget').innerText = sumB.toLocaleString(undefined, {minimumFractionDigits:2});

    renderTrend(sYears);
    renderDonut();
    renderMap(sYears);
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
            { type: 'bar', label: 'งบประมาณ (บาท)', data: dB, backgroundColor: '#3b82f6', yAxisID: 'y' }, 
            { type: 'line', label: 'จำนวนโครงการ', data: dC, borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.3, yAxisID: 'y1' }
        ]},
        options: { 
            responsive: true, maintainAspectRatio: false, 
            scales: {
                y: { display: true, position: 'left', title: {display:true, text:'งบประมาณ', font:{family:'Sarabun'}} },
                y1: { display: true, position: 'right', grid: {drawOnChartArea: false}, title: {display:true, text:'จำนวน', font:{family:'Sarabun'}} }
            },
            plugins: { datalabels: { display: false } } 
        }
    });
}

// 🌟 เปลี่ยนโดนัทมาวิเคราะห์ลักษณะพื้นที่ (ตามประเด็นที่เลือก)
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
    let labels = ['เจาะจงเฉพาะพื้นที่ (Single)', 'เชื่อมโยงข้ามอำเภอ (Multi)', 'ภาพรวมทั้งจังหวัด (Provincial)'];
    
    let lPct = labels.map((l, i) => {
        let p = total > 0 ? ((data[i]*100)/total).toFixed(1) : 0;
        return `${l} (${p}%)`;
    });

    if(donut) donut.destroy();
    donut = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: lPct, datasets: [{ data: data, backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }] },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'bottom', labels: {font:{family:'Sarabun', size: 12}} },
                tooltip: { callbacks: { label: c => ` ${labels[c.dataIndex]}: ${c.raw.toLocaleString()} ${currentMode==='count'?'โครงการ':'บาท'}` } },
                datalabels: { color: '#fff', font: { weight: 'bold', size: 12 }, formatter: v => total > 0 && (v*100/total) >= 5 ? (v*100/total).toFixed(1) + "%" : "" }
            } 
        }
    });
}

function renderMap(sYears) {
    if (!map) {
        map = L.map('map', {scrollWheelZoom: false, preferCanvas: true}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    let dStats = {};
    const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];
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
            let s = dStats[d] || {cS:0, bS:0, cM:0};
            let color = '#f1f5f9';
            
            // กติกา: กันงบบวม ระบายสีเฉพาะ Single
            if (currentMode === 'budget') {
                let v = s.bS; 
                color = v > 50000000 ? '#1e3a8a' : v > 10000000 ? '#2563eb' : v > 1000000 ? '#60a5fa' : v > 0 ? '#93c5fd' : '#f1f5f9';
            } else {
                let v = s.cS + s.cM; 
                color = v > 10 ? '#1e3a8a' : v > 5 ? '#2563eb' : v > 2 ? '#60a5fa' : v > 0 ? '#93c5fd' : '#f1f5f9';
            }
            
            if (mapFilterDistrict !== 'all' && mapFilterDistrict !== d) return { fillColor: '#e2e8f0', weight: 1, opacity: 0.5, color: '#fff', fillOpacity: 0.3 };
            return { fillColor: color, weight: 1, opacity: 1, color: '#fff', fillOpacity: 0.8 };
        },
        onEachFeature: (f, l) => {
            let d = f.properties.amp_th || f.properties.AMP_TH;
            let s = dStats[d];
            
            let pop = `<div style="font-family:'Sarabun'; width: 250px;">
                <b style="font-size:16px; color:#1e3a8a;">📍 อ.${d}</b> <br>
                <small style="color:#64748b;">(เฉพาะประเด็น: ${stratShort[currentStratIdx]})</small>
                <hr style="margin:5px 0;">
                <div style="font-size:13px; line-height: 1.5;">
                    <b style="color:#10b981;">✅ ลงพื้นที่โดยตรง:</b><br>${s.cS} โครงการ | ${s.bS.toLocaleString()} บาท<br>
                    <b style="color:#f59e0b;">📦 ทำร่วมกับอำเภออื่น:</b><br>${s.cM} โครงการ <small>(งบกลุ่ม ${s.bM.toLocaleString()} บ.)</small><br>
                    <b style="color:#ef4444;">🌐 โครงการระดับจังหวัด:</b><br>${s.cP} โครงการ
                </div>
                <button onclick="mapFilterDistrict='${d}'; updateDashboard(); map.closePopup();" style="margin-top:10px; width:100%; padding:6px; background:#1e3a8a; color:white; border:none; border-radius:4px; cursor:pointer;">🔍 กรองดูกราฟเฉพาะอำเภอนี้</button>
            </div>`;
            l.bindPopup(pop);
            l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
            l.on('mouseout', e => geoLayer.resetStyle(e.target));
        }
    }).addTo(map);
}

init();
