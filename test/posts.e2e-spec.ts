import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from './../src/auth/infrastructure/jwt-auth.guard';
import { DataSource } from 'typeorm';
import { UserOrmEntity } from './../src/users/infrastructure/persistence/user.orm-entity';
import { PostOrmEntity } from './../src/posts/infrastructure/persistence/post.orm-entity';
import { DomainExceptionFilter } from './../src/common/filters/domain-exception.filter';

describe('Posts Module (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    const mockUser = {
        username: 'test_e2e_user',
        email: 'test_e2e@example.com',
        password: 'password123',
        role: 'user',
    };

    let userId: string;
    let createdPostId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { userId: userId };
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalFilters(new DomainExceptionFilter());
        await app.init();

        // db setup
        dataSource = app.get(DataSource);
        const userRepo = dataSource.getRepository(UserOrmEntity);

        await dataSource.manager.query(`DELETE FROM posts WHERE "user_id" IN (SELECT id FROM users WHERE email = '${mockUser.email}')`);
        await userRepo.delete({ email: mockUser.email });

        const newUser = userRepo.create(mockUser);
        const savedUser = await userRepo.save(newUser);
        userId = savedUser.id;
    });

    afterAll(async () => {
        if (dataSource && dataSource.isInitialized) {
            const userRepo = dataSource.getRepository(UserOrmEntity);
            if (userId) {
                await dataSource.manager.query(`DELETE FROM posts WHERE "user_id" = '${userId}'`);
                await userRepo.delete(userId);
            }
        }
        await app.close();
    });

    it('/posts/create (POST) - should create a post', () => {
        return request(app.getHttpServer())
            .post('/posts/create')
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

    it('/posts (GET) - should return array of posts', async () => {
        await request(app.getHttpServer())
            .post('/posts/create')
            .send({ content: 'Hello kedua' });

        return request(app.getHttpServer())
            .get('/posts')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                const myPost = res.body.find((p: any) => p.id === createdPostId);
                expect(myPost).toBeDefined();
                expect(myPost.content).toEqual('Hello');
            });
    });

    it('/posts/:id (GET) - should return a single post', () => {
        return request(app.getHttpServer())
            .get(`/posts/${createdPostId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdPostId);
                expect(res.body.content).toEqual('Hello');
                expect(res.body.userId).toEqual(userId);
            });
    });

    it('/posts/:id/update (PATCH) - should update a post', () => {
        return request(app.getHttpServer())
            .patch(`/posts/${createdPostId}/update`)
            .send({
                content: 'Updated',
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toEqual(createdPostId);
                expect(res.body.content).toEqual('Updated');
            });
    });

    it('/posts/:id/delete (DELETE) - should delete a post', () => {
        return request(app.getHttpServer())
            .delete(`/posts/${createdPostId}/delete`)
            .expect(200);
    });

    it('/posts/:id (GET) - should not find deleted post', () => {
        return request(app.getHttpServer())
            .get(`/posts/${createdPostId}`)
            .expect(404);
    });
});
