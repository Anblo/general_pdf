import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
const __dirname = path.dirname(new URL(import.meta.url).pathname);
// const __dirname = 'D:/WORK/ThreeKit/General-PDF/pdf-templates';


export const getTemplate = template => {
  return new Promise(resolve => {
    if (!template) reject();
    const html = fs.readFileSync(
      path.join(__dirname, `/${template}`, 'pdf.html'),
      'utf8'
    );
    resolve(html);
  });
};

const ucword = (str) => {
  str = str.toLowerCase().replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, function (replace_latter) {
    return replace_latter.toUpperCase();
  });  //Can use also /\b[a-z]/g
  return str;  //First letter capital in each word
}

const footerCinematech = `<footer class="footer">
<h1 class="footer-company-name">CinemaTech</h1>
<h1 class="footer-company-url">www.MyCinemaTech.com</h1>
<h1 class="footer-id">972.381.1071</h1>
</footer>`;

const generatePdfContentCinematechPage1 = (data, uiModel) => {
  const Page1 = generateContentPage1(data, uiModel);

  return Page1;
};

const generateContentPage1 = (data, uiModel) => {
  uiModel.snapShots = convertObjectInArray(uiModel.snapShots);
  const snapShotsPage1 = searchObject(uiModel.snapShots, 'page1');

  const headerPage1 = `<div class="header">
                      <div class="cinematech-logo">
                        <img class="logo" src= ${data.companyLogo} alt="qcab" width="230" height="360"/>
                      </div>
                      <div class="cinematech-title-page1">
                        <div class="cinematech-title-first-item">
                          
                        </div>
                        <div class="cinematech-title-second-item">
                          <img class="" src= ${snapShotsPage1.page1.angledViewComplete} alt="qcab" width="100%" height="100%"/>
                        </div>
                      </div>
                    </div>`;
  const contentPage1 = `<div class="content-container-page1">
   <div class="page1-data">
     <p class="page1-data-first-item">${uiModel.firstName + " " + uiModel.lastName} Theater Room</p>
     <p class="page1-data-second-item">${uiModel.date}</p>
   </div>
 </div>`;

  const pageBreak = `<div class="page-break"></div>`;


  return headerPage1 + contentPage1 + footerCinematech + pageBreak;
};

const generatePdfContentCinematechPage2 = data => {
  const Page2 = generateContentPage2(data);

  return Page2;
};

const generateContentPage2 = data => {
  const headerPage2 = `<div class="header">
  <div class="cinematech-logo">
    <img class="logo" src="https://costarides.idoagency.com/images/cinematech-email-logo1618.png" alt="qcab"
      width="85" height="130" />
  </div>
  <div class="cinematech-title">
    <div class="cinematech-title-first-item">
    </div>
  </div>
</div>`;

  const contentPage2 = ` <div class="content-container-page2">
   <div class="page2-text">
     <p class="page2-text-first">Ergonomics + Comfort + Craftsmanship</p>
     <div class="page2-column-section">
       <div class="page2-first-column">
         <p class="page2-text-second">CinemaTech Seating is Regarded as the Finest Seating in the Industry.</p>
         <p class="page2-text-third">CinemaTech has designed and built over 20,000 theater seats and custom
           furniture for the most discerning clientele and prominent estates
           throughout the world.</p>
         <p class="page2-text-fourth">CinemaTech has mastered the essential elements to create the finest
           Cinema experience and design of seating. Starting with the right density
           foam and steel base to the proper internal mechanism, seat depth and
           appropriate height, CinemaTech combines beauty with functional design.
           Our goal with every client is to provide the best ergonomic experience for
           their private cinema.</p>
         <p class="page2-text-fifth">Since 1999, CinemaTech Seating has been honored with countless awards
           as well as featured in publications including Luxe Interiors + Design,
           Architectural Digest and the New York Times.</p>
       </div>
       <div class="page2-second-column">
         <img class="page2-image" src="https://costarides.idoagency.com/images/image%20page%202.png" alt="qcab"
           width="360" height="390" />
       </div>
     </div>
   </div>
 </div>`;



  const pageBreak = `<div class="page-break"></div>`;


  return headerPage2 + contentPage2 + footerCinematech + pageBreak;
};

const generatePdfContentCinematechPage3 = (data, uiModel) => {
  const Page3 = generateContentPage3(data, uiModel);

  return Page3;
};

