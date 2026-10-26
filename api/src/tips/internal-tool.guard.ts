import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalToolGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('INTERNAL_TOOL_TOKEN');
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const actual = request.headers['x-internal-token'];

    if (!expected || !actual || actual !== expected) {
      throw new UnauthorizedException(
        'Valid x-internal-token header required.',
      );
    }

    return true;
  }
}
