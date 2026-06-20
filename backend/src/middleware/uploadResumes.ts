import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.docx', '.doc'];
    const mimeOk = /application\/pdf|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/msword/.test(file.mimetype);

    if (allowed.includes(ext) && mimeOk) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and DOCX files are allowed'));
    }
};

const uploadResumes = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    fileFilter,
}).array('resumes', 20);

export default uploadResumes;
