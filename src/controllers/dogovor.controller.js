const { base, path, pdf, ejs } = require('../../airtable');

const { findRecord } = require('../utils/utils');
function splitContractText(text) {
  // Создаем регулярное выражение для поиска маркеров пунктов
  const sectionRegex = /\s*((\d+\.)+(\d+\.))/g;

  // Используем метод split, чтобы разделить текст на части по маркерам
  const sections = text.split(sectionRegex);

  // Формируем объект, где каждый ключ - номер пункта, а значение - текст пункта
  let result = {};
  for (let i = 0; i < sections.length; i += 2) {
    if (sections[i + 1]) { // Убедимся, что ключ существует
      result[sections[i + 1].trim()] = (sections[i + 2] || '').trim();
    }
  }

  return result;
}

// Пример текста договора
const contractText = `
  1.1. По договору возмездного оказания услуг Заказчик обязуется оплатить оказанные услуги,
  а Исполнитель обязуется по заданию Заказчика оказать следующие услуги: <br />1.1.1
  Изготовить изделия из приложения 1, после подписания данного приложения становятся
  неотъемлемой частью договора. <br />
  1.2. Срок выполнения работ Договора---сроки исполн рабочих дней с момента первого платежа
  или с момента подтверждения бланка заказов, что является позднее. Исполнитель имеет право
  выполнить работы досрочно.<br />
  1.3. В случае возникновения необходимости выполнения дополнительных объемов, Стороны
  письменно согласуют перечень, срок выполнения, стоимость таких работ и порядок оплаты,
  заключив дополнительное соглашение к настоящему договору.
`;

console.log(splitContractText(contractText));


const dogovorController = async (req, res) => {
  const ID = req.body.recordID || req.query.recordID; // Accept recordID either from body or query
  console.log(req.body);
  try {
    const zakazy_obwee = await findRecord(ID);

    if (!zakazy_obwee || zakazy_obwee.length === 0) {
      return res.status(404).send('Record not found');
    }

    const name_of_firm = zakazy_obwee[0].get('название фирмы 3');
    const airtableData = {
      name_of_firm: name_of_firm,
      dogovor_dlya_schet_oplaty: zakazy_obwee[0].get('договор для счет оплаты'),
      tel2_from_client: zakazy_obwee[0].get('тел2 (from клиент)'),
      seventy_percent: zakazy_obwee[0].get('70%'),
      thirty_percent: zakazy_obwee[0].get('30%'),
      director_from_client: zakazy_obwee[0].get('директор (from клиент)'),
      name: zakazy_obwee[0].get('Name'),
      itogo: zakazy_obwee[0].get('итого'),
      data_dogovara: zakazy_obwee[0].get('дата договора'),
      iin_biin: zakazy_obwee[0].get('ИИН/БИН 3'),
      address: zakazy_obwee[0].get('адрес 3'),
      iik: zakazy_obwee[0].get('ИИК 3'),
      bank: zakazy_obwee[0].get('Банк 3'),
      esf: await fetchRecords(ID),
    };

    const filename = `${airtableData.name}.pdf`;
    const templatePath = path.resolve(__dirname, '../views/dogovor/dogovor.ejs');
    ejs.renderFile(templatePath, { reportdata: airtableData }, (err, data) => {
      if (err) {
        console.error('Error in rendering template:', err);
        return res.status(500).send('Error in rendering template');
      }

      const options = {
        format: 'A4',
        base: `file:///${__dirname}/`,
        header: { height: '2mm' },
        footer: { height: '20mm' },
      };

      pdf.create(data, options).toFile(filename, (err, result) => {
        if (err) {
          console.error('Error creating PDF:', err);
          return res.status(500).send('Error creating PDF');
        }
        res.download(filename, (err) => {
          if (err) {
            console.error('Error during file download:', err);
            return res.status(500).send('Error during file download');
          }
          console.log('File downloaded successfully');
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error');
  }
};
const getAirtabelData = async (req, res) => {
  const ID = req.body.recordID || req.query.recordID;
  const zakazy_obwee = await findRecord(ID);

  if (!zakazy_obwee || zakazy_obwee.length === 0) {
    return res.status(404).send('Record not found');
  }

  const name_of_firm = zakazy_obwee[0].get('название фирмы 3');
  const airtableData = {
    name_of_firm: name_of_firm,
    dogovor_dlya_schet_oplaty: zakazy_obwee[0].get('договор для счет оплаты'),
    tel2_from_client: zakazy_obwee[0].get('тел2 (from клиент)'),
    seventy_percent: zakazy_obwee[0].get('70%'),
    thirty_percent: zakazy_obwee[0].get('30%'),
    director_from_client: zakazy_obwee[0].get('директор (from клиент)'),
    name: zakazy_obwee[0].get('Name'),
    itogo: zakazy_obwee[0].get('итого'),
    data_dogovara: zakazy_obwee[0].get('дата договора'),
    iin_biin: zakazy_obwee[0].get('ИИН/БИН 3'),
    address: zakazy_obwee[0].get('адрес 3'),
    iik: zakazy_obwee[0].get('ИИК 3'),
    bank: zakazy_obwee[0].get('Банк 3'),
    esf: await fetchRecords(ID),
  };
  res.status(200).send(airtableData);
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

module.exports = { dogovorController, getAirtabelData };
