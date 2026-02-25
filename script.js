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

let isYearDesc = true;   
let isBudgetDesc = true; 
let primarySortKey = 'year'; 

let currentStratFilterId = 'filterProv'; 

// 🎯 MASTER LIST สำหรับเรียงลำดับ
const STRAT_MASTER_LISTS = {
    filterNat: ["ด้าน 1 ความมั่นคง", "ด้าน 2 การสร้างความสามารถในการแข่งขัน", "ด้าน 3 การพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์", "ด้าน 4 การสร้างโอกาสและความเสมอภาคทางสังคม", "ด้าน 5 การสร้างการเติบโตบนคุณภาพชีวิตที่เป็นมิตรกับสิ่งแวดล้อม", "ด้าน 6 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ"],
    filterMaster: ["ประเด็นที่ 1 ความมั่นคง", "ประเด็นที่ 2 การต่างประเทศ", "ประเด็นที่ 3 การเกษตร", "ประเด็นที่ 4 อุตสาหกรรมและบริการแห่งอนาคต", "ประเด็นที่ 5 การท่องเที่ยว", "ประเด็นที่ 6 พื้นที่และเมืองน่าอยู่อัจฉริยะ", "ประเด็นที่ 7 โครงสร้างพื้นฐาน ระบบโลจิสติกส์ และดิจิทัล", "ประเด็นที่ 8 ผู้ประกอบการและวิสาหกิจขนาดกลางและขนาดย่อมยุคใหม่", "ประเด็นที่ 9 เขตเศรษฐกิจพิเศษ", "ประเด็นที่ 10 การปรับเปลี่ยนค่านิยมและวัฒนธรรม", "ประเด็นที่ 11 ศักยภาพคนตลอดช่วงชีวิต", "ประเด็นที่ 12 การพัฒนาการเรียนรู้", "ประเด็นที่ 13 การเสริมสร้างให้คนไทยมีสุขภาวะที่ดี", "ประเด็นที่ 14 ศักยภาพการกีฬา", "ประเด็นที่ 15 พลังทางสังคม", "ประเด็นที่ 16 เศรษฐกิจฐานราก", "ประเด็นที่ 17 ความเสมอภาคและหลักประกันทางสังคม", "ประเด็นที่ 18 การเติบโตอย่างยั่งยืน", "ประเด็นที่ 19 การบริหารจัดการน้ำทั้งระบบ", "ประเด็นที่ 20 การบริการประชาชนและประสิทธิภาพภาครัฐ", "ประเด็นที่ 21 การต่อต้านการทุจริตและประพฤติมิชอบ", "ประเด็นที่ 22 กฎหมายและกระบวนการยุติธรรม", "ประเด็นที่ 23 การวิจัยและพัฒนานวัตกรรม"],
    filterPlan13: ["หมุดหมายที่ 1 ไทยเป็นประเทศชั้นนำด้านสินค้าเกษตรและเกษตรแปรรูปมูลค่าสูง", "หมุดหมายที่ 2 ไทยเป็นจุดหมายของการท่องเที่ยวที่เน้นคุณภาพและความยั่งยืน", "หมุดหมายที่ 3 ไทยเป็นฐานการผลิตยานยนต์ไฟฟ้าที่สำคัญของโลก", "หมุดหมายที่ 4 ไทยเป็นศูนย์กลางทางการแพทย์และสุขภาพมูลค่าสูง", "หมุดหมายที่ 5 ไทยเป็นประตูการค้าการลงทุนและยุทธศาสตร์ทางโลจิสติกส์ที่สำคัญของภูมิภาค", "หมุดหมายที่ 6 ไทยเป็นศูนย์กลางอุตสาหกรรมอิเล็กทรอนิกส์อัจฉริยะและอุตสาหกรรมดิจิทัลของอาเซียน", "หมุดหมายที่ 7 ไทยมีวิสาหกิจขนาดกลางและขนาดย่อมที่เข้มแข็ง มีศักยภาพสูง และสามารถแข่งขันได้", "หมุดหมายที่ 8 ไทยมีพื้นที่และเมืองอัจฉริยะที่น่าอยู่ ปลอดภัย เติบโตได้อย่างยั่งยืน", "หมุดหมายที่ 9 ไทยมีความยากจนข้ามรุ่นลดลง และมีความคุ้มครองทางสังคมที่เพียงพอ เหมาะสม", "หมุดหมายที่ 10 ไทยมีเศรษฐกิจหมุนเวียนและสังคมคาร์บอนต่ำ", "หมุดหมายที่ 11 ไทยสามารถลดความเสี่ยงและผลกระทบจากภัยธรรมชาติและการเปลี่ยนแปลงสภาพภูมิอากาศ", "หมุดหมายที่ 12 ไทยมีกำลังคนสมรรถนะสูง มุ่งเรียนรู้อย่างต่อเนื่อง ตอบโจทย์การพัฒนาแห่งอนาคต", "หมุดหมายที่ 13 ไทยมีภาครัฐที่ทันสมัย มีประสิทธิภาพ และตอบโจทย์ประชาชน"],
    filterNorth: ["ประเด็นการพัฒนาที่ 1 การพัฒนาเศรษฐกิจท่องเที่ยวและการค้าในพื้นที่", "ประเด็นการพัฒนาที่ 2 การพัฒนาเศรษฐกิจมูลค่าสูงด้วยการส่งออกสินค้าและบริการนอกพื้นที่", "ประเด็นการพัฒนาที่ 3 การพัฒนาเศรษฐกิจเกษตรสร้างสรรค์", "ประเด็นการพัฒนาที่ 4 การพัฒนาเศรษฐกิจสิ่งแวดล้อมเพื่อลดฝุ่นควัน"],
    filterProv: ["ประเด็นการพัฒนาที่ 1 การส่งเสริมอุตสาหกรรมท่องเที่ยวเน้นคุณค่า สร้างสรรค์บนอัตลักษณ์ล้านนา และอุตสาหกรรมไมซ์", "ประเด็นการพัฒนาที่ 2 การขับเคลื่อนเกษตรเพิ่มมูลค่า และเกษตรแปรรูปมูลค่าสูง", "ประเด็นการพัฒนาที่ 3 การยกระดับการค้าการลงทุนบนฐานเศรษฐกิจสร้างสรรค์ (Creative Economy) นวัตกรรม (Innovation) และการพัฒนาอย่างยั่งยืน (SDGs)", "ประเด็นการพัฒนาที่ 4 การจัดการเชิงรุกในปัญหาฝุ่นควัน (PM 2.5) และการรักษาทรัพยากรธรรมชาติและสิ่งแวดล้อมแบบมีส่วนร่วม", "ประเด็นการพัฒนาที่ 5 การเสริมสร้างสังคมแห่งโอกาสและเป็นธรรม เมืองน่าอยู่ มีความปลอดภัย เพื่อคุณภาพชีวิตที่ดีของประชาชน"]
};

