const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadImages = upload.array('images', 10);