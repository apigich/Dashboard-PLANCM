// ==========================================
// 🚨 วาง URL ของคุณตรงนี้ (ห้ามลบเครื่องหมายคำพูด)
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

let masterData = [];   
let filteredData = []; 
let currentMode = 'count'; 
let myChart = null;
let map = null;
let geojsonLayer = null;

// ==========================================
// 1. สร้าง Slicer ล่วงหน้า (กันพังตอนโหลดข้อมูล)
// ==========================================
function buildStaticSlicers() {
    // ดึงฐานข้อมูลยุทธศาสตร์ 100% จาก Auto Fill ของคุณ
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

    // ผูก Event รอไว้เลย
    document.querySelectorAll('select, .search-box').forEach(el => el.addEventListener('input', applyFilters));
    document.getElementById('modeSwitch').addEventListener('change', (e) => { currentMode = e.target.checked ? 'budget' : 'count'; updateDashboard(); });
    document.getElementById('chartTypeSelect').addEventListener('change', renderChart);
}

// ==========================================
// 2. ดึงข้อมูลจาก Google Sheets
// ==========================================
async function init() {
    buildStaticSlicers(); // วาดเมนูกรองรอไว้ก่อนเลย

    try {
        const response = await fetch(API_URL);
        masterData = await response.json();
        
        // ดัก Error กรณีชื่อ Sheet ผิด หรือ ลิงก์พัง
        if (!Array.isArray(masterData)) {
            let errMsg = masterData.error ? masterData.error : "ข้อมูลที่ส่งมาไม่ถูกต้อง (ไม่ใช่ Array)";
            throw new Error(errMsg);
        }

        // คลีนข้อมูล และดึงปีงบประมาณอัตโนมัติ
        const years = new Set();
        masterData.forEach(row => {
            let budgetStr = row["งบประมาณ"] || row["งบประมาณ (บาท)"] || "0";
            row._budgetNum = parseFloat(String(budgetStr).replace(/,/g, '')) || 0;
            row._year = row["ปีงบประมาณ"] || "ไม่ระบุ";
            if(row._year !== "ไม่ระบุ") years.add(row._year);
        });

        // เติมตัวเลือกปีงบประมาณ
        const yearSelect = document.getElementById('filterYear');
        [...years].sort().forEach(y => yearSelect.innerHTML += `<option value="${y}">📅 ปีงบประมาณ ${y}</option>`);

        filteredData = [...masterData];
        updateDashboard();

    } catch (error) {
        console.error(error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="color:red; text-align:center; padding: 30px;"><b>❌ เกิดข้อผิดพลาด:</b> ${error.message} <br><br><i>โปรดตรวจสอบว่าลิงก์ API ถูกต้อง และไฟล์ Google Sheets มีชีตชื่อ <b>MainData</b> (หรือชื่อตรงกับใน Code.gs)</i></td></tr>`;
        document.getElementById('statusProjects').innerText = "โหลดข้อมูลล้มเหลว";
        document.getElementById('statusBudget').innerText = "โหลดข้อมูลล้มเหลว";
    }
}

// ==========================================
// 3. ระบบกรองข้อมูล (Smart Slicer & Search)
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
        // ใช้ชื่อคอลัมน์แบบเผื่อไว้ (เผื่อคุณตั้งชื่อหัวคอลัมน์ใน Excel ไว้หลายแบบ)
        const colNat = row["ยุทธศาสตร์ชาติ 20 ปี"] || row["ยุทธศาสตร์ชาติ"] || "";
        const colMaster = row["แผนแม่บทฯ"] || row["แผนแม่บท"] || "";
        const colPlan13 = row["แผนพัฒนาฯ ฉบับที่ 13"] || row["แผนพัฒนาฯ"] || row["แผน 13"] || "";
        const colNorth = row["แผนพัฒนากลุ่มจังหวัดภาคเหนือ"] || row["แผนกลุ่มจังหวัด"] || "";
        const colProv = row["แผนพัฒนาจังหวัดเชียงใหม่"] || row["แผนจังหวัด"] || "";

        const matchSearch = searchTxt === "" || Object.values(row).join(" ").toLowerCase().includes(searchTxt);
        const matchYear = fYear === "all" || row._year === fYear;
        const matchNat = fNat === "all" || colNat.includes(fNat);
        const matchMaster = fMaster === "all" || colMaster.includes(fMaster);
        const matchPlan13 = fPlan13 === "all" || colPlan13.includes(fPlan13);
        const matchNorth = fNorth === "all" || colNorth.includes(fNorth);
        const matchProv = fProv === "all" || colProv.includes(fProv);

        return matchSearch && matchYear && matchNat && matchMaster && matchPlan13 && matchNorth && matchProv;
    });

    updateDashboard();
}

// ==========================================
// 4. อัปเดต UI ทั้งหมด
// ==========================================
function updateDashboard() {
    document.getElementById('sumProjects').innerText = filteredData.length.toLocaleString();
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);
    document.getElementById('sumBudget').innerText = totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2});

    document.getElementById('statusProjects').innerText = `กำลังแสดงข้อมูล: ${document.getElementById('filterYear').value === 'all' ? 'ทุกปี' : document.getElementById('filterYear').value}`;
    document.getElementById('statusBudget').innerText = `โหมด: ${currentMode === 'budget' ? 'รวมงบประมาณ' : 'นับจำนวน'}`;

    renderTable();
    renderChart();
    setTimeout(renderMap, 300);
}

// ==========================================
// 5. วาดกราฟ & ระบบ Joint
// ==========================================
function renderChart() {
    const ctx = document.getElementById('mainChart');
    if(!ctx) return;

    let strategyCounts = {};
    filteredData.forEach(row => {
        let rawProv = row["แผนพัฒนาจังหวัดเชียงใหม่"] || row["แผนจังหวัด"] || "ไม่ระบุ";
        let strategies = String(rawProv).split(",").map(s => s.trim()).filter(s => s !== "");
        if (strategies.length === 0) strategies = ["ไม่ระบุ"];
        
        strategies.forEach(strat => {
            // เพื่อความสวยงาม ตัดข้อความกราฟให้สั้นลง (เอาแค่คำว่า "ประเด็นการพัฒนาที่ X")
            let shortName = strat.split(" ")[0] + " " + strat.split(" ")[1] + " " + (strat.split(" ")[2] || "");
            
            if(!strategyCounts[shortName]) strategyCounts[shortName] = 0;
            if(currentMode === 'budget') strategyCounts[shortName] += (row._budgetNum / strategies.length); 
            else strategyCounts[shortName] += 1; 
        });
    });

    if (myChart) myChart.destroy();
    const cType = document.getElementById('chartTypeSelect').value;
    
    myChart = new Chart(ctx, {
        type: cType,
        data: {
            labels: Object.keys(strategyCounts),
            datasets: [{
                label: currentMode === 'budget' ? 'งบ (บาท)' : 'โครงการ',
                data: Object.values(strategyCounts),
                backgroundColor: ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: cType === 'doughnut' ? 'right' : 'bottom' } }
        }
    });
}

// ==========================================
// 6. แผนที่ Leaflet (รองรับ Joint)
// ==========================================
function renderMap() {
    if (!map) {
        map = L.map('map', {scrollWheelZoom: false}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }

    let districtStats = {};
    const dNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];
    dNames.forEach(d => districtStats[d] = { count: 0, budget: 0 });

    filteredData.forEach(row => {
        let area = row["ขอบเขตพื้นที่"] || row["ขอบเขตพื้นที่ (Auto)"] || "";
        let matched = area.includes("ครอบคลุมทั้งจังหวัด") ? dNames : dNames.filter(d => area.includes(d));
        if(matched.length > 0) {
            let b = row._budgetNum / matched.length; 
            matched.forEach(d => { districtStats[d].count += 1; districtStats[d].budget += b; });
        }
    });

    fetch("districts.json")
        .then(res => res.json())
        .then(geoData => {
            if(geojsonLayer) map.removeLayer(geojsonLayer);
            geojsonLayer = L.geoJSON(geoData, {
                style: function (f) {
                    let val = districtStats[f.properties.amp_th] ? (currentMode === 'budget' ? districtStats[f.properties.amp_th].budget : districtStats[f.properties.amp_th].count) : 0;
                    let color = '#FFEDA0';
                    if (currentMode === 'budget') color = val > 50000000 ? '#800026' : val > 10000000 ? '#BD0026' : val > 1000000 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                    else color = val > 20 ? '#800026' : val > 10 ? '#BD0026' : val > 5 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                    return { fillColor: color, weight: 1, opacity: 1, color: '#333', fillOpacity: 0.8 };
                },
                onEachFeature: function (f, l) {
                    let stats = districtStats[f.properties.amp_th] || {count: 0, budget: 0};
                    l.bindPopup(`<div style="font-family:'Sarabun'"><b>📍 อำเภอ${f.properties.amp_th}</b><br>จำนวน: ${stats.count} โครงการ<br>งบ: ${stats.budget.toLocaleString()} บาท</div>`);
                    l.on('mouseover', e => { e.target.setStyle({weight: 3, color: '#f59e0b'}); e.target.bringToFront(); });
                    l.on('mouseout', e => geojsonLayer.resetStyle(e.target));
                }
            }).addTo(map);
        }).catch(e => console.log("กำลังรอไฟล์ districts.json"));
}

// ==========================================
// 7. ตาราง และ Popup (Point 7)
// ==========================================
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    if(filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">ไม่พบข้อมูลโครงการตามเงื่อนไข</td></tr>`; return;
    }
    filteredData.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.onclick = () => openModal(idx); 
        tr.innerHTML = `<td><strong>${row["ชื่อโครงการ"] || row["ชื่อโครงการ (Project Name)"] || "-"}</strong></td><td>${row["หน่วยงานรับผิดชอบ"] || "-"}</td><td>${row["ขอบเขตพื้นที่"] || row["ขอบเขตพื้นที่ (Auto)"] || "-"}</td><td style="text-align:right; font-weight:bold; color:var(--primary);">${row._budgetNum.toLocaleString()}</td>`;
        tbody.appendChild(tr);
    });
}

