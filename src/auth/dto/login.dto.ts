import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Type } from 'class-transformer';

export class LoginAuthDto {
  // required email
  @IsEmail({}, { message: i18nValidationMessage('forms.validation.email') })
  @IsNotEmpty({
    message: i18nValidationMessage('forms.validation.required', {
      field: 'Email',
    }),
  })
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  email: string;

  // optional 5-digit OTP (your backend sends OTP if this is absent)
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('forms.validation.number', {
      field: 'Code',
    }),
  })
  @Min(10000, {
    message: i18nValidationMessage('forms.validation.min', {
      field: 'Code',
      min: 10000,
    }),
  })
  @Max(99999, {
    message: i18nValidationMessage('forms.validation.max', {
      field: 'Code',
      max: 99999,
    }),
  })
  @ApiPropertyOptional({
    description:
      '5-digit one-time code (enter this when verifying login). If omitted, an OTP will be emailed.',
    type: Number,
    minimum: 10000,
    maximum: 99999,
    example: 12345,
    nullable: true,
  })
  code?: number;
}
