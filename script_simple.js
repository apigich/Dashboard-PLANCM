const safeSetText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };

// 🚨 เปลี่ยน URL เป็นของคุณที่นี่
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

Chart.register(ChartDataLabels);

let masterData = [];   
let filteredData = []; 
let currentMode = 'count'; 
let areaChart = null;
let trendChart = null;
let map = null;
let geojsonLayer = null;

let mapFilterDistrict = "all";

let districtGeoJSON = null; 

const stratMapping = {
    'filterNat': { key: 'ยุทธศาสตร์ชาติ 20 ปี' },
    'filterMaster': { key: 'แผนแม่บทภายใต้ยุทธศาสตร์ชาติ' },
    'filterPlan13': { key: 'แผนพัฒนาฯ ฉบับที่ 13' },
    'filterNorth': { key: 'แผนพัฒนาภาคเหนือ' },
    'filterProv': { key: 'ประเด็นการพัฒนาจังหวัด' }
};

const STRAT_MASTER_LISTS = {
    filterNat: ["ด้าน 1 ความมั่นคง", "ด้าน 2 การสร้างความสามารถในการแข่งขัน", "ด้าน 3 การพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์", "ด้าน 4 การสร้างโอกาสและความเสมอภาคทางสังคม", "ด้าน 5 การสร้างการเติบโตบนคุณภาพชีวิตที่เป็นมิตรกับสิ่งแวดล้อม", "ด้าน 6 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ"],
    filterMaster: ["ประเด็นที่ 1 ความมั่นคง", "ประเด็นที่ 2 การต่างประเทศ", "ประเด็นที่ 3 การเกษตร", "ประเด็นที่ 4 อุตสาหกรรมและบริการแห่งอนาคต", "ประเด็นที่ 5 การท่องเที่ยว", "ประเด็นที่ 6 พื้นที่และเมืองน่าอยู่อัจฉริยะ", "ประเด็นที่ 7 โครงสร้างพื้นฐาน ระบบโลจิสติกส์ และดิจิทัล", "ประเด็นที่ 8 ผู้ประกอบการและวิสาหกิจขนาดกลางและขนาดย่อมยุคใหม่", "ประเด็นที่ 9 เขตเศรษฐกิจพิเศษ", "ประเด็นที่ 10 การปรับเปลี่ยนค่านิยมและวัฒนธรรม", "ประเด็นที่ 11 ศักยภาพคนตลอดช่วงชีวิต", "ประเด็นที่ 12 การพัฒนาการเรียนรู้", "ประเด็นที่ 13 การเสริมสร้างให้คนไทยมีสุขภาวะที่ดี", "ประเด็นที่ 14 ศักยภาพการกีฬา", "ประเด็นที่ 15 พลังทางสังคม", "ประเด็นที่ 16 เศรษฐกิจฐานราก", "ประเด็นที่ 17 ความเสมอภาคและหลักประกันทางสังคม", "ประเด็นที่ 18 การเติบโตอย่างยั่งยืน", "ประเด็นที่ 19 การบริหารจัดการน้ำทั้งระบบ", "ประเด็นที่ 20 การบริการประชาชนและประสิทธิภาพภาครัฐ", "ประเด็นที่ 21 การต่อต้านการทุจริตและประพฤติมิชอบ", "ประเด็นที่ 22 กฎหมายและกระบวนการยุติธรรม", "ประเด็นที่ 23 การวิจัยและพัฒนานวัตกรรม"],
    filterPlan13: ["หมุดหมายที่ 1 ไทยเป็นประเทศชั้นนำด้านสินค้าเกษตรและเกษตรแปรรูปมูลค่าสูง", "หมุดหมายที่ 2 ไทยเป็นจุดหมายของการท่องเที่ยวที่เน้นคุณภาพและความยั่งยืน", "หมุดหมายที่ 3 ไทยเป็นฐานการผลิตยานยนต์ไฟฟ้าที่สำคัญของโลก", "หมุดหมายที่ 4 ไทยเป็นศูนย์กลางทางการแพทย์และสุขภาพมูลค่าสูง", "หมุดหมายที่ 5 ไทยเป็นประตูการค้าการลงทุนและยุทธศาสตร์ทางโลจิสติกส์ที่สำคัญของภูมิภาค", "หมุดหมายที่ 6 ไทยเป็นศูนย์กลางอุตสาหกรรมอิเล็กทรอนิกส์อัจฉริยะและอุตสาหกรรมดิจิทัลของอาเซียน", "หมุดหมายที่ 7 ไทยมีวิสาหกิจขนาดกลางและขนาดย่อมที่เข้มแข็ง มีศักยภาพสูง และสามารถแข่งขันได้", "หมุดหมายที่ 8 ไทยมีพื้นที่และเมืองอัจฉริยะที่น่าอยู่ ปลอดภัย เติบโตได้อย่างยั่งยืน", "หมุดหมายที่ 9 ไทยมีความยากจนข้ามรุ่นลดลง และมีความคุ้มครองทางสังคมที่เพียงพอ เหมาะสม", "หมุดหมายที่ 10 ไทยมีเศรษฐกิจหมุนเวียนและสังคมคาร์บอนต่ำ", "หมุดหมายที่ 11 ไทยสามารถลดความเสี่ยงและผลกระทบจากภัยธรรมชาติและการเปลี่ยนแปลงสภาพภูมิอากาศ", "หมุดหมายที่ 12 ไทยมีกำลังคนสมรรถนะสูง มุ่งเรียนรู้อย่างต่อเนื่อง ตอบโจทย์การพัฒนาแห่งอนาคต", "หมุดหมายที่ 13 ไทยมีภาครัฐที่ทันสมัย มีประสิทธิภาพ และตอบโจทย์ประชาชน"],
    filterNorth: ["ประเด็นการพัฒนาที่ 1 การพัฒนาเศรษฐกิจท่องเที่ยวและการค้าในพื้นที่", "ประเด็นการพัฒนาที่ 2 การพัฒนาเศรษฐกิจมูลค่าสูงด้วยการส่งออกสินค้าและบริการนอกพื้นที่", "ประเด็นการพัฒนาที่ 3 การพัฒนาเศรษฐกิจเกษตรสร้างสรรค์", "ประเด็นการพัฒนาที่ 4 การพัฒนาเศรษฐกิจสิ่งแวดล้อมเพื่อลดฝุ่นควัน"],
    filterProv: ["ประเด็นการพัฒนาที่ 1 การส่งเสริมอุตสาหกรรมท่องเที่ยวเน้นคุณค่า สร้างสรรค์บนอัตลักษณ์ล้านนา และอุตสาหกรรมไมซ์", "ประเด็นการพัฒนาที่ 2 การขับเคลื่อนเกษตรเพิ่มมูลค่า และเกษตรแปรรูปมูลค่าสูง", "ประเด็นการพัฒนาที่ 3 การยกระดับการค้าการลงทุนบนฐานเศรษฐกิจสร้างสรรค์ (Creative Economy) นวัตกรรม (Innovation) และการพัฒนาอย่างยั่งยืน (SDGs)", "ประเด็นการพัฒนาที่ 4 การจัดการเชิงรุกในปัญหาฝุ่นควัน (PM 2.5) และการรักษาทรัพยากรธรรมชาติและสิ่งแวดล้อมแบบมีส่วนร่วม", "ประเด็นการพัฒนาที่ 5 การเสริมสร้างสังคมแห่งโอกาสและเป็นธรรม เมืองน่าอยู่ มีความปลอดภัย เพื่อคุณภาพชีวิตที่ดีของประชาชน"]
};

