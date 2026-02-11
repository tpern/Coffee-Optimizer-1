/**
 * =====================================================
 * ADMIN DASHBOARD FUNCTIONALITY
 * =====================================================
 * Handles all admin panel features: stats, tables, charts, etc.
 */

// API Base URL
const API_BASE = '/api/admin';

// Current page state
let currentPage = 'dashboard';
let currentDataPage = 1;
let currentFilters = {};

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!isAuthenticated()) {
    window.location.href = '/admin/login';
    return;
  }
  
  // Set up navigation
  setupNavigation();
  
  // Set up logout button
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  // Mobile sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  document.getElementById('sidebarToggle')?.addEventListener('click', function() {
    sidebar?.classList.toggle('translate-x-0');
    sidebar?.classList.toggle('-translate-x-full');
    backdrop?.classList.toggle('opacity-0');
    backdrop?.classList.toggle('pointer-events-auto');
  });
  backdrop?.addEventListener('click', function() {
    sidebar?.classList.add('-translate-x-full');
    sidebar?.classList.remove('translate-x-0');
    backdrop?.classList.add('opacity-0');
    backdrop?.classList.remove('pointer-events-auto');
  });
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth < 768) {
        sidebar?.classList.add('-translate-x-full');
        sidebar?.classList.remove('translate-x-0');
        backdrop?.classList.add('opacity-0');
        backdrop?.classList.remove('pointer-events-auto');
      }
    });
  });

  // Load dashboard by default
  navigateToPage('dashboard');
});

/**
 * Setup sidebar navigation
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      if (page) {
        navigateToPage(page);
      }
    });
  });
}

/**
 * Navigate to different admin pages
 */
function navigateToPage(page) {
  currentPage = page;
  
  // Update active nav link
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.classList.remove('active', 'bg-primary-600/20', 'text-white');
    link.classList.add('text-slate-300');
    if (link.getAttribute('data-page') === page) {
      link.classList.remove('text-slate-300');
      link.classList.add('active', 'bg-primary-600/20', 'text-white');
    }
  });
  
  // Hide all content sections (support both style and Tailwind hidden)
  const sections = ['dashboardContent', 'contactsContent', 'reviewsContent', 'scaContent', 'brewReviewsContent'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.add('hidden');
    }
  });
  
  // Update page title
  const pageTitle = document.getElementById('pageTitle');
  const titles = {
    'dashboard': 'Dashboard',
    'contacts': 'Contact Messages',
    'reviews': 'Reviews',
    'sca-feedback': 'SCA Feedback',
    'brew-reviews': 'Brew Reviews'
  };
  if (pageTitle) {
    pageTitle.textContent = titles[page] || 'Dashboard';
  }
  
  // Show and load page content
  function showSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'block';
      el.classList.remove('hidden');
    }
  }
  switch(page) {
    case 'dashboard':
      showSection('dashboardContent');
      loadDashboard();
      break;
    case 'contacts':
      showSection('contactsContent');
      loadContactMessages();
      break;
    case 'reviews':
      showSection('reviewsContent');
      loadReviews();
      break;
    case 'sca-feedback':
      showSection('scaContent');
      loadSCAFeedback();
      break;
    case 'brew-reviews':
      showSection('brewReviewsContent');
      loadBrewReviews();
      break;
  }
}

/**
 * Load dashboard with stats and charts
 */
async function loadDashboard() {
  try {
    showLoading('dashboardContent');
    
    const response = await fetch(`${API_BASE}/stats`, {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });
    
    if (response.status === 401) {
      logout();
      return;
    }
    
    const result = await response.json();
    
    if (result.success) {
      displayStats(result.data);
      displayCharts(result.data);
    }
  } catch (error) {
    console.error('Load dashboard error:', error);
    showError('dashboardContent', 'Failed to load dashboard data');
  }
}

/**
 * Display statistics cards
 */
