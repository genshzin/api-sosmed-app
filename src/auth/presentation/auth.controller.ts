import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../application/auth.service.js';
import { CreateUserDto } from '../../users/application/dtos/create-user.dto.js';
import { LoginDto } from '../application/dtos/login.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: CreateUserDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}
