// ==========================================
// 🛡️ Safe Setters (ป้องกัน Error Cannot set properties of null 100%)
// ==========================================
const safeSetText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
const safeSetHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

// 🌟 เพิ่มฟังก์ชันคำนวณ Percentile สำหรับ Heat Map (อิงกลุ่ม)
function getPercentile(arr, p) {
    if (arr.length === 0) return 0;
    if (p <= 0) return arr[0];
    if (p >= 1) return arr[arr.length - 1];
    let index = (arr.length - 1) * p;
    let lower = Math.floor(index);
    let upper = lower + 1;
    let weight = index % 1;
    if (upper >= arr.length) return arr[lower];
    return arr[lower] * (1 - weight) + arr[upper] * weight;
}

// 🚨 เปลี่ยน URL เป็นของคุณที่นี่
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

let currentStratFilterId = 'filterProv'; 

let districtGeoJSON = null; 
let renderMapTimer = null;

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

const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];

// ==========================================
// 🛡️ จัดระเบียบ Event การคลิก ไม่ให้บั๊กทับซ้อนกัน
// ==========================================
const checkList = document.getElementById('yearDropdown');
if(checkList) {
    let anchor = checkList.getElementsByClassName('anchor')[0];
    if(anchor) {
        anchor.onclick = function(evt) {
            evt.stopPropagation(); 
            checkList.classList.toggle('visible');
        }
    }
}

document.addEventListener('click', function(event) {
    if (checkList && !checkList.contains(event.target)) {
        checkList.classList.remove('visible');
    }
    
    const pm = document.getElementById('projectModal');
    if (event.target === pm) {
        closeModal();
    }
});


function buildStaticSlicers() {
    for (const [id, options] of Object.entries(STRAT_MASTER_LISTS)) {
        const select = document.getElementById(id);
        if(select) options.forEach(opt => select.innerHTML += `<option value="${opt}">${opt}</option>`);
    }
    const modeSwitch = document.getElementById('modeSwitch');
    if(modeSwitch) {
        modeSwitch.addEventListener('change', (e) => { currentMode = e.target.checked ? 'budget' : 'count'; updateDashboard(); });
    }
}

function exclusiveFilter(targetId) {
    currentStratFilterId = targetId; 
    const slicerIds = ['filterNat', 'filterMaster', 'filterPlan13', 'filterNorth', 'filterProv'];
    slicerIds.forEach(id => { 
        let el = document.getElementById(id);
        if(el) el.value = "all"; 
    });
    applyFilters();
}

function clearAreaFilter() { chartFilterAreaType = "all"; applyFilters(); }

function clearMapFilter() {
    mapFilterDistrict = "all";
    mapFilterProject = "all";
    closeModal();
    applyFilters();
}

function setDistrictFilter(dName) {
    mapFilterDistrict = dName;
    mapFilterProject = "all"; 
    chartFilterAreaType = "all"; 
    if(map) map.closePopup();
    closeModal();
    applyFilters();
}

function setProjectFilter(projName) { 
    mapFilterProject = projName; 
    mapFilterDistrict = "all"; 
    chartFilterAreaType = "all"; 
    closeModal(); 
    applyFilters(); 
}

function resetMapView() {
    if(map) {
        map.setView([18.7883, 98.9853], 8);
        map.closePopup();
    }
}

function toggleProvincialTable() {
    const dd = document.getElementById('provincialDropdown');
    const bar = document.getElementById('provincialStatusBar');
    if(dd && bar) {
        if (dd.style.display === 'none' || dd.style.display === '') {
            dd.style.display = 'block';
            bar.classList.add('open');
        } else {
            dd.style.display = 'none';
            bar.classList.remove('open');
        }
    }
}

