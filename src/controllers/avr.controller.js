
const {base, path, pdf, ejs } = require('../../airtable')
const getSecondController = async (req, res) => {
  const recordID = req.query.recordID;
  try {
    // заказы общее
    const blanks = await getGeneral(recordID);
    const nameOfFirm = blanks.get('название фирмы 3');
    const ip = blanks.get('ИП имя (from ИП)');

    const dogovor = blanks.get('договор для счет оплаты');

    const avr = blanks.get('номер АВР');
    const avrDate = blanks.get('дата АВР') ? blanks.get('дата АВР') : '';
    const dateSplit = String(avrDate).split('-')
    const dateAVR = dateSplit[2] + '.' + dateSplit[1] + '.' + dateSplit[0]
    const iinBiin = blanks.get('ИИН/БИН 3');

    const biin = blanks.get('БИН (from ИП)');
    const pechat = blanks.get('печать (from ИП)')[0].url;
    const rospis = blanks.get('роспись (from ИП)')[0].url;
    const rukovaditel = blanks.get('руководитель (from ИП)');
    const itogo = blanks.get('итого АВР').toLocaleString();
    console.log(itogo)
    let date;
    if (dogovor === 'БЕЗ ДОГОВОРА') {
      date = '';
    } else {
      date = blanks.get('дата договора');
    }

    // заказы подробно
    const { arr, esf } = await getInDetail(recordID);
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    let airtableData = {
      nameOfFirm: nameOfFirm,
      ip: String(ip),
      dogovor: dogovor,
      date: date,
      avr: avr,
      avrDate: dateAVR,
      iinBiin: String(iinBiin),
      biin: biin,
      pechat: pechat,
      rospis: rospis,
      rukovaditel: rukovaditel[0],
      itogo: itogo,
      details: esf,
      sum: sum,
    };
    const filename = nameOfFirm + '.pdf';
    const templatePath = path.resolve(__dirname, '../views/avr/avr.ejs');
    ejs.renderFile(templatePath, { reportdata: airtableData }, (err, data) => {
      if (err) {
        console.log(err, 'Error in rendering template');
        res.status(500).send('Error in rendering template');
      } else {
        const options = {
          format: 'A4',
          orientation: 'landscape',
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
  let arr = [];
  let avrCounter = 1;
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
              const avr = item.get('АВР');
              if (avr) {
                const kol_vo = item.get('Кол-во');

                arr.push(kol_vo);

                const esfCena = item.get('ЭСФ цена')
                  ? item.get('ЭСФ цена').toLocaleString()
                  : '';
                const summa = item.get('ЭСФ Сумма').toLocaleString();
                console.log(summa)
                esf.push({
                  Наименование: item.get('Наименование1'),
                  n: avrCounter++,
                  efs1: esfCena,
                  kol_vo: kol_vo,
                  summa: summa,
                });
              }
            });

            fetchNextPage();
          } catch (error) {
            reject(error);
          }
        },
        function done(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ arr, esf });
          }
        }
      );
  });
};

module.exports = getSecondController;
