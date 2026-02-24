// ==========================================
// 🚨 เปลี่ยน URL เป็นของคุณที่นี่
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

let masterData = [];   
let filteredData = []; 
let currentMode = 'count'; 
let myChartBar = null; 
let myChartDoughnut = null; 
let areaChart = null;
let trendChart = null;
let map = null;
let geojsonLayer = null;

let mapFilterDistrict = "all";
let mapFilterProject = "all";
let chartFilterAreaType = "all"; 
let sortAscending = false; 

// ตัวจำสถานะยุทธศาสตร์ (ค่าเริ่มต้น: แผนจังหวัด)
let currentStratFilterId = 'filterProv'; 
const stratMapping = {
    'filterNat': { key: 'ยุทธศาสตร์ชาติ 20 ปี', name: 'ยุทธศาสตร์ชาติ 20 ปี' },
    'filterMaster': { key: 'แผนแม่บทภายใต้ยุทธศาสตร์ชาติ', name: 'แผนแม่บทฯ' },
    'filterPlan13': { key: 'แผนพัฒนาฯ ฉบับที่ 13', name: 'แผนพัฒนาฯ ฉบับที่ 13' },
    'filterNorth': { key: 'แผนพัฒนาภาคเหนือ', name: 'แผนพัฒนาภาคเหนือ' },
    'filterProv': { key: 'ประเด็นการพัฒนาจังหวัด (2566-2570)', name: 'แผนพัฒนาจังหวัดเชียงใหม่' }
};

// ==========================================
// 1. สร้าง UI
// ==========================================
const checkList = document.getElementById('yearDropdown');
checkList.getElementsByClassName('anchor')[0].onclick = function(evt) {
    if (checkList.classList.contains('visible')) checkList.classList.remove('visible');
    else checkList.classList.add('visible');
}

