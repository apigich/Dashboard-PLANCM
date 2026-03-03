// 🚨 เปลี่ยน API ของคุณที่นี่
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

const safeSetText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
const safeSetHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

let masterData = [];   
let filteredData = []; 
let currentStratLevel = 4; 
let currentMode = 'count'; 
let activeSubStrategy = "all"; 
let isProvincialOnly = false; 
let currentTableTab = 'year'; 
let bottomChartMode = 'trend'; 

const stratKeys = ["ยุทธศาสตร์ชาติ 20 ปี", "แผนแม่บทภายใต้ยุทธศาสตร์ชาติ", "แผนพัฒนาฯ ฉบับที่ 13", "แผนพัฒนาภาคเหนือ", "ประเด็นการพัฒนาจังหวัด"];
const stratNames = ["ยุทธศาสตร์ชาติ", "แผนแม่บท", "แผนพัฒนาฯ 13", "แผนภาคเหนือ", "แผนพัฒนาจังหวัด (2566-2570)"];

const STRAT_MASTER_LISTS = {
    0: ["ด้าน 1 ความมั่นคง", "ด้าน 2 การสร้างความสามารถในการแข่งขัน", "ด้าน 3 การพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์", "ด้าน 4 การสร้างโอกาสและความเสมอภาคทางสังคม", "ด้าน 5 การสร้างการเติบโตบนคุณภาพชีวิตที่เป็นมิตรกับสิ่งแวดล้อม", "ด้าน 6 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ"],
    1: ["ประเด็นที่ 1 ความมั่นคง", "ประเด็นที่ 2 การต่างประเทศ", "ประเด็นที่ 3 การเกษตร", "ประเด็นที่ 4 อุตสาหกรรมและบริการแห่งอนาคต", "ประเด็นที่ 5 การท่องเที่ยว", "ประเด็นที่ 6 พื้นที่และเมืองน่าอยู่อัจฉริยะ", "ประเด็นที่ 7 โครงสร้างพื้นฐาน ระบบโลจิสติกส์ และดิจิทัล", "ประเด็นที่ 8 ผู้ประกอบการและวิสาหกิจขนาดกลางและขนาดย่อมยุคใหม่", "ประเด็นที่ 9 เขตเศรษฐกิจพิเศษ", "ประเด็นที่ 10 การปรับเปลี่ยนค่านิยมและวัฒนธรรม", "ประเด็นที่ 11 ศักยภาพคนตลอดช่วงชีวิต", "ประเด็นที่ 12 การพัฒนาการเรียนรู้", "ประเด็นที่ 13 การเสริมสร้างให้คนไทยมีสุขภาวะที่ดี", "ประเด็นที่ 14 ศักยภาพการกีฬา", "ประเด็นที่ 15 พลังทางสังคม", "ประเด็นที่ 16 เศรษฐกิจฐานราก", "ประเด็นที่ 17 ความเสมอภาคและหลักประกันทางสังคม", "ประเด็นที่ 18 การเติบโตอย่างยั่งยืน", "ประเด็นที่ 19 การบริหารจัดการน้ำทั้งระบบ", "ประเด็นที่ 20 การบริการประชาชนและประสิทธิภาพภาครัฐ", "ประเด็นที่ 21 การต่อต้านการทุจริตและประพฤติมิชอบ", "ประเด็นที่ 22 กฎหมายและกระบวนการยุติธรรม", "ประเด็นที่ 23 การวิจัยและพัฒนานวัตกรรม"],
    2: ["หมุดหมายที่ 1 ไทยเป็นประเทศชั้นนำด้านสินค้าเกษตรและเกษตรแปรรูปมูลค่าสูง", "หมุดหมายที่ 2 ไทยเป็นจุดหมายของการท่องเที่ยวที่เน้นคุณภาพและความยั่งยืน", "หมุดหมายที่ 3 ไทยเป็นฐานการผลิตยานยนต์ไฟฟ้าที่สำคัญของโลก", "หมุดหมายที่ 4 ไทยเป็นศูนย์กลางทางการแพทย์และสุขภาพมูลค่าสูง", "หมุดหมายที่ 5 ไทยเป็นประตูการค้าการลงทุนและยุทธศาสตร์ทางโลจิสติกส์ที่สำคัญของภูมิภาค", "หมุดหมายที่ 6 ไทยเป็นศูนย์กลางอุตสาหกรรมอิเล็กทรอนิกส์อัจฉริยะและอุตสาหกรรมดิจิทัลของอาเซียน", "หมุดหมายที่ 7 ไทยมีวิสาหกิจขนาดกลางและขนาดย่อมที่เข้มแข็ง มีศักยภาพสูง และสามารถแข่งขันได้", "หมุดหมายที่ 8 ไทยมีพื้นที่และเมืองอัจฉริยะที่น่าอยู่ ปลอดภัย เติบโตได้อย่างยั่งยืน", "หมุดหมายที่ 9 ไทยมีความยากจนข้ามรุ่นลดลง และมีความคุ้มครองทางสังคมที่เพียงพอ เหมาะสม", "หมุดหมายที่ 10 ไทยมีเศรษฐกิจหมุนเวียนและสังคมคาร์บอนต่ำ", "หมุดหมายที่ 11 ไทยสามารถลดความเสี่ยงและผลกระทบจากภัยธรรมชาติและการเปลี่ยนแปลงสภาพภูมิอากาศ", "หมุดหมายที่ 12 ไทยมีกำลังคนสมรรถนะสูง มุ่งเรียนรู้อย่างต่อเนื่อง ตอบโจทย์การพัฒนาแห่งอนาคต", "หมุดหมายที่ 13 ไทยมีภาครัฐที่ทันสมัย มีประสิทธิภาพ และตอบโจทย์ประชาชน"],
    3: ["ประเด็นการพัฒนาที่ 1 การพัฒนาเศรษฐกิจท่องเที่ยวและการค้าในพื้นที่", "ประเด็นการพัฒนาที่ 2 การพัฒนาเศรษฐกิจมูลค่าสูงด้วยการส่งออกสินค้าและบริการนอกพื้นที่", "ประเด็นการพัฒนาที่ 3 การพัฒนาเศรษฐกิจเกษตรสร้างสรรค์", "ประเด็นการพัฒนาที่ 4 การพัฒนาเศรษฐกิจสิ่งแวดล้อมเพื่อลดฝุ่นควัน"],
    4: ["ประเด็นการพัฒนาที่ 1 การส่งเสริมอุตสาหกรรมท่องเที่ยวเน้นคุณค่า สร้างสรรค์บนอัตลักษณ์ล้านนา และอุตสาหกรรมไมซ์", "ประเด็นการพัฒนาที่ 2 การขับเคลื่อนเกษตรเพิ่มมูลค่า และเกษตรแปรรูปมูลค่าสูง", "ประเด็นการพัฒนาที่ 3 การยกระดับการค้าการลงทุนบนฐานเศรษฐกิจสร้างสรรค์ (Creative Economy) นวัตกรรม (Innovation) และการพัฒนาอย่างยั่งยืน (SDGs)", "ประเด็นการพัฒนาที่ 4 การจัดการเชิงรุกในปัญหาฝุ่นควัน (PM 2.5) และการรักษาทรัพยากรธรรมชาติและสิ่งแวดล้อมแบบมีส่วนร่วม", "ประเด็นการพัฒนาที่ 5 การเสริมสร้างสังคมแห่งโอกาสและเป็นธรรม เมืองน่าอยู่ มีความปลอดภัย เพื่อคุณภาพชีวิตที่ดีของประชาชน"]
};

// ชุดสี 25 สี 
const baseChartColors = [
    '#1e3a8a', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#0ea5e9', '#ec4899', '#14b8a6', '#f97316', '#d946ef', 
    '#6366f1', '#84cc16', '#64748b', '#06b6d4', '#eab308', 
    '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', 
    '#0284c7', '#db2777', '#0d9488', '#ea580c', '#c026d3'  
];
function getStratColor(stratName, masterList) {
    if (stratName === 'ไม่ระบุ') return '#9ca3af';
    let idx = masterList.indexOf(stratName);
    if (idx === -1) return '#cbd5e1'; 
    return baseChartColors[idx % baseChartColors.length];
}

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

const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];

let map, geoLayer, donut, trendChartInstance, enlargeChartInstance, districtGeo;

function toggleDropdown() { 
    let el = document.getElementById('distList');
    if (el) el.classList.toggle('show'); 
}

document.addEventListener('click', function(event) {
    const checkList = document.getElementById('distDropdown');
    if (checkList && !checkList.contains(event.target)) {
        document.querySelectorAll('.dropdown-content').forEach(el => el.classList.remove('show'));
    }
    const m1 = document.getElementById('stratModal');
    const m2 = document.getElementById('districtModal');
    const m3 = document.getElementById('enlargeModal');
    const m4 = document.getElementById('welcomeModal');
    if (event.target === m1) closeStratModal();
    if (event.target === m2) closeDistrictModal();
    if (event.target === m3) closeEnlargeModal();
    if (event.target === m4) m4.style.display = 'none';
});

