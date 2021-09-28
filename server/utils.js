import puppeteer from 'puppeteer';
import axios from 'axios';
import FormData from 'form-data';

// import {
//   PDF_PROPERTIES_MAP,
//   PDF_TABLE_MAP,
//   POSTMARK_TOKEN,
//   THREEKIT_AUTH_TOKEN,
//   THREEKIT_ORG_ID,
//   THREEKIT_ASSET_ID,
//   THREEKIT_ENV,
// } from './constants.js';

import {
  THREEKIT_CONFIG
} from '../constants.js';

// const fromEmail='example@email.com';
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
        // displayHeaderFooter: true,
        // headerTemplate:'',
        // footerTemplate:`<h1>Page <span class="pageNumber"></span> of <span class="totalPages"></span></h1>`,
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
      From: 'ivan@source360group.com',
      // To: 'test@blackhole.postmarkapp.com',
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

export const savePdf = pdfBuffer => {
  return new Promise(async (resolve, reject) => {
    const data = new FormData();
    data.append('orgId', THREEKIT_ORG_ID);
    data.append('file', pdfBuffer, { filename: 'estimate.pdf' });
    // if (options?.sync) data.append('sync', 'true');
    try {
      const response = await axios({
        method: 'post',
        url: `${THREEKIT_ENV}/api/files`,
        headers: {
          'content-type': `multipart/form-data; boundary=${data._boundary}`,
          authorization: `Bearer ${THREEKIT_AUTH_TOKEN}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        data,
      });
      resolve(`${THREEKIT_ENV}/api/files/${response.data.files[0].id}/content`);
    } catch (err) {
      console.log('error saving pdf: ', err);
      reject(err);
    }
  });
};

export const saveOrderToThreekit = async (
  userData,
  configuration,
  storeName
) => {
  const formData = new FormData();
  formData.append('productId', THREEKIT_ASSET_ID);
  formData.append('productVersion', 'v1.0');
  formData.append(
    'variant',
    typeof configuration === 'string'
      ? configuration
      : JSON.stringify(configuration)
  );

  const { data: savedConfiguration } = await axios({
    method: 'post',
    url: `${THREEKIT_ENV}/api/configurations?bearer_token=${THREEKIT_AUTH_TOKEN}`,
    data: formData,
    headers: formData.getHeaders(),
  });

  const data = {
    platform: {
      platform: 'QCab Store',
      storeName,
    },
    metadata: {
      ...userData,
    },
    items: [
      {
        id: savedConfiguration.id,
        count: 1,
      },
    ],
    derivative: {},
  };

  return axios({
    url: `${THREEKIT_ENV}/api/orders?bearer_token=${THREEKIT_AUTH_TOKEN}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  });
};