function buildStaticSlicers() {
    const strategyLevels = {
        filterNat: ["ด้าน 1 ความมั่นคง", "ด้าน 2 การสร้างความสามารถในการแข่งขัน", "ด้าน 3 การพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์", "ด้าน 4 การสร้างโอกาสและความเสมอภาคทางสังคม", "ด้าน 5 การสร้างการเติบโตบนคุณภาพชีวิตที่เป็นมิตรกับสิ่งแวดล้อม", "ด้าน 6 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ"],
        filterMaster: ["ประเด็นที่ 1 ความมั่นคง", "ประเด็นที่ 2 การต่างประเทศ", "ประเด็นที่ 3 การเกษตร", "ประเด็นที่ 4 อุตสาหกรรมและบริการแห่งอนาคต", "ประเด็นที่ 5 การท่องเที่ยว", "ประเด็นที่ 6 พื้นที่และเมืองน่าอยู่อัจฉริยะ", "ประเด็นที่ 7 โครงสร้างพื้นฐาน ระบบโลจิสติกส์ และดิจิทัล", "ประเด็นที่ 8 ผู้ประกอบการและวิสาหกิจขนาดกลางและขนาดย่อมยุคใหม่", "ประเด็นที่ 9 เขตเศรษฐกิจพิเศษ", "ประเด็นที่ 10 การปรับเปลี่ยนค่านิยมและวัฒนธรรม", "ประเด็นที่ 11 ศักยภาพคนตลอดช่วงชีวิต", "ประเด็นที่ 12 การพัฒนาการเรียนรู้", "ประเด็นที่ 13 การเสริมสร้างให้คนไทยมีสุขภาวะที่ดี", "ประเด็นที่ 14 ศักยภาพการกีฬา", "ประเด็นที่ 15 พลังทางสังคม", "ประเด็นที่ 16 เศรษฐกิจฐานราก", "ประเด็นที่ 17 ความเสมอภาคและหลักประกันทางสังคม", "ประเด็นที่ 18 การเติบโตอย่างยั่งยืน", "ประเด็นที่ 19 การบริหารจัดการน้ำทั้งระบบ", "ประเด็นที่ 20 การบริการประชาชนและประสิทธิภาพภาครัฐ", "ประเด็นที่ 21 การต่อต้านการทุจริตและประพฤติมิชอบ", "ประเด็นที่ 22 กฎหมายและกระบวนการยุติธรรม", "ประเด็นที่ 23 การวิจัยและพัฒนานวัตกรรม"],
        filterPlan13: ["หมุดหมายที่ 1 ไทยเป็นประเทศชั้นนำด้านสินค้าเกษตรและเกษตรแปรรูปมูลค่าสูง", "หมุดหมายที่ 2 ไทยเป็นจุดหมายของการท่องเที่ยวที่เน้นคุณภาพและความยั่งยืน", "หมุดหมายที่ 3 ไทยเป็นฐานการผลิตยานยนต์ไฟฟ้าที่สำคัญของโลก", "หมุดหมายที่ 4 ไทยเป็นศูนย์กลางทางการแพทย์และสุขภาพมูลค่าสูง", "หมุดหมายที่ 5 ไทยเป็นประตูการค้าการลงทุนและยุทธศาสตร์ทางโลจิสติกส์ที่สำคัญของภูมิภาค", "หมุดหมายที่ 6 ไทยเป็นศูนย์กลางอุตสาหกรรมอิเล็กทรอนิกส์อัจฉริยะและอุตสาหกรรมดิจิทัลของอาเซียน", "หมุดหมายที่ 7 ไทยมีวิสาหกิจขนาดกลางและขนาดย่อมที่เข้มแข็ง มีศักยภาพสูง และสามารถแข่งขันได้", "หมุดหมายที่ 8 ไทยมีพื้นที่และเมืองอัจฉริยะที่น่าอยู่ ปลอดภัย เติบโตได้อย่างยั่งยืน", "หมุดหมายที่ 9 ไทยมีความยากจนข้ามรุ่นลดลง และมีความคุ้มครองทางสังคมที่เพียงพอ เหมาะสม", "หมุดหมายที่ 10 ไทยมีเศรษฐกิจหมุนเวียนและสังคมคาร์บอนต่ำ", "หมุดหมายที่ 11 ไทยสามารถลดความเสี่ยงและผลกระทบจากภัยธรรมชาติและการเปลี่ยนแปลงสภาพภูมิอากาศ", "หมุดหมายที่ 12 ไทยมีกำลังคนสมรรถนะสูง มุ่งเรียนรู้อย่างต่อเนื่อง ตอบโจทย์การพัฒนาแห่งอนาคต", "หมุดหมายที่ 13 ไทยมีภาครัฐที่ทันสมัย มีประสิทธิภาพ และตอบโจทย์ประชาชน"],
        filterNorth: ["ประเด็นการพัฒนาที่ 1 การพัฒนาเศรษฐกิจท่องเที่ยวและการค้าในพื้นที่", "ประเด็นการพัฒนาที่ 2 การพัฒนาเศรษฐกิจมูลค่าสูงด้วยการส่งออกสินค้าและบริการนอกพื้นที่", "ประเด็นการพัฒนาที่ 3 การพัฒนาเศรษฐกิจเกษตรสร้างสรรค์", "ประเด็นการพัฒนาที่ 4 การพัฒนาเศรษฐกิจสิ่งแวดล้อมเพื่อลดฝุ่นควัน"],
        filterProv: ["ประเด็นการพัฒนาที่ 1 การส่งเสริมอุตสาหกรรมท่องเที่ยวเน้นคุณค่า สร้างสรรค์บนอัตลักษณ์ล้านนา และอุตสาหกรรมไมซ์", "ประเด็นการพัฒนาที่ 2 การขับเคลื่อนเกษตรเพิ่มมูลค่า และเกษตรแปรรูปมูลค่าสูง", "ประเด็นการพัฒนาที่ 3 การยกระดับการค้าการลงทุนบนฐานเศรษฐกิจสร้างสรรค์ (Creative Economy) นวัตกรรม (Innovation) และการพัฒนาอย่างยั่งยืน (SDGs)", "ประเด็นการพัฒนาที่ 4 การจัดการเชิงรุกในปัญหาฝุ่นควัน (PM 2.5) และการรักษาทรัพยากรธรรมชาติและสิ่งแวดล้อมแบบมีส่วนร่วม", "ประเด็นการพัฒนาที่ 5 การเสริมสร้างสังคมแห่งโอกาสและเป็นธรรม เมืองน่าอยู่ มีความปลอดภัย เพื่อคุณภาพชีวิตที่ดีของประชาชน"]
    };

    for (const [id, options] of Object.entries(strategyLevels)) {
        const select = document.getElementById(id);
        if(select) options.forEach(opt => select.innerHTML += `<option value="${opt}">${opt}</option>`);
    }

    document.getElementById('modeSwitch').addEventListener('change', (e) => { currentMode = e.target.checked ? 'budget' : 'count'; updateDashboard(); });
}

