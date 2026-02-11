import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './persistence/user.orm-entity.js';
import { UserRepository } from '../domain/user.repository.interface.js';
import { UserRepositoryImpl } from './persistence/user.repository.impl.js';

@Module({
    imports: [TypeOrmModule.forFeature([UserOrmEntity])],
    providers: [
        {
            provide: UserRepository,
            useClass: UserRepositoryImpl,
        },
    ],
    exports: [UserRepository],
})
export class UserInfrastructureModule { }
