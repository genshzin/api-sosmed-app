import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    ParseUUIDPipe,
} from '@nestjs/common';
import { PostService } from '../application/post.service.js';
import { CreatePostDto } from '../application/dtos/create-post.dto.js';
import { UpdatePostDto } from '../application/dtos/update-post.dto.js';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { PostResponseDto } from '../application/dtos/post-response.dto.js';
import { Post as PostEntity } from '../domain/post.entity.js';
import { UserResponseDto } from '../../users/application/dtos/user-response.dto.js';

@Controller('posts')
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Post('/create')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Post created successfully')
    async create(@Request() req: any, @Body() dto: CreatePostDto) {
        const post = await this.postService.create(req.user.userId, dto);
        return this.toResponse(post);
    }

    @Get()
    @ResponseMessage('All posts retrieved')
    async findAll() {
        const posts = await this.postService.findAll();
        return posts.map((post) => this.toResponse(post));
    }

    @Get(':id')
    @ResponseMessage('Post details retrieved')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        const post = await this.postService.findById(id);
        return this.toResponse(post);
    }

    @Patch(':id/update')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Post updated successfully')
    async update(
        @Request() req: any,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePostDto,
    ) {
        const post = await this.postService.update(id, req.user.userId, dto);
        return this.toResponse(post);
    }

    @Delete(':id/delete')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Post deleted successfully')
    remove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
        return this.postService.delete(id, req.user.userId);
    }

    private toResponse(post: PostEntity): PostResponseDto {
        const dto = new PostResponseDto();
        dto.id = post.id;
        dto.content = post.content;
        dto.userId = post.userId;
        dto.createdAt = post.createdAt;
        dto.updatedAt = post.updatedAt;
        if (post.user) {
            const userDto = new UserResponseDto();
            userDto.id = post.user.id;
            userDto.username = post.user.username;
            userDto.email = post.user.email;
            userDto.role = post.user.role;
            userDto.createdAt = post.user.createdAt;
            userDto.updatedAt = post.user.updatedAt;
            dto.user = userDto;
        }
        return dto;
    }
}
