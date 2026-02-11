import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../application/auth.service.js';
import { CreateUserDto } from '../../users/application/dtos/create-user.dto.js';
import { LoginDto } from '../application/dtos/login.dto.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ResponseMessage('Successfully registered')
    async register(@Body() dto: CreateUserDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @ResponseMessage('Successfully logged in')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}
