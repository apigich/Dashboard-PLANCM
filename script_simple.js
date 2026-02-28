const safeSetText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

Chart.register(ChartDataLabels);

let masterData = [];   
let filteredData = []; 
let currentMode = 'count'; 
let selectedStrategyIndex = -1; // -1 = ทั้งหมด, 0-4 = ตามยุทธศาสตร์
let mapFilterDistrict = 'all';

let map = null;
let geojsonLayer = null;
let donutChart = null;
let trendChart = null;
let districtGeoJSON = null; 

// ชื่อเต็มของ 5 ประเด็นการพัฒนาจังหวัด เพื่อใช้ Filter
const stratFullNames = [
    "การส่งเสริมอุตสาหกรรมท่องเที่ยวเน้นคุณค่า สร้างสรรค์บนอัตลักษณ์ล้านนา และอุตสาหกรรมไมซ์",
    "การขับเคลื่อนเกษตรเพิ่มมูลค่า และเกษตรแปรรูปมูลค่าสูง",
    "การยกระดับการค้าการลงทุนบนฐานเศรษฐกิจสร้างสรรค์ (Creative Economy) นวัตกรรม (Innovation) และการพัฒนาอย่างยั่งยืน (SDGs)",
    "การจัดการเชิงรุกในปัญหาฝุ่นควัน (PM 2.5) และการรักษาทรัพยากรธรรมชาติและสิ่งแวดล้อมแบบมีส่วนร่วม",
    "การเสริมสร้างสังคมแห่งโอกาสและเป็นธรรม เมืองน่าอยู่ มีความปลอดภัย เพื่อคุณภาพชีวิตที่ดีของประชาชน"
];

// ชื่อย่อสำหรับแสดงผลในกราฟโดนัท
const stratShortNames = [
    "1. ท่องเที่ยวและไมซ์",
    "2. เกษตรมูลค่าสูง",
    "3. การค้า การลงทุน นวัตกรรม",
    "4. จัดการฝุ่นควันและสิ่งแวดล้อม",
    "5. สังคม โอกาส คุณภาพชีวิต"
];

document.getElementById('modeSwitch').addEventListener('change', (e) => { 
    currentMode = e.target.checked ? 'budget' : 'count'; 
    updateDashboard(); 
});

async function init() {
    try {
        const response = await fetch(API_URL);
        const rawData = await response.json();
        if (!Array.isArray(rawData)) throw new Error("ข้อมูลขัดข้อง");

        try {
            const geoRes = await fetch("districts.json");
            districtGeoJSON = await geoRes.json();
        } catch(e) { console.warn("ไม่สามารถโหลดแผนที่ได้: ", e); }

        const years = new Set();
        masterData = rawData.filter(row => row["ชื่อโครงการ"] && String(row["ชื่อโครงการ"]).trim() !== "").map(row => {
            let budgetRaw = row["งบประมาณ (ตัวเลข)"] || row["งบประมาณ"] || "0";
            row._budgetNum = parseFloat(String(budgetRaw).replace(/,/g, '')) || 0;
            
            let yearRaw = String(row["ปีงบประมาณ"] || "ไม่ระบุ").trim();
            if (yearRaw.includes(".")) yearRaw = yearRaw.split(".")[0];
            row._year = yearRaw;
            if(row._year !== "ไม่ระบุ" && row._year !== "") years.add(row._year);
            
            let areaRaw = row["พื้นที่เป้าหมายทั้งหมด"] || row["⚙️ ขอบเขตพื้นที่ (Auto)"] || row["อำเภอที่ตั้ง (หลัก)"] || "ไม่ระบุ";
            let cleanedArea = String(areaRaw).replace(/จังหวัดเชียงใหม่/g, "").replace(/\s+/g, " ").trim();
            if(cleanedArea.endsWith(",")) cleanedArea = cleanedArea.slice(0, -1);
            row._cleanArea = cleanedArea || "ไม่ระบุ";
            
            if (row._cleanArea.includes("ครอบคลุมทั้งจังหวัด") || row._cleanArea === "ทั้งจังหวัด") { row._areaType = "Provincial"; }
            else if (row._cleanArea.includes(",")) { row._areaType = "Multi"; }
            else if (row._cleanArea === "ไม่ระบุ" || row._cleanArea === "-") { row._areaType = "ไม่ระบุ"; }
            else { row._areaType = "Single"; }
            
            return row;
        });

        const yearBox = document.getElementById('yearCheckboxes');
        let sortedYears = [...years].sort((a,b) => b-a); 
        let maxYear = sortedYears.length > 0 ? sortedYears[0] : null;

        sortedYears.forEach(y => {
            let isChecked = (y === maxYear) ? 'checked' : '';
            yearBox.innerHTML += `<li><label><input type="checkbox" class="year-cb" value="${y}" ${isChecked} onchange="handleYearChange()"> ปีงบประมาณ ${y}</label></li>`;
        });
        document.getElementById('checkAllYears').checked = false;

        applyFilters(); 

        document.getElementById('loadingOverlay').style.opacity = '0';
        setTimeout(() => { document.getElementById('loadingOverlay').style.display = 'none'; }, 300);

    } catch (error) {
        document.getElementById('loadingOverlay').innerHTML = `<h3 style="color:red; font-family:'Sarabun';">❌ เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>`;
    }
}

