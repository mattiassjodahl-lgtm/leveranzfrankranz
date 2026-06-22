// ═══════════════════════════════════════════════════════════════
// LEVERANZ FRÅN KRANZ — Google Apps Script
// Klistra in hela den här filen i ditt Google Apps Script-projekt
// Driftsätt som Web App: Kör som "Jag", Åtkomst "Vem som helst"
// ═══════════════════════════════════════════════════════════════

// Konfigurera: ange e-post för orderaviseringar
var NOTIS_EMAIL = 'mattias.sjodahl@consid.se'; // ← Din e-post

// Kolumnrubriker i Google Sheets
var HEADERS = [
  'Ordernr', 'Tidsstämpel', 'Namn', 'Mobilnummer', 'Leveransdag', 'Adress',
  'Småfranska', 'Ostfralla', 'Källarfranska', 'Solros',
  'Surdegsfralla ljus', 'Surdegsfralla mörk',
  'Kanelbulle', 'Kardemummabulle',
  'Delsumma', 'Leveransavgift', 'Totalt', 'Meddelande', 'Betalad (✓)'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Skapa rubriker om arket är tomt
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Lägg till orderrad
    var row = [
      data.orderId        || '',
      data.timestamp      || new Date().toISOString(),
      data.namn           || '',
      data.mobil          || '',
      data.leveransdagLabel || data.leveransdag || '',
      data.adress         || '',
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
      ''  // Betalad — fylls i manuellt
    ];

    sheet.appendRow(row);

    // Skicka e-postavisering
    skickaNotis(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function skickaNotis(data) {
  try {
    var subject = '🥐 Ny beställning! ' + data.orderId + ' — ' + data.namn;
    var body = [
      'Ny beställning mottagen!',
      '',
      'Ordernr:      ' + data.orderId,
      'Namn:         ' + data.namn,
      'Mobilnummer:  ' + data.mobil,
      'Leveransdag:  ' + (data.leveransdagLabel || data.leveransdag),
      'Adress:       ' + data.adress,
      '',
      '── SORTIMENT ──────────────────',
      formatProd('Småfranska',         data['smafranska']),
      formatProd('Ostfralla',          data['ostfralla']),
      formatProd('Källarfranska',      data['kallarfranska']),
      formatProd('Solros',             data['solros']),
      formatProd('Surdegsfralla ljus', data['surdeg-ljus']),
      formatProd('Surdegsfralla mörk', data['surdeg-mork']),
      formatProd('Kanelbulle',         data['kanelbulle']),
      formatProd('Kardemummabulle',    data['kardemummabulle']),
      '',
      '── BELOPP ─────────────────────',
      'Delsumma:       ' + data.subtotal + ' kr',
      'Leveransavgift: 15 kr',
      'TOTALT:         ' + data.total + ' kr',
      '',
      data.note ? 'Meddelande: ' + data.note : '',
      '',
      '── SWISH ──────────────────────',
      'Kunden ska swisha ' + data.total + ' kr senast kl 18:00 kvällen innan.',
      '',
      'Tidsstämpel: ' + data.timestamp
    ].filter(function(r) { return r !== null && r !== undefined; }).join('\n');

    MailApp.sendEmail(NOTIS_EMAIL, subject, body);
  } catch (e) {
    // E-postavisering misslyckades — ordern är ändå sparad i arket
    Logger.log('E-post misslyckades: ' + e.toString());
  }
}

function formatProd(name, qty) {
  if (!qty || qty === 0) return null;
  return name + ': ' + qty + ' st';
}

// Testfunktion — kör denna manuellt för att testa att allt fungerar
function testOrder() {
  var testData = {
    orderId: 'LFK-TEST123',
    timestamp: new Date().toISOString(),
    namn: 'Testperson',
    mobil: '0701234567',
    leveransdag: '2026-07-09',
    leveransdagLabel: 'Torsdag 9 juli',
    adress: 'Strandhaga, stuga 5',
    'smafranska': 2,
    'ostfralla': 0,
    'kallarfranska': 1,
    'solros': 0,
    'surdeg-ljus': 2,
    'surdeg-mork': 0,
    'kanelbulle': 3,
    'kardemummabulle': 2,
    subtotal: 2*14 + 14 + 2*18 + 3*34 + 2*34,
    leveransavgift: 15,
    total: 2*14 + 14 + 2*18 + 3*34 + 2*34 + 15,
    note: 'Testbeställning'
  };
  doPost({ postData: { contents: JSON.stringify(testData) } });
  Logger.log('Test klar — kolla arket och din e-post!');
}
