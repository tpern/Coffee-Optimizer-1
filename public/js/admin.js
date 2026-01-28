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
    link.classList.remove('active');
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });
  
  // Hide all content sections
  document.getElementById('dashboardContent').style.display = 'none';
  document.getElementById('contactsContent').style.display = 'none';
  document.getElementById('reviewsContent').style.display = 'none';
  document.getElementById('scaContent').style.display = 'none';
  document.getElementById('brewReviewsContent').style.display = 'none';
  
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
  switch(page) {
    case 'dashboard':
      document.getElementById('dashboardContent').style.display = 'block';
      loadDashboard();
      break;
    case 'contacts':
      document.getElementById('contactsContent').style.display = 'block';
      loadContactMessages();
      break;
    case 'reviews':
      document.getElementById('reviewsContent').style.display = 'block';
      loadReviews();
      break;
    case 'sca-feedback':
      document.getElementById('scaContent').style.display = 'block';
      loadSCAFeedback();
      break;
    case 'brew-reviews':
      document.getElementById('brewReviewsContent').style.display = 'block';
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
  
  statsContainer.innerHTML = `
    <div class="stat-card">
      <h3>Total Submissions</h3>
      <p class="stat-value">${data.totals.contacts + data.totals.reviews + data.totals.scaFeedback + data.totals.brewReviews}</p>
    </div>
    <div class="stat-card">
      <h3>Contact Messages</h3>
      <p class="stat-value">${data.totals.contacts}</p>
      <p class="stat-change">+${data.newThisWeek.contacts} this week</p>
    </div>
    <div class="stat-card">
      <h3>Reviews</h3>
      <p class="stat-value">${data.totals.reviews}</p>
      <p class="stat-change">+${data.newThisWeek.reviews} this week</p>
    </div>
    <div class="stat-card">
      <h3>SCA Feedback</h3>
      <p class="stat-value">${data.totals.scaFeedback}</p>
      <p class="stat-change">+${data.newThisWeek.scaFeedback} this week</p>
    </div>
    <div class="stat-card">
      <h3>Brew Reviews</h3>
      <p class="stat-value">${data.totals.brewReviews}</p>
      <p class="stat-change">+${data.newThisWeek.brewReviews} this week</p>
    </div>
    <div class="stat-card">
      <h3>Avg Review Rating</h3>
      <p class="stat-value">${data.averages.reviewRating.toFixed(1)}</p>
    </div>
    <div class="stat-card">
      <h3>Avg Brew Rating</h3>
      <p class="stat-value">${data.averages.brewRating.toFixed(1)}</p>
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
    <div class="chart-card">
      <h3>Submissions Over Time</h3>
      <canvas id="submissionsChart"></canvas>
    </div>
    <div class="chart-card">
      <h3>Rating Distribution</h3>
      <canvas id="ratingChart"></canvas>
    </div>
    <div class="chart-card">
      <h3>Popular Grinders</h3>
      <canvas id="grindersChart"></canvas>
    </div>
  `;
  
  // Submissions over time (line chart)
  const submissionsCtx = document.getElementById('submissionsChart');
  if (submissionsCtx) {
    new Chart(submissionsCtx, {
      type: 'line',
      data: {
        labels: data.submissionsOverTime.map(item => item._id),
        datasets: [{
          label: 'Brew Reviews',
          data: data.submissionsOverTime.map(item => item.count),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
  
  // Rating distribution (bar chart)
  const ratingCtx = document.getElementById('ratingChart');
  if (ratingCtx) {
    new Chart(ratingCtx, {
      type: 'bar',
      data: {
        labels: data.ratingDistribution.map(item => `${item._id} Stars`),
        datasets: [{
          label: 'Number of Reviews',
          data: data.ratingDistribution.map(item => item.count),
          backgroundColor: '#667eea'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
  
  // Popular grinders (pie chart)
  const grindersCtx = document.getElementById('grindersChart');
  if (grindersCtx && data.popularGrinders.length > 0) {
    new Chart(grindersCtx, {
      type: 'pie',
      data: {
        labels: data.popularGrinders.map(item => item._id),
        datasets: [{
          data: data.popularGrinders.map(item => item.count),
          backgroundColor: [
            '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
            '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
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
    <tr>
      <td>${formatDate(msg.createdAt)}</td>
      <td>${escapeHtml(msg.name)}</td>
      <td>${escapeHtml(msg.email)}</td>
      <td>${escapeHtml(msg.message.substring(0, 100))}${msg.message.length > 100 ? '...' : ''}</td>
      <td>
        <span class="badge ${msg.read ? 'badge-read' : 'badge-unread'}">
          ${msg.read ? 'Read' : 'Unread'}
        </span>
      </td>
      <td>
        <button class="btn-sm btn-edit" onclick="toggleReadStatus('${msg._id}', ${!msg.read})">
          ${msg.read ? 'Mark Unread' : 'Mark Read'}
        </button>
        <button class="btn-sm btn-delete" onclick="deleteContactMessage('${msg._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
  
  container.innerHTML = `
    <div class="data-section">
      <div class="data-section-header">
        <h2>Contact Messages</h2>
        <div class="table-controls">
          <input type="text" id="contactsSearch" placeholder="Search..." onkeyup="filterContacts()" />
          <select id="contactsFilter" onchange="filterContacts()">
            <option value="">All</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>
          <button onclick="exportData('contacts')" class="btn-export">Export CSV</button>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
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
    <tr>
      <td>${formatDate(review.createdAt)}</td>
      <td>${escapeHtml(review.grinderName)}</td>
      <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} (${review.rating})</td>
      <td>${escapeHtml(review.reviewText.substring(0, 100))}${review.reviewText.length > 100 ? '...' : ''}</td>
      <td>${escapeHtml(review.reviewerName)}</td>
      <td>
        <span class="badge ${review.approved ? 'badge-approved' : 'badge-pending'}">
          ${review.approved ? 'Approved' : 'Pending'}
        </span>
      </td>
      <td>
        <button class="btn-sm btn-edit" onclick="toggleReviewApproval('${review._id}', ${!review.approved})">
          ${review.approved ? 'Unapprove' : 'Approve'}
        </button>
        <button class="btn-sm btn-delete" onclick="deleteReview('${review._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
  
  container.innerHTML = `
    <div class="data-section">
      <div class="data-section-header">
        <h2>Reviews</h2>
        <div class="table-controls">
          <input type="text" id="reviewsSearch" placeholder="Search..." onkeyup="filterReviews()" />
          <select id="reviewsFilter" onchange="filterReviews()">
            <option value="">All</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
          <button onclick="exportData('reviews')" class="btn-export">Export CSV</button>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Grinder</th>
            <th>Rating</th>
            <th>Review</th>
            <th>Reviewer</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
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
    <tr>
      <td>${formatDate(item.createdAt)}</td>
      <td>${escapeHtml(item.feedbackText.substring(0, 150))}${item.feedbackText.length > 150 ? '...' : ''}</td>
      <td>${item.rating}/10</td>
      <td>${item.category}</td>
      <td>
        <button class="btn-sm btn-delete" onclick="deleteSCAFeedback('${item._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
  
  container.innerHTML = `
    <div class="data-section">
      <div class="data-section-header">
        <h2>SCA Feedback</h2>
        <div class="table-controls">
          <input type="text" id="scaSearch" placeholder="Search..." onkeyup="filterSCA()" />
          <button onclick="exportData('sca-feedback')" class="btn-export">Export CSV</button>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Feedback</th>
            <th>Rating</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
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
    <tr>
      <td>${formatDate(review.createdAt)}</td>
      <td>${escapeHtml(review.grinderUsed)}</td>
      <td>${review.brewMethod}</td>
      <td>${escapeHtml(review.coffeeOrigin || '-')}</td>
      <td>${review.roastLevel || '-'}</td>
      <td>${review.waterTemperature ? review.waterTemperature + '°C' : '-'}</td>
      <td>${review.brewTime ? review.brewTime + 's' : '-'}</td>
      <td>${review.doseGrams ? review.doseGrams + 'g' : '-'}</td>
      <td>${review.yieldGrams ? review.yieldGrams + 'g' : '-'}</td>
      <td>${review.overallRating ? review.overallRating + '/10' : '-'}</td>
      <td>
        <button class="btn-sm btn-edit" onclick="viewBrewReview('${review._id}')">View</button>
        <button class="btn-sm btn-edit" onclick="editBrewReview('${review._id}')">Edit</button>
        <button class="btn-sm btn-delete" onclick="deleteBrewReview('${review._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
  
  container.innerHTML = `
    <div class="data-section">
      <div class="data-section-header">
        <h2>Brew Reviews (${pagination.total} total)</h2>
        <div class="table-controls">
          <input type="text" id="brewSearch" placeholder="Search..." onkeyup="filterBrewReviews()" />
          <select id="brewGrinderFilter" onchange="filterBrewReviews()">
            <option value="">All Grinders</option>
          </select>
          <select id="brewMethodFilter" onchange="filterBrewReviews()">
            <option value="">All Methods</option>
            <option value="espresso">Espresso</option>
            <option value="v60">V60</option>
            <option value="chemex">Chemex</option>
            <option value="french-press">French Press</option>
            <option value="aeropress">Aeropress</option>
          </select>
          <input type="date" id="brewDateFrom" onchange="filterBrewReviews()" placeholder="From" />
          <input type="date" id="brewDateTo" onchange="filterBrewReviews()" placeholder="To" />
          <button onclick="exportData('brew-reviews')" class="btn-export">Export CSV</button>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Grinder</th>
            <th>Method</th>
            <th>Origin</th>
            <th>Roast</th>
            <th>Temp</th>
            <th>Time</th>
            <th>Dose</th>
            <th>Yield</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
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
    container.innerHTML = '<div class="loading">Loading...</div>';
  }
}

function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="error-message">${message}</div>`;
  }
}

function displayPagination(pagination, loadFunction) {
  if (!pagination || pagination.pages <= 1) return '';
  
  return `
    <div class="pagination">
      <button ${pagination.page === 1 ? 'disabled' : ''} onclick="${loadFunction}(${pagination.page - 1})">Previous</button>
      <span class="page-info">Page ${pagination.page} of ${pagination.pages} (${pagination.total} total)</span>
      <button ${pagination.page === pagination.pages ? 'disabled' : ''} onclick="${loadFunction}(${pagination.page + 1})">Next</button>
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