// 🌟 กติกา 4: ข้อมูลต้องซิงค์กัน 100%
function setStrategy(index) {
    selectedStrategyIndex = index;
    // อัปเดตสีปุ่ม
    const btns = document.querySelectorAll('.strat-btn');
    btns.forEach((btn, i) => {
        if (i === index + 1) btn.classList.add('active'); // +1 เพราะ 0 คือปุ่ม "ทั้งหมด"
        else btn.classList.remove('active');
    });
    applyFilters();
}

function toggleAllYears(sourceCb) {
    document.querySelectorAll('.year-cb').forEach(cb => cb.checked = sourceCb.checked);
    applyFilters();
}

function handleYearChange() {
    let allChecked = document.querySelectorAll('.year-cb:checked').length === document.querySelectorAll('.year-cb').length;
    document.getElementById('checkAllYears').checked = allChecked;
    applyFilters();
}

function resetMapView() {
    mapFilterDistrict = 'all';
    if(map) {
        map.setView([18.7883, 98.9853], 8);
        map.closePopup();
    }
    applyFilters();
}

function clearAllFilters() {
    document.querySelectorAll('.year-cb').forEach(cb => cb.checked = false);
    document.querySelectorAll('.year-cb')[0].checked = true; // เลือกปีล่าสุด
    document.getElementById('checkAllYears').checked = false;
    
    setStrategy(-1); // กลับไปภาพรวมทั้งหมด
    mapFilterDistrict = "all";
    resetMapView();
}

// 🌟 แกนกลางของการซิงค์ข้อมูล
function applyFilters() {
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => String(cb.value)); 
    
    // อัปเดตชื่อแผนที่
    let mapText = mapFilterDistrict === 'all' ? "📍 แผนที่ระดับพื้นที่ (ทั้งหมด)" : `📍 แผนที่ระดับพื้นที่ (กรองเฉพาะ: อ.${mapFilterDistrict})`;
    safeSetText('mapTitle', mapText);

    filteredData = masterData.filter(row => {
        // กรองปี
        const matchYear = selectedYears.length === 0 ? false : selectedYears.includes(String(row._year));
        
        // กรอง 5 ยุทธศาสตร์ (ถ้าเลือก)
        let matchStrat = true;
        if (selectedStrategyIndex !== -1) {
            const rowStrat = String(row['ประเด็นการพัฒนาจังหวัด'] || "");
            const targetStrat = stratFullNames[selectedStrategyIndex];
            matchStrat = rowStrat.includes(targetStrat);
        }
        
        // กรองแผนที่ (ถ้ากด)
        let matchDist = true;
        if (mapFilterDistrict !== 'all') {
            matchDist = row._cleanArea.includes(mapFilterDistrict) || row._areaType === "Provincial";
        }

        return matchYear && matchStrat && matchDist;
    });

    updateDashboard(selectedYears); 
}

