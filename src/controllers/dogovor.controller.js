const { base, path, pdf, ejs } = require('../../airtable');

const { findRecord } = require('../utils/utils');

const dogovorController = async (req, res) => {
  const ID = req.query.recordID;
  try {
    const zakazy_obwee = await findRecord(ID);
    
  } catch (e) {
    console.log(e.message);
  }
};
