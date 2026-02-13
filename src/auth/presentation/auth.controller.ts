import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../application/auth.service.js';
import { CreateUserDto } from '../../users/application/dtos/create-user.dto.js';
import { LoginDto } from '../application/dtos/login.dto.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

import { UserResponseDto } from '../../users/application/dtos/user-response.dto.js';
import { User } from '../../users/domain/user.entity.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ResponseMessage('Successfully registered')
    async register(@Body() dto: CreateUserDto) {
        const result = await this.authService.register(dto);
        return {
            user: this.toResponse(result.user),
            accessToken: result.accessToken,
        };
    }

    private toResponse(user: User): UserResponseDto {
        const dto = new UserResponseDto();
        dto.id = user.id;
        dto.username = user.username;
        dto.email = user.email;
        dto.role = user.role;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;
        return dto;
    }

    @Post('login')
    @ResponseMessage('Successfully logged in')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}
