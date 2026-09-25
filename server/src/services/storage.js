import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Storage sits behind an adapter so the same admin upload endpoint works with
 * Cloudinary in production and the local filesystem during development.
 * Nothing large is ever written into MongoDB.
 */

let cloudinaryReady = false;

const configureCloudinary = () => {
  if (cloudinaryReady) return;
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw ApiError.badRequest(
      'Cloudinary is selected but its credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
    );
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  cloudinaryReady = true;
};

const safeName = (originalName) => {
  const extension = path.extname(originalName).toLowerCase().slice(0, 10);
  const base = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${base || 'file'}-${crypto.randomBytes(6).toString('hex')}${extension}`;
};

const localAdapter = {
  async upload(file, { folder = 'general' } = {}) {
    const directory = path.resolve(process.cwd(), env.uploadDir, folder);
    await fs.mkdir(directory, { recursive: true });

    const fileName = safeName(file.originalname);
    await fs.writeFile(path.join(directory, fileName), file.buffer);

    return {
      url: `/${env.uploadDir}/${folder}/${fileName}`,
      storageId: `${folder}/${fileName}`,
      driver: 'local',
      fileName: file.originalname,
      bytes: file.size,
    };
  },

  async remove(storageId) {
    if (!storageId) return;
    const target = path.resolve(process.cwd(), env.uploadDir, storageId);
    const root = path.resolve(process.cwd(), env.uploadDir);
    // Guard against traversal via a crafted storage id.
    if (!target.startsWith(root)) return;
    await fs.rm(target, { force: true });
  },
};

const cloudinaryAdapter = {
  async upload(file, { folder = 'general', resourceType = 'auto' } = {}) {
    configureCloudinary();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${env.cloudinary.folder}/${folder}`,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );
      stream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      storageId: result.public_id,
      driver: 'cloudinary',
      fileName: file.originalname,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      resourceType: result.resource_type,
    };
  },

  async remove(storageId, { resourceType = 'image' } = {}) {
    if (!storageId) return;
    configureCloudinary();
    await cloudinary.uploader.destroy(storageId, { resource_type: resourceType });
  },
};

export const storage = {
  get driver() {
    return env.storageDriver === 'cloudinary' ? cloudinaryAdapter : localAdapter;
  },
  upload(file, options) {
    return this.driver.upload(file, options);
  },
  remove(storageId, options) {
    return this.driver.remove(storageId, options).catch((error) => {
      // A failed cleanup should not fail the request that triggered it.
      console.warn('[storage] could not remove file:', error.message);
    });
  },
};
