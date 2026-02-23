// ==========================================
// 🚨 วาง URL ของ Google Script ของคุณตรงนี้
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

let masterData = [];   
let filteredData = []; 
let currentMode = 'count'; 
let myChart = null;
let areaChart = null;
let map = null;
let geojsonLayer = null;

let mapFilterDistrict = "all";
let mapFilterProject = "all";

// ==========================================
// 1. สร้าง Slicer ล่วงหน้า
// ==========================================
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

    document.querySelectorAll('select.slicer, .search-box, .year-select').forEach(el => el.addEventListener('input', applyFilters));
    document.getElementById('modeSwitch').addEventListener('change', (e) => { currentMode = e.target.checked ? 'budget' : 'count'; updateDashboard(); });
}

// ==========================================
// 2. ดึงข้อมูล (Safe Parsing กันบัคจอขาว)
// ==========================================
async function init() {
    buildStaticSlicers(); 

    try {
        const response = await fetch(API_URL);
        masterData = await response.json();
        
        if (!Array.isArray(masterData)) throw new Error(masterData.error || "ข้อมูลที่ส่งมาไม่ใช่ Array");

        const years = new Set();
        masterData.forEach(row => {
            // บังคับแปลงเป็น String ก่อน เพื่อกันบัคเวลาข้อมูลใน Excel เป็นตัวเลขล้วน
            let budgetStr = String(row["งบประมาณ (ตัวเลข)"] || row["งบประมาณ"] || "0");
            row._budgetNum = parseFloat(budgetStr.replace(/,/g, '')) || 0;
            
            row._year = String(row["ปีงบประมาณ"] || "ไม่ระบุ");
            if(row._year !== "ไม่ระบุ") years.add(row._year);
            
            let rawArea = String(row["พื้นที่เป้าหมายทั้งหมด"] || row["⚙️ ขอบเขตพื้นที่ (Auto)"] || row["ขอบเขตพื้นที่"] || "ไม่ระบุ");
            row._cleanArea = rawArea.replace(/จังหวัดเชียงใหม่/g, "").replace(/\s+/g, " ").trim();
            if(row._cleanArea.endsWith(",")) row._cleanArea = row._cleanArea.slice(0, -1);
            
            if (row._cleanArea.includes("ครอบคลุมทั้งจังหวัด")) row._areaType = "Provincial";
            else if (row._cleanArea.includes(",")) row._areaType = "Multi";
            else row._areaType = "Single";
        });

        const yearSelect = document.getElementById('filterYear');
        [...years].sort().forEach(y => yearSelect.innerHTML += `<option value="${y}">📅 ปีงบประมาณ ${y}</option>`);

        filteredData = [...masterData];
        updateDashboard();

    } catch (error) {
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;"><b>❌ เกิดข้อผิดพลาด:</b> ${error.message} <br>โปรดตรวจสอบ URL ของ API หรือโครงสร้างคอลัมน์ใน Excel</td></tr>`;
        document.getElementById('activeFiltersText').innerHTML = "<strong>❌ ไม่สามารถโหลดข้อมูลได้</strong>";
    }
}

// ==========================================
// 3. ระบบกรอง
// ==========================================
function applyFilters() {
    const searchTxt = document.getElementById('globalSearch').value.toLowerCase();
    const fYear = document.getElementById('filterYear').value;
    const fNat = document.getElementById('filterNat').value;
    const fMaster = document.getElementById('filterMaster').value;
    const fPlan13 = document.getElementById('filterPlan13').value;
    const fNorth = document.getElementById('filterNorth').value;
    const fProv = document.getElementById('filterProv').value;

    filteredData = masterData.filter(row => {
        // ใช้ String() ครอบทุกจุดเพื่อกันบัค
        const colNat = String(row["ยุทธศาสตร์ชาติ 20 ปี"] || "");
        const colMaster = String(row["แผนแม่บทภายใต้ยุทธศาสตร์ชาติ"] || "");
        const colPlan13 = String(row["แผนพัฒนาฯ ฉบับที่ 13"] || "");
        const colNorth = String(row["แผนพัฒนาภาคเหนือ"] || "");
        const colProv = String(row["ประเด็นการพัฒนาจังหวัด (2566-2570)"] || "");

        const matchSearch = searchTxt === "" || Object.values(row).join(" ").toLowerCase().includes(searchTxt);
        const matchYear = fYear === "all" || row._year === fYear;
        const matchNat = fNat === "all" || colNat.includes(fNat);
        const matchMaster = fMaster === "all" || colMaster.includes(fMaster);
        const matchPlan13 = fPlan13 === "all" || colPlan13.includes(fPlan13);
        const matchNorth = fNorth === "all" || colNorth.includes(fNorth);
        const matchProv = fProv === "all" || colProv.includes(fProv);
        
        const matchMapDist = mapFilterDistrict === "all" || row._cleanArea.includes(mapFilterDistrict);
        const matchMapProj = mapFilterProject === "all" || String(row["ชื่อโครงการ"] || "") === mapFilterProject;

        return matchSearch && matchYear && matchNat && matchMaster && matchPlan13 && matchNorth && matchProv && matchMapDist && matchMapProj;
    });

    // เรียง ก-ฮ (ใช้ String บังคับเพื่อไม่ให้พังถ้าชื่อโปรเจกต์เป็นตัวเลข)
    filteredData.sort((a, b) => String(a["ชื่อโครงการ"] || "").localeCompare(String(b["ชื่อโครงการ"] || ""), 'th'));

    updateDashboard();
}

