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

// ดึงลิสต์เพื่อทำสีโดนัท
const STRAT_MASTER_LISTS = {
    0: ["ด้าน 1 ความมั่นคง", "ด้าน 2 การสร้างความสามารถในการแข่งขัน", "ด้าน 3 การพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์", "ด้าน 4 การสร้างโอกาสและความเสมอภาคทางสังคม", "ด้าน 5 การสร้างการเติบโตบนคุณภาพชีวิตที่เป็นมิตรกับสิ่งแวดล้อม", "ด้าน 6 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ"],
    1: ["ประเด็นที่ 1 ความมั่นคง", "ประเด็นที่ 2 การต่างประเทศ", "ประเด็นที่ 3 การเกษตร", "ประเด็นที่ 4 อุตสาหกรรมและบริการแห่งอนาคต", "ประเด็นที่ 5 การท่องเที่ยว", "ประเด็นที่ 6 พื้นที่และเมืองน่าอยู่อัจฉริยะ", "ประเด็นที่ 7 โครงสร้างพื้นฐาน ระบบโลจิสติกส์ และดิจิทัล", "ประเด็นที่ 8 ผู้ประกอบการและวิสาหกิจขนาดกลางและขนาดย่อมยุคใหม่", "ประเด็นที่ 9 เขตเศรษฐกิจพิเศษ", "ประเด็นที่ 10 การปรับเปลี่ยนค่านิยมและวัฒนธรรม", "ประเด็นที่ 11 ศักยภาพคนตลอดช่วงชีวิต", "ประเด็นที่ 12 การพัฒนาการเรียนรู้", "ประเด็นที่ 13 การเสริมสร้างให้คนไทยมีสุขภาวะที่ดี", "ประเด็นที่ 14 ศักยภาพการกีฬา", "ประเด็นที่ 15 พลังทางสังคม", "ประเด็นที่ 16 เศรษฐกิจฐานราก", "ประเด็นที่ 17 ความเสมอภาคและหลักประกันทางสังคม", "ประเด็นที่ 18 การเติบโตอย่างยั่งยืน", "ประเด็นที่ 19 การบริหารจัดการน้ำทั้งระบบ", "ประเด็นที่ 20 การบริการประชาชนและประสิทธิภาพภาครัฐ", "ประเด็นที่ 21 การต่อต้านการทุจริตและประพฤติมิชอบ", "ประเด็นที่ 22 กฎหมายและกระบวนการยุติธรรม", "ประเด็นที่ 23 การวิจัยและพัฒนานวัตกรรม"],
    2: ["หมุดหมายที่ 1 ไทยเป็นประเทศชั้นนำด้านสินค้าเกษตรและเกษตรแปรรูปมูลค่าสูง", "หมุดหมายที่ 2 ไทยเป็นจุดหมายของการท่องเที่ยวที่เน้นคุณภาพและความยั่งยืน", "หมุดหมายที่ 3 ไทยเป็นฐานการผลิตยานยนต์ไฟฟ้าที่สำคัญของโลก", "หมุดหมายที่ 4 ไทยเป็นศูนย์กลางทางการแพทย์และสุขภาพมูลค่าสูง", "หมุดหมายที่ 5 ไทยเป็นประตูการค้าการลงทุนและยุทธศาสตร์ทางโลจิสติกส์ที่สำคัญของภูมิภาค", "หมุดหมายที่ 6 ไทยเป็นศูนย์กลางอุตสาหกรรมอิเล็กทรอนิกส์อัจฉริยะและอุตสาหกรรมดิจิทัลของอาเซียน", "หมุดหมายที่ 7 ไทยมีวิสาหกิจขนาดกลางและขนาดย่อมที่เข้มแข็ง มีศักยภาพสูง และสามารถแข่งขันได้", "หมุดหมายที่ 8 ไทยมีพื้นที่และเมืองอัจฉริยะที่น่าอยู่ ปลอดภัย เติบโตได้อย่างยั่งยืน", "หมุดหมายที่ 9 ไทยมีความยากจนข้ามรุ่นลดลง และมีความคุ้มครองทางสังคมที่เพียงพอ เหมาะสม", "หมุดหมายที่ 10 ไทยมีเศรษฐกิจหมุนเวียนและสังคมคาร์บอนต่ำ", "หมุดหมายที่ 11 ไทยสามารถลดความเสี่ยงและผลกระทบจากภัยธรรมชาติและการเปลี่ยนแปลงสภาพภูมิอากาศ", "หมุดหมายที่ 12 ไทยมีกำลังคนสมรรถนะสูง มุ่งเรียนรู้อย่างต่อเนื่อง ตอบโจทย์การพัฒนาแห่งอนาคต", "หมุดหมายที่ 13 ไทยมีภาครัฐที่ทันสมัย มีประสิทธิภาพ และตอบโจทย์ประชาชน"],
    3: ["ประเด็นการพัฒนาที่ 1 การพัฒนาเศรษฐกิจท่องเที่ยวและการค้าในพื้นที่", "ประเด็นการพัฒนาที่ 2 การพัฒนาเศรษฐกิจมูลค่าสูงด้วยการส่งออกสินค้าและบริการนอกพื้นที่", "ประเด็นการพัฒนาที่ 3 การพัฒนาเศรษฐกิจเกษตรสร้างสรรค์", "ประเด็นการพัฒนาที่ 4 การพัฒนาเศรษฐกิจสิ่งแวดล้อมเพื่อลดฝุ่นควัน"],
    4: ["ประเด็นการพัฒนาที่ 1 การส่งเสริมอุตสาหกรรมท่องเที่ยวเน้นคุณค่า สร้างสรรค์บนอัตลักษณ์ล้านนา และอุตสาหกรรมไมซ์", "ประเด็นการพัฒนาที่ 2 การขับเคลื่อนเกษตรเพิ่มมูลค่า และเกษตรแปรรูปมูลค่าสูง", "ประเด็นการพัฒนาที่ 3 การยกระดับการค้าการลงทุนบนฐานเศรษฐกิจสร้างสรรค์ (Creative Economy) นวัตกรรม (Innovation) และการพัฒนาอย่างยั่งยืน (SDGs)", "ประเด็นการพัฒนาที่ 4 การจัดการเชิงรุกในปัญหาฝุ่นควัน (PM 2.5) และการรักษาทรัพยากรธรรมชาติและสิ่งแวดล้อมแบบมีส่วนร่วม", "ประเด็นการพัฒนาที่ 5 การเสริมสร้างสังคมแห่งโอกาสและเป็นธรรม เมืองน่าอยู่ มีความปลอดภัย เพื่อคุณภาพชีวิตที่ดีของประชาชน"]
};

