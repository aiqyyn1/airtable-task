const { base, path, pdf, ejs } = require('../../airtable');

const { findRecord } = require('../utils/utils');

const dogovorController = async (req, res) => {
  const ID = req.query.recordID;
  try {
    const zakazy_obwee = await findRecord(ID);
    const name_of_firm = zakazy_obwee[0].get('название фирмы 3');

    const dogovor_dlya_schet_oplaty = zakazy_obwee[0].get('договор для счет оплаты');
    const tel2_from_client = zakazy_obwee[0].get('тел2 (from клиент)');
    const seventy_percent = zakazy_obwee[0].get('70%')
    const thirty_percent = zakazy_obwee[0].get('30%')
    const director_from_client = zakazy_obwee[0].get('директор (from клиент)');
    const name = zakazy_obwee[0].get('Name');
    const itogo = zakazy_obwee[0].get('итого')
    const dogovor = zakazy_obwee[0].get('дата договора');
    const iin_biin = zakazy_obwee[0].get('ИИН/БИН 3')
    const address = zakazy_obwee[0].get('адрес 3')
    const iik = zakazy_obwee[0].get('ИИК 3')
    const bank = zakazy_obwee[0].get('Банк 3')
    const esf = await fetchRecords(ID);
    let airtableData = {
      name_of_firm: name_of_firm,
      dogovor_dlya_schet_oplaty: dogovor_dlya_schet_oplaty,
      tel2_from_client: tel2_from_client,
      director_from_client: director_from_client,
      data_dogovara: dogovor,
      iin_biin:iin_biin,
      itogo:itogo,
      seventy_percent:seventy_percent,
      thirty_percent:thirty_percent,
      address:address,
      bank:bank,
      iik:iik,
      esf:esf

    };
    const filename = name + '.pdf';
    const templatePath = path.resolve(__dirname, '../views/dogovor/dogovor.ejs');
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
  } catch (e) {
    console.log(e.message);
  }
};
const fetchRecords = (recordID) => {
  let esf = [];
  let count = 1;
  return new Promise((resolve, reject) => {
    base('заказы подробно')
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

module.exports = dogovorController;
