import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdatePostDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    content?: string;
}
