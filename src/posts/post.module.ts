import { Module } from '@nestjs/common';
import { PostService } from './application/post.service.js';
import { PostController } from './presentation/post.controller.js';
import { PostInfrastructureModule } from './infrastructure/post.infrastructure.module.js';

@Module({
    imports: [PostInfrastructureModule],
    controllers: [PostController],
    providers: [PostService],
})
export class PostModule { }
