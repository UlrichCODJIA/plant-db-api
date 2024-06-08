const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
    scientificName: {
        type: String,
        required: true,
        unique: true,
    },
    commonNames: [String],
    description: String,
    habitat: String,
    distribution: [String],
    medicinalUses: [String],
    chemicals: [
        {
            name: String,
            description: String,
        },
    ],
    images: [
        {
            url: String,
            caption: String,
        },
    ],
}, { timestamps: true });

plantSchema.index({ scientificName: 'text', commonNames: 'text', description: 'text' });

const Plant = mongoose.model('Plant', plantSchema);

module.exports = Plant;