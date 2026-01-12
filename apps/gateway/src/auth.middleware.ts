import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthGatewayMiddleware implements NestMiddleware {
  private permissionServiceUrl: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.permissionServiceUrl =
      this.configService.get('PERMISSION_SERVICE_URL') || 'http://localhost:7085';
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
      return next();
    }

    const path = req.path || req.url;
    if (this.isAuthEndpoint(path)) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return this.authorizePublicAccess(req, res, next);
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).end();
    }

    const token = authHeader.slice(7);
    try {
      const payload = this.jwtService.verify(token);
      const roles = Array.isArray(payload?.roles) ? payload.roles : [];
      const userId = this.resolveUserId(payload);
      const username = this.resolveUsername(payload);

      req.headers['x-user-id'] = userId ? String(userId) : '';
      req.headers['x-username'] = username || '';
      req.headers['x-user-roles'] = roles.join(',');

      return next();
    } catch {
      return res.status(401).end();
    }
  }

  private isAuthEndpoint(path: string) {
    return (
      path.startsWith('/api/auth') ||
      path.includes('/api/media/files')
    );
  }

  private resolveUserId(payload: Record<string, any>) {
    if (!payload) return '';
    if (payload.userId !== undefined) {
      return payload.userId;
    }
    if (typeof payload.sub === 'number') {
      return payload.sub;
    }
    if (typeof payload.sub === 'string' && payload.sub.trim()) {
      const numericId = Number(payload.sub);
      return Number.isNaN(numericId) ? '' : payload.sub;
    }
    return '';
  }

  private resolveUsername(payload: Record<string, any>) {
    if (!payload) return '';
    if (payload.username) {
      return payload.username;
    }
    if (typeof payload.sub === 'string') {
      return payload.sub;
    }
    return '';
  }

  private async authorizePublicAccess(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const path = req.path || req.url;
    const contentTypeApiId = this.resolveContentTypeApiId(path);
    if (!contentTypeApiId) {
      return res.status(401).end();
    }

    const payload = {
      contentTypeApiId,
      endpoint: this.normalizeEndpoint(path),
      method: req.method,
      userRoles: ['PUBLIC'],
    };

    try {
      const response = await fetch(
        `${this.permissionServiceUrl}/api/permissions/api/check`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json().catch(() => null);
      const allowed = response.ok && data?.data === true;
      if (!allowed) {
        return res.status(403).end();
      }

      req.headers['x-user-id'] = '';
      req.headers['x-username'] = 'public';
      req.headers['x-user-roles'] = 'PUBLIC';

      return next();
    } catch {
      return res.status(403).end();
    }
  }

  private resolveContentTypeApiId(path: string) {
    if (!path.startsWith('/api/')) {
      return null;
    }
    if (path.startsWith('/api/content/')) {
      const trimmed = path.substring('/api/content/'.length);
      const parts = trimmed.split('/');
      return parts.length > 0 && parts[0].trim() ? parts[0] : null;
    }
    const trimmed = path.substring('/api/'.length);
    const parts = trimmed.split('/');
    return parts.length > 0 && parts[0].trim() ? parts[0] : null;
  }

  private normalizeEndpoint(path: string) {
    if (/\/\d+$/.test(path)) {
      return path.replace(/\/\d+$/, '/{id}');
    }
    return path;
  }
}
