/**
 * Google Apps Script backend for quiz submissions.
 * Records standard quiz scores and advanced theory responses.
 */
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.openById('SPREADSHEET_ID'); // TODO: replace with real ID
  var mainSheet = ss.getSheetByName('Main Theory Sheet');
  var advancedSheet = ss.getSheetByName('Advanced Theory Sheet');
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  if (data.level === 'advanced' && Array.isArray(data.responses)) {
    var answers = data.responses.map(function(r) { return r.answer; });
    advancedSheet.appendRow([data.studentName, data.week, dateStr].concat(answers));
  } else {
    mainSheet.appendRow([data.studentName, data.week, data.score, dateStr]);
  }

  return ContentService.createTextOutput('success');
}
