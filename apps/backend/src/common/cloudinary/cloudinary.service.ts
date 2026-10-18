import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');
    if (cloudinaryUrl) {
      try {
        const parsed = new URL(cloudinaryUrl);
        cloudinary.config({
          cloud_name: parsed.hostname,
          api_key: parsed.username,
          api_secret: parsed.password,
          secure: true,
        });
        this.isConfigured = true;
        this.logger.log(`Cloudinary configured for cloud_name: ${parsed.hostname}`);
      } catch (e: any) {
        this.logger.error(`Invalid CLOUDINARY_URL: ${e.message}`);
      }
    } else {
      this.logger.warn(
        'CLOUDINARY_URL is not configured. Cloudinary media uploads will be skipped in this environment.',
      );
    }
  }

  /**
   * Upload an image from a remote URL (e.g. Google profile picture) to Cloudinary
   */
  async uploadImageFromUrl(
    imageUrl: string,
    folder = 'rentmate/avatars',
    publicId?: string,
  ): Promise<string | null> {
    if (!this.isConfigured) {
      this.logger.warn('Skipping uploadImageFromUrl: Cloudinary is not configured.');
      return null;
    }

    try {
      this.logger.log(`Uploading image to Cloudinary: ${imageUrl}`);
      const options: any = {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 256, height: 256, crop: 'fill', gravity: 'face' },
        ],
      };

      if (publicId) {
        options.public_id = publicId;
        options.overwrite = true;
        options.invalidate = true;
      }

      const result: UploadApiResponse = await cloudinary.uploader.upload(
        imageUrl,
        options,
      );

      this.logger.log(`Image successfully uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error: any) {
      this.logger.error(
        `Failed to upload image to Cloudinary from URL (${imageUrl}): ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Upload an image buffer (from Multer/FileInterceptor) to Cloudinary
   */
  async uploadImageBuffer(
    buffer: Buffer,
    folder = 'rentmate/avatars',
    publicId?: string,
  ): Promise<string | null> {
    if (!this.isConfigured) {
      this.logger.warn('Skipping uploadImageBuffer: Cloudinary is not configured.');
      return null;
    }

    try {
      this.logger.log(`Uploading image buffer to Cloudinary (folder: ${folder})...`);
      const options: any = {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        ],
      };

      if (publicId) {
        options.public_id = publicId;
        options.overwrite = true;
        options.invalidate = true;
      }

      return new Promise<string | null>((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error || !result) {
              this.logger.error(`Cloudinary stream upload error: ${error?.message}`);
              resolve(null);
            } else {
              this.logger.log(`Image buffer successfully uploaded: ${result.secure_url}`);
              resolve(result.secure_url);
            }
          },
        );

        uploadStream.end(buffer);
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to upload image buffer to Cloudinary: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Upload a base64 DataURL or string to Cloudinary
   */
  async uploadBase64(
    base64Data: string,
    folder = 'rentmate/avatars',
    publicId?: string,
  ): Promise<string | null> {
    if (!this.isConfigured) {
      this.logger.warn('Skipping uploadBase64: Cloudinary is not configured.');
      return null;
    }

    try {
      this.logger.log(`Uploading base64 image to Cloudinary (folder: ${folder})...`);
      const options: any = {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        ],
      };

      if (publicId) {
        options.public_id = publicId;
        options.overwrite = true;
        options.invalidate = true;
      }

      const result: UploadApiResponse = await cloudinary.uploader.upload(
        base64Data,
        options,
      );

      this.logger.log(`Base64 image successfully uploaded: ${result.secure_url}`);
      return result.secure_url;
    } catch (error: any) {
      this.logger.error(
        `Failed to upload base64 image to Cloudinary: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
