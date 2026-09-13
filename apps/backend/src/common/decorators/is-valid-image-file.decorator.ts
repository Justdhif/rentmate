import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// 5MB in binary bytes: 5 * 1024 * 1024 = 5,242,880 bytes.
// In base64 encoding (4 chars per 3 bytes), 5MB ≈ ~7,000,000 characters.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil((MAX_FILE_SIZE_BYTES * 4) / 3) + 1000;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Validates that an image string is either a valid base64 data URI or an image file URL
 * with supported formats (JPG, JPEG, PNG, WEBP) and maximum size <= 5MB.
 */
export function IsValidImageFile(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidImageFile',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (!value || typeof value !== 'string') return false;

          const trimmed = value.trim();

          // Case 1: Base64 Data URI (e.g. data:image/jpeg;base64,/9j/4AAQSkZJRg...)
          if (trimmed.startsWith('data:image/')) {
            const matches = trimmed.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (!matches) {
              return false;
            }

            const mimeType = matches[1].toLowerCase();
            const base64Data = matches[2];

            // Validate MIME type
            if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
              return false;
            }

            // Validate file size limit (~5MB base64 length)
            if (base64Data.length > MAX_BASE64_LENGTH) {
              return false;
            }

            return true;
          }

          // Case 2: Direct image file URL (http:// or https://)
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            try {
              const url = new URL(trimmed);
              const pathname = url.pathname.toLowerCase();
              const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => pathname.endsWith(ext));
              return hasValidExt;
            } catch {
              return false;
            }
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} harus berupa file gambar valid (JPG, JPEG, PNG, WEBP) dengan ukuran maksimal 5MB.`;
        },
      },
    });
  };
}
