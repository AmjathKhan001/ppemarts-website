// ===== DOM Elements =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const printBtn = document.getElementById('printBtn');
const ppeTypeSelect = document.getElementById('ppeType');
const ppeCustomSection = document.getElementById('ppeCustomSection');
const resultsContainer = document.getElementById('resultsContainer');
const resultsTable = document.getElementById('resultsTable');
const resultsTotal = document.getElementById('resultsTotal');
const productsGrid = document.getElementById('productsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const visitorCount = document.getElementById('visitorCount');
const totalVisitors = document.getElementById('totalVisitors');

// ===== Mobile Navigation Toggle =====
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.innerHTML = navMenu.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// ===== Visitor Counter =====
function updateVisitorCount() {
    // Generate realistic visitor numbers
    const baseVisitors = 2847;
    const dailyIncrement = Math.floor(Math.random() * 50) + 30;
    const todayVisitors = Math.floor(Math.random() * 200) + 100;
    
    // Update counters
    visitorCount.textContent = todayVisitors.toLocaleString();
    totalVisitors.textContent = (baseVisitors + dailyIncrement).toLocaleString();
    
    // Store in localStorage for persistence
    localStorage.setItem('ppemartsVisitors', (baseVisitors + dailyIncrement).toString());
    localStorage.setItem('ppemartsTodayVisitors', todayVisitors.toString());
}

// Initialize visitor count
if (localStorage.getItem('ppemartsVisitors')) {
    visitorCount.textContent = localStorage.getItem('ppemartsTodayVisitors') || '1,234';
    totalVisitors.textContent = parseInt(localStorage.getItem('ppemartsVisitors')).toLocaleString();
} else {
    updateVisitorCount();
}

// Update visitor count every 30 minutes
setInterval(updateVisitorCount, 30 * 60 * 1000);

// ===== PPE Calculator Logic =====
// PPE item definitions with descriptions and units
const ppeItems = {
    mask: { name: 'Face Masks', desc: 'Surgical/N95 masks', unit: 'pieces', perWorkerPerDay: 2 },
    gloves: { name: 'Gloves', desc: 'Disposable latex/nitrile gloves', unit: 'pairs', perWorkerPerDay: 2 },
    gown: { name: 'Disposable Gowns', desc: 'Protective gowns/coveralls', unit: 'pieces', perWorkerPerDay: 0.5 },
    faceShield: { name: 'Face Shields', desc: 'Reusable face shields', unit: 'pieces', perWorkerPerDay: 0.2 },
    goggles: { name: 'Safety Goggles', desc: 'Protective eyewear', unit: 'pairs', perWorkerPerDay: 0.1 },
    respirator: { name: 'Respirators', desc: 'Half/full face respirators', unit: 'pieces', perWorkerPerDay: 0.05 },
    harness: { name: 'Safety Harness', desc: 'Full body harness', unit: 'pieces', perWorkerPerDay: 0.01 },
    helmet: { name: 'Safety Helmet', desc: 'Hard hats/helmets', unit: 'pieces', perWorkerPerDay: 0.01 },
    shoes: { name: 'Safety Shoes', desc: 'Steel-toe boots', unit: 'pairs', perWorkerPerDay: 0.005 }
};

// PPE presets for different types
const ppePresets = {
    basic: ['mask', 'gloves', 'gown'],
    full: ['mask', 'gloves', 'gown', 'faceShield', 'goggles'],
    respiratory: ['mask', 'gloves', 'respirator', 'goggles'],
    fall: ['helmet', 'harness', 'shoes', 'gloves'],
    custom: [] // Will be populated from checkboxes
};

// Show/hide custom PPE selection
ppeTypeSelect.addEventListener('change', function() {
    const isCustom = this.value === 'custom';
    ppeCustomSection.style.display = isCustom ? 'block' : 'none';
});

// Calculate PPE requirements
calculateBtn.addEventListener('click', function() {
    const workers = parseInt(document.getElementById('workers').value) || 10;
    const workDays = parseInt(document.getElementById('workDays').value) || 22;
    const ppeType = ppeTypeSelect.value;
    
    // Get selected PPE items
    let selectedItems = [];
    if (ppeType === 'custom') {
        const checkboxes = document.querySelectorAll('input[name="ppeItem"]:checked');
        selectedItems = Array.from(checkboxes).map(cb => cb.value);
    } else {
        selectedItems = ppePresets[ppeType];
    }
    
    if (selectedItems.length === 0) {
        alert('Please select at least one PPE item for calculation.');
        return;
    }
    
    // Calculate requirements
    const results = [];
    let totalMonthly = 0;
    
    selectedItems.forEach(itemKey => {
        const item = ppeItems[itemKey];
        const monthlyQty = Math.ceil(workers * item.perWorkerPerDay * workDays);
        totalMonthly += monthlyQty;
        
        results.push({
            name: item.name,
            desc: item.desc,
            qty: monthlyQty,
            unit: item.unit,
            perWorker: item.perWorkerPerDay
        });
    });
    
    // Display results
    displayResults(results, workers, workDays, totalMonthly);
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
});

// Display calculation results
function displayResults(results, workers, workDays, totalMonthly) {
    // Clear previous results
    resultsTable.innerHTML = '';
    
    // Create results table
    results.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'result-row';
        row.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div style="font-size: 0.85rem; color: #666;">${item.desc}</div>
            </div>
            <div style="text-align: right;">
                <div><strong>${item.qty.toLocaleString()} ${item.unit}</strong></div>
                <div style="font-size: 0.85rem; color: #666;">
                    ${item.perWorker} ${item.unit}/worker/day
                </div>
            </div>
        `;
        resultsTable.appendChild(row);
    });
    
    // Display total
    resultsTotal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>Total Monthly Requirement:</strong>
                <div style="font-size: 0.9rem; margin-top: 5px;">
                    For ${workers} workers × ${workDays} days
                </div>
            </div>
            <div style="font-size: 1.5rem; font-weight: 700;">
                ${totalMonthly.toLocaleString()} items
            </div>
        </div>
        <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
            <i class="fas fa-info-circle"></i> These are estimated quantities. Adjust based on your specific needs.
        </div>
    `;
    
    // Update placeholder
    resultsContainer.querySelector('.results-placeholder').style.display = 'none';
}

// Reset calculator
resetBtn.addEventListener('click', function() {
    document.getElementById('workers').value = 10;
    document.getElementById('workDays').value = 22;
    ppeTypeSelect.value = 'basic';
    ppeCustomSection.style.display = 'none';
    
    // Reset checkboxes
    document.querySelectorAll('input[name="ppeItem"]').forEach(cb => {
        cb.checked = ['mask', 'gloves'].includes(cb.value);
    });
    
    resultsTable.innerHTML = '';
    resultsTotal.innerHTML = '';
    resultsContainer.querySelector('.results-placeholder').style.display = 'block';
});

// Print results
printBtn.addEventListener('click', function() {
    const printContent = document.querySelector('.calculator-results').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>PPE Requirements - PPEMarts.com</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #ff4c4c; }
                .print-header { text-align: center; margin-bottom: 30px; }
                .print-date { color: #666; font-size: 0.9em; }
                .result-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .print-total { background-color: #f5f5f5; padding: 15px; margin-top: 20px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>PPE Requirements Calculation</h1>
                <div class="print-date">Generated on ${new Date().toLocaleDateString()} from PPEMarts.com</div>
            </div>
            ${printContent}
            <div class="print-footer" style="margin-top: 40px; text-align: center; color: #666; font-size: 0.8em;">
                <p>This is an estimate. Always consult with safety professionals for exact requirements.</p>
                <p>Visit www.ppemarts.com for more tools and PPE products.</p>
            </div>
        </body>
        </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Refresh to restore functionality
});

// ===== Product Filtering =====
// Load products
function loadProducts(filter = 'all') {
    productsGrid.innerHTML = '';
    
    const filteredProducts = filter === 'all' 
        ? products 
        : products.filter(product => product.category === filter);
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-content">
                <span class="product-category">${product.category.toUpperCase()}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-actions">
                    <a href="${product.affiliateLink}" target="_blank" class="btn btn-buy">
                        <i class="fas fa-shopping-cart"></i> Buy Now
                    </a>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Filter button functionality
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Filter products
        const category = this.getAttribute('data-category');
        loadProducts(category);
    });
});

// Initial product load
loadProducts();

// ===== Social Sharing Functions =====
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out PPE Marts - Find PPE kits and calculate your requirements!');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('PPE Marts - PPE kits and calculator tools for safety professionals');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('PPE Marts - Personal Protective Equipment Marketplace');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

function shareByEmail() {
    const subject = encodeURIComponent('Check out PPE Marts - PPE Calculator & Products');
    const body = encodeURIComponent(`I found this useful PPE website:\n\n${window.location.href}\n\nIt has PPE calculators and affiliate links to safety products.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// ===== Initialize Page =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calculator
    ppeCustomSection.style.display = 'none';
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + 'px';
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                this._tooltip = null;
            }
        });
    });
});

// ===== Utility Functions =====
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Add CSS for tooltips
const tooltipStyle = document.createElement('style');
tooltipStyle.textContent = `
    .tooltip {
        position: absolute;
        background: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 0.85rem;
        z-index: 1000;
        white-space: nowrap;
        pointer-events: none;
    }
    
    .tooltip:after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #333 transparent transparent transparent;
    }
`;
document.head.appendChild(tooltipStyle);
