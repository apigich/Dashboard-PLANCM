// ==========================================
// ⚙️ 1. ตั้งค่าพื้นฐาน
// ==========================================
// 🚨 เอา URL ของ Google Script (ที่ลงท้ายด้วย /exec) มาวางตรงนี้
const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";

let masterData = [];   
let filteredData = []; 
let currentMode = 'count'; // 'count' = จำนวน, 'budget' = งบประมาณ
let myChart = null;
let map = null;
let geojsonLayer = null;

// ==========================================
// 🚀 2. โหลดข้อมูลเริ่มต้น
// ==========================================
async function init() {
    try {
        const response = await fetch(API_URL);
        masterData = await response.json();
        
        // ทำความสะอาดตัวเลขและปีงบประมาณ
        masterData.forEach(row => {
            let budgetStr = row["งบประมาณ"] || row["งบประมาณ (บาท)"] || "0";
            row._budgetNum = parseFloat(budgetStr.toString().replace(/,/g, '')) || 0;
            row._year = row["ปีงบประมาณ"] || "ไม่ระบุ";
        });

        filteredData = [...masterData];
        populateSlicers();
        updateDashboard();

    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">❌ โหลดข้อมูลไม่สำเร็จ กรุณาเช็คการเชื่อมต่อ API</td></tr>`;
    }
}

// ==========================================
// 🎯 3. สร้างตัวเลือกใน Smart Slicer (Point 5)
// ==========================================
function populateSlicers() {
    // 3.1 ดึงปีงบประมาณอัตโนมัติ
    const years = [...new Set(masterData.map(d => d._year).filter(y => y !== "ไม่ระบุ"))].sort();
    const yearSelect = document.getElementById('filterYear');
    years.forEach(y => yearSelect.innerHTML += `<option value="${y}">📅 ปีงบประมาณ ${y}</option>`);

    // 3.2 ฐานข้อมูลยุทธศาสตร์ 5 ระดับ (อิงจากข้อมูล AutoFill ของคุณ)
    const strategyLevels = {
        filterNat: ["ด้าน 1 ความมั่นคง", "ด้าน 2 การสร้างความสามารถในการแข่งขัน", "ด้าน 3 การพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์", "ด้าน 4 การสร้างโอกาสและความเสมอภาคทางสังคม", "ด้าน 5 การสร้างการเติบโตบนคุณภาพชีวิตที่เป็นมิตรกับสิ่งแวดล้อม", "ด้าน 6 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ"],
        filterMaster: ["ประเด็นที่ 1 ความมั่นคง", "ประเด็นที่ 3 การเกษตร", "ประเด็นที่ 5 การท่องเที่ยว", "ประเด็นที่ 20 การบริการประชาชนและประสิทธิภาพภาครัฐ"], // ย่อมาให้ดูเป็นตัวอย่าง ใส่เพิ่มได้
        filterPlan13: ["หมุดหมายที่ 1", "หมุดหมายที่ 2", "หมุดหมายที่ 8", "หมุดหมายที่ 10"], 
        filterNorth: ["ประเด็นการพัฒนาที่ 1", "ประเด็นการพัฒนาที่ 2", "ประเด็นการพัฒนาที่ 3", "ประเด็นการพัฒนาที่ 4"],
        filterProv: ["ประเด็นการพัฒนาที่ 1", "ประเด็นการพัฒนาที่ 2", "ประเด็นการพัฒนาที่ 3", "ประเด็นการพัฒนาที่ 4", "ประเด็นการพัฒนาที่ 5"]
    };

    for (const [id, options] of Object.entries(strategyLevels)) {
        const select = document.getElementById(id);
        if(select) options.forEach(opt => select.innerHTML += `<option value="${opt}">${opt}</option>`);
    }

    // ผูก Event ให้ Slicer และ Search ทำงานทันทีเมื่อเปลี่ยนค่า
    document.querySelectorAll('.slicer, .year-select, .search-box').forEach(el => {
        el.addEventListener('input', applyFilters);
    });

    // ผูก Event ให้ Switch (Point 2) สลับงบ/โครงการ
    document.getElementById('modeSwitch').addEventListener('change', (e) => {
        currentMode = e.target.checked ? 'budget' : 'count';
        updateDashboard();
    });

    document.getElementById('chartTypeSelect').addEventListener('change', renderChart);
}

