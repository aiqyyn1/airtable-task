const { base, path, pdf, ejs } = require('../../airtable');
const { findRecord } = require('../utils/utils');

const units = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const teens = [
  'десять',
  'одиннадцать',
  'двенадцать',
  'тринадцать',
  'четырнадцать',
  'пятнадцать',
  'шестнадцать',
  'семнадцать',
  'восемнадцать',
  'девятнадцать',
];
const tens = [
  '',
  '',
  'двадцать',
  'тридцать',
  'сорок',
  'пятьдесят',
  'шестьдесят',
  'семьдесят',
  'восемьдесят',
  'девяносто',
];
const hundreds = [
  '',
  'сто',
  'двести',
  'триста',
  'четыреста',
  'пятьсот',
  'шестьсот',
  'семьсот',
  'восемьсот',
  'девятьсот',
];
const thousands = [
  'тысяч',
  'одна тысяча',
  'две тысячи',
  'три тысячи',
  'четыре тысячи',
  'пять тысяч',
  'шесть тысяч',
  'семь тысяч',
  'восемь тысяч',
  'девять тысяч',
];

const numberToWordsRU = (number) => {
  let result = '';

  if (number >= 1000 && number < 2000) {
    result += `одна тысяча `;
    number %= 1000;
  } else if (number >= 2000 && number < 5000) {
    result += `${units[Math.floor(number / 1000)]} тысячи `;
    number %= 1000;
  } else if (number >= 5000 && number < 10000) {
    result += `${units[Math.floor(number / 1000)]} тысяч `;
    number %= 1000;
  } else if (number >= 10000 && number < 20000) {
    result += `${teens[Math.floor(number / 1000) % 10]} тысяч `;
    number %= 1000;
  } else if (number >= 20000 && number < 100000) {
    result += `${tens[Math.floor(number / 10000) % 10]} ${
      units[Math.floor(number / 1000) % 10]
    } тысяч `;
    number %= 1000;
  } else if (number >= 100000 && number < 1000000) {
    result += `${hundreds[Math.floor(number / 100000) % 10]} ${
      tens[Math.floor(number / 10000) % 10]
    } ${units[Math.floor(number / 1000) % 10]} тысяч `;
    number %= 1000;
  }

  if (number >= 100) {
    result += `${hundreds[Math.floor(number / 100)]} `;
    number %= 100;
  }

  if (number >= 20) {
    result += `${tens[Math.floor(number / 10)]} `;
    number %= 10;
  } else if (number >= 10) {
    result += `${teens[number - 10]} `;
    number = 0;
  }

  result += units[number];
  return result.trim();
};

