function getPeriodsPerYear(frequency) {
  switch (frequency) {
    case 'quarterly': return 4;
    case 'annually': return 1;
    default: return 12;
  }
}

function calculateGrowth(initial, contribAmount, annualReturn, years, contribGrowth, contribFrequency, compoundingFrequency) {
  const contribPeriods = getPeriodsPerYear(contribFrequency);
  const compoundPeriods = getPeriodsPerYear(compoundingFrequency);
  const periodRate = annualReturn / compoundPeriods;
  
  const yearlyValues = [initial];
  let portfolio = initial;
  
  for (let y = 0; y < years; y++) {
    const yearStartPortfolio = portfolio;
    const yearlyContrib = contribAmount * Math.pow(1 + contribGrowth, y);
    
    for (let p = 0; p < compoundPeriods; p++) {
      const contribsThisPeriod = contribPeriods / compoundPeriods;
      for (let c = 0; c < contribsThisPeriod; c++) {
        portfolio += yearlyContrib;
      }
      portfolio *= (1 + periodRate);
    }
    
    yearlyValues.push(Math.round(portfolio * 100) / 100);
  }
  
  return yearlyValues;
}

function portfolioGrowth(initial, contribAmount, annualReturn, years, contribGrowth = 0, contribFrequency = 'monthly', compoundingFrequency = 'annually') {
  const values = calculateGrowth(initial, contribAmount, annualReturn, years, contribGrowth, contribFrequency, compoundingFrequency);
  return values[values.length - 1];
}

function getYearlyData(initial, contribAmount, annualReturn, years, contribGrowth = 0, contribFrequency = 'monthly', compoundingFrequency = 'annually') {
  return calculateGrowth(initial, contribAmount, annualReturn, years, contribGrowth, contribFrequency, compoundingFrequency);
}

function getInvestedData(initial, contribAmount, years, contribGrowth = 0, contribFrequency = 'monthly') {
  const periodsPerYear = getPeriodsPerYear(contribFrequency);
  const data = [initial];
  let invested = initial;
  for (let y = 0; y < years; y++) {
    invested += periodsPerYear * contribAmount * Math.pow(1 + contribGrowth, y);
    data.push(Math.round(invested * 100) / 100);
  }
  return data;
}

const inputs = ['initial', 'monthly', 'years', 'growth'].map(id => document.getElementById(id));
const resultEl = document.getElementById('result');
const ctx = document.getElementById('chart').getContext('2d');

const STORAGE_KEY = 'portfolioGrowthState';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);
    if (state.inputs) inputs.forEach((el, i) => { if (state.inputs[i] !== undefined) el.value = state.inputs[i]; });
    if (state.slider) Object.assign(sliderVals, state.slider);
  } catch {}
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      inputs: inputs.map(el => el.value),
      slider: { ...sliderVals },
    }));
  } catch {}
}

const sliderVals = { badReturn: 2, return: 7, goodReturn: 12 };
const maxReturn = 30;
const handleEls = {
  badReturn: document.getElementById('handleBad'),
  return: document.getElementById('handleReturn'),
  goodReturn: document.getElementById('handleGood')
};
const valInputs = {
  badReturn: document.getElementById('badReturnVal'),
  return: document.getElementById('returnVal'),
  goodReturn: document.getElementById('goodReturnVal')
};
const wrapEls = {
  badReturn: document.getElementById('wrapBad'),
  return: document.getElementById('wrapReturn'),
  goodReturn: document.getElementById('wrapGood')
};
const track = document.getElementById('sliderTrack');
const fill = document.getElementById('sliderFill');
let dragKey = null;

function pct(v) { return (v / maxReturn) * 100; }

function renderSlider() {
  const b = sliderVals.badReturn, r = sliderVals.return, g = sliderVals.goodReturn;
  const bp = pct(b), rp = pct(r), gp = pct(g);
  handleEls.badReturn.style.left = bp + '%';
  handleEls.return.style.left = rp + '%';
  handleEls.goodReturn.style.left = gp + '%';
  wrapEls.badReturn.style.left = bp + '%';
  wrapEls.return.style.left = rp + '%';
  wrapEls.goodReturn.style.left = gp + '%';
  valInputs.badReturn.value = b.toFixed(1);
  valInputs.return.value = r.toFixed(1);
  valInputs.goodReturn.value = g.toFixed(1);
  fill.style.width = gp + '%';
}

function valFromClientX(clientX) {
  const rect = track.getBoundingClientRect();
  return Math.max(0, Math.min(maxReturn, ((clientX - rect.left) / rect.width) * maxReturn));
}

function onDragStart(e, key) {
  e.preventDefault();
  dragKey = key;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('touchend', onDragEnd);
}

function onDrag(e) {
  if (!dragKey) return;
  e.preventDefault();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let raw = valFromClientX(clientX);
  raw = Math.round(raw * 10) / 10;
  if (dragKey === 'badReturn') {
    raw = Math.min(raw, sliderVals.return);
  } else if (dragKey === 'return') {
    raw = Math.max(sliderVals.badReturn, Math.min(raw, sliderVals.goodReturn));
  } else if (dragKey === 'goodReturn') {
    raw = Math.max(raw, sliderVals.return);
  }
  sliderVals[dragKey] = raw;
  renderSlider();
  update();
}

function onDragEnd() {
  dragKey = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', onDragEnd);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', onDragEnd);
}