function toggleSummaryBreakdown(id) {
    const el = document.getElementById(id);
    if(el) el.style.display = (el.style.display === 'block') ? 'none' : 'block';
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
        let sortedYears = [...years].sort((a,b) => b-a); 
        let maxYear = sortedYears.length > 0 ? sortedYears[0] : null;

        if(yearBox) {
            sortedYears.forEach(y => {
                let isChecked = (y === maxYear) ? 'checked' : '';
                yearBox.innerHTML += `<li><input type="checkbox" class="year-cb" value="${y}" ${isChecked} onchange="handleYearChange()"> <span>ปีงบประมาณ ${y}</span></li>`;
            });
        }
        
        let checkAll = document.getElementById('checkAllYears');
        if(checkAll) checkAll.checked = false;

        filteredData = [...masterData];
        applyFilters(); 

        const loader = document.getElementById('loadingOverlay');
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }

    } catch (error) {
        let loader = document.getElementById('loadingOverlay');
        if(loader) {
            loader.innerHTML = `<h3 style="color:red; font-family:'Sarabun';">❌ เกิดข้อผิดพลาด</h3><p style="font-family:'Sarabun';">${error.message}</p><button onclick="location.reload()" style="padding:10px; margin-top:10px; font-family:'Sarabun';">ลองใหม่อีกครั้ง</button>`;
        } else {
            safeSetHTML('tableBody', `<tr><td colspan="4" style="color:red; text-align:center; padding: 30px;"><b>❌ เกิดข้อผิดพลาดในการโหลดข้อมูล</b><br>${error.message}</td></tr>`);
        }
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

function resetPageAndFilter() {
    currentPage = 1;
    applyFilters();
}

function updateYearDropdownLabel() {
    const selectedCbs = Array.from(document.querySelectorAll('.year-cb:checked'));
    const selectedYears = selectedCbs.map(cb => parseInt(cb.value)).sort((a,b) => a-b);
    
    if (selectedYears.length === 0) {
        safeSetHTML('yearDropdownText', "📅 กรุณาเลือกปีงบประมาณ");
    } else if (selectedYears.length === 1) {
        safeSetHTML('yearDropdownText', `📅 ปีงบประมาณ <b>${selectedYears[0]}</b>`);
    } else {
        let isContinuous = true;
        for (let i = 0; i < selectedYears.length - 1; i++) {
            if (selectedYears[i+1] !== selectedYears[i] + 1) {
                isContinuous = false;
                break;
            }
        }
        
        if (isContinuous) {
            safeSetHTML('yearDropdownText', `📅 ปีงบประมาณ <b>${selectedYears[0]} - ${selectedYears[selectedYears.length-1]}</b>`);
        } else {
            if (selectedYears.length > 3) {
                safeSetHTML('yearDropdownText', `📅 ปีงบประมาณ <b>${selectedYears[0]}...${selectedYears[selectedYears.length-1]}</b> (${selectedYears.length} ปี)`);
            } else {
                safeSetHTML('yearDropdownText', `📅 ปีงบประมาณ <b>${selectedYears.join(', ')}</b>`);
            }
        }
    }
}

function applyFilters() {
    let searchEl = document.getElementById('globalSearch');
    const searchTxt = searchEl ? searchEl.value.toLowerCase() : ""; 
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => String(cb.value)); 
    
    updateYearDropdownLabel();

    const btnResetMap = document.getElementById('btnResetMap');
    if (btnResetMap) {
        if (mapFilterDistrict !== "all" || mapFilterProject !== "all") {
            btnResetMap.style.display = "block";
        } else {
            btnResetMap.style.display = "none";
        }
    }

    const slicerIds = ['filterNat', 'filterMaster', 'filterPlan13', 'filterNorth', 'filterProv'];
    slicerIds.forEach(id => {
        let el = document.getElementById(id);
        if(el && el.value !== "all") currentStratFilterId = id;
    });

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

        const rowText = Object.values(row).map(v => String(v)).join(" ").toLowerCase();
        const matchSearch = searchTxt === "" || rowText.includes(searchTxt);
        const matchYear = selectedYears.length === 0 ? false : selectedYears.includes(String(row._year));
        
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
    let gs = document.getElementById('globalSearch'); if(gs) gs.value = "";
    let ts = document.getElementById('tableSearch'); if(ts) ts.value = "";
    
    let cbs = document.querySelectorAll('.year-cb');
    if(cbs.length > 0) {
        cbs.forEach(cb => cb.checked = false);
        cbs[0].checked = true; 
        let checkAll = document.getElementById('checkAllYears');
        if(checkAll) checkAll.checked = false;
    }
    
    document.querySelectorAll('.slicer').forEach(el => el.value = "all");
    mapFilterDistrict = "all";
    mapFilterProject = "all";
    chartFilterAreaType = "all";
    currentStratFilterId = 'filterProv'; 
    resetPageAndFilter();
}

function handleTableSearch() { currentPage = 1; renderTable(); }

