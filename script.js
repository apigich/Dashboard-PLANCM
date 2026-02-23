const API_URL = "https://script.google.com/macros/s/AKfycby4zmatIMhxh2K4PIiabU5qhgEiJT2RMWhY7N_0TGi9DalIfrGsthWd_6NXj62UQrhc/exec";
let masterData = [];

async function fetchAndLoadData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        masterData = data;
        console.log("✅ ดึงข้อมูลสำเร็จ! จำนวน:", masterData.length, "รายการ", masterData);

        document.getElementById('loadingText').style.display = 'none';
        
        // ทดสอบวาดตารางเบื้องต้น (เดี๋ยวเรามาอัปเกรดตัวกรองทีหลัง)
        renderTable(masterData);

    } catch (error) {
        console.error("❌ ดึงข้อมูลพลาด:", error);
        document.getElementById('loadingText').innerHTML = "❌ ไม่สามารถโหลดข้อมูลได้";
        document.getElementById('loadingText').style.color = "red";
    }
}

function renderTable(dataArray) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ""; 

    dataArray.forEach(row => {
        // ดึงคีย์หลักๆ มาโชว์ (เช็คว่ามีชื่อโครงการไหม)
        const projectName = row["ชื่อโครงการ"] || row["ชื่อโครงการ (Project Name)"];
        if (projectName) {
            const strategy = row["ยุทธศาสตร์ชาติ 20 ปี"] || "-";
            const area = row["ขอบเขตพื้นที่ (Auto)"] || row["ขอบเขตพื้นที่"] || "-";
            const budget = row["งบประมาณ"] || row["งบประมาณ (บาท)"] || "0";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${projectName}</td>
                <td>${strategy}</td>
                <td>${area}</td>
                <td>${budget}</td>
            `;
            tableBody.appendChild(tr);
        }
    });
}

// สั่งทำงานทันที
fetchAndLoadData();