const stratMapping = {
    'filterNat': { key: 'ยุทธศาสตร์ชาติ 20 ปี', name: 'ยุทธศาสตร์ชาติ 20 ปี' },
    'filterMaster': { key: 'แผนแม่บทภายใต้ยุทธศาสตร์ชาติ', name: 'แผนแม่บทภายใต้ยุทธศาสตร์ชาติ' },
    'filterPlan13': { key: 'แผนพัฒนาฯ ฉบับที่ 13', name: 'แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ ฉบับที่ 13' },
    'filterNorth': { key: 'แผนพัฒนาภาคเหนือ', name: 'แผนพัฒนาภาคเหนือ' },
    'filterProv': { key: 'ประเด็นการพัฒนาจังหวัด (2566-2570)', name: 'แผนพัฒนาจังหวัดเชียงใหม่ (พ.ศ. 2566-2570)' }
};

// ==========================================
// 1. สร้าง UI & ฟังก์ชันจัดการ Dropdown
// ==========================================
const checkList = document.getElementById('yearDropdown');
checkList.getElementsByClassName('anchor')[0].onclick = function(evt) {
    if (checkList.classList.contains('visible')) checkList.classList.remove('visible');
    else checkList.classList.add('visible');
}

function buildStaticSlicers() {
    for (const [id, options] of Object.entries(STRAT_MASTER_LISTS)) {
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

function toggleSummaryBreakdown(id) {
    const el = document.getElementById(id);
    el.style.display = (el.style.display === 'block') ? 'none' : 'block';
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

        // 🎯 เรียงปี และ บังคับ Default ปีล่าสุดปีเดียว
        const yearBox = document.getElementById('yearCheckboxes');
        let sortedYears = [...years].sort((a,b) => b-a); // เรียงใหม่ไปเก่า
        let maxYear = sortedYears.length > 0 ? sortedYears[0] : null;

        sortedYears.forEach(y => {
            let isChecked = (y === maxYear) ? 'checked' : '';
            yearBox.innerHTML += `<li><input type="checkbox" class="year-cb" value="${y}" ${isChecked} onchange="handleYearChange()"> <span>ปีงบประมาณ ${y}</span></li>`;
        });
        
        document.getElementById('checkAllYears').checked = false; // ปลด check all

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

// 🎯 ฟังก์ชันอัปเดตชื่อปุ่ม Dropdown ปี
function updateYearDropdownLabel() {
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => parseInt(cb.value)).sort((a,b) => a-b);
    const label = document.getElementById('yearDropdownText');
    
    if (selectedYears.length === 0) {
        label.innerText = "📅 กรุณาเลือกปีงบประมาณ";
    } else if (selectedYears.length === 1) {
        label.innerText = `📅 ปีงบประมาณ ${selectedYears[0]}`;
    } else {
        // เช็คว่าปีเรียงติดกันหรือไม่
        let isContinuous = true;
        for (let i = 0; i < selectedYears.length - 1; i++) {
            if (selectedYears[i+1] !== selectedYears[i] + 1) {
                isContinuous = false;
                break;
            }
        }
        
        if (isContinuous) {
            label.innerText = `📅 ปีงบประมาณ ${selectedYears[0]} - ${selectedYears[selectedYears.length-1]}`;
        } else {
            // ถ้าเยอะเกินไปให้ตัดคำ
            if (selectedYears.length > 3) {
                label.innerText = `📅 ปีงบประมาณ ${selectedYears[0]}...${selectedYears[selectedYears.length-1]} (${selectedYears.length} ปี)`;
            } else {
                label.innerText = `📅 ปีงบประมาณ ${selectedYears.join(', ')}`;
            }
        }
    }
}

// ==========================================
// 3. ระบบกรอง (Global Filter)
// ==========================================
function applyFilters() {
    const searchTxt = document.getElementById('globalSearch').value.toLowerCase(); 
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value);
    
    // อัปเดตชื่อปุ่ม Dropdown
    updateYearDropdownLabel();

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
    // Default กลับไปปีล่าสุด 1 ปี
    let cbs = document.querySelectorAll('.year-cb');
    if(cbs.length > 0) {
        cbs.forEach(cb => cb.checked = false);
        cbs[0].checked = true; // อันแรกคือปีใหม่สุดที่ sort ไว้
        document.getElementById('checkAllYears').checked = false;
    }
    
    document.querySelectorAll('.slicer').forEach(el => el.value = "all");
    mapFilterDistrict = "all";
    mapFilterProject = "all";
    chartFilterAreaType = "all";
    currentStratFilterId = 'filterProv'; 
    resetPageAndFilter();
}

// ==========================================
// 4. ระบบตาราง (Sorting Logic แก้ใหม่: Group Year -> Sort Budget)
// ==========================================
function handleTableSearch() { currentPage = 1; renderTable(); }

function toggleSort(type) {
    if (type === 'year') {
        if(primarySortKey === 'year') isYearDesc = !isYearDesc;
        primarySortKey = 'year';
    } else if (type === 'budget') {
        if(primarySortKey === 'budget') isBudgetDesc = !isBudgetDesc;
        primarySortKey = 'budget';
    }
    document.getElementById('btnSortYear').innerText = `📅 ปีงบประมาณ: ${isYearDesc ? '▼ ใหม่ ➜ เก่า' : '▲ เก่า ➜ ใหม่'}`;
    document.getElementById('btnSortBudget').innerText = `💰 งบประมาณ: ${isBudgetDesc ? '▼ มาก ➜ น้อย' : '▲ น้อย ➜ มาก'}`;
    document.getElementById('btnSortYear').classList.toggle('active', primarySortKey === 'year');
    document.getElementById('btnSortBudget').classList.toggle('active', primarySortKey === 'budget');
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

    // 🎯 Logic การเรียงแบบซ้อนทับ (Strict Hierarchy)
    // กฎเหล็ก: เรียงปีเป็นก้อนก่อนเสมอ แล้วค่อยเรียงงบในก้อนนั้น
    tableData.sort((a, b) => {
        let yearA = parseInt(a._year) || 0;
        let yearB = parseInt(b._year) || 0;
        let budgetA = a._budgetNum;
        let budgetB = b._budgetNum;

        // 1. เรียงปีงบประมาณก่อน (Primary)
        if (yearA !== yearB) {
            return isYearDesc ? yearB - yearA : yearA - yearB;
        }

        // 2. ถ้าปีเท่ากัน ให้เรียงตามงบประมาณ (Secondary)
        return isBudgetDesc ? budgetB - budgetA : budgetA - budgetB;
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
// 5. อัปเดต UI, Breakdown Dropdown & Provincial Table (Multi-year)
// ==========================================
function updateDashboard() {
    // อัปเดตยอดรวมใหญ่
    document.getElementById('sumProjects').innerText = filteredData.length.toLocaleString();
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);
    document.getElementById('sumBudget').innerText = totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2});

    // 🎯 อัปเดต Breakdown รายปีในการ์ดสรุป
    let yearStats = {};
    filteredData.forEach(r => {
        if(!yearStats[r._year]) yearStats[r._year] = { count: 0, budget: 0 };
        yearStats[r._year].count++;
        yearStats[r._year].budget += r._budgetNum;
    });
    
    let projBreakdownHtml = "<table>";
    let budgetBreakdownHtml = "<table>";
    Object.keys(yearStats).sort((a,b)=>b-a).forEach(y => {
        projBreakdownHtml += `<tr><td>ปีงบประมาณ ${y}:</td><td style="text-align:right"><b>${yearStats[y].count.toLocaleString()}</b> โครงการ</td></tr>`;
        budgetBreakdownHtml += `<tr><td>ปีงบประมาณ ${y}:</td><td style="text-align:right"><b>${yearStats[y].budget.toLocaleString()}</b> บาท</td></tr>`;
    });
    projBreakdownHtml += "</table>";
    budgetBreakdownHtml += "</table>";
    
    document.getElementById('projectBreakdown').innerHTML = Object.keys(yearStats).length > 0 ? projBreakdownHtml : 'ไม่มีข้อมูล';
    document.getElementById('budgetBreakdown').innerHTML = Object.keys(yearStats).length > 0 ? budgetBreakdownHtml : 'ไม่มีข้อมูล';

    // อัปเดตแถบจังหวัด
    let provCount = 0; let provBudget = 0;
    filteredData.forEach(r => { if(r._areaType === "Provincial") { provCount++; provBudget += r._budgetNum; } });
    document.getElementById('provincialStatusContent').innerHTML = `
        <div style="font-size:14px; font-weight:normal; margin-bottom:5px;">ส่วนประมวลผลโครงการระดับจังหวัด (ดำเนินการครอบคลุมทุกอำเภอ)</div>
        <div style="display:flex; gap:20px;">
            <span>📋 จำนวนโครงการรวม: <b>${provCount}</b> โครงการ</span> 
            <span>💰 งบประมาณรวม: <b>${provBudget.toLocaleString()}</b> บาท</span>
        </div>`;

    let activeStrat = stratMapping[currentStratFilterId];
    let selectedValue = document.getElementById(currentStratFilterId).value;
    document.getElementById('strategyChartSubtitle').innerText = `(แสดงผลตามค่าเริ่มต้น: ${activeStrat.name})`;

    let mainStratStatus = `<span style="color:#1e3a8a;">ประเด็นยุทธศาสตร์ที่เลือก: <b>${activeStrat.name}</b></span>`;
    if(selectedValue !== "all") mainStratStatus += ` ➡️ <span style="color:#b45309;">${selectedValue}</span>`; 
    else mainStratStatus += ` ➡️ <span style="color:#b45309;">แสดงภาพรวมทุกประเด็น</span>`;

    let activeTexts = [];
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value).sort();
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

    // 🎯 ระบบจัดการ Multi-Year
    let isMultiYear = selectedYears.length > 1;
    let chartSelect = document.getElementById('chartTypeSelect');
    let overlay = document.getElementById('areaChartOverlay');

    if(isMultiYear) {
        chartSelect.value = 'bar';
        chartSelect.disabled = true;
        chartSelect.title = "หากเลือกหลายปีงบประมาณระบบแผนภูมิโดนัทจะไม่สามารถใช้ได้";
        overlay.style.display = 'flex'; // บังโดนัทพื้นที่
    } else {
        chartSelect.disabled = false;
        chartSelect.title = "";
        overlay.style.display = 'none';
    }

    renderProvincialTable(activeStrat, selectedValue, isMultiYear, selectedYears);
    renderCharts(isMultiYear, selectedYears);
    setTimeout(() => renderMap(isMultiYear, selectedYears), 300); 
}

