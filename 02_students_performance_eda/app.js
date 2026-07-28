/* ==========================================================================
   Student Performance Analytics — Interactive Dashboard Logic (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check if STUDENT_DATA is loaded
  if (typeof STUDENT_DATA === 'undefined' || !Array.isArray(STUDENT_DATA)) {
    console.error('STUDENT_DATA not loaded properly.');
    return;
  }

  // --- State Variables ---
  let filteredData = [...STUDENT_DATA];
  let currentPage = 1;
  let pageSize = 10;
  let sortColumn = 'percentage';
  let sortDirection = 'desc';
  let searchQuery = '';

  // Chart Instances
  const charts = {};

  // --- DOM Elements ---
  const elGender = document.getElementById('filter-gender');
  const elEthnicity = document.getElementById('filter-ethnicity');
  const elEducation = document.getElementById('filter-education');
  const elLunch = document.getElementById('filter-lunch');
  const elPrep = document.getElementById('filter-prep');
  const elResult = document.getElementById('filter-result');
  const elResetBtn = document.getElementById('reset-filters-btn');

  const elSearch = document.getElementById('table-search');
  const elTableBody = document.getElementById('table-body');
  const elTableInfo = document.getElementById('table-info');
  const elPrevBtn = document.getElementById('prev-page-btn');
  const elNextBtn = document.getElementById('next-page-btn');
  const elPageDisplay = document.getElementById('page-num-display');

  // --- Global Chart Styling Defaults ---
  Chart.defaults.font.family = "'Outfit', 'Inter', sans-serif";
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
  Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
  Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;

  // --- Initialize Dashboard ---
  initDashboard();

  function initDashboard() {
    setupEventListeners();
    initCharts();
    updateDashboard();
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    const filters = [elGender, elEthnicity, elEducation, elLunch, elPrep, elResult];
    filters.forEach(f => f.addEventListener('change', () => {
      currentPage = 1;
      updateDashboard();
    }));

    elResetBtn.addEventListener('click', () => {
      elGender.value = 'all';
      elEthnicity.value = 'all';
      elEducation.value = 'all';
      elLunch.value = 'all';
      elPrep.value = 'all';
      elResult.value = 'all';
      elSearch.value = '';
      searchQuery = '';
      currentPage = 1;
      updateDashboard();
    });

    elSearch.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      currentPage = 1;
      renderTable();
    });

    // Table Header Sorting
    document.querySelectorAll('table.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (sortColumn === col) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortColumn = col;
          sortDirection = 'desc';
        }
        renderTable();
      });
    });

    // Pagination
    elPrevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });

    elNextBtn.addEventListener('click', () => {
      const maxPages = Math.ceil(getSearchedData().length / pageSize);
      if (currentPage < maxPages) {
        currentPage++;
        renderTable();
      }
    });
  }

  // --- Core Filter & Update Engine ---
  function updateDashboard() {
    applyFilters();
    updateKPIs();
    updateCharts();
    renderTable();
  }

  function applyFilters() {
    const gender = elGender.value;
    const ethnicity = elEthnicity.value;
    const education = elEducation.value;
    const lunch = elLunch.value;
    const prep = elPrep.value;
    const result = elResult.value;

    filteredData = STUDENT_DATA.filter(item => {
      if (gender !== 'all' && item.gender !== gender) return false;
      if (ethnicity !== 'all' && item.race_ethnicity !== ethnicity) return false;
      if (education !== 'all' && item.parental_level_of_education !== education) return false;
      if (lunch !== 'all' && item.lunch !== lunch) return false;
      if (prep !== 'all' && item.test_preparation_course !== prep) return false;
      if (result !== 'all' && item.result !== result) return false;
      return true;
    });
  }

  // --- KPI Cards ---
  function updateKPIs() {
    const total = filteredData.length;
    const totalDataset = STUDENT_DATA.length;
    const pctTotal = ((total / totalDataset) * 100).toFixed(1);

    document.getElementById('kpi-total-students').textContent = total.toLocaleString();
    document.getElementById('kpi-total-sub').textContent = `${pctTotal}% of entire dataset`;

    if (total === 0) {
      document.getElementById('kpi-pass-rate').textContent = '0%';
      document.getElementById('kpi-pass-count').textContent = '0 passed';
      document.getElementById('kpi-avg-percentage').textContent = '0%';
      document.getElementById('kpi-avg-math').textContent = '0';
      document.getElementById('kpi-avg-reading').textContent = '0';
      document.getElementById('kpi-avg-writing').textContent = '0';
      return;
    }

    const passes = filteredData.filter(d => d.result === 'Pass').length;
    const passRate = ((passes / total) * 100).toFixed(1);

    const avgMath = (filteredData.reduce((acc, d) => acc + d.math_score, 0) / total).toFixed(1);
    const avgReading = (filteredData.reduce((acc, d) => acc + d.reading_score, 0) / total).toFixed(1);
    const avgWriting = (filteredData.reduce((acc, d) => acc + d.writing_score, 0) / total).toFixed(1);
    const avgPercentage = (filteredData.reduce((acc, d) => acc + d.percentage, 0) / total).toFixed(1);

    document.getElementById('kpi-pass-rate').textContent = `${passRate}%`;
    document.getElementById('kpi-pass-count').textContent = `${passes} out of ${total} passed`;
    document.getElementById('kpi-avg-percentage').textContent = `${avgPercentage}%`;
    document.getElementById('kpi-avg-math').textContent = avgMath;
    document.getElementById('kpi-avg-reading').textContent = avgReading;
    document.getElementById('kpi-avg-writing').textContent = avgWriting;
  }

  // --- Charts Initialization ---
  function initCharts() {
    // 1. Grade Distribution (Doughnut)
    charts.grades = new Chart(document.getElementById('chart-grades'), {
      type: 'doughnut',
      data: {
        labels: ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade E', 'Grade F'],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: ['#00cc96', '#636efa', '#ffa15a', '#ab63fa', '#ef553b', '#ff6692'],
          borderColor: '#111827',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } }
        },
        cutout: '65%'
      }
    });

    // 2. Gender x Subject (Bar)
    charts.genderSubject = new Chart(document.getElementById('chart-gender-subject'), {
      type: 'bar',
      data: {
        labels: ['Math', 'Reading', 'Writing', 'Overall Avg %'],
        datasets: [
          { label: 'Female', data: [0,0,0,0], backgroundColor: '#ef553b', borderRadius: 4 },
          { label: 'Male', data: [0,0,0,0], backgroundColor: '#636efa', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { position: 'top' } }
      }
    });

    // 3. Parental Education Trend (Line/Area)
    charts.education = new Chart(document.getElementById('chart-education'), {
      type: 'line',
      data: {
        labels: ['Some High School', 'High School', 'Some College', "Associate's", "Bachelor's", "Master's"],
        datasets: [{
          label: 'Average Score (%)',
          data: [0,0,0,0,0,0],
          borderColor: '#00cc96',
          backgroundColor: 'rgba(0, 204, 150, 0.15)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#00cc96',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });

    // 4. Lunch x Test Prep Interaction (Grouped Bar)
    charts.lunchPrep = new Chart(document.getElementById('chart-lunch-prep'), {
      type: 'bar',
      data: {
        labels: ['Standard Lunch', 'Free / Reduced Lunch'],
        datasets: [
          { label: 'Test Prep Completed', data: [0,0], backgroundColor: '#00cc96', borderRadius: 4 },
          { label: 'No Test Prep', data: [0,0], backgroundColor: '#ef553b', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { position: 'top' } }
      }
    });

    // 5. Scores by Race/Ethnicity (Bar)
    charts.ethnicity = new Chart(document.getElementById('chart-ethnicity'), {
      type: 'bar',
      data: {
        labels: ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'],
        datasets: [
          { label: 'Math', data: [0,0,0,0,0], backgroundColor: '#636efa', borderRadius: 4 },
          { label: 'Reading', data: [0,0,0,0,0], backgroundColor: '#ef553b', borderRadius: 4 },
          { label: 'Writing', data: [0,0,0,0,0], backgroundColor: '#00cc96', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { position: 'top' } }
      }
    });

    // 6. Score Distribution Ranges (Bar)
    charts.scoresDist = new Chart(document.getElementById('chart-scores-dist'), {
      type: 'bar',
      data: {
        labels: ['0-39% (Fail)', '40-49% (E)', '50-59% (D)', '60-69% (C)', '70-79% (B)', '80-89% (A)', '90-100% (A+)'],
        datasets: [{
          label: 'Student Count',
          data: [0,0,0,0,0,0,0],
          backgroundColor: '#ab63fa',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  // --- Charts Data Updates ---
  function updateCharts() {
    const data = filteredData;
    const total = data.length;

    // 1. Grade Counts
    const gradeOrder = ['A', 'B', 'C', 'D', 'E', 'F'];
    const gradeCounts = gradeOrder.map(g => data.filter(d => d.grade === g).length);
    charts.grades.data.datasets[0].data = gradeCounts;
    charts.grades.update();

    // 2. Gender x Subject
    const female = data.filter(d => d.gender === 'female');
    const male = data.filter(d => d.gender === 'male');

    const calcAvg = (arr, key) => arr.length ? (arr.reduce((acc, d) => acc + d[key], 0) / arr.length).toFixed(1) : 0;

    charts.genderSubject.data.datasets[0].data = [
      calcAvg(female, 'math_score'),
      calcAvg(female, 'reading_score'),
      calcAvg(female, 'writing_score'),
      calcAvg(female, 'percentage')
    ];
    charts.genderSubject.data.datasets[1].data = [
      calcAvg(male, 'math_score'),
      calcAvg(male, 'reading_score'),
      calcAvg(male, 'writing_score'),
      calcAvg(male, 'percentage')
    ];
    charts.genderSubject.update();

    // 3. Parental Education
    const eduOrder = ['some high school', 'high school', 'some college', "associate's degree", "bachelor's degree", "master's degree"];
    const eduAvgs = eduOrder.map(edu => {
      const subset = data.filter(d => d.parental_level_of_education === edu);
      return calcAvg(subset, 'percentage');
    });
    charts.education.data.datasets[0].data = eduAvgs;
    charts.education.update();

    // 4. Lunch x Test Prep Interaction
    const stdPrep = data.filter(d => d.lunch === 'standard' && d.test_preparation_course === 'completed');
    const stdNoPrep = data.filter(d => d.lunch === 'standard' && d.test_preparation_course === 'none');
    const freePrep = data.filter(d => d.lunch === 'free/reduced' && d.test_preparation_course === 'completed');
    const freeNoPrep = data.filter(d => d.lunch === 'free/reduced' && d.test_preparation_course === 'none');

    charts.lunchPrep.data.datasets[0].data = [calcAvg(stdPrep, 'percentage'), calcAvg(freePrep, 'percentage')];
    charts.lunchPrep.data.datasets[1].data = [calcAvg(stdNoPrep, 'percentage'), calcAvg(freeNoPrep, 'percentage')];
    charts.lunchPrep.update();

    // 5. Race/Ethnicity
    const ethGroups = ['group A', 'group B', 'group C', 'group D', 'group E'];
    charts.ethnicity.data.datasets[0].data = ethGroups.map(g => calcAvg(data.filter(d => d.race_ethnicity === g), 'math_score'));
    charts.ethnicity.data.datasets[1].data = ethGroups.map(g => calcAvg(data.filter(d => d.race_ethnicity === g), 'reading_score'));
    charts.ethnicity.data.datasets[2].data = ethGroups.map(g => calcAvg(data.filter(d => d.race_ethnicity === g), 'writing_score'));
    charts.ethnicity.update();

    // 6. Score Ranges Distribution
    const dist = [
      data.filter(d => d.percentage < 40).length,
      data.filter(d => d.percentage >= 40 && d.percentage < 50).length,
      data.filter(d => d.percentage >= 50 && d.percentage < 60).length,
      data.filter(d => d.percentage >= 60 && d.percentage < 70).length,
      data.filter(d => d.percentage >= 70 && d.percentage < 80).length,
      data.filter(d => d.percentage >= 80 && d.percentage < 90).length,
      data.filter(d => d.percentage >= 90).length,
    ];
    charts.scoresDist.data.datasets[0].data = dist;
    charts.scoresDist.update();
  }

  // --- Table Filtering, Sorting & Pagination ---
  function getSearchedData() {
    let data = [...filteredData];
    if (searchQuery) {
      data = data.filter(d => {
        return (
          d.gender.toLowerCase().includes(searchQuery) ||
          d.race_ethnicity.toLowerCase().includes(searchQuery) ||
          d.parental_level_of_education.toLowerCase().includes(searchQuery) ||
          d.lunch.toLowerCase().includes(searchQuery) ||
          d.test_preparation_course.toLowerCase().includes(searchQuery) ||
          d.grade.toLowerCase().includes(searchQuery) ||
          d.result.toLowerCase().includes(searchQuery) ||
          String(d.math_score).includes(searchQuery) ||
          String(d.reading_score).includes(searchQuery) ||
          String(d.writing_score).includes(searchQuery) ||
          String(d.percentage).includes(searchQuery)
        );
      });
    }

    // Sort
    data.sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }

  function renderTable() {
    const data = getSearchedData();
    const total = data.length;

    const startIdx = (currentPage - 1) * pageSize;
    const pageItems = data.slice(startIdx, startIdx + pageSize);

    if (total === 0) {
      elTableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching student records found</td></tr>`;
      elTableInfo.textContent = 'Showing 0 to 0 of 0 entries';
      elPageDisplay.textContent = 'Page 0';
      elPrevBtn.disabled = true;
      elNextBtn.disabled = true;
      return;
    }

    const rowsHTML = pageItems.map(item => `
      <tr>
        <td style="text-transform: capitalize;">${item.gender}</td>
        <td style="text-transform: capitalize;">${item.race_ethnicity}</td>
        <td style="text-transform: capitalize;">${item.parental_level_of_education}</td>
        <td style="text-transform: capitalize;">${item.lunch}</td>
        <td style="text-transform: capitalize;">${item.test_preparation_course}</td>
        <td><strong>${item.math_score}</strong></td>
        <td><strong>${item.reading_score}</strong></td>
        <td><strong>${item.writing_score}</strong></td>
        <td><strong style="color: var(--accent-teal);">${item.percentage}%</strong></td>
        <td><span class="badge badge-grade-${item.grade}">Grade ${item.grade}</span></td>
        <td><span class="badge ${item.result === 'Pass' ? 'badge-pass' : 'badge-fail'}">${item.result}</span></td>
      </tr>
    `).join('');

    elTableBody.innerHTML = rowsHTML;

    const endIdx = Math.min(startIdx + pageSize, total);
    elTableInfo.textContent = `Showing ${startIdx + 1} to ${endIdx} of ${total.toLocaleString()} entries`;

    const maxPages = Math.ceil(total / pageSize);
    elPageDisplay.textContent = `Page ${currentPage} of ${maxPages}`;
    elPrevBtn.disabled = currentPage === 1;
    elNextBtn.disabled = currentPage === maxPages || maxPages === 0;
  }

});
