// 🚨 เปลี่ยน API ของคุณที่นี่
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

let masterData = [];   
let filteredData = []; 
let currentStratLevel = 4; // เริ่มที่แผนพัฒนาจังหวัด
let currentMode = 'count'; 
let activeSubStrategy = "all"; 
let isProvincialOnly = false; 

const stratKeys = ["ยุทธศาสตร์ชาติ 20 ปี", "แผนแม่บทภายใต้ยุทธศาสตร์ชาติ", "แผนพัฒนาฯ ฉบับที่ 13", "แผนพัฒนาภาคเหนือ", "ประเด็นการพัฒนาจังหวัด"];
const stratNames = ["ยุทธศาสตร์ชาติ", "แผนแม่บท", "แผนพัฒนาฯ 13", "แผนภาคเหนือ", "แผนพัฒนาจังหวัด (2566-2570)"];

const STRAT_MASTER_LISTS = {
    0: ["ด้าน 1 ความมั่นคง", "ด้าน 2 การสร้างความสามารถในการแข่งขัน", "ด้าน 3 การพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์", "ด้าน 4 การสร้างโอกาสและความเสมอภาคทางสังคม", "ด้าน 5 การสร้างการเติบโตบนคุณภาพชีวิตที่เป็นมิตรกับสิ่งแวดล้อม", "ด้าน 6 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ"],
    1: ["ประเด็นที่ 1 ความมั่นคง", "ประเด็นที่ 2 การต่างประเทศ", "ประเด็นที่ 3 การเกษตร", "ประเด็นที่ 4 อุตสาหกรรมและบริการแห่งอนาคต", "ประเด็นที่ 5 การท่องเที่ยว", "ประเด็นที่ 6 พื้นที่และเมืองน่าอยู่อัจฉริยะ", "ประเด็นที่ 7 โครงสร้างพื้นฐาน ระบบโลจิสติกส์ และดิจิทัล", "ประเด็นที่ 8 ผู้ประกอบการและวิสาหกิจขนาดกลางและขนาดย่อมยุคใหม่", "ประเด็นที่ 9 เขตเศรษฐกิจพิเศษ", "ประเด็นที่ 10 การปรับเปลี่ยนค่านิยมและวัฒนธรรม", "ประเด็นที่ 11 ศักยภาพคนตลอดช่วงชีวิต", "ประเด็นที่ 12 การพัฒนาการเรียนรู้", "ประเด็นที่ 13 การเสริมสร้างให้คนไทยมีสุขภาวะที่ดี", "ประเด็นที่ 14 ศักยภาพการกีฬา", "ประเด็นที่ 15 พลังทางสังคม", "ประเด็นที่ 16 เศรษฐกิจฐานราก", "ประเด็นที่ 17 ความเสมอภาคและหลักประกันทางสังคม", "ประเด็นที่ 18 การเติบโตอย่างยั่งยืน", "ประเด็นที่ 19 การบริหารจัดการน้ำทั้งระบบ", "ประเด็นที่ 20 การบริการประชาชนและประสิทธิภาพภาครัฐ", "ประเด็นที่ 21 การต่อต้านการทุจริตและประพฤติมิชอบ", "ประเด็นที่ 22 กฎหมายและกระบวนการยุติธรรม", "ประเด็นที่ 23 การวิจัยและพัฒนานวัตกรรม"],
    2: ["หมุดหมายที่ 1 ไทยเป็นประเทศชั้นนำด้านสินค้าเกษตรและเกษตรแปรรูปมูลค่าสูง", "หมุดหมายที่ 2 ไทยเป็นจุดหมายของการท่องเที่ยวที่เน้นคุณภาพและความยั่งยืน", "หมุดหมายที่ 3 ไทยเป็นฐานการผลิตยานยนต์ไฟฟ้าที่สำคัญของโลก", "หมุดหมายที่ 4 ไทยเป็นศูนย์กลางทางการแพทย์และสุขภาพมูลค่าสูง", "หมุดหมายที่ 5 ไทยเป็นประตูการค้าการลงทุนและยุทธศาสตร์ทางโลจิสติกส์ที่สำคัญของภูมิภาค", "หมุดหมายที่ 6 ไทยเป็นศูนย์กลางอุตสาหกรรมอิเล็กทรอนิกส์อัจฉริยะและอุตสาหกรรมดิจิทัลของอาเซียน", "หมุดหมายที่ 7 ไทยมีวิสาหกิจขนาดกลางและขนาดย่อมที่เข้มแข็ง มีศักยภาพสูง และสามารถแข่งขันได้", "หมุดหมายที่ 8 ไทยมีพื้นที่และเมืองอัจฉริยะที่น่าอยู่ ปลอดภัย เติบโตได้อย่างยั่งยืน", "หมุดหมายที่ 9 ไทยมีความยากจนข้ามรุ่นลดลง และมีความคุ้มครองทางสังคมที่เพียงพอ เหมาะสม", "หมุดหมายที่ 10 ไทยมีเศรษฐกิจหมุนเวียนและสังคมคาร์บอนต่ำ", "หมุดหมายที่ 11 ไทยสามารถลดความเสี่ยงและผลกระทบจากภัยธรรมชาติและการเปลี่ยนแปลงสภาพภูมิอากาศ", "หมุดหมายที่ 12 ไทยมีกำลังคนสมรรถนะสูง มุ่งเรียนรู้อย่างต่อเนื่อง ตอบโจทย์การพัฒนาแห่งอนาคต", "หมุดหมายที่ 13 ไทยมีภาครัฐที่ทันสมัย มีประสิทธิภาพ และตอบโจทย์ประชาชน"],
    3: ["ประเด็นการพัฒนาที่ 1 การพัฒนาเศรษฐกิจท่องเที่ยวและการค้าในพื้นที่", "ประเด็นการพัฒนาที่ 2 การพัฒนาเศรษฐกิจมูลค่าสูงด้วยการส่งออกสินค้าและบริการนอกพื้นที่", "ประเด็นการพัฒนาที่ 3 การพัฒนาเศรษฐกิจเกษตรสร้างสรรค์", "ประเด็นการพัฒนาที่ 4 การพัฒนาเศรษฐกิจสิ่งแวดล้อมเพื่อลดฝุ่นควัน"],
    4: ["ประเด็นการพัฒนาที่ 1 การส่งเสริมอุตสาหกรรมท่องเที่ยวเน้นคุณค่า สร้างสรรค์บนอัตลักษณ์ล้านนา และอุตสาหกรรมไมซ์", "ประเด็นการพัฒนาที่ 2 การขับเคลื่อนเกษตรเพิ่มมูลค่า และเกษตรแปรรูปมูลค่าสูง", "ประเด็นการพัฒนาที่ 3 การยกระดับการค้าการลงทุนบนฐานเศรษฐกิจสร้างสรรค์ (Creative Economy) นวัตกรรม (Innovation) และการพัฒนาอย่างยั่งยืน (SDGs)", "ประเด็นการพัฒนาที่ 4 การจัดการเชิงรุกในปัญหาฝุ่นควัน (PM 2.5) และการรักษาทรัพยากรธรรมชาติและสิ่งแวดล้อมแบบมีส่วนร่วม", "ประเด็นการพัฒนาที่ 5 การเสริมสร้างสังคมแห่งโอกาสและเป็นธรรม เมืองน่าอยู่ มีความปลอดภัย เพื่อคุณภาพชีวิตที่ดีของประชาชน"]
};

