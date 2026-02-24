// ==========================================
// 🚨 เปลี่ยน URL เป็นของคุณที่นี่
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

Chart.register(ChartDataLabels);

let masterData = [];   
let filteredData = []; 
let tableData = [];    
let currentMode = 'count'; 
let myChart = null; 
let areaChart = null;
let trendChart = null;
let map = null;
let geojsonLayer = null;

let mapFilterDistrict = "all";
let mapFilterProject = "all";
let chartFilterAreaType = "all"; 

let currentPage = 1;
const rowsPerPage = 20;

// 🎯 ตัวแปร Sorting แยกอิสระ 2 ตัว
let isYearDesc = true;   // Default: ปีใหม่ -> เก่า
let isBudgetDesc = true; // Default: งบมาก -> น้อย

let currentStratFilterId = 'filterProv'; 
const stratMapping = {
    'filterNat': { key: 'ยุทธศาสตร์ชาติ 20 ปี', name: 'ยุทธศาสตร์ชาติ 20 ปี' },
    'filterMaster': { key: 'แผนแม่บทภายใต้ยุทธศาสตร์ชาติ', name: 'แผนแม่บทภายใต้ยุทธศาสตร์ชาติ' },
    'filterPlan13': { key: 'แผนพัฒนาฯ ฉบับที่ 13', name: 'แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ ฉบับที่ 13' },
    'filterNorth': { key: 'แผนพัฒนาภาคเหนือ', name: 'แผนพัฒนาภาคเหนือ' },
    'filterProv': { key: 'ประเด็นการพัฒนาจังหวัด (2566-2570)', name: 'แผนพัฒนาจังหวัดเชียงใหม่ (พ.ศ. 2566-2570)' }
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

function exclusiveFilter(targetId) {
    currentStratFilterId = targetId; 
    const slicerIds = ['filterNat', 'filterMaster', 'filterPlan13', 'filterNorth', 'filterProv'];
    slicerIds.forEach(id => { document.getElementById(id).value = "all"; });
    applyFilters();
}

function clearAreaFilter() { chartFilterAreaType = "all"; applyFilters(); }

function toggleProvincialTable() {
    const dd = document.getElementById('provincialDropdown');
    const bar = document.getElementById('provincialStatusBar');
    if (dd.style.display === 'none' || dd.style.display === '') {
        dd.style.display = 'block';
        bar.classList.add('open');
    } else {
        dd.style.display = 'none';
        bar.classList.remove('open');
    }
}

// ==========================================
// 2. ดึงข้อมูล 
// ==========================================
async function init() {
    buildStaticSlicers(); 

    try {
        const response = await fetch(API_URL);
        const rawData = await response.json();
        if (!Array.isArray(rawData)) throw new Error("ข้อมูลขัดข้อง กรุณาตรวจสอบการเชื่อมต่อ API");

        const years = new Set();
        masterData = rawData.filter(row => row["ชื่อโครงการ"] && String(row["ชื่อโครงการ"]).trim() !== "").map(row => {
            let budgetRaw = row["งบประมาณ (ตัวเลข)"] || row["งบประมาณ"] || "0";
            row._budgetNum = parseFloat(String(budgetRaw).replace(/,/g, '')) || 0;
            row._budgetText = row["⚙️ งบประมาณ (คำอ่าน)"] || "";
            
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
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="color:red; text-align:center; padding: 30px;"><b>❌ เกิดข้อผิดพลาดในการโหลดข้อมูล</b><br>${error.message}</td></tr>`;
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

function resetPageAndFilter() {
    currentPage = 1;
    applyFilters();
}

// ==========================================
// 3. ระบบกรอง (Global Filter)
// ==========================================
function applyFilters() {
    const searchTxt = document.getElementById('globalSearch').value.toLowerCase(); 
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value);
    
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

        const rowText = Object.values(row).map(v => String(v)).join(" ").toLowerCase();
        const matchSearch = searchTxt === "" || rowText.includes(searchTxt);
        const matchYear = selectedYears.length === 0 || selectedYears.includes(row._year);
        
        const matchNat = fNat === "all" || colNat.includes(fNat);
        const matchMaster = fMaster === "all" || colMaster.includes(fMaster);
        const matchPlan13 = fPlan13 === "all" || colPlan13.includes(fPlan13);
        const matchNorth = fNorth === "all" || colNorth.includes(fNorth);
        const matchProv = fProv === "all" || colProv.includes(fProv);
        
        const matchMapDist = mapFilterDistrict === "all" || row._cleanArea.includes(mapFilterDistrict) || row._areaType === "Provincial";
        const matchMapProj = mapFilterProject === "all" || String(row["ชื่อโครงการ"] || "") === mapFilterProject;
        const matchChartArea = chartFilterAreaType === "all" || row._areaType === chartFilterAreaType;

        return matchSearch && matchYear && matchNat && matchMaster && matchPlan13 && matchNorth && matchProv && matchMapDist && matchMapProj && matchChartArea;
    });

    updateDashboard(); 
    renderTable();    
}

function clearAllFilters() {
    document.getElementById('globalSearch').value = "";
    document.getElementById('tableSearch').value = ""; 
    document.getElementById('checkAllYears').checked = true;
    document.querySelectorAll('.year-cb').forEach(cb => cb.checked = true);
    document.querySelectorAll('.slicer').forEach(el => el.value = "all");
    mapFilterDistrict = "all";
    mapFilterProject = "all";
    chartFilterAreaType = "all";
    currentStratFilterId = 'filterProv'; 
    resetPageAndFilter();
}

// ==========================================
// 4. ระบบตาราง (Sorting อิสระ 2 ตัว, Pagination)
// ==========================================

function handleTableSearch() {
    currentPage = 1; 
    renderTable();   
}

// 🎯 ฟังก์ชัน Toggle แบบอิสระ ไม่รีเซ็ตกัน
function toggleSort(type) {
    if (type === 'year') {
        isYearDesc = !isYearDesc;
        document.getElementById('btnSortYear').innerText = `📅 ปีงบประมาณ: ${isYearDesc ? '▼ ใหม่-เก่า' : '▲ เก่า-ใหม่'}`;
    } else if (type === 'budget') {
        isBudgetDesc = !isBudgetDesc;
        document.getElementById('btnSortBudget').innerText = `💰 งบประมาณ: ${isBudgetDesc ? '▼ มาก-น้อย' : '▲ น้อย-มาก'}`;
    }
    
    // เรียก renderTable เพื่อจัดเรียงใหม่ตาม State ล่าสุด
    renderTable();
}

function changePage(dir) {
    let maxPage = Math.ceil(tableData.length / rowsPerPage);
    currentPage += dir;
    if(currentPage < 1) currentPage = 1;
    if(currentPage > maxPage) currentPage = maxPage;
    renderTable(); 
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    
    const tableSearchTxt = document.getElementById('tableSearch').value.toLowerCase();
    
    tableData = filteredData.filter(row => {
        if (tableSearchTxt === "") return true;
        return String(row["ชื่อโครงการ"] || "").toLowerCase().includes(tableSearchTxt);
    });

    // 🎯 Logic การเรียงแบบซ้อนทับ (And)
    tableData.sort((a, b) => {
        let yearA = parseInt(a._year) || 0;
        let yearB = parseInt(b._year) || 0;
        let budgetA = a._budgetNum;
        let budgetB = b._budgetNum;

        // ถ้ากรองอำเภอ -> ต้องเอาความเข้มข้นพื้นที่มาก่อน
        if (mapFilterDistrict !== "all") {
            // 1. ปีงบประมาณ (ตาม Toggle)
            if (yearA !== yearB) return isYearDesc ? yearA - yearB : yearB - yearA; 
            
            // 2. ลักษณะพื้นที่ (Fix: Single -> Multi -> Prov)
            const typeOrder = { "Single": 1, "Multi": 2, "Provincial": 3, "ไม่ระบุ": 4 };
            let typeA = typeOrder[a._areaType] || 5;
            let typeB = typeOrder[b._areaType] || 5;
            if (typeA !== typeB) return typeA - typeB;
            
            // 3. งบประมาณ (ตาม Toggle)
            return isBudgetDesc ? budgetB - budgetA : budgetA - budgetB;
        }

        // ถ้าดูภาพรวม -> เรียงปี แล้วค่อยเรียงงบในเปีนั้น
        if (yearA !== yearB) {
            return isYearDesc ? yearB - yearA : yearA - yearB;
        } else {
            return isBudgetDesc ? budgetB - budgetA : budgetA - budgetB;
        }
    });

    if(tableData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px;">ไม่พบข้อมูลโครงการที่ตรงกับเงื่อนไขการค้นหา</td></tr>`; 
        document.getElementById('pageInfo').innerText = "แสดง 0 รายการ";
        document.getElementById('btnPrevPage').disabled = true;
        document.getElementById('btnNextPage').disabled = true;
        return;
    }

    let maxPage = Math.ceil(tableData.length / rowsPerPage);
    if (maxPage === 0) maxPage = 1;
    if (currentPage > maxPage) currentPage = maxPage;
    
    let startIdx = (currentPage - 1) * rowsPerPage;
    let endIdx = startIdx + rowsPerPage;
    let paginatedRows = tableData.slice(startIdx, endIdx);

    document.getElementById('pageInfo').innerText = `แสดงรายการที่ ${startIdx + 1} - ${Math.min(endIdx, tableData.length)} จากทั้งหมด ${tableData.length} รายการ`;
    document.getElementById('btnPrevPage').disabled = (currentPage === 1);
    document.getElementById('btnNextPage').disabled = (currentPage === maxPage);

    paginatedRows.forEach((row) => {
        let originalIdx = masterData.indexOf(row);
        const tr = document.createElement('tr');
        tr.onclick = () => openModal(originalIdx); 
        let areaHtml = `<ul class="area-list">${row._areaList.map(a => `<li>${a}</li>`).join('')}</ul>`;
        
        tr.innerHTML = `
            <td><strong>${row["ชื่อโครงการ"] || "-"}</strong></td>
            <td style="text-align:center;">${row._year}</td>
            <td>${areaHtml}</td>
            <td style="text-align:right; color:var(--primary);">
                <b>${row._budgetNum.toLocaleString()}</b><br>
                <small style="color:#666;">${row._budgetText}</small>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// 5. อัปเดต UI Dashboard & Dropdown จังหวัด
// ==========================================
function updateDashboard() {
    document.getElementById('sumProjects').innerText = filteredData.length.toLocaleString();
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);
    document.getElementById('sumBudget').innerText = totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2});

    let provCount = 0; let provBudget = 0;
    filteredData.forEach(r => { if(r._areaType === "Provincial") { provCount++; provBudget += r._budgetNum; } });
    
    document.getElementById('provincialStatusContent').innerHTML = `
        <div style="font-size:14px; font-weight:normal; margin-bottom:5px;">ส่วนประมวลผลโครงการระดับจังหวัด (ดำเนินการครอบคลุมทุกอำเภอ)</div>
        <div style="display:flex; gap:20px;">
            <span>📋 จำนวนโครงการ: <b>${provCount}</b> โครงการ</span> 
            <span>💰 งบประมาณรวม: <b>${provBudget.toLocaleString()}</b> บาท</span>
        </div>`;

    let activeStrat = stratMapping[currentStratFilterId];
    let selectedValue = document.getElementById(currentStratFilterId).value;
    
    document.getElementById('strategyChartSubtitle').innerText = `(แสดงผลตามค่าเริ่มต้น: ${activeStrat.name})`;

    let mainStratStatus = `<span style="color:#1e3a8a;">ประเด็นยุทธศาสตร์ที่เลือก: <b>${activeStrat.name}</b></span>`;
    if(selectedValue !== "all") mainStratStatus += ` ➡️ <span style="color:#b45309;">${selectedValue}</span>`; 
    else mainStratStatus += ` ➡️ <span style="color:#b45309;">แสดงภาพรวมทุกประเด็น</span>`;

    let activeTexts = [];
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value);
    if(selectedYears.length < document.querySelectorAll('.year-cb').length && selectedYears.length > 0) activeTexts.push(`ปีงบประมาณ: ${selectedYears.join(', ')}`);
    const slicerIds = ['filterNat', 'filterMaster', 'filterPlan13', 'filterNorth', 'filterProv'];
    slicerIds.forEach(id => {
        if(id !== currentStratFilterId && document.getElementById(id).value !== "all") {
            activeTexts.push(`${stratMapping[id].name}: ${document.getElementById(id).value}`);
        }
    });
    if(mapFilterDistrict !== "all") activeTexts.push(`อำเภอ: ${mapFilterDistrict}`);
    if(mapFilterProject !== "all") activeTexts.push(`โครงการเจาะจง`);
    if(chartFilterAreaType !== "all") activeTexts.push(`พื้นที่: ${chartFilterAreaType}`);
    
    let filterStr = activeTexts.length > 0 ? " | " + activeTexts.join(" | ") : "";
    document.getElementById('activeFiltersText').innerHTML = `<div style="margin-bottom:6px;"><strong>🔍 สถานะการกรองข้อมูลปัจจุบัน:</strong> ${mainStratStatus}</div><div style="font-size:13px;"><strong>เงื่อนไขการกรองเพิ่มเติม:</strong> ${filterStr === "" ? "ไม่มี" : filterStr.substring(3)}</div>`;

    renderProvincialTable(activeStrat, selectedValue);
    renderCharts(activeStrat.key);
    setTimeout(renderMap, 300); 
}

// 🎯 สร้างตารางยุทธศาสตร์ระดับจังหวัดแบบ Single/Joint 분리
function renderProvincialTable(activeStrat, selectedValue) {
    let provData = filteredData.filter(r => r._areaType === "Provincial");
    let stratStats = {};
    let globalJointSet = new Set();
    let globalJointBudget = 0;

    provData.forEach((row, index) => {
        let val = row[activeStrat.key];
        if (val === undefined) {
            let searchKey = activeStrat.key.split(" ")[0]; 
            if(activeStrat.key.includes("ฉบับที่ 13")) searchKey = "ฉบับที่ 13";
            let foundKey = Object.keys(row).find(k => k.includes(searchKey));
            if (foundKey) val = row[foundKey];
        }

        let rawStrats = String(val || "ไม่ระบุข้อมูล").split(",").map(s => s.trim()).filter(s => s !== "");
        if (rawStrats.length === 0) rawStrats = ["ไม่ระบุข้อมูล"];
        
        if (selectedValue !== "all" && !rawStrats.includes(selectedValue)) return;

        let isSingle = rawStrats.length === 1;

        if (!isSingle) {
            globalJointSet.add(index);
            globalJointBudget += row._budgetNum;
        }

        rawStrats.forEach(s => {
            if (selectedValue !== "all" && s !== selectedValue) return;
            if (!stratStats[s]) stratStats[s] = { singleC: 0, jointC: 0, singleB: 0 };
            
            if (isSingle) {
                stratStats[s].singleC += 1;
                stratStats[s].singleB += row._budgetNum; 
            } else {
                stratStats[s].jointC += 1;
            }
        });
    });

    let headerHtml = `
        <span style="font-size:15px; color:#666;">ประเด็นยุทธศาสตร์ที่แสดงผล: <b style="color:#1e3a8a">${activeStrat.name}</b> 
        ➡️ <b style="color:#b45309">${selectedValue === "all" ? "แสดงภาพรวมทุกประเด็น" : selectedValue}</b></span>
    `;
    document.getElementById('provincialTableHeader').innerHTML = headerHtml;

    let tbodyHtml = '';
    let sortedKeys = Object.keys(stratStats).sort((a,b) => (stratStats[b].singleC + stratStats[b].jointC) - (stratStats[a].singleC + stratStats[a].jointC));

    if (sortedKeys.length === 0) {
        tbodyHtml = `<tr><td colspan="3" style="text-align:center; padding:15px; color:gray;">- ไม่มีข้อมูลโครงการระดับจังหวัดที่ตรงกับเงื่อนไขนี้ -</td></tr>`;
    } else {
        sortedKeys.forEach(k => {
            let jointText = stratStats[k].jointC > 0 ? `<span class="joint-stat">(+${stratStats[k].jointC})</span>` : '';
            tbodyHtml += `
                <tr style="border-bottom: 1px dashed #e2e8f0;">
                    <td style="padding:10px;">${k}</td>
                    <td style="text-align:center; padding:10px;"><b>${stratStats[k].singleC}</b> ${jointText}</td>
                    <td style="text-align:right; padding:10px; color:#059669;"><b>${stratStats[k].singleB.toLocaleString()}</b></td>
                </tr>
            `;
        });
    }
    document.getElementById('provincialTableBody').innerHTML = tbodyHtml;

    // 🎯 Footer สรุป Joint
    let footerHtml = `
        <tr class="footer-row">
            <td class="footer-label">สรุปรวมประเด็นที่ตอบสนองมากกว่า 1 เป้าหมาย</td>
            <td style="text-align:center; padding:12px;"><b>${globalJointSet.size}</b></td>
            <td style="text-align:right; padding:12px;"><b>${globalJointBudget.toLocaleString()}</b></td>
        </tr>
    `;
    document.getElementById('provincialTableFooter').innerHTML = footerHtml;
}


// ==========================================
// 5. วาดกราฟ 
// ==========================================
function renderCharts(activeStrategyKey) {
    if(!activeStrategyKey) activeStrategyKey = stratMapping[currentStratFilterId].key;
    
    let stratData = {};
    let integratedBudget = 0;
    
    filteredData.forEach(row => {
        let val = row[activeStrategyKey];
        if (val === undefined) {
            let searchKey = activeStrategyKey.split(" ")[0]; 
            if(activeStrategyKey.includes("ฉบับที่ 13")) searchKey = "ฉบับที่ 13";
            let foundKey = Object.keys(row).find(k => k.includes(searchKey));
            if (foundKey) val = row[foundKey];
        }

        let rawProv = (val && String(val).trim() !== "" && val !== "NaN" && val !== "-") ? String(val) : "ไม่ระบุข้อมูล";
        let strategies = rawProv.split(",").map(s => s.trim()).filter(s => s !== "");
        if (strategies.length === 0) strategies = ["ไม่ระบุข้อมูล"];
        
        let isSingle = strategies.length === 1;
        
        strategies.forEach(strat => {
            let fullStratName = strat; 
            if(!stratData[fullStratName]) stratData[fullStratName] = { singleC: 0, jointC: 0, singleB: 0 };
            
            if(isSingle) {
                stratData[fullStratName].singleC += 1;
                stratData[fullStratName].singleB += row._budgetNum;
            } else {
                stratData[fullStratName].jointC += 1;
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
    let displayLabels = labels.map(k => k.length > 40 ? k.substring(0, 40) + "..." : k);
    
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
            displayLabels.push("งบประมาณบูรณาการ");
            labels.push("งบประมาณบูรณาการ");
            dataSingle.push(0);
            dataJoint.push(integratedBudget);
        }

        myChart = new Chart(ctxMain, {
            type: 'bar',
            data: {
                labels: displayLabels,
                datasets: [
                    { label: currentMode==='count' ? 'เฉพาะประเด็นเดียว (Single)' : 'งบประมาณ (เฉพาะประเด็นเดียว)', data: dataSingle, backgroundColor: '#3b82f6' },
                    { label: currentMode==='count' ? 'หลายประเด็น (Joint)' : 'งบประมาณ (หลายประเด็น)', data: dataJoint, backgroundColor: '#f59e0b' }
                ]
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                scales: { x: { stacked: true }, y: { stacked: true } },
                plugins: { 
                    tooltip: { 
                        mode: 'index', intersect: false,
                        callbacks: { title: function(ctx) { return labels[ctx[0].dataIndex]; } }
                    }, 
                    datalabels: { display: false } 
                }
            }
        });
    } else {
        let data = [];
        labels.forEach(k => {
            if(currentMode === 'count') data.push(stratData[k].singleC + stratData[k].jointC);
            else data.push(stratData[k].singleB);
        });
        if (currentMode === 'budget' && integratedBudget > 0) {
            displayLabels.push("งบประมาณบูรณาการ");
            labels.push("งบประมาณบูรณาการ");
            data.push(integratedBudget);
        }

        let dataSum = data.reduce((a, b) => a + b, 0);
        let labelsWithPct = displayLabels.map((lbl, idx) => {
            let pct = dataSum > 0 ? ((data[idx] * 100) / dataSum).toFixed(1) : 0;
            return `${lbl} (${pct}%)`;
        });
        
        myChart = new Chart(ctxMain, {
            type: 'doughnut',
            data: { labels: labelsWithPct, datasets: [{ data: data, backgroundColor: ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'] }] },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { 
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                let pct = dataSum > 0 ? ((ctx.raw * 100) / dataSum).toFixed(1) : 0;
                                let k = labels[ctx.dataIndex]; 
                                if(currentMode === 'count') {
                                    return ` ${k}: ${ctx.raw} โครงการ (${pct}%) | ประเด็นเดียว: ${stratData[k]?.singleC || 0}, หลายประเด็น: ${stratData[k]?.jointC || 0}`;
                                } else {
                                    return ` ${k}: ${ctx.raw.toLocaleString()} บาท (${pct}%)`;
                                }
                            }
                        }
                    },
                    datalabels: {
                        color: '#fff', font: { weight: 'bold', size: 11 },
                        formatter: (value, ctx) => {
                            let percentage = dataSum > 0 ? (value*100 / dataSum).toFixed(1) : 0;
                            return percentage >= 5 ? percentage + "%" : "";
                        }
                    }
                } 
            }
        });
    }

    const ctxArea = document.getElementById('areaChart');
    let areaCounts = { 'Single': 0, 'Multi': 0, 'Provincial': 0, 'ไม่ระบุ': 0 };
    filteredData.forEach(row => { areaCounts[row._areaType] += (currentMode === 'budget' ? row._budgetNum : 1); });
    
    let aLabels = ['Single (ดำเนินการเฉพาะพื้นที่)', 'Multi (ดำเนินการหลายพื้นที่)', 'Provincial (ดำเนินการครอบคลุมทั้งจังหวัด)'];
    let aData = [areaCounts['Single'], areaCounts['Multi'], areaCounts['Provincial']];
    let aColors = ['#10b981', '#f59e0b', '#ef4444'];
    if(areaCounts['ไม่ระบุ'] > 0) { aLabels.push('ไม่ระบุ'); aData.push(areaCounts['ไม่ระบุ']); aColors.push('#9ca3af'); }

    let aTotal = aData.reduce((a, b) => a + b, 0);
    let aLabelsWithPct = aLabels.map((lbl, idx) => {
        let pct = aTotal > 0 ? ((aData[idx] * 100) / aTotal).toFixed(1) : 0;
        return `${lbl} (${pct}%)`;
    });

    if (areaChart) areaChart.destroy();
    areaChart = new Chart(ctxArea, {
        type: 'doughnut',
        data: { labels: aLabelsWithPct, datasets: [{ data: aData, backgroundColor: aColors }] },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            let pct = aTotal > 0 ? ((ctx.raw * 100) / aTotal).toFixed(1) : 0;
                            let unit = currentMode === 'count' ? 'โครงการ' : 'บาท';
                            return ` ${aLabels[ctx.dataIndex]}: ${ctx.raw.toLocaleString()} ${unit} (${pct}%)`;
                        }
                    }
                },
                datalabels: { 
                    color: '#fff', font: { weight: 'bold', size: 14 },
                    formatter: (value, ctx) => {
                        let pct = aTotal > 0 ? (value*100 / aTotal).toFixed(1) : 0;
                        return pct >= 5 ? pct + "%" : "";
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
            datasets: [
                { type: 'bar', label: 'ปริมาณ', data: trendData, backgroundColor: '#cbd5e1', order: 2 }, 
                { type: 'line', label: 'แนวโน้ม', data: trendData, borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.3, order: 1 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false } } }
    });
}

// ==========================================
// 6. แผนที่ Leaflet (Heatmap เฉพาะ Single + Multi ใน Count, Single ใน Budget)
// ==========================================
function setDistrictFilter(dName) { 
    mapFilterDistrict = dName; 
    mapFilterProject = "all"; 
    chartFilterAreaType = "all"; 
    
    const slicerIds = ['filterNat', 'filterMaster', 'filterPlan13', 'filterNorth', 'filterProv'];
    slicerIds.forEach(id => document.getElementById(id).value = "all");
    currentStratFilterId = 'filterProv';
    
    closeModal(); 
    resetPageAndFilter(); 
    document.querySelector('.table-section').scrollIntoView({ behavior: 'smooth' });
}

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
        totalProjects: 0, totalOverallProjects: 0, stratCounts: {}, matrix: { single_single: 0, single_joint: 0, multi_single: 0, multi_joint: 0 } 
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

    masterData.forEach(row => {
        let aType = row._areaType;
        if (aType === "Single" || aType === "Multi") {
            dNames.filter(d => row._cleanArea.includes(d)).forEach(d => { districtStats[d].totalOverallProjects += 1; });
        }
    });

    filteredData.forEach(row => {
        let areaType = row._areaType; 
        
        let val = row[activeStratKey];
        if (val === undefined) {
            let searchKey = activeStratKey.split(" ")[0]; 
            if(activeStratKey.includes("ฉบับที่ 13")) searchKey = "ฉบับที่ 13";
            let foundKey = Object.keys(row).find(k => k.includes(searchKey));
            if (foundKey) val = row[foundKey];
        }

        let rawStrat = String(val || "ไม่ระบุ");
        let strats = rawStrat.split(",").map(s => s.trim()).filter(s => s !== "");
        if(strats.length === 0) strats = ["ไม่ระบุ"];
        let isSingleStrat = strats.length === 1;

        if (areaType === "Single" || areaType === "Multi") {
            let matchedDistricts = dNames.filter(d => row._cleanArea.includes(d));
            matchedDistricts.forEach(d => {
                if (areaType === "Single") { 
                    districtStats[d].singleC += 1; 
                    districtStats[d].singleB += row._budgetNum; 
                }
                if (areaType === "Multi") { 
                    districtStats[d].multiC += 1; 
                    districtStats[d].multiB += row._budgetNum; 
                }

                districtStats[d].totalProjects += 1;
                strats.forEach(s => {
                    districtStats[d].stratCounts[s] = (districtStats[d].stratCounts[s] || 0) + 1; 
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
                
                let s = districtStats[dName] || {singleC: 0, singleB: 0, multiC: 0, multiB: 0, totalProjects: 0};
                let color = '#FFEDA0';
                
                // 🎯 Heatmap: Count (Single+Multi), Budget (Single Only)
                if (mapMode === 'overview') {
                    if (currentMode === 'budget') {
                        let val = s.singleB; // สีงบตาม Single เท่านั้น
                        color = val > 50000000 ? '#800026' : val > 10000000 ? '#BD0026' : val > 1000000 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                    } else {
                        let val = s.singleC + s.multiC; // สีจำนวนโครงการใช้ Single+Multi
                        color = val > 10 ? '#800026' : val > 5 ? '#BD0026' : val > 2 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                    }
                } else {
                    let val = s.totalProjects; // 4D Mode
                    if (val > 15) color = '#800026';
                    else if (val > 8) color = '#BD0026';
                    else if (val > 3) color = '#E31A1C';
                    else if (val > 0) color = '#FC4E2A';
                }
                return { fillColor: color, weight: 1, opacity: 1, color: '#333', fillOpacity: 0.8 };
            },
            onEachFeature: function (f, l) {
                let dName = f.properties.amp_th || f.properties.AMP_TH || "ไม่ระบุ";
                let s = districtStats[dName] || {singleC: 0, singleB: 0, multiC: 0, multiB: 0, provC: 0, totalProjects: 0, totalOverallProjects: 0, stratCounts: {}, matrix: {}};
                
                let popupHtml = `<div style="font-family:'Sarabun'; width: 290px;"><b style="font-size:16px; color:#1e3a8a;">📍 ข้อมูลอำเภอ${dName}</b><hr style="margin:5px 0;">`;
                
                if (mapMode === 'overview') {
                    popupHtml += `
                        <div style="font-size:13px; line-height: 1.4;">
                            <b style="color:#10b981;">🎯 ดำเนินการเฉพาะพื้นที่อำเภอนี้</b><br>
                            จำนวน: ${s.singleC} โครงการ<br>งบประมาณ: ${s.singleB.toLocaleString()} บาท<br>
                            <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                            <b style="color:#f59e0b;">📦 ดำเนินการร่วมกับอำเภออื่น</b><br>
                            จำนวนโครงการที่เกี่ยวข้อง: ${s.multiC} โครงการ<br>ยอดรวมงบประมาณโครงการ: ${s.multiB.toLocaleString()} บาท<br>
                            <span style="color:#ef4444; font-size:11px; margin-top:2px;">(งบประมาณที่แสดงผลเป็นยอดรวมของโครงการ ไม่ถูกนำมาคำนวณและระบายสีรายอำเภอ)</span><br>
                            <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                            <b style="color:#ef4444;">🌐 ดำเนินการครอบคลุมทั้งจังหวัด</b><br>
                            จำนวนโครงการที่ดำเนินการครอบคลุมถึง: ${s.provC} โครงการ<br>
                            <span style="color:#ef4444; font-size:11px;">(ไม่นำมาคำนวณความเข้มข้นในแผนที่)</span>
                        </div>
                    `;
                } else {
                    if (isSpecificStrat) {
                        popupHtml += `
                            <div style="font-size:13px; line-height: 1.4;">
                                <div style="margin-bottom:8px; color:#666;">โครงการทั้งหมดที่ดำเนินการในอำเภอนี้ (ทุกยุทธศาสตร์): <b>${s.totalOverallProjects}</b> โครงการ</div>
                                <b>โครงการที่สอดคล้องกับประเด็นยุทธศาสตร์ที่เลือก: <span style="color:#ef4444; font-size:15px;">${s.totalProjects}</span> โครงการ</b><br>
                                <span style="color:#666; font-size:11px;">(จำแนกตามลักษณะการดำเนินงานเชิงพื้นที่และยุทธศาสตร์)</span><br><br>
                                <b style="color:#10b981;">1. สอดคล้องประเด็นเดียว และดำเนินการเฉพาะอำเภอนี้:</b> ${s.matrix.single_single}<br>
                                <b style="color:#f59e0b;">2. สอดคล้องหลายประเด็น และดำเนินการเฉพาะอำเภอนี้:</b> ${s.matrix.single_joint}<br>
                                <b style="color:#3b82f6;">3. สอดคล้องประเด็นเดียว และดำเนินการร่วมกับอำเภออื่น:</b> ${s.matrix.multi_single}<br>
                                <b style="color:#8b5cf6;">4. สอดคล้องหลายประเด็น และดำเนินการร่วมกับอำเภออื่น:</b> ${s.matrix.multi_joint}
                            </div>
                        `;
                    } else {
                        let sortedStrats = Object.entries(s.stratCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
                        let top3Html = sortedStrats.map((st, i) => `${i+1}. ${st[0]} <span style="color:#ef4444">(${st[1]})</span>`).join('<br>');
                        popupHtml += `
                            <div style="font-size:13px; line-height: 1.4;">
                                <b>จำนวนโครงการในพื้นที่: <span style="color:#ef4444">${s.totalProjects}</span> โครงการ</b><br>
                                <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                                <b style="color:#1e3a8a;">🧬 3 ลำดับประเด็นยุทธศาสตร์หลักในอำเภอนี้:</b><br>
                                ${top3Html || '<span style="color:gray">- ไม่มีข้อมูล -</span>'}
                            </div>
                        `;
                    }
                }
                
                popupHtml += `<button onclick="setDistrictFilter('${dName}')" style="margin-top:10px; width:100%; padding:6px; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer;">🔍 กรองข้อมูลเฉพาะอำเภอนี้</button></div>`;
                
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

function formatList(str) {
    if (!str || str === "NaN" || str === "-" || str.trim() === "") return "<span style='color:gray'>- ไม่ระบุข้อมูล -</span>";
    return str.split(',').map(s => s.trim()).join('<br>');
}

function openModal(idx) {
    const row = masterData[idx]; 
    document.getElementById('modalTitle').innerText = row["ชื่อโครงการ"] || "-";
    document.getElementById('modalArea').innerHTML = row._areaList.join(", ");
    
    let budgetDisplay = row._budgetNum.toLocaleString() + " บาท";
    if (row._budgetText) budgetDisplay += `<br><small style="color:#666; font-weight:normal;">(${row._budgetText})</small>`;
    document.getElementById('modalBudget').innerHTML = budgetDisplay;
    
    document.getElementById('modalYear').innerText = row._year;
    
    let aType = row._areaType;
    let aLabel = aType === 'Single' ? " (ดำเนินการเฉพาะพื้นที่)" : aType === 'Multi' ? " (ดำเนินการหลายพื้นที่)" : aType === 'Provincial' ? " (ดำเนินการครอบคลุมทั้งจังหวัด)" : " (ไม่ได้ระบุข้อมูลพื้นที่)";
    document.getElementById('modalAreaType').innerText = aType + aLabel;

    let getVal = (key) => {
        if(row[key] !== undefined) return String(row[key]);
        let shortKey = key.split(" ")[0];
        if(key.includes("ฉบับที่ 13")) shortKey = "ฉบับที่ 13";
        let f = Object.keys(row).find(k => k.includes(shortKey));
        return f ? String(row[f]) : "";
    };

    const strategyTableHTML = `
        <table style="width:100%; border-collapse:collapse; margin-top:20px; font-size:14px; background:#fff;">
            <tr>
                <th style="background:#e0e7ff; width:35%; padding:10px; border:1px solid #cbd5e1; text-align:left; color:#1e3a8a;">ระดับแผนพัฒนา</th>
                <th style="background:#e0e7ff; padding:10px; border:1px solid #cbd5e1; text-align:left; color:#1e3a8a;">ประเด็นเป้าหมายที่สอดคล้อง</th>
            </tr>
            <tr>
                <td style="padding:10px; border:1px solid #cbd5e1; font-weight:bold;">ยุทธศาสตร์ชาติ 20 ปี</td>
                <td style="padding:10px; border:1px solid #cbd5e1;">${formatList(getVal("ยุทธศาสตร์ชาติ 20 ปี"))}</td>
            </tr>
            <tr>
                <td style="padding:10px; border:1px solid #cbd5e1; font-weight:bold;">แผนแม่บทภายใต้ยุทธศาสตร์ชาติ</td>
                <td style="padding:10px; border:1px solid #cbd5e1;">${formatList(getVal("แผนแม่บทภายใต้ยุทธศาสตร์ชาติ"))}</td>
            </tr>
            <tr>
                <td style="padding:10px; border:1px solid #cbd5e1; font-weight:bold;">แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ ฉบับที่ 13</td>
                <td style="padding:10px; border:1px solid #cbd5e1;">${formatList(getVal("แผนพัฒนาฯ ฉบับที่ 13"))}</td>
            </tr>
            <tr>
                <td style="padding:10px; border:1px solid #cbd5e1; font-weight:bold;">แผนพัฒนาภาคเหนือ</td>
                <td style="padding:10px; border:1px solid #cbd5e1;">${formatList(getVal("แผนพัฒนาภาคเหนือ"))}</td>
            </tr>
            <tr>
                <td style="padding:10px; border:1px solid #cbd5e1; font-weight:bold;">แผนพัฒนาจังหวัดเชียงใหม่ (พ.ศ. 2566-2570)</td>
                <td style="padding:10px; border:1px solid #cbd5e1;">${formatList(getVal("ประเด็นการพัฒนาจังหวัด"))}</td>
            </tr>
        </table>
    `;
    document.getElementById('modalStrategyTable').innerHTML = strategyTableHTML;

    const subDiv = document.getElementById('modalSubActivities');
    const rawSub = String(row["รายละเอียดย่อย"] || "");
    const cleanSub = rawSub.replace(/\r\n/g, "<br>").replace(/\n/g, "<br>").trim();
    subDiv.innerHTML = (!cleanSub || cleanSub === "undefined" || cleanSub === "NaN") ? "<p style='color:gray;'>- ไม่พบข้อมูลรายละเอียด -</p>" : `<div class="sub-activity-box">${cleanSub}</div>`;
    
    document.getElementById('modalFilterBtnContainer').innerHTML = `<button class="btn-filter-project" onclick="setProjectFilter(\`${row["ชื่อโครงการ"]}\`)">📍 ตรวจสอบพื้นที่ดำเนินการบนแผนที่</button>`;
    document.getElementById('projectModal').style.display = "block";
}
function closeModal() { document.getElementById('projectModal').style.display = "none"; }
window.onclick = e => { if (e.target == document.getElementById('projectModal')) closeModal(); }

init();
