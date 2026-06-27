import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import Codes from '../entities/codes.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findUserByEmail: jest.Mock; createUser: jest.Mock };
  let mailService: { sendWelcome: jest.Mock; sendOtp: jest.Mock };
  let codeRepo: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
    };
    mailService = {
      sendWelcome: jest.fn().mockResolvedValue(undefined),
      sendOtp: jest.fn().mockResolvedValue(undefined),
    };
    codeRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'token') } },
        { provide: MailService, useValue: mailService },
        { provide: getRepositoryToken(Codes), useValue: codeRepo },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('rejects an already-registered email', async () => {
      usersService.findUserByEmail.mockResolvedValue({ id: 1 });

      await expect(
        service.register({ email: 'taken@example.com', password: 'pw' } as any),
      ).rejects.toBeInstanceOf(HttpException);
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('normalizes the email and creates the user when new', async () => {
      usersService.findUserByEmail.mockResolvedValue(null);
      usersService.createUser.mockResolvedValue({ id: 1, first_name: 'Yo' });

      const result = await service.register({
        email: '  NEW@Example.com ',
        password: 'pw',
      } as any);

      const created = usersService.createUser.mock.calls[0][0];
      expect(created.email).toBe('new@example.com');
      expect(created.password).not.toBe('pw'); // hashed
      expect(result).toEqual({ id: 1, first_name: 'Yo' });
    });
  });

  describe('login', () => {
    it('throws when the user does not exist', async () => {
      usersService.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com' } as any),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('sends an OTP when no code is supplied', async () => {
      usersService.findUserByEmail.mockResolvedValue({ id: 1, email: 'a@b.c' });

      const result = await service.login({ email: 'a@b.c' } as any);

      expect(mailService.sendOtp).toHaveBeenCalledTimes(1);
      expect(codeRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Verification code sent' });
    });
  });
});
