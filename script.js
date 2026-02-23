// ==========================================
// ⚙️ 1. ตั้งค่าพื้นฐาน (Configuration)
// ==========================================
// 🚨 วาง Web App URL ที่ได้จาก Google Script ของคุณตรงนี้
const API_URL = "https://script.google.com/macros/s/ใส่ลิงก์ของคุณที่นี่/exec";

let masterData = [];   // เก็บข้อมูลดิบทั้งหมด
let filteredData = []; // เก็บข้อมูลที่ผ่านการกรองแล้ว
let currentMode = 'count'; // 'count' = จำนวนโครงการ, 'budget' = งบประมาณ (Point 2 Switch)

// ==========================================
// 🚀 2. ฟังก์ชันโหลดข้อมูล (Fetch Data)
// ==========================================
async function init() {
    try {
        const response = await fetch(API_URL);
        masterData = await response.json();
        
        // แปลงข้อมูลงบประมาณให้เป็นตัวเลข เพื่อให้คำนวณง่าย
        masterData.forEach(row => {
            let budgetStr = row["งบประมาณ"] || row["งบประมาณ (บาท)"] || "0";
            row._budgetNum = parseFloat(budgetStr.toString().replace(/,/g, '')) || 0;
            row._year = row["ปีงบประมาณ"] || "ไม่ระบุ";
        });

        filteredData = [...masterData];
        
        // สร้างตัวเลือกใน Dropdown (Slicers) ให้ครบ
        populateSlicers();
        
        // เริ่มประมวลผลแสดงหน้าจอ
        updateDashboard();

    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">❌ ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบลิงก์ API</td></tr>`;
    }
}

// ==========================================
// 🎯 3. ระบบ Smart Slicer (Point 5 & 6)
// ==========================================
function populateSlicers() {
    // ดึงค่าที่ไม่ซ้ำกันมาใส่ Dropdown
    const years = [...new Set(masterData.map(d => d._year).filter(y => y !== "ไม่ระบุ"))].sort();
    const yearSelect = document.getElementById('filterYear');
    years.forEach(y => yearSelect.innerHTML += `<option value="${y}">ปีงบประมาณ ${y}</option>`);

    // ตัวเลือกยุทธศาสตร์ (ใช้ชุดข้อมูลเดิมจากโค้ด AutoFill ที่คุณให้มา)
    const strategyLevels = {
        filterNat: ["ด้าน 1 ความมั่นคง", "ด้าน 2 การสร้างความสามารถในการแข่งขัน", "ด้าน 3 การพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์", "ด้าน 4 การสร้างโอกาสและความเสมอภาคทางสังคม", "ด้าน 5 การสร้างการเติบโตบนคุณภาพชีวิตที่เป็นมิตรกับสิ่งแวดล้อม", "ด้าน 6 การปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ"],
        filterMaster: ["ประเด็นที่ 1 ความมั่นคง", "ประเด็นที่ 3 การเกษตร", "ประเด็นที่ 5 การท่องเที่ยว", "ประเด็นที่ 20 การบริการประชาชนและประสิทธิภาพภาครัฐ"], // ใส่เพิ่มได้ตามต้องการ
        filterProv: ["ประเด็นการพัฒนาที่ 1", "ประเด็นการพัฒนาที่ 2", "ประเด็นการพัฒนาที่ 3", "ประเด็นการพัฒนาที่ 4", "ประเด็นการพัฒนาที่ 5"]
    };

    for (const [id, options] of Object.entries(strategyLevels)) {
        const select = document.getElementById(id);
        if(select) {
            options.forEach(opt => select.innerHTML += `<option value="${opt}">${opt}</option>`);
        }
    }

    // ผูก Event Listener: เมื่อเปลี่ยนค่า ให้ทำงานฟังก์ชัน applyFilters
    document.querySelectorAll('.slicer, .year-select, .search-box').forEach(el => {
        el.addEventListener('input', applyFilters);
    });

    // ผูก Event ให้ Switch (Point 2)
    document.getElementById('modeSwitch').addEventListener('change', (e) => {
        currentMode = e.target.checked ? 'budget' : 'count';
        updateDashboard(); // อัปเดตใหม่เมื่อสลับโหมด
    });
}

// ==========================================
// 🧠 4. สมองกลประมวลผลการกรอง (Smart Filter)
// ==========================================
function applyFilters() {
    const searchTxt = document.getElementById('globalSearch').value.toLowerCase();
    const fYear = document.getElementById('filterYear').value;
    const fNat = document.getElementById('filterNat').value;
    const fMaster = document.getElementById('filterMaster').value;
    const fProv = document.getElementById('filterProv').value;

    filteredData = masterData.filter(row => {
        // Point 6: ค้นหาข้อความแบบครอบคลุม
        const rowString = Object.values(row).join(" ").toLowerCase();
        const matchSearch = searchTxt === "" || rowString.includes(searchTxt);

        const matchYear = fYear === "all" || row._year === fYear;
        
        // Point 2: ระบบจัดการ Joint (ใช้ .includes() เพื่อหาในคอลัมน์ที่มีลูกน้ำคั่น)
        const matchNat = fNat === "all" || (row["ยุทธศาสตร์ชาติ 20 ปี"] && row["ยุทธศาสตร์ชาติ 20 ปี"].includes(fNat));
        const matchMaster = fMaster === "all" || (row["แผนแม่บท"] && row["แผนแม่บท"].includes(fMaster));
        const matchProv = fProv === "all" || (row["แผนพัฒนาจังหวัดเชียงใหม่"] && row["แผนพัฒนาจังหวัดเชียงใหม่"].includes(fProv));

        return matchSearch && matchYear && matchNat && matchMaster && matchProv;
    });

    updateDashboard();
}

