import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator.js';

export interface BaseResponse<T> {
    statusCode: number;
    message: string;
    timestamp: string;
    data: T;
}

@Injectable()
export class UnifyResponseInterceptor<T> implements NestInterceptor<T, BaseResponse<T>> {
    constructor(private reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<BaseResponse<T>> {
        const message = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) || 'Success';

        return next.handle().pipe(
            map((data) => ({
                statusCode: context.switchToHttp().getResponse().statusCode,
                message,
                timestamp: new Date().toISOString(),
                data,
            })),
        );
    }
}