// ==========================================
// 🧠 4. สมองกลสแกนกรองข้อมูล (Point 2 & 6)
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
        // Point 6: Smart Search หาคำครอบคลุมทุกคอลัมน์
        const rowString = Object.values(row).join(" ").toLowerCase();
        const matchSearch = searchTxt === "" || rowString.includes(searchTxt);
        const matchYear = fYear === "all" || row._year === fYear;
        
        // Point 2: รองรับ Joint (ใช้ .includes ผ่าลูกน้ำ)
        const matchNat = fNat === "all" || (row["ยุทธศาสตร์ชาติ 20 ปี"] && row["ยุทธศาสตร์ชาติ 20 ปี"].includes(fNat));
        const matchMaster = fMaster === "all" || (row["แผนแม่บท"] && row["แผนแม่บท"].includes(fMaster));
        const matchPlan13 = fPlan13 === "all" || (row["แผนพัฒนาฯ ฉบับที่ 13"] && row["แผนพัฒนาฯ ฉบับที่ 13"].includes(fPlan13));
        const matchNorth = fNorth === "all" || (row["แผนพัฒนากลุ่มจังหวัดภาคเหนือ"] && row["แผนพัฒนากลุ่มจังหวัดภาคเหนือ"].includes(fNorth));
        const matchProv = fProv === "all" || (row["แผนพัฒนาจังหวัดเชียงใหม่"] && row["แผนพัฒนาจังหวัดเชียงใหม่"].includes(fProv));

        return matchSearch && matchYear && matchNat && matchMaster && matchPlan13 && matchNorth && matchProv;
    });

    updateDashboard();
}

// ==========================================
// 📊 5. อัปเดตการแสดงผล (Point 3)
// ==========================================
function updateDashboard() {
    // อัปเดตตัวเลข Summary
    const totalProjects = filteredData.length;
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);

    document.getElementById('sumProjects').innerText = totalProjects.toLocaleString();
    document.getElementById('sumBudget').innerText = totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2});

    // อัปเดตข้อความบอกสถานะการกรอง (ฉลาดบอกคนดู)
    let statusText = "เงื่อนไข: ";
    const fYear = document.getElementById('filterYear').value;
    statusText += (fYear === "all" ? "ทุกปีงบประมาณ" : `ปีงบประมาณ ${fYear}`);
    if(document.getElementById('globalSearch').value !== "") statusText += " (ค้นหาคำเฉพาะ)";
    
    document.getElementById('statusProjects').innerText = statusText;
    document.getElementById('statusBudget').innerText = statusText;

    // สั่งวาดส่วนประกอบอื่นๆ
    renderTable();
    renderChart();
    setTimeout(renderMap, 300); // หน่วงเวลาให้ UI กางออกก่อนค่อยวาดแผนที่
}

// ==========================================
// 📈 6. วาดกราฟและแยก Joint (Point 2)
// ==========================================
function renderChart() {
    const ctx = document.getElementById('mainChart');
    if(!ctx) return;

    const chartType = document.getElementById('chartTypeSelect').value; 
    let strategyCounts = {};
    
    // ระบบผ่าลูกน้ำ: นับความถี่แผนจังหวัด (Level 5)
    filteredData.forEach(row => {
        let rawProv = row["แผนพัฒนาจังหวัดเชียงใหม่"] || "ไม่ระบุ";
        let strategies = rawProv.split(",").map(s => s.trim()).filter(s => s !== "");
        if (strategies.length === 0) strategies = ["ไม่ระบุ"];
        
        strategies.forEach(strat => {
            if(!strategyCounts[strat]) strategyCounts[strat] = 0;
            
            // หารงบตามจำนวน Joint เพื่อป้องกันยอด Overcount
            if(currentMode === 'budget') {
                strategyCounts[strat] += (row._budgetNum / strategies.length); 
            } else {
                strategyCounts[strat] += 1; 
            }
        });
    });

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: Object.keys(strategyCounts),
            datasets: [{
                label: currentMode === 'budget' ? 'งบประมาณ (บาท)' : 'จำนวนโครงการ',
                data: Object.values(strategyCounts),
                backgroundColor: ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: chartType === 'doughnut' ? 'right' : 'bottom' },
                tooltip: { callbacks: { label: function(context) {
                    let val = context.raw;
                    return currentMode === 'budget' ? val.toLocaleString(undefined, {minimumFractionDigits: 2}) + ' บาท' : val + ' โครงการ';
                }}}
            }
        }
    });
}

