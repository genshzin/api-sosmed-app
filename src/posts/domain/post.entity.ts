import { User } from '../../users/domain/user.entity.js';

export class Post {
    readonly id: string;
    readonly content: string;
    readonly userId: string;
    readonly user?: User;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    private constructor(props: {
        id: string;
        content: string;
        userId: string;
        user?: User;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = props.id;
        this.content = props.content;
        this.userId = props.userId;
        this.user = props.user;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    static create(props: {
        id: string;
        content: string;
        userId: string;
        user?: User;
        createdAt?: Date;
        updatedAt?: Date;
    }): Post {
        return new Post({
            id: props.id,
            content: props.content,
            userId: props.userId,
            user: props.user,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    update(props: { content?: string }): Post {
        return new Post({
            ...this,
            content: props.content ?? this.content,
            updatedAt: new Date(),
        });
    }
}
