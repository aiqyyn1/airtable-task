const fetch = require('node-fetch');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const { base } = require('../../airtable');

async function pdfMergerController(req, res) {
  const recordID = req.query.recordID;

  try {
    const pdfUrls = await fetchData(recordID);
    const modifiedPdfBytes = await mergeAndModifyPDFs(pdfUrls, recordID);

    // Set the response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=modified.pdf'); // Fix the Content-Disposition header

    res.send(Buffer.from(modifiedPdfBytes));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
}

async function fetchData(recordID) {
  let pdfUrls = [];
  const zakazy_podrobno = 'заказы подробно';
  return new Promise((resolve, reject) => {
    base(zakazy_podrobno)
      .select({
        view: 'Aikyn',
        filterByFormula: `{record_id (from заказ номер)} = '${recordID}'`,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          try {
            records.forEach((item) => {
              if (item.get('чертеж')) pdfUrls.push(item.get('чертеж')[0].url);
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
            resolve(pdfUrls);
          }
        }
      );
  });
}

function findRecord(recordID) {
  const zakazy_obwee = 'заказы общее';
  return new Promise((resolve, reject) => {
    base(zakazy_obwee)
      .select({
        view: 'Aikyn1 чертеж',
        filterByFormula: `{record_id} = '${recordID}'`,
      })
      .eachPage(function page(records, fetchNextPage) {
        resolve(records); // Resolve inside the callback
        fetchNextPage();
      })
      .catch((err) => {
        reject(err); // Handle rejection here
      });
  });
}

function tapsyrysZholdary(recordID) {
  const zakazy_podrobno = 'заказы подробно';
  let data = [];
  return new Promise((resolve, reject) => {
    base(zakazy_podrobno)
      .select({
        view: 'Aikyn чертеж',
        filterByFormula: `{record_id (from заказ номер)} = '${recordID}'`,
      })
      .eachPage(function page(records, fetchNextPage) {
        try {
          records.forEach((item) => {
            const n = item.get('№');
            const naimenovanie = item.get('Наименование1');
            const kol_vo = item.get('Кол-во');
            const postavshik = item.get('поставшик');

            const kraska_metal = item.get('краска метал');
            const url = item.get('чертеж');

            data.push({
              n: n,
              naimenovanie: naimenovanie,
              kol_vo: kol_vo,
              postavshik: String(postavshik),
              kraska_metal: kraska_metal,
              url: url && url[0].url,
            });
          });
          fetchNextPage();
        } catch (e) {
          reject(e); // Reject if an error occurs during processing
        }
      })
      .then(() => {
        resolve(data); // Resolve with the data after processing is complete
      })
      .catch((error) => {
        reject(error); // Reject if an error occurs during querying
      });
  });
}
function dostavkaData(recordID) {
  const dostavka = 'доставки';
  return new Promise((resolve, reject) => {
    base(dostavka)
      .select({
        view: 'Aikyn чертеж',
        filterByFormula: `{record_id (from заказ)} = '${recordID}'`,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          try {
            console.log('==>', dostavka);
            resolve(records); // Resolve with records
            fetchNextPage();
          } catch (e) {
            reject(e);
          }
        },
        function done(err) {
          if (err) {
            reject(err); // Reject if there's an error
          }
        }
      );
  });
}

async function mergeAndModifyPDFs(pdfUrls, recordID) {
  const mergedPdf = await PDFDocument.create();
  const fontBytes = await fetch('https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf').then((res) =>
    res.arrayBuffer()
  );

  mergedPdf.registerFontkit(fontkit);
  const customFont = await mergedPdf.embedFont(fontBytes);

  const data = await findRecord(recordID);
  const aikyn_chertezh = await tapsyrysZholdary(recordID);
  const dostavka = await dostavkaData(recordID);
  // console.log(dostavka);
  //dostavka data
  // const address = dostavka.get('адрес');
  // const kol_vo_reisov = dostavka.get('кол-во рейсов');
  // const vygruzka = dostavka.get('выгрузка');
  // const ustanovka = dostavka.get('установка');
  // const komment = dostavka.get('комментарий');
  // console.log('==>', address, kol_vo_reisov, vygruzka, ustanovka, komment);
  // zakazy obwee data
  const nomer = String(data[0].get('номер'));
  const manager = String(data[0].get('Менеджер'));
  const srochno = String(data[0].get('Срочно'));
  const aty_from_client = 'Аты' + ' ' + String(data[0].get('Аты (from клиент)'));
  const tel2_from_client = 'Тел' + ' ' + String(data[0].get('тел2 (from клиент)'));

  const fontSize = 16;
  for (const pdfUrl of pdfUrls) {
    const pdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

    pages[0].drawText(aty_from_client, {
      x: 50,
      y: 510,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0, 0),
    });
    pages[0].drawText(tel2_from_client, {
      x: 50,
      y: 520,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0, 0),
    });
    pages[0].drawText(manager, {
      x: 50,
      y: 530,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0, 0),
    });
    pages[0].drawText(nomer, {
      x: 50,
      y: 540,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0, 0),
    });
    pages[0].drawText(srochno, {
      x: 50,
      y: 550,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0, 0),
    });

    // Вставьте этот код для добавления данных из aikyn_chertezh на страницу
    aikyn_chertezh.forEach((dataItem, index) => {
      if (index < pages.length) {
        // Убедимся, что есть достаточно страниц для добавления данных
        const textToDraw = `${dataItem.n}. ${dataItem.naimenovanie}, ${dataItem.kol_vo}, ${dataItem.postavshik}, ${dataItem.kraska_metal}`;
        pages[index].drawText(textToDraw, {
          x: 50,
          y: 480 - index * 20,
          size: fontSize,
          font: customFont,
          color: rgb(0, 0, 0, 0),
        });
      }
    });
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const modifiedPage = mergedPdf.addPage(page);
      // Add a new page after each PDF file
    });
  }

  return await mergedPdf.save();
}

module.exports = pdfMergerController;
