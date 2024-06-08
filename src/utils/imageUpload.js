const AWS = require('aws-sdk');
const logger = require('./logger');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

/**
 * Upload an image to S3.
 *
 * @param {Object} file - The image file.
 * @returns {Promise<Object>} The uploaded image URL and caption.
 */
exports.uploadImage = async (file) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `plant-images/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const { Location } = await s3.upload(params).promise();
        return { url: Location, caption: file.originalname };
    } catch (err) {
        logger.error('Failed to upload image:', err);
        throw new Error('Failed to upload image');
    }
};