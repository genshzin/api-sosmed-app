import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.interface.js';
import { EntityConflictException, EntityNotFoundException } from '../../common/exceptions/domain-exception.js';
import { CreateUserDto } from './dtos/create-user.dto.js';


@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async register(dto: CreateUserDto): Promise<User> {
        const existing = await this.userRepository.findByEmail(dto.email);
        if (existing) {
            throw new EntityConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = User.create({
            id: uuidv4(),
            username: dto.username,
            email: dto.email,
            password: hashedPassword,
        });

        return this.userRepository.save(user);
    }

    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new EntityNotFoundException('User', id);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.findAll();
    }
}
