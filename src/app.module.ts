import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './users/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PostModule } from './posts/post.module.js';
import { UserOrmEntity } from './users/infrastructure/persistence/user.orm-entity.js';
import { PostOrmEntity } from './posts/infrastructure/persistence/post.orm-entity.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DATABASE_HOST'),
                port: configService.get<number>('DATABASE_PORT'),
                username: configService.get<string>('DATABASE_USER'),
                password: configService.get<string>('DATABASE_PASSWORD'),
                database: configService.get<string>('DATABASE_NAME'),
                entities: [UserOrmEntity, PostOrmEntity],
                synchronize: true,
            }),
        }),
        UserModule,
        AuthModule,
        PostModule,
    ],
})
export class AppModule { }
