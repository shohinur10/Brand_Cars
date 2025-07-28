import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger();

  constructor() {
    console.log('LoggingInterceptor initialized');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('LoggingInterceptor engaged');

    const recordTime = Date.now();
    const requestType = context.getType<GqlContextType>();

    if (requestType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      this.logger.log(`${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');
    }

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - recordTime;
        console.log(` Response took ${responseTime}ms`, 'RESPONSE');
      }),
    );
  }

  private stringify(context: ExecutionContext | any): string {
    return JSON.stringify(context).slice(0, 75);
  }
}
 //this is about how much time it takes to run and get answer from service Like Morgan in Burak 