// ==========================================
// 📍 7. แผนที่ Leaflet จาก GeoJSON (Point 1)
// ==========================================
function renderMap() {
    if (!map) {
        map = L.map('map', {scrollWheelZoom: false}).setView([18.7883, 98.9853], 8);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
    }

    let districtStats = {};
    const districtNames = ["กัลยาณิวัฒนา", "จอมทอง", "เชียงดาว", "ไชยปราการ", "ดอยเต่า", "ดอยสะเก็ด", "ดอยหล่อ", "ฝาง", "พร้าว", "เมืองเชียงใหม่", "แม่แจ่ม", "แม่แตง", "แม่ริม", "แม่วาง", "แม่ออน", "แม่อาย", "เวียงแหง", "สะเมิง", "สันกำแพง", "สันทราย", "สันป่าตอง", "สารภี", "หางดง", "อมก๋อย", "ฮอด"];
    districtNames.forEach(d => districtStats[d] = { count: 0, budget: 0 });

    // กระจายข้อมูล Joint พื้นที่ (รวมกรณี ครอบคลุมทั้งจังหวัด)
    filteredData.forEach(row => {
        let area = row["ขอบเขตพื้นที่"] || row["ขอบเขตพื้นที่ (Auto)"] || "";
        let matched = area.includes("ครอบคลุมทั้งจังหวัด") ? districtNames : districtNames.filter(d => area.includes(d));

        if(matched.length > 0) {
            let budgetPerDist = row._budgetNum / matched.length; 
            matched.forEach(d => {
                districtStats[d].count += 1;
                districtStats[d].budget += budgetPerDist;
            });
        }
    });

    fetch("districts.json")
        .then(res => res.json())
        .then(geoData => {
            if(geojsonLayer) map.removeLayer(geojsonLayer);
            geojsonLayer = L.geoJSON(geoData, {
                style: function (feature) {
                    let dName = feature.properties.amp_th;
                    let val = districtStats[dName] ? (currentMode === 'budget' ? districtStats[dName].budget : districtStats[dName].count) : 0;
                    
                    let color = '#FFEDA0'; // Default
                    if (currentMode === 'budget') color = val > 50000000 ? '#800026' : val > 10000000 ? '#BD0026' : val > 1000000 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';
                    else color = val > 20 ? '#800026' : val > 10 ? '#BD0026' : val > 5 ? '#E31A1C' : val > 0 ? '#FC4E2A' : '#FFEDA0';

                    return { fillColor: color, weight: 1.5, opacity: 1, color: 'white', fillOpacity: 0.8 };
                },
                onEachFeature: function (feature, layer) {
                    let dName = feature.properties.amp_th;
                    let stats = districtStats[dName] || {count: 0, budget: 0};
                    layer.bindPopup(`<div style="font-family:'Sarabun'"><b>📍 อำเภอ${dName}</b><br>จำนวน: ${stats.count} โครงการ<br>งบ: ${stats.budget.toLocaleString(undefined, {minimumFractionDigits: 2})} บาท</div>`);
                    layer.on({
                        mouseover: function(e) { e.target.setStyle({ weight: 3, color: '#f59e0b' }); e.target.bringToFront(); },
                        mouseout: function(e) { geojsonLayer.resetStyle(e.target); }
                    });
                }
            }).addTo(map);
        })
        .catch(e => console.log("รอไฟล์ districts.json"));
}

// ==========================================
// 📋 8. ตาราง และ Modal รายละเอียดย่อย (Point 7)
// ==========================================
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    
    if(filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">ไม่มีข้อมูลที่ตรงกับเงื่อนไขการกรอง</td></tr>`;
        return;
    }

    filteredData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.onclick = () => openModal(index); 
        tr.innerHTML = `
            <td><strong>${row["ชื่อโครงการ"] || row["ชื่อโครงการ (Project Name)"] || "-"}</strong></td>
            <td>${row["หน่วยงานรับผิดชอบ"] || "-"}</td>
            <td>${row["ขอบเขตพื้นที่"] || "-"}</td>
            <td style="text-align:right; font-weight:bold; color:var(--primary);">${row._budgetNum.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

function openModal(index) {
    const row = filteredData[index];
    document.getElementById('modalTitle').innerText = row["ชื่อโครงการ"] || row["ชื่อโครงการ (Project Name)"];
    document.getElementById('modalArea').innerText = row["ขอบเขตพื้นที่"] || "-";
    document.getElementById('modalBudget').innerText = row._budgetNum.toLocaleString();
    document.getElementById('modalAgency').innerText = row["หน่วยงานรับผิดชอบ"] || "-";
    document.getElementById('modalYear').innerText = row._year;

    // Point 7: สกัดคอลัมน์ S (รายละเอียดย่อย) มาทำเป็นกล่อง UI สวยๆ
    const subActDiv = document.getElementById('modalSubActivities');
    const rawSubAct = row["รายละเอียดย่อย"] || row["กิจกรรมย่อย (ถ้ามี)"] || row["กิจกรรมย่อย"] || ""; 
    
    if(!rawSubAct || rawSubAct.trim() === "") {
        subActDiv.innerHTML = "<p style='color:gray;'>- ไม่มีการระบุกิจกรรมย่อย -</p>";
    } else {
        const activities = rawSubAct.split('\n').filter(a => a.trim() !== "");
        subActDiv.innerHTML = activities.map(act => `<div class="sub-activity-box">${act}</div>`).join('');
    }

    document.getElementById('projectModal').style.display = "block";
}

function closeModal() { document.getElementById('projectModal').style.display = "none"; }
window.onclick = function(e) { if (e.target == document.getElementById('projectModal')) closeModal(); }

// ==========================================
// 📥 9. ระบบ Export Excel & PDF (Point 4)
// ==========================================
function exportToExcel() {
    if(filteredData.length === 0) return alert("ไม่มีข้อมูลให้โหลด");
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, `รายงานโครงการ_${document.getElementById('filterYear').value}.xlsx`);
}

function exportToPDF() {
    if(filteredData.length === 0) return alert("ไม่มีข้อมูลให้โหลด");
    const element = document.getElementById('tableContainer');
    const opt = {
      margin: 10,
      filename: `รายงานโครงการ_${document.getElementById('filterYear').value}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    document.getElementById('statusProjects').innerText = "⏳ กำลังสร้างไฟล์ PDF...";
    html2pdf().set(opt).from(element).save().then(() => updateDashboard());
}

// รันโปรแกรม
init();
