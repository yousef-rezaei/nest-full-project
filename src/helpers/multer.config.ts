// src/helpers/multer.config.ts
import { diskStorage } from 'multer';
import type { FileFilterCallback, Options } from 'multer';
import type { Express, Request } from 'express';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const AVATAR_UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars');

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export const multerOptions: Options = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      ensureDir(AVATAR_UPLOAD_DIR);
      cb(null, AVATAR_UPLOAD_DIR);
    },
    filename: (
      req: Request & { user?: { id?: number | string } },
      file: Express.Multer.File,
      cb,
    ) => {
      const userId = String(req.user?.id ?? 'anon');
      const unique = Date.now();
      const ext = (extname(file.originalname) || '').toLowerCase();
      cb(null, `${userId}-${unique}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const ok = /image\/(png|jpeg|jpg|webp)$/i.test(file.mimetype);
    if (!ok) return cb(new Error('Only PNG/JPEG/WEBP images are allowed'));
    cb(null, true);
  },
};