const generateContentPage3 = (data, uiModel) => {
  uiModel.summary = convertObjectInArray(uiModel.summary);
  const snapShotsPage3 = searchObject(uiModel.snapShots, 'page3');

  const headerPage3 = `<div class="header">
  <div class="cinematech-logo">
    <img class="logo" src="https://costarides.idoagency.com/images/cinematech-email-logo1618.png" alt="qcab"
      width="85" height="130" />
  </div>
  <div class="cinematech-title">
    <div class="cinematech-title-first-item">
    </div>
  </div>
</div>`;

  const contentPage3Section1 = `<div class="content-container-page3">
  <div class="page3-column-section">
    <div class="page3-first-column">
      <img class="" src= ${snapShotsPage3.page3.overheadView} alt="qcab" width="100%" height="100%"/>
    </div>
    <div class="page3-second-column">`

  let contentPage3Section2 = ``;

  const contentPage3Section3 = `</div>
  </div>
  <div class="page3-content-text">
    <p></p>
  </div>
</div>`;

  const sumaryInformation = (sumary) =>
    `<div class="summay-content">
      <p>
      <h2>${sumary.row}</h2><br/>
      <span>MODEL1: </span>${sumary.model}<br/>
      <span>NUMBER OF ITEMS: </span>${sumary.seats}<br/>
      <span>SEAT CUSTOMIZATION: </span>${sumary.material}<br/>
      <span>CUSTOMIZATION: </span>${sumary.customization}<br/>
      <span>ADD ONS: </span>${sumary.addOns}<br/>
      </p>
    </div>`;

  uiModel.summary.forEach(
    row =>
    (contentPage3Section2 += sumaryInformation(
      row
    )));

  const pageBreak = `<div class="page-break"></div>`;


  return headerPage3 + contentPage3Section1 + contentPage3Section2 + contentPage3Section3 + footerCinematech + pageBreak;
};

const generatePdfContentCinematechPage4 = (data, uiModel) => {
  const Page4 = generateContentPage4(data, uiModel);

  return Page4;
};

const generateContentPage4 = (data, uiModel) => {
  let rowPages = ``;
  uiModel.summary = convertObjectInArray(uiModel.summary);
  const snapShotsRow1 = searchObject(uiModel.snapShots, 'row1');
  const snapShotsRow2 = searchObject(uiModel.snapShots, 'row2');
  const snapShotsRow3 = searchObject(uiModel.snapShots, 'row3');
  const snapShotsRow4 = searchObject(uiModel.snapShots, 'row4');

  const Rowinformation = (row, i, length) =>
    `<div class="header">
    <div class="cinematech-logo">
      <img class="logo" src="https://costarides.idoagency.com/images/cinematech-email-logo1618.png" alt="qcab"
        width="85" height="130" />
    </div>
    <div class="cinematech-title${i + 1}">
      <div class="cinematech-title-first-item">
        <p>Row ${i + 1} – ${row.model}</p>
      </div>
    </div>
  </div>
  <div class="content-container-page4">
  <div class="page4-row-section">
    <div class="page4-first-row">
      <div class="page4-first-column">
        <div class="page4-first-item-first-row">
          <img class="" src= ${i === 0 ? snapShotsRow1.row1.vrayView : i === 1 ? snapShotsRow2.row2.vrayView : i === 2 ? snapShotsRow3.row3.vrayView : snapShotsRow4.row4.vrayView} alt="qcab" width="100%" height="100%"/>
        </div>
      </div>
      <div class="page4-second-column">
        <div class="page4-second-item-first-row">
          <img class="" src= ${i === 0 ? snapShotsRow1.row1.overheadView : i === 1 ? snapShotsRow2.row2.overheadView : i === 2 ? snapShotsRow3.row3.overheadView : snapShotsRow4.row4.overheadView} alt="qcab" width="100%" height="100%"/>
        </div>
        <div class="page4-third-item-first-row">
          <img class="" src= ${i === 0 ? snapShotsRow1.row1.frontView : i === 1 ? snapShotsRow2.row2.frontView : i === 2 ? snapShotsRow3.row3.frontView : snapShotsRow4.row4.frontView} alt="qcab" width="100%" height="100%"/>
        </div>
      </div>
    </div>
    <div class="page4-second-row">
      <div class="page4-first-item-second-row">
        <p>
          <span><b>FEATURES:</b> </span>${ row.modelFeatures}<br/>
        </p>
      </div>
      <div class="page4-second-item-second-row">
        <p>
          <span><b>MATERIAL:</b> </span>${ row.material}<br/>
        </p>
      </div>
      <div class="page4-third-item-second-row">
        <img class="" src= ${row.rowMaterialsImagesUrl[0]} alt="qcab" width="100%" height="100%"/>
      </div>
      <div class="page4-fourth-item-second-row">
        <img class="" src= ${i === 0 ? snapShotsRow1.row1.sideView : i === 1 ? snapShotsRow2.row2.sideView : i === 2 ? snapShotsRow3.row3.sideView : snapShotsRow4.row4.sideView} alt="qcab" width="100%" height="100%"/>
      </div>
    </div>
  </div>
</div>
<div class="page4-content-text">
  <p></p>
</div>
<footer class="footer">
  <h1 class="footer-company-name">CinemaTech</h1>
  <h1 class="footer-company-url">www.MyCinemaTech.com</h1>
  <h1 class="footer-id">972.381.1071</h1>
</footer>
<div class="page-break"></div>`;

  uiModel.summary.forEach(
    (row, i) =>
    (rowPages += Rowinformation(
      row, i, uiModel.summary.length
    )));

  return rowPages;
};

