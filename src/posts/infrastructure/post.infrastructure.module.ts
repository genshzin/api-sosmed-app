import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostOrmEntity } from './persistence/post.orm-entity.js';
import { PostRepository } from '../domain/post.repository.interface.js';
import { PostRepositoryImpl } from './persistence/post.repository.impl.js';
import { UserModule } from '../../users/user.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([PostOrmEntity]),
        UserModule, 
    ],
    providers: [
        {
            provide: PostRepository,
            useClass: PostRepositoryImpl,
        },
    ],
    exports: [PostRepository],
})
export class PostInfrastructureModule { }
