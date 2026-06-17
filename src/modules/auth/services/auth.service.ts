import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  login(dto: LoginDto) {
    return {
      message: 'login placeholder',
      email: dto.email,
    };
  }
}
