import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login.dto';
import { RegisterAuthDto } from './dto/register.dto';
import { I18n, I18nContext } from 'nestjs-i18n';

import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Register */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterAuthDto })
  @ApiCreatedResponse({
    description: 'User registered successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Registered successfully' },
        data: {
          type: 'object',
          description: 'Created user payload',
          example: {
            id: 1,
            email: 'user@example.com',
            first_name: 'Yousef',
            last_name: 'Rezaei',
          },
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'User already exists.' })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  async register(@Body() dto: RegisterAuthDto, @I18n() i18n: I18nContext) {
    const user = await this.authService.register(dto);
    return { message: i18n.t('tr.auth.register.success'), data: user };
  }

  /** Login (OTP flow) */
  @Post('login')
  @ApiOperation({
    summary: 'Login with OTP',
    description:
      'If no code is provided, an OTP is generated and emailed. If code is provided, verifies and returns a JWT.',
  })
  @ApiBody({ type: LoginAuthDto })
  @ApiOkResponse({
    description: 'Either an access token or an OTP-sent message.',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login successful' },
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Verification code sent' },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid code or validation error.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async login(@Body() dto: LoginAuthDto, @I18n() i18n: I18nContext) {
    const result = await this.authService.login(dto);
    // Keep your localized message and avoid key overwrite issues
    return { ...result, message: i18n.t('tr.auth.login.success') };
  }
}