const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];

let map, geoLayer, donut, trend, districtGeo;
let lastClickTime = 0; let lastClickedIndex = -1;

function toggleDropdown() { document.getElementById('distList').classList.toggle('show'); }

window.onclick = function(event) {
    if (!event.target.matches('.dropdown-btn') && !event.target.closest('.dropdown-btn')) {
        let dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) dropdowns[i].classList.remove('show');
        }
    }
}

function toggleProvincialOnly() {
    isProvincialOnly = !isProvincialOnly;
    let btn = document.getElementById('btnToggleProvincial');
    
    if (isProvincialOnly) {
        btn.classList.add('active');
        document.querySelectorAll('.dist-cb').forEach(el => el.checked = false);
        document.getElementById('checkAllDistricts').checked = false;
        document.querySelector('.dropdown-btn').innerHTML = '📍 ทุกอำเภอ (ค่าเริ่มต้น) <span>▼</span>';
    } else {
        btn.classList.remove('active');
    }
    updateDashboard();
}

function handleDistrictChange() {
    isProvincialOnly = false;
    document.getElementById('btnToggleProvincial').classList.remove('active');

    let checked = document.querySelectorAll('.dist-cb:checked');
    let btn = document.querySelector('.dropdown-btn');
    if (checked.length === 0) {
        btn.innerHTML = '📍 ทุกอำเภอ (ค่าเริ่มต้น) <span>▼</span>';
    } else {
        btn.innerHTML = `📍 เลือกกรอง ${checked.length} อำเภอ <span>▼</span>`;
    }
    updateDashboard();
}