const generatePdfContentCinematechPage5 = data => {
  const Page5 = generateContentPage5(data);

  return Page5;
};

const generateContentPage5 = data => {
  const headerPage5 = `<div class="header">
  <div class="cinematech-logo">
    <img class="logo" src="https://costarides.idoagency.com/images/cinematech-email-logo1618.png" alt="qcab"
      width="85" height="130" />
  </div>
  <div class="cinematech-title">
    <div class="cinematech-title-first-item">
      <p>Popular Options Available for Seating</p>
    </div>
  </div>
</div>`;

  const contentPage5 = `<div class="content-container-page5">
  <div class="page5-row-section">
    <div class="page5-first-item">

    </div>
    <div class="page5-second-item">

    </div>
    <div class="page5-third-item">

    </div>
    <div class="page5-fourth-item">

    </div>
  </div>
</div>
<div class="page5-content-text">
  <p></p>
</div>`;



  const pageBreak = `<div class="page-break"></div>`;


  return headerPage5 + contentPage5 + footerCinematech + pageBreak;
};

const generatePdfContentCinematechPage6 = data => {
  const Page6 = generateContentPage6(data);

  return Page6;
};

const generateContentPage6 = data => {
  const headerPage6 = `<div class="header">
  <div class="cinematech-logo">
    <img class="logo" src="https://costarides.idoagency.com/images/cinematech-email-logo1618.png" alt="qcab"
      width="85" height="130" />
  </div>
  <div class="cinematech-title">
    <div class="cinematech-title-first-item">
      <p>Other Solutions and Services From CinemaTech</p>
    </div>
  </div>
</div>`;

  const contentPage6 = `<div class="content-container-page6">
  <div class="page6-column-section">
    <div class="page6-first-column">
      <div class="page6-first-column-first-item">
        <ul>
          <li>Theater Room Design Services</li>
          <li>Acoustical Treatments</li>
          <li>Fiber Optic Star Ceilings</li>
          <li>CinemaTech Showrooms</li>
          <li>Concierge Delivery Program</li>
          <li>Showroom Experience Program</li>
          <li>Jobsite Visits</li>
          <li>Initial Seating Layouts</li>
          <li>CAD Seating Layouts</li>
          <li>Project Gallery</li>
          <li>White Glove Installation</li>
          <li>Video Call Meetings</li>
        </ul>
      </div>
      <div class="page6-first-column-second-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>
      <div class="page6-first-column-third-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>

    </div>
    <div class="page6-second-column">
      <div class="page6-second-column-first-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>
      <div class="page6-second-column-second-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>
      <div class="page6-second-column-third-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>
    </div>
    <div class="page6-third-column">
      <div class="page6-third-column-first-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>
      <div class="page6-third-column-second-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>
      <div class="page6-third-column-third-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>
    </div>
  </div>
</div>`;



  const pageBreak = `<div class="page-break"></div>`;


  return headerPage6 + contentPage6 + footerCinematech + pageBreak;
};

const generatePdfContentCinematechPage7 = data => {
  const Page7 = generateContentPage7(data);

  return Page7;
};