function updateDashboard(selectedYears) {
    const totalCount = filteredData.length;
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);
    
    safeSetText('sumProjects', totalCount.toLocaleString());
    safeSetText('sumBudget', totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2}));

    renderTrendChart(selectedYears);
    renderDonutChart();
    renderMap(selectedYears);
}

// 🌟 กติกา 3: กราฟแนวโน้ม (เฉพาะปีที่เลือก) เป็นแกนคู่
function renderTrendChart(selectedYears) {
    const ctx = document.getElementById('trendChart');
    if(!ctx) return;

    let activeYears = [];
    if (selectedYears && selectedYears.length > 0) activeYears = [...selectedYears].sort((a,b)=>a-b);
    else activeYears = Array.from(new Set(masterData.map(r=>r._year))).sort((a,b)=>a-b);
    
    let yearCounts = {}; let yearBudgets = {};
    activeYears.forEach(y => { yearCounts[y] = 0; yearBudgets[y] = 0; }); 
    
    filteredData.forEach(row => {
        if(yearCounts[row._year] !== undefined) {
            yearCounts[row._year] += 1;
            yearBudgets[row._year] += row._budgetNum;
        }
    });
    
    let countData = activeYears.map(y => yearCounts[y]);
    let budgetData = activeYears.map(y => yearBudgets[y]);

    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: activeYears,
            datasets: [
                { type: 'bar', label: 'งบประมาณ (บาท)', data: budgetData, backgroundColor: '#3b82f6', yAxisID: 'y' }, 
                { type: 'line', label: 'จำนวนโครงการ', data: countData, borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.3, yAxisID: 'y1' }
            ]
        },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            scales: {
                y: { type: 'linear', display: true, position: 'left', title: {display:true, text:'งบประมาณ (บาท)', font:{family:'Sarabun'}} },
                y1: { type: 'linear', display: true, position: 'right', grid: {drawOnChartArea: false}, title: {display:true, text:'จำนวนโครงการ', font:{family:'Sarabun'}} }
            },
            plugins: { datalabels: { display: false }, legend: { labels: {font:{family:'Sarabun'}} } } 
        }
    });
}

function renderDonutChart() {
    const ctx = document.getElementById('donutChart');
    if(!ctx) return;

    let sCounts = [0, 0, 0, 0, 0]; // เก็บตาม 5 ประเด็น

    filteredData.forEach(row => {
        const rowStrat = String(row['ประเด็นการพัฒนาจังหวัด'] || "");
        stratFullNames.forEach((fullName, idx) => {
            if (rowStrat.includes(fullName)) {
                sCounts[idx] += (currentMode === 'budget' ? row._budgetNum : 1);
            }
        });
    });

    let dataSum = sCounts.reduce((a, b) => a + b, 0);
    let labelsWithPct = stratShortNames.map((lbl, idx) => {
        let pct = dataSum > 0 ? ((sCounts[idx] * 100) / dataSum).toFixed(1) : 0;
        return `${lbl} (${pct}%)`;
    });
    const pieColors = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    if (donutChart) donutChart.destroy();
    donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: labelsWithPct, datasets: [{ data: sCounts, backgroundColor: pieColors }] },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'right', labels: {font:{family:'Sarabun', size: 11}} },
                tooltip: { callbacks: { label: function(ctx) { return ` ${stratShortNames[ctx.dataIndex]}: ${ctx.raw.toLocaleString()} ${currentMode==='count'?'โครงการ':'บาท'}`; } } },
                datalabels: { color: '#fff', font: { weight: 'bold', size: 12 }, formatter: (v) => { let p = dataSum > 0 ? (v*100 / dataSum).toFixed(1) : 0; return p >= 5 ? p + "%" : ""; } }
            } 
        }
    });
}

