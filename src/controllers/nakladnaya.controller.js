const { findRecord, getDocuments } = require('../utils/utils');
const { path, pdf, ejs } = require('../../airtable');
const nakladnayaController = async (req, res) => {
  const recordID = req.query.recordID;

  try {
    const records = await findRecord(recordID);
    const documents = await getDocuments(recordID);
    console.log(documents);

    const ip = records[0].get('ИП');
    const biin = records[0].get('БИН (from ИП)');
    const nazvanie_firmy_3 = records[0].get('название фирмы 3');
    const rukovaditel = records[0].get('руководитель (from ИП)');

    const filename = String(nomer_zakaz) + '-' + nameOfFirm + '-' + 'АЖА' + '.pdf';
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
module.exports = { nakladnayaController };