// ฟังก์ชัน "กรองเฉพาะด้านนี้" 
function exclusiveFilter(targetId) {
    currentStratFilterId = targetId;
    const slicerIds = ['filterNat', 'filterMaster', 'filterPlan13', 'filterNorth', 'filterProv'];
    slicerIds.forEach(id => {
        if (id !== targetId) document.getElementById(id).value = "all";
    });
    applyFilters();
}

function clearAreaFilter() { chartFilterAreaType = "all"; applyFilters(); }

// ==========================================
// 2. ดึงข้อมูล
// ==========================================
async function init() {
    buildStaticSlicers(); 

    try {
        const response = await fetch(API_URL);
        masterData = await response.json();
        if (!Array.isArray(masterData)) throw new Error("ข้อมูลขัดข้อง กรุณาเช็ค API");

        const years = new Set();
        masterData.forEach(row => {
            let budgetRaw = row["งบประมาณ (ตัวเลข)"] || row["งบประมาณ"] || "0";
            row._budgetNum = parseFloat(String(budgetRaw).replace(/,/g, '')) || 0;
            
            row._year = String(row["ปีงบประมาณ"] || "ไม่ระบุ").trim();
            if(row._year !== "ไม่ระบุ" && row._year !== "") years.add(row._year);
            
            let areaRaw = row["พื้นที่เป้าหมายทั้งหมด"];
            if (!areaRaw || areaRaw === "-" || String(areaRaw).trim() === "") areaRaw = row["⚙️ ขอบเขตพื้นที่ (Auto)"];
            if (!areaRaw || areaRaw === "-" || String(areaRaw).trim() === "") areaRaw = row["อำเภอที่ตั้ง (หลัก)"];
            if (!areaRaw || String(areaRaw).trim() === "") areaRaw = "ไม่ระบุ";
            
            let cleanedArea = String(areaRaw).replace(/จังหวัดเชียงใหม่/g, "").replace(/\s+/g, " ").trim();
            if(cleanedArea.endsWith(",")) cleanedArea = cleanedArea.slice(0, -1);
            row._cleanArea = cleanedArea || "ไม่ระบุ";
            
            if (row._cleanArea.includes("ครอบคลุมทั้งจังหวัด") || row._cleanArea === "ทั้งจังหวัด") { row._areaType = "Provincial"; row._areaList = ["ครอบคลุมทั้งจังหวัด"]; }
            else if (row._cleanArea.includes(",")) { row._areaType = "Multi"; row._areaList = row._cleanArea.split(",").map(a => a.trim()).filter(a => a !== ""); }
            else if (row._cleanArea === "ไม่ระบุ" || row._cleanArea === "-") { row._areaType = "ไม่ระบุ"; row._areaList = ["ไม่ระบุข้อมูลพื้นที่"]; }
            else { row._areaType = "Single"; row._areaList = [row._cleanArea]; }
        });

        const yearBox = document.getElementById('yearCheckboxes');
        [...years].sort().forEach(y => {
            yearBox.innerHTML += `<li><input type="checkbox" class="year-cb" value="${y}" checked onchange="handleYearChange()"> <span>ปีงบประมาณ ${y}</span></li>`;
        });

        filteredData = [...masterData];
        applyFilters(); 

    } catch (error) {
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="color:red; text-align:center; padding: 30px;"><b>❌ โหลดข้อมูลล้มเหลว</b><br>${error.message}</td></tr>`;
    }
}

function toggleAllYears(sourceCb) {
    let cbs = document.querySelectorAll('.year-cb');
    cbs.forEach(cb => cb.checked = sourceCb.checked);
    applyFilters();
}

function handleYearChange() {
    let allChecked = document.querySelectorAll('.year-cb:checked').length === document.querySelectorAll('.year-cb').length;
    document.getElementById('checkAllYears').checked = allChecked;
    applyFilters();
}

// ==========================================
// 3. ระบบกรอง 
// ==========================================
function applyFilters() {
    const searchTxt = document.getElementById('globalSearch').value.toLowerCase();
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value);
    
    const fNat = document.getElementById('filterNat').value;
    const fMaster = document.getElementById('filterMaster').value;
    const fPlan13 = document.getElementById('filterPlan13').value;
    const fNorth = document.getElementById('filterNorth').value;
    const fProv = document.getElementById('filterProv').value;

    filteredData = masterData.filter(row => {
        const colNat = String(row["ยุทธศาสตร์ชาติ 20 ปี"] || "");
        const colMaster = String(row["แผนแม่บทภายใต้ยุทธศาสตร์ชาติ"] || "");
        const colPlan13 = String(row["แผนพัฒนาฯ ฉบับที่ 13"] || "");
        const colNorth = String(row["แผนพัฒนาภาคเหนือ"] || "");
        const colProv = String(row["ประเด็นการพัฒนาจังหวัด (2566-2570)"] || "");

        const rowText = Object.values(row).map(v => String(v)).join(" ").toLowerCase();
        const matchSearch = searchTxt === "" || rowText.includes(searchTxt);
        const matchYear = selectedYears.length === 0 || selectedYears.includes(row._year);
        
        const matchNat = fNat === "all" || colNat.includes(fNat);
        const matchMaster = fMaster === "all" || colMaster.includes(fMaster);
        const matchPlan13 = fPlan13 === "all" || colPlan13.includes(fPlan13);
        const matchNorth = fNorth === "all" || colNorth.includes(fNorth);
        const matchProv = fProv === "all" || colProv.includes(fProv);
        
        const matchMapDist = mapFilterDistrict === "all" || row._cleanArea.includes(mapFilterDistrict);
        const matchMapProj = mapFilterProject === "all" || String(row["ชื่อโครงการ"] || "") === mapFilterProject;
        const matchChartArea = chartFilterAreaType === "all" || row._areaType === chartFilterAreaType;

        return matchSearch && matchYear && matchNat && matchMaster && matchPlan13 && matchNorth && matchProv && matchMapDist && matchMapProj && matchChartArea;
    });

    sortData(); 
    updateDashboard();
}

function sortData() {
    filteredData.sort((a, b) => {
        let yearA = parseInt(a._year) || 0;
        let yearB = parseInt(b._year) || 0;
        return sortAscending ? yearA - yearB : yearB - yearA; 
    });
}
function toggleSort() {
    sortAscending = !sortAscending;
    document.getElementById('btnSort').innerText = sortAscending ? "⬆️ เรียงปีงบ: เก่าไปใหม่" : "⬇️ เรียงปีงบ: ใหม่ไปเก่า";
    applyFilters();
}

function clearAllFilters() {
    document.getElementById('globalSearch').value = "";
    document.getElementById('checkAllYears').checked = true;
    document.querySelectorAll('.year-cb').forEach(cb => cb.checked = true);
    document.querySelectorAll('.slicer').forEach(el => el.value = "all");
    mapFilterDistrict = "all";
    mapFilterProject = "all";
    chartFilterAreaType = "all";
    currentStratFilterId = 'filterProv'; // คืนค่าแผนจังหวัด
    applyFilters();
}

// ==========================================
// 4. อัปเดต UI 
// ==========================================
function updateDashboard() {
    document.getElementById('sumProjects').innerText = filteredData.length.toLocaleString();
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);
    document.getElementById('sumBudget').innerText = totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2});

    // อัปเดตแถบ "ทั้งจังหวัด" (Provincial Status)
    let provCount = 0; let provBudget = 0;
    filteredData.forEach(r => { if(r._areaType === "Provincial") { provCount++; provBudget += r._budgetNum; } });
    document.getElementById('provincialStatusText').innerHTML = `<span>🌟 โครงการที่ดำเนินการครอบคลุมทั้งจังหวัด: <b>${provCount}</b> โครงการ</span> <span>💰 งบประมาณ: <b>${provBudget.toLocaleString()}</b> บาท</span>`;

    // อัปเดตข้อความใต้กราฟยุทธศาสตร์
    let activeStrat = stratMapping[currentStratFilterId];
    let isDefault = (currentStratFilterId === 'filterProv' && document.getElementById('filterProv').value === "all");
    document.getElementById('strategyChartSubtitleBar').innerText = isDefault ? `(ค่าเริ่มต้น: ${activeStrat.name})` : `(กำลังแสดงผล: ${activeStrat.name})`;
    document.getElementById('strategyChartSubtitleDough').innerText = isDefault ? `(ค่าเริ่มต้น: ${activeStrat.name})` : `(กำลังแสดงผล: ${activeStrat.name})`;

    // ข้อความสถานะการกรองแบบละเอียด
    let activeTexts = [];
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value);
    if(selectedYears.length < document.querySelectorAll('.year-cb').length && selectedYears.length > 0) activeTexts.push(`ปีงบ: ${selectedYears.join(', ')}`);
    
    if(document.getElementById('filterNat').value !== "all") activeTexts.push(`ยุทธศาสตร์ชาติ: ${document.getElementById('filterNat').value.substring(0,20)}...`);
    if(document.getElementById('filterMaster').value !== "all") activeTexts.push(`แผนแม่บทฯ: ${document.getElementById('filterMaster').value.substring(0,20)}...`);
    if(document.getElementById('filterPlan13').value !== "all") activeTexts.push(`แผนฯ 13: ${document.getElementById('filterPlan13').value.substring(0,20)}...`);
    if(document.getElementById('filterNorth').value !== "all") activeTexts.push(`แผนภาคเหนือ: ${document.getElementById('filterNorth').value.substring(0,20)}...`);
    if(document.getElementById('filterProv').value !== "all") activeTexts.push(`แผนจังหวัด: ${document.getElementById('filterProv').value.substring(0,20)}...`);
    
    if(mapFilterDistrict !== "all") activeTexts.push(`อำเภอ: ${mapFilterDistrict}`);
    if(mapFilterProject !== "all") activeTexts.push(`โครงการเจาะจง`);
    if(chartFilterAreaType !== "all") activeTexts.push(`พื้นที่: ${chartFilterAreaType}`);
    if(document.getElementById('globalSearch').value !== "") activeTexts.push(`ค้นหาคำเฉพาะ`);
    
    let filterStr = activeTexts.length > 0 ? activeTexts.join(" | ") : "แสดงข้อมูลทั้งหมด (ไม่ได้เปิดการกรอง)";
    document.getElementById('activeFiltersText').innerHTML = `<strong>🔍 สถานะการกรองปัจจุบัน:</strong> <span style="color:#b45309;">${filterStr}</span>`;

    renderTable();
    renderCharts(activeStrat.key);
    setTimeout(renderMap, 300); 
}

// ==========================================
// 5. วาดกราฟ
// ==========================================
function renderCharts(activeStrategyKey) {
    let stratData = {};
    let integratedBudget = 0;
    let integratedBudgetDetails = {};

    filteredData.forEach(row => {
        let val = row[activeStrategyKey];
        // แก้บัคไม่ระบุ
        let rawProv = (val && String(val).trim() !== "" && val !== "NaN" && val !== "-") ? String(val) : "ไม่ระบุ";
        
        let strategies = rawProv.split(",").map(s => s.trim()).filter(s => s !== "");
        if (strategies.length === 0) strategies = ["ไม่ระบุ"];
        
        if (strategies.length === 1) {
            let strat = strategies[0];
            let shortName = strat.length > 35 ? strat.substring(0, 35) + "..." : strat; 
            if(!stratData[shortName]) stratData[shortName] = { singleC: 0, jointC: 0, singleB: 0 };
            stratData[shortName].singleC += 1;
            stratData[shortName].singleB += row._budgetNum;
        } else {
            integratedBudget += row._budgetNum;
            strategies.forEach(strat => {
                let shortName = strat.length > 35 ? strat.substring(0, 35) + "..." : strat;
                if(!stratData[shortName]) stratData[shortName] = { singleC: 0, jointC: 0, singleB: 0 };
                stratData[shortName].jointC += 1; 
                
                if(!integratedBudgetDetails[shortName]) integratedBudgetDetails[shortName] = 0;
                integratedBudgetDetails[shortName] += (row._budgetNum / strategies.length);
            });
        }
    });

    // 5.1 Bar Chart
    const ctxBar = document.getElementById('mainChartBar');
    if (myChartBar) myChartBar.destroy();
    
    let barLabels = [], barData1 = [], barData2 = [];
    if(currentMode === 'count') {
        barLabels = Object.keys(stratData);
        barData1 = barLabels.map(k => stratData[k].singleC);
        barData2 = barLabels.map(k => stratData[k].jointC);
    } else {
        barLabels = Object.keys(stratData);
        if(integratedBudget > 0) barLabels.push("งบบูรณาการหลายเป้าหมาย");
        
        barLabels.forEach(k => {
            if(k === "งบบูรณาการหลายเป้าหมาย") { barData1.push(0); barData2.push(integratedBudget); }
            else { barData1.push(stratData[k].singleB); barData2.push(0); }
        });
    }

    myChartBar = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: barLabels,
            datasets: [
                { label: currentMode === 'count' ? 'เฉพาะประเด็นนี้ (Single)' : 'งบเฉพาะประเด็น (Single)', data: barData1, backgroundColor: '#3b82f6' },
                { label: currentMode === 'count' ? 'บูรณาการประเด็นนี้ด้วย (Joint)' : 'งบบูรณาการหลายเป้าหมาย', data: barData2, backgroundColor: '#f59e0b' }
            ]
        },
        options: { 
            responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            if(currentMode === 'budget' && ctx.label === "งบบูรณาการหลายเป้าหมาย" && ctx.datasetIndex === 1) {
                                let lines = [`รวมงบบูรณาการ: ${integratedBudget.toLocaleString()} บาท`, `(สัดส่วนคร่าวๆ ในโครงการร่วม:)`];
                                for(let k in integratedBudgetDetails) lines.push(` - ${k}: ${integratedBudgetDetails[k].toLocaleString(undefined,{maximumFractionDigits:0})} บ.`);
                                return lines;
                            }
                            return `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} ${currentMode === 'count' ? 'โครงการ' : 'บาท'}`;
                        }
                    }
                }
            }
        }
    });

    // 5.2 Doughnut Chart
    const ctxDough = document.getElementById('mainChartDoughnut');
    if (myChartDoughnut) myChartDoughnut.destroy();
    
    let dLabels = [], dData = [];
    if(currentMode === 'count') {
        dLabels = Object.keys(stratData);
        dData = dLabels.map(k => stratData[k].singleC + stratData[k].jointC);
    } else {
        dLabels = Object.keys(stratData).filter(k => stratData[k].singleB > 0);
        dData = dLabels.map(k => stratData[k].singleB);
        if(integratedBudget > 0) { dLabels.push("งบบูรณาการหลายเป้าหมาย"); dData.push(integratedBudget); }
    }

    myChartDoughnut = new Chart(ctxDough, {
        type: 'doughnut',
        data: { labels: dLabels, datasets: [{ data: dData, backgroundColor: ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'] }] },
        options: { 
            responsive: true, maintainAspectRatio: false, plugins: { 
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            let k = ctx.label;
                            if(currentMode === 'count') {
                                return [`รวม: ${ctx.raw} โครงการ`, ` - เฉพาะประเด็น (Single): ${stratData[k].singleC}`, ` - บูรณาการ (Joint): ${stratData[k].jointC}`];
                            } else {
                                if(k === "งบบูรณาการหลายเป้าหมาย") {
                                    let lines = [`งบรวม: ${integratedBudget.toLocaleString()} บาท`];
                                    for(let d in integratedBudgetDetails) lines.push(` - ${d}: ${integratedBudgetDetails[d].toLocaleString(undefined,{maximumFractionDigits:0})} บ.`);
                                    return lines;
                                }
                                return `งบเฉพาะประเด็น: ${ctx.raw.toLocaleString()} บาท`;
                            }
                        }
                    }
                }
            } 
        }
    });

    // 5.3 Area Doughnut
    const ctxArea = document.getElementById('areaChart');
    let areaCounts = { 'Single': 0, 'Multi': 0, 'Provincial': 0, 'ไม่ระบุ': 0 };
    filteredData.forEach(row => { areaCounts[row._areaType] += (currentMode === 'budget' ? row._budgetNum : 1); });

    if (areaChart) areaChart.destroy();
    areaChart = new Chart(ctxArea, {
        type: 'doughnut',
        data: {
            labels: ['Single (เฉพาะพื้นที่)', 'Multi (หลายอำเภอ)', 'Provincial (ทั้งจังหวัด)', 'ไม่ระบุ'],
            datasets: [{ data: [areaCounts['Single'], areaCounts['Multi'], areaCounts['Provincial'], areaCounts['ไม่ระบุ']], backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#9ca3af'] }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } },
            onClick: (e, elements) => {
                if(elements.length > 0) {
                    const idx = elements[0].index;
                    chartFilterAreaType = ['Single', 'Multi', 'Provincial', 'ไม่ระบุ'][idx];
                    applyFilters();
                }
            }
        }
    });

    // 5.4 Trend Chart
    const ctxTrend = document.getElementById('trendChart');
    let yearCounts = {};
    filteredData.forEach(row => {
        if(!yearCounts[row._year]) yearCounts[row._year] = 0;
        yearCounts[row._year] += currentMode === 'budget' ? row._budgetNum : 1;
    });

    const sortedYears = Object.keys(yearCounts).sort();
    const trendData = sortedYears.map(y => yearCounts[y]);

    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: sortedYears,
            datasets: [{ type: 'bar', label: 'กราฟแท่ง', data: trendData, backgroundColor: '#cbd5e1', order: 2 }, 
                       { type: 'line', label: 'แนวโน้ม', data: trendData, borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.3, order: 1 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ==========================================
// 6. แผนที่ Leaflet
// ==========================================
function setDistrictFilter(dName) { mapFilterDistrict = dName; mapFilterProject = "all"; chartFilterAreaType = "all"; closeModal(); applyFilters(); }

function renderMap() {
    if (!map) {
        map = L.map('map', {scrollWheelZoom: false}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    let districtStats = {};
    const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];
    dNames.forEach(d => districtStats[d] = { singleC: 0, singleB: 0, multiC: 0, multiB: 0 });

    let targetDistricts = [];
    if (mapFilterProject !== "all" && filteredData.length > 0) {
        let a = filteredData[0]._cleanArea;
        if(a.includes("ครอบคลุมทั้งจังหวัด")) targetDistricts = dNames;
        else targetDistricts = dNames.filter(d => a.includes(d));
    }

    filteredData.forEach(row => {
        if(row._areaType === "Single") {
            dNames.filter(d => row._cleanArea.includes(d)).forEach(d => { districtStats[d].singleC += 1; districtStats[d].singleB += row._budgetNum; });
        } else if(row._areaType === "Multi") {
            let matched = dNames.filter(d => row._cleanArea.includes(d));
            matched.forEach(d => { districtStats[d].multiC += 1; districtStats[d].multiB += (row._budgetNum / matched.length); });
        }
    });

    fetch("districts.json").then(res => res.json()).then(geoData => {
        if(geojsonLayer) map.removeLayer(geojsonLayer);
        geojsonLayer = L.geoJSON(geoData, {
            style: function (f) {
                let dName = f.properties.amp_th || f.properties.AMP_TH || "ไม่ระบุ";
                if (mapFilterProject !== "all") {
                    if (targetDistricts.includes(dName)) return { fillColor: '#ef4444', weight: 2, opacity: 1, color: '#b91c1c', fillOpacity: 0.8 };
                    else return { fillColor: '#e5e7eb', weight: 1, opacity: 0.5, color: '#fff', fillOpacity: 0.3 };
                }
                let s = districtStats[dName] || {singleC: 0, singleB: 0};
                let val = currentMode === 'budget' ? s.singleB : s.singleC;
                let color = '#FFEDA0';
                if (currentMode === 'budget') color = val > 50000000 ? '#800026' : val > 10000000 ? '#BD0026' : val > 1000000 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                else color = val > 10 ? '#800026' : val > 5 ? '#BD0026' : val > 2 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                return { fillColor: color, weight: 1, opacity: 1, color: '#333', fillOpacity: 0.8 };
            },
            onEachFeature: function (f, l) {
                let dName = f.properties.amp_th || f.properties.AMP_TH || "ไม่ระบุ";
                let s = districtStats[dName] || {singleC: 0, singleB: 0, multiC: 0, multiB: 0};
                let popupHtml = `<div style="font-family:'Sarabun'; width: 220px;"><b style="font-size:16px; color:#1e3a8a;">📍 อำเภอ${dName}</b><hr style="margin:5px 0;"><div style="font-size:13px; line-height: 1.4;"><b style="color:#10b981;">🔹 โครงการเฉพาะพื้นที่ (Single)</b><br>จำนวน: ${s.singleC} โครงการ<br>งบ: ${s.singleB.toLocaleString()} บาท<br><hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;"><b style="color:#f59e0b;">🔸 โครงการร่วมพื้นที่ (Multi)</b><br>จำนวน: ${s.multiC} โครงการ<br>งบ: ${s.multiB.toLocaleString(undefined, {minimumFractionDigits:0})} บาท</div><button onclick="setDistrictFilter('${dName}')" style="margin-top:10px; width:100%; padding:6px; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer;">🔍 กรองข้อมูลอำเภอนี้</button></div>`;
                l.bindPopup(popupHtml);
                l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
                l.on('mouseout', e => geojsonLayer.resetStyle(e.target));
            }
        }).addTo(map);
        if(mapFilterProject !== "all" && targetDistricts.length > 0) map.fitBounds(geojsonLayer.getBounds());
    }).catch(e => console.error("รอไฟล์ districts.json"));
}

