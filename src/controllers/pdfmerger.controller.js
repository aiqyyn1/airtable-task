const fetch = require('node-fetch');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit')
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
findRecord = (recordID) => {
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


async function mergeAndModifyPDFs(pdfUrls, recordID) {
  const mergedPdf = await PDFDocument.create();
  const fontBytes = await fetch('https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf').then((res) => res.arrayBuffer())

  mergedPdf.registerFontkit(fontkit)
  const customFont = await mergedPdf.embedFont(fontBytes)

  const data = await findRecord(recordID)
  const aty_from_client ='Аты' +' ' + String(data.get('Аты (from клиент)'))
  const tel2_from_client ='Тел' + ' ' + String(data.get('тел2 (from клиент)'))
  for (const pdfUrl of pdfUrls) {
    const pdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const modifiedPage = mergedPdf.addPage(page);

  

      const fontSize = 12;
  
 
    

      // Add a new page after each PDF file
      if (index < pages.length - 1) {
        const newPage = mergedPdf.addPage([width, height]);
        // const textXNewPage = (newPage.getWidth() - widthHeight) / 2;
        // const textYNewPage = (newPage.getHeight() - textHeight) / 2;

        newPage.drawText(aty_from_client, {
          x: 50,
          y: 510,
          size: fontSize,
          font: customFont,
          color: rgb(0,0,0,0), // Black color
        });
        newPage.drawText(tel2_from_client, {
          x: 50,
          y:520,
          size: fontSize,
          font: customFont,
          color: rgb(0,0,0,0),
        })
      }
    });
  }

  return await mergedPdf.save();
}


module.exports = pdfMergerController;