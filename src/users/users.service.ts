import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Users from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { AVATAR_UPLOAD_DIR } from 'src/helpers/multer.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly user_repository: Repository<Users>,
  ) {}

  findUserByEmail = async (email: string) => {
    return await this.user_repository.findOne({ where: { email } });
  };

  findAll = async () => {
    return await this.user_repository.find();
  };

  createUser = async (data: CreateUserDto) => {
    const user = this.user_repository.create(data);
    await this.user_repository.save(user);
    return user;
  };

  async updateAvatar(userId: number, filename: string) {
    const user = await this.user_repository.findOne({ where: { id: userId } });
    if (!user) return null;

    // delete old avatar file if exists
    if (user.avatar) {
      try {
        await unlink(join(AVATAR_UPLOAD_DIR, user.avatar));
      } catch (_) {
        // ignore if file not found
      }
    }

    user.avatar = filename;
    await this.user_repository.save(user);
    return user;
  }

  async removeAvatar(userId: number) {
    const user = await this.user_repository.findOne({ where: { id: userId } });
    if (!user) return null;

    if (user.avatar) {
      try {
        await unlink(join(AVATAR_UPLOAD_DIR, user.avatar));
      } catch (_) {}
    }

    user.avatar = null;
    await this.user_repository.save(user);
    return user;
  }
}