// ==========================================
// 7. ตาราง & Modal
// ==========================================
function setProjectFilter(projName) { mapFilterProject = projName; mapFilterDistrict = "all"; chartFilterAreaType = "all"; closeModal(); applyFilters(); }

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    if(filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px;">ไม่พบข้อมูลโครงการที่ตรงกับเงื่อนไข</td></tr>`; return;
    }
    filteredData.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.onclick = () => openModal(idx); 
        
        let areaHtml = `<ul class="area-list">${row._areaList.map(a => `<li>${a}</li>`).join('')}</ul>`;

        tr.innerHTML = `
            <td><strong>${row["ชื่อโครงการ"] || "-"}</strong></td>
            <td style="text-align:center;">${row._year}</td>
            <td>${areaHtml}</td>
            <td style="text-align:right; font-weight:bold; color:var(--primary);">${row._budgetNum.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

function openModal(idx) {
    const row = filteredData[idx];
    document.getElementById('modalTitle').innerText = row["ชื่อโครงการ"] || "-";
    document.getElementById('modalArea').innerHTML = row._areaList.join(", ");
    document.getElementById('modalBudget').innerText = row._budgetNum.toLocaleString();
    document.getElementById('modalYear').innerText = row._year;
    
    let aType = row._areaType;
    let aLabel = aType === 'Single' ? " (เฉพาะพื้นที่)" : aType === 'Multi' ? " (หลายพื้นที่)" : aType === 'Provincial' ? " (ทั้งจังหวัด)" : " (ไม่ได้ระบุพื้นที่)";
    document.getElementById('modalAreaType').innerText = aType + aLabel;

    const subDiv = document.getElementById('modalSubActivities');
    const rawSub = String(row["รายละเอียดย่อย"] || "");
    const cleanSub = rawSub.replace(/\r\n/g, "<br>").replace(/\n/g, "<br>").trim();
    
    subDiv.innerHTML = (!cleanSub || cleanSub === "undefined" || cleanSub === "") ? "<p style='color:gray;'>- ไม่มีข้อมูลรายละเอียด -</p>" : `<div class="sub-activity-box">${cleanSub}</div>`;
    
    document.getElementById('modalFilterBtnContainer').innerHTML = `<button class="btn-filter-project" onclick="setProjectFilter(\`${row["ชื่อโครงการ"]}\`)">📍 กดเพื่อแสดงพื้นที่ดำเนินการของโครงการนี้บนแผนที่</button>`;

    document.getElementById('projectModal').style.display = "block";
}
function closeModal() { document.getElementById('projectModal').style.display = "none"; }
window.onclick = e => { if (e.target == document.getElementById('projectModal')) closeModal(); }

init();
