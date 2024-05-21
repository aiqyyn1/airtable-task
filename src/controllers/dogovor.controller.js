const { base, path, pdf, ejs } = require('../../airtable');

const { findRecord } = require('../utils/utils');

const dogovorController = async (req, res) => {
  const ID = req.query.recordID;
  try {
    const zakazy_obwee = await findRecord(ID);
    const name_of_firm = zakazy_obwee[0].get('название фирмы 3');
    const dogovor_dlya_schet_oplaty = zakazy_obwee[0].get('договор для счет оплаты');
    const tel2_from_client = zakazy_obwee[0].get('тел2 (from клиент)');
    const director_from_client = zakazy_obwee[0].get('директор (from клиент)');
    const name = zakazy_obwee[0].get('Name');
    const dogovor = zakazy_obwee[0].get('дата договора');
    console.log(dogovor)
    let airtableData = {
      name_of_firm: name_of_firm,
      dogovor_dlya_schet_oplaty: dogovor_dlya_schet_oplaty,
      tel2_from_client: tel2_from_client,
      director_from_client: director_from_client,
      data_dogovara: dogovor,
    };
    const filename = name + '.pdf';
    const templatePath = path.resolve(__dirname, '../views/dogovor/dogovor.ejs');
    ejs.renderFile(templatePath, { reportdata: airtableData }, (err, data) => {
      if (err) {
        console.log(err, 'Error in rendering template');
        res.status(500).send('Error in rendering template');
      } else {
        const options = {
          format: 'A4',
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
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = dogovorController;
