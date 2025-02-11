import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { UnsupportedMediaTypeException } from '@nestjs/common';

export function ApiFile(
  fieldName: string = 'file',
  required: boolean = true,
  localOptions?: MulterOptions,
) {
  return applyDecorators(
    UseInterceptors(FileInterceptor(fieldName, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [fieldName] : [],
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}

export function ApiImageFile(fieldName: string, required: boolean = true) {
  return ApiFile(fieldName, required, {
    fileFilter: fileMimetypeFilter('image'),
  });
}

export function ApiCsvFile(fieldName: string, required: boolean = true) {
  return ApiFile(fieldName, required, {
    fileFilter: fileMimetypeFilter('csv'),
  });
}


export function fileMimetypeFilter(...mimetypes: string[]) {
  return (
      req,
      file: any,
      callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (mimetypes.some((m) => file.mimetype.includes(m))) {
      callback(null, true);
    } else {
      callback(
          new UnsupportedMediaTypeException(
              `File type is not matching: ${mimetypes.join(', ')}`,
          ),
          false,
      );
    }
  };
}