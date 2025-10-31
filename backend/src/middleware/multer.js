import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Make sure uploads folder exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user.id; // from authMiddleware
    const postTitle = req.body.title?.replace(/[^\w\d_-]/g, '_') || 'post';
    const type = file.mimetype.startsWith('image') ? 'photo' : 'video';
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${type}_${postTitle}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

export default upload;
