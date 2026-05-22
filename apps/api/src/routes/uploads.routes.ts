import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { cloudinary, isCloudinaryConfigured } from '../lib/cloudinary.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const uploadsRouter = Router();
uploadsRouter.use(requireAuth, requireRole('admin', 'staff'));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

uploadsRouter.post('/children/:id/photo', upload.single('photo'), async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        error: 'Cloudinary is not configured. Add CLOUDINARY_* keys to apps/api/.env',
      });
    }

    const id = Number(req.params.id);
    const child = await prisma.child.findFirst({ where: { id, deletedAt: null } });
    if (!child) return res.status(404).json({ error: 'Child not found' });
    if (!req.file) return res.status(400).json({ error: 'Photo file is required' });

    const folder = process.env.CLOUDINARY_FOLDER ?? 'orphacare/children';
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (err, uploaded) => {
          if (err || !uploaded) return reject(err ?? new Error('Upload failed'));
          resolve({ secure_url: uploaded.secure_url, public_id: uploaded.public_id });
        },
      );
      stream.end(req.file.buffer);
    });

    if (child.photoPublicId) {
      await cloudinary.uploader.destroy(child.photoPublicId).catch(() => undefined);
    }

    const updated = await prisma.child.update({
      where: { id },
      data: { photoUrl: result.secure_url, photoPublicId: result.public_id },
    });

    return res.json({ photoUrl: updated.photoUrl });
  } catch (e) {
    return next(e);
  }
});
