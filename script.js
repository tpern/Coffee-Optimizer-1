const ADMIN_PASSCODE = "supersecret"; // Replace with your secure passcode

// Handle Admin Dashboard Unlock
const adminKeySubmitButton = document.getElementById("admin-key-submit");
const adminAccessKeyInput = document.getElementById("admin-access-key");
const adminDashboardSection = document.getElementById("admin-dashboard");
const adminDataDisplay = document.getElementById("admin-data-display");
const adminDataPre = document.getElementById("admin-data");

adminKeySubmitButton.addEventListener("click", () => {
  const enteredKey = adminAccessKeyInput.value.trim();
  if (enteredKey === ADMIN_PASSCODE) {
    adminAccessKeyInput.value = "";
    adminDataDisplay.style.display = "block";
    loadAdminData();
  } else {
    alert("Invalid passcode. Access denied.");
  }
});

// Load and Display Anonymized Data
function loadAdminData() {
  if (universalDataQueue && universalDataQueue.length > 0) {
    adminDataPre.textContent = JSON.stringify(universalDataQueue, null, 2);
  } else {
    adminDataPre.textContent = "No data available.";
  }
}

// Show Admin Dashboard for Admins
document.addEventListener("DOMContentLoaded", () => {
  const accessLevel = checkAccessLevel(); // Existing function
  if (accessLevel === "farmer" || accessLevel === "admin") {
    adminDashboardSection.style.display = "block";
  }
});