// ==========================================
// 📊 5. อัปเดตหน้าจอทั้งหมด (Point 3)
// ==========================================
function updateDashboard() {
    // 5.1 อัปเดตตัวเลข Summary Cards
    const totalProjects = filteredData.length;
    const totalBudget = filteredData.reduce((sum, row) => sum + row._budgetNum, 0);

    document.getElementById('sumProjects').innerText = totalProjects.toLocaleString();
    document.getElementById('sumBudget').innerText = totalBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

    // สรุปข้อความสถานะ (กันคนลืมว่ากรองอะไรไว้)
    let statusText = "กำลังแสดง: ";
    const fYear = document.getElementById('filterYear').value;
    statusText += (fYear === "all" ? "ทุกปีงบประมาณ" : `ปีงบประมาณ ${fYear}`);
    if(document.getElementById('filterProv').value !== "all") statusText += " (กรองยุทธศาสตร์จังหวัด)";
    
    document.getElementById('statusProjects').innerText = statusText;
    document.getElementById('statusBudget').innerText = statusText;

    // 5.2 อัปเดตตาราง
    renderTable();

    // 5.3 (พื้นที่สำหรับอัปเดตกราฟและแผนที่ - เดี๋ยวเราจะมาเติมโค้ดส่วนนี้ใน Step ถัดไป)
    console.log(`Updated! Mode: ${currentMode}, Rows: ${filteredData.length}`);
}

// ==========================================
// 📋 6. วาดตารางและ Modal รายละเอียด (Point 7)
// ==========================================
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    
    if(filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">ไม่พบโครงการที่ตรงกับเงื่อนไข</td></tr>`;
        return;
    }

    filteredData.forEach((row, index) => {
        const tr = document.createElement('tr');
        // เมื่อคลิกที่บรรทัด ให้เปิด Modal รายละเอียดย่อย (ส่ง index กลับไป)
        tr.onclick = () => openModal(index); 
        
        tr.innerHTML = `
            <td><strong>${row["ชื่อโครงการ"] || row["ชื่อโครงการ (Project Name)"] || "-"}</strong></td>
            <td>${row["หน่วยงานรับผิดชอบ"] || "-"}</td>
            <td>${row["ขอบเขตพื้นที่"] || "-"}</td>
            <td style="text-align:right; font-weight:bold; color:var(--primary);">
                ${row._budgetNum.toLocaleString()}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// เปิด Popup (Modal) ดึงรายละเอียดย่อย (คอลัมน์ S) มาจัดหน้า
function openModal(filteredIndex) {
    const row = filteredData[filteredIndex];
    document.getElementById('modalTitle').innerText = row["ชื่อโครงการ"] || row["ชื่อโครงการ (Project Name)"];
    document.getElementById('modalArea').innerText = row["ขอบเขตพื้นที่"] || "-";
    document.getElementById('modalBudget').innerText = row._budgetNum.toLocaleString();
    document.getElementById('modalAgency').innerText = row["หน่วยงานรับผิดชอบ"] || "-";
    document.getElementById('modalYear').innerText = row._year;

    // ประมวลผลคอลัมน์ S (รายละเอียดย่อย)
    const subActDiv = document.getElementById('modalSubActivities');
    const rawSubAct = row["รายละเอียดย่อย"] || row["กิจกรรมย่อย (ถ้ามี)"]; 
    
    if(!rawSubAct || rawSubAct.trim() === "") {
        subActDiv.innerHTML = "<p style='color:gray;'>- ไม่มีข้อมูลกิจกรรมย่อย -</p>";
    } else {
        // แตกข้อความด้วยการขึ้นบรรทัดใหม่ (\n) แล้วสร้างเป็นกล่องสวยๆ
        const activities = rawSubAct.split('\n');
        subActDiv.innerHTML = activities.map(act => `<div class="sub-activity-box">${act}</div>`).join('');
    }

    document.getElementById('projectModal').style.display = "block";
}

function closeModal() {
    document.getElementById('projectModal').style.display = "none";
}

// ปิด Modal เมื่อคลิกพื้นที่ว่างข้างนอก
window.onclick = function(event) {
    if (event.target == document.getElementById('projectModal')) {
        closeModal();
    }
}

// ==========================================
// 📥 7. ฟังก์ชัน Export เป็น Excel (Point 4)
// ==========================================
function exportToExcel() {
    if(filteredData.length === 0) { alert("ไม่มีข้อมูลให้ Export ครับ"); return; }
    
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    
    const fYear = document.getElementById('filterYear').value;
    const fileName = `รายงานแผนพัฒนาจังหวัดเชียงใหม่_${fYear === 'all' ? 'ทุกปี' : fYear}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// เริ่มต้นทำงานทันที!
init();