const generateContentPage7 = data => {
  const headerPage7 = `<div class="header">
  <div class="cinematech-logo">
    <img class="logo" src="https://costarides.idoagency.com/images/cinematech-email-logo1618.png" alt="qcab"
      width="85" height="130" />
  </div>
  <div class="cinematech-title">
    <div class="cinematech-title-first-item">
      <p>CinemaTech’s Design Services Program (DSP)</p>
    </div>
  </div>
</div>`;

  const contentPage7 = `    <div class="content-container-page7">
  <div class="page7-column-section">
    <div class="page7-first-column">
      <div class="page7-first-column-first-item">
        <p>What is Included?</p>
        <ul>
          <li>Consultation with CinemaTech’s Design Team</li>
          <li>AutoCAD drawings of all walls, reflective ceiling and floor plan;
            including seating layout with sight lines and viewing angles.</li>
          <li>Photo‐quality artisan 3‐Dimensional renderings</li>
          <li>Assistance with materials & finishes that are hand‐selected by
            CinemaTech’s Theater Design Team.</li>
          <li>Fully refundable deposit of $3,950</li>
        </ul>
        <p>*Must purchase a minimum of $25,000 MSRP of seating or acoustic
          treatment.</p>
      </div>
      <div class="page7-first-column-second-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>
    </div>
    <div class="page7-second-column">
      <div class="page7-second-column-first-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>
      <div class="page7-second-column-second-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="380"
          height="220" />
      </div>
    </div>
  </div>
</div>`;

  const pageBreak = `<div class="page-break"></div>`;


  return headerPage7 + contentPage7 + footerCinematech + pageBreak;
};

const generatePdfContentCinematechPage8 = data => {
  const Page8 = generateContentPage8(data);

  return Page8;
};

const generateContentPage8 = data => {
  const headerPage8 = `<div class="header">
  <div class="cinematech-logo">
    <img class="logo" src="https://costarides.idoagency.com/images/cinematech-email-logo1618.png" alt="qcab"
      width="85" height="130" />
  </div>
  <div class="cinematech-title">
    <div class="cinematech-title-first-item">
      <p>CinemaTech’s Acoustic Room System (ARS) Treatment</p>
    </div>
  </div>
</div>`;

  const contentPage8 = `    <div class="content-container-page8">
  <div class="page8-column-section">
    <div class="page8-first-column">
      <div class="page8-first-column-first-item">
        <p>What is Included with CinemaTech ARS?</p>
        <ul>
          <li>Acoustic Room System fabric track retainer</li>
          <li>Acoustic Room System Absorptive, Reflective and Diffusive panels</li>
          <li>Acoustic Room System fabric</li>
          <li>Travel Expenses and Per Diem</li>
          <li>Installation of fabric track, acoustic materials and fabric</li>
          <li>Acoustical Room Analysis</li>
          <li>Project management</li>
          <li>Track adjustment and shimming</li>
          <li>Freight of materials to jobsite</li>
          <li>For more information, please contact CinemaTech at 972-381-1071</li>
        </ul>
      </div>
      <div class="page8-first-column-second-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="420"
          height="370" />
      </div>
    </div>
    <div class="page8-second-column">
      <div class="page8-second-column-first-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="420"
          height="370" />
      </div>
      <div class="page8-second-column-second-item">
        <p>Why Are Acoustics Important?</p>
        <ul>
          <li>Makes the sound in the room bright – not too dead</li>
          <li>Makes speech intelligibility perfect</li>
          <li>Eliminates echoes and boominess</li>
          <li>Makes the room feel comfortable</li>
          <li>Our tunable system maximizes speaker performance and your
            electronic investment</li>
          <li>Absorption + Reflection + Diffusion</li>
          <li>Only adds 1 ¼” thickness to the walls</li>
          <li>Is custom fabricated on-site by certified installation
            technicians for perfect fit and finish</li>
          <li>Is covered with acoustical fabrics that add both beauty and
            functionality to the theater</li>
          <li>Works 365/24/7 behind the scenes and never fails to provide
            enhanced acoustics</li>
          <li>Premiere Acoustical Performance</li>
        </ul>
      </div>
    </div>
  </div>
</div> `;

  const pageBreak = `<div class="page-break"></div>`;


  return headerPage8 + contentPage8 + footerCinematech + pageBreak;
};

const generatePdfContentCinematechPage9 = data => {
  const Page9 = generateContentPage9(data);

  return Page9;
};

