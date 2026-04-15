const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Property = require('../models/Property');
const protect = require('../middleware/auth');

const router = express.Router();

// ── Multer storage ────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'));
    }
});

const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 20 }
]);

function buildImageUrl(req, filename) {
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

// ── GET /api/properties  (public – used by frontend) ─────────────────────────
router.get('/', async (req, res) => {
    try {
        const props = await Property.find().sort({ createdAt: -1 });
        res.json(props);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── GET /api/properties/featured  (public) ───────────────────────────────────
router.get('/featured', async (req, res) => {
    try {
        const props = await Property.find({ featured: true }).sort({ createdAt: -1 });
        res.json(props);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── GET /api/properties/:id  (public) ────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const prop = await Property.findById(req.params.id);
        if (!prop) return res.status(404).json({ message: 'Property not found' });
        res.json(prop);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── POST /api/properties  (admin only) ───────────────────────────────────────
router.post('/', protect, (req, res) => {
    uploadFields(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        try {
            const files = req.files || {};
            const imageUrl = files.image ? buildImageUrl(req, files.image[0].filename) : '';
            const galleryUrls = (files.gallery || []).map(f => buildImageUrl(req, f.filename));

            const prop = await Property.create({
                ...req.body,
                beds: Number(req.body.beds) || 0,
                baths: Number(req.body.baths) || 0,
                year: req.body.year ? Number(req.body.year) : undefined,
                featured: req.body.featured === 'true',
                image: imageUrl,
                gallery: galleryUrls
            });
            res.status(201).json(prop);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    });
});

// ── PUT /api/properties/:id  (admin only) ─────────────────────────────────────
router.put('/:id', protect, (req, res) => {
    uploadFields(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        try {
            const prop = await Property.findById(req.params.id);
            if (!prop) return res.status(404).json({ message: 'Property not found' });

            const files = req.files || {};

            // Cover image: use new upload if provided, else keep existing
            if (files.image) {
                prop.image = buildImageUrl(req, files.image[0].filename);
            }

            // Gallery: start from remaining existing URLs (sent by admin panel)
            let gallery = [];
            if (req.body.galleryUrls) {
                try { gallery = JSON.parse(req.body.galleryUrls); } catch { gallery = []; }
            }
            // Append newly uploaded gallery images
            if (files.gallery) {
                gallery = gallery.concat(files.gallery.map(f => buildImageUrl(req, f.filename)));
            }
            prop.gallery = gallery;

            // Update scalar fields
            const fields = ['title','propertyType','price','area','city','location','style','description'];
            fields.forEach(k => { if (req.body[k] !== undefined) prop[k] = req.body[k]; });
            if (req.body.beds !== undefined) prop.beds = Number(req.body.beds) || 0;
            if (req.body.baths !== undefined) prop.baths = Number(req.body.baths) || 0;
            if (req.body.year !== undefined) prop.year = req.body.year ? Number(req.body.year) : undefined;
            if (req.body.featured !== undefined) prop.featured = req.body.featured === 'true';

            await prop.save();
            res.json(prop);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    });
});

// ── DELETE /api/properties/:id  (admin only) ─────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
    try {
        const prop = await Property.findByIdAndDelete(req.params.id);
        if (!prop) return res.status(404).json({ message: 'Property not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