function displayStats(data) {
  const statsContainer = document.getElementById('statsContainer');
  if (!statsContainer) return;
  
  const totalSubs = data.totals.contacts + data.totals.reviews + data.totals.scaFeedback + data.totals.brewReviews;
  statsContainer.innerHTML = `
    <div class="stat-card bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Submissions</h3>
      <p class="stat-value text-2xl font-bold text-slate-800 m-0">${totalSubs}</p>
    </div>
    <div class="stat-card bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Contact Messages</h3>
      <p class="stat-value text-2xl font-bold text-slate-800 m-0">${data.totals.contacts}</p>
      <p class="stat-change text-sm text-emerald-600 font-medium mt-1">+${data.newThisWeek.contacts} this week</p>
    </div>
    <div class="stat-card bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Reviews</h3>
      <p class="stat-value text-2xl font-bold text-slate-800 m-0">${data.totals.reviews}</p>
      <p class="stat-change text-sm text-emerald-600 font-medium mt-1">+${data.newThisWeek.reviews} this week</p>
    </div>
    <div class="stat-card bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">SCA Feedback</h3>
      <p class="stat-value text-2xl font-bold text-slate-800 m-0">${data.totals.scaFeedback}</p>
      <p class="stat-change text-sm text-emerald-600 font-medium mt-1">+${data.newThisWeek.scaFeedback} this week</p>
    </div>
    <div class="stat-card bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Brew Reviews</h3>
      <p class="stat-value text-2xl font-bold text-slate-800 m-0">${data.totals.brewReviews}</p>
      <p class="stat-change text-sm text-emerald-600 font-medium mt-1">+${data.newThisWeek.brewReviews} this week</p>
    </div>
    <div class="stat-card bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Avg Review Rating</h3>
      <p class="stat-value text-2xl font-bold text-slate-800 m-0">${data.averages.reviewRating.toFixed(1)}</p>
    </div>
    <div class="stat-card bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Avg Brew Rating</h3>
      <p class="stat-value text-2xl font-bold text-slate-800 m-0">${data.averages.brewRating.toFixed(1)}</p>
    </div>
  `;
}

/**
 * Display charts using Chart.js
 */
function displayCharts(data) {
  // Load Chart.js if not already loaded
  if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => createCharts(data);
    document.head.appendChild(script);
  } else {
    createCharts(data);
  }
}

/**
 * Create Chart.js charts
 */
