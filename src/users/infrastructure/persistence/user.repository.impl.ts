import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user.entity.js';
import { UserRepository } from '../../domain/user.repository.interface.js';
import { UserOrmEntity } from './user.orm-entity.js';
import { UserMapper } from './user.mapper.js';

@Injectable()
export class UserRepositoryImpl extends UserRepository {
    constructor(
        @InjectRepository(UserOrmEntity)
        private readonly ormRepo: Repository<UserOrmEntity>,
    ) {
        super();
    }

    async findById(id: string): Promise<User | null> {
        const orm = await this.ormRepo.findOne({ where: { id } });
        return orm ? UserMapper.toDomain(orm) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const orm = await this.ormRepo.findOne({ where: { email } });
        return orm ? UserMapper.toDomain(orm) : null;
    }

    async findAll(): Promise<User[]> {
        const orms = await this.ormRepo.find();
        return orms.map(UserMapper.toDomain);
    }

    async save(user: User): Promise<User> {
        const orm = UserMapper.toOrm(user);
        const saved = await this.ormRepo.save(orm);
        return UserMapper.toDomain(saved);
    }
}