function setAppMode(mode) {
    if (currentMode === mode) return; 
    currentMode = mode;
    
    let btnC = document.getElementById('cardCountToggle');
    let btnB = document.getElementById('cardBudgetToggle');
    if(btnC) btnC.classList.remove('active');
    if(btnB) btnB.classList.remove('active');
    
    if (mode === 'count') {
        if(btnC) btnC.classList.add('active');
    } else {
        if(btnB) btnB.classList.add('active');
    }
    
    updateDashboard(); 
}

function setBottomChartMode(mode) {
    bottomChartMode = mode;
    let btnTrend = document.getElementById('btnBottomTrend');
    let btnDist = document.getElementById('btnBottomDist');
    
    if (mode === 'trend') {
        if(btnTrend) { btnTrend.style.background = '#fff'; btnTrend.style.color = '#1e3a8a'; btnTrend.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)'; }
        if(btnDist) { btnDist.style.background = 'transparent'; btnDist.style.color = '#64748b'; btnDist.style.boxShadow = 'none'; }
    } else {
        if(btnDist) { btnDist.style.background = '#fff'; btnDist.style.color = '#1e3a8a'; btnDist.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)'; }
        if(btnTrend) { btnTrend.style.background = 'transparent'; btnTrend.style.color = '#64748b'; btnTrend.style.boxShadow = 'none'; }
    }
    
    const sYears = Array.from(document.querySelectorAll('.y-cb:checked')).map(el => String(el.value)).sort((a,b)=>a-b); 
    renderBottomChart(sYears);
}

function setTableTab(tabId) {
    currentTableTab = tabId;
    let tabY = document.getElementById('tabYear');
    let tabD = document.getElementById('tabDistrict');
    if(tabY) tabY.classList.remove('active');
    if(tabD) tabD.classList.remove('active');
    
    if (tabId === 'year') { if(tabY) tabY.classList.add('active'); }
    else { if(tabD) tabD.classList.add('active'); }
    
    const sYears = Array.from(document.querySelectorAll('.y-cb:checked')).map(el => String(el.value)).sort((a,b)=>a-b); 
    renderTable(sYears);
}

function toggleProvincialOnly() {
    isProvincialOnly = !isProvincialOnly;
    let btn = document.getElementById('btnToggleProvincial');
    
    if (isProvincialOnly) {
        if(btn) btn.classList.add('active');
        document.querySelectorAll('.dist-cb').forEach(el => el.checked = false);
        let chkAll = document.getElementById('checkAllDistricts');
        if(chkAll) chkAll.checked = false;
        safeSetHTML('dropdown-btn', '📍 ทุกอำเภอ (ค่าเริ่มต้น) <span>▼</span>');
    } else {
        if(btn) btn.classList.remove('active');
    }
    updateDashboard();
}

function handleDistrictChange() {
    isProvincialOnly = false;
    let btnProv = document.getElementById('btnToggleProvincial');
    if(btnProv) btnProv.classList.remove('active');

    let checked = document.querySelectorAll('.dist-cb:checked');
    let btn = document.querySelector('.dropdown-btn');
    if(btn) {
        if (checked.length === 0) {
            btn.innerHTML = '📍 ทุกอำเภอ (ค่าเริ่มต้น) <span>▼</span>';
        } else {
            btn.innerHTML = `📍 เลือกกรอง ${checked.length} อำเภอ <span>▼</span>`;
        }
    }
    updateDashboard();
}

function toggleAllDistricts(cb) {
    document.querySelectorAll('.dist-cb').forEach(el => el.checked = cb.checked);
    handleDistrictChange();
}

document.addEventListener("DOMContentLoaded", () => {
    Chart.register(ChartDataLabels); 
    let dContainer = document.getElementById('distList');
    if(dContainer) {
        dNames.forEach(d => { dContainer.innerHTML += `<label><input type="checkbox" class="dist-cb" value="${d}" onchange="handleDistrictChange()"> อ.${d}</label>`; });
    }
    init();
});

async function init() {
    try {
        safeSetText('loadingText', "กำลังดึงข้อมูลแผนที่...");
        try { 
            let mapRes = await fetch("districts.json"); 
            if(mapRes.ok) districtGeo = await mapRes.json();
        } catch(e) { console.warn("Map not found"); }

        safeSetText('loadingText', "กำลังเชื่อมต่อฐานข้อมูลโครงการ...");
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("API Connection Failed");
        const data = await res.json();
        
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
        if(yBox) {
            [...years].sort((a,b)=>b-a).forEach((yr, i) => {
                yBox.innerHTML += `<li><label><input type="checkbox" class="y-cb" value="${yr}" checked onchange="handleYearChange()"> ปีงบประมาณ ${yr}</label></li>`;
            });
        }
        let chkAll = document.getElementById('checkAllYears');
        if(chkAll) chkAll.checked = true;

        updateDashboard();
        
        let loader = document.getElementById('loadingOverlay');
        if(loader) {
            setTimeout(() => { 
                loader.style.display = 'none'; 
                // 🌟 แสดง Welcome Modal เมื่อโหลดข้อมูลเสร็จสมบูรณ์
                let welcome = document.getElementById('welcomeModal');
                if (welcome) welcome.style.display = 'flex';
            }, 300);
        }

    } catch (error) {
        let loader = document.getElementById('loadingOverlay');
        if(loader) {
            loader.innerHTML = `<h3 style="color:red; font-family:'Sarabun';">❌ โหลดข้อมูลไม่สำเร็จ</h3><p style="font-size:12px; color:#475569;">${error.message}</p><button onclick="location.reload()" style="margin-top:10px; padding:5px 10px;">ลองใหม่</button>`;
        }
    }
}

function setStrat(idx) {
    currentStratLevel = idx;
    clearSubStratFilter(); 
    document.querySelectorAll('.strat-btn').forEach((btn, i) => { btn.classList.toggle('active', i === idx); });
}

function clearSubStratFilter() {
    activeSubStrategy = "all";
    let rstBtn = document.getElementById('btnResetDonut');
    if(rstBtn) rstBtn.style.display = 'none';
    updateDashboard();
}

function toggleAllYears(cb) {
    document.querySelectorAll('.y-cb').forEach(el => el.checked = cb.checked);
    updateDashboard();
}

function handleYearChange() {
    let allChecked = document.querySelectorAll('.y-cb:checked').length === document.querySelectorAll('.y-cb').length;
    let chkAll = document.getElementById('checkAllYears');
    if(chkAll) chkAll.checked = allChecked;
    updateDashboard();
}

function clearAllFilters() {
    isProvincialOnly = false;
    let btnProv = document.getElementById('btnToggleProvincial');
    if(btnProv) btnProv.classList.remove('active');
    
    let chkAllDist = document.getElementById('checkAllDistricts');
    if(chkAllDist) chkAllDist.checked = false;
    document.querySelectorAll('.dist-cb').forEach(el => el.checked = false);
    
    let dropBtn = document.querySelector('.dropdown-btn');
    if(dropBtn) dropBtn.innerHTML = '📍 ทุกอำเภอ (ค่าเริ่มต้น) <span>▼</span>';
    
    document.querySelectorAll('.y-cb').forEach(el => el.checked = true);
    let chkAllY = document.getElementById('checkAllYears');
    if(chkAllY) chkAllY.checked = true;
    
    setStrat(4); 
    if(map) map.closePopup();
    updateDashboard();
}

function clearMapFilterOnly() {
    isProvincialOnly = false;
    let btnProv = document.getElementById('btnToggleProvincial');
    if(btnProv) btnProv.classList.remove('active');
    
    let chkAllDist = document.getElementById('checkAllDistricts');
    if(chkAllDist) chkAllDist.checked = false;
    document.querySelectorAll('.dist-cb').forEach(el => el.checked = false);
    
    let dropBtn = document.querySelector('.dropdown-btn');
    if(dropBtn) dropBtn.innerHTML = '📍 ทุกอำเภอ (ค่าเริ่มต้น) <span>▼</span>';
    
    if(map) map.closePopup();
    updateDashboard();
}

function filterFromTable(dName) {
    if (dName === 'Provincial') {
        if (!isProvincialOnly) toggleProvincialOnly();
        return;
    }
    isProvincialOnly = false;
    let btnProv = document.getElementById('btnToggleProvincial');
    if(btnProv) btnProv.classList.remove('active');
    
    let chkAllDist = document.getElementById('checkAllDistricts');
    if(chkAllDist) chkAllDist.checked = false;
    document.querySelectorAll('.dist-cb').forEach(el => el.checked = false);
    let target = document.querySelector(`.dist-cb[value="${dName}"]`);
    if(target) target.checked = true;
    handleDistrictChange();
}