function createCharts(data) {
  const chartsContainer = document.getElementById('chartsContainer');
  if (!chartsContainer) return;
  
  chartsContainer.innerHTML = `
    <div class="chart-card bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm col-span-1">
      <h3 class="text-base font-semibold text-slate-800 mb-4">Submissions Over Time</h3>
      <div class="h-64"><canvas id="submissionsChart"></canvas></div>
    </div>
    <div class="chart-card bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm col-span-1">
      <h3 class="text-base font-semibold text-slate-800 mb-4">Rating Distribution</h3>
      <div class="h-64"><canvas id="ratingChart"></canvas></div>
    </div>
    <div class="chart-card bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm col-span-1 xl:col-span-2">
      <h3 class="text-base font-semibold text-slate-800 mb-4">Popular Grinders</h3>
      <div class="h-64"><canvas id="grindersChart"></canvas></div>
    </div>
  `;

  const chartColors = {
    primary: '#2563eb',
    primaryLight: 'rgba(37, 99, 235, 0.12)',
    palette: ['#2563eb', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e']
  };

  const submissionsCtx = document.getElementById('submissionsChart');
  if (submissionsCtx) {
    new Chart(submissionsCtx, {
      type: 'line',
      data: {
        labels: data.submissionsOverTime.map(item => item._id),
        datasets: [{
          label: 'Brew Reviews',
          data: data.submissionsOverTime.map(item => item.count),
          borderColor: chartColors.primary,
          backgroundColor: chartColors.primaryLight,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const ratingCtx = document.getElementById('ratingChart');
  if (ratingCtx) {
    new Chart(ratingCtx, {
      type: 'bar',
      data: {
        labels: data.ratingDistribution.map(item => `${item._id} Stars`),
        datasets: [{
          label: 'Reviews',
          data: data.ratingDistribution.map(item => item.count),
          backgroundColor: chartColors.primary
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const grindersCtx = document.getElementById('grindersChart');
  if (grindersCtx && data.popularGrinders.length > 0) {
    new Chart(grindersCtx, {
      type: 'pie',
      data: {
        labels: data.popularGrinders.map(item => item._id),
        datasets: [{
          data: data.popularGrinders.map(item => item.count),
          backgroundColor: chartColors.palette
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}

/**
 * Load contact messages table
 */
async function loadContactMessages(page = 1) {
  try {
    showLoading('contactsContent');
    
    const params = new URLSearchParams({
      page,
      limit: 50,
      ...currentFilters
    });
    
    const response = await fetch(`${API_BASE}/contact-messages?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });
    
    if (response.status === 401) {
      logout();
      return;
    }
    
    const result = await response.json();
    
    if (result.success) {
      displayContactMessages(result.data, result.pagination);
    }
  } catch (error) {
    console.error('Load contact messages error:', error);
    showError('contactsContent', 'Failed to load contact messages');
  }
}

/**
 * Display contact messages in table
 */
function displayContactMessages(messages, pagination) {
  const container = document.getElementById('contactsContent');
  if (!container) return;
  
  const tableRows = messages.map(msg => `
    <tr class="border-b border-slate-200 hover:bg-slate-50/80">
      <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">${formatDate(msg.createdAt)}</td>
      <td class="px-4 py-3 text-sm text-slate-800 font-medium">${escapeHtml(msg.name)}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${escapeHtml(msg.email)}</td>
      <td class="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">${escapeHtml(msg.message.substring(0, 100))}${msg.message.length > 100 ? '...' : ''}</td>
      <td class="px-4 py-3">
        <span class="badge inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${msg.read ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${msg.read ? 'Read' : 'Unread'}
        </span>
      </td>
      <td class="px-4 py-3 whitespace-nowrap">
        <button type="button" class="btn-sm btn-edit mr-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700" onclick="toggleReadStatus('${msg._id}', ${!msg.read})">
          ${msg.read ? 'Mark Unread' : 'Mark Read'}
        </button>
        <button type="button" class="btn-sm btn-delete px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700" onclick="deleteContactMessage('${msg._id}')">Delete</button>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="data-section bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="data-section-header flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-slate-200">
        <h2 class="text-lg font-bold text-slate-800 m-0">Contact Messages</h2>
        <div class="table-controls flex flex-wrap items-center gap-2">
          <input type="text" id="contactsSearch" placeholder="Search..." onkeyup="filterContacts()" class="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[140px]" />
          <select id="contactsFilter" onchange="filterContacts()" class="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">All</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>
          <button type="button" onclick="exportData('contacts')" class="btn-export px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700">Export CSV</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table w-full text-left min-w-[800px]">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Date</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Name</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Email</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Message</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      ${displayPagination(pagination, 'loadContactMessages')}
    </div>
  `;
}

/**
 * Load reviews table
 */
async function loadReviews(page = 1) {
  try {
    showLoading('reviewsContent');
    
    const params = new URLSearchParams({
      page,
      limit: 50,
      ...currentFilters
    });
    
    const response = await fetch(`${API_BASE}/reviews?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });
    
    if (response.status === 401) {
      logout();
      return;
    }
    
    const result = await response.json();
    
    if (result.success) {
      displayReviews(result.data, result.pagination);
    }
  } catch (error) {
    console.error('Load reviews error:', error);
    showError('reviewsContent', 'Failed to load reviews');
  }
}

/**
 * Display reviews in table
 */
function displayReviews(reviews, pagination) {
  const container = document.getElementById('reviewsContent');
  if (!container) return;
  
  const tableRows = reviews.map(review => `
    <tr class="border-b border-slate-200 hover:bg-slate-50/80">
      <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">${formatDate(review.createdAt)}</td>
      <td class="px-4 py-3 text-sm text-slate-800 font-medium">${escapeHtml(review.grinderName)}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} (${review.rating})</td>
      <td class="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">${escapeHtml(review.reviewText.substring(0, 100))}${review.reviewText.length > 100 ? '...' : ''}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${escapeHtml(review.reviewerName)}</td>
      <td class="px-4 py-3">
        <span class="badge inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${review.approved ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}">
          ${review.approved ? 'Approved' : 'Pending'}
        </span>
      </td>
      <td class="px-4 py-3 whitespace-nowrap">
        <button type="button" class="btn-sm btn-edit mr-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700" onclick="toggleReviewApproval('${review._id}', ${!review.approved})">
          ${review.approved ? 'Unapprove' : 'Approve'}
        </button>
        <button type="button" class="btn-sm btn-delete px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700" onclick="deleteReview('${review._id}')">Delete</button>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="data-section bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="data-section-header flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-slate-200">
        <h2 class="text-lg font-bold text-slate-800 m-0">Reviews</h2>
        <div class="table-controls flex flex-wrap items-center gap-2">
          <input type="text" id="reviewsSearch" placeholder="Search..." onkeyup="filterReviews()" class="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[140px]" />
          <select id="reviewsFilter" onchange="filterReviews()" class="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">All</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
          <button type="button" onclick="exportData('reviews')" class="btn-export px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700">Export CSV</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table w-full text-left min-w-[800px]">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Date</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Grinder</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Rating</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Review</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Reviewer</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      ${displayPagination(pagination, 'loadReviews')}
    </div>
  `;
}

/**
 * Load SCA feedback table
 */
async function loadSCAFeedback(page = 1) {
  try {
    showLoading('scaContent');
    
    const params = new URLSearchParams({
      page,
      limit: 50,
      ...currentFilters
    });
    
    const response = await fetch(`${API_BASE}/sca-feedback?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });
    
    if (response.status === 401) {
      logout();
      return;
    }
    
    const result = await response.json();
    
    if (result.success) {
      displaySCAFeedback(result.data, result.pagination);
    }
  } catch (error) {
    console.error('Load SCA feedback error:', error);
    showError('scaContent', 'Failed to load SCA feedback');
  }
}

/**
 * Display SCA feedback in table
 */
function displaySCAFeedback(feedback, pagination) {
  const container = document.getElementById('scaContent');
  if (!container) return;
  
  const tableRows = feedback.map(item => `
    <tr class="border-b border-slate-200 hover:bg-slate-50/80">
      <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">${formatDate(item.createdAt)}</td>
      <td class="px-4 py-3 text-sm text-slate-600 max-w-md truncate">${escapeHtml(item.feedbackText.substring(0, 150))}${item.feedbackText.length > 150 ? '...' : ''}</td>
      <td class="px-4 py-3 text-sm text-slate-800 font-medium">${item.rating}/10</td>
      <td class="px-4 py-3 text-sm text-slate-600">${item.category}</td>
      <td class="px-4 py-3 whitespace-nowrap">
        <button type="button" class="btn-sm btn-delete px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700" onclick="deleteSCAFeedback('${item._id}')">Delete</button>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="data-section bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="data-section-header flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-slate-200">
        <h2 class="text-lg font-bold text-slate-800 m-0">SCA Feedback</h2>
        <div class="table-controls flex flex-wrap items-center gap-2">
          <input type="text" id="scaSearch" placeholder="Search..." onkeyup="filterSCA()" class="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[140px]" />
          <button type="button" onclick="exportData('sca-feedback')" class="btn-export px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700">Export CSV</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table w-full text-left min-w-[600px]">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Date</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Feedback</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Rating</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Category</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      ${displayPagination(pagination, 'loadSCAFeedback')}
    </div>
  `;
}

/**
 * Load brew reviews table (MOST IMPORTANT)
 */
async function loadBrewReviews(page = 1) {
  try {
    showLoading('brewReviewsContent');
    
    const params = new URLSearchParams({
      page,
      limit: 50,
      ...currentFilters
    });
    
    const response = await fetch(`${API_BASE}/brew-reviews?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });
    
    if (response.status === 401) {
      logout();
      return;
    }
    
    const result = await response.json();
    
    if (result.success) {
      displayBrewReviews(result.data, result.pagination);
    }
  } catch (error) {
    console.error('Load brew reviews error:', error);
    showError('brewReviewsContent', 'Failed to load brew reviews');
  }
}

/**
 * Display brew reviews in table
 */
function displayBrewReviews(reviews, pagination) {
  const container = document.getElementById('brewReviewsContent');
  if (!container) return;
  
  const tableRows = reviews.map(review => `
    <tr class="border-b border-slate-200 hover:bg-slate-50/80">
      <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">${formatDate(review.createdAt)}</td>
      <td class="px-4 py-3 text-sm text-slate-800 font-medium">${escapeHtml(review.grinderUsed)}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${review.brewMethod}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${escapeHtml(review.coffeeOrigin || '-')}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${review.roastLevel || '-'}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${review.waterTemperature ? review.waterTemperature + '°C' : '-'}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${review.brewTime ? review.brewTime + 's' : '-'}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${review.doseGrams ? review.doseGrams + 'g' : '-'}</td>
      <td class="px-4 py-3 text-sm text-slate-600">${review.yieldGrams ? review.yieldGrams + 'g' : '-'}</td>
      <td class="px-4 py-3 text-sm text-slate-800 font-medium">${review.overallRating ? review.overallRating + '/10' : '-'}</td>
      <td class="px-4 py-3 whitespace-nowrap">
        <button type="button" class="btn-sm btn-edit mr-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700" onclick="viewBrewReview('${review._id}')">View</button>
        <button type="button" class="btn-sm btn-edit mr-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700" onclick="editBrewReview('${review._id}')">Edit</button>
        <button type="button" class="btn-sm btn-delete px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700" onclick="deleteBrewReview('${review._id}')">Delete</button>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="data-section bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="data-section-header flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-slate-200">
        <h2 class="text-lg font-bold text-slate-800 m-0">Brew Reviews (${pagination.total} total)</h2>
        <div class="table-controls flex flex-wrap items-center gap-2">
          <input type="text" id="brewSearch" placeholder="Search..." onkeyup="filterBrewReviews()" class="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[120px]" />
          <select id="brewGrinderFilter" onchange="filterBrewReviews()" class="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">All Grinders</option>
          </select>
          <select id="brewMethodFilter" onchange="filterBrewReviews()" class="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">All Methods</option>
            <option value="espresso">Espresso</option>
            <option value="v60">V60</option>
            <option value="chemex">Chemex</option>
            <option value="french-press">French Press</option>
            <option value="aeropress">Aeropress</option>
          </select>
          <input type="date" id="brewDateFrom" onchange="filterBrewReviews()" class="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          <input type="date" id="brewDateTo" onchange="filterBrewReviews()" class="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          <button type="button" onclick="exportData('brew-reviews')" class="btn-export px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700">Export CSV</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table w-full text-left min-w-[900px]">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Date</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Grinder</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Method</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Origin</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Roast</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Temp</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Time</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Dose</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Yield</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Rating</th>
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      ${displayPagination(pagination, 'loadBrewReviews')}
    </div>
  `;
}

/**
 * Helper functions
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<div class="loading text-center py-16 text-slate-500 font-medium">Loading...</div>';
  }
}

function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="error-message p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">${message}</div>`;
  }
}

function displayPagination(pagination, loadFunction) {
  if (!pagination || pagination.pages <= 1) return '';

  return `
    <div class="pagination flex items-center justify-center gap-3 py-5 px-6 border-t border-slate-200 bg-slate-50/50">
      <button type="button" ${pagination.page === 1 ? 'disabled' : ''} onclick="${loadFunction}(${pagination.page - 1})" class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white">
        Previous
      </button>
      <span class="page-info text-sm text-slate-600 font-medium">Page ${pagination.page} of ${pagination.pages} (${pagination.total} total)</span>
      <button type="button" ${pagination.page === pagination.pages ? 'disabled' : ''} onclick="${loadFunction}(${pagination.page + 1})" class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white">
        Next
      </button>
    </div>
  `;
}

/**
 * Action functions
 */
async function toggleReadStatus(id, read) {
  try {
    const response = await fetch(`${API_BASE}/contact-messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify({ read })
    });
    
    if (response.ok) {
      loadContactMessages(currentDataPage);
    }
  } catch (error) {
    console.error('Toggle read status error:', error);
    alert('Failed to update message status');
  }
}

async function deleteContactMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/contact-messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });
    
    if (response.ok) {
      loadContactMessages(currentDataPage);
    }
  } catch (error) {
    console.error('Delete message error:', error);
    alert('Failed to delete message');
  }
}

async function toggleReviewApproval(id, approved) {
  try {
    const response = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify({ approved })
    });
    
    if (response.ok) {
      loadReviews(currentDataPage);
    }
  } catch (error) {
    console.error('Toggle approval error:', error);
    alert('Failed to update review');
  }
}

async function deleteReview(id) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });
    
    if (response.ok) {
      loadReviews(currentDataPage);
    }
  } catch (error) {
    console.error('Delete review error:', error);
    alert('Failed to delete review');
  }
}

async function deleteSCAFeedback(id) {
  if (!confirm('Are you sure you want to delete this feedback?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/sca-feedback/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });
    
    if (response.ok) {
      loadSCAFeedback(currentDataPage);
    }
  } catch (error) {
    console.error('Delete SCA feedback error:', error);
    alert('Failed to delete feedback');
  }
}

async function deleteBrewReview(id) {
  if (!confirm('Are you sure you want to delete this brew review?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/brew-reviews/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });
    
    if (response.ok) {
      loadBrewReviews(currentDataPage);
    }
  } catch (error) {
    console.error('Delete brew review error:', error);
    alert('Failed to delete brew review');
  }
}

function viewBrewReview(id) {
  // TODO: Implement detailed view modal
  alert('Detailed view coming soon!');
}

function editBrewReview(id) {
  // TODO: Implement edit modal
  alert('Edit functionality coming soon!');
}

function filterContacts() {
  const search = document.getElementById('contactsSearch')?.value || '';
  const read = document.getElementById('contactsFilter')?.value || '';
  currentFilters = { search, read };
  loadContactMessages(1);
}

function filterReviews() {
  const search = document.getElementById('reviewsSearch')?.value || '';
  const approved = document.getElementById('reviewsFilter')?.value || '';
  currentFilters = { search, approved };
  loadReviews(1);
}

function filterSCA() {
  const search = document.getElementById('scaSearch')?.value || '';
  currentFilters = { search };
  loadSCAFeedback(1);
}

function filterBrewReviews() {
  const search = document.getElementById('brewSearch')?.value || '';
  const grinderUsed = document.getElementById('brewGrinderFilter')?.value || '';
  const brewMethod = document.getElementById('brewMethodFilter')?.value || '';
  const dateFrom = document.getElementById('brewDateFrom')?.value || '';
  const dateTo = document.getElementById('brewDateTo')?.value || '';
  currentFilters = { search, grinderUsed, brewMethod, dateFrom, dateTo };
  loadBrewReviews(1);
}

async function exportData(type) {
  try {
    const params = new URLSearchParams(currentFilters);
    const response = await fetch(`${API_BASE}/export/${type}?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to export data');
    }
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export data');
  }
}

// Make functions available globally
window.toggleReadStatus = toggleReadStatus;
window.deleteContactMessage = deleteContactMessage;
window.toggleReviewApproval = toggleReviewApproval;
window.deleteReview = deleteReview;
window.deleteSCAFeedback = deleteSCAFeedback;
window.deleteBrewReview = deleteBrewReview;
window.viewBrewReview = viewBrewReview;
window.editBrewReview = editBrewReview;
window.filterContacts = filterContacts;
window.filterReviews = filterReviews;
window.filterSCA = filterSCA;
window.filterBrewReviews = filterBrewReviews;
window.exportData = exportData;
window.loadContactMessages = loadContactMessages;
window.loadReviews = loadReviews;
window.loadSCAFeedback = loadSCAFeedback;
window.loadBrewReviews = loadBrewReviews;