const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];

let map, geoLayer, donut, trend, districtGeo;

$(document).ready(function() {
    $('#districtFilter').select2({ placeholder: "ค้นหาหรือเลือกอำเภอ (เลือกทั้งหมดได้)", allowClear: true, width: '100%' });
    dNames.forEach(d => { $('#districtFilter').append(new Option(d, d, false, false)); });
    $('#districtFilter').on('change', function() { updateDashboard(); });

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

function filterFromTable(dName) {
    let currentVals = $('#districtFilter').val() || [];
    if (!currentVals.includes(dName)) {
        currentVals.push(dName);
        $('#districtFilter').val(currentVals).trigger('change'); 
    }
}

function resetMapView() {
    $('#districtFilter').val(null).trigger('change');
    if(map) {
        map.setView([18.7883, 98.9853], 8);
        map.closePopup();
    }
}

function updateDashboard() {
    const sYears = Array.from(document.querySelectorAll('.y-cb:checked')).map(el => el.value);
    const sDists = $('#districtFilter').val() || []; 

    if(sYears.length === 0) document.getElementById('yearStatus').innerText = '(กรุณาเลือกปี)';
    else if(sYears.length === document.querySelectorAll('.y-cb').length) document.getElementById('yearStatus').innerText = '(ทุกปี)';
    else document.getElementById('yearStatus').innerText = `(${sYears.join(',')})`;

    let targetKey = stratKeys[currentStratLevel];

    filteredData = masterData.filter(r => {
        let mY = sYears.includes(r._y);
        
        let val = r[targetKey];
        if (val === undefined) {
            let searchKey = targetKey.split(" ")[0]; 
            if(targetKey.includes("ฉบับที่ 13")) searchKey = "ฉบับที่ 13";
            let foundKey = Object.keys(r).find(k => k.includes(searchKey));
            if (foundKey) val = r[foundKey];
        }
        let mS = (val && String(val).trim() !== "" && String(val) !== "-"); 
        
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

// 🌟 ปรับโดนัท: ให้โชว์สัดส่วนเป้าหมายในประเด็นยุทธศาสตร์
function renderDonut() {
    const ctx = document.getElementById('donutChart');
    if(!ctx) return;

    let targetKey = stratKeys[currentStratLevel];
    let masterList = STRAT_MASTER_LISTS[currentStratLevel];
    let stratStats = {};
    
    filteredData.forEach(row => {
        let val = row[targetKey];
        if (val === undefined) {
            let searchKey = targetKey.split(" ")[0]; 
            if(targetKey.includes("ฉบับที่ 13")) searchKey = "ฉบับที่ 13";
            let foundKey = Object.keys(row).find(k => k.includes(searchKey));
            if (foundKey) val = row[foundKey];
        }

        let strVal = String(val).trim();
        if (!val || strVal === "" || strVal === "NaN" || strVal === "undefined" || strVal === "-") strVal = "ไม่ระบุ";
        
        let strategies = strVal.split(",").map(s => s.trim()).filter(s => s !== "");
        if (strategies.length === 0) strategies = ["ไม่ระบุ"];

        strategies.forEach(s => {
            if(!stratStats[s]) stratStats[s] = 0;
            stratStats[s] += (currentMode === 'budget' ? row._b : 1);
        });
    });

    let sortedKeys = Object.keys(stratStats).sort((a,b) => {
        if(a === 'ไม่ระบุ') return 1;
        if(b === 'ไม่ระบุ') return -1;
        let idxA = masterList.indexOf(a); let idxB = masterList.indexOf(b);
        if(idxA === -1) idxA = 999; if(idxB === -1) idxB = 999;
        return idxA - idxB; 
    });

    let displayLabels = sortedKeys.map(k => k.length > 35 ? k.substring(0, 35) + "..." : k);
    let data = sortedKeys.map(k => stratStats[k]);
    
    let total = data.reduce((a, b) => a + b, 0);
    let lPct = displayLabels.map((l, i) => { return `${l} (${total>0 ? ((data[i]*100)/total).toFixed(1) : 0}%)`; });
    const pieColors = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#0ea5e9', '#14b8a6', '#f43f5e', '#d946ef', '#a855f7'];

    // เปลี่ยน Title โดนัทให้รู้ว่ากำลังดูสัดส่วนของแผนไหน
    document.querySelector('.donut-card .chart-title').innerHTML = `🍩 สัดส่วนเป้าหมาย (${stratNames[currentStratLevel]})`;

    if(donut) donut.destroy();
    donut = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: lPct, datasets: [{ data: data, backgroundColor: pieColors }] },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'right', labels: {font:{family:'Sarabun', size: 10}} },
                tooltip: { callbacks: { label: c => ` ${displayLabels[c.dataIndex]}: ${c.raw.toLocaleString()} ${currentMode==='count'?'โครงการ':'บาท'}` } },
                datalabels: { color: '#fff', font: { weight: 'bold', size: 11 }, formatter: v => total > 0 && (v*100/total) >= 5 ? (v*100/total).toFixed(1) + "%" : "" }
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
    dNames.forEach(d => { dStats[d] = { cS: 0, bS: 0, cM: 0, bM: 0, cP: 0, bP: 0 }; });

    filteredData.forEach(r => {
        if (r._aType === "Single" || r._aType === "Multi") {
            dNames.filter(d => r._a.includes(d)).forEach(d => {
                if (r._aType === "Single") { dStats[d].cS++; dStats[d].bS += r._b; }
                if (r._aType === "Multi") { dStats[d].cM++; dStats[d].bM += r._b; }
            });
        } else if (r._aType === "Provincial") {
            dNames.forEach(d => { dStats[d].cP++; dStats[d].bP += r._b; });
        }
    });

    if (!districtGeo) return;
    if(geoLayer) map.removeLayer(geoLayer);
    
    geoLayer = L.geoJSON(districtGeo, {
        style: (f) => {
            let d = f.properties.amp_th || f.properties.AMP_TH;
            let s = dStats[d] || {cS:0, bS:0, cM:0};
            let color = '#f1f5f9';
            
            if (currentMode === 'budget') {
                let v = s.bS; 
                color = v > 50000000 ? '#1e3a8a' : v > 10000000 ? '#2563eb' : v > 1000000 ? '#60a5fa' : v > 0 ? '#93c5fd' : '#f1f5f9';
            } else {
                let v = s.cS + s.cM; 
                color = v > 10 ? '#1e3a8a' : v > 5 ? '#2563eb' : v > 2 ? '#60a5fa' : v > 0 ? '#93c5fd' : '#f1f5f9';
            }
            
            if (sDists.length > 0 && !sDists.includes(d)) return { fillColor: '#e2e8f0', weight: 1, opacity: 0.5, color: '#fff', fillOpacity: 0.3 };
            return { fillColor: color, weight: 1, opacity: 1, color: '#fff', fillOpacity: 0.8 };
        },
        onEachFeature: (f, l) => {
            let d = f.properties.amp_th || f.properties.AMP_TH;
            let s = dStats[d];
            
            // 🌟 ปรับ Popup แผนที่ ให้ใช้คำอธิบายแบบ Advanced
            let pop = `<div style="font-family:'Sarabun'; width: 280px;">
                <b style="font-size:16px; color:#1e3a8a;">📍 อ.${d}</b>
                <hr style="margin:5px 0;">
                <div style="font-size:13px; line-height: 1.5;">
                    <b style="color:#10b981;">🎯 ดำเนินการเฉพาะอำเภอนี้ (Single)</b><br>
                    รวมทั้งหมด: <b>${s.cS}</b> โครงการ | <b>${s.bS.toLocaleString()}</b> บาท<br>
                    <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                    <b style="color:#f59e0b;">📦 ดำเนินการร่วมอำเภออื่น (Multi)</b><br>
                    รวมที่เกี่ยวข้อง: <b>${s.cM}</b> โครงการ<br>ยอดรวมกรอบงบ: <b>${s.bM.toLocaleString()}</b> บาท<br>
                    <span style="color:#ef4444; font-size:11px;">(งบส่วนนี้เป็นยอดรวม ไม่ถูกนำมาหารและระบายสีในแผนที่)</span><br>
                    <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                    <b style="color:#ef4444;">🌐 ครอบคลุมทั้งจังหวัด (Provincial)</b><br>
                    รวมที่ครอบคลุมถึง: <b>${s.cP}</b> โครงการ<br>
                    <span style="color:#ef4444; font-size:11px;">(ไม่นำมาคำนวณความเข้มข้นในแผนที่)</span>
                </div>
            </div>`;
            l.bindPopup(pop);
            l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
            l.on('mouseout', e => geoLayer.resetStyle(e.target));
        }
    }).addTo(map);
}

// 🌟 7. ตารางสรุปแบบ Expandable (ออกแบบใหม่กันงบบวม)
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

        // แถวรายละเอียด (แยกคอลัมน์ชัดเจน กันคนบวกเลขผิด)
        let detailTr = document.createElement('tr');
        detailTr.className = 'district-details';
        detailTr.id = `detail-${y}`;
        
        let distRowsHtml = '';
        dNames.forEach(d => {
            let s = dStats[d];
            if(s.cS > 0 || s.cM > 0 || s.cP > 0) {
                distRowsHtml += `
                    <tr onclick="filterFromTable('${d}')">
                        <td>📍 อ.${d}</td>
                        <td style="text-align:center;">${s.cS} <span style="color:#64748b; font-size:10px;">(+${s.cM} Multi)</span></td>
                        <td style="text-align:right; color:#10b981;"><b>${s.bS.toLocaleString()}</b></td>
                        <td style="text-align:right; color:#64748b; font-size:11px;">${s.bM.toLocaleString()}</td>
                    </tr>
                `;
            }
        });

        if(distRowsHtml === '') distRowsHtml = '<tr><td colspan="4" style="text-align:center; color:gray;">ไม่มีข้อมูลลงพื้นที่ในปีนี้</td></tr>';

        detailTr.innerHTML = `
            <td colspan="3" style="padding:0; background: #f8fafc;">
                <div style="max-height: 200px; overflow-y: auto; padding: 5px;">
                    <table class="district-table">
                        <thead style="background:#e2e8f0; position:sticky; top:0;">
                            <tr>
                                <th style="width:25%;">อำเภอ (คลิกเพื่อกรอง)</th>
                                <th style="text-align:center; width:25%;">โครงการ<br><small>(เดี่ยว + ร่วม)</small></th>
                                <th style="text-align:right; width:25%;">งบลงพื้นที่โดยตรง<br><small style="color:#10b981;">(Single)</small></th>
                                <th style="text-align:right; width:25%;">กรอบงบกลุ่มพื้นที่<br><small style="color:#f59e0b;">(Multi)</small></th>
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
