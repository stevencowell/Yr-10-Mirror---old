/**
 * Google Apps Script backend for quiz submissions.
 * Uses token-based validation and supports multiple sheets.
 */

/** CONFIGURATION **/
const SPREADSHEET_ID = 'SPREADSHEET_ID'; // TODO: replace with your sheet ID
const EXPECTED_TOKEN = 'OPTIONAL_SECRET_TOKEN'; // set to null to disable

const SHEET_CONFIG = {
  main: {
    name: 'Main Theory Sheet',
    headers: ['Student Name', 'Week', 'Score', 'Date']
  },
  support: {
    name: 'Support Theory Sheet',
    headers: ['Student Name', 'Week', 'Score', 'Date']
  },
  advanced: {
    name: 'Advanced Theory Sheet',
    headers: ['Student Name', 'Week', 'Score', 'Date']
  }
};

/** ENTRY POINT **/
function doPost(e) {
  let output = { status: 'error' };
  try {
    // 1. Validate token (if configured)
    if (EXPECTED_TOKEN && (!e.parameter.token || e.parameter.token !== EXPECTED_TOKEN)) {
      throw new Error('Unauthorized: invalid token');
    }

    // 2. Parse JSON payload
    if (!e.postData || e.postData.type !== 'application/json') {
      throw new Error('Invalid content type; expecting application/json');
    }
    const data = JSON.parse(e.postData.contents);

    // 3. Determine sheet configuration
    const levelKey = (data.level || 'main').toLowerCase();
    const config = SHEET_CONFIG[levelKey] || SHEET_CONFIG.main;

    // 4. Open spreadsheet and get/create sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(config.name);
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
    }

    // 5. Ensure headers exist
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(config.headers);
    }

    // 6. Build row data
    const tz = ss.getSpreadsheetTimeZone();
    const dateStr = Utilities.formatDate(new Date(), tz, 'dd/MM/yy');
    const row = [
      data.studentName || '',
      data.week || '',
      data.score || '',
      dateStr
    ];

    // 7. Append the row
    sheet.appendRow(row);
    output.status = 'success';
  } catch (err) {
    output.message = err.message || err.toString();
  }
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}
