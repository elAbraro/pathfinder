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
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images and Documents Only!');
    }
}

// Upload Endpoint
router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({ message: err });
        } else {
            if (req.file == undefined) {
                return res.status(400).json({ message: 'No file selected!' });
            } else {
                try {
                    // Create new File document
                    const newFile = new File({
                        filename: req.file.originalname,
                        contentType: req.file.mimetype,
                        data: req.file.buffer, // Buffer from memoryStorage
                        size: req.file.size
                    });

                    await newFile.save();

                    res.json({
                        message: 'File Uploaded to DB!',
                        // Return a URL that points to the serve endpoint
                        filePath: `/api/upload/files/${newFile._id}`,
                        fileName: req.file.originalname,
                        fileId: newFile._id
                    });
                } catch (dbErr) {
                    console.error('DB Save Error:', dbErr);
                    res.status(500).json({ message: 'Failed to save file to database' });
                }
            }
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
