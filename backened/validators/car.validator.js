import Joi from 'joi';

export const carSchema = Joi.object({
    make: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1886).required(),
    pricePerDay: Joi.number().positive().required(),
    location: Joi.string().required(),
    description: Joi.string().optional(),
    color: Joi.string().required(),
    fuelType: Joi.string().valid("Petrol", "Diesel", "Electric", "Hybrid").required(),
    seatingCapacity: Joi.number().integer().positive().required(),
});
