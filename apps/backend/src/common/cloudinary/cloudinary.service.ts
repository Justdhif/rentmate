import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

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
        this.logger.log(`Cloudinary configured for cloud_name: ${parsed.hostname}`);
      } catch (e: any) {
        this.logger.error(`Invalid CLOUDINARY_URL: ${e.message}`);
      }
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
}
