export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export class User {
    readonly id: string;
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly role: UserRole;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    private constructor(props: {
        id: string;
        username: string;
        email: string;
        password: string;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = props.id;
        this.username = props.username;
        this.email = props.email;
        this.password = props.password;
        this.role = props.role;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    static create(props: {
        id: string;
        username: string;
        email: string;
        password: string;
        role?: UserRole;
        createdAt?: Date;
        updatedAt?: Date;
    }): User {
        return new User({
            id: props.id,
            username: props.username,
            email: props.email,
            password: props.password,
            role: props.role ?? UserRole.USER,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }
}
