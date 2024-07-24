const { base, path, pdf, ejs } = require('../../airtable');
function findRecord(recordID) {
  const zakazy_obwee = 'Сатылым1';
  return new Promise((resolve, reject) => {
    base(zakazy_obwee)
      .select({
        filterByFormula: `{record_id} = '${recordID}'`,
      })
      .eachPage(function page(records, fetchNextPage) {
        resolve(records); // Resolve inside the callback
        fetchNextPage();
      })
      .catch((err) => {
        reject(err);
      });
  });
}
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
            resolve(esf); // Resolve with the collected data when done
          }
        }
      );
  });
};
module.exports = { findRecord, fetchRecords };
