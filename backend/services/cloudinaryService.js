const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Upload a buffer (from multer memoryStorage) to Cloudinary
const uploadBufferToCloudinary = (buffer, folder = 'student-productivity-hub') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

// Upload a buffer (e.g. a PDF from multer memoryStorage) to Cloudinary as a raw file.
// Kept separate from uploadBufferToCloudinary because PDFs must not go through the
// image transformation pipeline (resize/crop) used for avatars/note images.
const uploadRawBufferToCloudinary = (buffer, folder = 'student-productivity-hub/notes/pdfs', filename = 'document') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`,
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = { uploadBufferToCloudinary, uploadRawBufferToCloudinary, deleteFromCloudinary };
