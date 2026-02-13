import { UserResponseDto } from '../../../users/application/dtos/user-response.dto.js';

export class PostResponseDto {
    id!: string;
    content!: string;
    userId!: string;
    user?: UserResponseDto;
    createdAt!: Date;
    updatedAt!: Date;
}
