import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common'
import { Request } from 'express'
import { TurnstileService } from './turnstile.service'

interface TurnstileRequest extends Request {
  body: {
    turnstileToken?: string
  }
}

@Injectable()
export class TurnstileGuard implements CanActivate {
  private readonly logger = new Logger(TurnstileGuard.name)

  constructor(private readonly turnstileService: TurnstileService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.turnstileService.isEnabled()) {
      return true
    }

    const request = context.switchToHttp().getRequest<TurnstileRequest>()
    const token = request.body?.turnstileToken

    if (!token) {
      this.logger.warn('Missing Turnstile token in request')
      throw new ForbiddenException('Captcha verification required')
    }

    const remoteIp = this.getClientIp(request)
    const isValid = await this.turnstileService.verify(token, remoteIp)

    if (!isValid) {
      this.logger.warn(`Turnstile verification failed for IP: ${remoteIp}`)
      throw new ForbiddenException('Captcha verification failed')
    }

    return true
  }

  private getClientIp(request: TurnstileRequest): string | undefined {
    // CF-Connecting-IP is Cloudflare's recommended header for the original client IP
    const cfConnectingIp = request.headers['cf-connecting-ip']
    if (cfConnectingIp && typeof cfConnectingIp === 'string') {
      return cfConnectingIp
    }

    // Fallback to X-Forwarded-For (first IP in the chain)
    const xForwardedFor = request.headers['x-forwarded-for']
    if (xForwardedFor && typeof xForwardedFor === 'string') {
      return xForwardedFor.split(',')[0].trim()
    }

    // Fallback to direct connection IP
    return request.ip
  }
}
