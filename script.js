// ==========================================
// 🚨 เปลี่ยน URL เป็นของคุณที่นี่
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

// เปิดใช้งาน Plugin เพื่อโชว์ตัวเลข % ในโดนัท
Chart.register(ChartDataLabels);

let masterData = [];   
let filteredData = []; 
let currentMode = 'count'; 
let myChart = null; 
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
    'filterNat': { key: 'ยุทธศาสตร์ชาติ 20 ปี', name: 'ยุทธศาสตร์ชาติ (6 ด้าน)' },
    'filterMaster': { key: 'แผนแม่บทภายใต้ยุทธศาสตร์ชาติ', name: 'แผนแม่บทฯ (23 ประเด็น)' },
    'filterPlan13': { key: 'แผนพัฒนาฯ ฉบับที่ 13', name: 'แผนพัฒนาฯ ฉบับที่ 13 (13 หมุดหมาย)' },
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

// *** ระบบ Exclusive Filter: กดปุ๊บ ล้างอันอื่น แล้วตั้งอันนี้เป็นแกนหลัก ***
function exclusiveFilter(targetId) {
    currentStratFilterId = targetId; 
    const slicerIds = ['filterNat', 'filterMaster', 'filterPlan13', 'filterNorth', 'filterProv'];
    slicerIds.forEach(id => {
        if (id !== targetId) document.getElementById(id).value = "all";
    });
    // แม้จะกดปุ่ม แต่เรายังไม่ได้เลือกตัวเลือกย่อย ระบบจะถือว่า "ดูภาพรวมของแผนนั้นๆ"
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
        const rawData = await response.json();
        if (!Array.isArray(rawData)) throw new Error("ข้อมูลขัดข้อง กรุณาเช็ค API");

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
            
            if (row._cleanArea.includes("ครอบคลุมทั้งจังหวัด") || row._cleanArea === "ทั้งจังหวัด") { row._areaType = "Provincial"; row._areaList = ["ครอบคลุมทั้งจังหวัด"]; }
            else if (row._cleanArea.includes(",")) { row._areaType = "Multi"; row._areaList = row._cleanArea.split(",").map(a => a.trim()).filter(a => a !== ""); }
            else if (row._cleanArea === "ไม่ระบุ" || row._cleanArea === "-") { row._areaType = "ไม่ระบุ"; row._areaList = ["ไม่ระบุข้อมูลพื้นที่"]; }
            else { row._areaType = "Single"; row._areaList = [row._cleanArea]; }
            
            return row;
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
    
    // ตรวจสอบว่า Dropdown ไหนถูกเลือกอยู่ ก็อัปเดต currentStratFilterId ให้ตรง
    const slicerIds = ['filterNat', 'filterMaster', 'filterPlan13', 'filterNorth', 'filterProv'];
    slicerIds.forEach(id => {
        if(document.getElementById(id).value !== "all") currentStratFilterId = id;
    });

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
    currentStratFilterId = 'filterProv'; 
    applyFilters();
}