function getYearLabel(sYears) {
    if(!sYears || sYears.length === 0) return "(กรุณาเลือกปี)";
    let sorted = sYears.map(Number).sort((a,b)=>a-b);
    if(sorted.length === 1) return `(ปีงบประมาณ ${sorted[0]})`;
    let isConsecutive = true;
    for(let i=0; i<sorted.length-1; i++) { if(sorted[i+1] - sorted[i] !== 1) { isConsecutive = false; break; } }
    if(isConsecutive && sorted.length >= 2) return `(ปีงบประมาณ ${sorted[0]}-${sorted[sorted.length-1]})`;
    return `(ปีงบประมาณ ${sorted.join(', ')})`;
}

function getFilteredData(sYears, sDists) {
    let targetKey = stratKeys[currentStratLevel];

    return masterData.filter(r => {
        let mY = sYears.includes(r._y);
        
        let val = r[targetKey];
        if (val === undefined) {
            let searchKey = targetKey.split(" ")[0]; 
            if(targetKey.includes("ฉบับที่ 13")) searchKey = "ฉบับที่ 13";
            let foundKey = Object.keys(r).find(k => k.includes(searchKey));
            if (foundKey) val = r[foundKey];
        }
        let strVal = String(val || "").trim();
        let mS = (strVal !== "" && strVal !== "-" && strVal !== "undefined"); 
        
        if (activeSubStrategy !== "all") {
            mS = mS && strVal.includes(activeSubStrategy);
        }

        let mD = true;
        if (isProvincialOnly) {
            mD = r._aType === "Provincial";
        } else if (sDists.length > 0) {
            let matchDist = sDists.some(d => r._a.includes(d));
            let matchProv = r._aType === "Provincial"; 
            mD = matchDist || matchProv;
        }

        return mY && mS && mD;
    });
}

function updateDashboard() {
    const sYears = Array.from(document.querySelectorAll('.y-cb:checked')).map(el => String(el.value)).sort((a,b)=>a-b); 
    const sDists = Array.from(document.querySelectorAll('.dist-cb:checked')).map(el => String(el.value)); 

    let yearText = getYearLabel(sYears);
    safeSetText('badgeYearCount', yearText);
    safeSetText('badgeYearBudget', yearText);

    filteredData = getFilteredData(sYears, sDists);

    safeSetText('sumProjects', filteredData.length.toLocaleString());
    safeSetText('sumBudget', filteredData.reduce((acc, cur) => acc + cur._b, 0).toLocaleString(undefined, {minimumFractionDigits:2}));

    let provCount = 0; let provBudget = 0;
    filteredData.forEach(r => {
        if(r._aType === "Provincial") { provCount++; provBudget += r._b; }
    });
    safeSetText('mapProvCount', provCount.toLocaleString());
    safeSetText('mapProvBudget', provBudget.toLocaleString(undefined, {minimumFractionDigits:0}));

    renderDonutOrBar(sYears); 
    renderBottomChart(sYears); 
    renderMap(sDists, sYears);
    renderTable(sYears);
}

function openStratModal(stratName, sC, jC, sB, jB, totalVal, yearLabel) {
    safeSetHTML('modalStratName', `${stratName} <br><span style="font-size:13px; color:#f59e0b;">(ข้อมูลเฉพาะ ${yearLabel})</span>`);
    
    let totalCount = sC + jC;
    let totalBudget = sB + jB;
    let valToCompare = currentMode === 'count' ? totalCount : totalBudget;
    let pct = totalVal > 0 ? ((valToCompare / totalVal) * 100).toFixed(1) : 0;
    
    safeSetText('modalStratPct', `${pct}%`);
    safeSetText('modalTotalCount', totalCount.toLocaleString());
    safeSetText('modalSingleCount', sC.toLocaleString());
    safeSetText('modalJointCount', jC.toLocaleString());
    safeSetText('modalTotalBudget', totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2}));
    safeSetText('modalSingleBudget', sB.toLocaleString(undefined, {minimumFractionDigits: 2}));
    safeSetText('modalJointBudget', jB.toLocaleString(undefined, {minimumFractionDigits: 2}));
    
    let btnFilter = document.getElementById('btnModalFilter');
    if(btnFilter) {
        btnFilter.onclick = function() {
            activeSubStrategy = stratName;
            let rstBtn = document.getElementById('btnResetDonut');
            if(rstBtn) rstBtn.style.display = 'inline-block';
            closeStratModal();
            updateDashboard(); 
        };
    }
    
    let modal = document.getElementById('stratModal');
    if(modal) modal.style.display = 'block';
}

function closeStratModal() { 
    let modal = document.getElementById('stratModal');
    if(modal) modal.style.display = 'none'; 
}

function openDistrictModal(dName, sYears) {
    let targetKey = stratKeys[currentStratLevel];
    let masterList = STRAT_MASTER_LISTS[currentStratLevel];
    let distStrats = {};
    let totalC = 0;
    let totalB = 0;

    masterData.forEach(r => {
        let yr = r._y;
        if (sYears.includes(yr) && (r._aType === "Single" || r._aType === "Multi" || r._aType === "Provincial") && (r._a.includes(dName) || dName === "Provincial" && r._aType === "Provincial" || r._aType === "Provincial")) {
            
            let val = r[targetKey] || r[Object.keys(r).find(k => k.includes(targetKey.split(" ")[0]))];
            let strats = String(val || "ไม่ระบุ").split(',').map(s=>s.trim()).filter(s=>s!=="");
            if(strats.length === 0) strats = ["ไม่ระบุ"];
            
            totalC++;
            totalB += r._b;

            strats.forEach(s => {
                if(!distStrats[s]) {
                    distStrats[s] = { count: 0, budget: 0, years: {} };
                    sYears.forEach(y => distStrats[s].years[y] = { count: 0, budget: 0 });
                }
                distStrats[s].count += 1;
                distStrats[s].budget += r._b; 
                if(distStrats[s].years[yr]) {
                    distStrats[s].years[yr].count += 1;
                    distStrats[s].years[yr].budget += r._b;
                }
            });
        }
    });

    let displayDName = dName === 'Provincial' ? 'ภาพรวมทั้งจังหวัด' : `อำเภอ${dName}`;
    safeSetText('distModalName', `📍 ข้อมูลเจาะลึก: ${displayDName}`);
    
    let pop = `<div style="font-size:14px; line-height: 1.5;">`;
    if(sYears.length > 1) pop += `<div style="color:#f59e0b; font-weight:bold; margin-bottom:10px;">(สรุปรวมปีงบประมาณ ${sYears.join(', ')})</div>`;
    
    pop += `<div style="margin-bottom:15px; background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
            <b style="color:#1e3a8a;">ยอดรวมพื้นที่นี้:</b> ${totalC.toLocaleString()} โครงการ | <span style="color:#059669; font-weight:bold;">${totalB.toLocaleString()} บาท</span>
            </div>`;
            
    pop += `<b style="color:#1e3a8a;">🧬 แจกแจงตามประเด็นยุทธศาสตร์:</b><br>`;
                
    let sortedStrats = Object.keys(distStrats).sort((a,b) => {
        if(a === 'ไม่ระบุ') return 1; if(b === 'ไม่ระบุ') return -1;
        let idxA = masterList.indexOf(a); let idxB = masterList.indexOf(b);
        if(idxA === -1) idxA = 999; if(idxB === -1) idxB = 999;
        return idxA - idxB; 
    });
    
    if (sortedStrats.length === 0) {
        pop += `<div style="text-align:center; padding:10px; color:gray;">ไม่มีข้อมูล</div>`;
    } else {
        sortedStrats.forEach((s) => {
            let item = distStrats[s];
            pop += `<div style="margin-top: 8px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
                        <div style="background:#e2e8f0; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                            <b style="color:#1e3a8a; font-size:13px; max-width: 60%; line-height:1.2;">${s}</b>
                            <div style="text-align:right; font-size:12px;">
                                <b>${item.count}</b> โครงการ <br><span style="color:#059669;">${item.budget.toLocaleString()} บ.</span>
                            </div>
                        </div>`;
            
            if(sYears.length > 1) {
                pop += `<details class="dist-yr-details" style="background:#f8fafc; padding:5px 10px; border-top:1px solid #cbd5e1;">
                            <summary>▶ ดูรายละเอียดรายปีงบประมาณ</summary>
                            <div style="margin-top:5px;">`;
                sYears.sort((a,b)=>b-a).forEach(y => {
                    let yItem = item.years[y];
                    if(yItem && yItem.count > 0) {
                        pop += `<div class="dist-yr-item"><b>ปี ${y}:</b> ${yItem.count} โครงการ <span style="color:#059669;">(${yItem.budget.toLocaleString()} บ.)</span></div>`;
                    }
                });
                pop += `</div></details>`;
            }
            pop += `</div>`;
        });
    }
    
    pop += `</div>`;

    safeSetHTML('distModalContent', pop);
    
    let btnFilter = document.getElementById('btnDistModalFilter');
    if(btnFilter) {
        btnFilter.onclick = function() {
            if (dName.includes("จังหวัด") || dName.includes("Provincial")) {
                filterFromTable('Provincial');
            } else {
                filterFromTable(dName);
            }
            closeDistrictModal();
        };
    }
    
    let modal = document.getElementById('districtModal');
    if(modal) modal.style.display = 'block';
}

