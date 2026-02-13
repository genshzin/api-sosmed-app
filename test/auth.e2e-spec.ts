
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { UserOrmEntity } from './../src/users/infrastructure/persistence/user.orm-entity';
import { DomainExceptionFilter } from './../src/common/filters/domain-exception.filter';

describe('Auth Module (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepo: any;

    const mockUser = {
        username: 'test_auth_user',
        email: 'test_auth@example.com',
        password: 'password123',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalFilters(new DomainExceptionFilter());
        await app.init();

        dataSource = app.get(DataSource);
        userRepo = dataSource.getRepository(UserOrmEntity);

        await dataSource.manager.query(`DELETE FROM posts WHERE "user_id" IN (SELECT id FROM users WHERE email = '${mockUser.email}')`);
        await userRepo.delete({ email: mockUser.email });
    });

    afterAll(async () => {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.manager.query(`DELETE FROM posts WHERE "user_id" IN (SELECT id FROM users WHERE email = '${mockUser.email}')`);
            await userRepo.delete({ email: mockUser.email });
        }
        await app.close();
    });

    it('/auth/register (POST) - should register a new user', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send(mockUser)
            .expect(201)
            .expect((res) => {
                expect(res.body.user).toBeDefined();
                expect(res.body.user.email).toEqual(mockUser.email);
                expect(res.body.accessToken).toBeDefined();
            });
    });

    it('/auth/register (POST) - should fail if email already exists', async () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send(mockUser)
            .expect(409);
    });

    it('/auth/login (POST) - should login successfully', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: mockUser.email,
                password: mockUser.password,
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.accessToken).toBeDefined();
            });
    });

    it('/auth/login (POST) - should fail with wrong password', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: mockUser.email,
                password: 'wrongpassword',
            })
            .expect(401);
    });
});
