const { base, path, pdf, ejs } = require('../../airtable');
function findRecord(recordID) {
  const zakazy_obwee = 'Сатылым1';
  return new Promise((resolve, reject) => {
    base(zakazy_obwee)
      .select({
        filterByFormula: `{record_id} = '${recordID}'`,
      })
      .eachPage(function page(records, fetchNextPage) {
        resolve(records);
        fetchNextPage();
      })
      .catch((err) => {
        reject(err);
      });
  });
}
const fetchSatylym2 = (recordID) => {
  return new Promise((resolve, reject) => {
    base('Сатылым2')
      .select({
        filterByFormula: `{record_id (from заказ номер)} = '${recordID}'`,
      })
      .eachPage(function page(records, fetchNextPage) {
        fetchNextPage();
        resolve(records);
      })
      .catch((e) => reject(e));
  });
};
const fetchRecords = (recordID) => {
  let esf = [];
  let count = 1;
  return new Promise((resolve, reject) => {
    base('Сатылым2')
      .select({
        filterByFormula: `{record_id (from заказ номер)} = '${recordID}'`,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          try {
            records.forEach((item) => {
              const naimenovanie = item.get('ТауарАты1');
              const esfCena = item.get('Баға') ? item.get('Баға').toLocaleString() : '';
              const kol_vo = item.get('Саны');
              let summa = item.get('Сомасы').toLocaleString();

              esf.push({
                Наименование: naimenovanie,
                n: count++,
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
            resolve(esf);
          }
        }
      );
  });
};
const fetchSatylymDogovor = (recordID) => {
  let esf = [];
  return new Promise((resolve, reject) => {
    base('Сатылым2')
      .select({
        filterByFormula: `{record_id (from заказ номер)} = '${recordID}'`,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          try {
            records.forEach((item) => {
              const naimenovanie = item.get('ТауарАты1');
              const esfCena = item.get('Баға') ? item.get('Баға').toLocaleString() : '';
              const kol_vo = item.get('Саны');
              const n = item.get('№');

              let summa = item.get('Сомасы').toLocaleString();

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
            const sortedArray = esf.sort((a, b) => a.n - b.n);
            resolve(sortedArray);
          }
        }
      );
  });
};
function deliverData(recordID) {
  const dostavka = 'доставки';
  return new Promise((resolve, reject) => {
    base(dostavka)
      .select({
        filterByFormula: `{record_id (from заказ)} = '${recordID}'`,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          try {
            resolve(records);
            fetchNextPage();
          } catch (e) {
            reject(e);
          }
        },
        function done(err) {
          if (err) {
            reject(err);
          }
        }
      );
  });
}
async function fetchData(recordID) {
  let items = [];
  const zakazy_podrobno = 'Сатылым2';

  return new Promise((resolve, reject) => {
    base(zakazy_podrobno)
      .select({
        filterByFormula: `{record_id (from заказ номер)} = '${recordID}'`,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          try {
            records.forEach((item) => {
              const n = item.get('№');
              const url = item.get('сызба') ? item.get('сызба')[0].url : null;
              if (url) {
                items.push({ n, url });
              }
            });
            fetchNextPage();
          } catch (e) {
            reject(e);
          }
        },
        function done(err) {
          if (err) {
            reject(err);
          } else {
            const sortedUrls = items.sort((a, b) => a.n - b.n).map((item) => item.url);
            resolve(sortedUrls);
          }
        }
      );
  });
}

function tapsyrysZholdary(recordID) {
  const zakazy_podrobno = 'Сатылым2';
  let data = [];
  return new Promise((resolve, reject) => {
    base(zakazy_podrobno)
      .select({
        filterByFormula: `{record_id (from заказ номер)} = '${recordID}'`,
      })
      .eachPage(function page(records, fetchNextPage) {
        try {
          records.forEach((item) => {
            data.push({
              n: item.get('№'),
              naimenovanie: item.get('ТауарАты1'),
              kol_vo: item.get('Саны'),
              postavshik: item.get('поставшик'),
              kraska_metal: item.get('металл бояу'),
              client_from_zakaz: item.get('клиент (from заказ номер)'),
              tel1: item.get('тел1'),
              data_zdachi: item.get('дата сдачи на товар'),
              designer: item.get('дизайнер'),
              cenaDostavki: item.get('цена (доставки)'),
              nomer_zakaza: item.get('номер заказа'),
            });
          });
          fetchNextPage();
        } catch (e) {
          reject(e);
        }
      })
      .then(() => {
        data.sort((a, b) => a.n - b.n);
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function tapsyrysZholdary1(recordID) {
  const zakazy_podrobno = 'Сатылым2';
  let data = [];
  return new Promise((resolve, reject) => {
    base(zakazy_podrobno)
      .select({
        filterByFormula: `{record_id (from заказ номер)} = '${recordID}'`,
      })
      .eachPage(function page(records, fetchNextPage) {
        try {
          records.forEach((item) => {
            if (item.get('сызба')) {
              data.push({
                n: item.get('№'),
                naimenovanie: item.get('ТауарАты1'),
                kol_vo: item.get('Саны'),
                postavshik: item.get('поставшик'),
                kraska_metal: item.get('металл бояу'),
                client_from_zakaz: item.get('клиент (from заказ номер)'),
                tel1: item.get('тел1'),
                data_zdachi: item.get('дата сдачи на товар'),
                designer: item.get('дизайнер'),
                cenaDostavki: item.get('цена (доставки)'),
                nomer_zakaza: item.get('номер заказа'),
              });
            }
          });
          fetchNextPage();
        } catch (e) {
          reject(e);
        }
      })
      .then(() => {
        data.sort((a, b) => a.n - b.n);
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
const splitTextByPoint = (number, text) => {
  // Regex to capture sections based on the numbering that starts with the specified 'number'
  const regex = new RegExp(
    `(${number}\\.\\d+(?:\\.\\d+)?)[\\s\\S]+?(?=\\s*${number}\\.\\d+(?:\\.\\d+)?|$)`,
    'g'
  );

  let sections = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    sections.push(match[0].trim());
  }

  return sections;
};
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
const getDocuments = (recordID) => {
  const documents = 'құжаттар';
  return new Promise((resolve, reject) => {
    base(documents)
      .select({
        filterByFormula: `{record_id} = '${recordID}'`,
      })
      .eachPage(function page(records, fetchNextPage) {
        resolve(records);
        fetchNextPage();
      })
      .catch((err) => {
        reject(err);
      });
  });
};
module.exports = {
  findRecord,
  fetchRecords,
  fetchSatylymDogovor,
  deliverData,
  splitTextByPoint,
  fetchData,
  tapsyrysZholdary,
  tapsyrysZholdary1,
  numberToWordsRU,
  getDocuments,
  fetchSatylym2
};