function buildStaticSlicers() {
    for (const [id, options] of Object.entries(STRAT_MASTER_LISTS)) {
        const select = document.getElementById(id);
        if(select) options.forEach(opt => select.innerHTML += `<option value="${opt}">${opt}</option>`);
    }
    const modeSwitch = document.getElementById('modeSwitch');
    if(modeSwitch) {
        modeSwitch.addEventListener('change', (e) => { 
            currentMode = e.target.checked ? 'budget' : 'count'; 
            safeSetText('mapTitleContext', currentMode === 'count' ? '(ระบายสีตาม: จำนวน)' : '(ระบายสีตาม: งบพื้นที่)');
            updateDashboard(); 
        });
    }
}

function clearMapFilter() { mapFilterDistrict = "all"; applyFilters(); }

function resetMapView() {
    if(map) {
        map.setView([18.7883, 98.9853], 8);
        map.closePopup();
    }
}

async function init() {
    buildStaticSlicers(); 

    try {
        const response = await fetch(API_URL);
        const rawData = await response.json();
        if (!Array.isArray(rawData)) throw new Error("ข้อมูลขัดข้อง กรุณาตรวจสอบการเชื่อมต่อ API");

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
            
            let areaRaw = row["พื้นที่เป้าหมายทั้งหมด"];
            if (!areaRaw || areaRaw === "-" || String(areaRaw).trim() === "") areaRaw = row["⚙️ ขอบเขตพื้นที่ (Auto)"];
            if (!areaRaw || areaRaw === "-" || String(areaRaw).trim() === "") areaRaw = row["อำเภอที่ตั้ง (หลัก)"];
            if (!areaRaw || String(areaRaw).trim() === "") areaRaw = "ไม่ระบุ";
            
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

        if(yearBox) {
            sortedYears.forEach(y => {
                let isChecked = (y === maxYear) ? 'checked' : '';
                yearBox.innerHTML += `<li><label style="cursor:pointer;"><input type="checkbox" class="year-cb" value="${y}" ${isChecked} onchange="handleYearChange()"> ปีงบประมาณ ${y}</label></li>`;
            });
        }
        
        let checkAll = document.getElementById('checkAllYears');
        if(checkAll) checkAll.checked = false;

        filteredData = [...masterData];
        applyFilters(); 

    } catch (error) {
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + error.message);
    }
}