function closeDistrictModal() { 
    let modal = document.getElementById('districtModal');
    if(modal) modal.style.display = 'none'; 
}

function openEnlargeModal(type) {
    currentEnlargeType = type;
    let modal = document.getElementById('enlargeModal');
    let title = document.getElementById('enlargeModalTitle');
    if(!modal) return;

    if (type === 'donut') title.innerHTML = '📊 ขยายกราฟ: สัดส่วนเป้าหมาย';
    else if (type === 'bottom') title.innerHTML = bottomChartMode === 'trend' ? '📉 ขยายกราฟ: แนวโน้มรายปี' : '📊 ขยายกราฟ: กระจายตัวยุทธศาสตร์รายพื้นที่';

    modal.style.display = 'block';
    
    setTimeout(() => {
        const sYears = Array.from(document.querySelectorAll('.y-cb:checked')).map(el => String(el.value)).sort((a,b)=>a-b); 
        renderEnlargeChart(type, sYears);
    }, 100);
}

function closeEnlargeModal() {
    let modal = document.getElementById('enlargeModal');
    if(modal) modal.style.display = 'none';
    if(enlargeChartInstance) enlargeChartInstance.destroy();
}

function renderEnlargeChart(type, sYears) {
    const ctx = document.getElementById('enlargeChartCanvas');
    if(!ctx) return;
    if(enlargeChartInstance) enlargeChartInstance.destroy();

    if (type === 'donut') {
        let targetKey = stratKeys[currentStratLevel];
        let masterList = STRAT_MASTER_LISTS[currentStratLevel];
        let isMultiYear = sYears.length > 1;
        let stratStats = {};
        
        const sDists = Array.from(document.querySelectorAll('.dist-cb:checked')).map(el => String(el.value));
        let baseDataForChart = masterData.filter(r => {
            let mY = sYears.includes(r._y);
            let val = r[targetKey] || r[Object.keys(r).find(k => k.includes(targetKey.split(" ")[0]))];
            let mS = (val && String(val).trim() !== "" && String(val) !== "-"); 
            
            let mD = true;
            if (isProvincialOnly) {
                mD = r._aType === "Provincial";
            } else if (sDists.length > 0) {
                mD = sDists.some(d => r._a.includes(d)) || r._aType === "Provincial";
            }
            return mY && mS && mD;
        });

        baseDataForChart.forEach(row => {
            let val = row[targetKey] || row[Object.keys(row).find(k => k.includes(targetKey.split(" ")[0]))];
            let strVal = String(val || "ไม่ระบุ").trim();
            let strategies = strVal.split(",").map(s => s.trim()).filter(s => s !== "");
            if (strategies.length === 0) strategies = ["ไม่ระบุ"];
            let isJoint = strategies.length > 1;

            strategies.forEach(s => {
                if(!stratStats[s]) {
                    stratStats[s] = { sC: 0, jC: 0, sB: 0, jB: 0, yData: {} };
                    sYears.forEach(y => { stratStats[s].yData[y] = { sC: 0, jC: 0, sB: 0, jB: 0 }; });
                }
                if(!stratStats[s].yData[row._y]) { stratStats[s].yData[row._y] = { sC: 0, jC: 0, sB: 0, jB: 0 }; }
                
                if (isJoint) {
                    stratStats[s].jC += 1;
                    stratStats[s].jB += row._b;
                    stratStats[s].yData[row._y].jC += 1;
                    stratStats[s].yData[row._y].jB += row._b;
                } else {
                    stratStats[s].sC += 1;
                    stratStats[s].sB += row._b;
                    stratStats[s].yData[row._y].sC += 1;
                    stratStats[s].yData[row._y].sB += row._b;
                }
            });
        });

        let sortedKeys = Object.keys(stratStats).sort((a,b) => {
            if(a === 'ไม่ระบุ') return 1; if(b === 'ไม่ระบุ') return -1;
            let idxA = masterList.indexOf(a); let idxB = masterList.indexOf(b);
            if(idxA === -1) idxA = 999; if(idxB === -1) idxB = 999;
            return idxA - idxB; 
        });

        // 🌟 ใช้ชื่อเต็มเสมอ ไม่มีการตัดคำ
        let displayLabels = sortedKeys;
        let dataColors = sortedKeys.map(k => getStratColor(k, masterList));

        let totalC = sortedKeys.reduce((a, k) => a + stratStats[k].sC + stratStats[k].jC, 0);
        let totalB = sortedKeys.reduce((a, k) => a + stratStats[k].sB + stratStats[k].jB, 0);

        if (!isMultiYear) {
            let data = sortedKeys.map(k => currentMode === 'count' ? (stratStats[k].sC + stratStats[k].jC) : (stratStats[k].sB + stratStats[k].jB));
            let overallTotal = currentMode === 'count' ? totalC : totalB;

            enlargeChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: { labels: displayLabels, datasets: [{ data: data, backgroundColor: dataColors }] },
                options: { 
                    responsive: true, maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'right', align: 'center', labels: {font:{family:'Sarabun', size: 14}, boxWidth: 15} },
                        // 🌟 ปิด % ในหน้าขยาย (ตามสั่ง)
                        datalabels: { display: false },
                        // 🌟 แก้ Tooltip ให้กลับมาทำงานได้ปกติ
                        tooltip: { 
                            callbacks: { 
                                title: c => displayLabels[c[0].dataIndex], 
                                label: c => {
                                    let k = displayLabels[c.dataIndex];
                                    let st = stratStats[k];
                                    let yearTxt = sYears.length > 0 ? sYears[0] : "รวม";
                                    if(currentMode === 'count') {
                                        let jointText = st.jC > 0 ? ` (+${st.jC})` : '';
                                        return ` ปี ${yearTxt} : ${st.sC}${jointText} โครงการ`;
                                    } else {
                                        let totalB = st.sB + st.jB;
                                        return ` ปี ${yearTxt} : ${totalB.toLocaleString()} บาท`;
                                    }
                                }
                            }
                        }
                    }
                }
            });
        } else {
            let datasets = [];
            let yearColors = ['#1e3a8a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            sYears.forEach((y, idx) => {
                let baseColor = yearColors[idx % yearColors.length];
                let singleColors = sortedKeys.map(k => (activeSubStrategy !== "all" && k !== activeSubStrategy) ? '#e2e8f0' : baseColor);
                let jointColors = sortedKeys.map(k => (activeSubStrategy !== "all" && k !== activeSubStrategy) ? '#f1f5f9' : baseColor + '90'); 

                datasets.push({
                    label: `ปี ${y} (เดี่ยว)`,
                    data: sortedKeys.map(k => currentMode === 'count' ? stratStats[k].yData[y].sC : stratStats[k].yData[y].sB),
                    backgroundColor: singleColors,
                    stack: `Stack${idx}`
                });
                datasets.push({
                    label: `ปี ${y} (ร่วม)`,
                    data: sortedKeys.map(k => currentMode === 'count' ? stratStats[k].yData[y].jC : stratStats[k].yData[y].jB),
                    backgroundColor: jointColors,
                    stack: `Stack${idx}`
                });
            });

            enlargeChartInstance = new Chart(ctx, {
                type: 'bar',
                data: { labels: displayLabels, datasets: datasets },
                options: { 
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false, 
                    scales: { x: { stacked: true }, y: { stacked: true, ticks: { font: {family:'Sarabun', size: 14} } } },
                    plugins: { 
                        legend: { position: 'bottom', labels: {font:{family:'Sarabun', size: 14}} }, 
                        tooltip: { callbacks: { title: c => displayLabels[c[0].dataIndex] } },
                        datalabels: { display: false } 
                    }
                }
            });
        }
    } else {
        if (bottomChartMode === 'trend') {
            let actY = sYears.length > 0 ? [...sYears].sort((a,b)=>a-b) : [...new Set(masterData.map(r=>r._y))].sort((a,b)=>a-b);
            let yC = {}, yB = {};
            actY.forEach(y => { yC[y] = 0; yB[y] = 0; });
            
            filteredData.forEach(r => { if(yC[r._y] !== undefined) { yC[r._y]++; yB[r._y] += r._b; } });
            
            let dC = actY.map(y => yC[y]);
            let dB = actY.map(y => yB[y]);

            enlargeChartInstance = new Chart(ctx, {
                type: 'line',
                data: { labels: actY, datasets: [
                    { type: 'bar', label: 'งบประมาณ (บาท)', data: dB, backgroundColor: '#cbd5e1', yAxisID: 'y', order: 2 }, 
                    { type: 'line', label: 'จำนวนโครงการ', data: dC, borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.3, yAxisID: 'y1', order: 1 }
                ]},
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    scales: {
                        y: { display: true, position: 'left', beginAtZero: true, title: {display:true, text:'บาท', font:{family:'Sarabun', size: 14}} },
                        y1: { display: true, position: 'right', beginAtZero: true, grid: {drawOnChartArea: false}, title: {display:true, text:'โครงการ', font:{family:'Sarabun', size: 14}} }
                    },
                    plugins: { datalabels: { display: false } } 
                }
            });
        } else {
            let targetKey = stratKeys[currentStratLevel];
            let masterList = STRAT_MASTER_LISTS[currentStratLevel];
            
            let distStats = {};
            let pseudoDistricts = ["Provincial", ...dNames];
            pseudoDistricts.forEach(d => distStats[d] = { strats: {} });
            
            filteredData.forEach(r => {
                let val = r[targetKey] || r[Object.keys(r).find(k => k.includes(targetKey.split(" ")[0]))];
                let strVal = String(val || "ไม่ระบุ").trim();
                let strategies = strVal.split(",").map(s => s.trim()).filter(s => s !== "");
                if (strategies.length === 0) strategies = ["ไม่ระบุ"];
                
                let amount = currentMode === 'count' ? 1 : r._b;
                
                if (r._aType === "Provincial") {
                    strategies.forEach(s => distStats["Provincial"].strats[s] = (distStats["Provincial"].strats[s] || 0) + amount);
                } else if (r._aType === "Single" || r._aType === "Multi") {
                    dNames.filter(d => r._a.includes(d)).forEach(d => {
                        strategies.forEach(s => distStats[d].strats[s] = (distStats[d].strats[s] || 0) + amount);
                    });
                }
            });
            
            let distStackSums = {};
            pseudoDistricts.forEach(d => { distStackSums[d] = Object.values(distStats[d].strats).reduce((acc, v) => acc + v, 0); });

            let validDists = dNames.filter(d => distStackSums[d] > 0).sort((a,b) => distStackSums[b] - distStackSums[a]);
            let sortedDists = [];
            if (distStackSums["Provincial"] > 0) sortedDists.push("Provincial");
            sortedDists = sortedDists.concat(validDists);
            let displayDists = sortedDists.map(d => d === "Provincial" ? "🌐 ทั่วจังหวัด" : d);

            if (sortedDists.length === 0) {
                 enlargeChartInstance = new Chart(ctx, { type: 'bar', data: { labels: ['ไม่มีข้อมูล'], datasets: []}, options: {plugins:{legend:{display:false}}} });
                 return;
            }

            let eContainer = document.getElementById('enlargeCanvasContainer');
            if (sortedDists.length > 10) {
                eContainer.style.width = (sortedDists.length * 60) + 'px'; 
            } else {
                eContainer.style.width = '100%';
            }

            let activeStrats = new Set();
            sortedDists.forEach(d => { Object.keys(distStats[d].strats).forEach(s => activeStrats.add(s)); });
            
            let sortedActiveStrats = [...activeStrats].sort((a,b) => {
                if(a === 'ไม่ระบุ') return 1; if(b === 'ไม่ระบุ') return -1;
                let idxA = masterList.indexOf(a); let idxB = masterList.indexOf(b);
                if(idxA === -1) idxA = 999; if(idxB === -1) idxB = 999;
                return idxA - idxB; 
            });

            let datasets = sortedActiveStrats.map((s) => {
                return {
                    label: s, // 🌟 ใช้ชื่อเต็ม
                    fullLabel: s,
                    data: sortedDists.map(d => distStats[d].strats[s] || 0),
                    backgroundColor: getStratColor(s, masterList),
                    stack: 'Stack0'
                };
            });

            enlargeChartInstance = new Chart(ctx, {
                type: 'bar',
                data: { labels: displayDists, datasets: datasets },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: { 
                        x: { stacked: true, ticks: { font: {family:'Sarabun', size: 13} } }, 
                        y: { stacked: true, title: {display:true, text: currentMode==='count'?'โครงการ':'บาท', font:{family:'Sarabun', size: 14}} } 
                    },
                    plugins: { 
                        legend: { position: 'bottom' }, 
                        tooltip: {
                            callbacks: {
                                label: c => {
                                    let val = c.raw;
                                    if (val === 0) return null;
                                    let fullStrat = c.dataset.fullLabel;
                                    return ` ${fullStrat}: ${val.toLocaleString()} ${currentMode==='count'?'โครงการ':'บาท'}`;
                                }
                            }
                        },
                        datalabels: { display: false } 
                    }
                }
            });
        }
    }
}

