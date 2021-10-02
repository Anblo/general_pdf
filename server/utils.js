import puppeteer from 'puppeteer';
import axios from 'axios';


const fromEmail='ivan@source360group.com';
const templateId = 24962645;
const attachmentName = 'Cinematech.pdf';
// const postmarkToken = 'postmark-api-token';

export const populateTable = (rows, template) => {
  if (!rows) return new Error('missing rows data');
  let table = '';

  Object.entries(rows).forEach(([title, row]) => {
    if (!row || row.quantity === 0) return;
    const data = { title, ...row, total: row.quantity * row.price };
    let html = template;
    PDF_TABLE_MAP.forEach(property => {
      const re = new RegExp(`{{ ${property} }}`, 'g');
      html = html.replace(re, data[property] || '');
    });
    table += html;
  });
  return table;
};

export const populateTemplate = (data, pageTemplate, tableTemplate) => {
  if (!data) new Error('data missing');
  let html = pageTemplate;
  PDF_PROPERTIES_MAP.forEach(key => {
    if (key === 'configuration') {
      const table = populateTable(data[key], tableTemplate);
      const re = new RegExp(`{{ table }}`, 'g');
      html = html.replace(re, table);
    } else {
      const re = new RegExp(`{{ ${key} }}`, 'g');
      html = html.replace(
        re,
        Array.isArray(data[key])
          ? data[key].reduce((output, el) => {
            output += el + '<br />';
            return output;
          }, '')
          : data[key]
      );
    }
  });
  return html;
};

export const htmlToPdf = htmlContent => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('print');

      const byteArray = await page.pdf({
        format: 'A4',
        printBackground: true,        
        marginTop: '80px',
        marginBottom: '80px'
      });

      const buffer = Buffer.from(byteArray, 'binary');
      browser.close();
      resolve(buffer);
    } catch (err) {
      reject(err);
    }
  });
};

export const sendPostmarkRequest = async (data, pdf) => {
  return new Promise(async (resolve, reject) => {
    const { firstName, lastName, email } = data;
    const postmarkData = {
      TemplateId: templateId,      
      From: fromEmail,
      To: email,
      TemplateModel: {
        'firstName': firstName,
        'lastName': lastName
      },
      Attachments: [
        {
          Name: attachmentName,
          Content: pdf,
          ContentType: 'application/pdf',
        },
      ],
    };

    // if (process.env.NODE_ENV !== 'production') delete postmarkData.Bcc;

    try {
      await axios.post(
        'https://api.postmarkapp.com/email/withTemplate',
        postmarkData,
        { headers: { 'X-Postmark-Server-Token': "5d9e2ae1-e266-4820-9142-6053bc8c762f" } }
      );
    } catch (err) {
      console.log('ERROR', err);
      return reject(err);
    }
    return resolve();
  });
};