function toggleAllDistricts(cb) {
    document.querySelectorAll('.dist-cb').forEach(el => el.checked = cb.checked);
    handleDistrictChange();
}

document.addEventListener("DOMContentLoaded", () => {
    let dContainer = document.getElementById('distList');
    dNames.forEach(d => { dContainer.innerHTML += `<label><input type="checkbox" class="dist-cb" value="${d}" onchange="handleDistrictChange()"> อ.${d}</label>`; });

    document.getElementById('modeSwitch').onchange = function(e) {
        currentMode = e.target.checked ? 'budget' : 'count';
        updateDashboard();
    };

    init();
});

async function init() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        try { districtGeo = await (await fetch("districts.json")).json(); } catch(e) {}

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
            yBox.innerHTML += `<li><label><input type="checkbox" class="y-cb" value="${yr}" checked onchange="handleYearChange()"> ปีงบประมาณ ${yr}</label></li>`;
        });
        document.getElementById('checkAllYears').checked = true;

        updateDashboard();
        setTimeout(() => document.getElementById('loadingOverlay').style.display = 'none', 300);
    } catch (error) {
        document.getElementById('loadingOverlay').innerHTML = `<h3 style="color:red; font-family:'Sarabun';">❌ โหลดข้อมูลไม่สำเร็จ</h3>`;
    }
}

function setStrat(idx) {
    currentStratLevel = idx;
    clearSubStratFilter(); 
    document.querySelectorAll('.strat-btn').forEach((btn, i) => { btn.classList.toggle('active', i === idx); });
}

function clearSubStratFilter() {
    activeSubStrategy = "all";
    document.getElementById('btnResetDonut').style.display = 'none';
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
    isProvincialOnly = false;
    document.getElementById('btnToggleProvincial').classList.remove('active');
    document.getElementById('checkAllDistricts').checked = false;
    document.querySelectorAll('.dist-cb').forEach(el => el.checked = false);
    document.querySelector('.dropdown-btn').innerHTML = '📍 ทุกอำเภอ (ค่าเริ่มต้น) <span>▼</span>';
    
    document.querySelectorAll('.y-cb').forEach(el => el.checked = true);
    document.getElementById('checkAllYears').checked = true;
    
    setStrat(4); 
    if(map) map.closePopup();
    updateDashboard();
}

function clearMapFilterOnly() {
    isProvincialOnly = false;
    document.getElementById('btnToggleProvincial').classList.remove('active');
    document.getElementById('checkAllDistricts').checked = false;
    document.querySelectorAll('.dist-cb').forEach(el => el.checked = false);
    document.querySelector('.dropdown-btn').innerHTML = '📍 ทุกอำเภอ (ค่าเริ่มต้น) <span>▼</span>';
    if(map) map.closePopup();
    updateDashboard();
}