function toggleAllYears(sourceCb) {
    let cbs = document.querySelectorAll('.year-cb');
    cbs.forEach(cb => cb.checked = sourceCb.checked);
    applyFilters();
}

function handleYearChange() {
    let allChecked = document.querySelectorAll('.year-cb:checked').length === document.querySelectorAll('.year-cb').length;
    let checkAll = document.getElementById('checkAllYears');
    if(checkAll) checkAll.checked = allChecked;
    applyFilters();
}

function applyFilters() {
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => String(cb.value)); 
    
    const btnResetMap = document.getElementById('btnResetMap');
    if (btnResetMap) {
        if (mapFilterDistrict !== "all") btnResetMap.style.display = "block";
        else btnResetMap.style.display = "none";
    }

    const getValSafe = (id) => { let el = document.getElementById(id); return el ? el.value : "all"; };
    const fNat = getValSafe('filterNat');
    const fMaster = getValSafe('filterMaster');
    const fPlan13 = getValSafe('filterPlan13');
    const fNorth = getValSafe('filterNorth');
    const fProv = getValSafe('filterProv');

    filteredData = masterData.filter(row => {
        let getVal = (key) => {
            if(row[key] !== undefined) return String(row[key]);
            let shortKey = key.split(" ")[0];
            if(key.includes("ฉบับที่ 13")) shortKey = "ฉบับที่ 13";
            let f = Object.keys(row).find(k => k.includes(shortKey));
            return f ? String(row[f]) : "";
        };

        const colNat = getVal("ยุทธศาสตร์ชาติ 20 ปี");
        const colMaster = getVal("แผนแม่บทภายใต้ยุทธศาสตร์ชาติ");
        const colPlan13 = getVal("แผนพัฒนาฯ ฉบับที่ 13");
        const colNorth = getVal("แผนพัฒนาภาคเหนือ");
        const colProv = getVal("ประเด็นการพัฒนาจังหวัด");

        const matchYear = selectedYears.length === 0 ? false : selectedYears.includes(String(row._year));
        const matchNat = fNat === "all" || colNat.includes(fNat);
        const matchMaster = fMaster === "all" || colMaster.includes(fMaster);
        const matchPlan13 = fPlan13 === "all" || colPlan13.includes(fPlan13);
        const matchNorth = fNorth === "all" || colNorth.includes(fNorth);
        const matchProv = fProv === "all" || colProv.includes(fProv);
        const matchMapDist = mapFilterDistrict === "all" || row._cleanArea.includes(mapFilterDistrict) || row._areaType === "Provincial";

        return matchYear && matchNat && matchMaster && matchPlan13 && matchNorth && matchProv && matchMapDist;
    });

    updateDashboard(); 
}

function clearAllFilters() {
    let cbs = document.querySelectorAll('.year-cb');
    if(cbs.length > 0) {
        cbs.forEach(cb => cb.checked = false);
        cbs[0].checked = true; 
        let checkAll = document.getElementById('checkAllYears');
        if(checkAll) checkAll.checked = false;
    }
    document.querySelectorAll('select').forEach(el => el.value = "all");
    mapFilterDistrict = "all";
    applyFilters();
}

function updateDashboard() {
    const totalCount = filteredData.length;
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);
    
    safeSetText('sumProjects', totalCount.toLocaleString());
    safeSetText('sumBudget', totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2}));

    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value).sort((a,b)=>a-b);
    
    renderCharts(selectedYears);
    renderMap(selectedYears);
}

