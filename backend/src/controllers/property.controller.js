import {propertyService} from '../services/property.service.js';

/**
 * [
  {
    "name": "My New Property",
    "propertyType": "apartment",
    "currency": "USD",
    "address": "123 Main St",
    "city": "Melbourne",
    "state": "Victoria",
    "country": "Australia",
    "postcode": "3000",
    "mobile": "123456789"
  }
]
*/

export const createProperty = async (req, res) => {
    try{
        let {name, propertyType, currency, address, city, state, country, postcode, mobile} = req.body;
        
        if(!name || !propertyType ||  !currency|| !address ||
           !city || !state ||  !country|| !postcode || !mobile){
           return res.status(400).json({
             success: false,
             error: "All fields are mandatory",
             fields : ['name', 'propertyType', 'currency', 'address', 'city', 'state', 'country', 'postcode', 'mobile'],
           });
        }

        
        const property = await propertyService.createProperty(req.body);

        return res.status(201).json({
            status: true, 
            propertyId: property.id,
            data: property,
            message: "Property created successfully"
        });
    }catch(err){
        console.log("Error in create property controller, ", err.message);
        return res.status(err.status || 500).json({
            success: false,
            error: err.message || "Internal server error"
        });
    }
}

export const getProperty = async (req, res) => {
    try{
        const {id} = req.params;
        if(!id){
            return res.status(404).json({
                success: false,
                error: "Property id is required"
            });
        }
        const propertyData = await propertyService.getProperty(id);
        
        return res.status(200).json({
            success: true,
            message: "Propery data fetch successfully",
            data: propertyData,
        });
    }catch(err){
        console.log("Error fetching propery details", err.message);
    }
}