function toggleSort(type) {
    if (type === 'year') {
        isYearDesc = !isYearDesc;
        safeSetText('btnSortYear', `📅 ปีงบประมาณ: ${isYearDesc ? '▼ ใหม่ ➜ เก่า' : '▲ เก่า ➜ ใหม่'}`);
    } else if (type === 'budget') {
        isBudgetDesc = !isBudgetDesc;
        safeSetText('btnSortBudget', `💰 งบประมาณ: ${isBudgetDesc ? '▼ มาก ➜ น้อย' : '▲ น้อย ➜ มาก'}`);
    }
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
    let tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    tbody.innerHTML = "";
    let ts = document.getElementById('tableSearch');
    const tableSearchTxt = ts ? ts.value.toLowerCase() : "";
    
    tableData = filteredData.filter(row => {
        if (tableSearchTxt === "") return true;
        return String(row["ชื่อโครงการ"] || "").toLowerCase().includes(tableSearchTxt);
    });

    tableData.sort((a, b) => {
        let yearA = parseInt(a._year) || 0;
        let yearB = parseInt(b._year) || 0;
        let budgetA = a._budgetNum;
        let budgetB = b._budgetNum;

        if (yearA !== yearB) return isYearDesc ? yearB - yearA : yearA - yearB; 

        if (mapFilterDistrict !== "all") {
            const typeOrder = { "Single": 1, "Multi": 2, "Provincial": 3, "ไม่ระบุ": 4 };
            let typeA = typeOrder[a._areaType] || 5;
            let typeB = typeOrder[b._areaType] || 5;
            if (typeA !== typeB) return typeA - typeB;
        }

        return isBudgetDesc ? budgetB - budgetA : budgetA - budgetB;
    });

    if(tableData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px;">ไม่พบข้อมูลโครงการที่ตรงกับเงื่อนไขการค้นหา</td></tr>`; 
        safeSetText('pageInfo', "แสดง 0 รายการ");
        let bp = document.getElementById('btnPrevPage'); if(bp) bp.disabled = true;
        let bn = document.getElementById('btnNextPage'); if(bn) bn.disabled = true;
        return;
    }

    let maxPage = Math.ceil(tableData.length / rowsPerPage);
    if (maxPage === 0) maxPage = 1;
    if (currentPage > maxPage) currentPage = maxPage;
    
    let startIdx = (currentPage - 1) * rowsPerPage;
    let endIdx = startIdx + rowsPerPage;
    let paginatedRows = tableData.slice(startIdx, endIdx);

    safeSetText('pageInfo', `แสดงรายการที่ ${startIdx + 1} - ${Math.min(endIdx, tableData.length)} จากทั้งหมด ${tableData.length} รายการ`);
    
    let bp = document.getElementById('btnPrevPage'); if(bp) bp.disabled = (currentPage === 1);
    let bn = document.getElementById('btnNextPage'); if(bn) bn.disabled = (currentPage === maxPage);

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

function updateDashboard() {
    safeSetText('sumProjects', filteredData.length.toLocaleString());
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);
    safeSetText('sumBudget', totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2}));

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
    
    safeSetHTML('projectBreakdown', Object.keys(yearStats).length > 0 ? projBreakdownHtml : 'ไม่มีข้อมูล');
    safeSetHTML('budgetBreakdown', Object.keys(yearStats).length > 0 ? budgetBreakdownHtml : 'ไม่มีข้อมูล');

    let provCount = 0; let provBudget = 0;
    filteredData.forEach(r => { if(r._areaType === "Provincial") { provCount++; provBudget += r._budgetNum; } });
    
    safeSetHTML('provincialStatusContent', `
        <div style="font-size:14px; font-weight:normal; margin-bottom:5px;">ส่วนประมวลผลโครงการระดับจังหวัด (ดำเนินการครอบคลุมทุกอำเภอ)</div>
        <div style="display:flex; gap:20px;">
            <span>📋 จำนวนโครงการรวม: <b>${provCount}</b> โครงการ</span> 
            <span>💰 งบประมาณรวม: <b>${provBudget.toLocaleString()}</b> บาท</span>
        </div>`);

    let activeStrat = stratMapping[currentStratFilterId];
    let filterEl = document.getElementById(currentStratFilterId);
    let selectedValue = filterEl ? filterEl.value : "all";
    
    safeSetText('strategyChartSubtitle', `(แสดงผลตามค่าเริ่มต้น: ${activeStrat.name})`);

    let mainStratStatus = `<span style="color:#1e3a8a;">ประเด็นยุทธศาสตร์ที่เลือก: <b>${activeStrat.name}</b></span>`;
    if(selectedValue !== "all") mainStratStatus += ` ➡️ <span style="color:#b45309;">${selectedValue}</span>`; 
    else mainStratStatus += ` ➡️ <span style="color:#b45309;">แสดงภาพรวมทุกประเด็น</span>`;

    let activeTexts = [];
    const selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value).sort();
    if(selectedYears.length > 0) activeTexts.push(`ปีงบประมาณ: ${selectedYears.join(', ')}`);
    const slicerIds = ['filterNat', 'filterMaster', 'filterPlan13', 'filterNorth', 'filterProv'];
    slicerIds.forEach(id => {
        let el = document.getElementById(id);
        if(el && el.value !== "all" && id !== currentStratFilterId) {
            activeTexts.push(`${stratMapping[id].name}: ${el.value}`);
        }
    });
    if(mapFilterDistrict !== "all") activeTexts.push(`อำเภอ: ${mapFilterDistrict}`);
    if(mapFilterProject !== "all") activeTexts.push(`โครงการเจาะจง`);
    if(chartFilterAreaType !== "all") activeTexts.push(`พื้นที่: ${chartFilterAreaType}`);
    
    let filterStr = activeTexts.length > 0 ? " | " + activeTexts.join(" | ") : "";
    safeSetHTML('activeFiltersText', `<div style="margin-bottom:6px;"><strong>🔍 สถานะการกรองข้อมูลปัจจุบัน:</strong> ${mainStratStatus}</div><div style="font-size:13px;"><strong>เงื่อนไขการกรองเพิ่มเติม:</strong> ${filterStr === "" ? "ไม่มี" : filterStr.substring(3)}</div>`);

    let isMultiYear = selectedYears.length > 1;
    let chartSelect = document.getElementById('chartTypeSelect');
    let overlay = document.getElementById('areaChartOverlay');

    if(isMultiYear) {
        if(chartSelect) { chartSelect.value = 'bar'; chartSelect.disabled = true; chartSelect.title = "หากเลือกหลายปีงบประมาณระบบแผนภูมิโดนัทจะไม่สามารถใช้ได้"; }
        if(overlay) overlay.style.display = 'flex'; 
    } else {
        if(chartSelect) { chartSelect.disabled = false; chartSelect.title = ""; }
        if(overlay) overlay.style.display = 'none';
    }

    renderProvincialTable(activeStrat, selectedValue, isMultiYear, selectedYears);
    renderCharts(isMultiYear, selectedYears);
    
    clearTimeout(renderMapTimer);
    renderMapTimer = setTimeout(() => renderMap(isMultiYear, selectedYears), 300); 
}