Object.entries(handleEls).forEach(([key, el]) => {
  el.addEventListener('mousedown', e => onDragStart(e, key));
  el.addEventListener('touchstart', e => onDragStart(e, key), { passive: false });
});

Object.entries(valInputs).forEach(([key, el]) => {
  el.addEventListener('input', () => {
    let raw = parseFloat(el.value);
    if (isNaN(raw)) return;
    raw = Math.round(raw * 10) / 10;
    raw = Math.max(0, Math.min(maxReturn, raw));
    if (key === 'badReturn') {
      raw = Math.min(raw, sliderVals.return);
    } else if (key === 'return') {
      raw = Math.max(sliderVals.badReturn, Math.min(raw, sliderVals.goodReturn));
    } else if (key === 'goodReturn') {
      raw = Math.max(raw, sliderVals.return);
    }
    sliderVals[key] = raw;
    renderSlider();
    update();
  });
});

let chart = new Chart(ctx, {
  type: 'line',
  data: { labels: [], datasets: [
    { label: 'Portfolio Value (€)', data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.1)', fill: true, tension: .3, pointRadius: 0 },
    { label: 'Total Invested (€)', data: [], borderColor: '#6b7280', backgroundColor: 'rgba(107,114,128,.05)', fill: false, tension: .3, borderDash: [6, 3], pointRadius: 0 },
    { label: 'Bad Return (€)', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.05)', fill: false, tension: .3, borderDash: [4, 2], pointRadius: 0 },
    { label: 'Good Return (€)', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.05)', fill: false, tension: .3, borderDash: [4, 2], pointRadius: 0 }
  ] },
  options: { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 12,
          font: { size: 11 }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const value = context.raw;
            if (value >= 1000000) {
              return context.dataset.label.split(' (€)')[0] + ': €' + (value / 1000000).toFixed(2) + 'M';
            } else if (value >= 1000) {
              return context.dataset.label.split(' (€)')[0] + ': €' + (value / 1000).toFixed(1) + 'k';
            } else {
              return context.dataset.label.split(' (€)')[0] + ': €' + value.toFixed(0);
            }
          }
        }
      }
    }, 
    scales: { 
      x: { 
        title: { 
          display: true, 
          text: 'Year',
          font: { size: 11 }
        },
        ticks: {
          maxTicksLimit: 8,
          font: { size: 10 }
        }
      }, 
      y: { 
        beginAtZero: true,
        ticks: { 
          maxTicksLimit: 6,
          font: { size: 10 },
          callback: function(value) { 
            if (value >= 1000000) {
              return '€' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return '€' + (value / 1000).toFixed(0) + 'k';
            } else {
              return '€' + value.toFixed(0);
            }
          } 
        } 
      } 
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }
});

function findMilestoneYear(data, target) {
  for (let i = 0; i < data.length; i++) {
    if (data[i] >= target) return i;
  }
  return null;
}

function fmt(n) {
  return '€' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function update() {
  const vals = inputs.map(el => parseFloat(el.value));
  if (vals.some(isNaN)) return;
  const [initial, monthly, years, growth] = vals;
  const frequency = document.getElementById('frequency').value;
  const compounding = document.getElementById('compounding').value;
  const annualReturn = sliderVals.return / 100;
  const badReturn = sliderVals.badReturn / 100;
  const goodReturn = sliderVals.goodReturn / 100;
  const final = portfolioGrowth(initial, monthly, annualReturn, years, growth / 100, frequency, compounding);
  resultEl.textContent = `Projected portfolio after ${years} years: €${final.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const portfolioData = getYearlyData(initial, monthly, annualReturn, years, growth / 100, frequency, compounding);
  const investedData = getInvestedData(initial, monthly, years, growth / 100, frequency);
  const badData = getYearlyData(initial, monthly, badReturn, years, growth / 100, frequency, compounding);
  const goodData = getYearlyData(initial, monthly, goodReturn, years, growth / 100, frequency, compounding);
  chart.data.labels = Array.from({ length: years + 1 }, (_, i) => i);
  chart.data.datasets[0].data = portfolioData;
  chart.data.datasets[1].data = investedData;
  chart.data.datasets[2].data = badData;
  chart.data.datasets[3].data = goodData;
  chart.update();

  const milestones = [0, 1, 5];
  for (let y = 10; y <= years; y += 5) milestones.push(y);

  const millionEntries = [
    { yr: findMilestoneYear(portfolioData, 1_000_000), col: 1 },
    { yr: findMilestoneYear(badData, 1_000_000), col: 2 },
    { yr: findMilestoneYear(goodData, 1_000_000), col: 3 },
  ];
  const millionMap = {};
  millionEntries.forEach(({ yr, col }) => {
    if (yr !== null && yr <= years) {
      (millionMap[yr] = millionMap[yr] || []).push(col);
      if (!milestones.includes(yr)) milestones.push(yr);
    }
  });
  milestones.sort((a, b) => a - b);

  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = milestones.map(y => {
    if (y > years) return '';
    const cols = millionMap[y] || [];
    const cells = [y, portfolioData[y], badData[y], goodData[y], investedData[y]];
    return '<tr>' + cells.map((v, i) => {
      const cls = cols.includes(i) ? ' class="million"' : '';
      return `<td${cls}>${i === 0 ? v : fmt(v)}</td>`;
    }).join('') + '</tr>';
  }).join('');
  saveState();
}

inputs.forEach(el => el.addEventListener('input', update));
document.getElementById('frequency').addEventListener('change', update);
document.getElementById('compounding').addEventListener('change', update);
loadState();
renderSlider();
update();
