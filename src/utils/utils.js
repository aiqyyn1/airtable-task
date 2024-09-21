const { base, path, pdf, ejs } = require('../../airtable');
const numToWordsRU = (function () {
  'use strict';

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
  const thousands = ['', 'тысяча', 'тысячи', 'тысяч'];
  const millions = ['миллион', 'миллиона', 'миллионов'];
  const billions = ['миллиард', 'миллиарда', 'миллиардов'];

  const numToWordsRU = function (n) {
    if (n === 0) return 'ноль';

    const makeGroup = function (group, index) {
      let ones = group % 10;
      let tensAndOnes = group % 100;
      let hundredsPlace = Math.floor(group / 100);
      let result = [];

      if (hundredsPlace > 0) {
        result.push(hundreds[hundredsPlace]);
      }

      if (tensAndOnes > 9 && tensAndOnes < 20) {
        result.push(teens[tensAndOnes - 10]);
      } else {
        if (Math.floor(group / 10) % 10 > 1) {
          result.push(tens[Math.floor(group / 10) % 10]);
        }
        if (ones > 0) {
          result.push(units[ones]);
        }
      }

      let word = result.join(' ');

      if (index === 1) {
        if (ones === 1) {
          word += ` ${thousands[1]}`;
        } else if (ones > 1 && ones < 5) {
          word += ` ${thousands[2]}`;
        } else {
          word += ` ${thousands[3]}`;
        }
      } else if (index === 2) {
        word += ` ${millions[getCase(ones)]}`;
      } else if (index === 3) {
        word += ` ${billions[getCase(ones)]}`;
      }

      return word;
    };

    const chunk = function (n, c = 3) {
      let result = [];
      while (n > 0) {
        result.push(n % Math.pow(10, c));
        n = Math.floor(n / Math.pow(10, c));
      }
      return result;
    };

    const getCase = function (ones) {
      if (ones === 1) return 0;
      if (ones > 1 && ones < 5) return 1;
      return 2;
    };

    const chunks = chunk(n);
    let words = chunks.map(makeGroup).reverse().filter(Boolean);
    return words.join(' ');
  };

  return numToWordsRU;
})();

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
const fetchNakladanaya = (recordID) => {
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
              const nak = item.get('Нак');
              if (nak) {
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
            const sortedArray = esf.sort((a, b) => a.n - b.n);
            resolve(sortedArray);
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
const convertDate = (avrDate) => {
  const dateSplit = String(avrDate).split('-');
  const dateAVR = dateSplit[2] + '.' + dateSplit[1] + '.' + dateSplit[0];
  return dateAVR;
};
module.exports = {
  findRecord,
  fetchRecords,
  fetchSatylymDogovor,
  deliverData,
  splitTextByPoint,
  fetchData,
  tapsyrysZholdary,
  convertDate,
  tapsyrysZholdary1,
  numToWordsRU,
  getDocuments,
  fetchSatylym2,
  fetchNakladanaya
};
