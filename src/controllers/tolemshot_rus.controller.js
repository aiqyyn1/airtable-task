const { base, path, pdf, ejs } = require('../../airtable');

/* 
this code generates PDF document 
for tolemshot_rus
*/

/*
TODO: rename hardcode data to variables

*/
const tapsyrys_header = 'заказы общее';
const tapsyrys_lines = 'заказы подробно';
const { findRecord } = require('../utils/utils');
const getFirsController = async (req, res) => {
  const recordID = req.query.recordID;
  try {
    const record = await findRecord(recordID);
    console.log(record);
    const esf = await fetchRecords(recordID);

    const name = record[0].get('Name');

    const IP = record[0].get('ИП имя (from ИП)');

    const iik = record[0].get('счет (from ИП)');

    const kbe = record[0].get('кбе (from ИП)');

    const bank = record[0].get('банк (from ИП)');

    const bik = record[0].get('БИК (from ИП)');
    const pechat = record[0].get('печать (from ИП)')[0].url;
    const rospis = record[0].get('роспись (from ИП)')[0].url;
    const cod = record[0].get('код назначения платежа (from ИП)');
    const nomer = record[0].get('номер');
    const bin = record[0].get('БИН (from ИП)');
    const bin2 = record[0].get('ИИН/БИН 3');
    const nameFirmy = record[0].get('название фирмы 3');
    const address2 = record[0].get('адрес 3');
    const address = record[0].get('адрес (from ИП)');
    const dogovor = record[0].get('договор для счет оплаты');
    let data;
    if (dogovor === 'БЕЗ ДОГОВОРА') {
      data = '';
    } else {
      data = record.get('дата договора');
    }

    const date2 = data ? String(data).split('-') : '';

    const date1 = date2[2] + '-' + date2[1] + '-' + date2[0];

    const date = String(record[0].get('today')).split('-');
    const today = date[2] + '-' + date[1] + '-' + date[0];
    const itogoEsf = record[0].get('итого ЭСФ').toLocaleString();

    const col = record[0].get('кол-во наименований');
    const rukovaditel = record[0].get('руководитель (from ИП)');
    let airtableData = {
      IP: IP,
      IIK: iik,
      kbe: kbe,
      bank: bank,
      bik: bik,
      cod: cod,
      nomer: nomer,
      today: today,
      bin: bin,
      address: address,
      bin2: bin2,
      nameFirmy: nameFirmy,
      address2: address2,
      dogovor: dogovor,
      esf: esf,
      itogoEsf: itogoEsf,
      col: col,
      rukovaditel: rukovaditel,
      pechat: pechat,
      rospis: rospis,
      nomer: nomer,
      data: date1,
    };

    const filename = name + '.pdf';
    const templatePath = path.resolve(__dirname, '../views/tolemshot_rus.ejs');
    ejs.renderFile(templatePath, { reportdata: airtableData }, (err, data) => {
      if (err) {
        console.log(err, 'Error in rendering template');
        res.status(500).send('Error in rendering template');
      } else {
        const options = {
          format: 'A4',
          base: 'file:///' + __dirname,

          header: {
            height: '2mm',
          },

          footer: {
            height: '20mm',
          },
        };

        pdf.create(data, options).toFile(filename, function (err, data) {
          if (err) {
            console.log('Error creating PDF ' + err);
            res.status(500).send('Error creating PDF');
          } else {
            console.log('PDF created successfully:', data);
            res.download(filename, function (err) {
              if (err) {
                console.log('Error during file download:', err);
                res.status(500).send('Error during file download');
              } else {
                console.log('File downloaded successfully');
              }
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
const fetchRecords = (recordID) => {
  let esf = [];
  let count = 1;
  return new Promise((resolve, reject) => {
    base(tapsyrys_lines)
      .select({
        filterByFormula: `{record_id (from заказ номер)} = '${recordID}'`,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          try {
            records.forEach((item) => {
              const id = item.get('record_id (from заказ номер)');
              const esf1 = item.get('эсф1');
              if (esf1) {
                const n = item.get('№');

                const naimenovanie = item.get('Наименование1');

                const esfCena = item.get('ЭСФ цена') ? item.get('ЭСФ цена').toLocaleString() : '';

                const kol_vo = item.get('Кол-во');

                let summa = item.get('ЭСФ Сумма').toLocaleString();

                esf.push({
                  Наименование: naimenovanie,
                  n: count++,
                  efs1: esfCena,
                  kol_vo: kol_vo,
                  summa: summa,
                });
              }
            });

            fetchNextPage();
          } catch (error) {
            reject(error); // Reject if an error occurs within the try block
          }
        },
        function done(err) {
          if (err) {
            reject(err); // Reject if there's an error when fetching pages
          } else {
            resolve(esf); // Resolve with the collected data when done
          }
        }
      );
  });
};
module.exports = getFirsController;
