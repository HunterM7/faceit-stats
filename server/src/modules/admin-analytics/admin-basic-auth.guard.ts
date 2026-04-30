import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { AppConfigService } from '../../config/app-config.service';

@Injectable()
export class AdminBasicAuthGuard implements CanActivate {
  constructor(private readonly config: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers?: Record<string, string | undefined> }>();
    const response = context.switchToHttp().getResponse<{ setHeader: (key: string, value: string) => void }>();
    const header = request.headers?.authorization || '';
    const expectedLogin = this.config.adminLogin;
    const expectedPassword = this.config.adminPassword;

    if (!expectedLogin || !expectedPassword) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard", charset="UTF-8"');
      throw new UnauthorizedException('Админ-доступ не настроен на сервере.');
    }

    if (!header.startsWith('Basic ')) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard", charset="UTF-8"');
      throw new UnauthorizedException('Нужна авторизация для доступа к админке.');
    }

    const decoded = this.decodeBasicHeader(header.slice(6));
    if (!decoded) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard", charset="UTF-8"');
      throw new UnauthorizedException('Некорректные данные авторизации.');
    }

    const isLoginValid = this.safeEqual(decoded.login, expectedLogin);
    const isPasswordValid = this.safeEqual(decoded.password, expectedPassword);
    if (!isLoginValid || !isPasswordValid) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard", charset="UTF-8"');
      throw new UnauthorizedException('Неверный логин или пароль.');
    }

    return true;
  }

  private decodeBasicHeader(raw: string): { login: string; password: string } | null {
    try {
      const pair = Buffer.from(raw, 'base64').toString('utf8');
      const separatorIndex = pair.indexOf(':');
      if (separatorIndex <= 0) {
        return null;
      }
      return {
        login: pair.slice(0, separatorIndex),
        password: pair.slice(separatorIndex + 1),
      };
    } catch {
      return null;
    }
  }

  private safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }
    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