// ==========================================
// 4. อัปเดต UI (แสดงผลเชื่อมโยงกันทั้งหมด)
// ==========================================
function updateDashboard() {
    document.getElementById('sumProjects').innerText = filteredData.length.toLocaleString();
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);
    document.getElementById('sumBudget').innerText = totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2});

    // แถบ Provincial
    let provCount = 0; let provBudget = 0;
    filteredData.forEach(r => { if(r._areaType === "Provincial") { provCount++; provBudget += r._budgetNum; } });
    document.getElementById('provincialStatusText').innerHTML = `<span>🌟 โครงการที่ดำเนินการครอบคลุมทั้งจังหวัด: <b>${provCount}</b> โครงการ</span> <span>💰 งบประมาณ: <b>${provBudget.toLocaleString()}</b> บาท</span>`;

    // อัปเดตหัวข้อกราฟยุทธศาสตร์ตาม currentStratFilterId
    let activeStrat = stratMapping[currentStratFilterId];
    let selectedValue = document.getElementById(currentStratFilterId).value;
    
    // ตั้งชื่อกราฟ
    document.getElementById('strategyChartSubtitle').innerText = `(กำลังแสดงผล: ${activeStrat.name})`;

    // ข้อความสถานะการกรองแบบละเอียด
    let activeTexts = [];
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value);
    if(selectedYears.length < document.querySelectorAll('.year-cb').length && selectedYears.length > 0) activeTexts.push(`ปีงบ: ${selectedYears.join(', ')}`);
    
    // ส่วนแสดงผลสถานะยุทธศาสตร์หลัก
    let mainStratStatus = `<span style="color:#1e3a8a;">โฟกัส: <b>${activeStrat.name}</b></span>`;
    if(selectedValue !== "all") {
        mainStratStatus += ` ➡️ <span style="color:#b45309;">${selectedValue.substring(0,30)}...</span>`;
    } else {
        mainStratStatus += ` ➡️ <span style="color:#b45309;">ดูภาพรวมทุกประเด็น</span>`;
    }

    if(mapFilterDistrict !== "all") activeTexts.push(`อำเภอ: ${mapFilterDistrict}`);
    if(mapFilterProject !== "all") activeTexts.push(`โครงการเจาะจง`);
    if(chartFilterAreaType !== "all") activeTexts.push(`พื้นที่: ${chartFilterAreaType}`);
    if(document.getElementById('globalSearch').value !== "") activeTexts.push(`ค้นหาคำเฉพาะ`);
    
    let filterStr = activeTexts.length > 0 ? " | " + activeTexts.join(" | ") : "";
    document.getElementById('activeFiltersText').innerHTML = `<strong>🔍 สถานะ:</strong> ${mainStratStatus} ${filterStr}`;

    renderTable();
    renderCharts(activeStrat.key);
    setTimeout(renderMap, 300); 
}

