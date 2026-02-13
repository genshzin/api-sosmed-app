import { Post } from '../../domain/post.entity.js';
import { PostOrmEntity } from './post.orm-entity.js';
import { UserMapper } from '../../../users/infrastructure/persistence/user.mapper.js';

export class PostMapper {
    static toDomain(orm: PostOrmEntity): Post {
        return Post.create({
            id: orm.id,
            content: orm.content,
            userId: orm.userId,
            user: orm.user ? UserMapper.toDomain(orm.user) : undefined,
            createdAt: orm.createdAt,
            updatedAt: orm.updatedAt,
        });
    }

    static toOrm(domain: Post): PostOrmEntity {
        const orm = new PostOrmEntity();
        orm.id = domain.id;
        orm.content = domain.content;
        orm.userId = domain.userId;
        orm.createdAt = domain.createdAt;
        orm.updatedAt = domain.updatedAt;
        return orm;
    }
}
