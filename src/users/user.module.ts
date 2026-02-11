import { Module } from '@nestjs/common';
import { UserInfrastructureModule } from './infrastructure/user.infrastructure.module.js';
import { UserService } from './application/user.service.js';
import { UserController } from './presentation/user.controller.js';

@Module({
    imports: [UserInfrastructureModule],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule { }
