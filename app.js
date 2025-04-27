// Initialize
document.getElementById("theme-switch").addEventListener("click", toggleTheme);

// API URL for the Apps Script
const apiURL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_URL/exec";

// Handle Search Button
document.getElementById("search-btn").addEventListener("click", fetchTransactions);

async function fetchTransactions() {
  // Show loading spinner
  document.getElementById("loading").style.display = "block";
  
  // Get filter values
  const studentName = document.getElementById("student-name").value;
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;
  const transactionType = document.getElementById("transaction-type").value;

  // Build API query
  const url = `${apiURL}?studentName=${studentName}&startDate=${startDate}&endDate=${endDate}&transactionType=${transactionType}`;
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    
    // Display Transactions
    displayTransactions(data);
  } catch (error) {
    console.error("Error fetching data", error);
  } finally {
    // Hide loading spinner
    document.getElementById("loading").style.display = "none";
  }
}

function displayTransactions(data) {
  // Clear existing data
  const tableBody = document.getElementById("transactions-table").getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";
  
  let totalDebit = 0;
  let totalCredit = 0;

  data.forEach(transaction => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(transaction.date).toLocaleDateString()}</td>
      <td style="color: red;">₹${transaction.debit || "0"}</td>
      <td style="color: green;">₹${transaction.credit || "0"}</td>
    `;
    tableBody.appendChild(row);
    
    totalDebit += parseFloat(transaction.debit || 0);
    totalCredit += parseFloat(transaction.credit || 0);
  });

  // Update Total Balance
  const totalBalance = totalCredit - totalDebit;
  document.getElementById("total-balance").innerText = `Total Balance: ₹${totalBalance}`;
}

function toggleTheme() {
  // Toggle theme and save preference
  document.body.classList.toggle("light-mode");
  localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
}

window.onload = function () {
  // Apply saved theme preference on load
  const theme = localStorage.getItem("theme") || "dark";
  if (theme === "light") {
    document.body.classList.add("light-mode");
  }
};