// 🌟 กราฟโดนัทหน้าหลัก (ซ่อน % ในชาร์ตแล้ว, มี Tooltip)
function renderDonutOrBar(sYears) {
    const ctx = document.getElementById('donutChart');
    if(!ctx) return;

    let targetKey = stratKeys[currentStratLevel];
    let masterList = STRAT_MASTER_LISTS[currentStratLevel];
    let isMultiYear = sYears.length > 1;

    let stratStats = {};
    
    const sDists = Array.from(document.querySelectorAll('.dist-cb:checked')).map(el => String(el.value));
    let baseDataForChart = masterData.filter(r => {
        let mY = sYears.includes(r._y);
        let val = r[targetKey] || r[Object.keys(r).find(k => k.includes(targetKey.split(" ")[0]))];
        let mS = (val && String(val).trim() !== "" && String(val) !== "-"); 
        
        let mD = true;
        if (isProvincialOnly) {
            mD = r._aType === "Provincial";
        } else if (sDists.length > 0) {
            mD = sDists.some(d => r._a.includes(d)) || r._aType === "Provincial";
        }
        return mY && mS && mD;
    });

    baseDataForChart.forEach(row => {
        let val = row[targetKey] || row[Object.keys(row).find(k => k.includes(targetKey.split(" ")[0]))];
        let strVal = String(val || "ไม่ระบุ").trim();
        let strategies = strVal.split(",").map(s => s.trim()).filter(s => s !== "");
        if (strategies.length === 0) strategies = ["ไม่ระบุ"];
        let isJoint = strategies.length > 1;

        strategies.forEach(s => {
            if(!stratStats[s]) {
                stratStats[s] = { sC: 0, jC: 0, sB: 0, jB: 0, yData: {} };
                sYears.forEach(y => { stratStats[s].yData[y] = { sC: 0, jC: 0, sB: 0, jB: 0 }; });
            }
            if(!stratStats[s].yData[row._y]) { stratStats[s].yData[row._y] = { sC: 0, jC: 0, sB: 0, jB: 0 }; }
            
            if (isJoint) {
                stratStats[s].jC += 1;
                stratStats[s].jB += row._b;
                stratStats[s].yData[row._y].jC += 1;
                stratStats[s].yData[row._y].jB += row._b;
            } else {
                stratStats[s].sC += 1;
                stratStats[s].sB += row._b;
                stratStats[s].yData[row._y].sC += 1;
                stratStats[s].yData[row._y].sB += row._b;
            }
        });
    });

    let sortedKeys = Object.keys(stratStats).sort((a,b) => {
        if(a === 'ไม่ระบุ') return 1; if(b === 'ไม่ระบุ') return -1;
        let idxA = masterList.indexOf(a); let idxB = masterList.indexOf(b);
        if(idxA === -1) idxA = 999; if(idxB === -1) idxB = 999;
        return idxA - idxB; 
    });

    // 🌟 ใช้ชื่อเต็ม ไม่มีตัดคำ
    let displayLabels = sortedKeys;
    let dataColors = sortedKeys.map(k => getStratColor(k, masterList));

    let totalC = sortedKeys.reduce((a, k) => a + stratStats[k].sC + stratStats[k].jC, 0);
    let totalB = sortedKeys.reduce((a, k) => a + stratStats[k].sB + stratStats[k].jB, 0);

    if(donut) donut.destroy();

    if (!isMultiYear) {
        let data = sortedKeys.map(k => currentMode === 'count' ? (stratStats[k].sC + stratStats[k].jC) : (stratStats[k].sB + stratStats[k].jB));
        let overallTotal = currentMode === 'count' ? totalC : totalB;
        let offsets = sortedKeys.map(k => (k === activeSubStrategy) ? 20 : 0);

        const clickHandlerSingle = (e, elements) => {
            if(!elements.length) return;
            let idx = elements[0].index;
            let clickedStrat = sortedKeys[idx];
            if (clickedStrat === "ไม่ระบุ") return;

            if (activeSubStrategy === clickedStrat) {
                clearSubStratFilter();
                return;
            }

            let st = stratStats[clickedStrat];
            let yearLabel = sYears.length > 0 ? `ปีงบประมาณ ${sYears[0]}` : "ทุกปี";
            openStratModal(clickedStrat, st.sC, st.jC, st.sB, st.jB, overallTotal, yearLabel);
        };

        donut = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: displayLabels, datasets: [{ data: data, backgroundColor: dataColors, offset: offsets }] },
            options: { 
                responsive: true, maintainAspectRatio: false, cutout: '45%', 
                plugins: { 
                    legend: { position: 'right', labels: {font:{family:'Sarabun', size: 10}} },
                    tooltip: { 
                        callbacks: { 
                            title: c => displayLabels[c[0].dataIndex], 
                            label: c => {
                                let k = displayLabels[c.dataIndex];
                                let st = stratStats[k];
                                let yearTxt = sYears.length > 0 ? sYears[0] : "รวม";
                                if(currentMode === 'count') {
                                    let jointText = st.jC > 0 ? ` (+${st.jC})` : '';
                                    return ` ปี ${yearTxt} : ${st.sC}${jointText} โครงการ`;
                                } else {
                                    let totalB = st.sB + st.jB;
                                    return ` ปี ${yearTxt} : ${totalB.toLocaleString()} บาท`;
                                }
                            }
                        }
                    },
                    datalabels: { display: false } // 🌟 ซ่อน % ออกจากหน้าหลัก
                },
                onClick: clickHandlerSingle
            }
        });
    } else {
        let datasets = [];
        let yearColors = ['#1e3a8a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        sYears.forEach((y, idx) => {
            let baseColor = yearColors[idx % yearColors.length];
            let singleColors = sortedKeys.map(k => (activeSubStrategy !== "all" && k !== activeSubStrategy) ? '#e2e8f0' : baseColor);
            let jointColors = sortedKeys.map(k => (activeSubStrategy !== "all" && k !== activeSubStrategy) ? '#f1f5f9' : baseColor + '90'); 

            datasets.push({
                label: `ปี ${y} (เดี่ยว)`,
                data: sortedKeys.map(k => currentMode === 'count' ? stratStats[k].yData[y].sC : stratStats[k].yData[y].sB),
                backgroundColor: singleColors,
                stack: `Stack${idx}`
            });
            datasets.push({
                label: `ปี ${y} (ร่วม)`,
                data: sortedKeys.map(k => currentMode === 'count' ? stratStats[k].yData[y].jC : stratStats[k].yData[y].jB),
                backgroundColor: jointColors,
                stack: `Stack${idx}`
            });
        });

        const clickHandlerMulti = (e, elements) => {
            if(!elements.length) return;
            let dataIndex = elements[0].datasetIndex;
            let index = elements[0].index;
            let clickedStrat = sortedKeys[index];
            if (clickedStrat === "ไม่ระบุ") return;

            if (activeSubStrategy === clickedStrat) {
                clearSubStratFilter();
                return;
            }

            let dsLabel = donut.data.datasets[dataIndex].label;
            let yearMatch = dsLabel.match(/ปี (\d+)/);
            if (!yearMatch) return;
            let clickedYear = yearMatch[1];
            
            let st = stratStats[clickedStrat].yData[clickedYear];
            let overallTotalYear = currentMode === 'count' ? 
                sortedKeys.reduce((a, k) => a + stratStats[k].yData[clickedYear].sC + stratStats[k].yData[clickedYear].jC, 0) : 
                sortedKeys.reduce((a, k) => a + stratStats[k].yData[clickedYear].sB + stratStats[k].yData[clickedYear].jB, 0);

            let yearLabel = `ปีงบประมาณ ${clickedYear}`;
            openStratModal(clickedStrat, st.sC, st.jC, st.sB, st.jB, overallTotalYear, yearLabel);
        };

        donut = new Chart(ctx, {
            type: 'bar',
            data: { labels: displayLabels, datasets: datasets },
            options: { 
                indexAxis: 'y', responsive: true, maintainAspectRatio: false, 
                interaction: { mode: 'nearest', intersect: true }, 
                scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true, ticks: { font: {family:'Sarabun', size: 11} } } },
                plugins: { 
                    legend: { position: 'bottom', labels: {font:{family:'Sarabun', size: 10}} },
                    tooltip: { 
                        callbacks: { 
                            title: c => displayLabels[c[0].dataIndex],
                            label: c => {
                                let labelStr = c.dataset.label || '';
                                let yearMatch = labelStr.match(/ปี (\d+)/);
                                if(!yearMatch) return null;
                                let y = yearMatch[1];
                                
                                let k = displayLabels[c.dataIndex];
                                let st = stratStats[k]?.yData[y];
                                if (!st) return null;

                                if (currentMode === 'count') {
                                    if (labelStr.includes('เดี่ยว')) {
                                        let jC = st.jC || 0;
                                        let sC = st.sC || 0;
                                        if (sC + jC === 0) return null;
                                        let jointText = jC > 0 ? ` (+${jC})` : '';
                                        return ` ปี ${y} : ${sC}${jointText} โครงการ`;
                                    }
                                } else {
                                    if (labelStr.includes('เดี่ยว')) {
                                        let totalB = (st.sB || 0) + (st.jB || 0);
                                        if (totalB === 0) return null;
                                        return ` ปี ${y} : ${totalB.toLocaleString()} บาท`;
                                    }
                                }
                                return null; 
                            }
                        }
                    },
                    datalabels: { display: false } 
                },
                onClick: clickHandlerMulti
            }
        });
    }
}

