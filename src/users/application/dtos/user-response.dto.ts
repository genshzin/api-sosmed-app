import { User, UserRole } from '../../domain/user.entity.js';

export class UserResponseDto {
    id!: string;
    username!: string;
    email!: string;
    role!: UserRole;
    createdAt!: Date;
    updatedAt!: Date;

    static fromDomain(user: User): UserResponseDto {
        const dto = new UserResponseDto();
        dto.id = user.id;
        dto.username = user.username;
        dto.email = user.email;
        dto.role = user.role;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;
        return dto;
    }
}