function renderProvincialTable(activeStrat, selectedValue, isMultiYear, selectedYears) {
    let provData = filteredData.filter(r => r._areaType === "Provincial");
    let stratStats = {}; 
    let globalJointSet = new Set();
    let globalJointBudget = 0;
    let yearJointSets = {}; 
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

    let headerHtml = `
        <span style="font-size:15px; color:#666;">ประเด็นยุทธศาสตร์ที่แสดงผล: <b style="color:#1e3a8a">${activeStrat.name}</b> 
        ➡️ <b style="color:#b45309">${selectedValue === "all" ? "แสดงภาพรวมทุกประเด็น" : selectedValue}</b></span>
    `;
    safeSetHTML('provincialTableHeader', headerHtml);

    let headHtml = `<tr style="background:#f1f5f9;"><th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:left; min-width: 250px;">ประเด็นยุทธศาสตร์ที่สอดคล้อง</th>`;
    if (isMultiYear) {
        headHtml += `<th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:center; min-width: 150px; background:#e0e7ff;">ภาพรวม (โครงการ)</th><th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:right; min-width: 150px; background:#e0e7ff;">งบรวม (เฉพาะเดี่ยว)</th>`;
        [...selectedYears].sort((a,b)=>b-a).forEach(y => {
            headHtml += `<th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:center; min-width: 120px; border-left: 2px solid #fff;">ปี ${y} (โครงการ)</th><th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:right; min-width: 120px;">ปี ${y} (งบประมาณ)</th>`;
        });
    } else {
        headHtml += `<th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:center; width:25%;">จำนวนโครงการ<br><small>เฉพาะประเด็นเดียว <span class="joint-stat">(+หลายประเด็น)</span></small></th><th style="border-bottom:2px solid #cbd5e1; padding:8px; text-align:right; width:30%;">งบประมาณ (บาท)<br><small>(เฉพาะโครงการประเด็นเดียว)</small></th>`;
    }
    headHtml += `</tr>`;
    safeSetHTML('provincialTableHead', headHtml);

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
                tbodyHtml += `<td style="text-align:center; padding:10px; background:#f8fafc;"><b>${st.total.sC}</b> ${tJointText}</td><td style="text-align:right; padding:10px; color:#059669; background:#f8fafc;"><b>${st.total.sB.toLocaleString()}</b></td>`;
                [...selectedYears].sort((a,b)=>b-a).forEach(y => {
                    let ySt = st.years[y];
                    let yJointText = ySt.jC > 0 ? `<span class="joint-stat">(+${ySt.jC})</span>` : '';
                    tbodyHtml += `<td style="text-align:center; padding:10px; border-left: 1px solid #f1f5f9;"><b>${ySt.sC}</b> ${yJointText}</td><td style="text-align:right; padding:10px; color:#059669;"><b>${ySt.sB.toLocaleString()}</b></td>`;
                });
            } else {
                tbodyHtml += `<td style="text-align:center; padding:10px;"><b>${st.total.sC}</b> ${tJointText}</td><td style="text-align:right; padding:10px; color:#059669;"><b>${st.total.sB.toLocaleString()}</b></td>`;
            }
            tbodyHtml += `</tr>`;
        });
    }
    safeSetHTML('provincialTableBody', tbodyHtml);

    let footHtml = `<tr class="footer-row"><td class="footer-label" style="text-align: right; padding-right: 15px;">สรุปรวมประเด็นที่ตอบสนองมากกว่า 1 เป้าหมาย</td>`;
    if (isMultiYear) {
        footHtml += `<td style="text-align:center; padding:12px; background:#fff7ed;"><b>${globalJointSet.size}</b></td><td style="text-align:right; padding:12px; background:#fff7ed;"><b>${globalJointBudget.toLocaleString()}</b></td>`;
        [...selectedYears].sort((a,b)=>b-a).forEach(y => {
            footHtml += `<td style="text-align:center; padding:12px; border-left: 2px solid #fff;"><b>${yearJointSets[y].size}</b></td><td style="text-align:right; padding:12px;"><b>${yearJointBudgets[y].toLocaleString()}</b></td>`;
        });
    } else {
        footHtml += `<td style="text-align:center; padding:12px;"><b>${globalJointSet.size}</b></td><td style="text-align:right; padding:12px;"><b>${globalJointBudget.toLocaleString()}</b></td>`;
    }
    footHtml += `</tr>`;
    safeSetHTML('provincialTableFooter', footHtml);
}

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
    if (!ctxMain) return; 
    
    if (myChart) myChart.destroy();
    let chartSelect = document.getElementById('chartTypeSelect');
    let chartType = chartSelect ? chartSelect.value : 'bar';
    
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
    let displayLabels = labels;
    
    const pieColors = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#0ea5e9', '#14b8a6', '#f43f5e', '#d946ef', '#a855f7', '#6366f1', '#84cc16', '#eab308', '#f97316', '#06b6d4', '#059669', '#dc2626', '#7c3aed', '#475569', '#9ca3af', '#cbd5e1', '#1e40af', '#047857', '#b91c1c'];

    if (chartType === 'bar') {
        let datasets = [];
        if (isMultiYear) {
            let yearColors = ['#1e3a8a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            [...selectedYears].sort((a,b)=>a-b).forEach((y, idx) => {
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
                        backgroundColor: yearColors[idx % yearColors.length] + '80',
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
                plugins: { tooltip: { mode: 'index', intersect: false, callbacks: { title: function(ctx) { return labels[ctx[0].dataIndex]; } } }, datalabels: { display: false } }
            }
        });
    } else {
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
                                if(currentMode === 'count') return ` ${k}: ${ctx.raw} โครงการ (${pct}%) | เดี่ยว: ${stratData[k]?.total.sC || 0}, ร่วม: ${stratData[k]?.total.jC || 0}`;
                                else return ` ${k}: ${ctx.raw.toLocaleString()} บาท (${pct}%)`;
                            }
                        }
                    },
                    datalabels: { color: '#fff', font: { weight: 'bold', size: 11 }, formatter: (value) => { let percentage = dataSum > 0 ? (value*100 / dataSum).toFixed(1) : 0; return percentage >= 5 ? percentage + "%" : ""; } }
                } 
            }
        });
    }

    const ctxArea = document.getElementById('areaChart');
    if (areaChart) {
        areaChart.destroy();
        areaChart = null;
    }

    if(!isMultiYear && ctxArea) {
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
                    datalabels: { color: '#fff', font: { weight: 'bold', size: 14 }, formatter: (value) => { let pct = aTotal > 0 ? (value*100 / aTotal).toFixed(1) : 0; return pct >= 5 ? pct + "%" : ""; } }
                },
                onClick: (e, elements) => {
                    if(elements.length > 0) {
                        chartFilterAreaType = aLabels[elements[0].index].split(" ")[0]; 
                        applyFilters();
                    }
                }
            }
        });
    }

    const ctxTrend = document.getElementById('trendChart');
    if(ctxTrend) {
        let yearCounts = {};
        let activeYears = (selectedYears && selectedYears.length > 0) ? [...selectedYears].sort((a,b)=>a-b) : Array.from(new Set(masterData.map(r=>r._year))).sort((a,b)=>a-b);
        activeYears.forEach(y => yearCounts[y] = 0); 
        
        filteredData.forEach(row => {
            if(yearCounts[row._year] !== undefined) yearCounts[row._year] += currentMode === 'budget' ? row._budgetNum : 1;
        });
        
        let trendData = activeYears.map(y => yearCounts[y]);

        if (trendChart) trendChart.destroy();
        trendChart = new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: activeYears,
                datasets: [
                    { type: 'bar', label: 'ปริมาณ', data: trendData, backgroundColor: '#cbd5e1', order: 2 }, 
                    { type: 'line', label: 'แนวโน้ม', data: trendData, borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.3, order: 1 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false } } }
        });
    }
}

