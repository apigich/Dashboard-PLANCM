// ==========================================
// 🚨 วาง URL ของ Google Script ของคุณตรงนี้
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

let masterData = [];   
let filteredData = []; 
let currentMode = 'count'; 
let myChart = null;
let map = null;
let geojsonLayer = null;

// ==========================================
// 1. สร้าง Slicer ล่วงหน้า
// ==========================================
function buildStaticSlicers() {
    const strategyLevels = {
        filterNat: ["ด้าน 1 ความมั่นคง", "ด้าน 2 การสร้างความสามารถในการแข่งขัน", "ด้าน 3 การพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์", "ด้าน 4 การสร้างโอกาสและความเสมอภาคทางสังคม", "ด้าน 5 การสร้างการเติบโตบนคุณภาพชีวิตที่เป็นมิตรกับสิ่งแวดล้อม", "ด้าน 6 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ"],
        filterMaster: ["ประเด็นที่ 1 ความมั่นคง", "ประเด็นที่ 2 การต่างประเทศ", "ประเด็นที่ 3 การเกษตร", "ประเด็นที่ 4 อุตสาหกรรมและบริการแห่งอนาคต", "ประเด็นที่ 5 การท่องเที่ยว", "ประเด็นที่ 6 พื้นที่และเมืองน่าอยู่อัจฉริยะ", "ประเด็นที่ 7 โครงสร้างพื้นฐาน ระบบโลจิสติกส์ และดิจิทัล", "ประเด็นที่ 8 ผู้ประกอบการและวิสาหกิจขนาดกลางและขนาดย่อมยุคใหม่", "ประเด็นที่ 9 เขตเศรษฐกิจพิเศษ", "ประเด็นที่ 10 การปรับเปลี่ยนค่านิยมและวัฒนธรรม", "ประเด็นที่ 11 ศักยภาพคนตลอดช่วงชีวิต", "ประเด็นที่ 12 การพัฒนาการเรียนรู้", "ประเด็นที่ 13 การเสริมสร้างให้คนไทยมีสุขภาวะที่ดี", "ประเด็นที่ 14 ศักยภาพการกีฬา", "ประเด็นที่ 15 พลังทางสังคม", "ประเด็นที่ 16 เศรษฐกิจฐานราก", "ประเด็นที่ 17 ความเสมอภาคและหลักประกันทางสังคม", "ประเด็นที่ 18 การเติบโตอย่างยั่งยืน", "ประเด็นที่ 19 การบริหารจัดการน้ำทั้งระบบ", "ประเด็นที่ 20 การบริการประชาชนและประสิทธิภาพภาครัฐ", "ประเด็นที่ 21 การต่อต้านการทุจริตและประพฤติมิชอบ", "ประเด็นที่ 22 กฎหมายและกระบวนการยุติธรรม", "ประเด็นที่ 23 การวิจัยและพัฒนานวัตกรรม"],
        filterPlan13: ["หมุดหมายที่ 1", "หมุดหมายที่ 2", "หมุดหมายที่ 3", "หมุดหมายที่ 4", "หมุดหมายที่ 5", "หมุดหมายที่ 6", "หมุดหมายที่ 7", "หมุดหมายที่ 8", "หมุดหมายที่ 9", "หมุดหมายที่ 10", "หมุดหมายที่ 11", "หมุดหมายที่ 12", "หมุดหมายที่ 13"], 
        filterNorth: ["ประเด็นการพัฒนาที่ 1", "ประเด็นการพัฒนาที่ 2", "ประเด็นการพัฒนาที่ 3", "ประเด็นการพัฒนาที่ 4"],
        filterProv: ["ประเด็นการพัฒนาที่ 1", "ประเด็นการพัฒนาที่ 2", "ประเด็นการพัฒนาที่ 3", "ประเด็นการพัฒนาที่ 4", "ประเด็นการพัฒนาที่ 5"]
    };

    for (const [id, options] of Object.entries(strategyLevels)) {
        const select = document.getElementById(id);
        if(select) options.forEach(opt => {
            // ดึงเฉพาะชื่อสั้นๆ มาโชว์ใน Dropdown เพื่อความสวยงาม
            let shortName = opt.split(" ").slice(0,3).join(" ");
            select.innerHTML += `<option value="${shortName}">${opt}</option>`
        });
    }

    document.querySelectorAll('select, .search-box').forEach(el => el.addEventListener('input', applyFilters));
    document.getElementById('modeSwitch').addEventListener('change', (e) => { currentMode = e.target.checked ? 'budget' : 'count'; updateDashboard(); });
    document.getElementById('chartTypeSelect').addEventListener('change', renderChart);
}