function renderCharts(selectedYears) {
    let activeYears = [];
    if (selectedYears && selectedYears.length > 0) {
        activeYears = [...selectedYears].sort((a,b)=>a-b);
    } else {
        activeYears = Array.from(new Set(masterData.map(r=>r._year))).sort((a,b)=>a-b);
    }

    // 1. Dual Axis Trend Chart (เฉพาะปีที่เลือก)
    let ctxTrend = document.getElementById('trendChart');
    if(ctxTrend) {
        let yearCounts = {};
        let yearBudgets = {};
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
        trendChart = new Chart(ctxTrend, {
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
                    y: { type: 'linear', display: true, position: 'left', title: {display:true, text:'งบประมาณ (บาท)'} },
                    y1: { type: 'linear', display: true, position: 'right', grid: {drawOnChartArea: false}, title: {display:true, text:'จำนวนโครงการ'} }
                },
                plugins: { datalabels: { display: false } } 
            }
        });
    }

    // 2. Simple Donut Chart
    let ctxDonut = document.getElementById('areaChart');
    if(ctxDonut) {
        let stratData = {};
        filteredData.forEach(row => {
            let val = row['ประเด็นการพัฒนาจังหวัด'];
            if(!val || val==="-") val = "ไม่ระบุ";
            let strats = String(val).split(",").map(s => s.trim()).filter(s => s !== "");
            strats.forEach(s => {
                if(!stratData[s]) stratData[s] = 0;
                stratData[s] += (currentMode === 'budget' ? row._budgetNum : 1);
            });
        });

        let labels = Object.keys(stratData);
        let data = Object.values(stratData);
        let dataSum = data.reduce((a, b) => a + b, 0);
        let labelsWithPct = labels.map((lbl, idx) => {
            let pct = dataSum > 0 ? ((data[idx] * 100) / dataSum).toFixed(1) : 0;
            return `${lbl} (${pct}%)`;
        });
        const pieColors = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

        if (areaChart) areaChart.destroy();
        areaChart = new Chart(ctxDonut, {
            type: 'doughnut',
            data: { labels: labelsWithPct, datasets: [{ data: data, backgroundColor: pieColors }] },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { 
                    legend: { position: 'right' },
                    tooltip: { callbacks: { label: function(ctx) { return ` ${labels[ctx.dataIndex]}: ${ctx.raw.toLocaleString()} ${currentMode==='count'?'โครงการ':'บาท'}`; } } },
                    datalabels: { color: '#fff', font: { weight: 'bold', size: 11 }, formatter: (v) => { let p = dataSum > 0 ? (v*100 / dataSum).toFixed(1) : 0; return p >= 5 ? p + "%" : ""; } }
                } 
            }
        });
    }
}

function renderMap(selectedYears) {
    if (!map) {
        let mapEl = document.getElementById('map');
        if(!mapEl) return;
        map = L.map('map', {scrollWheelZoom: false, preferCanvas: true}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    if (!selectedYears || selectedYears.length === 0) {
        selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value).sort((a,b)=>a-b);
    }
    
    let activeYears = [...selectedYears].sort((a,b)=>a-b);
    if (activeYears.length === 0) {
        if(geojsonLayer) map.removeLayer(geojsonLayer);
        return; 
    }

    let districtStats = {};
    const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];
    
    dNames.forEach(d => { districtStats[d] = { singleC: 0, singleB: 0, multiC: 0, multiB: 0, provC: 0, provB: 0 }; });

    filteredData.forEach(row => {
        if (!activeYears.includes(String(row._year))) return;

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
            
            if (currentMode === 'budget') {
                let val = s.singleB; // งบระบายสีจาก Single ล้วนๆ ป้องกันงบบวม
                color = val > 50000000 ? '#800026' : val > 10000000 ? '#BD0026' : val > 1000000 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
            } else {
                let val = s.singleC + s.multiC; // จำนวน ระบายจาก Single + Multi
                color = val > 10 ? '#800026' : val > 5 ? '#BD0026' : val > 2 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
            }
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
                        ${s.provC} โครงการ <span style="color:gray; font-size:11px;">(ผู้คนในพื้นที่ได้รับประโยชน์)</span>
                    </div>
                </div>`;
                l.bindPopup(popupHtml).openPopup();
                
                // กรองข้อมูลภาพรวมตามอำเภอที่กด
                mapFilterDistrict = dName;
                applyFilters();
            });
            l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
            l.on('mouseout', e => geojsonLayer.resetStyle(e.target));
        }
    }).addTo(map);
}

// 🌟 สั่งรันตอนโหลดเว็บ
init();
