import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class BaseResponse<T> {
    statusCode: number;
    message: string;
    timestamp: string;
    data: T;

    constructor(statusCode: number, message: string, data: T) {
        this.statusCode = statusCode;
        this.message = message;
        this.timestamp = new Date().toISOString();
        this.data = data;
    }
}

@Injectable()
export class UnifyResponseInterceptor<T> implements NestInterceptor<T, BaseResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<BaseResponse<T>> {
        return next.handle().pipe(
            map((data) => ({
                statusCode: context.switchToHttp().getResponse().statusCode,
                message: 'Success',
                timestamp: new Date().toISOString(),
                data,
            })),
        );
    }
}
