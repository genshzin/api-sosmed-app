import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../users/user.module.js';
import { AuthService } from './application/auth.service.js';
import { AuthController } from './presentation/auth.controller.js';
import { JwtStrategy } from './infrastructure/jwt.strategy.js';
import { JwtAuthGuard } from './infrastructure/jwt-auth.guard.js';
import { RolesGuard } from './infrastructure/roles.guard.js';

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
    controllers: [AuthController],
    exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule { }
