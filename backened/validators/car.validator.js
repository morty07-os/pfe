import Joi from 'joi';

export const carSchema = Joi.object({
    make: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1886).required(),
});
