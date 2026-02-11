import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from '../application/user.service.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/infrastructure/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../domain/user.entity.js';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ResponseMessage('Successfully retrieved all users')
    async findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Successfully retrieved user by id')
    async findById(@Param('id') id: string) {
        return this.userService.findById(id);
    }
}
