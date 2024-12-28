import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseFile implements PipeTransform {
  transform(files, metadata: ArgumentMetadata) {
    if (files === undefined || files === null) {
      throw new BadRequestException('File expected)');
    }
    return files;
  }
}
