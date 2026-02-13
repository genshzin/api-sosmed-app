
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { UserOrmEntity } from './../src/users/infrastructure/persistence/user.orm-entity';
import { UserRole } from './../src/users/domain/user.entity';
import { DomainExceptionFilter } from './../src/common/filters/domain-exception.filter';

describe('Users Module (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepo: any;

    const adminUser = {
        username: 'test_users_admin',
        email: 'test_users_admin@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
    };

    const regularUser = {
        username: 'test_users_regular',
        email: 'test_users_regular@example.com',
        password: 'password123',
        role: UserRole.USER,
    };

    let adminToken: string;
    let regularToken: string;
    let adminUserId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalFilters(new DomainExceptionFilter());

        await app.init();

        dataSource = app.get(DataSource);
        userRepo = dataSource.getRepository(UserOrmEntity);

        await userRepo.delete({ email: adminUser.email });
        await userRepo.delete({ email: regularUser.email });

        const adminRes = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                username: adminUser.username,
                email: adminUser.email,
                password: adminUser.password,
            });

        adminToken = adminRes.body.accessToken;
        adminUserId = adminRes.body.user.id;

        await dataSource.manager.query(`UPDATE users SET role = 'admin' WHERE id = '${adminUserId}'`);

        const adminLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: adminUser.email,
                password: adminUser.password,
            });

        adminToken = adminLoginRes.body.accessToken;

        const userRes = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                username: regularUser.username,
                email: regularUser.email,
                password: regularUser.password,
            });

        regularToken = userRes.body.accessToken;
    });

    afterAll(async () => {
        if (dataSource && dataSource.isInitialized) {
            await userRepo.delete({ email: adminUser.email });
            await userRepo.delete({ email: regularUser.email });
        }
        await app.close();
    });

    it('/users (GET) - allow access with ADMIN role', () => {
        return request(app.getHttpServer())
            .get('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const firstUser = res.body[0];
                expect(firstUser.email).toBeDefined();
                expect(firstUser.role).toBeDefined();
            });
    });

    it('/users (GET) - forbid access with USER role', () => {
        return request(app.getHttpServer())
            .get('/users')
            .set('Authorization', `Bearer ${regularToken}`)
            .expect(403);
    });

    it('/users/:id (GET) - allow access to get user details', () => {
        return request(app.getHttpServer())
            .get(`/users/${adminUserId}`)
            .set('Authorization', `Bearer ${regularToken}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(adminUserId);
                expect(res.body.email).toEqual(adminUser.email);
            });
    });

    it('/users/:id (GET) - should fail if unauthenticated', () => {
        return request(app.getHttpServer())
            .get(`/users/${adminUserId}`)
            .expect(401);
    });

    it('/users/:id (GET) - should fail if token is invalid', () => {
        return request(app.getHttpServer())
            .get(`/users/${adminUserId}`)
            .set('Authorization', 'Bearer invalid_token_here')
            .expect(401);
    });
});
