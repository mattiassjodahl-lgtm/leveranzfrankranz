// ═══════════════════════════════════════════════════════════════
// LEVERANZ FRÅN KRANZ — Google Apps Script
// Klistra in hela den här filen i ditt Google Apps Script-projekt
// Driftsätt som Web App: Kör som "Jag", Åtkomst "Vem som helst"
// ═══════════════════════════════════════════════════════════════

var NOTIS_EMAIL = 'mattias.sjodahl@consid.se';

var HEADERS = [
  'Ordernr', 'Tidsstämpel', 'Namn', 'Mobilnummer', 'Leveransdag', 'Adress',
  'Småfranska', 'Ostfralla', 'Källarfranska', 'Solros',
  'Surdegsfralla ljus', 'Surdegsfralla mörk',
  'Kanelbulle', 'Kardemummabulle',
  'Delsumma', 'Leveransavgift', 'Totalt', 'Meddelande', 'Betalad (✓)', 'Levererad'
];

// ── doGet: läser ordrar för leveransvyn (stöder JSONP via ?callback=) ──
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var orders = [];
    if (data.length > 1) {
      var headers = data[0];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var order = { _row: i + 1 };
        for (var j = 0; j < headers.length; j++) {
          var val = row[j];
          if (val instanceof Date) {
            val = Utilities.formatDate(val, 'Europe/Stockholm', 'yyyy-MM-dd');
          }
          order[headers[j]] = val;
        }
        orders.push(order);
      }
    }
    var result = JSON.stringify({ status: 'ok', orders: orders });
    var callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + result + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(result)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var errResult = JSON.stringify({ status: 'error', message: err.toString() });
    var callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + errResult + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(errResult)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── doPost: ny order ELLER statusuppdatering ─────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Statusuppdatering från leveransvyn
    if (data.action === 'update_status') {
      return updateStatus(sheet, data);
    }

    // Ny beställning
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var row = [
      data.orderId            || '',
      data.timestamp          || new Date().toISOString(),
      data.namn               || '',
      data.mobil              || '',
      data.leveransdagLabel   || data.leveransdag || '',
      data.adress             || '',
      data['smafranska']      || 0,
      data['ostfralla']       || 0,
      data['kallarfranska']   || 0,
      data['solros']          || 0,
      data['surdeg-ljus']     || 0,
      data['surdeg-mork']     || 0,
      data['kanelbulle']      || 0,
      data['kardemummabulle'] || 0,
      data.subtotal           || 0,
      data.leveransavgift     || 15,
      data.total              || 0,
      data.note               || '',
      '',  // Betalad (✓)
      ''   // Levererad
    ];

    sheet.appendRow(row);
    skickaNotis(data);

    return jsonOut({ status: 'ok', orderId: data.orderId });

  } catch (err) {
    return jsonOut({ status: 'error', message: err.toString() });
  }
}

function updateStatus(sheet, data) {
  var sheetData = sheet.getDataRange().getValues();
  var headers = sheetData[0];
  var orderNrCol = headers.indexOf('Ordernr');
  var betaladCol = headers.indexOf('Betalad (✓)');
  var leveradCol = headers.indexOf('Levererad');

  for (var i = 1; i < sheetData.length; i++) {
    if (sheetData[i][orderNrCol] === data.orderId) {
      if (data.betalad !== undefined && betaladCol >= 0) {
        var betaladVal = data.betalad ? 'JA' : '';
        sheet.getRange(i + 1, betaladCol + 1).setValue(betaladVal);
        // Grön bakgrund
        var rowRange = sheet.getRange(i + 1, 1, 1, headers.length);
        if (data.betalad) {
          rowRange.setBackground('#b7e1cd');
          rowRange.setFontColor('#174924');
        } else if (sheetData[i][leveradCol] !== 'JA') {
          rowRange.setBackground(null);
          rowRange.setFontColor(null);
        }
      }
      if (data.levererad !== undefined && leveradCol >= 0) {
        sheet.getRange(i + 1, leveradCol + 1).setValue(data.levererad ? 'JA' : '');
      }
      break;
    }
  }
  return jsonOut({ status: 'ok' });
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── onEdit: grön rad vid manuell ändring i Betalad-kolumnen ─────
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  var betaladCol = HEADERS.indexOf('Betalad (✓)') + 1;
  if (range.getColumn() !== betaladCol || range.getRow() <= 1) return;
  var val = range.getValue().toString().trim().toUpperCase();
  var rowRange = sheet.getRange(range.getRow(), 1, 1, HEADERS.length);
  if (val === 'JA' || val === '✓' || val === 'X') {
    rowRange.setBackground('#b7e1cd');
    rowRange.setFontColor('#174924');
  } else {
    rowRange.setBackground(null);
    rowRange.setFontColor(null);
  }
}

function skickaNotis(data) {
  try {
    var subject = '🥐 Ny beställning! ' + data.orderId + ' — ' + data.namn;
    var body = [
      'Ny beställning mottagen!', '',
      'Ordernr:      ' + data.orderId,
      'Namn:         ' + data.namn,
      'Mobilnummer:  ' + data.mobil,
      'Leveransdag:  ' + (data.leveransdagLabel || data.leveransdag),
      'Adress:       ' + data.adress, '',
      '── SORTIMENT ──────────────────',
      formatProd('Småfranska',         data['smafranska']),
      formatProd('Ostfralla',          data['ostfralla']),
      formatProd('Källarfranska',      data['kallarfranska']),
      formatProd('Solros',             data['solros']),
      formatProd('Surdegsfralla ljus', data['surdeg-ljus']),
      formatProd('Surdegsfralla mörk', data['surdeg-mork']),
      formatProd('Kanelbulle',         data['kanelbulle']),
      formatProd('Kardemummabulle',    data['kardemummabulle']), '',
      '── BELOPP ─────────────────────',
      'Delsumma:       ' + data.subtotal + ' kr',
      'Leveransavgift: 15 kr',
      'TOTALT:         ' + data.total + ' kr', '',
      data.note ? 'Meddelande: ' + data.note : '',
      '', '── SWISH ──────────────────────',
      'Kunden ska swisha ' + data.total + ' kr senast kl 18:00 kvällen innan.', '',
      'Tidsstämpel: ' + data.timestamp
    ].filter(function(r) { return r !== null && r !== undefined; }).join('\n');
    MailApp.sendEmail(NOTIS_EMAIL, subject, body);
  } catch (e) {
    Logger.log('E-post misslyckades: ' + e.toString());
  }
}

function formatProd(name, qty) {
  if (!qty || qty === 0) return null;
  return name + ': ' + qty + ' st';
}

function testOrder() {
  var testData = {
    orderId: 'LFK-TEST123',
    timestamp: new Date().toISOString(),
    namn: 'Testperson',
    mobil: '0701234567',
    leveransdag: '2026-07-09',
    leveransdagLabel: 'Torsdag 9 juli',
    adress: 'Strandhaga, stuga 5',
    'smafranska': 2, 'ostfralla': 0, 'kallarfranska': 1, 'solros': 0,
    'surdeg-ljus': 2, 'surdeg-mork': 0, 'kanelbulle': 3, 'kardemummabulle': 2,
    subtotal: 2*14 + 14 + 2*18 + 3*34 + 2*34,
    leveransavgift: 15,
    total: 2*14 + 14 + 2*18 + 3*34 + 2*34 + 15,
    note: 'Testbeställning'
  };
  doPost({ postData: { contents: JSON.stringify(testData) } });
  Logger.log('Test klar — kolla arket och din e-post!');
}
