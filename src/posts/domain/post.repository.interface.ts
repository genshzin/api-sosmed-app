import { Post } from './post.entity.js';

export abstract class PostRepository {
    abstract save(post: Post): Promise<Post>;
    abstract findById(id: string): Promise<Post | null>;
    abstract findAll(): Promise<Post[]>;
    abstract findByUserId(userId: string): Promise<Post[]>;
    abstract delete(id: string): Promise<void>;
}
