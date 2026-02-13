import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { UserOrmEntity } from './../src/users/infrastructure/persistence/user.orm-entity';
import { DomainExceptionFilter } from './../src/common/filters/domain-exception.filter';

describe('Posts Module (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    const mockUser = {
        username: 'test_posts_e2e',
        email: 'test_posts@example.com',
        password: 'password123',
    };

    let accessToken: string;
    let userId: string;
    let createdPostId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalFilters(new DomainExceptionFilter());
        await app.init();

        dataSource = app.get(DataSource);
        const userRepo = dataSource.getRepository(UserOrmEntity);

        // Cleanup
        await dataSource.manager.query(`DELETE FROM posts WHERE "user_id" IN (SELECT id FROM users WHERE email = '${mockUser.email}')`);
        await userRepo.delete({ email: mockUser.email });

        // Register and login to get real token
        const regRes = await request(app.getHttpServer())
            .post('/auth/register')
            .send(mockUser);

        accessToken = regRes.body.accessToken;
        userId = regRes.body.user.id;
    });

    afterAll(async () => {
        if (dataSource && dataSource.isInitialized) {
            const userRepo = dataSource.getRepository(UserOrmEntity);
            await dataSource.manager.query(`DELETE FROM posts WHERE "user_id" = '${userId}'`);
            await userRepo.delete({ email: mockUser.email });
        }
        await app.close();
    });

    it('/posts/create (POST) - should create a post with valid token', () => {
        return request(app.getHttpServer())
            .post('/posts/create')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Hello',
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.content).toEqual('Hello');
                expect(res.body.userId).toEqual(userId);
                expect(res.body.id).toBeDefined();
                createdPostId = res.body.id;
            });
    });

    it('/posts/create (POST) - should fail without token', () => {
        return request(app.getHttpServer())
            .post('/posts/create')
            .send({ content: 'Should fail' })
            .expect(401);
    });

    it('/posts (GET) - should return array of posts (public access)', () => {
        return request(app.getHttpServer())
            .get('/posts')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
            });
    });

    it('/posts/:id (GET) - should return a single post (public access)', () => {
        return request(app.getHttpServer())
            .get(`/posts/${createdPostId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdPostId);
                expect(res.body.content).toEqual('Hello');
            });
    });

    it('/posts/:id/update (PATCH) - should update own post', () => {
        return request(app.getHttpServer())
            .patch(`/posts/${createdPostId}/update`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Updated with Token',
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.content).toEqual('Updated with Token');
            });
    });

    it('/posts/:id/update (PATCH) - should fail with invalid token', () => {
        return request(app.getHttpServer())
            .patch(`/posts/${createdPostId}/update`)
            .set('Authorization', 'Bearer invalid_token')
            .send({ content: 'Fail' })
            .expect(401);
    });

    it('/posts/:id/delete (DELETE) - should delete own post', () => {
        return request(app.getHttpServer())
            .delete(`/posts/${createdPostId}/delete`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
    });

    it('/posts/:id (GET) - should not find deleted post', () => {
        return request(app.getHttpServer())
            .get(`/posts/${createdPostId}`)
            .expect(404);
    });
});
