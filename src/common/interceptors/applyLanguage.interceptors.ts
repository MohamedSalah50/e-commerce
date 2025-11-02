
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class prefferedLanguage implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    context.switchToHttp().getRequest().headers['accept-language']=
    context.switchToHttp().getRequest().credentials.user.prefferedLanguage??
    context.switchToHttp().getRequest().headers['accept-language']
    return next
      .handle()
      .pipe(
        tap(() => console.log(`done`)),
      );
  }
}
