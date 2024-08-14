const fetch = require('node-fetch');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const { base } = require('../../airtable');
const {
  findRecord,
  deliverData,
  fetchData,
  tapsyrysZholdary,
  tapsyrysZholdary1,
} = require('../utils/utils');
async function pdfMergerController(req, res) {
  const recordID = req.query.recordID;

  try {
    const pdfUrls = await fetchData(recordID);
    const modifiedPdfBytes = await mergeAndModifyPDFs(pdfUrls, recordID);
    const chertezh = await tapsyrysZholdary(recordID);

    if (chertezh.length > 0) {
      const nameOfPdf = chertezh[0].nomer_zakaza || 'default';
      const fileName = encodeURIComponent(`${nameOfPdf}-чертеж.pdf`);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(Buffer.from(modifiedPdfBytes));
    } else {
      throw new Error('No data found to set file name');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
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
  const aikyn_chertezh1 = await tapsyrysZholdary1(recordID);
  const dostavka = await deliverData(recordID);
  const address = dostavka[0]?.get('адрес') || '';
  const kol_vo_reisov = dostavka[0]?.get('кол-во рейсов') || '';
  const type_deliver = dostavka[0]?.get('тип доставки') || '';
  const vygruzka = dostavka[0]?.get('выгрузка');
  const ustanovka = dostavka[0]?.get('установка');
  const komment = dostavka[0]?.get('Notes');
  const nomer = String(data[0]?.get('номер'));
  const manager = String(data[0]?.get('Менеджер'));
  const srochno = String(data[0]?.get('Срочно'));
  const aty = String(data[0]?.get('Аты (from клиент)'));
  const nomer_zakaza = 'Номер заказ:' + ' ' + nomer;
  const manager_zakaza = 'Менеджер:' + ' ' + manager;
  const aty_from_client = 'Аты:' + ' ' + aty;
  const tel2_from_client = 'Тел:' + ' ' + String(data[0]?.get('тел2 (from клиент)'));
  const srochno_zakaza = 'Шұғыл:' + ' ' + (srochno ? 'Иа' : 'Жок');
  const fontSize = 12;
  let size = 0;
  let yPos;
  for (const pdfUrl of pdfUrls) {
    const pdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

    pages.forEach((page) => {
      mergedPdf.addPage(page);
    });

    const index = pdfUrls.indexOf(pdfUrl);
    if (aikyn_chertezh1[index]) {
      const tel1 = String(aikyn_chertezh1[index].tel1).substring(
        6,
        String(aikyn_chertezh1[index].tel1)
      );

      const chertezh_podrobno = `N:${aikyn_chertezh1[index].nomer_zakaza}/${
        aikyn_chertezh1[index].n
      } ${aty}-${tel1} | Тауар:${String(aikyn_chertezh1[index].naimenovanie)} Кол-во:${
        aikyn_chertezh1[index].kol_vo || ''
      }шт| `;

      if (pages.length > 0) {
        pages[0].drawText(chertezh_podrobno, {
          x: 50,
          y: 550,
          size: fontSize,
          font: customFont,
          color: rgb(0, 0, 0),
        });
        const split_data = String(aikyn_chertezh1[index].data_zdachi).split('-');
        const data_zdachi = split_data[2] + '.' + split_data[1] + '.' + split_data[0];
        const chertezh_lines1 = `Тапсыру күні:${data_zdachi || ''} | Поставщик:${
          aikyn_chertezh1[index].postavshik || ''
        }| Металл бояуы:${aikyn_chertezh1[index].kraska_metal || ''}  `;

        pages[0].drawText(chertezh_lines1, {
          x: 50,
          y: 530,
          size: fontSize,
          font: customFont,
          color: rgb(0, 0, 0),
        });
      }
    }
  }

  const firstPageDimensions = mergedPdf.getPage(0).getSize();
  const newPage = mergedPdf.addPage([firstPageDimensions.width, firstPageDimensions.height]);

  newPage.drawText(nomer_zakaza, {
    x: 10,
    y: 560,
    size: fontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  newPage.drawText(aty_from_client, {
    x: 10,
    y: 540,
    size: fontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  newPage.drawText(tel2_from_client, {
    x: 10,
    y: 520,
    size: fontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  newPage.drawText(manager_zakaza, {
    x: 10,
    y: 500,
    size: fontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  newPage.drawText(srochno_zakaza, {
    x: 10,
    y: 480,
    size: fontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  newPage.drawText('Тапсырыс жолдары:', {
    x: 10,
    y: 450,
    size: fontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  const arr = 'N| наименование| колво| поставщик| краска| датасдачи| дизайнер';
  newPage.drawText(arr, {
    x: 10,
    y: 430,
    size: fontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  aikyn_chertezh.forEach((item, index) => {
    const split_data_zdachi = item.data_zdachi ? String(item.data_zdachi).split('-') : '';
    const right_data =
      split_data_zdachi[2] + '.' + split_data_zdachi[1] + '.' + split_data_zdachi[0];
    const chertezh_podrobno = `${item.n || ''} | ${item.naimenovanie || ''} | ${
      item.kol_vo || ''
    }шт | ${item.postavshik === undefined ? '' : item.postavshik} | ${item.kraska_metal || ''} | ${
      right_data || ''
    } | ${item.designer || ''}`;

    newPage.drawText(chertezh_podrobno, {
      x: 10,
      y: 410 - index * 20,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    size = 410 - index * 20;
  });
  yPos = size;
  if (yPos > 110) {
    const details = [
      { label: 'тип доставки:', value: type_deliver },
      { label: 'Адрес:', value: address },
      { label: 'кол-во-рейсов:', value: kol_vo_reisov + 'шт' },
      { label: 'выгрузка:', value: vygruzka },
      { label: 'установка:', value: ustanovka },
      { label: 'коммент:', value: komment },
    ];

    details.forEach((detail, index) => {
      const line = `${detail.label} ${detail.value || ''}`;
      newPage.drawText(line, {
        x: 10,
        y: yPos - 20 - index * 20,
        size: 10,
        font: customFont,
        color: rgb(0, 0, 0),
      });
    });
  }

  if (yPos <= 110) {
    const firstPageDimensions = pages[0].getSize();

    const newpage = mergedPdf.addPage([firstPageDimensions.width, firstPageDimensions.height]);
    const details = [
      { label: 'тип доставки:', value: type_deliver },
      { label: 'Адрес:', value: address },
      { label: 'кол-во-рейсов:', value: kol_vo_reisov + 'шт' },
      { label: 'выгрузка:', value: vygruzka },
      { label: 'установка:', value: ustanovka },
      { label: 'коммент:', value: komment },
    ];

    details.forEach((detail, index) => {
      const line = `${detail.label} ${detail.value || ''}`;
      newpage.drawText(line, {
        x: 10,
        y: 500 - 10 - index * 20,
        size: 10,
        font: customFont,
        color: rgb(0, 0, 0), // Assuming you want black text
      });
    });
  }
  return await mergedPdf.save();
}

module.exports = pdfMergerController;