// 🌟 กราฟล่าง
function renderBottomChart(sYears) {
    const ctx = document.getElementById('trendChart');
    if(!ctx) return;
    
    if (trendChartInstance) trendChartInstance.destroy();

    let canvasContainer = document.getElementById('bottomCanvasContainer');
    
    if (bottomChartMode === 'trend') {
        canvasContainer.style.width = '100%';
        
        let actY = sYears.length > 0 ? [...sYears].sort((a,b)=>a-b) : [...new Set(masterData.map(r=>r._y))].sort((a,b)=>a-b);
        let yC = {}, yB = {};
        actY.forEach(y => { yC[y] = 0; yB[y] = 0; });
        
        filteredData.forEach(r => { if(yC[r._y] !== undefined) { yC[r._y]++; yB[r._y] += r._b; } });
        
        let dC = actY.map(y => yC[y]);
        let dB = actY.map(y => yB[y]);

        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: actY, datasets: [
                { type: 'bar', label: 'งบประมาณ (บาท)', data: dB, backgroundColor: '#cbd5e1', yAxisID: 'y', order: 2 }, 
                { type: 'line', label: 'จำนวนโครงการ', data: dC, borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 3, tension: 0.3, yAxisID: 'y1', order: 1 }
            ]},
            options: { 
                responsive: true, maintainAspectRatio: false, 
                scales: {
                    y: { display: true, position: 'left', beginAtZero: true, title: {display:true, text:'บาท', font:{family:'Sarabun'}} },
                    y1: { display: true, position: 'right', beginAtZero: true, grid: {drawOnChartArea: false}, title: {display:true, text:'โครงการ', font:{family:'Sarabun'}} }
                },
                plugins: { datalabels: { display: false } } 
            }
        });
    } else {
        let targetKey = stratKeys[currentStratLevel];
        let masterList = STRAT_MASTER_LISTS[currentStratLevel];
        
        let distStats = {};
        let pseudoDistricts = ["Provincial", ...dNames];
        pseudoDistricts.forEach(d => distStats[d] = { strats: {} });
        
        filteredData.forEach(r => {
            if (r._aType !== "Single" && r._aType !== "Multi" && r._aType !== "Provincial") return; 
            
            let val = r[targetKey] || r[Object.keys(r).find(k => k.includes(targetKey.split(" ")[0]))];
            let strVal = String(val || "ไม่ระบุ").trim();
            let strategies = strVal.split(",").map(s => s.trim()).filter(s => s !== "");
            if (strategies.length === 0) strategies = ["ไม่ระบุ"];
            
            let amount = currentMode === 'count' ? 1 : r._b;
            
            if (r._aType === "Provincial") {
                strategies.forEach(s => distStats["Provincial"].strats[s] = (distStats["Provincial"].strats[s] || 0) + amount);
            } else {
                dNames.filter(d => r._a.includes(d)).forEach(d => {
                    strategies.forEach(s => distStats[d].strats[s] = (distStats[d].strats[s] || 0) + amount);
                });
            }
        });
        
        let distStackSums = {};
        pseudoDistricts.forEach(d => {
            distStackSums[d] = Object.values(distStats[d].strats).reduce((acc, v) => acc + v, 0);
        });

        let validDists = dNames.filter(d => distStackSums[d] > 0).sort((a,b) => distStackSums[b] - distStackSums[a]);
        let sortedDists = [];
        if (distStackSums["Provincial"] > 0) sortedDists.push("Provincial");
        sortedDists = sortedDists.concat(validDists);
        
        let displayDists = sortedDists.map(d => d === "Provincial" ? "🌐 ทั่วจังหวัด" : d);

        if (sortedDists.length === 0) {
             canvasContainer.style.width = '100%';
             trendChartInstance = new Chart(ctx, { type: 'bar', data: { labels: ['ไม่มีข้อมูล'], datasets: []}, options: {plugins:{legend:{display:false}}} });
             return;
        }

        if (sortedDists.length > 8) {
            canvasContainer.style.width = (sortedDists.length * 40) + 'px'; 
        } else {
            canvasContainer.style.width = '100%';
        }

        let activeStrats = new Set();
        sortedDists.forEach(d => { Object.keys(distStats[d].strats).forEach(s => activeStrats.add(s)); });
        
        let sortedActiveStrats = [...activeStrats].sort((a,b) => {
            if(a === 'ไม่ระบุ') return 1; if(b === 'ไม่ระบุ') return -1;
            let idxA = masterList.indexOf(a); let idxB = masterList.indexOf(b);
            if(idxA === -1) idxA = 999; if(idxB === -1) idxB = 999;
            return idxA - idxB; 
        });

        let datasets = sortedActiveStrats.map((s) => {
            return {
                label: s, // 🌟 ใช้ชื่อเต็ม
                fullLabel: s,
                data: sortedDists.map(d => distStats[d].strats[s] || 0),
                backgroundColor: getStratColor(s, masterList),
                stack: 'Stack0'
            };
        });

        const clickHandlerDistrict = (e, elements) => {
            if(!elements.length) return;
            let dataIndex = elements[0].index;
            let dName = sortedDists[dataIndex]; 
            openDistrictModal(dName, sYears); 
        };

        trendChartInstance = new Chart(ctx, {
            type: 'bar',
            data: { labels: displayDists, datasets: datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false }, 
                scales: { 
                    x: { stacked: true, ticks: { font: {family:'Sarabun', size: 11} } }, 
                    y: { stacked: true, title: {display:true, text: currentMode==='count'?'โครงการ':'บาท', font:{family:'Sarabun'}} } 
                },
                plugins: {
                    legend: { display: false }, 
                    tooltip: {
                        callbacks: {
                            title: c => c[0].label + ' (คลิกเพื่อดูสรุปยุทธศาสตร์)',
                            label: c => {
                                let val = c.raw;
                                if (val === 0) return null;
                                let fullStrat = c.dataset.fullLabel;
                                return ` ${fullStrat}: ${val.toLocaleString()} ${currentMode==='count'?'โครงการ':'บาท'}`;
                            }
                        }
                    },
                    datalabels: { display: false }
                },
                onClick: clickHandlerDistrict 
            }
        });
    }
}

