const request = require('supertest');
const app = require('../src/app');
const Plant = require('../src/models/Plant');

describe('Plant API', () => {
    let token;

    beforeAll(async () => {
        // Create a test user and get the token
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'cmsuser',
                email: 'cmsuser@example.com',
                password: 'password',
                role: 'cms',
            });
        token = response.body.token;
    });

    afterAll(async () => {
        // Clean up the test data
        await Plant.deleteMany({});
    });

    it('should create a new plant', async () => {
        const plantData = {
            scientificName: 'Test Plant',
            commonNames: ['Test Common Name'],
            description: 'Test description',
            habitat: 'Test habitat',
            distribution: ['Test location'],
            medicinalUses: ['Test medicinal use'],
            chemicals: [{ name: 'Test chemical', description: 'Test chemical description' }],
            images: [{ url: 'http://example.com/image.jpg', caption: 'Test image caption' }],
        };

        const response = await request(app)
            .post('/api/plants/cms')
            .set('Authorization', `Bearer ${token}`)
            .send(plantData);

        expect(response.status).toBe(201);
        expect(response.body.scientificName).toBe(plantData.scientificName);
        expect(response.body.commonNames).toEqual(plantData.commonNames);
        expect(response.body.description).toBe(plantData.description);
        expect(response.body.habitat).toBe(plantData.habitat);
        expect(response.body.distribution).toEqual(plantData.distribution);
        expect(response.body.medicinalUses).toEqual(plantData.medicinalUses);
        expect(response.body.chemicals).toEqual(plantData.chemicals);
        expect(response.body.images).toEqual(plantData.images);
    });

    it('should return 401 if user is not authenticated', async () => {
        const response = await request(app).post('/api/plants/cms');
        expect(response.status).toBe(401);
    });

    it('should return 403 if user is not authorized', async () => {
        // Create a non-admin user and get the token
        const response = await request(app)
            .post('/api/register')
            .send({ username: 'testuser2', password: 'testpassword', role: 'user' });
        const nonAdminToken = response.body.token;

        const plantData = {
            scientificName: 'Test Plant',
            commonNames: ['Test Common Name'],
            description: 'Test description',
        };

        const unauthorizedResponse = await request(app)
            .post('/api/plants/cms')
            .set('Authorization', `Bearer ${nonAdminToken}`)
            .send(plantData);

        expect(unauthorizedResponse.status).toBe(403);
    });

    it('should get plants with pagination, search, and filtering', async () => {
        // Create test plants
        const plant1 = new Plant({
            scientificName: 'Test Plant 1',
            commonNames: ['Test Common Name 1'],
            description: 'Test description 1',
            habitat: 'Test habitat 1',
            medicinalUses: ['Test medicinal use 1'],
        });
        const plant2 = new Plant({
            scientificName: 'Test Plant 2',
            commonNames: ['Test Common Name 2'],
            description: 'Test description 2',
            habitat: 'Test habitat 2',
            medicinalUses: ['Test medicinal use 2'],
        });
        await plant1.save();
        await plant2.save();

        const response = await request(app)
            .get('/api/plants?page=1&limit=1&search=Test Plant 1&habitat=Test habitat 1&medicinalUse=Test medicinal use 1')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.plants.length).toBe(1);
        expect(response.body.plants[0].scientificName).toBe('Test Plant 1');
        expect(response.body.totalPages).toBe(1);
        expect(response.body.currentPage).toBe('1');
    });

    it('should get a single plant by ID', async () => {
        // Create a test plant
        const plantData = {
            scientificName: 'Test Plant',
            commonNames: ['Test Common Name'],
            description: 'Test description',
        };
        const plant = await Plant.create(plantData);

        const response = await request(app)
            .get(`/api/plants/${plant._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.scientificName).toBe(plantData.scientificName);
        expect(response.body.commonNames).toEqual(plantData.commonNames);
        expect(response.body.description).toBe(plantData.description);
    });

    it('should update a plant', async () => {
        // Create a test plant
        const plantData = {
            scientificName: 'Test Plant',
            commonNames: ['Test Common Name'],
            description: 'Test description',
        };
        const plant = await Plant.create(plantData);

        const updatedPlantData = {
            scientificName: 'Updated Test Plant',
            commonNames: ['Updated Test Common Name'],
            description: 'Updated test description',
        };

        const response = await request(app)
            .put(`/api/plants/cms/${plant._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedPlantData);

        expect(response.status).toBe(200);
        expect(response.body.scientificName).toBe(updatedPlantData.scientificName);
        expect(response.body.commonNames).toEqual(updatedPlantData.commonNames);
        expect(response.body.description).toBe(updatedPlantData.description);
    });

    it('should delete a plant', async () => {
        // Create a test plant
        const plantData = {
            scientificName: 'Test Plant',
            commonNames: ['Test Common Name'],
            description: 'Test description',
        };
        const plant = await Plant.create(plantData);

        const response = await request(app)
            .delete(`/api/plants/cms/${plant._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(204);

        // Verify that the plant is deleted
        const deletedPlant = await Plant.findById(plant._id);
        expect(deletedPlant).toBeNull();
    });

    it('should get plants updated after a specific timestamp', async () => {
        // Create test plants
        const plant1 = await Plant.create({
            scientificName: 'Test Plant 1',
            commonNames: ['Test Common Name 1'],
            description: 'Test description 1',
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const timestamp = new Date().toISOString();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const plant2 = await Plant.create({
            scientificName: 'Test Plant 2',
            commonNames: ['Test Common Name 2'],
            description: 'Test description 2',
        });

        const response = await request(app)
            .get(`/api/plants/sync?timestamp=${timestamp}`)
            .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0]._id).toBe(plant2._id.toString());
    });
});