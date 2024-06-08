const express = require('express');
const { body } = require('express-validator');
const plantController = require('../controllers/plantController');
const { authenticate, authorize, authenticateSync } = require('../middlewares/auth');
const { uploadImages } = require('../middlewares/upload');
const { redisCachingMiddleware } = require("../middlewares/redis");

const router = express.Router();

/**
 * @swagger
 * /api/plants/sync:
 *   get:
 *     summary: Get plants updated after a specific timestamp
 *     parameters:
 *       - in: query
 *         name: timestamp
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Updated plants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plant'
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */
router.get('/sync', authenticateSync, redisCachingMiddleware(300), plantController.getUpdatedPlants);

/**
 * @swagger
 * /api/plants/{id}:
 *   get:
 *     summary: Get a plant by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plant'
 *       404:
 *         description: Plant not found
 *       500:
 *         description: Server error
 */
router.get('/:id', redisCachingMiddleware(300), plantController.getPlantById);

/**
 * @swagger
 * /api/plants/{id}:
 *   put:
 *     summary: Update a plant by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               scientificName:
 *                 type: string
 *               commonNames:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               habitat:
 *                 type: string
 *               distribution:
 *                 type: array
 *                 items:
 *                   type: string
 *               medicinalUses:
 *                 type: array
 *                 items:
 *                   type: string
 *               chemicals:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: file
 *     responses:
 *       200:
 *         description: Plant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plant'
 *       400:
 *         description: Invalid plant data
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Access denied
 *       404:
 *         description: Plant not found
 *       500:
 *         description: Server error
 */
router.put(
    '/:id',
    authenticate,
    authorize(['cms']),
    uploadImages,
    plantController.updatePlant
);

/**
 * @swagger
 * /api/plants/{id}:
 *   delete:
 *     summary: Delete a plant by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Plant deleted successfully
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Access denied
 *       404:
 *         description: Plant not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, authorize(['cms']), plantController.deletePlant);

/**
 * @swagger
 * /api/plants:
 *   post:
 *     summary: Create a new plant
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               scientificName:
 *                 type: string
 *               commonNames:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               habitat:
 *                 type: string
 *               distribution:
 *                 type: array
 *                 items:
 *                   type: string
 *               medicinalUses:
 *                 type: array
 *                 items:
 *                   type: string
 *               chemicals:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: file
 *     responses:
 *       201:
 *         description: Plant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plant'
 *       400:
 *         description: Invalid plant data
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.post(
    '/',
    authenticate,
    authorize(['cms']),
    uploadImages,
    [
        body('scientificName').notEmpty().trim(),
        body('commonNames').isArray(),
        body('description').notEmpty().trim(),
        body('habitat').notEmpty().trim(),
        body('distribution').isArray(),
        body('medicinalUses').isArray(),
        body('chemicals').isArray(),
    ],
    plantController.createPlant
);

/**
 * @swagger
 * /api/plants:
 *   get:
 *     summary: Get all plants with pagination, search, and filtering
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of plants per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: habitat
 *         schema:
 *           type: string
 *         description: Habitat filter
 *       - in: query
 *         name: medicinalUse
 *         schema:
 *           type: string
 *         description: Medicinal use filter
 *     responses:
 *       200:
 *         description: Plants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plants:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plant'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get('/', redisCachingMiddleware(300), plantController.getPlants);

module.exports = router;