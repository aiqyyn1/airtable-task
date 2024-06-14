const { base, path, pdf, ejs } = require('../../airtable');

const { findRecord } = require('../utils/utils');
const getData = async (ID) => {
  const zakazy_obwee = await findRecord(ID);
  const sections1 = `
  1.1. По договору возмездного оказания услуг Заказчик обязуется оплатить оказанные услуги,
  а Исполнитель обязуется по заданию Заказчика оказать следующие услуги
  1.1.1
  Изготовить изделия из приложения 1, после подписания данного приложения становятся
  неотъемлемой частью договора. 
  1.2. Срок выполнения работ Договора---сроки исполн рабочих дней с момента первого платежа
  или с момента подтверждения бланка заказов, что является позднее. Исполнитель имеет право
  выполнить работы досрочно.
  1.3. В случае возникновения необходимости выполнения дополнительных объемов, Стороны
  письменно согласуют перечень, срок выполнения, стоимость таких работ и порядок оплаты,
  заключив дополнительное соглашение к настоящему договору.
`;
  const sections2 = `
2.1. Исполнитель обязан:
2.1.1. Оказать услуги с надлежащим качеством.
2.1.2. Оказать услуги в полном обьеме в срок, указанный в п. 1.2 настоящего договора.
2.2. Заказчик обязан:
2.2.1. Оплатить услуги после подписания договора, в порядке, указанном в п. 3.2.
2.2.2. Забрать товар после изготовления со склада, в течении 14 (четырнадцать) календарных дней, после накладывается штраф за каждый день просрочки нахождения товара на складе.
`;
  const sections3 = `
  3.1. Общая стоимость настоящего Договора составляет <%-reportdata.itogo%> тенге, сумма
          договора включает в себя стоимость материалов и работ, сборка в ЦЕХу.
          <br />3.2. Заказчик в момент подписания Договора вносит 70% предоплату от обшей суммы
          Договора, что составляет <%-reportdata.seventy_percent%> тенге, 30% в размере
          <%-reportdata.thirty_percent%> тенге до доставки (до отгрузки из склада). Для юридических
          лиц 100% оплата.<br />
          2.1.2. Оказать услуги в полном обьеме в срок, указанный в п. 1.2 настоящего договора.<br />
          3.3. Просрочка товара на складе указанная в п. 2.2.2, накладывается штрафом в 5 000 (пять
          тысяч) тенге за каждый день.`;
  return { sections1, sections2 };
};
const splitTextByPoint = (sections) => sections.split('s(?=d.d(?:.d+)?)');

// console.log(sections);

const dogovorController = async (req, res) => {
  const ID = req.body.recordID || req.query.recordID; // Accept recordID either from body or query

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
      firstSections: sections,
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
