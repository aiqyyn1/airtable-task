const fetch = require('node-fetch');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const { base } = require('../../airtable');

async function pdfMergerController(req, res) {
  const recordID = req.query.recordID;

  try {
    const pdfUrls = await fetchData(recordID);
    const modifiedPdfBytes = await mergeAndModifyPDFs(pdfUrls);

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

async function mergeAndModifyPDFs(pdfUrls) {
  const mergedPdf = await PDFDocument.create();
  const helveticaFont = await mergedPdf.embedFont(StandardFonts.Helvetica);

  for (const pdfUrl of pdfUrls) {
    const pdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const modifiedPage = mergedPdf.addPage(page);

      // Define table properties
      const tableX = 50;
      const tableY = height - 150;
      const cellWidth = 100;
      const cellHeight = 30;
      const tableGap = 10;

      // Draw table header
      modifiedPage.drawText('Header 1', {
        x: tableX,
        y: tableY,
        font: helveticaFont,
        size: 12,
        color: rgb(0, 0, 0),
      });

      modifiedPage.drawText('Header 2', {
        x: tableX + cellWidth + tableGap,
        y: tableY,
        font: helveticaFont,
        size: 12,
        color: rgb(0, 0, 0),
      });

      modifiedPage.drawText('Header 3', {
        x: tableX + 2 * (cellWidth + tableGap),
        y: tableY,
        font: helveticaFont,
        size: 12,
        color: rgb(0, 0, 0),
      });

      // Draw table content
      const tableContent = [
        ['Cell 1', 'Cell 2', 'Cell 3'],
        ['Cell 4', 'Cell 5', 'Cell 6'],
        // Add more rows as needed
      ];

      tableContent.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          modifiedPage.drawText(cell, {
            x: tableX + colIndex * (cellWidth + tableGap),
            y: tableY - (rowIndex + 1) * (cellHeight + tableGap),
            font: helveticaFont,
            size: 10,
            color: rgb(0, 0, 0),
          });
        });
      });
    });
  }

  return await mergedPdf.save();
}


module.exports = pdfMergerController;
