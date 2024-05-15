const { base, path, pdf, ejs } = require('../../airtable');

const { findRecord } = require('../utils/utils');

const dogovorController = async (req, res) => {
  const ID = req.query.recordID;
  try {
    const zakazy_obwee = await findRecord(ID);
    const  name_of_firm = zakazy_obwee[0].get('название фирмы 3')
    const dogovor_dlya_schet_oplaty = zakazy_obwee[0].get('договор для счет оплаты')

  } catch (e) {
    console.log(e.message);
  }
};

module.exports = dogovorController