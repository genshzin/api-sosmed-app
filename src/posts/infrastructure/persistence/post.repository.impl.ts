import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../domain/post.entity.js';
import { PostRepository } from '../../domain/post.repository.interface.js';
import { PostOrmEntity } from './post.orm-entity.js';
import { PostMapper } from './post.mapper.js';

@Injectable()
export class PostRepositoryImpl extends PostRepository {
    constructor(
        @InjectRepository(PostOrmEntity)
        private readonly ormRepo: Repository<PostOrmEntity>,
    ) {
        super();
    }

    async save(post: Post): Promise<Post> {
        const orm = PostMapper.toOrm(post);
        const saved = await this.ormRepo.save(orm);
        return PostMapper.toDomain(saved);
    }

    async findById(id: string): Promise<Post | null> {
        const orm = await this.ormRepo.findOne({
            where: { id },
            relations: ['user'],
        });
        return orm ? PostMapper.toDomain(orm) : null;
    }

    async findAll(): Promise<Post[]> {
        const orms = await this.ormRepo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        return orms.map(PostMapper.toDomain);
    }

    async findByUserId(userId: string): Promise<Post[]> {
        const orms = await this.ormRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return orms.map(PostMapper.toDomain);
    }

    async delete(id: string): Promise<void> {
        await this.ormRepo.delete(id);
    }
}