// 🎯 สร้างตารางยุทธศาสตร์ระดับจังหวัด (รองรับ Multi-Year ขยายคอลัมน์แนวนอน)
function renderProvincialTable(activeStrat, selectedValue, isMultiYear, selectedYears) {
    let provData = filteredData.filter(r => r._areaType === "Provincial");
    let stratStats = {}; // { stratName: { total: {sC, jC, sB}, years: { '66': {sC, jC, sB} } } }
    
    let globalJointSet = new Set();
    let globalJointBudget = 0;
    let yearJointSets = {}; // แยกนับ joint รายปี
    let yearJointBudgets = {};

    selectedYears.forEach(y => { yearJointSets[y] = new Set(); yearJointBudgets[y] = 0; });

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
        let rYear = row._year;

        if (!isSingle) {
            globalJointSet.add(index);
            globalJointBudget += row._budgetNum;
            if(yearJointSets[rYear]) {
                yearJointSets[rYear].add(index);
                yearJointBudgets[rYear] += row._budgetNum;
            }
        }

        rawStrats.forEach(s => {
            if (selectedValue !== "all" && s !== selectedValue) return;
            if (!stratStats[s]) {
                stratStats[s] = { total: {sC: 0, jC: 0, sB: 0}, years: {} };
                selectedYears.forEach(y => stratStats[s].years[y] = {sC: 0, jC: 0, sB: 0});
            }
            
            // เผื่อปีที่ไม่ได้เลือกหลุดมา (ป้องกัน error)
            if(!stratStats[s].years[rYear]) stratStats[s].years[rYear] = {sC: 0, jC: 0, sB: 0};

            if (isSingle) {
                stratStats[s].total.sC += 1;
                stratStats[s].total.sB += row._budgetNum; 
                stratStats[s].years[rYear].sC += 1;
                stratStats[s].years[rYear].sB += row._budgetNum; 
            } else {
                stratStats[s].total.jC += 1;
                stratStats[s].years[rYear].jC += 1;
            }
        });
    });

    // 🎯 สร้างหัวตาราง (ปรับตาม Multi-year)
    let thead = document.getElementById('provincialTableHead');
    let headHtml = `
        <tr style="background:#f1f5f9;">
            <th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:left; min-width: 250px;">ประเด็นยุทธศาสตร์ที่สอดคล้อง</th>
    `;
    
    if (isMultiYear) {
        headHtml += `
            <th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:center; min-width: 150px; background:#e0e7ff;">ภาพรวมทุกปี (โครงการ)</th>
            <th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:right; min-width: 150px; background:#e0e7ff;">งบประมาณรวม (เฉพาะเดี่ยว)</th>
        `;
        selectedYears.sort((a,b)=>b-a).forEach(y => {
            headHtml += `
                <th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:center; min-width: 120px; border-left: 2px solid #fff;">ปี ${y} (โครงการ)</th>
                <th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:right; min-width: 120px;">ปี ${y} (งบประมาณ)</th>
            `;
        });
    } else {
        headHtml += `
            <th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:center; width:25%;">จำนวนโครงการ<br><small>เฉพาะประเด็นเดียว <span class="joint-stat">(+หลายประเด็น)</span></small></th>
            <th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:right; width:30%;">งบประมาณ (บาท)<br><small>(เฉพาะโครงการประเด็นเดียว)</small></th>
        `;
    }
    headHtml += `</tr>`;
    thead.innerHTML = headHtml;

    // 🎯 เรียงจากซ้ายไปขวาตาม Master List (แผนที่เลือก)
    let masterList = STRAT_MASTER_LISTS[currentStratFilterId] || [];
    let sortedKeys = Object.keys(stratStats).sort((a,b) => {
        if(a === 'ไม่ระบุ') return 1;
        if(b === 'ไม่ระบุ') return -1;
        let idxA = masterList.indexOf(a);
        let idxB = masterList.indexOf(b);
        if(idxA === -1) idxA = 999;
        if(idxB === -1) idxB = 999;
        return idxA - idxB; 
    });

    let tbodyHtml = '';
    if (sortedKeys.length === 0) {
        let colSpan = isMultiYear ? (2 + selectedYears.length * 2) : 3;
        tbodyHtml = `<tr><td colspan="${colSpan}" style="text-align:center; padding:15px; color:gray;">- ไม่มีข้อมูลโครงการระดับจังหวัดที่ตรงกับเงื่อนไขนี้ -</td></tr>`;
    } else {
        sortedKeys.forEach(k => {
            let st = stratStats[k];
            let tJointText = st.total.jC > 0 ? `<span class="joint-stat">(+${st.total.jC})</span>` : '';
            
            tbodyHtml += `<tr style="border-bottom: 1px dashed #e2e8f0;"><td style="padding:10px;">${k}</td>`;
            
            if(isMultiYear) {
                tbodyHtml += `
                    <td style="text-align:center; padding:10px; background:#f8fafc;"><b>${st.total.sC}</b> ${tJointText}</td>
                    <td style="text-align:right; padding:10px; color:#059669; background:#f8fafc;"><b>${st.total.sB.toLocaleString()}</b></td>
                `;
                selectedYears.sort((a,b)=>b-a).forEach(y => {
                    let ySt = st.years[y];
                    let yJointText = ySt.jC > 0 ? `<span class="joint-stat">(+${ySt.jC})</span>` : '';
                    tbodyHtml += `
                        <td style="text-align:center; padding:10px; border-left: 1px solid #f1f5f9;"><b>${ySt.sC}</b> ${yJointText}</td>
                        <td style="text-align:right; padding:10px; color:#059669;"><b>${ySt.sB.toLocaleString()}</b></td>
                    `;
                });
            } else {
                tbodyHtml += `
                    <td style="text-align:center; padding:10px;"><b>${st.total.sC}</b> ${tJointText}</td>
                    <td style="text-align:right; padding:10px; color:#059669;"><b>${st.total.sB.toLocaleString()}</b></td>
                `;
            }
            tbodyHtml += `</tr>`;
        });
    }
    document.getElementById('provincialTableBody').innerHTML = tbodyHtml;

    // 🎯 Footer สรุป Joint 
    let tfoot = document.getElementById('provincialTableFooter');
    let footHtml = `<tr class="footer-row"><td class="footer-label" style="text-align: right; padding-right: 15px;">สรุปรวมประเด็นที่ตอบสนองมากกว่า 1 เป้าหมาย</td>`;
    
    if (isMultiYear) {
        footHtml += `
            <td style="text-align:center; padding:12px; background:#fff7ed;"><b>${globalJointSet.size}</b></td>
            <td style="text-align:right; padding:12px; background:#fff7ed;"><b>${globalJointBudget.toLocaleString()}</b></td>
        `;
        selectedYears.sort((a,b)=>b-a).forEach(y => {
            footHtml += `
                <td style="text-align:center; padding:12px; border-left: 2px solid #fff;"><b>${yearJointSets[y].size}</b></td>
                <td style="text-align:right; padding:12px;"><b>${yearJointBudgets[y].toLocaleString()}</b></td>
            `;
        });
    } else {
        footHtml += `
            <td style="text-align:center; padding:12px;"><b>${globalJointSet.size}</b></td>
            <td style="text-align:right; padding:12px;"><b>${globalJointBudget.toLocaleString()}</b></td>
        `;
    }
    footHtml += `</tr>`;
    tfoot.innerHTML = footHtml;
}