function filterFromTable(dName) {
    if (dName === 'Provincial') {
        if (!isProvincialOnly) toggleProvincialOnly();
        return;
    }
    isProvincialOnly = false;
    document.getElementById('btnToggleProvincial').classList.remove('active');
    document.getElementById('checkAllDistricts').checked = false;
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

function updateDashboard() {
    const sYears = Array.from(document.querySelectorAll('.y-cb:checked')).map(el => String(el.value)).sort((a,b)=>a-b); 
    const sDists = Array.from(document.querySelectorAll('.dist-cb:checked')).map(el => String(el.value)); 

    let yearText = getYearLabel(sYears);
    document.getElementById('badgeYearCount').innerText = yearText;
    document.getElementById('badgeYearBudget').innerText = yearText;

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

    document.getElementById('sumProjects').innerText = filteredData.length.toLocaleString();
    document.getElementById('sumBudget').innerText = filteredData.reduce((acc, cur) => acc + cur._b, 0).toLocaleString(undefined, {minimumFractionDigits:2});

    renderTrend(sYears);
    renderDonutOrBar(sYears); 
    renderMap(sDists, sYears);
    renderTable(sYears);
}

// 🌟 อัปเดต Modal ให้รองรับการแสดง "ปีงบประมาณ"
function openStratModal(stratName, sC, jC, sB, jB, totalVal, yearLabel) {
    document.getElementById('modalStratName').innerHTML = `${stratName} <br><span style="font-size:13px; color:#f59e0b;">(ข้อมูลเฉพาะ ${yearLabel})</span>`;
    let totalCount = sC + jC;
    let totalBudget = sB + jB;
    let valToCompare = currentMode === 'count' ? totalCount : totalBudget;
    let pct = totalVal > 0 ? ((valToCompare / totalVal) * 100).toFixed(1) : 0;
    
    document.getElementById('modalStratPct').innerText = `${pct}%`;
    document.getElementById('modalTotalCount').innerText = totalCount.toLocaleString();
    document.getElementById('modalSingleCount').innerText = sC.toLocaleString();
    document.getElementById('modalJointCount').innerText = jC.toLocaleString();
    document.getElementById('modalTotalBudget').innerText = totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('modalSingleBudget').innerText = sB.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('modalJointBudget').innerText = jB.toLocaleString(undefined, {minimumFractionDigits: 2});
    
    document.getElementById('btnModalFilter').onclick = function() {
        activeSubStrategy = stratName;
        document.getElementById('btnResetDonut').style.display = 'inline-block';
        closeStratModal();
        updateDashboard();
    };
    document.getElementById('stratModal').style.display = 'block';
}

function closeStratModal() { document.getElementById('stratModal').style.display = 'none'; }

function renderDonutOrBar(sYears) {
    const ctx = document.getElementById('donutChart');
    if(!ctx) return;

    let targetKey = stratKeys[currentStratLevel];
    let masterList = STRAT_MASTER_LISTS[currentStratLevel];
    let isMultiYear = sYears.length > 1;

    let stratStats = {};
    
    let baseDataForChart = masterData.filter(r => {
        let mY = sYears.includes(r._y);
        let val = r[targetKey] || r[Object.keys(r).find(k => k.includes(targetKey.split(" ")[0]))];
        let mS = (val && String(val).trim() !== "" && String(val) !== "-"); 
        
        const sDists = Array.from(document.querySelectorAll('.dist-cb:checked')).map(el => String(el.value));
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
                stratStats[s].jC += 1; stratStats[s].jB += row._b;
                stratStats[s].yData[row._y].jC += 1; stratStats[s].yData[row._y].jB += row._b;
            } else {
                stratStats[s].sC += 1; stratStats[s].sB += row._b;
                stratStats[s].yData[row._y].sC += 1; stratStats[s].yData[row._y].sB += row._b;
            }
        });
    });

    let sortedKeys = Object.keys(stratStats).sort((a,b) => {
        if(a === 'ไม่ระบุ') return 1; if(b === 'ไม่ระบุ') return -1;
        let idxA = masterList.indexOf(a); let idxB = masterList.indexOf(b);
        if(idxA === -1) idxA = 999; if(idxB === -1) idxB = 999;
        return idxA - idxB; 
    });

    let fullLabels = sortedKeys;
    let displayLabels = sortedKeys.map(k => k.length > 25 ? k.substring(0, 25) + "..." : k);
    const chartColors = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#0ea5e9', '#14b8a6', '#f43f5e', '#d946ef', '#a855f7'];

    let totalC = sortedKeys.reduce((a, k) => a + stratStats[k].sC + stratStats[k].jC, 0);
    let totalB = sortedKeys.reduce((a, k) => a + stratStats[k].sB + stratStats[k].jB, 0);

    if(donut) donut.destroy();

    if (!isMultiYear) {
        document.getElementById('donutTitle').innerHTML = `📊 สัดส่วนเป้าหมาย <small>(คลิกเมาส์/แตะเบิ้ลดูรายละเอียด)</small>`;
        let data = sortedKeys.map(k => currentMode === 'count' ? (stratStats[k].sC + stratStats[k].jC) : (stratStats[k].sB + stratStats[k].jB));
        let overallTotal = currentMode === 'count' ? totalC : totalB;
        let lPct = displayLabels.map((l, i) => `${l} (${overallTotal>0 ? ((data[i]*100)/overallTotal).toFixed(1) : 0}%)`);

        let offsets = sortedKeys.map(k => (k === activeSubStrategy) ? 20 : 0);

        const clickHandlerSingle = (e, elements) => {
            if(!elements.length) return;
            let idx = elements[0].index;
            let clickedStrat = fullLabels[idx];
            if (clickedStrat === "ไม่ระบุ") return;

            if (activeSubStrategy === clickedStrat) {
                clearSubStratFilter();
                return;
            }

            let st = stratStats[clickedStrat];
            let isTouch = false;
            if (e.native && (e.native.pointerType === 'touch' || e.native.type.includes('touch'))) isTouch = true;
            else if (window.matchMedia("(pointer: coarse)").matches) isTouch = true;

            let yearLabel = sYears.length > 0 ? `ปีงบประมาณ ${sYears[0]}` : "ทุกปี";

            if (isTouch) {
                let currentTime = new Date().getTime();
                if (currentTime - lastClickTime < 500 && lastClickedIndex === idx) {
                    openStratModal(clickedStrat, st.sC, st.jC, st.sB, st.jB, overallTotal, yearLabel);
                }
                lastClickTime = currentTime;
                lastClickedIndex = idx;
            } else {
                openStratModal(clickedStrat, st.sC, st.jC, st.sB, st.jB, overallTotal, yearLabel);
            }
        };

        donut = new Chart(ctx, {
            type: 'doughnut',
            data: { 
                labels: lPct, 
                datasets: [{ 
                    data: data, 
                    backgroundColor: chartColors,
                    offset: offsets 
                }] 
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { 
                    legend: { position: 'right', labels: {font:{family:'Sarabun', size: 10}} },
                    tooltip: { callbacks: { 
                        label: c => {
                            let k = fullLabels[c.dataIndex];
                            let st = stratStats[k];
                            // 🌟 Tooltip กราฟโดนัท (ปีเดียว)
                            if(currentMode === 'count') {
                                let jointText = st.jC > 0 ? ` (+${st.jC})` : '';
                                return ` ปี ${sYears[0]}: ${st.sC}${jointText} โครงการ`;
                            } else {
                                return ` ปี ${sYears[0]}: ${(st.sB + st.jB).toLocaleString()} บาท`;
                            }
                        }
                    }},
                    datalabels: { color: '#fff', font: { weight: 'bold', size: 11 }, formatter: v => overallTotal > 0 && (v*100/overallTotal) >= 5 ? (v*100/overallTotal).toFixed(1) + "%" : "" }
                },
                onClick: clickHandlerSingle
            }
        });
    } else {
        document.getElementById('donutTitle').innerHTML = `📊 เปรียบเทียบเป้าหมายรายปี <small>(คลิกที่แท่งดูรายละเอียด)</small>`;
        
        let datasets = [];
        sYears.forEach((y, idx) => {
            let baseColor = chartColors[idx % chartColors.length];
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
            let idx = elements[0].index;
            let dataIndex = elements[0].datasetIndex;
            let clickedStrat = fullLabels[idx];
            if (clickedStrat === "ไม่ระบุ") return;

            if (activeSubStrategy === clickedStrat) {
                clearSubStratFilter();
                return;
            }

            // หาว่าคลิกที่ปีไหน จาก label ของ dataset
            let dsLabel = donut.data.datasets[dataIndex].label;
            let yearMatch = dsLabel.match(/ปี (\d+)/);
            if (!yearMatch) return;
            let clickedYear = yearMatch[1];
            
            let st = stratStats[clickedStrat].yData[clickedYear];
            let overallTotalYear = currentMode === 'count' ? 
                sortedKeys.reduce((a, k) => a + stratStats[k].yData[clickedYear].sC + stratStats[k].yData[clickedYear].jC, 0) : 
                sortedKeys.reduce((a, k) => a + stratStats[k].yData[clickedYear].sB + stratStats[k].yData[clickedYear].jB, 0);

            let isTouch = false;
            if (e.native && (e.native.pointerType === 'touch' || e.native.type.includes('touch'))) isTouch = true;
            else if (window.matchMedia("(pointer: coarse)").matches) isTouch = true;

            let yearLabel = `ปีงบประมาณ ${clickedYear}`;

            if (isTouch) {
                let currentTime = new Date().getTime();
                if (currentTime - lastClickTime < 500 && lastClickedIndex === idx) {
                    openStratModal(clickedStrat, st.sC, st.jC, st.sB, st.jB, overallTotalYear, yearLabel);
                }
                lastClickTime = currentTime;
                lastClickedIndex = idx;
            } else {
                openStratModal(clickedStrat, st.sC, st.jC, st.sB, st.jB, overallTotalYear, yearLabel);
            }
        };

        donut = new Chart(ctx, {
            type: 'bar',
            data: { labels: displayLabels, datasets: datasets },
            options: { 
                indexAxis: 'y', 
                responsive: true, maintainAspectRatio: false, 
                scales: { 
                    x: { stacked: true, beginAtZero: true }, 
                    y: { stacked: true, ticks: { font: {family:'Sarabun', size: 11} } } 
                },
                plugins: { 
                    legend: { position: 'bottom', labels: {font:{family:'Sarabun', size: 10}} },
                    tooltip: { mode: 'index', intersect: false, callbacks: { 
                        title: c => fullLabels[c[0].dataIndex],
                        // 🌟 Tooltip กราฟแท่ง
                        label: c => {
                            let k = fullLabels[c[0].dataIndex]; 
                            let y = c.dataset.label.replace(' (เดี่ยว)','').replace(' (ร่วม)',''); 
                            let st = stratStats[k].yData[y.replace('ปี ', '')];
                            
                            if(currentMode === 'count') {
                                let totalC = st.sC + st.jC;
                                if (totalC === 0) return null;
                                if (c.dataset.label.includes('เดี่ยว')) {
                                    let jointText = st.jC > 0 ? ` (+${st.jC})` : '';
                                    return ` ${y}: ${st.sC}${jointText} โครงการ`;
                                } else {
                                    return null; 
                                }
                            } else {
                                let totalB = st.sB + st.jB;
                                if (totalB === 0) return null;
                                if (c.dataset.label.includes('เดี่ยว')) {
                                    return ` ${y}: ${totalB.toLocaleString()} บาท`;
                                } else {
                                    return null;
                                }
                            }
                        }
                    }},
                    datalabels: { display: false } 
                },
                onClick: clickHandlerMulti
            }
        });
    }
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
}