// 🌟 แผนที่ อิงกลุ่ม + อิงเกณฑ์ Percentile
function renderMap(sDists, sYears) {
    if (!map) {
        map = L.map('map', {scrollWheelZoom: false, preferCanvas: true}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    let isMultiYear = sYears.length > 1;
    let dStats = {};
    dNames.forEach(d => { 
        dStats[d] = { total: {cS: 0, bS: 0, cM: 0, bM: 0, cP: 0, bP: 0}, years: {} }; 
        sYears.forEach(y => dStats[d].years[y] = {cS: 0, bS: 0, cM: 0, bM: 0, cP: 0, bP: 0});
    });

    filteredData.forEach(r => {
        let yr = r._y;
        if (sYears.includes(yr)) {
            if (r._aType === "Single" || r._aType === "Multi") {
                dNames.filter(d => r._a.includes(d)).forEach(d => {
                    if (r._aType === "Single") { 
                        dStats[d].total.cS++; dStats[d].total.bS += r._b; 
                        if(dStats[d].years[yr]) { dStats[d].years[yr].cS++; dStats[d].years[yr].bS += r._b; }
                    }
                    if (r._aType === "Multi") { 
                        dStats[d].total.cM++; dStats[d].total.bM += r._b; 
                        if(dStats[d].years[yr]) { dStats[d].years[yr].cM++; dStats[d].years[yr].bM += r._b; }
                    }
                });
            } else if (r._aType === "Provincial") {
                dNames.forEach(d => { 
                    dStats[d].total.cP++; 
                    dStats[d].total.bP += r._b;
                    if(dStats[d].years[yr]) { 
                        dStats[d].years[yr].cP++; 
                        dStats[d].years[yr].bP += r._b;
                    }
                });
            }
        }
    });

    let validVals = dNames.map(d => {
        let s = dStats[d].total;
        return currentMode === 'budget' ? (s.bS + s.bM + s.bP) : (s.cS + s.cM);
    }).filter(v => v > 0).sort((a,b) => a - b);

    let q80 = getPercentile(validVals, 0.8);
    let q60 = getPercentile(validVals, 0.6);
    let q40 = getPercentile(validVals, 0.4);
    let q20 = getPercentile(validVals, 0.2);
    
    let uniqueDesc = [...new Set(validVals)].sort((a,b) => b - a);
    let max1 = uniqueDesc.length > 0 ? uniqueDesc[0] : 0;
    let max2 = uniqueDesc.length > 1 ? uniqueDesc[1] : 0;
    let max3 = uniqueDesc.length > 2 ? uniqueDesc[2] : 0;

    if (!districtGeo) return;
    if(geoLayer) map.removeLayer(geoLayer);
    
    let isDist = sDists.length > 0;

    geoLayer = L.geoJSON(districtGeo, {
        style: (f) => {
            let d = f.properties.amp_th || f.properties.AMP_TH;
            let s = dStats[d].total;
            let val = currentMode === 'budget' ? (s.bS + s.bM + s.bP) : (s.cS + s.cM);
            
            let color = '#f1f5f9'; 
            let borderColor = '#cbd5e1';
            let weight = 1;
            
            if (isProvincialOnly) {
                color = currentMode === 'budget' ? '#059669' : '#3b82f6'; 
                borderColor = '#fff';
            } else {
                if (val === 0) {
                    color = '#f1f5f9'; 
                    borderColor = '#9ca3af';
                } else {
                    borderColor = '#fff';
                    if (val === max1 && max1 > 0) {
                        color = currentMode === 'budget' ? '#022c22' : '#0f172a'; 
                        weight = 2;
                    } else if (val === max2 && max2 > 0) {
                        color = currentMode === 'budget' ? '#064e3b' : '#172554'; 
                    } else if (val === max3 && max3 > 0) {
                        color = currentMode === 'budget' ? '#047857' : '#1e3a8a'; 
                    } 
                    else if (currentMode === 'budget') {
                        if (val >= q80) color = '#059669'; 
                        else if (val >= q60) color = '#10b981'; 
                        else if (val >= q40) color = '#34d399'; 
                        else if (val >= q20) color = '#6ee7b7';  
                        else color = '#a7f3d0';
                    } else {
                        if (val >= q80) color = '#2563eb';
                        else if (val >= q60) color = '#3b82f6';
                        else if (val >= q40) color = '#60a5fa';
                        else if (val >= q20) color = '#93c5fd';
                        else color = '#bfdbfe';
                    }
                }
            }
            
            let dim = false;
            if (!isProvincialOnly && sDists.length > 0 && sDists.length < 25) { 
                if (!sDists.includes(d)) dim = true; 
            }
            
            if (dim) return { fillColor: '#f1f5f9', weight: 1, opacity: 0.5, color: '#cbd5e1', fillOpacity: 0.4 };
            return { fillColor: color, weight: weight, opacity: 1, color: borderColor, fillOpacity: 0.85 };
        },
        onEachFeature: (f, l) => {
            let d = f.properties.amp_th || f.properties.AMP_TH;
            let st = dStats[d];
            let s = st.total;
            
            let pop = `<div style="font-family:'Sarabun'; width: 240px; max-height:260px; overflow-y:auto; overflow-x:hidden; padding-right:5px;">
                <b style="font-size:14px; color:#1e3a8a;">📍 อำเภอ${d}</b>
                <hr style="margin:4px 0;">
                <div style="font-size:11px; line-height: 1.3;">
                    <b style="color:#10b981;">✅ โครงการเฉพาะพื้นที่:</b><br>
                    รวม: <b>${s.cS}</b> โครงการ | <b>${s.bS.toLocaleString()}</b> บาท<br>`;
            
            if(sYears.length > 1) {
                pop += `<ul style="padding-left:15px; margin:2px 0; color:#475569; font-size:10px;">`;
                sYears.sort((a,b)=>a-b).forEach(y => {
                    if (st.years[y] && st.years[y].cS > 0) {
                        pop += `<li>ปี ${y}: ${st.years[y].cS} โครงการ (${st.years[y].bS.toLocaleString()} บ.)</li>`;
                    }
                });
                pop += `</ul>`;
            }

            pop += `<hr style="border:0; border-top:1px dashed #ccc; margin:4px 0;">
                    <b style="color:#f59e0b;">📦 โครงการร่วมพื้นที่อื่น:</b><br>
                    รวม: <b>${s.cM}</b> โครงการ<br>
                    งบที่ครอบคลุม: <b>${s.bM.toLocaleString()}</b> บาท<br>`;
            
            if(sYears.length > 1) {
                pop += `<ul style="padding-left:15px; margin:2px 0; color:#475569; font-size:10px;">`;
                sYears.sort((a,b)=>a-b).forEach(y => {
                    if (st.years[y] && st.years[y].cM > 0) {
                        pop += `<li>ปี ${y}: ${st.years[y].cM} โครงการ (${st.years[y].bM.toLocaleString()} บ.)</li>`;
                    }
                });
                pop += `</ul>`;
            }

            pop += `<hr style="border:0; border-top:1px dashed #ccc; margin:4px 0;">
                    <b style="color:#ef4444;">🌐 โครงการทั้งจังหวัด:</b><br>
                    ครอบคลุมถึง: <b>${s.cP}</b> โครงการ<br>
                    งบระดับจังหวัด: <b>${s.bP.toLocaleString()}</b> บาท`;
            
            if(sYears.length > 1) {
                pop += `<ul style="padding-left:15px; margin:2px 0; color:#475569; font-size:10px;">`;
                sYears.sort((a,b)=>a-b).forEach(y => {
                    if (st.years[y] && st.years[y].cP > 0) {
                        pop += `<li>ปี ${y}: ${st.years[y].cP} โครงการ (${st.years[y].bP.toLocaleString()} บ.)</li>`;
                    }
                });
                pop += `</ul>`;
            }

            pop += `</div></div>`;
            l.bindPopup(pop, { autoPan: true, autoPanPadding: [20, 20] }); 
            l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
            l.on('mouseout', e => geoLayer.resetStyle(e.target));
        }
    }).addTo(map);
}

function toggleYearRow(rowId) {
    const detailRow = document.getElementById(`detail-${rowId}`);
    const mainRow = document.getElementById(`row-${rowId}`);
    
    if(detailRow) {
        if(detailRow.classList.contains('open')) {
            detailRow.classList.remove('open');
            if(mainRow) mainRow.classList.remove('open');
        } else {
            detailRow.classList.add('open');
            if(mainRow) mainRow.classList.add('open');
        }
    }
}

function renderTable(sYears) {
    let container = document.getElementById('tableContainer');
    if (!container) return;
    
    let actY = sYears.length > 0 ? [...sYears].sort((a,b)=>b-a) : [...new Set(masterData.map(r=>r._y))].sort((a,b)=>b-a);
    
    if (currentTableTab === 'year') {
        let tableHtml = `
            <table class="summary-table">
                <thead>
                    <tr>
                        <th style="width: 35%;">ปีงบประมาณ</th>
                        <th style="text-align: center; width: 25%;">จำนวน</th>
                        <th style="text-align: right; width: 40%;">งบประมาณรวม</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        actY.forEach(y => {
            let yData = filteredData.filter(r => r._y === y);
            let yCount = yData.length;
            let yBudget = yData.reduce((s, r) => s + r._b, 0);

            let dStats = {};
            dNames.forEach(d => { dStats[d] = { cS: 0, bS: 0, cM: 0, bM: 0 }; });
            let provStats = { cP: 0, bP: 0 }; 

            yData.forEach(r => {
                if (r._aType === "Single" || r._aType === "Multi") {
                    dNames.filter(d => r._a.includes(d)).forEach(d => {
                        if (r._aType === "Single") { dStats[d].cS++; dStats[d].bS += r._b; }
                        if (r._aType === "Multi") { dStats[d].cM++; dStats[d].bM += r._b; }
                    });
                } else if (r._aType === "Provincial") {
                    provStats.cP++;
                    provStats.bP += r._b;
                }
            });

            tableHtml += `
                <tr class="year-row" id="row-${y}" onclick="toggleYearRow('${y}')">
                    <td><span class="toggle-icon">▶</span> ปีงบประมาณ ${y}</td>
                    <td style="text-align:center;">${yCount}</td>
                    <td style="text-align:right; color:#059669;">${yBudget.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                </tr>
                <tr class="district-details" id="detail-${y}">
                    <td colspan="3" style="padding:0; background: #f8fafc;">
                        <div style="max-height: 250px; overflow-y: auto; padding: 5px;">
                            <table class="district-table">
                                <thead style="background:#e2e8f0; position:sticky; top:0;">
                                    <tr>
                                        <th style="width:25%;">พื้นที่ (คลิกเพื่อกรอง)</th>
                                        <th style="text-align:center; width:25%;">เฉพาะพื้นที่<br><small>(+ร่วม)</small></th>
                                        <th style="text-align:right; width:25%;">งบตรง<br><small style="color:#10b981;">(ผลงาน)</small></th>
                                        <th style="text-align:right; width:25%;">งบครอบคลุม<br><small style="color:#ef4444;">(ไม่หาร)</small></th>
                                    </tr>
                                </thead>
                                <tbody>
            `;
            
            if (provStats.cP > 0) {
                tableHtml += `
                    <tr class="provincial-row" onclick="filterFromTable('Provincial')">
                        <td>🌐 โครงการทั้งจังหวัด</td>
                        <td style="text-align:center;">${provStats.cP}</td>
                        <td style="text-align:right; color:gray;">(ภาพรวม)</td>
                        <td style="text-align:right;">${provStats.bP.toLocaleString()}</td>
                    </tr>
                `;
            }

            dNames.forEach(d => {
                let s = dStats[d];
                if(s.cS > 0 || s.cM > 0) {
                    tableHtml += `
                        <tr onclick="filterFromTable('${d}')">
                            <td>📍 อ.${d}</td>
                            <td style="text-align:center;">${s.cS} <span style="color:#64748b; font-size:10px;">(+${s.cM})</span></td>
                            <td style="text-align:right; color:#10b981;"><b>${s.bS.toLocaleString()}</b></td>
                            <td style="text-align:right; color:#64748b; font-size:11px;">${s.bM.toLocaleString()}</td>
                        </tr>
                    `;
                }
            });

            tableHtml += `</tbody></table></div></td></tr>`;
        });
        tableHtml += `</tbody></table>`;
        safeSetHTML('tableContainer', tableHtml);
    } 
    else {
        let targetKey = stratKeys[currentStratLevel];
        let distAgg = {};
        dNames.forEach(d => { distAgg[d] = { totalVal: 0, strats: {} }; });
        let provAgg = { totalVal: 0, strats: {} };
        
        filteredData.forEach(r => {
            let strats = String(r[targetKey] || r[Object.keys(r).find(k => k.includes(targetKey.split(" ")[0]))] || "ไม่ระบุ").split(',').map(s=>s.trim()).filter(s=>s!=="");
            if(strats.length === 0) strats = ["ไม่ระบุ"];
            
            let val = currentMode === 'count' ? 1 : r._b;
            
            if (r._aType === "Provincial") {
                provAgg.totalVal += val;
                strats.forEach(s => { provAgg.strats[s] = (provAgg.strats[s] || 0) + val; });
            } else if (r._aType === "Single" || r._aType === "Multi") {
                dNames.filter(d => r._a.includes(d)).forEach(d => {
                    distAgg[d].totalVal += val;
                    strats.forEach(s => { distAgg[d].strats[s] = (distAgg[d].strats[s] || 0) + val; });
                });
            }
        });

        let sortedDists = Object.keys(distAgg).filter(d => distAgg[d].totalVal > 0).sort((a,b) => distAgg[b].totalVal - distAgg[a].totalVal);
        let unitText = currentMode === 'count' ? 'โครงการ' : 'บาท';

        let tableHtml = `
            <table class="summary-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">พื้นที่ดำเนินการ</th>
                        <th style="text-align: right; width: 60%;">ยอดรวมที่เกี่ยวข้อง (${unitText})</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (provAgg.totalVal > 0) {
            let sHtml = Object.entries(provAgg.strats).sort((a,b)=>b[1]-a[1]).map(s => `
                <tr><td style="padding:4px 8px;">${s[0]}</td><td style="text-align:right; padding:4px 8px; font-weight:bold; color:#1e3a8a;">${s[1].toLocaleString()}</td></tr>
            `).join('');

            tableHtml += `
                <tr class="year-row provincial-row" id="row-Provincial" onclick="toggleYearRow('Provincial')">
                    <td><span class="toggle-icon">▶</span> 🌐 ครอบคลุมทั้งจังหวัด</td>
                    <td style="text-align:right;">${provAgg.totalVal.toLocaleString()}</td>
                </tr>
                <tr class="district-details" id="detail-Provincial">
                    <td colspan="2" style="padding:0; background: #f8fafc;">
                        <div style="padding: 5px;"><table class="district-table" style="background:#fff;"><tbody>${sHtml}</tbody></table></div>
                    </td>
                </tr>
            `;
        }

        sortedDists.forEach(d => {
            let sHtml = Object.entries(distAgg[d].strats).sort((a,b)=>b[1]-a[1]).map(s => `
                <tr><td style="padding:4px 8px;">${s[0]}</td><td style="text-align:right; padding:4px 8px; font-weight:bold; color:#10b981;">${s[1].toLocaleString()}</td></tr>
            `).join('');

            tableHtml += `
                <tr class="year-row" id="row-${d}" onclick="toggleYearRow('${d}')">
                    <td><span class="toggle-icon">▶</span> 📍 อำเภอ${d}</td>
                    <td style="text-align:right;">${distAgg[d].totalVal.toLocaleString()}</td>
                </tr>
                <tr class="district-details" id="detail-${d}">
                    <td colspan="2" style="padding:0; background: #f8fafc;">
                        <div style="padding: 5px;"><table class="district-table" style="background:#fff;"><tbody>${sHtml}</tbody></table></div>
                    </td>
                </tr>
            `;
        });

        if (sortedDists.length === 0 && provAgg.totalVal === 0) {
            tableHtml += `<tr><td colspan="2" style="text-align:center; color:gray; padding:20px;">ไม่มีข้อมูล</td></tr>`;
        }

        tableHtml += `</tbody></table>`;
        safeSetHTML('tableContainer', tableHtml);
    }
}