// ==========================================
// 2. ดึงข้อมูล (Map ชื่อคอลัมน์ให้ตรงไฟล์จริง)
// ==========================================
async function init() {
    buildStaticSlicers(); 

    try {
        const response = await fetch(API_URL);
        masterData = await response.json();
        
        if (!Array.isArray(masterData)) {
            throw new Error(masterData.error ? masterData.error : "ข้อมูลที่ส่งมาไม่ใช่ Array");
        }

        const years = new Set();
        masterData.forEach(row => {
            // แมปชื่อคอลัมน์ให้ตรงกับไฟล์ MainData.csv แบบ 100%
            let budgetStr = row["งบประมาณ (ตัวเลข)"] || row["งบประมาณ"] || "0";
            row._budgetNum = parseFloat(String(budgetStr).replace(/,/g, '')) || 0;
            row._year = row["ปีงบประมาณ"] || "ไม่ระบุ";
            if(row._year !== "ไม่ระบุ") years.add(row._year);
            
            // ทำให้ชื่อพื้นที่เรียกง่ายขึ้น
            row._area = row["พื้นที่เป้าหมายทั้งหมด"] || row["⚙️ ขอบเขตพื้นที่ (Auto)"] || row["ขอบเขตพื้นที่"] || "ไม่ระบุ";
        });

        const yearSelect = document.getElementById('filterYear');
        [...years].sort().forEach(y => yearSelect.innerHTML += `<option value="${y}">📅 ปีงบประมาณ ${y}</option>`);

        filteredData = [...masterData];
        updateDashboard();

    } catch (error) {
        console.error(error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="color:red; text-align:center; padding: 30px;"><b>❌ เกิดข้อผิดพลาด:</b> ไม่สามารถโหลดข้อมูลได้ หรือหัวตารางไม่ตรง</td></tr>`;
    }
}

// ==========================================
// 3. ระบบกรองข้อมูล
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
        // แมปชื่อคอลัมน์ยุทธศาสตร์ให้ตรงกับไฟล์จริง
        const colNat = row["ยุทธศาสตร์ชาติ 20 ปี"] || "";
        const colMaster = row["แผนแม่บทภายใต้ยุทธศาสตร์ชาติ"] || "";
        const colPlan13 = row["แผนพัฒนาฯ ฉบับที่ 13"] || "";
        const colNorth = row["แผนพัฒนาภาคเหนือ"] || "";
        const colProv = row["ประเด็นการพัฒนาจังหวัด (2566-2570)"] || "";

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

    document.getElementById('statusProjects').innerText = `กำลังแสดง: ${document.getElementById('filterYear').value === 'all' ? 'ทุกปี' : document.getElementById('filterYear').value}`;
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
        let rawProv = row["ประเด็นการพัฒนาจังหวัด (2566-2570)"] || "ไม่ระบุ";
        let strategies = String(rawProv).split(",").map(s => s.trim()).filter(s => s !== "");
        if (strategies.length === 0) strategies = ["ไม่ระบุ"];
        
        strategies.forEach(strat => {
            let shortName = strat.split(" ")[0] + " " + (strat.split(" ")[1]||"") + " " + (strat.split(" ")[2]||"");
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
// 6. แผนที่ Leaflet
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
        let area = row._area;
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
        }).catch(e => console.log("รอไฟล์ districts.json"));
}

// ==========================================
// 7. ตาราง และ Popup
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
        tr.innerHTML = `<td><strong>${row["ชื่อโครงการ"] || "-"}</strong></td><td>${row["หน่วยงานรับผิดชอบ"] || "-"}</td><td>${row._area}</td><td style="text-align:right; font-weight:bold; color:var(--primary);">${row._budgetNum.toLocaleString()}</td>`;
        tbody.appendChild(tr);
    });
}

function openModal(idx) {
    const row = filteredData[idx];
    document.getElementById('modalTitle').innerText = row["ชื่อโครงการ"] || "-";
    document.getElementById('modalArea').innerText = row._area;
    document.getElementById('modalBudget').innerText = row._budgetNum.toLocaleString();
    document.getElementById('modalAgency').innerText = row["หน่วยงานรับผิดชอบ"] || "-";
    document.getElementById('modalYear').innerText = row._year;

    const subDiv = document.getElementById('modalSubActivities');
    const rawSub = row["รายละเอียดย่อย"] || ""; 
    subDiv.innerHTML = (!rawSub || rawSub.trim() === "") ? "<p style='color:gray;'>- ไม่มีข้อมูล -</p>" : rawSub.split('\n').filter(a=>a.trim()!=="").map(a => `<div class="sub-activity-box">${a}</div>`).join('');
    document.getElementById('projectModal').style.display = "block";
}
function closeModal() { document.getElementById('projectModal').style.display = "none"; }
window.onclick = e => { if (e.target == document.getElementById('projectModal')) closeModal(); }

// ==========================================
// 8. Export
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
