import { propertyService } from '../services/property.service.js';

export const createProperty = async (req, res, next) => {
  try {
    const created = await propertyService.createProperty(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

export const getPropertyInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prop = await propertyService.getProperty(id);
    res.json({ success: true, data: prop });
  } catch (err) {
    next(err);
  }
};
