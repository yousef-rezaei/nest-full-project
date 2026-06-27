import type { Express } from 'express';
import {
  Controller,
  Get,
  UseGuards,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/helpers/multer.config';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { UploadAvatarResponseDto } from './dto/upload-avatar-response.dto';
import { DeleteAvatarResponseDto } from './dto/delete-avatar-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /** List users (localized message) */
  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ description: 'Users list retrieved successfully.' })
  async findAll(@I18n() i18n: I18nContext) {
    const data = await this.userService.findAll();
    return { message: i18n.t('tr.users.title'), data };
  }

  /** Upload or replace current user's avatar */
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  @ApiOperation({ summary: 'Upload or replace user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadAvatarDto })
  @ApiOkResponse({
    description: 'Avatar uploaded successfully.',
    type: UploadAvatarResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { id: number } },
  ): Promise<UploadAvatarResponseDto> {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }
    const updated = await this.userService.updateAvatar(
      req.user.id,
      file.filename,
    );
    if (!updated) throw new NotFoundException('User not found');

    return {
      message: 'Avatar uploaded',
      avatar: {
        filename: file.filename,
        url: `/uploads/avatars/${file.filename}`,
      },
    };
  }

  /** Delete current user's avatar */
  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiOkResponse({
    description: 'Avatar deleted successfully.',
    type: DeleteAvatarResponseDto,
  })
  async deleteAvatar(
    @Request() req: { user: { id: number } },
  ): Promise<DeleteAvatarResponseDto> {
    const updated = await this.userService.removeAvatar(req.user.id);
    if (!updated)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return { message: 'Avatar deleted' };
  }
}
