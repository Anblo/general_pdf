import { getTemplate, generateHtml, htmlToPdf } from './utils.js';
import { sendPostmarkRequest } from './../server/utils.js';


export default (data = null, template = "", pdfJson = null, snapshotModel = null, gearSelected = null, uiModel = null) => {
  return new Promise(async resolve => {
    const htmlTemplate = await getTemplate(template);
    const html = generateHtml(data, htmlTemplate, uiModel, pdfJson, snapshotModel, gearSelected);
    const pdf = await htmlToPdf(html);
    await sendPostmarkRequest(uiModel,
      pdf.toString('base64')
      );
    
    resolve(pdf);
  });
};
