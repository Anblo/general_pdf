import DynamicsApi from 'dynamics-web-api';
import { AuthenticationContext } from 'adal-node';
import axios from 'axios';

const organization = '3kit';
const resource = `https://${organization}.crm.dynamics.com`;
const apiUrl = `https://${organization}.api.crm.dynamics.com`;
const clientId = 'f0a368cf-6475-4d5d-8014-597c937f9cb6';
const tenantId = '44e64cba-9d0b-41d5-a52d-d8a49a9c33b8';
const authorityUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/token`;
const dynamicsUser = '';
const dynamicsPassword = '';
let dynamicsPriceList = 'Seating List';
let primaryItemsUnit = 'Primary Unit';
const apiKey = "";
let itemPrices = [];
let dynamicsToken = null;
let tokenExpiresIn = null;

const adalContext = new AuthenticationContext(authorityUrl);

function InternalServerError(message) {
    this.name = this.constructor.name;
    this.message = message;

    //include stack trace in error object
    Error.captureStackTrace(this, this.constructor);
}

function NotFoundError(message) {
    this.name = this.constructor.name;
    this.message = message;

    //include stack trace in error object
    Error.captureStackTrace(this, this.constructor);
}

function DynamicsRequestError(error) {
    this.name = this.constructor.name;
    this.message = 'Un expected error communicating with dynamics';
    this.dynamicsError = JSON.stringify(error);

    //include stack trace in error object
    Error.captureStackTrace(this, this.constructor);
}

const acquireToken = function (dynamicsWebApiCallback) {    
    if(dynamicsToken !== null && tokenExpiresIn > Date.now()) {
        console.log('reusing token');
        dynamicsWebApiCallback(dynamicsToken);
        return;
    }   
    
    const buff = Buffer.from(apiKey, 'utf-8');
    const base64Key = buff.toString('base64');    
    axios.get('http://localhost/wordpress/wp-json/api/v1/getData',{
        headers: {
            'x-mycinema-session': base64Key
        }
    }).then(res => {
        const data = res.data;
        console.log(res);
        dynamicsToken = data.auth;
        tokenExpiresIn = Date.now() + ((data.expires - 0) * 1000);
        itemPrices = data.prices;        
        dynamicsPriceList = data.priceList;
        primaryItemsUnit = data.primaryItemsUnit;
        dynamicsWebApiCallback(dynamicsToken);
    }).catch(error => {
        throw new InternalServerError(`Can not get token`);
    });
};
/*
const acquireToken = function (dynamicsWebApiCallback) {
    const adalCallback = function (error, token) {
        if (!error) {
            console.log(token);
            dynamicsWebApiCallback(token);
        } else {
            throw new InternalServerError(`Can not get token`);
        }
    };
    adalContext.acquireTokenWithUsernamePassword(resource, dynamicsUser, dynamicsPassword, clientId, adalCallback);
};*/


const dynamicsWebApi = new DynamicsApi({
    webApiUrl: `${apiUrl}/api/data/v9.2/`,
    onTokenRefresh: acquireToken
});

const getWhoIAm = async () => {
    try{
        const response = await dynamicsWebApi.executeUnboundFunction('WhoAmI');
        return JSON.stringify(response);
    } catch(error) {
        throw  new InternalServerError(error.message);
    }
}

const mapCategoriesToDynamicsCategoriesNames = (category) => {
    switch (category) {
        case 'contactWhoIs':
          return 'syv_category';
        case 'deliverageTime':
          return 'syv_leadtime';
        case 'budgetPerSeat':
          return 'syv_budgetperseat';
        case 'howFound':
          return 'syv_howdidyoufindus';
        case 'opportunityClass':
          return 'syv_class';
        default:
          throw new NotFoundError(`Can not map ${category} to any [dynamics] category`);
    }
}

const getLookupValuesByCategory = async (category) => {
    const dynamicsCategory = mapCategoriesToDynamicsCategoriesNames(category);

    let filter = `attributename eq '${dynamicsCategory}'`;    
    if(category === 'contactWhoIs') {
        filter += " and objecttypecode eq 'contact'";    
    }
    
    try{
        const response = await dynamicsWebApi.retrieveAll("stringmaps", ["attributevalue", "value"], filter);
        const lookups =  response.value.map(stringMap => ({
            label: stringMap.value,
            value: stringMap.attributevalue
        }));
        lookups.unshift({label: '---', value: 0});
        return lookups;
    } catch(error) {        
        throw new DynamicsRequestError(error);
    }
}

const updateItemsListWithCinematechRules = async (model) => {
    let totalOfSeats = 0;
    const dynamicsProductIdsQuery = [`productnumber eq 'WG'`, `productnumber eq 'FREIGHT'`]; // Add white glove and freight product id
    model.items.forEach(item => {
        const itemPriceData = itemPrices.find(itemPrice => itemPrice.family.toLowerCase() === item.family.trim().toLowerCase()
            && itemPrice.sku.toLowerCase() === item.sku.trim().toLowerCase()
        );
        if (itemPriceData) {
            item.price = itemPriceData[item.materialGroup];
            item.id = itemPriceData.familyid + item.sku;
            dynamicsProductIdsQuery.push(`productnumber eq '${item.id}'`);
        }
        totalOfSeats += item.seatsAmmount || 0;
    });
    model.items.push({ id: 'WG', quantity: totalOfSeats }); // Add white glove product id
    model.items.push({ id: 'FREIGHT', quantity: totalOfSeats }); // Add freight product id

    const productNumberFilter = [...new Set(dynamicsProductIdsQuery)].join(' or ');
    const productsIdAndNumber = (await dynamicsWebApi.retrieveAll("products", ["productid", "productnumber"], productNumberFilter)).value;
    model.items.forEach(item => {
        const product = productsIdAndNumber.find(productIdAndNumber => productIdAndNumber.productnumber === item.id);
        item.guid = product?.productid;
    });
}

const createDynamicEntities = async(model) => {
    const contact = {
        "syv_category": model.jobTitle,
        "firstname": model.firstName,
        "lastname": model.lastName,
        "emailaddress1": model.email,
        "mobilephone": model.telephone,
        "address2_country": model.country,
        "address2_stateorprovince": model.stateOrProvince
    };
    const opportunityName = `${model.lastName} ${model.firstName}`;
    
    try{        
        console.log(`START:  ${new Date()}`);
        const contactId = await dynamicsWebApi.create(contact, "contacts");
        
        const opportunitiesClassesPromise = dynamicsWebApi.retrieveAll("stringmaps", ["attributevalue", "value"], `attributename eq 'syv_class'`);
        const updateItemsModelPromise = updateItemsListWithCinematechRules(model);
        
        const priceLevelIdPromise = dynamicsWebApi.retrieveAll("pricelevels", ["pricelevelid"], `name eq '${dynamicsPriceList}'`);
        const unitIdPromise = dynamicsWebApi.retrieveAll("uoms", ["uomid"], `name eq '${primaryItemsUnit}'`);
        
        const opportunitiesClasses = (await opportunitiesClassesPromise).value;
        const mainOpportunityClass = opportunitiesClasses.find(({value}) => value === 'Main Opportunity');
        if(!mainOpportunityClass) throw new 'Main Opportunity Id can not be found';
        
        let opportunity = {
            "name": opportunityName,
            "syv_class": mainOpportunityClass.attributevalue,
            "syv_threekitopportunitynumber": model.threekitId,
            "customerid_contact@odata.bind": `/contacts(${contactId})`
        };
        const mainOpportunityId = await dynamicsWebApi.create(opportunity, "opportunities");

        const seatingOpportunityClass = opportunitiesClasses.find(({value}) => value === 'Seating');
        if(!seatingOpportunityClass) throw new 'Seating Opportunity Id can not be found';
        
        opportunity = {
            "name": opportunityName,
            "syv_class": seatingOpportunityClass.attributevalue,
            "customerid_contact@odata.bind": `/contacts(${contactId})`,
            "syv_MainOpportunity@odata.bind": `/opportunities(${mainOpportunityId})`,
            "syv_budgetperseat": model.budgetPerSeat,
            "syv_leadtime": model.deliverageTime,
            "syv_howdidyoufindus": model.howFound,
            "syv_areyouworkingwithadesigner2": model.designerName,
            "syv_areyouworkingwithanaudiovideointegrator2": model.integratorName,
            "syv_threekitopportunitynumber": model.threekitId
        };
        const seatOpportunityId = await dynamicsWebApi.create(opportunity, "opportunities");

        const priceLevelId = (await priceLevelIdPromise).value[0].pricelevelid
        if(!priceLevelId) throw new `Can not find price level ${dynamicsPriceList}`;
        
        const quote = {
            "name": opportunityName,
            "pricelevelid@odata.bind": `/pricelevels(${priceLevelId})`,
            "customerid_contact@odata.bind": `/contacts(${contactId})`,
            "opportunityid@odata.bind": `/opportunities(${seatOpportunityId})`,            
            "syv_threekitopportunitynumber": model.threekitId
        }
        const quoteId = await dynamicsWebApi.create(quote, "quotes");

        const unitId = (await unitIdPromise).value[0].uomid;
        await updateItemsModelPromise;
        
        console.log(`DONE CREATING ENTITIES: ${new Date()}`);
        dynamicsWebApi.startBatch();
        model.items.forEach(item => {
            const quoteItem = {
            "quoteid@odata.bind": `/quotes(${quoteId})`,
            "productid@odata.bind": `/products(${item.guid})`,
            "uomid@odata.bind" : `uoms(${unitId})`,
            
            "quantity": item.quantity,
            "syv_upholsterymaterial": item.materialSelection,
            "syv_upholsterygroup": item.materialGroup,
            "syv_contraststitchingselection": item.contrastStitchingSelection,
          
            "syv_contrastpipingselection": item.contrastPipingSelection,
            "syv_colorblockingselection": item.colorBlockingSelection,
              
            "syv_nailheadsselection": item.nailHeadsSelection,
            "syv_diamondstitchingselection": item.diamondStitchingSelection,
          
            "syv_cupholders": item.cupholdersSelection,
            "syv_woodtablefinish": item.tableSelection,
          
            "syv_smartarmmaterialselection": item.smartArmSelection
            };

            if(item.price) {
                quoteItem.ispriceoverridden = true;
                quoteItem.priceperunit = item.price              
            }
            if(item.rowNumber && item.slotNumber) {
                item.syv_row = item.rowNumber;
                item.syv_slot = item.slotNumber; 
            }

            dynamicsWebApi.create(quoteItem, "quotedetails");
        });
        console.log(`BUILDING BATCH: ${new Date()}`);
        const addItemsResult = await dynamicsWebApi.executeBatch();
        console.log(`DONE WITH BATCH: ${new Date()}`);

        return JSON.stringify({
            contactId,
            mainOpportunityTypeId: mainOpportunityClass.attributevalue,
            mainOpportunityId,
            seatingOpportunityTypeId: seatingOpportunityClass.attributevalue,
            seatOpportunityId,
            priceLevelId,
            quoteId,
            unitId,
            items: addItemsResult
        });
    } catch(error) {
        console.log(error);
        throw new DynamicsRequestError(error);
    }
}

export const GetWhoIAm = async() => {
    return getWhoIAm();
}

export const GetLookupValues = async (category) => {
    return getLookupValuesByCategory(category)
}

export const SaveCustomerRoomSetupInDynamics = async (requestModel) => {
    return createDynamicEntities(requestModel);
}




