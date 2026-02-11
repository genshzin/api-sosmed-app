import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../users/application/user.service.js';
import { CreateUserDto } from '../../users/application/dtos/create-user.dto.js';
import { UnauthorizedException } from '../../common/exceptions/domain-exception.js';
import { LoginDto } from './dtos/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: CreateUserDto) {
        const user = await this.userService.register(dto);
        const token = this.generateToken(user.id, user.role);
        return { user, accessToken: token };
    }

    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.generateToken(user.id, user.role);
        return {
            accessToken: token,
        };
    }

    private generateToken(userId: string, role: string): string {
        return this.jwtService.sign({ sub: userId, role });
    }
}
