const modeSwitch = document.getElementById('mode-switch');

// Load saved mode preference
document.body.classList.toggle('light-mode', localStorage.getItem('mode') === 'light-mode');
modeSwitch.checked = localStorage.getItem('mode') === 'light-mode';

modeSwitch.addEventListener('change', function() {
  const isLightMode = this.checked;
  document.body.classList.toggle('light-mode', isLightMode);
  localStorage.setItem('mode', isLightMode ? 'light-mode' : 'dark-mode');
});

function fetchStudentData() {
  google.script.run
    .withSuccessHandler(populateStudentList)
    .withFailureHandler(function(error) {
      console.error('Failed to fetch student list:', error);
      alert('Error fetching student list: ' + error.message);
    })
    .getStudentList();
}

function populateStudentList(students) {
  const studentTable = document.getElementById('student-table');
  studentTable.innerHTML = '';

  students.forEach(student => {
    if (!student.name || !student.class) return;

    const row = document.createElement('div');
    row.className = 'student-row';

    const nameCell = document.createElement('div');
    nameCell.className = 'student-cell';
    nameCell.textContent = `${student.name} (${student.class})`;

    const debitCell = document.createElement('div');
    debitCell.className = 'amount-cell';
    const debitInput = document.createElement('input');
    debitInput.type = 'number';
    debitInput.placeholder = 'Debit Amount (₹)';
    debitCell.appendChild(debitInput);

    const creditCell = document.createElement('div');
    creditCell.className = 'amount-cell';
    const creditInput = document.createElement('input');
    creditInput.type = 'number';
    creditInput.placeholder = 'Credit Amount (₹)';
    creditCell.appendChild(creditInput);

    const balanceCell = document.createElement('div');
    balanceCell.className = 'balance-cell';
    const balance = student.balance || 0;
    const balanceSpan = document.createElement('span');
    balanceSpan.textContent = `₹${balance}`;
    balanceSpan.className = balance < 0 ? 'balance-red' : 'balance-green';
    balanceCell.appendChild(balanceSpan);

    row.appendChild(nameCell);
    row.appendChild(debitCell);
    row.appendChild(creditCell);
    row.appendChild(balanceCell);
    studentTable.appendChild(row);
  });

  updateGrandTotal();
}

function updateGrandTotal() {
  const balances = document.querySelectorAll('.balance-cell span');
  let total = 0;
  balances.forEach(balance => {
    total += parseFloat(balance.textContent.replace('₹', '')) || 0;
  });
  const grandTotal = document.getElementById('grand-total');
  grandTotal.style.color = total < 0 ? 'red' : '#026C3D';
  grandTotal.textContent = `Grand Total = ₹${total}`;
}

document.getElementById('submitButton').addEventListener('click', function() {
  const date = document.getElementById('date').value;
  if (!date) {
    alert('Date is required!');
    return;
  }

  const entries = [];
  const rows = document.querySelectorAll('.student-row');
  rows.forEach(row => {
    const student = row.querySelector('.student-cell').textContent;
    const debit = row.querySelector('.amount-cell input:nth-child(1)').value;
    const credit = row.querySelectorAll('.amount-cell input')[1].value;
    if (debit || credit) {
      entries.push({ date, student, debit: debit || 0, credit: credit || 0 });
    }
  });

  if (entries.length > 0) {
    google.script.run.withSuccessHandler(() => {
      alert('Transactions saved!');
      fetchStudentData();
    }).saveEntries(entries);
  } else {
    alert('No entries to save!');
  }
});

// Initial fetch
fetchStudentData();
