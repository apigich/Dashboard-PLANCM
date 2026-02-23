<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard แผนพัฒนาจังหวัดเชียงใหม่</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        :root { --primary: #1e3a8a; --secondary: #3b82f6; --bg: #f3f4f6; --card: #ffffff; }
        body { font-family: 'Sarabun', sans-serif; background-color: var(--bg); margin: 0; padding: 20px; color: #333; }
        .container { max-width: 1400px; margin: auto; }
        
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
        h1 { color: var(--primary); margin: 0; font-size: 26px; }
        
        .main-controls { display: flex; gap: 10px; align-items: center; background: var(--card); padding: 12px 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); flex-wrap: wrap;}
        .search-box { padding: 10px; width: 250px; border: 1px solid #ccc; border-radius: 6px; font-family: 'Sarabun'; font-size: 15px;}
        .btn-clear { background: #ef4444; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-family: 'Sarabun'; font-weight: bold; font-size: 14px; transition: 0.2s;}
        .btn-clear:hover { background: #dc2626; }
        
        .switch-container { display: flex; align-items: center; gap: 8px; font-weight: bold; background: #e0e7ff; padding: 10px; border-radius: 8px; }
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 24px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--secondary); }
        input:checked + .slider:before { transform: translateX(20px); }

        /* ปีงบประมาณแบบ Checkbox (Point 5) */
        .year-group { display: flex; gap: 10px; align-items: center; background: #eff6ff; padding: 8px 15px; border-radius: 6px; border: 1px solid var(--secondary); font-weight: bold; color: var(--primary);}
        .year-label { display: flex; align-items: center; gap: 4px; cursor: pointer; }

        .slicer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .slicer-box { background: var(--card); padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid var(--secondary); position: relative;}
        .slicer-box label { font-size: 13px; font-weight: bold; color: #475569; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .slicer-box select { width: 100%; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; font-family: 'Sarabun'; font-size: 13px; cursor: pointer;}
        /* ปุ่มกรองเฉพาะหมวด (Point 3) */
        .btn-exclusive { background: #f59e0b; color: white; border: none; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer; font-family: 'Sarabun'; }
        .btn-exclusive:hover { background: #d97706; }

        /* Summary & Filter Status (Point 6) */
        .summary-wrapper { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 20px; margin-bottom: 20px; align-items: stretch; }
        .summary-card { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 15px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; flex-direction: column; justify-content: center;}
        .summary-value { font-size: 36px; font-weight: bold; margin: 5px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);}
        .status-card { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 10px; color: #92400e; font-size: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: center;}

        /* Layout แผนที่และกราฟ */
        .dash-grid-top { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .dash-card { background: var(--card); padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); height: 450px; display: flex; flex-direction: column; }
        #map { flex-grow: 1; width: 100%; border-radius: 8px; z-index: 1; border: 1px solid #e2e8f0;}
        .chart-container { flex-grow: 1; position: relative; width: 100%; height: 100%; }

        /* กราฟ Trend (Point 4) */
        .trend-section { background: var(--card); padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); height: 350px; margin-bottom: 20px; display: flex; flex-direction: column;}

        /* ตารางและปุ่มเรียง (Point 8) */
        .table-section { background: var(--card); padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); margin-bottom: 40px;}
        .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .btn-sort { background: #e2e8f0; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-family: 'Sarabun'; font-weight: bold; color: var(--primary);}
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th, td { border-bottom: 1px solid #e2e8f0; padding: 12px; text-align: left; }
        th { background: #f8fafc; color: var(--primary); position: sticky; top: 0;}
        tr:hover { background: #f1f5f9; cursor: pointer;}

        /* Modal */
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); backdrop-filter: blur(3px);}
        .modal-content { background-color: #fff; margin: 3% auto; padding: 30px; border-radius: 12px; width: 85%; max-width: 900px; max-height: 85vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2); position: relative;}
        .close-btn { color: #aaa; float: right; font-size: 32px; font-weight: bold; cursor: pointer; line-height: 1; }
        .close-btn:hover { color: #000; }
        .sub-activity-box { background: #f8fafc; border-left: 4px solid var(--secondary); padding: 20px; margin-bottom: 12px; border-radius: 6px; border: 1px solid #e2e8f0; line-height: 1.6;}
        .btn-filter-project { margin-top: 15px; background: #10b981; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-family: 'Sarabun'; font-weight: bold; width: 100%; transition: 0.2s;}
        .btn-filter-project:hover { background: #059669; }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>📊 Dashboard แผนพัฒนาจังหวัดเชียงใหม่</h1>
        <div class="main-controls">
            <input type="text" id="globalSearch" class="search-box" placeholder="🔍 ค้นหาชื่อโครงการ หรือพื้นที่...">
            <div class="switch-container">
                <span>จำนวน</span>
                <label class="switch"><input type="checkbox" id="modeSwitch"><span class="slider"></span></label>
                <span>งบประมาณ</span>
            </div>
            <div class="year-group" id="yearCheckboxContainer">
                <span>📅 ปีงบ:</span>
                </div>
            <button class="btn-clear" onclick="clearAllFilters()">🔄 ล้างการกรองทั้งหมด</button>
        </div>
    </div>

    <div class="slicer-grid">
        <div class="slicer-box"><label>🎯 1. ยุทธศาสตร์ชาติ <button class="btn-exclusive" onclick="exclusiveFilter('filterNat')">กรองเฉพาะด้านนี้</button></label><select id="filterNat"><option value="all">-- ดูทั้งหมด --</option></select></div>
        <div class="slicer-box"><label>🎯 2. แผนแม่บทฯ <button class="btn-exclusive" onclick="exclusiveFilter('filterMaster')">กรองเฉพาะด้านนี้</button></label><select id="filterMaster"><option value="all">-- ดูทั้งหมด --</option></select></div>
        <div class="slicer-box"><label>🎯 3. แผนพัฒนาฯ ฉบับ 13 <button class="btn-exclusive" onclick="exclusiveFilter('filterPlan13')">กรองเฉพาะด้านนี้</button></label><select id="filterPlan13"><option value="all">-- ดูทั้งหมด --</option></select></div>
        <div class="slicer-box"><label>🎯 4. แผนกลุ่มจังหวัด <button class="btn-exclusive" onclick="exclusiveFilter('filterNorth')">กรองเฉพาะด้านนี้</button></label><select id="filterNorth"><option value="all">-- ดูทั้งหมด --</option></select></div>
        <div class="slicer-box"><label>🎯 5. แผนพัฒนาจังหวัด <button class="btn-exclusive" onclick="exclusiveFilter('filterProv')">กรองเฉพาะด้านนี้</button></label><select id="filterProv"><option value="all">-- ดูทั้งหมด --</option></select></div>
    </div>

    <div class="summary-wrapper">
        <div class="summary-card"><h3 style="margin: 0;">📌 จำนวนโครงการ</h3><div class="summary-value" id="sumProjects">0</div></div>
        <div class="summary-card" style="background: linear-gradient(135deg, #059669, #10b981);"><h3 style="margin: 0;">💰 งบประมาณรวม (บาท)</h3><div class="summary-value" id="sumBudget">0</div></div>
        <div class="status-card">
            <h3 style="margin: 0 0 10px 0; color: #b45309;">🔍 สถานะการกรองปัจจุบัน:</h3>
            <div id="activeFiltersText" style="line-height: 1.6;">กำลังเตรียมระบบ...</div>
        </div>
    </div>

    <div class="dash-grid-top">
        <div class="dash-card">
            <h3 style="margin-top:0; color: var(--primary);">📍 การกระจายตัวของโครงการและงบประมาณ</h3>
            <div id="map"></div>
        </div>
        <div class="dash-card">
            <h3 style="margin-top:0; color: #059669;">🍩 สัดส่วนลักษณะพื้นที่ <br><small style="font-weight:normal; color:#666;">(คลิกที่ส่วนของกราฟเพื่อกรองข้อมูล)</small></h3>
            <div class="chart-container"><canvas id="areaChart"></canvas></div>
        </div>
        <div class="dash-card">
            <h3 style="margin-top:0; color: var(--primary);">📊 สัดส่วนตามประเด็นยุทธศาสตร์ <br><small style="font-weight:normal; color:#666;">(แยก Single และ Joint)</small></h3>
            <div class="chart-container"><canvas id="mainChart"></canvas></div>
        </div>
    </div>

    <div class="trend-section">
        <h3 style="margin-top:0; color: var(--primary);">📈 แนวโน้มการจัดสรรโครงการและงบประมาณตามปีงบประมาณ</h3>
        <div class="chart-container"><canvas id="trendChart"></canvas></div>
    </div>

    <div class="table-section">
        <div class="table-header">
            <h3 style="margin:0; color: var(--primary);">📋 รายชื่อโครงการ (คลิกเพื่อดูรายละเอียด)</h3>
            <button class="btn-sort" id="btnSort" onclick="toggleSort()">⬇️ เรียง: ใหม่ไปเก่า</button>
        </div>
        <div style="overflow-y: auto; max-height: 500px;">
            <table id="dataTable">
                <thead>
                    <tr>
                        <th style="width: 45%;">ชื่อโครงการ</th>
                        <th style="width: 15%;">ปีงบประมาณ</th>
                        <th style="width: 25%;">พื้นที่ดำเนินการ</th>
                        <th style="width: 15%; text-align: right;">งบประมาณ (บาท)</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    <tr><td colspan="4" style="text-align:center; padding: 40px; font-weight:bold; color:#d69e2e;">⏳ กำลังโหลดข้อมูล...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div id="projectModal" class="modal">
    <div class="modal-content">
        <span class="close-btn" onclick="closeModal()">&times;</span>
        <h2 id="modalTitle" style="color: var(--primary); margin-top: 0;">ชื่อโครงการ</h2>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; font-size: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin:0;"><strong>📍 พื้นที่:</strong> <span id="modalArea"></span></p>
            <p style="margin:0;"><strong>💰 งบรวม:</strong> <span id="modalBudget" style="color: #10b981; font-weight: bold;"></span> บาท</p>
            <p style="margin:0;"><strong>📅 ปีงบประมาณ:</strong> <span id="modalYear"></span></p>
            <p style="margin:0;"><strong>🎯 ลักษณะพื้นที่:</strong> <span id="modalAreaType" style="color: #f59e0b; font-weight: bold;"></span></p>
        </div>
        <h3 style="border-bottom: 2px solid var(--secondary); padding-bottom: 8px; color: var(--primary);">📑 รายละเอียดโครงการ</h3>
        <div id="modalSubActivities"></div>
        <div id="modalFilterBtnContainer"></div>
    </div>
</div>

<script src="script.js"></script>
</body>
</html>