// ==========================================
// 5. วาดกราฟ (เรียงซ้ายไปขวา + Grouped Bar หลายปี)
// ==========================================
function renderCharts(isMultiYear, selectedYears) {
    let activeStrategyKey = stratMapping[currentStratFilterId].key;
    let masterList = STRAT_MASTER_LISTS[currentStratFilterId] || [];
    
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

        let strVal = String(val).trim();
        if (!val || strVal === "" || strVal === "NaN" || strVal === "undefined" || strVal === "-" || strVal === "ไม่ระบุข้อมูล") {
            strVal = "ไม่ระบุ";
        }

        let strategies = strVal.split(",").map(s => s.trim()).filter(s => s !== "");
        if (strategies.length === 0) strategies = ["ไม่ระบุ"];
        
        let isSingle = strategies.length === 1;
        let rYear = row._year;
        
        strategies.forEach(strat => {
            let fullStratName = strat; 
            if(!stratData[fullStratName]) {
                stratData[fullStratName] = { total: {sC:0, jC:0, sB:0}, years: {} };
                if(isMultiYear) selectedYears.forEach(y => stratData[fullStratName].years[y] = {sC:0, jC:0, sB:0});
            }
            if(isMultiYear && !stratData[fullStratName].years[rYear]) stratData[fullStratName].years[rYear] = {sC:0, jC:0, sB:0};
            
            if(isSingle) {
                stratData[fullStratName].total.sC += 1;
                stratData[fullStratName].total.sB += row._budgetNum;
                if(isMultiYear) {
                    stratData[fullStratName].years[rYear].sC += 1;
                    stratData[fullStratName].years[rYear].sB += row._budgetNum;
                }
            } else {
                stratData[fullStratName].total.jC += 1;
                if(isMultiYear) stratData[fullStratName].years[rYear].jC += 1;
            }
        });
        if(!isSingle) integratedBudget += row._budgetNum; 
    });

    const ctxMain = document.getElementById('mainChart');
    if (myChart) myChart.destroy();
    let chartType = document.getElementById('chartTypeSelect').value;
    
    // 🎯 เรียงจากซ้ายไปขวาตาม Master List แผนแม่บท
    let sortedKeys = Object.keys(stratData).sort((a,b) => {
        if(a === 'ไม่ระบุ') return 1;
        if(b === 'ไม่ระบุ') return -1;
        let idxA = masterList.indexOf(a);
        let idxB = masterList.indexOf(b);
        if(idxA === -1) idxA = 999;
        if(idxB === -1) idxB = 999;
        return idxA - idxB; 
    });

    let labels = sortedKeys;
    let displayLabels = labels.map(k => k.length > 35 ? k.substring(0, 35) + "..." : k);
    const pieColors = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#0ea5e9', '#14b8a6', '#f43f5e', '#d946ef', '#a855f7', '#6366f1', '#84cc16', '#eab308', '#f97316', '#06b6d4', '#059669', '#dc2626', '#7c3aed', '#475569', '#9ca3af', '#cbd5e1', '#1e40af', '#047857', '#b91c1c'];

    if (chartType === 'bar') {
        let datasets = [];
        
        if (isMultiYear) {
            let yearColors = ['#1e3a8a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            selectedYears.sort((a,b)=>a-b).forEach((y, idx) => {
                let dataSingle = [], dataJoint = [];
                labels.forEach(k => {
                    if(currentMode === 'count') {
                        dataSingle.push(stratData[k].years[y]?.sC || 0);
                        dataJoint.push(stratData[k].years[y]?.jC || 0);
                    } else {
                        dataSingle.push(stratData[k].years[y]?.sB || 0);
                        dataJoint.push(0);
                    }
                });
                
                datasets.push({
                    label: `ปี ${y} (${currentMode==='count'?'เดี่ยว':'งบ'})`,
                    data: dataSingle,
                    backgroundColor: yearColors[idx % yearColors.length],
                    stack: `Stack${idx}`
                });
                if(currentMode === 'count') {
                    datasets.push({
                        label: `ปี ${y} (ร่วม)`,
                        data: dataJoint,
                        backgroundColor: yearColors[idx % yearColors.length] + '80', // จางลง
                        stack: `Stack${idx}`
                    });
                }
            });
        } 
        else {
            let dataSingle = [], dataJoint = [];
            labels.forEach(k => {
                if(currentMode === 'count') {
                    dataSingle.push(stratData[k].total.sC);
                    dataJoint.push(stratData[k].total.jC);
                } else {
                    dataSingle.push(stratData[k].total.sB);
                    dataJoint.push(0); 
                }
            });
            if (currentMode === 'budget' && integratedBudget > 0) {
                displayLabels.push("งบประมาณบูรณาการ");
                labels.push("งบประมาณบูรณาการ");
                dataSingle.push(0);
                dataJoint.push(integratedBudget);
            }

            datasets = [
                { label: currentMode==='count' ? 'เฉพาะประเด็นเดียว (Single)' : 'งบประมาณ (เฉพาะประเด็นเดียว)', data: dataSingle, backgroundColor: '#3b82f6', stack: 'Stack0' },
                { label: currentMode==='count' ? 'หลายประเด็น (Joint)' : 'งบประมาณ (หลายประเด็น)', data: dataJoint, backgroundColor: '#f59e0b', stack: 'Stack0' }
            ];
        }

        myChart = new Chart(ctxMain, {
            type: 'bar',
            data: { labels: displayLabels, datasets: datasets },
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
        // โดนัท
        let data = [];
        labels.forEach(k => {
            if(currentMode === 'count') data.push(stratData[k].total.sC + stratData[k].total.jC);
            else data.push(stratData[k].total.sB);
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
            data: { labels: labelsWithPct, datasets: [{ data: data, backgroundColor: pieColors }] },
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
                                    return ` ${k}: ${ctx.raw} โครงการ (${pct}%) | ประเด็นเดียว: ${stratData[k]?.total.sC || 0}, หลายประเด็น: ${stratData[k]?.total.jC || 0}`;
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

    // Area Chart - ซ่อนอัตโนมัติเมื่อ Multi-Year
    const ctxArea = document.getElementById('areaChart');
    if(isMultiYear) {
        if (areaChart) areaChart.destroy();
        return; 
    }

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

    // 🎯 Trend Chart: แสดงทุกปีที่ติ๊ก แม้ไม่มีข้อมูล
    const ctxTrend = document.getElementById('trendChart');
    let yearCounts = {};
    // เตรียม slot ให้ครบตาม selectedYears
    selectedYears.forEach(y => yearCounts[y] = 0);
    
    filteredData.forEach(row => {
        if(yearCounts[row._year] !== undefined) yearCounts[row._year] += currentMode === 'budget' ? row._budgetNum : 1;
    });
    
    let sortedYearsTrend = Object.keys(yearCounts).sort((a,b)=>a-b);
    let trendData = sortedYearsTrend.map(y => yearCounts[y]);

    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: sortedYearsTrend,
            datasets: [
                { type: 'bar', label: 'ปริมาณ', data: trendData, backgroundColor: '#cbd5e1', order: 2 }, 
                { type: 'line', label: 'แนวโน้ม', data: trendData, borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.3, order: 1 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false } } }
    });
}

