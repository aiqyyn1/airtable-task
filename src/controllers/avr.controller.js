require('dotenv').config();
const Airtable = require('airtable');
const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require('path');
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.API_KEY,
});
const base = Airtable.base(process.env.BASE);
const getSecondController = async (req, res) => {
  const recordID = req.query.recordID;
  try {
    // заказы общее
    const blanks = await getGeneral(recordID);
    const nameOfFirm = blanks.get('название фирмы 3');
    const ip = blanks.get('ИП имя (from ИП)');

    const dogovor = blanks.get('договор для счет оплаты');
    const date = blanks.get('дата договора');
    const avr = blanks.get('номер АВР');
    const avrDate = blanks.get('дата АВР');

    const iinBiin = blanks.get('ИИН/БИН 3');

    const biin = blanks.get('БИН (from ИП)');
    const pechat = blanks.get('печать (from ИП)');
    const rospis = blanks.get('роспись (from ИП)');
    const rukovaditel = blanks.get('руководитель (from ИП)');
    const itogo = blanks.get('итого');
    // заказы подробно
    const details = await getInDetail(recordID);
    let airtableData = {
      nameOfFirm: nameOfFirm,
      ip: ip,
      dogovor: dogovor,
      date: date,
      avr: avr,
      avrDate: avrDate,
      iinBiin: iinBiin[0],
      biin: biin,
      pechat: pechat,
      rospis: rospis,
      rukovaditel: rukovaditel,
      itogo: itogo,
      details: details,
    };
    console.log(details);
    const filename = nameOfFirm + '.pdf';
    const templatePath = path.resolve(__dirname, '../views/avr/avr.ejs');
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
    res.status(500).send('Internal Server error');
  }
};
const getGeneral = (recordID) => {
  return new Promise((resolve, reject) => {
    base('заказы общее').find(recordID, (err, record) => {
      if (err) {
        reject(err);
      } else {
        resolve(record);
      }
    });
  });
};
const getInDetail = (recordID) => {
  let esf = [];
  return new Promise((resolve, reject) => {
    base('заказы подробно')
      .select({
        view: 'Aikyn',
        filterByFormula: `{record_id (from заказ номер)} = '${recordID}'`,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          try {
            records.forEach((item) => {
              const id = item.get('record_id (from заказ номер)');

              const n = item.get('№');

              const naimenovanie = item.get('Наименование1');

              const esfCena = item.get('ЭСФ цена')
                ? item.get('ЭСФ цена').toLocaleString()
                : '';

              const kol_vo = item.get('Кол-во');

              let summa = item.get('ЭСФ Сумма').toLocaleString();

              esf.push({
                Наименование: naimenovanie,
                n: n,
                efs1: esfCena,
                kol_vo: kol_vo,
                summa: summa,
              });
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
module.exports = getSecondController;