function renderMap(selectedYears) {
    if (!map) {
        map = L.map('map', {scrollWheelZoom: false, preferCanvas: true}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    let activeYears = [...(selectedYears || [])];
    
    let districtStats = {};
    const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];
    dNames.forEach(d => { districtStats[d] = { singleC: 0, singleB: 0, multiC: 0, multiB: 0, provC: 0, provB: 0 }; });

    filteredData.forEach(row => {
        let aType = row._areaType; 
        if (aType === "Single" || aType === "Multi") {
            let matched = dNames.filter(d => row._cleanArea.includes(d));
            matched.forEach(d => {
                if (aType === "Single") { districtStats[d].singleC += 1; districtStats[d].singleB += row._budgetNum; }
                if (aType === "Multi") { districtStats[d].multiC += 1; districtStats[d].multiB += row._budgetNum; }
            });
        } else if (aType === "Provincial") {
            dNames.forEach(d => { districtStats[d].provC += 1; districtStats[d].provB += row._budgetNum; });
        }
    });

    if (!districtGeoJSON) return;
    if(geojsonLayer) map.removeLayer(geojsonLayer);
    
    geojsonLayer = L.geoJSON(districtGeoJSON, {
        style: function (f) {
            let dName = f.properties.amp_th || f.properties.AMP_TH || "ไม่ระบุ";
            let s = districtStats[dName] || {singleC: 0, singleB: 0, multiC: 0};
            let color = '#FFEDA0';
            
            // 🌟 กติกา 1: ถ้าดูงบ ให้ดูเฉพาะ Single เพื่อป้องกันงบบวม
            if (currentMode === 'budget') {
                let val = s.singleB; 
                color = val > 50000000 ? '#800026' : val > 10000000 ? '#BD0026' : val > 1000000 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
            } else {
                let val = s.singleC + s.multiC; 
                color = val > 10 ? '#800026' : val > 5 ? '#BD0026' : val > 2 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
            }
            
            // เน้นอำเภอที่กดเลือก
            if (mapFilterDistrict !== 'all' && mapFilterDistrict !== dName) return { fillColor: '#e5e7eb', weight: 1, opacity: 0.5, color: '#fff', fillOpacity: 0.3 };
            
            return { fillColor: color, weight: 1, opacity: 1, color: '#333', fillOpacity: 0.8 };
        },
        onEachFeature: function (f, l) {
            let dName = f.properties.amp_th || f.properties.AMP_TH || "ไม่ระบุ";
            l.on('click', function(e) {
                let s = districtStats[dName];
                let popupHtml = `<div style="font-family:'Sarabun'; width: 280px;">
                    <b style="font-size:16px; color:#1e3a8a;">📍 ข้อมูลอำเภอ${dName}</b>
                    <hr style="margin:5px 0;">
                    <div style="font-size:13px; line-height: 1.5;">
                        <b style="color:#10b981;">✅ โครงการลงพื้นที่นี้โดยตรง:</b><br>
                        ${s.singleC} โครงการ | <b>${s.singleB.toLocaleString()} บาท</b><br><br>
                        <b style="color:#f59e0b;">📦 โครงการร่วมอำเภออื่น:</b><br>
                        ${s.multiC} โครงการ <span style="color:gray; font-size:11px;">(กรอบงบกลุ่ม ${s.multiB.toLocaleString()} บ.)</span><br><br>
                        <b style="color:#ef4444;">🌐 โครงการภาพรวมจังหวัด:</b><br>
                        ${s.provC} โครงการ <span style="color:gray; font-size:11px;">(ประชาชนในพื้นที่ได้รับประโยชน์)</span>
                    </div>
                </div>`;
                l.bindPopup(popupHtml).openPopup();
                
                // 🌟 ซิงค์ข้อมูล: กดแผนที่แล้วกรองข้อมูลในกราฟทันที
                mapFilterDistrict = dName;
                applyFilters();
            });
            l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
            l.on('mouseout', e => geojsonLayer.resetStyle(e.target));
        }
    }).addTo(map);
}

// เริ่มต้นทำงาน
init();
