// Serve the web app with proper inclusion of separate HTML, CSS, and JS files
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Transaction Manager')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Helper function to include files (style.html and script.html) inside index.html
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Fetch the student list from "Daily Sales Record" sheet
function getStudentList() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Daily Sales Record");
  const data = sheet.getDataRange().getValues();
  return data
    .slice(1)
    .map(row => ({
      name: row[0] || "",
      class: row[1] || "",
      balance: row[2] || 0
    }))
    .filter(student => student.name && student.class); // Filter out blank entries
}

// Save multiple entries to "Transactions" sheet
function saveEntries(entries) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Transactions");
  entries.forEach(entry => {
    const [name, studentClass] = entry.student.split(' (');
    sheet.appendRow([
      entry.date,
      name,
      studentClass.replace(')', ''),
      entry.debit || "",
      entry.credit || ""
    ]);
  });
}

// Add a new student record to "Student Records" sheet
function addStudentRecord(studentData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Student Records");
  sheet.appendRow([
    studentData.name,
    studentData.class,
    studentData.guardian,
    studentData.guardianPhone,
    studentData.alternatePhone,
    studentData.location,
    studentData.image
  ]);
}

// Triggered when a user edits the "Student Records" sheet
function onEdit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const studentRecordsSheet = ss.getSheetByName('Student Records');
  const transactionsSheet = ss.getSheetByName('Transactions');

  // Check if the edit occurred in the "Student Records" sheet
  if (e.range.getSheet().getName() === 'Student Records') {
    const editedRow = e.range.getRow();
    const editedCol = e.range.getColumn();

    // Ensure the edit occurred in the Student Name (Column A) or Class (Column B)
    if (editedCol === 1 || editedCol === 2) {
      const oldName = e.oldValue;
      const newName = e.value;

      // Update the "Transactions" sheet with the new name/class
      if (editedCol === 1) { // Name column
        updateStudentNameInTransactions(transactionsSheet, oldName, newName);
      } else if (editedCol === 2) { // Class column
        updateStudentClassInTransactions(transactionsSheet, editedRow, newName);
      }
    }
  }
}

// Update student name in "Transactions" sheet
function updateStudentNameInTransactions(transactionsSheet, oldName, newName) {
  if (!oldName || !newName) return;

  const range = transactionsSheet.getDataRange();
  const values = range.getValues();

  for (let i = 1; i < values.length; i++) { // Skip header row
    if (values[i][1] === oldName) { // Assuming Column B has the student names
      values[i][1] = newName; // Update the name
    }
  }

  range.setValues(values);
}

// Update student class in "Transactions" sheet
function updateStudentClassInTransactions(transactionsSheet, studentRow, newClass) {
  if (!newClass) return;

  const studentRecordsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Student Records');
  const studentName = studentRecordsSheet.getRange(studentRow, 1).getValue(); // Get the student name from Column A

  const range = transactionsSheet.getDataRange();
  const values = range.getValues();

  for (let i = 1; i < values.length; i++) { // Skip header row
    if (values[i][1] === studentName) { // Assuming Column B has the student names
      values[i][2] = newClass; // Assuming Column C has the class
    }
  }

  range.setValues(values);
}