const getSections = async (ID) => {
  const zakazy_obwee = await findRecord(ID);

  const totalAmount = zakazy_obwee[0].get('итого');
  const seventyPercent = zakazy_obwee[0].get('70%');
  const thirtyPercent = zakazy_obwee[0].get('30%');

  const sections1 = `1.1. По договору возмездного оказания услуг Заказчик обязуется оплатить оказанные услуги, а Исполнитель обязуется по заданию Заказчика оказать следующие услуги 1.1.1 Изготовить изделия из приложения 1, после подписания данного приложения становятся неотъемлемой частью договора. 1.2. Срок выполнения работ Договора---сроки исполн рабочих дней с момента первого платежа или с момента подтверждения бланка заказов, что является позднее. Исполнитель имеет право выполнить работы досрочно. 1.3. В случае возникновения необходимости выполнения дополнительных объемов, Стороны письменно согласуют перечень, срок выполнения, стоимость таких работ и порядок оплаты, заключив дополнительное соглашение к настоящему договору.`;
  const sections2 = `2.1. Исполнитель обязан: 2.1.1. Оказать услуги с надлежащим качеством. 2.1.2. Оказать услуги в полном обьеме в срок, указанный в п. 1.2 настоящего договора. 2.2. Заказчик обязан: 2.2.1. Оплатить услуги после подписания договора, в порядке, указанном в п. 3.2. 2.2.2. Забрать товар после изготовления со склада, в течении 14 (четырнадцать) календарных дней, после накладывается штраф за каждый день просрочки нахождения товара на складе.`;
  const sections3 = `3.1. Общая стоимость настоящего Договора составляет ${totalAmount} (${numberToWordsRU(
    totalAmount
  )}) тенге, сумма договора включает в себя стоимость материалов и работ, сборка в ЦЕХу. 3.2. Заказчик в момент подписания Договора вносит 70% предоплату от обшей суммы Договора, что составляет ${seventyPercent} (${numberToWordsRU(
    seventyPercent
  )}) ${thirtyPercent}  тенге, 30% в размере (${numberToWordsRU(
    thirtyPercent
  )}) тенге до доставки (до отгрузки из склада). Для юридических лиц 100% оплата. 3.3. Просрочка товара на складе указанная в п. 2.2.2, накладывается штрафом в 5 000 (пять тысяч) тенге за каждый день.`;

  const sections4 = `4.1. Доставка готовых изделий осуществляется Заказчиком.
  4.2. Приемка мебели производится Заказчиком по комплектации согласно эскиза (Прил.1) и спецификации (Прил.2) в присутствии представителей обеих сторон, о чем составляется акт приема-сдачи.
  4.3. Мебель считается переданной Исполнителем и принятым Заказчиком с переходом к нему права собственности только после подписания сторонами акта приема-сдачи мебели. До подписания данного акта, все права собственности на данное изделия находятся у Исполнителя.
  4.4. Заказчик, обнаруживший недостатки по изготовлению или установке мебели при ее приемке вправе ссылаться на них впоследствии, если они были зафиксированы в акте приема-сдачи и небыли устранены Исполнителем.
  4.5. При уклонении Заказчика от принятия мебели и подписания акта приема-сдачи в течение 10 (десяти) дней с даты изготовления по настоящему договору, мебель считается принятой в полной комплектации, с должным качеством и в срок, с переходом права собственности и всех рисков к Заказчику с момента даты изготовления.
  4.6. Все обнаруженные Заказчиком недостатки по комплектации и качеству мебели при ее приемке подлежат устранению в течение 20 (двадцати) дней с момента письменного уведомления Исполнителя.
  4.7. В случае не мотивированного расторжения настоящего договора, на любом этапе изготовления мебели с момента подписания настоящего договора, Исполнитель оставляет за собой право требовать с Заказчика возмещения понесённого ущерба по факту упущенной прибыли и понесенных затрат, а также не возвращать в части или полностью внесённую заказчиком предоплату. Домыслы, умозаключения и изменения личностного отношения к жизненным ситуациям, не являются причиной обоснованного расторжения настоящего договора.`;
  const sections5 = `5.1. В случае неисполнения или ненадлежащего исполнения обязательств, педусмотренных настоящим договором Стороны несут ответственность в соответствии с действующим законодательством Республики Казахстан.
  5.2. При необоснованном отказе от приемки работ Заказчик возмещает Исполнителю убытки в виде прямого ущерба.
  5.3. В случае нарушения сроков выполнения Работ, Исполнитель оплачивает Заказчику, в случае заявления последним соответствующего требования, пеню в размере 0,1% (ноль целых одна десятая процента) от Цены Договора за каждый календарный день просрочки.
  5.4. В случае нарушения Заказчиком сроком и/или условий платежей по Договору, Заказчик уплачивает штрафную пеню в размере 0,1% (ноль целых одна десятая процента) от Цены Договора за каждый день просрочки.
  5.5. В случае если Заказчик отказывается от исполнения настоящего договора или от своего заказа после подписания Приложения № 1 и/или Приложения № 2 к Договору, то полученный Исполнителем авансовый платеж по договору не возвращается и остается в качестве возмещения убытков, в том числе для возмещения стоимости расходных материалов и работ по обработке и изготовлению Продукции.`;
  const sections6 = `6.1. Споры и разногласия, которые могут возникнуть при исполнении настоящего договора, будут по возможности разрешаться путем переговоров между сторонами.
  6.2. В случае невозможности разрешения споров путем переговоров, они рассматриваются в соответствии с действующим законодательством Республики Казахстан.`;
  const sections7 = `7.1. Настоящий Договор вступает в юридическую силу со дня подписания Сторонами и действует до полного исполнения Сторонами обязательств.
  7.2. Настоящий Договор, может быть, расторгнут по взаимному соглашению Сторон с предварительным осуществлением взаиморасчетов, по основаниям, предусмотренным действующим законодательством Республики Казахстан.`;
  const sections8 = `8.1. Договор составлен на русском языке в двух экземплярах, обладающих равной юридической силой, по одному экземпляру для каждой из Сторон.
  8.2. Любые изменения и дополнения к настоящему Договору должны быть совершены в письменной форме путем составления соответствующего Соглашения, подписанного уполномоченными лицами.`;

  const obj = {
    sections1,
    sections2,
    sections3,
    sections4,
    sections5,
    sections6,
    sections7,
    sections8,
  };
  return obj;
};

const splitTextByPoint = (sections) => {
  const matchedSections = sections.match(/\d+.\d+(?:.\d+)?[\s\S]+?(?=\s*\d+.\d+(?:.\d+)?|$)/g);
  if (matchedSections) {
    return matchedSections.map((section) => section.replace(/\n/g, ' '));
  }
  return [];
};

const dogovorController = async (req, res) => {
  const ID = req.body.recordID || req.query.recordID;
  const sections1 = splitTextByPoint(req.body.sections.sections1);
  const sections2 = splitTextByPoint(req.body.sections.sections2);
  const sections3 = splitTextByPoint(req.body.sections.sections3);
  const sections4 = splitTextByPoint(req.body.sections.sections4);
  const sections5 = splitTextByPoint(req.body.sections.sections5);
  const sections6 = splitTextByPoint(req.body.sections.sections6);
  const sections7 = splitTextByPoint(req.body.sections.sections7);
  const sections8 = splitTextByPoint(req.body.sections.sections8);
  try {
    const zakazy_obwee = await findRecord(ID);

    if (!zakazy_obwee || zakazy_obwee.length === 0) {
      return res.status(404).send('Record not found');
    }

    const name_of_firm = zakazy_obwee[0].get('название фирмы 3');

    const airtableData = {
      pechat: zakazy_obwee[0].get('печать (from ИП)')[0].url,
      checkbox: req.body.checkbox,
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
      sections1: sections1,
      sections2: sections2,
      sections3: sections3,
      sections4: sections4,
      sections5: sections5,
      sections6: sections6,
      sections7: sections7,
      sections8: sections8,
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
        border: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
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
  if (ID) {
    const sections = await getSections(ID);

    res.status(200).send(sections);
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

module.exports = { dogovorController, getAirtabelData };