function clearAllFilters() {
    document.getElementById('globalSearch').value = "";
    document.getElementById('filterYear').value = "all";
    document.querySelectorAll('.slicer').forEach(el => el.value = "all");
    mapFilterDistrict = "all";
    mapFilterProject = "all";
    applyFilters();
}

// ==========================================
// 4. อัปเดต UI
// ==========================================
function updateDashboard() {
    document.getElementById('sumProjects').innerText = filteredData.length.toLocaleString();
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);
    document.getElementById('sumBudget').innerText = totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2});

    let activeTexts = [];
    if(document.getElementById('filterYear').value !== "all") activeTexts.push(`ปีงบ: ${document.getElementById('filterYear').value}`);
    if(document.getElementById('filterNat').value !== "all") activeTexts.push(`ยุทธศาสตร์ชาติ`);
    if(document.getElementById('filterMaster').value !== "all") activeTexts.push(`แผนแม่บทฯ`);
    if(document.getElementById('filterPlan13').value !== "all") activeTexts.push(`แผนฯ 13`);
    if(document.getElementById('filterNorth').value !== "all") activeTexts.push(`แผนภาคเหนือ`);
    if(document.getElementById('filterProv').value !== "all") activeTexts.push(`แผนจังหวัด`);
    if(mapFilterDistrict !== "all") activeTexts.push(`เฉพาะอำเภอ: ${mapFilterDistrict}`);
    if(mapFilterProject !== "all") activeTexts.push(`โครงการเจาะจง`);
    
    let filterStr = activeTexts.length > 0 ? activeTexts.join(" | ") : "แสดงข้อมูลทั้งหมด (ไม่มีการกรอง)";
    document.getElementById('activeFiltersText').innerHTML = `<strong>🔍 สถานะการกรองปัจจุบัน:</strong> ${filterStr} <span style="margin-left:15px; color:#1e3a8a;">(โหมด: ${currentMode === 'budget' ? 'รวมงบประมาณ' : 'นับจำนวน'})</span>`;

    renderTable();
    renderCharts();
    setTimeout(renderMap, 300);
}

