import { UserRole } from '../../domain/user.entity.js';

export class UserResponseDto {
    id!: string;
    username!: string;
    email!: string;
    role!: UserRole;
    createdAt!: Date;
    updatedAt!: Date;
}