// 🌟 Heat Map ฟังก์ชันที่อัปเกรดให้ใช้ระบบ Percentile 8 เฉดสี ตามหลักการหน้า Simple (ไม่มีการแก้ส่วนอื่น)
function renderMap(isMultiYear, selectedYears) {
    let mapModeSelect = document.getElementById('mapModeSelect');
    let mapMode = mapModeSelect ? mapModeSelect.value : 'overview';

    if (!map) {
        let mapEl = document.getElementById('map');
        if(!mapEl) return;
        
        map = L.map('map', {scrollWheelZoom: false, preferCanvas: true, closePopupOnClick: true}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
        map.on('click', function() { map.closePopup(); });
    }

    if (!selectedYears || selectedYears.length === 0) {
        selectedYears = Array.from(document.querySelectorAll('.year-cb:checked')).map(cb => cb.value).sort((a,b)=>a-b);
        isMultiYear = selectedYears.length > 1;
    }
    
    let activeYears = [...selectedYears].sort((a,b)=>a-b);
    if (activeYears.length === 0) {
        if(geojsonLayer) map.removeLayer(geojsonLayer);
        return; 
    }

    let districtStats = {};
    dNames.forEach(d => {
        districtStats[d] = { 
            total: { singleC: 0, singleB: 0, multiC: 0, multiB: 0, provC: 0, totalProjects: 0, stratCounts: {}, matrix: { s_s:0, s_j:0, m_s:0, m_j:0 } },
            years: {} 
        };
        activeYears.forEach(y => {
            districtStats[d].years[y] = { 
                singleC: 0, singleB: 0, multiC: 0, multiB: 0, provC: 0, totalProjects: 0, stratCounts: {}, matrix: { s_s:0, s_j:0, m_s:0, m_j:0 } 
            };
        });
    });

    let targetDistricts = [];
    if (mapFilterProject !== "all") {
        let projRow = masterData.find(r => r["ชื่อโครงการ"] === mapFilterProject);
        if (projRow) {
            let a = projRow._cleanArea;
            if (a.includes("ครอบคลุมทั้งจังหวัด") || a === "ทั้งจังหวัด") targetDistricts = dNames;
            else targetDistricts = dNames.filter(d => a.includes(d));
        }
    }

    let activeStratKey = stratMapping[currentStratFilterId].key;
    let filterEl = document.getElementById(currentStratFilterId);
    let selectedStratValue = filterEl ? filterEl.value : "all";
    let isSpecificStrat = selectedStratValue !== "all";

    let overallProjects = {};
    dNames.forEach(d => overallProjects[d] = 0);
    masterData.forEach(row => {
        if (activeYears.includes(String(row._year))) {
            let aType = row._areaType;
            if (aType === "Single" || aType === "Multi") {
                dNames.filter(d => row._cleanArea.includes(d)).forEach(d => { overallProjects[d] += 1; });
            }
        }
    });

    filteredData.forEach(row => {
        if (!activeYears.includes(String(row._year))) return;

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
                if (areaType === "Single") { districtStats[d].total.singleC += 1; districtStats[d].total.singleB += row._budgetNum; }
                if (areaType === "Multi") { districtStats[d].total.multiC += 1; districtStats[d].total.multiB += row._budgetNum; }
                districtStats[d].total.totalProjects += 1;
                strats.forEach(s => { districtStats[d].total.stratCounts[s] = (districtStats[d].total.stratCounts[s] || 0) + 1; });

                if (areaType === "Single" && isSingleStrat) districtStats[d].total.matrix.s_s++;
                else if (areaType === "Single" && !isSingleStrat) districtStats[d].total.matrix.s_j++;
                else if (areaType === "Multi" && isSingleStrat) districtStats[d].total.matrix.m_s++;
                else if (areaType === "Multi" && !isSingleStrat) districtStats[d].total.matrix.m_j++;

                if(districtStats[d].years[rYear]) {
                    let ySt = districtStats[d].years[rYear];
                    if (areaType === "Single") { ySt.singleC += 1; ySt.singleB += row._budgetNum; }
                    if (areaType === "Multi") { ySt.multiC += 1; ySt.multiB += row._budgetNum; }
                    ySt.totalProjects += 1;
                    strats.forEach(s => { ySt.stratCounts[s] = (ySt.stratCounts[s] || 0) + 1; }); 

                    if (areaType === "Single" && isSingleStrat) ySt.matrix.s_s++;
                    else if (areaType === "Single" && !isSingleStrat) ySt.matrix.s_j++;
                    else if (areaType === "Multi" && isSingleStrat) ySt.matrix.m_s++;
                    else if (areaType === "Multi" && !isSingleStrat) ySt.matrix.m_j++;
                }
            });
        } else if (areaType === "Provincial") {
            dNames.forEach(d => { 
                districtStats[d].total.provC += 1; 
                if(districtStats[d].years[rYear]) districtStats[d].years[rYear].provC += 1;
            });
        }
    });

    // 🌟 หาสูงสุดและ Percentile เพื่อใช้เป็นเกณฑ์อิงกลุ่ม 
    let validVals = dNames.map(d => {
        let s = districtStats[d].total;
        if (mapMode === 'overview') {
            return currentMode === 'budget' ? s.singleB : (s.singleC + s.multiC);
        } else {
            return s.totalProjects;
        }
    }).filter(v => v > 0).sort((a,b) => a - b);

    let q80 = getPercentile(validVals, 0.8);
    let q60 = getPercentile(validVals, 0.6);
    let q40 = getPercentile(validVals, 0.4);
    let q20 = getPercentile(validVals, 0.2);
    
    let uniqueDesc = [...new Set(validVals)].sort((a,b) => b - a);
    let max1 = uniqueDesc.length > 0 ? uniqueDesc[0] : 0;
    let max2 = uniqueDesc.length > 1 ? uniqueDesc[1] : 0;
    let max3 = uniqueDesc.length > 2 ? uniqueDesc[2] : 0;

    if (!districtGeoJSON) return;
    if(geojsonLayer) map.removeLayer(geojsonLayer);

    geojsonLayer = L.geoJSON(districtGeoJSON, {
        style: function (f) {
            let dName = f.properties.amp_th || f.properties.AMP_TH || "ไม่ระบุ";
            if (mapFilterProject !== "all") {
                if (targetDistricts.includes(dName)) return { fillColor: '#ef4444', weight: 2, opacity: 1, color: '#b91c1c', fillOpacity: 0.8 };
                else return { fillColor: '#e5e7eb', weight: 1, opacity: 0.5, color: '#fff', fillOpacity: 0.3 };
            }
            
            let s = districtStats[dName]?.total || {singleC: 0, singleB: 0, multiC: 0, multiB: 0, totalProjects: 0};
            let val = mapMode === 'overview' ? (currentMode === 'budget' ? s.singleB : (s.singleC + s.multiC)) : s.totalProjects;
            
            let color = '#f1f5f9';
            let borderColor = '#9ca3af';
            let weight = 1;
            
            if (val === 0) {
                color = '#f1f5f9'; // สีฐาน 0
            } else {
                borderColor = '#fff';
                if (val === max1 && max1 > 0) {
                    color = currentMode === 'budget' ? '#022c22' : '#0f172a'; // Top 1 
                    weight = 2;
                } else if (val === max2 && max2 > 0) {
                    color = currentMode === 'budget' ? '#064e3b' : '#172554'; // Top 2
                } else if (val === max3 && max3 > 0) {
                    color = currentMode === 'budget' ? '#047857' : '#1e3a8a'; // Top 3
                } else if (currentMode === 'budget') {
                    // โทนสีเขียวมรกต
                    if (val >= q80) color = '#059669'; 
                    else if (val >= q60) color = '#10b981'; 
                    else if (val >= q40) color = '#34d399'; 
                    else if (val >= q20) color = '#6ee7b7';  
                    else color = '#a7f3d0';
                } else {
                    // โทนสีน้ำเงิน
                    if (val >= q80) color = '#2563eb';
                    else if (val >= q60) color = '#3b82f6';
                    else if (val >= q40) color = '#60a5fa';
                    else if (val >= q20) color = '#93c5fd';
                    else color = '#bfdbfe';
                }
            }

            let dim = false;
            if (mapFilterDistrict !== "all" && mapFilterDistrict !== dName) {
                dim = true;
            }

            if (dim) return { fillColor: '#f1f5f9', weight: 1, opacity: 0.5, color: '#cbd5e1', fillOpacity: 0.4 };
            return { fillColor: color, weight: weight, opacity: 1, color: borderColor, fillOpacity: 0.85 };
        },
        onEachFeature: function (f, l) {
            let dName = f.properties.amp_th || f.properties.AMP_TH || "ไม่ระบุ";
            
            l.on('click', function(e) {
                let dt = districtStats[dName];
                let s = dt.total;
                
                let popupHtml = `<div style="font-family:'Sarabun'; width: 320px; max-height: 380px; overflow-y: auto; overflow-x: hidden;">
                                 <b style="font-size:16px; color:#1e3a8a;">📍 ข้อมูลอำเภอ${dName}</b>`;
                
                if(isMultiYear) {
                    popupHtml += `<div style="font-size:12px; color:#f97316; font-weight:bold; margin-top:2px;">(สรุปรวมปีงบประมาณ ${activeYears.join(', ')})</div><hr style="margin:5px 0;">`;
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
                        popupHtml += `<ul style="margin:2px 0 5px 0; padding-left:15px; font-size:11.5px; color:#475569;">`;
                        activeYears.forEach(y => {
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
                        popupHtml += `<ul style="margin:2px 0 5px 0; padding-left:15px; font-size:11.5px; color:#475569;">`;
                        activeYears.forEach(y => {
                            popupHtml += `<li>ปี ${y}: ${dt.years[y].multiC} โครงการ (${dt.years[y].multiB.toLocaleString()} บ.)</li>`;
                        });
                        popupHtml += `</ul>`;
                    }

                    popupHtml += `<span style="color:#ef4444; font-size:11px;">(งบส่วนนี้เป็นยอดรวม ไม่ถูกนำมาหารและระบายสีในแผนที่)</span><br>
                            <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                            <b style="color:#ef4444;">🌐 ครอบคลุมทั้งจังหวัด (Provincial)</b><br>
                            รวมที่ครอบคลุมถึง: <b>${s.provC}</b> โครงการ<br>
                    `;
                    if(isMultiYear) {
                        popupHtml += `<ul style="margin:2px 0 5px 0; padding-left:15px; font-size:11.5px; color:#475569;">`;
                        activeYears.forEach(y => {
                            popupHtml += `<li>ปี ${y}: ${dt.years[y].provC} โครงการ</li>`;
                        });
                        popupHtml += `</ul>`;
                    }
                    popupHtml += `<span style="color:#ef4444; font-size:11px;">(ไม่นำมาคำนวณความเข้มข้นในแผนที่)</span></div>`;
                } else {
                    let stratNameLabel = stratMapping[currentStratFilterId].name;

                    if (isSpecificStrat) {
                        popupHtml += `
                            <div style="font-size:13px; line-height: 1.4;">
                                <div style="margin-bottom:8px; color:#666;">โครงการฐานที่ลงในอำเภอนี้ (ปีที่เลือก): <b>${overallProjects[dName]}</b> โครงการ</div>
                                <b>รวมสอดคล้องประเด็นยุทธศาสตร์ที่เลือก: <span style="color:#ef4444; font-size:15px;">${s.totalProjects}</span> โครงการ</b><br>
                                <span style="color:#666; font-size:11px;">(จำแนกตาม 4 ลักษณะพื้นที่และยุทธศาสตร์)</span><br><br>
                                <b style="color:#059669;">1. เดี่ยว (พื้นที่) + เดี่ยว (ประเด็น):</b> ${s.matrix.s_s}<br>
                                <b style="color:#d97706;">2. เดี่ยว (พื้นที่) + ร่วม (ประเด็น):</b> ${s.matrix.s_j}<br>
                                <b style="color:#2563eb;">3. ร่วม (พื้นที่) + เดี่ยว (ประเด็น):</b> ${s.matrix.m_s}<br>
                                <b style="color:#7c3aed;">4. ร่วม (พื้นที่) + ร่วม (ประเด็น):</b> ${s.matrix.m_j}
                        `;
                        
                        if(isMultiYear) {
                            popupHtml += `<hr style="margin:5px 0;"><div style="font-size:12px; color:#475569;">`;
                            activeYears.forEach(y => {
                                let yM = dt.years[y].matrix;
                                popupHtml += `<b style="color:#1e3a8a">ปี ${y}:</b> รวม ${dt.years[y].totalProjects} โครงการ<br>
                                    <div style="padding-left:10px; font-size:11px; margin-bottom:4px; line-height: 1.3;">
                                        - <span style="color:#059669">เดี่ยว+เดี่ยว:</span> ${yM.s_s} | <span style="color:#d97706">เดี่ยว+ร่วม:</span> ${yM.s_j}<br>
                                        - <span style="color:#2563eb">ร่วม+เดี่ยว:</span> ${yM.m_s} | <span style="color:#7c3aed">ร่วม+ร่วม:</span> ${yM.m_j}
                                    </div>`;
                            });
                            popupHtml += `</div>`;
                        }
                        popupHtml += `</div>`;
                    } else {
                        let sortedStrats = Object.entries(s.stratCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
                        let top3Html = "";
                        
                        sortedStrats.forEach((st, i) => {
                            let sName = st[0];
                            let sCount = st[1];
                            top3Html += `<b>${i+1}. ${sName}</b> <span style="color:#ef4444">(${sCount})</span><br>`;
                            
                            if(isMultiYear) {
                                top3Html += `<div style="padding-left:15px; font-size:10.5px; color:#64748b; margin-bottom:4px; line-height:1.2;">`;
                                activeYears.forEach(y => {
                                    let countInYear = dt.years[y].stratCounts[sName] || 0;
                                    if(countInYear > 0) top3Html += `- ปี ${y}: ${countInYear} โครงการ<br>`;
                                });
                                top3Html += `</div>`;
                            }
                        });

                        popupHtml += `
                            <div style="font-size:13px; line-height: 1.4;">
                                <div style="margin-bottom:8px; color:#666;">โครงการฐานที่ลงในอำเภอนี้ (ปีที่เลือก): <b>${overallProjects[dName]}</b> โครงการ</div>
                                <b>รวมโครงการที่สอดคล้องตามเงื่อนไข: <span style="color:#ef4444; font-size:15px;">${s.totalProjects}</span> โครงการ</b><br>
                                <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                                <b style="color:#1e3a8a;">🧬 3 ลำดับ ${stratNameLabel} สูงสุด:</b><br>
                                <div style="margin-top:5px;">${top3Html || '<span style="color:gray">- ไม่มีข้อมูล -</span>'}</div>
                            </div>
                        `;
                    }
                }

                popupHtml += `<button type="button" onclick="setDistrictFilter('${dName}')" style="margin-top:10px; width:100%; padding:6px; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer; position:sticky; bottom:-5px; z-index:100;">🔍 กรองข้อมูลเฉพาะอำเภอนี้</button></div>`;
                
                l.bindPopup(popupHtml);
            });
            
            l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
            l.on('mouseout', e => geojsonLayer.resetStyle(e.target));
        }
    }).addTo(map);
    if(mapFilterProject !== "all" && targetDistricts.length > 0) map.fitBounds(geojsonLayer.getBounds());
}

function formatList(str) {
    if (!str || str === "NaN" || str === "-" || str.trim() === "") return "<span style='color:gray'>- ไม่ระบุข้อมูล -</span>";
    return str.split(',').map(s => s.trim()).join('<br>');
}

function openModal(idx) {
    const row = masterData[idx]; 
    safeSetText('modalTitle', row["ชื่อโครงการ"] || "-");
    safeSetHTML('modalArea', row._areaList.join(", "));
    
    let budgetDisplay = row._budgetNum.toLocaleString() + " บาท";
    if (row._budgetText) budgetDisplay += `<br><small style="color:#666; font-weight:normal;">(${row._budgetText})</small>`;
    safeSetHTML('modalBudget', budgetDisplay);
    
    safeSetText('modalYear', row._year);
    
    let aType = row._areaType;
    let aLabel = aType === 'Single' ? " (ดำเนินการเฉพาะพื้นที่)" : aType === 'Multi' ? " (ดำเนินการหลายพื้นที่)" : aType === 'Provincial' ? " (ดำเนินการครอบคลุมทั้งจังหวัด)" : " (ไม่ได้ระบุข้อมูลพื้นที่)";
    safeSetText('modalAreaType', aType + aLabel);
    
    safeSetText('modalAgency', row["หน่วยงานรับผิดชอบ"] || "- ไม่ระบุข้อมูล -");

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
    safeSetHTML('modalStrategyTable', strategyTableHTML);

    const rawSub = String(row["รายละเอียดย่อย"] || "");
    const cleanSub = rawSub.replace(/\r\n/g, "<br>").replace(/\n/g, "<br>").trim();
    safeSetHTML('modalSubActivities', (!cleanSub || cleanSub === "undefined" || cleanSub === "NaN") ? "<p style='color:gray;'>- ไม่พบข้อมูลรายละเอียด -</p>" : `<div class="sub-activity-box">${cleanSub}</div>`);
    
    safeSetHTML('modalFilterBtnContainer', `<button class="btn-filter-project" onclick="setProjectFilter(\`${row["ชื่อโครงการ"]}\`)">📍 ตรวจสอบพื้นที่ดำเนินการบนแผนที่</button>`);
    
    let pm = document.getElementById('projectModal');
    if(pm) pm.style.display = "block";
}

function closeModal() { 
    let pm = document.getElementById('projectModal');
    if(pm) pm.style.display = "none"; 
}

// 🌟 เรียกใช้งานระบบเมื่อโหลดไฟล์เสร็จ
document.addEventListener("DOMContentLoaded", () => {
    init();
});
