import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../domain/post.entity.js';
import { PostRepository } from '../domain/post.repository.interface.js';
import { CreatePostDto } from './dtos/create-post.dto.js';
import { UpdatePostDto } from './dtos/update-post.dto.js';
import { EntityNotFoundException, ForbiddenException } from '../../common/exceptions/domain-exception.js';

@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository) { }

    async create(userId: string, dto: CreatePostDto): Promise<Post> {
        const post = Post.create({
            id: uuidv4(),
            content: dto.content,
            userId,
        });

        return this.postRepository.save(post);
    }

    async findAll(): Promise<Post[]> {
        return this.postRepository.findAll();
    }

    async findById(id: string): Promise<Post> {
        const post = await this.postRepository.findById(id);
        if (!post) {
            throw new EntityNotFoundException('Post', id);
        }
        return post;
    }

    async update(id: string, userId: string, dto: UpdatePostDto): Promise<Post> {
        const post = await this.postRepository.findById(id);
        if (!post) throw new EntityNotFoundException('Post', id);

        if (post.userId !== userId) {
            throw new ForbiddenException('You can only update your own posts');
        }

        const updatedPost = post.update({
            content: dto.content,
        });

        return this.postRepository.save(updatedPost);
    }

    async delete(id: string, userId: string): Promise<void> {
        const post = await this.postRepository.findById(id);
        if (!post) throw new EntityNotFoundException('Post', id);

        if (post.userId !== userId) {
            throw new ForbiddenException('You can only delete your own posts');
        }

        await this.postRepository.delete(id);
    }
}
