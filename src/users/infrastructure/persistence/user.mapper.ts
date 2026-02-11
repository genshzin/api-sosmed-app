import { User, UserRole } from '../../domain/user.entity.js';
import { UserOrmEntity } from './user.orm-entity.js';

export class UserMapper {
    static toDomain(orm: UserOrmEntity): User {
        return User.create({
            id: orm.id,
            username: orm.username,
            email: orm.email,
            password: orm.password,
            role: orm.role as UserRole,
            createdAt: orm.createdAt,
            updatedAt: orm.updatedAt,
        });
    }

    static toOrm(domain: User): UserOrmEntity {
        const orm = new UserOrmEntity();
        orm.id = domain.id;
        orm.username = domain.username;
        orm.email = domain.email;
        orm.password = domain.password;
        orm.role = domain.role;
        orm.createdAt = domain.createdAt;
        orm.updatedAt = domain.updatedAt;
        return orm;
    }
}