// ==========================================
// 5. วาดกราฟ
// ==========================================
function renderCharts() {
    const ctxMain = document.getElementById('mainChart');
    let strategyCounts = {};
    filteredData.forEach(row => {
        let rawProv = String(row["ประเด็นการพัฒนาจังหวัด (2566-2570)"] || "ไม่ระบุ");
        let strategies = rawProv.split(",").map(s => s.trim()).filter(s => s !== "");
        if (strategies.length === 0) strategies = ["ไม่ระบุ"];
        strategies.forEach(strat => {
            let shortName = strat.split(" ").slice(0,3).join(" ");
            if(!strategyCounts[shortName]) strategyCounts[shortName] = 0;
            if(currentMode === 'budget') strategyCounts[shortName] += (row._budgetNum / strategies.length); 
            else strategyCounts[shortName] += 1; 
        });
    });

    if (myChart) myChart.destroy();
    myChart = new Chart(ctxMain, {
        type: 'bar',
        data: {
            labels: Object.keys(strategyCounts),
            datasets: [{
                label: currentMode === 'budget' ? 'งบ (บาท)' : 'โครงการ',
                data: Object.values(strategyCounts),
                backgroundColor: '#3b82f6'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctxArea = document.getElementById('areaChart');
    let areaCounts = { 'Single (เฉพาะพื้นที่)': 0, 'Multi (หลายอำเภอ)': 0, 'Provincial (ทั้งจังหวัด)': 0 };
    filteredData.forEach(row => {
        let key = row._areaType === 'Single' ? 'Single (เฉพาะพื้นที่)' : row._areaType === 'Multi' ? 'Multi (หลายอำเภอ)' : 'Provincial (ทั้งจังหวัด)';
        if (currentMode === 'budget') areaCounts[key] += row._budgetNum;
        else areaCounts[key] += 1;
    });

    if (areaChart) areaChart.destroy();
    areaChart = new Chart(ctxArea, {
        type: 'doughnut',
        data: {
            labels: Object.keys(areaCounts),
            datasets: [{
                data: Object.values(areaCounts),
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

// ==========================================
// 6. แผนที่ Leaflet
// ==========================================
function setDistrictFilter(dName) {
    mapFilterDistrict = dName;
    mapFilterProject = "all";
    closeModal();
    applyFilters();
}

function renderMap() {
    if (!map) {
        map = L.map('map', {scrollWheelZoom: false}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    let districtStats = {};
    const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];
    dNames.forEach(d => districtStats[d] = { singleC: 0, singleB: 0, multiC: 0, multiB: 0 });

    filteredData.forEach(row => {
        let area = row._cleanArea;
        if(row._areaType === "Single") {
            let matched = dNames.filter(d => area.includes(d));
            matched.forEach(d => { districtStats[d].singleC += 1; districtStats[d].singleB += row._budgetNum; });
        } else if(row._areaType === "Multi") {
            let matched = dNames.filter(d => area.includes(d));
            matched.forEach(d => { districtStats[d].multiC += 1; districtStats[d].multiB += (row._budgetNum / matched.length); });
        }
    });

    fetch("districts.json").then(res => res.json()).then(geoData => {
        if(geojsonLayer) map.removeLayer(geojsonLayer);
        geojsonLayer = L.geoJSON(geoData, {
            style: function (f) {
                let val = currentMode === 'budget' ? districtStats[f.properties.amp_th].singleB : districtStats[f.properties.amp_th].singleC;
                let color = '#FFEDA0';
                if (currentMode === 'budget') color = val > 50000000 ? '#800026' : val > 10000000 ? '#BD0026' : val > 1000000 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                else color = val > 10 ? '#800026' : val > 5 ? '#BD0026' : val > 2 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                return { fillColor: color, weight: 1, opacity: 1, color: '#333', fillOpacity: 0.8 };
            },
            onEachFeature: function (f, l) {
                let s = districtStats[f.properties.amp_th];
                let popupHtml = `
                    <div style="font-family:'Sarabun'; width: 220px;">
                        <b style="font-size:16px; color:#1e3a8a;">📍 อำเภอ${f.properties.amp_th}</b><hr style="margin:5px 0;">
                        <div style="font-size:13px; line-height: 1.4;">
                            <b style="color:#10b981;">🔹 โครงการเฉพาะพื้นที่ (Single)</b><br>
                            จำนวน: ${s.singleC} โครงการ<br>งบ: ${s.singleB.toLocaleString()} บาท<br>
                            <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
                            <b style="color:#f59e0b;">🔸 โครงการร่วมพื้นที่ (Multi)</b><br>
                            จำนวน: ${s.multiC} โครงการ<br>งบ: ${s.multiB.toLocaleString(undefined, {minimumFractionDigits:0})} บาท
                        </div>
                        <button onclick="setDistrictFilter('${f.properties.amp_th}')" style="margin-top:10px; width:100%; padding:6px; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer;">🔍 กรองข้อมูลเฉพาะอำเภอนี้</button>
                    </div>
                `;
                l.bindPopup(popupHtml);
                l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
                l.on('mouseout', e => geojsonLayer.resetStyle(e.target));
            }
        }).addTo(map);
    }).catch(e => console.log("รอไฟล์ districts.json"));
}

// ==========================================
// 7. ตาราง & Modal
// ==========================================
function setProjectFilter(projName) {
    mapFilterProject = projName;
    mapFilterDistrict = "all";
    closeModal();
    applyFilters();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    if(filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการกรอง</td></tr>`; return;
    }
    filteredData.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.onclick = () => openModal(idx); 
        tr.innerHTML = `<td><strong>${row["ชื่อโครงการ"] || "-"}</strong></td><td>${row._year}</td><td>${row._cleanArea}</td><td style="text-align:right; font-weight:bold; color:var(--primary);">${row._budgetNum.toLocaleString()}</td>`;
        tbody.appendChild(tr);
    });
}

function openModal(idx) {
    const row = filteredData[idx];
    document.getElementById('modalTitle').innerText = row["ชื่อโครงการ"] || "-";
    document.getElementById('modalArea').innerText = row._cleanArea;
    document.getElementById('modalBudget').innerText = row._budgetNum.toLocaleString();
    document.getElementById('modalYear').innerText = row._year;
    document.getElementById('modalAreaType').innerText = row._areaType + (row._areaType==='Single'?" (เฉพาะพื้นที่)":row._areaType==='Multi'?" (หลายพื้นที่)":" (ทั้งจังหวัด)");

    const subDiv = document.getElementById('modalSubActivities');
    const rawSub = String(row["รายละเอียดย่อย"] || ""); 
    const cleanSub = rawSub.replace(/\n/g, "  ").trim();
    subDiv.innerHTML = (!cleanSub) ? "<p style='color:gray;'>- ไม่มีข้อมูลรายละเอียด -</p>" : `<div class="sub-activity-box">${cleanSub}</div>`;
    
    document.getElementById('modalFilterBtnContainer').innerHTML = `<button class="btn-filter-project" onclick="setProjectFilter(\`${row["ชื่อโครงการ"]}\`)">📍 กดเพื่อแสดงพื้นที่ดำเนินการของโครงการนี้บนแผนที่</button>`;

    document.getElementById('projectModal').style.display = "block";
}
function closeModal() { document.getElementById('projectModal').style.display = "none"; }
window.onclick = e => { if (e.target == document.getElementById('projectModal')) closeModal(); }

init();