function renderMap(sDists, sYears) {
    if (!map) {
        map = L.map('map', {scrollWheelZoom: false, preferCanvas: true}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    let dStats = {};
    dNames.forEach(d => { 
        dStats[d] = { total: {cS: 0, bS: 0, cM: 0, bM: 0, cP: 0, bP: 0}, years: {} }; 
        sYears.forEach(y => dStats[d].years[y] = {cS: 0, bS: 0, cM: 0, bM: 0, cP: 0, bP: 0});
    });

    filteredData.forEach(r => {
        let yr = r._y;
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
    });

    if (!districtGeo) return;
    if(geoLayer) map.removeLayer(geoLayer);
    
    let isDist = sDists.length > 0;

    geoLayer = L.geoJSON(districtGeo, {
        style: (f) => {
            let d = f.properties.amp_th || f.properties.AMP_TH;
            let s = dStats[d].total;
            let v = s.cS + s.cM; 
            
            let color = '#fef08a'; 
            if (isProvincialOnly) {
                color = '#3b82f6'; 
            } else {
                color = v > 10 ? '#1e3a8a' : v > 5 ? '#2563eb' : v > 2 ? '#60a5fa' : v > 0 ? '#93c5fd' : '#fef08a';
            }
            
            let dim = false;
            if (!isProvincialOnly && sDists.length > 0 && sDists.length < 25) { 
                if (!sDists.includes(d)) dim = true; 
            }
            
            if (dim) return { fillColor: '#e2e8f0', weight: 1, opacity: 0.5, color: '#fff', fillOpacity: 0.3 };
            return { fillColor: color, weight: 1, opacity: 1, color: '#fff', fillOpacity: 0.8 };
        },
        onEachFeature: (f, l) => {
            let d = f.properties.amp_th || f.properties.AMP_TH;
            let st = dStats[d];
            let s = st.total;
            
            let pop = `<div style="font-family:'Sarabun'; width: 300px; max-height:350px; overflow-y:auto;">
                <b style="font-size:16px; color:#1e3a8a;">📍 อำเภอ${d}</b>
                <hr style="margin:5px 0;">
                <div style="font-size:13px; line-height: 1.5;">
                    <b style="color:#10b981;">✅ โครงการเฉพาะพื้นที่อำเภอนี้:</b><br>
                    รวมทั้งหมด: <b>${s.cS}</b> โครงการ | งบตรง <b>${s.bS.toLocaleString()}</b> บาท<br>`;
            
            if(sYears.length > 1) {
                pop += `<ul style="padding-left:15px; margin:2px 0; color:#475569; font-size:11px;">`;
                sYears.forEach(y => {
                    if (st.years[y].cS > 0) pop += `<li>ปี ${y}: ${st.years[y].cS} โครงการ (${st.years[y].bS.toLocaleString()} บ.)</li>`;
                });
                pop += `</ul>`;
            }

            pop += `<hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                    <b style="color:#f59e0b;">📦 โครงการที่ทำร่วมกับพื้นที่อื่น:</b><br>
                    รวมทั้งหมด: <b>${s.cM}</b> โครงการ<br>
                    งบรวมที่ครอบคลุมถึง: <b>${s.bM.toLocaleString()}</b> บาท<br>
                    <span style="color:#ef4444; font-size:11px;">(งบนี้เป็นยอดรวมโครงการทั้งหมด ไม่นำมาหารเฉลี่ย)</span><br>`;
            
            if(sYears.length > 1) {
                pop += `<ul style="padding-left:15px; margin:2px 0; color:#475569; font-size:11px;">`;
                sYears.forEach(y => {
                    if (st.years[y].cM > 0) pop += `<li>ปี ${y}: ${st.years[y].cM} โครงการ (${st.years[y].bM.toLocaleString()} บ.)</li>`;
                });
                pop += `</ul>`;
            }

            pop += `<hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                    <b style="color:#ef4444;">🌐 โครงการที่ครอบคลุมทั้งจังหวัด:</b><br>
                    อำเภอนี้ได้รับประโยชน์จาก <b>${s.cP}</b> โครงการ<br>
                    งบรวมระดับจังหวัด: <b>${s.bP.toLocaleString()}</b> บาท`;
            
            if(sYears.length > 1) {
                pop += `<ul style="padding-left:15px; margin:2px 0; color:#475569; font-size:11px;">`;
                sYears.forEach(y => {
                    if (st.years[y].cP > 0) pop += `<li>ปี ${y}: ${st.years[y].cP} โครงการ (${st.years[y].bP.toLocaleString()} บ.)</li>`;
                });
                pop += `</ul>`;
            }

            pop += `</div></div>`;
            l.bindPopup(pop);
            l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
            l.on('mouseout', e => geoLayer.resetStyle(e.target));
        }
    }).addTo(map);
}

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

        let detailTr = document.createElement('tr');
        detailTr.className = 'district-details';
        detailTr.id = `detail-${y}`;
        
        let distRowsHtml = '';

        if (provStats.cP > 0) {
            distRowsHtml += `
                <tr class="provincial-row" onclick="filterFromTable('Provincial')" title="คลิกเพื่อกรองดูกราฟเฉพาะโครงการภาพรวมจังหวัด">
                    <td>🌐 โครงการครอบคลุมทั้งจังหวัด</td>
                    <td style="text-align:center;">${provStats.cP} โครงการ</td>
                    <td style="text-align:right; color:gray;">(งบภาพรวม)</td>
                    <td style="text-align:right;">${provStats.bP.toLocaleString()}</td>
                </tr>
            `;
        }

        dNames.forEach(d => {
            let s = dStats[d];
            if(s.cS > 0 || s.cM > 0) {
                distRowsHtml += `
                    <tr onclick="filterFromTable('${d}')">
                        <td>📍 อ.${d}</td>
                        <td style="text-align:center;">${s.cS} <span style="color:#64748b; font-size:10px;">(+${s.cM} ร่วม)</span></td>
                        <td style="text-align:right; color:#10b981;"><b>${s.bS.toLocaleString()}</b></td>
                        <td style="text-align:right; color:#64748b; font-size:11px;">${s.bM.toLocaleString()}</td>
                    </tr>
                `;
            }
        });

        if(distRowsHtml === '') distRowsHtml = '<tr><td colspan="4" style="text-align:center; color:gray;">ไม่มีข้อมูลลงพื้นที่ในปีนี้</td></tr>';

        detailTr.innerHTML = `
            <td colspan="3" style="padding:0; background: #f8fafc;">
                <div style="max-height: 250px; overflow-y: auto; padding: 5px;">
                    <table class="district-table">
                        <thead style="background:#e2e8f0; position:sticky; top:0;">
                            <tr>
                                <th style="width:25%;">พื้นที่ (คลิกเพื่อกรอง)</th>
                                <th style="text-align:center; width:25%;">โครงการเฉพาะพื้นที่<br><small>(+ร่วมพื้นที่)</small></th>
                                <th style="text-align:right; width:25%;">งบเฉพาะพื้นที่อำเภอนี้โดยตรง<br><small style="color:#10b981;">(นับรวมเป็นผลงาน)</small></th>
                                <th style="text-align:right; width:25%;">งบที่ครอบคลุมพื้นที่อำเภอนี้<br><small style="color:#ef4444;">(ไม่นำมาหารลงพื้นที่ เป็นงบรวมทั้งโครงการ)</small></th>
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
