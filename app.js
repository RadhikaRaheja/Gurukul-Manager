const API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLi4dNz4bWOPuz0-nH-aldkfmy7Asjof4aoy68HDbVJ_4DCimCRL9ggwWSvJZPW-adLt15GEn9r0xDbm9Ng76ot5aOt8SJiFmGfD2XpDdQH3NjsaVVwIkLa_gVvJ4isjbfN3-fualvLKziwQuVDfeHx0HzV0k821302oWmZV72eW8405R3ymhIcL1FW37_dwdkGzegTZbSuSzM1oHYwkx-N0YJvVw8W9Cg9iEgNfEmf30VUmNt1pXCYe-Uy3WajZ0zvcta7UvuZSLgkXEG3tKwyS6PoN2392QYO2E8afcPgyS_WgXmnL--xPB5VOVg&lib=MKKWwtTm12QFX5px_yfyVl5JdrEYEXX_U'; // <-- replace with your deployed Apps Script Web App URL

document.getElementById('search-btn').addEventListener('click', fetchTransactions);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('download-pdf').addEventListener('click', downloadPDF);

function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
}

async function fetchTransactions() {
  const nameInput = document.getElementById('student-search').value;
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const type = document.getElementById('transaction-type').value;

  if (!nameInput) {
    alert('Please select a student name');
    return;
  }

  const [name, studentClassRaw] = nameInput.split('(');
  const studentClass = studentClassRaw.replace(')', '').trim();

  document.getElementById('loading').style.display = 'block';

  try {
    const response = await axios.get(API_URL, {
      params: {
        action: 'fetchTransactions',
        name: name.trim(),
        class: studentClass,
        startDate,
        endDate,
        type
      }
    });

    const data = response.data;
    renderTransactions(data);
  } catch (error) {
    console.error(error);
    alert('Error fetching transactions!');
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

function renderTransactions(data) {
  const tbody = document.getElementById('transactions');
  tbody.innerHTML = '';

  data.data.forEach(tran => {
    const row = `<tr>
      <td>${tran.date}</td>
      <td style="color:${tran.debit ? 'var(--debit-color)' : ''}">${tran.debit || ''}</td>
      <td style="color:${tran.credit ? 'var(--credit-color)' : ''}">${tran.credit || ''}</td>
    </tr>`;
    tbody.innerHTML += row;
  });

  document.getElementById('balance').textContent = `₹ ${data.balance}`;
  document.getElementById('transaction-table').style.display = 'block';
  document.getElementById('summary').style.display = 'block';
  document.getElementById('actions').style.display = 'block';
}

function downloadPDF() {
  const element = document.body;
  html2pdf().from(element).save('GurukulCanteenRecord.pdf');
}

// Load Theme
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light');
}
