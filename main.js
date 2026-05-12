// --- 1. Global Setup & Utilities ---

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initRevealAnimations();
    initCharts();
    initTabs();
    initAssessment();
});

// Navigation & Scroll effects
function initNavigation() {
    const nav = document.querySelector('nav');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileToggle.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileToggle.innerHTML = '☰';
        });
    });
}

// Scroll Reveal Animations
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => revealObserver.observe(el));
}

// --- 2. Charting ---

let mixedChartInstance = null;

const correlationData = {
    labels: ['輕微壓力', '中度壓力', '高度壓力', '重度壓力'],
    bmiData: [22.8, 24.5, 27.2, 29.8],
    crpData: [1.1, 2.8, 4.5, 8.2]
};

function initCharts() {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#a1a1a6';

    // Mixed Chart
    const ctxMixed = document.getElementById('correlationChart');
    if (!ctxMixed) return;

    mixedChartInstance = new Chart(ctxMixed.getContext('2d'), {
        data: {
            labels: correlationData.labels,
            datasets: [
                {
                    type: 'line',
                    label: 'CRP 發炎指數',
                    data: correlationData.crpData,
                    borderColor: '#ff3b30',
                    backgroundColor: '#ff3b30',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointRadius: 5,
                    yAxisID: 'y1',
                    tension: 0.4
                },
                {
                    type: 'bar',
                    label: '平均 BMI',
                    data: correlationData.bmiData,
                    backgroundColor: 'rgba(0, 242, 234, 0.4)',
                    borderRadius: 8,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    padding: 15,
                    backgroundColor: '#16161a',
                    titleColor: '#fff',
                    bodyColor: '#a1a1a6',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    suggestedMin: 20
                },
                y1: {
                    position: 'right',
                    grid: { display: false },
                    suggestedMax: 10
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // Donut Chart (Minimalist version)
    const ctxDonut = document.getElementById('distributionChart');
    if (ctxDonut) {
        new Chart(ctxDonut.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['重度', '中高', '輕度', '極低'],
                datasets: [{
                    data: [22, 45, 25, 8],
                    backgroundColor: ['#ff3b30', '#ff7b72', '#ffd0ce', '#16161a'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

window.updateChart = function(type) {
    if (!mixedChartInstance) return;
    
    const datasetBar = mixedChartInstance.data.datasets[1];
    
    // Reset buttons
    document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (type === 'all') {
        datasetBar.backgroundColor = 'rgba(0, 242, 234, 0.4)';
    } else if (type === 'low') {
        datasetBar.backgroundColor = correlationData.labels.map((_, i) => i === 0 ? 'rgba(0, 242, 234, 0.8)' : 'rgba(255,255,255,0.05)');
    } else if (type === 'high') {
        datasetBar.backgroundColor = correlationData.labels.map((_, i) => i >= 2 ? 'rgba(255, 59, 48, 0.8)' : 'rgba(255,255,255,0.05)');
    }
    
    mixedChartInstance.update();
};

// --- 3. Interaction ---

function initTabs() {
    window.switchTab = function(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
    };
}

function initAssessment() {
    const stressSlider = document.getElementById('input-stress');
    const stressVal = document.getElementById('stress-val');
    if (stressSlider) {
        stressSlider.addEventListener('input', (e) => {
            stressVal.innerText = e.target.value;
        });
    }

    window.calculateRisk = function() {
        const gender = document.getElementById('input-gender').value;
        const stress = parseInt(document.getElementById('input-stress').value);
        const sleep = parseFloat(document.getElementById('input-sleep').value);
        const waist = parseFloat(document.getElementById('input-waist').value);

        if (!sleep || !waist) {
            alert("請完整輸入數據");
            return;
        }

        // Logic (simplified but functionally similar to original)
        let inflRisk = (stress * 5) + ((8 - Math.min(sleep, 8)) * 8);
        let inflLevel = inflRisk < 30 ? '低風險' : (inflRisk < 55 ? '中度風險' : '高度危險');
        let inflColor = inflRisk < 30 ? 'var(--accent-cyan)' : (inflRisk < 55 ? '#ffcc00' : 'var(--accent-red)');

        const standardWaist = gender === 'male' ? 90 : 80;
        let fatLevel = (waist > standardWaist) ? '超標危險' : '安全範圍';
        let fatColor = (waist > standardWaist) ? 'var(--accent-red)' : 'var(--accent-cyan)';

        // Update UI
        document.getElementById('result-placeholder').style.display = 'none';
        const result = document.getElementById('result-content');
        result.style.display = 'block';

        document.getElementById('infl-level').innerText = inflLevel;
        document.getElementById('infl-level').style.color = inflColor;
        document.getElementById('fat-level').innerText = fatLevel;
        document.getElementById('fat-level').style.color = fatColor;

        // Advice text (brief summary)
        let advice = `您的壓力指數為 ${stress}/10。`;
        if (inflLevel === '高度危險') advice += "身體處於高發炎狀態，建議優先改善睡眠與情緒調節。";
        else advice += "目前狀況尚可，請繼續保持健康習慣。";
        
        document.getElementById('advice-text').innerText = advice;
    };
}