// ==========================================
// 5. วาดกราฟ (DataLabels %)
// ==========================================
function renderCharts(activeStrategyKey) {
    let stratData = {};
    let integratedBudget = 0;
    
    filteredData.forEach(row => {
        let val = row[activeStrategyKey];
        let rawProv = (val && String(val).trim() !== "" && val !== "NaN" && val !== "-") ? String(val) : "ไม่ระบุ";
        let strategies = rawProv.split(",").map(s => s.trim()).filter(s => s !== "");
        if (strategies.length === 0) strategies = ["ไม่ระบุ"];
        
        let isSingle = strategies.length === 1;
        
        strategies.forEach(strat => {
            let shortName = strat.length > 30 ? strat.substring(0, 30) + "..." : strat;
            if(!stratData[shortName]) stratData[shortName] = { singleC: 0, jointC: 0, singleB: 0, jointB: 0 };
            
            if(isSingle) {
                stratData[shortName].singleC += 1;
                stratData[shortName].singleB += row._budgetNum;
            } else {
                stratData[shortName].jointC += 1;
            }
        });
        if(!isSingle) integratedBudget += row._budgetNum; 
    });

    const ctxMain = document.getElementById('mainChart');
    if (myChart) myChart.destroy();
    
    let chartType = document.getElementById('chartTypeSelect').value;
    
    let sortedKeys = Object.keys(stratData).sort((a,b) => {
        let valA = currentMode === 'count' ? (stratData[a].singleC + stratData[a].jointC) : stratData[a].singleB;
        let valB = currentMode === 'count' ? (stratData[b].singleC + stratData[b].jointC) : stratData[b].singleB;
        return valB - valA; 
    });

    let labels = sortedKeys;
    
    if (chartType === 'bar') {
        let dataSingle = [], dataJoint = [];
        labels.forEach(k => {
            if(currentMode === 'count') {
                dataSingle.push(stratData[k].singleC);
                dataJoint.push(stratData[k].jointC);
            } else {
                dataSingle.push(stratData[k].singleB);
                dataJoint.push(0); 
            }
        });
        
        if (currentMode === 'budget' && integratedBudget > 0) {
            labels.push("งบบูรณาการหลายเป้าหมาย");
            dataSingle.push(0);
            dataJoint.push(integratedBudget);
        }

        myChart = new Chart(ctxMain, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: currentMode==='count' ? 'ตรงเป้า (Single)' : 'งบตรงเป้า (Single)', data: dataSingle, backgroundColor: '#3b82f6' },
                    { label: currentMode==='count' ? 'ร่วมเป้า (Joint)' : 'บูรณาการ (ไม่นำมาบวกทบ)', data: dataJoint, backgroundColor: '#f59e0b' }
                ]
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                scales: { x: { stacked: true }, y: { stacked: true } },
                plugins: { 
                    datalabels: { display: false } // ปิด % ในกราฟแท่ง (มันรก)
                }
            }
        });
    } else {
        // Doughnut (ใส่ %)
        let data = [];
        labels.forEach(k => {
            if(currentMode === 'count') data.push(stratData[k].singleC + stratData[k].jointC);
            else data.push(stratData[k].singleB);
        });
        if (currentMode === 'budget' && integratedBudget > 0) {
            labels.push("งบบูรณาการหลายเป้าหมาย");
            data.push(integratedBudget);
        }
        
        myChart = new Chart(ctxMain, {
            type: 'doughnut',
            data: { labels: labels, datasets: [{ data: data, backgroundColor: ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'] }] },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { 
                    legend: { position: 'right' },
                    datalabels: {
                        color: '#fff',
                        font: { weight: 'bold', size: 11 },
                        formatter: (value, ctx) => {
                            let sum = 0;
                            let dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map(data => { sum += data; });
                            let percentage = (value*100 / sum).toFixed(1)+"%";
                            return percentage === "0.0%" ? "" : percentage;
                        }
                    }
                } 
            }
        });
    }

    // Area Donut Chart (ใส่ %)
    const ctxArea = document.getElementById('areaChart');
    let areaCounts = { 'Single': 0, 'Multi': 0, 'Provincial': 0, 'ไม่ระบุ': 0 };
    filteredData.forEach(row => { areaCounts[row._areaType] += (currentMode === 'budget' ? row._budgetNum : 1); });
    
    let aLabels = ['Single (พื้นที่เดียว)', 'Multi (หลายพื้นที่)', 'Provincial (ทั้งจังหวัด)'];
    let aData = [areaCounts['Single'], areaCounts['Multi'], areaCounts['Provincial']];
    let aColors = ['#10b981', '#f59e0b', '#ef4444'];
    if(areaCounts['ไม่ระบุ'] > 0) { aLabels.push('ไม่ระบุ'); aData.push(areaCounts['ไม่ระบุ']); aColors.push('#9ca3af'); }

    if (areaChart) areaChart.destroy();
    areaChart = new Chart(ctxArea, {
        type: 'doughnut',
        data: { labels: aLabels, datasets: [{ data: aData, backgroundColor: aColors }] },
        options: { 
            responsive: true, maintainAspectRatio: false, plugins: { 
                legend: { position: 'bottom' },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => { sum += data; });
                        return (value*100 / sum).toFixed(1)+"%";
                    }
                }
            },
            onClick: (e, elements) => {
                if(elements.length > 0) {
                    let idx = elements[0].index;
                    chartFilterAreaType = aLabels[idx].split(" ")[0]; 
                    applyFilters();
                }
            }
        }
    });

    // Trend Chart
    const ctxTrend = document.getElementById('trendChart');
    let yearCounts = {};
    filteredData.forEach(row => {
        if(!yearCounts[row._year]) yearCounts[row._year] = 0;
        yearCounts[row._year] += currentMode === 'budget' ? row._budgetNum : 1;
    });
    let sortedYears = Object.keys(yearCounts).sort();
    let trendData = sortedYears.map(y => yearCounts[y]);

    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: sortedYears,
            datasets: [{ type: 'bar', label: 'ปริมาณ', data: trendData, backgroundColor: '#cbd5e1', order: 2 }, 
                       { type: 'line', label: 'แนวโน้ม', data: trendData, borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.3, order: 1 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false } } }
    });
}

// ==========================================
// 6. แผนที่ Leaflet (มี 2 โหมด)
// ==========================================
function setDistrictFilter(dName) { mapFilterDistrict = dName; mapFilterProject = "all"; chartFilterAreaType = "all"; closeModal(); applyFilters(); }

