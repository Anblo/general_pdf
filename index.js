import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { PORT, PDF_DEFAULTS_DATA } from './constants.js';
import generatePdf from './pdf-templates/index.js';
import {SaveCustomerRoomSetupInDynamics, GetLookupValues} from './dynamics/index.js';
import { param, check, validationResult } from 'express-validator';

const app = express();

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
        PDF_DEFAULTS_DATA,
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

app.post('/customer_room_setup', [
        check('jobTitle').isNumeric(),
        check('firstName').isAlpha().isLength({ min: 3 }),
        check('lastName').isAlpha().isLength({ min: 3 }),
        check('email').isEmail(),
        check('telephone').notEmpty(),
        check('country').notEmpty(),
        check('stateOrProvince').notEmpty(),
        check('budgetPerSeat').isNumeric(),        
        check('howFound').notEmpty(),
        check('deliverageTime').isNumeric(),
        check("threekitId").isLength({ min: 1 }),
        check('items').isLength({ min: 1 }),
        check("items.*.family").notEmpty(),
        check("items.*.sku").notEmpty(),
        check("items.*.materialGroup").notEmpty(),
        check("items.*.quantity").isNumeric()
    ],
    async (req, res) => {
        res.set({'Content-type': 'application/json'});
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })
        }

        let model = req.body;
        const result = await SaveCustomerRoomSetupInDynamics(model);        
        res.end(result);
});

app.get('/lookup/:category', [param('category').isAlpha()], async (req, res) => {
    res.set({'Content-type': 'application/json'});
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    
    const result = await GetLookupValues(req.params.category);        
    res.end(JSON.stringify(result));

});


app.listen(PORT, () => console.log('listening on port: ', PORT));