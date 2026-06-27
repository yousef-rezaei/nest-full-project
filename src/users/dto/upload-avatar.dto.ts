import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'PNG, JPEG or WEBP image. Max size 2MB.',
  })
  avatar: any; // Swagger needs 'binary' here; validation is done by pipes/interceptor
}
