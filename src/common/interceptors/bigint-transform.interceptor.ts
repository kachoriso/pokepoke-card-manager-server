// src/common/interceptors/bigint-transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function transformBigIntToString(value: any): any {
  if (typeof value === 'bigint') {
    return value.toString();
  } else if (Array.isArray(value)) {
    return value.map(transformBigIntToString);
  } else if (value !== null && typeof value === 'object') {
    const newObj: { [key: string]: any } = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        newObj[key] = transformBigIntToString(value[key]);
      }
    }
    return newObj;
  }
  return value;
}

@Injectable()
export class BigIntTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map(data => transformBigIntToString(data)));
  }
}