// ==========================================
// 6. แผนที่ Leaflet (Heatmap & Popup Multi-Year)
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

function renderMap(isMultiYear, selectedYears) {
    let mapMode = document.getElementById('mapModeSelect').value;

    if (!map) {
        map = L.map('map', {scrollWheelZoom: false}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    let districtStats = {};
    const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];
    
    // 🎯 โครงสร้างใหม่ รองรับรายปีในแต่ละอำเภอ
    dNames.forEach(d => {
        districtStats[d] = { 
            total: { singleC: 0, singleB: 0, multiC: 0, multiB: 0, provC: 0, totalProjects: 0, stratCounts: {}, matrix: { s_s:0, s_j:0, m_s:0, m_j:0 } },
            years: {} 
        };
        if(isMultiYear) {
            selectedYears.forEach(y => {
                districtStats[d].years[y] = { singleC: 0, singleB: 0, multiC: 0, multiB: 0, provC: 0, totalProjects: 0, stratCounts: {}, matrix: { s_s:0, s_j:0, m_s:0, m_j:0 } };
            });
        }
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

    // masterData ไม่แยกปี เพราะใช้นับฐาน
    let overallProjects = {};
    dNames.forEach(d => overallProjects[d] = 0);
    masterData.forEach(row => {
        let aType = row._areaType;
        if (aType === "Single" || aType === "Multi") {
            dNames.filter(d => row._cleanArea.includes(d)).forEach(d => { overallProjects[d] += 1; });
        }
    });

    filteredData.forEach(row => {
        let areaType = row._areaType; 
        let rYear = row._year;
        
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
                // Update Total
                if (areaType === "Single") { districtStats[d].total.singleC += 1; districtStats[d].total.singleB += row._budgetNum; }
                if (areaType === "Multi") { districtStats[d].total.multiC += 1; districtStats[d].total.multiB += row._budgetNum; }
                districtStats[d].total.totalProjects += 1;
                strats.forEach(s => { districtStats[d].total.stratCounts[s] = (districtStats[d].total.stratCounts[s] || 0) + 1; });

                if (isSpecificStrat) {
                    if (areaType === "Single" && isSingleStrat) districtStats[d].total.matrix.s_s++;
                    else if (areaType === "Single" && !isSingleStrat) districtStats[d].total.matrix.s_j++;
                    else if (areaType === "Multi" && isSingleStrat) districtStats[d].total.matrix.m_s++;
                    else if (areaType === "Multi" && !isSingleStrat) districtStats[d].total.matrix.m_j++;
                }

                // Update per Year
                if(isMultiYear && districtStats[d].years[rYear]) {
                    let ySt = districtStats[d].years[rYear];
                    if (areaType === "Single") { ySt.singleC += 1; ySt.singleB += row._budgetNum; }
                    if (areaType === "Multi") { ySt.multiC += 1; ySt.multiB += row._budgetNum; }
                    ySt.totalProjects += 1;
                    strats.forEach(s => { ySt.stratCounts[s] = (ySt.stratCounts[s] || 0) + 1; });

                    if (isSpecificStrat) {
                        if (areaType === "Single" && isSingleStrat) ySt.matrix.s_s++;
                        else if (areaType === "Single" && !isSingleStrat) ySt.matrix.s_j++;
                        else if (areaType === "Multi" && isSingleStrat) ySt.matrix.m_s++;
                        else if (areaType === "Multi" && !isSingleStrat) ySt.matrix.m_j++;
                    }
                }
            });
        } else if (areaType === "Provincial") {
            dNames.forEach(d => { 
                districtStats[d].total.provC += 1; 
                if(isMultiYear && districtStats[d].years[rYear]) districtStats[d].years[rYear].provC += 1;
            });
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
                
                let s = districtStats[dName]?.total || {singleC: 0, singleB: 0, multiC: 0, multiB: 0, totalProjects: 0};
                let color = '#FFEDA0';
                
                if (mapMode === 'overview') {
                    if (currentMode === 'budget') {
                        let val = s.singleB; 
                        color = val > 50000000 ? '#800026' : val > 10000000 ? '#BD0026' : val > 1000000 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                    } else {
                        let val = s.singleC + s.multiC; 
                        color = val > 10 ? '#800026' : val > 5 ? '#BD0026' : val > 2 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                    }
                } else {
                    let val = isSpecificStrat ? (s.matrix.s_s + s.matrix.m_s + s.matrix.s_j + s.matrix.m_j) : s.totalProjects;
                    if (val > 15) color = '#800026';
                    else if (val > 8) color = '#BD0026';
                    else if (val > 3) color = '#E31A1C';
                    else if (val > 0) color = '#FC4E2A';
                }
                return { fillColor: color, weight: 1, opacity: 1, color: '#333', fillOpacity: 0.8 };
            },
            onEachFeature: function (f, l) {
                let dName = f.properties.amp_th || f.properties.AMP_TH || "ไม่ระบุ";
                let dt = districtStats[dName];
                let s = dt.total;
                
                // 🎯 ปรับ Popup ให้รองรับการแจกแจงรายปี (ถ้ามี)
                let popupHtml = `<div style="font-family:'Sarabun'; width: 320px; max-height: 350px; overflow-y: auto;">
                                 <b style="font-size:16px; color:#1e3a8a;">📍 ข้อมูลอำเภอ${dName}</b>`;
                
                if(isMultiYear) {
                    popupHtml += `<div style="font-size:12px; color:#f97316; font-weight:bold; margin-top:2px;">(สรุปรวมปีงบประมาณ ${selectedYears.join(', ')})</div><hr style="margin:5px 0;">`;
                } else {
                    popupHtml += `<hr style="margin:5px 0;">`;
                }
                
                if (mapMode === 'overview') {
                    popupHtml += `
                        <div style="font-size:13px; line-height: 1.4;">
                            <b style="color:#10b981;">🎯 ดำเนินการเฉพาะอำเภอนี้ (Single)</b><br>
                            รวมทั้งหมด: <b>${s.singleC}</b> โครงการ | <b>${s.singleB.toLocaleString()}</b> บาท<br>
                    `;
                    if(isMultiYear) {
                        popupHtml += `<ul style="margin:2px 0 5px 0; padding-left:15px; font-size:11px; color:#666;">`;
                        selectedYears.sort((a,b)=>b-a).forEach(y => {
                            // Show even if 0
                            popupHtml += `<li>ปี ${y}: ${dt.years[y].singleC} โครงการ (${dt.years[y].singleB.toLocaleString()} บ.)</li>`;
                        });
                        popupHtml += `</ul>`;
                    }

                    popupHtml += `
                            <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                            <b style="color:#f59e0b;">📦 ดำเนินการร่วมอำเภออื่น (Multi)</b><br>
                            รวมที่เกี่ยวข้อง: <b>${s.multiC}</b> โครงการ<br>ยอดรวมกรอบงบ: <b>${s.multiB.toLocaleString()}</b> บาท<br>
                    `;
                    if(isMultiYear) {
                        popupHtml += `<ul style="margin:2px 0 5px 0; padding-left:15px; font-size:11px; color:#666;">`;
                        selectedYears.sort((a,b)=>b-a).forEach(y => {
                            popupHtml += `<li>ปี ${y}: ${dt.years[y].multiC} โครงการ (${dt.years[y].multiB.toLocaleString()} บ.)</li>`;
                        });
                        popupHtml += `</ul>`;
                    }

                    popupHtml += `<span style="color:#ef4444; font-size:11px;">(งบประมาณส่วนนี้เป็นยอดรวม ไม่ถูกนำมาหารและไม่ถูกนำมาคำนวณเพื่อระบายสีในแผนที่)</span><br>
                            <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                            <b style="color:#ef4444;">🌐 ครอบคลุมทั้งจังหวัด (Provincial)</b><br>
                            รวมที่ครอบคลุมถึง: ${s.provC} โครงการ
                        </div>
                    `;
                } else {
                    // โหมด 4D Matrix
                    if (isSpecificStrat) {
                        popupHtml += `
                            <div style="font-size:13px; line-height: 1.4;">
                                <div style="margin-bottom:8px; color:#666;">โครงการฐานที่ลงในอำเภอนี้: <b>${overallProjects[dName]}</b> โครงการ</div>
                                <b>รวมสอดคล้องประเด็นยุทธศาสตร์ที่เลือก: <span style="color:#ef4444; font-size:15px;">${s.totalProjects}</span> โครงการ</b><br>
                                <span style="color:#666; font-size:11px;">(จำแนกตามลักษณะพื้นที่และยุทธศาสตร์)</span><br><br>
                                <b style="color:#10b981;">1. สอดคล้องประเด็นเดียว + ลงเฉพาะอำเภอนี้:</b> ${s.matrix.s_s}<br>
                                <b style="color:#f59e0b;">2. สอดคล้องหลายประเด็น + ลงเฉพาะอำเภอนี้:</b> ${s.matrix.s_j}<br>
                                <b style="color:#3b82f6;">3. สอดคล้องประเด็นเดียว + ร่วมอำเภออื่น:</b> ${s.matrix.m_s}<br>
                                <b style="color:#8b5cf6;">4. สอดคล้องหลายประเด็น + ร่วมอำเภออื่น:</b> ${s.matrix.m_j}
                        `;
                        // 4D breakdown per year
                        if(isMultiYear) {
                            popupHtml += `<hr style="margin:5px 0;"><div style="font-size:11px; color:#666;">`;
                            selectedYears.sort((a,b)=>b-a).forEach(y => {
                                popupHtml += `<b>ปี ${y}:</b> รวม ${dt.years[y].totalProjects} โครงการ<br>`;
                            });
                            popupHtml += `</div>`;
                        }
                        popupHtml += `</div>`;
                    } else {
                        let sortedStrats = Object.entries(s.stratCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
                        let top3Html = sortedStrats.map((st, i) => `${i+1}. ${st[0]} <span style="color:#ef4444">(${st[1]})</span>`).join('<br>');
                        popupHtml += `
                            <div style="font-size:13px; line-height: 1.4;">
                                <b>รวมโครงการในพื้นที่: <span style="color:#ef4444">${s.totalProjects}</span> โครงการ</b><br>
                        `;
                        if(isMultiYear) {
                            popupHtml += `<div style="font-size:11px; color:#666; margin-bottom:5px;">`;
                            selectedYears.sort((a,b)=>b-a).forEach(y => {
                                popupHtml += `ปี ${y}: ${dt.years[y].totalProjects} โครงการ<br>`;
                            });
                            popupHtml += `</div>`;
                        }

                        popupHtml += `
                                <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                                <b style="color:#1e3a8a;">🧬 3 ลำดับยุทธศาสตร์หลักในอำเภอนี้ (รวม):</b><br>
                                ${top3Html || '<span style="color:gray">- ไม่มีข้อมูล -</span>'}
                            </div>
                        `;
                    }
                }
                
                popupHtml += `<button type="button" onclick="setDistrictFilter('${dName}')" style="margin-top:10px; width:100%; padding:6px; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer; position:sticky; bottom:0;">🔍 กรองข้อมูลเฉพาะอำเภอนี้</button></div>`;
                
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
