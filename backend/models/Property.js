// models/Property.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title:        { type: String, required: true, trim: true },
    propertyType: { type: String, required: true, trim: true },
    price:        { type: String, required: true, trim: true },
    area:         { type: String, required: true, trim: true },
    city:         { type: String, required: true, trim: true },
    location:     { type: String, required: true, trim: true },
    beds:         { type: Number, default: 0 },
    baths:        { type: Number, default: 0 },
    style:        { type: String, default: '' },
    year:         { type: Number },
    description:  { type: String, default: '' },
    image:        { type: String, default: '' },     // cover image url
    gallery:      [{ type: String }],                // array of image urls
    featured:     { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