function renderMap() {
    let mapMode = document.getElementById('mapModeSelect').value;

    if (!map) {
        map = L.map('map', {scrollWheelZoom: false}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    let districtStats = {};
    const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];
    
    dNames.forEach(d => districtStats[d] = { 
        singleC: 0, singleB: 0, multiC: 0, multiB: 0, provC: 0, 
        totalProjects: 0, stratCounts: {}, matrix: { single_single: 0, single_joint: 0, multi_single: 0, multi_joint: 0 } 
    });

    let targetDistricts = [];
    if (mapFilterProject !== "all" && filteredData.length > 0) {
        let a = filteredData[0]._cleanArea;
        if(a.includes("ครอบคลุมทั้งจังหวัด")) targetDistricts = dNames;
        else targetDistricts = dNames.filter(d => a.includes(d));
    }

    let activeStratKey = stratMapping[currentStratFilterId].key;
    let selectedStratValue = document.getElementById(currentStratFilterId).value;
    let isSpecificStrat = selectedStratValue !== "all";

    filteredData.forEach(row => {
        let areaType = row._areaType; 
        
        let rawStrat = String(row[activeStratKey] || "ไม่ระบุ");
        let strats = rawStrat.split(",").map(s => s.trim()).filter(s => s !== "");
        if(strats.length === 0) strats = ["ไม่ระบุ"];
        let isSingleStrat = strats.length === 1;

        if (areaType === "Single" || areaType === "Multi") {
            let matchedDistricts = dNames.filter(d => row._cleanArea.includes(d));
            matchedDistricts.forEach(d => {
                // Mode 1: เก็บข้อมูลทั่วไป
                if (areaType === "Single") { districtStats[d].singleC += 1; districtStats[d].singleB += row._budgetNum; }
                if (areaType === "Multi") { districtStats[d].multiC += 1; districtStats[d].multiB += (row._budgetNum / matchedDistricts.length); }

                // Mode 2: เก็บข้อมูลยุทธศาสตร์ (Matrix 4D)
                districtStats[d].totalProjects += 1;
                strats.forEach(s => {
                    let shortS = s.substring(0, 30);
                    districtStats[d].stratCounts[shortS] = (districtStats[d].stratCounts[shortS] || 0) + 1;
                });

                if (isSpecificStrat) {
                    if (areaType === "Single" && isSingleStrat) districtStats[d].matrix.single_single++;
                    else if (areaType === "Single" && !isSingleStrat) districtStats[d].matrix.single_joint++;
                    else if (areaType === "Multi" && isSingleStrat) districtStats[d].matrix.multi_single++;
                    else if (areaType === "Multi" && !isSingleStrat) districtStats[d].matrix.multi_joint++;
                }
            });
        } else if (areaType === "Provincial") {
            dNames.forEach(d => { districtStats[d].provC += 1; });
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
                
                let s = districtStats[dName] || {singleC: 0, singleB: 0, totalProjects: 0};
                let color = '#FFEDA0';
                
                if (mapMode === 'overview') {
                    let val = currentMode === 'budget' ? s.singleB : s.singleC;
                    if (currentMode === 'budget') color = val > 50000000 ? '#800026' : val > 10000000 ? '#BD0026' : val > 1000000 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                    else color = val > 10 ? '#800026' : val > 5 ? '#BD0026' : val > 2 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                } else {
                    // Mode 2: ความเข้มข้นยุทธศาสตร์ (ไม่นับเงิน)
                    let val = s.totalProjects; 
                    if (val > 15) color = '#800026';
                    else if (val > 8) color = '#BD0026';
                    else if (val > 3) color = '#E31A1C';
                    else if (val > 0) color = '#FC4E2A';
                }
                return { fillColor: color, weight: 1, opacity: 1, color: '#333', fillOpacity: 0.8 };
            },
            onEachFeature: function (f, l) {
                let dName = f.properties.amp_th || f.properties.AMP_TH || "ไม่ระบุ";
                let s = districtStats[dName] || {singleC: 0, singleB: 0, multiC: 0, multiB: 0, provC: 0, totalProjects: 0, stratCounts: {}, matrix: {}};
                
                let popupHtml = `<div style="font-family:'Sarabun'; width: 240px;"><b style="font-size:16px; color:#1e3a8a;">📍 อำเภอ${dName}</b><hr style="margin:5px 0;">`;
                
                if (mapMode === 'overview') {
                    // Popup Mode 1: ฐานเค้ก 3 ชั้น
                    popupHtml += `
                        <div style="font-size:13px; line-height: 1.4;">
                            <b style="color:#10b981;">🎯 เฉพาะพื้นที่ (Single Area)</b><br>
                            จำนวน: ${s.singleC} โครงการ<br>งบ: ${s.singleB.toLocaleString()} บาท<br>
                            <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                            <b style="color:#f59e0b;">📦 ร่วมพื้นที่ (Multi Area)</b><br>
                            จำนวน: ${s.multiC} โครงการ<br>งบเฉลี่ย: ${s.multiB.toLocaleString(undefined, {minimumFractionDigits:0})} บาท<br>
                            <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                            <b style="color:#ef4444;">🌐 ระดับจังหวัด (Provincial)</b><br>
                            จำนวนอานิสงส์: ${s.provC} โครงการ
                        </div>
                    `;
                } else {
                    // Popup Mode 2: 4D Matrix (ตัดเรื่องเงินออก 100%)
                    if (isSpecificStrat) {
                        popupHtml += `
                            <div style="font-size:13px; line-height: 1.4;">
                                <b>รวมตอบโจทย์ด้านนี้: <span style="color:#ef4444">${s.totalProjects}</span> โครงการ</b><br>
                                <span style="color:#666; font-size:11px;">(แยกตามลักษณะการลงพื้นที่ 4 มิติ)</span><br><br>
                                <b style="color:#10b981;">1. เจาะจงพื้นที่และประเด็นนี้:</b> ${s.matrix.single_single}<br>
                                <b style="color:#f59e0b;">2. รุมพัฒนาพื้นที่ (บูรณาการ):</b> ${s.matrix.single_joint}<br>
                                <b style="color:#3b82f6;">3. ปูพรมเฉพาะเรื่อง (หลายพื้นที่):</b> ${s.matrix.multi_single}<br>
                                <b style="color:#8b5cf6;">4. บูรณาการร่วม (หลายพื้นที่+ประเด็น):</b> ${s.matrix.multi_joint}
                            </div>
                        `;
                    } else {
                        // Overview Top 3 Strategies
                        let sortedStrats = Object.entries(s.stratCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
                        let top3Html = sortedStrats.map((st, i) => `${i+1}. ${st[0]} (${st[1]})`).join('<br>');
                        popupHtml += `
                            <div style="font-size:13px; line-height: 1.4;">
                                <b>รวมโครงการในพื้นที่: <span style="color:#ef4444">${s.totalProjects}</span> โครงการ</b><br>
                                <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                                <b style="color:#1e3a8a;">🧬 Top 3 ประเด็นที่ลงพื้นที่นี้:</b><br>
                                ${top3Html || '<span style="color:gray">- ไม่มีข้อมูล -</span>'}
                            </div>
                        `;
                    }
                }
                
                popupHtml += `<button onclick="setDistrictFilter('${dName}')" style="margin-top:10px; width:100%; padding:6px; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer;">🔍 กรองข้อมูลอำเภอนี้</button></div>`;
                
                l.bindPopup(popupHtml);
                l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
                l.on('mouseout', e => geojsonLayer.resetStyle(e.target));
            }
        }).addTo(map);
        if(mapFilterProject !== "all" && targetDistricts.length > 0) map.fitBounds(geojsonLayer.getBounds());
    }).catch(e => console.error("รอไฟล์ districts.json"));
}

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
        tr.innerHTML = `<td><strong>${row["ชื่อโครงการ"] || "-"}</strong></td><td style="text-align:center;">${row._year}</td><td>${areaHtml}</td><td style="text-align:right; font-weight:bold; color:var(--primary);">${row._budgetNum.toLocaleString()}</td>`;
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
    subDiv.innerHTML = (!cleanSub || cleanSub === "undefined" || cleanSub === "NaN") ? "<p style='color:gray;'>- ไม่มีข้อมูลรายละเอียด -</p>" : `<div class="sub-activity-box">${cleanSub}</div>`;
    
    document.getElementById('modalFilterBtnContainer').innerHTML = `<button class="btn-filter-project" onclick="setProjectFilter(\`${row["ชื่อโครงการ"]}\`)">📍 กดเพื่อแสดงพื้นที่ดำเนินการของโครงการนี้บนแผนที่</button>`;
    document.getElementById('projectModal').style.display = "block";
}
function closeModal() { document.getElementById('projectModal').style.display = "none"; }
window.onclick = e => { if (e.target == document.getElementById('projectModal')) closeModal(); }

init();
