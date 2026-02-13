import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from '../application/user.service.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/infrastructure/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { User, UserRole } from '../domain/user.entity.js';
import { UserResponseDto } from '../application/dtos/user-response.dto.js';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ResponseMessage('Successfully retrieved all users')
    async findAll() {
        const users = await this.userService.findAll();
        return users.map((user) => this.toResponse(user));
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Successfully retrieved user by id')
    async findById(@Param('id') id: string) {
        const user = await this.userService.findById(id);
        return this.toResponse(user);
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
}
