import multer from 'multer';
import path from 'path';

// Setup storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // For now, save to 'uploads/' directory. Ensure it exists!
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Check File Type
const fileFilter = (req: any, file: any, cb: any) => {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images Only! (Just kidding, PDFs only)'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    // fileFilter: fileFilter 
});

export default upload;