const generateContentPage9 = data => {
  const headerPage9 = `<div class="header">
  <div class="cinematech-logo">
    <img class="logo" src="https://costarides.idoagency.com/images/cinematech-email-logo1618.png" alt="qcab"
      width="85" height="130" />
  </div>
  <div class="cinematech-title">
    <div class="cinematech-title-first-item">
      <p>CinemaTech’s Fiber Optic Star Ceiling</p>
    </div>
  </div>
</div>`;

  const contentPage9 = `<div class="content-container-page9">
  <div class="page9-column-section">
    <div class="page9-first-column">
      <div class="page9-first-column-first-item">
        <p>What is Included with CinemaTech’s Star Ceiling?</p>
        <ul>
          <li>Fiber Optic Ceiling</li>
          <li>Random Fiber Placement</li>
          <li>Black Fabric</li>
          <li>Dimmable LED Light Source Illuminator with Variable</li>
          <li>Twinkle Speed</li>
          <li>Materials and Installation Costs</li>
          <li>Site visit to confirm Star Ceiling Measurements</li>
        </ul>
      </div>
      <div class="page9-first-column-second-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="420"
          height="400" />
      </div>
    </div>
    <div class="page9-second-column">
      <div class="page9-second-column-first-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="420"
          height="400" />
      </div>
      <div class="page9-second-column-second-item">
        <img class="logo" src="https://costarides.idoagency.com/images/no-image.png" alt="qcab" width="420"
          height="400" />
      </div>
    </div>
  </div>
</div> `;

  const pageBreak = `<div class="page-break"></div>`;


  return headerPage9 + contentPage9 + footerCinematech + pageBreak;
};

const generatePdfContentCinematechPage10 = data => {
  const Page10 = generateContentPage10(data);

  return Page10;
};

const generateContentPage10 = data => {
  const headerPage10 = `<div class="header">
  <div class="cinematech-logo">
    <img class="logo" src="https://costarides.idoagency.com/images/cinematech-email-logo1618.png" alt="qcab"
      width="270" height="430" />
  </div>
  <div class="cinematech-title">
    <div class="cinematech-title-first-item">
    </div>
  </div>
</div>`;

  const contentPage10 = `  <div class="content-container-page10">
  <div class="contact-information-section">
    <h1 class="contact-information">Contact Information</h1>
    <p>
      CinemaTech Headquarters<br />
      <u>4319 Lindbergh Drive</u><br />
      <u>Addison, TX 75001</u><br />
    </p>
    <p>
      <u>CinemaTech LA Showroom</u><br />
      <u>Pacific Design Center - Blue Building</u><br />
      <u>8687 Melrose Avenue Ste. M26</u><br />
      <u>West Hollywood, CA 90069</u><br />
    </p>
    <p>
      <u>972.381.1071</u><br />
      <u><a href="www.MyCinemaTech.com">www.MyCinemaTech.com</a></u>
    </p>
  </div>
</div>`;

  const pageBreak = `<div class="page-break"></div>`;


  return headerPage10 + contentPage10 + pageBreak;
};

const convertObjectInArray = object => {
  let array = [];
  for (const property in object) {
    array.push(object[property])
  }
  return array
};


const searchObject = (object, search) => {
  let response = null;

  for (const property in object) {
    if (Object.keys(object[property])[0] === search) {
      response = object[property];
    }
  }
  return response
};


export const generateHtml = (data, pageTemplate, uiModel, pdfJson, snapshotModel, gearSelected) => {
  if (!data) new Error('data missing');

  let html = pageTemplate;
  const cinematechContentPage1 = generatePdfContentCinematechPage1(data, uiModel);
  const cinematechContentPage2 = generatePdfContentCinematechPage2(data);
  const cinematechContentPage3 = generatePdfContentCinematechPage3(data, uiModel);
  const cinematechContentPage4 = generatePdfContentCinematechPage4(data, uiModel);
  const cinematechContentPage5 = generatePdfContentCinematechPage5(data);
  const cinematechContentPage6 = generatePdfContentCinematechPage6(data);
  const cinematechContentPage7 = generatePdfContentCinematechPage7(data);
  const cinematechContentPage8 = generatePdfContentCinematechPage8(data);
  const cinematechContentPage9 = generatePdfContentCinematechPage9(data);
  const cinematechContentPage10 = generatePdfContentCinematechPage10(data);
  Object.entries({
    ...data,
    cinematechContentPage1,
    // cinematechContentPage2,
    cinematechContentPage3,
    cinematechContentPage4,
    cinematechContentPage5,
    // cinematechContentPage6,
    // cinematechContentPage7,
    // cinematechContentPage8,
    // cinematechContentPage9,
    cinematechContentPage10

  }).forEach(([key, val]) => {
    const re = new RegExp(`{{ ${key} }}`, 'g');
    html = html.replace(re, val);
  });
  return html;
};

export const htmlToPdf = htmlContent => {
  return new Promise(async (resolve, reject) => {
    try {
      // const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox','--disable-dev-shm-usage'] });

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('print');
      await page.setViewport({ width: 1050, height: 800 });
      const byteArray = await page.pdf({
        width: 1050, height: 800,
        // format: 'A4',
        printBackground: true,
      });

      const buffer = Buffer.from(byteArray, 'binary');
      browser.close();
      resolve(buffer);
    } catch (err) {
      reject(err);
    }
  });
};
