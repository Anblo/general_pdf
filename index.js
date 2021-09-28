import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import multer from 'multer';
import bodyParser from 'body-parser';
import { PORT, PDF_DUMMY_DATA } from './constants.js';
import generatePdf from './pdf-templates/index.js';
import { ok } from 'assert';

const app = express();
const upload = multer();

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(morgan('tiny'));
app.use(cors());
app.use(express.static(path.join(__dirname, '../build')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(
    bodyParser.urlencoded({
        limit: '50mb',
        extended: true,
        parameterLimit: 50000,
    })
);



app.post('/pdf/:template', async (req, res) => {
    let pdfJson = null;
    let snapshotModel = null;
    let gearSelected = null;
    let template = req.params.template;
    let uiModel = req.body;

    const html = await generatePdf(
        PDF_DUMMY_DATA,
        template,
        pdfJson,
        snapshotModel,
        gearSelected,
        uiModel
    );
    res.set({
        'Content-type': 'application/pdf',
    });
    res.end(html);
});




app.listen(PORT, () => console.log('listening on port: ', PORT));