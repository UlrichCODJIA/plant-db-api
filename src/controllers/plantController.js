const { validationResult } = require('express-validator');
const Plant = require('../models/Plant');
const logger = require('../utils/logger');
const { uploadImage } = require('../utils/imageUpload');

/**
 * Create a new plant.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.createPlant = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    };
    try {
        const { scientificName, commonNames, description, habitat, distribution, medicinalUses, chemicals } = req.body;
        const images = req.files;

        const uploadedImages = await Promise.all(images.map(uploadImage));

        const plant = new Plant({
            scientificName,
            commonNames,
            description,
            habitat,
            distribution,
            medicinalUses,
            chemicals,
            images: uploadedImages,
        });

        await plant.save();

        res.status(201).json(plant);
    } catch (err) {
        logger.error('Failed to create plant:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get all plants with pagination, search, and filtering.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getPlants = async (req, res) => {
    const { page = 1, limit = 10, search, habitat, medicinalUse } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};

    if (search) {
        query.$or = [
            { scientificName: { $regex: search, $options: 'i' } },
            { commonNames: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    if (habitat) {
        query.habitat = { $regex: habitat, $options: 'i' };
    }

    if (medicinalUse) {
        query.medicinalUses = { $regex: medicinalUse, $options: 'i' };
    }

    try {
        const plants = await Plant.find(query).skip(skip).limit(parseInt(limit));
        const totalPlants = await Plant.countDocuments(query);

        res.json({
            plants,
            totalPages: Math.ceil(totalPlants / parseInt(limit)),
            currentPage: parseInt(page),
        });
    } catch (err) {
        logger.error('Failed to get plants:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get a plant by ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getPlantById = async (req, res) => {
    const { id } = req.params;

    try {
        const plant = await Plant.findById(id);

        if (!plant) {
            return res.status(404).json({ error: 'Plant not found' });
        }

        res.json(plant);
    } catch (err) {
        logger.error('Failed to get plant:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Update a plant by ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.updatePlant = async (req, res) => {
    const { id } = req.params;
    const { scientificName, commonNames, description, habitat, distribution, medicinalUses, chemicals } = req.body;
    const images = req.files;

    try {
        const plant = await Plant.findById(id);

        if (!plant) {
            return res.status(404).json({ error: 'Plant not found' });
        }

        const uploadedImages = await Promise.all(images.map(uploadImage));

        plant.scientificName = scientificName || plant.scientificName;
        plant.commonNames = commonNames || plant.commonNames;
        plant.description = description || plant.description;
        plant.habitat = habitat || plant.habitat;
        plant.distribution = distribution || plant.distribution;
        plant.medicinalUses = medicinalUses || plant.medicinalUses;
        plant.chemicals = chemicals || plant.chemicals;
        plant.images = uploadedImages.length > 0 ? uploadedImages : plant.images;

        await plant.save();

        res.json(plant);
    } catch (err) {
        logger.error('Failed to update plant:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Delete a plant by ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.deletePlant = async (req, res) => {
    const { id } = req.params;

    try {
        const plant = await Plant.findByIdAndDelete(id);

        if (!plant) {
            return res.status(404).json({ error: 'Plant not found' });
        }

        res.sendStatus(204);
    } catch (err) {
        logger.error('Failed to delete plant:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get plants updated after a specific timestamp.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
exports.getUpdatedPlants = async (req, res) => {
    const { timestamp } = req.query;

    try {
        let plants = [];
        if (timestamp) {
            plants = await Plant.find({ updatedAt: { $gt: new Date(timestamp) } });
        } else {
            plants = await Plant.find({});
        }
        res.json(plants);
    } catch (err) {
        logger.error('Failed to get updated plants:', err);
        res.status(500).json({ error: 'Server error' });
    }
};