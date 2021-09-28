import dotenv from 'dotenv';
dotenv.config();

//  Env variables
export const PORT = process.env.PORT || 5000;

export const PDF_DUMMY_DATA = {
  primaryColor: '#4a7f9e',
  companyLogo: 'https://costarides.idoagency.com/images/cinematech-email-logo1618.png',
  companyData: {
    companyName: '[COMPANY NAME]',
    salesPersonName: '[SALESPERSON NAME]',
    companyAddress1: '[COMPANY ADDRESS LINE 1]',
    companyAddress2: '[COMPANY ADDRESS LINE 2]',
    companyAddress3: '[COMPANY ADDRESS LINE 3]',
    date: '[DATE]',
    configurationName: '[CONFIGURATION NAME]',
    poNumber: '[PO NUMBER]'

  },
  metadata: {
    projectName: '',
    orderNumber: '',
  },
  heading: '',
  userData: {
    name: '',
    address: '',
    contact: '',
    phone: '',
    email: '',
  }
};

export const THREEKIT_CONFIG = {
  TEMPLATE_ID: 21053538,
  ATTACHMENT_NAME: 'Cinematech PDF.pdf',
  THREEKIT_ENV: 'https://preview.threekit.com',
  THREEKIT_AUTH_TOKEN: 'e8d26c36-e722-41ef-917b-bab77f0cea99',
  THREEKIT_ORG_ID: 'eb6756f4-8c6e-417b-8926-8ad4b1ed6895',
  THREEKIT_ASSET_ID:'6b7bdb94-44eb-4713-b192-91c78c2dd967'
};