function openModal(idx) {
    const row = filteredData[idx];
    document.getElementById('modalTitle').innerText = row["ชื่อโครงการ"] || "-";
    document.getElementById('modalArea').innerText = row["ขอบเขตพื้นที่"] || "-";
    document.getElementById('modalBudget').innerText = row._budgetNum.toLocaleString();
    document.getElementById('modalAgency').innerText = row["หน่วยงานรับผิดชอบ"] || "-";
    document.getElementById('modalYear').innerText = row._year;

    const subDiv = document.getElementById('modalSubActivities');
    const rawSub = row["รายละเอียดย่อย"] || row["กิจกรรมย่อย (ถ้ามี)"] || ""; 
    subDiv.innerHTML = (!rawSub || rawSub.trim() === "") ? "<p style='color:gray;'>- ไม่มีข้อมูล -</p>" : rawSub.split('\n').filter(a=>a.trim()!=="").map(a => `<div class="sub-activity-box">${a}</div>`).join('');
    document.getElementById('projectModal').style.display = "block";
}
function closeModal() { document.getElementById('projectModal').style.display = "none"; }
window.onclick = e => { if (e.target == document.getElementById('projectModal')) closeModal(); }

// ==========================================
// 8. Export (Point 4)
// ==========================================
function exportToExcel() {
    if(filteredData.length === 0) return alert("ไม่มีข้อมูล");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filteredData), "Data");
    XLSX.writeFile(wb, `ข้อมูลโครงการ_${document.getElementById('filterYear').value}.xlsx`);
}
function exportToPDF() {
    if(filteredData.length === 0) return alert("ไม่มีข้อมูล");
    document.getElementById('statusProjects').innerText = "⏳ รอสักครู่... กำลังโหลด PDF";
    html2pdf().set({ margin: 10, filename: `ตารางโครงการ.pdf`, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } }).from(document.getElementById('tableContainer')).save().then(() => updateDashboard());
}

init();
