const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const auth = require('../middleware/auth'); // Optional: if we want to secure file access

// Usage: Memory Storage to keep file in buffer
const storage = multer.memoryStorage();

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file'); // expecting 'file' field

// Check File Type
function checkFileType(file, cb) {
    // Allowed extensions
    const allowedExtensions = /^\.(jpeg|jpg|png|gif|pdf|doc|docx)$/i;
    const isExtensionAllowed = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    // Allowed mimetypes - expanded for better compatibility
    const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream' // Sometimes reported for Word docs
    ];

    const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);

    if (isExtensionAllowed && (isMimeAllowed || file.mimetype.startsWith('image/'))) {
        return cb(null, true);
    } else {
        console.error(`Rejected File: ${file.originalname}, Mime: ${file.mimetype}`);
        cb(new Error(`Invalid file type: ${path.extname(file.originalname)} (${file.mimetype}). Images and Documents Only!`));
    }
}

// Upload Endpoint
router.post('/', auth, (req, res) => {
    console.log('Upload Request Received from:', req.student?.email);
    console.log('Headers:', req.headers);
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer/Validation Error:', err);
            return res.status(400).json({ message: err.message || err });
        }
        if (!req.file) {
            console.error('No File in Multer Request');
            return res.status(400).json({ message: 'No file selected!' });
        }

        console.log('File received successfully:', req.file.originalname, 'Size:', req.file.size);

        try {
            // Create new File document
            const newFile = new File({
                filename: req.file.originalname,
                contentType: req.file.mimetype,
                data: req.file.buffer, // Buffer from memoryStorage
                size: req.file.size,
                uploadedBy: req.student._id
            });

            await newFile.save();

            res.json({
                message: 'File Uploaded successfully!',
                filePath: `/api/upload/files/${newFile._id}`,
                fileName: req.file.originalname,
                fileId: newFile._id
            });
        } catch (dbErr) {
            console.error('DB Save Error:', dbErr);
            res.status(500).json({ message: 'Failed to save file to database' });
        }
    });
});

// Serve File Endpoint
router.get('/files/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', `inline; filename="${file.filename}"`);
        res.send(file.data);
    } catch (err) {
        console.error('File Retrieval Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
