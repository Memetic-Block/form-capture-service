import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name)
  private readonly secretKey: string
  private readonly enabled: boolean

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('TURNSTILE_SECRET_KEY', '')
    this.enabled = this.configService.get<string>('TURNSTILE_ENABLED', 'true') === 'true'
  }

  isEnabled(): boolean {
    return this.enabled
  }

  async verify(token: string, remoteIp?: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug('Turnstile verification is disabled, allowing request')
      return true
    }

    if (!this.secretKey) {
      this.logger.error('TURNSTILE_SECRET_KEY is not configured')
      return false
    }

    try {
      const formData = new URLSearchParams()
      formData.append('secret', this.secretKey)
      formData.append('response', token)

      if (remoteIp) {
        formData.append('remoteip', remoteIp)
      }

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })

      const result = (await response.json()) as TurnstileVerifyResponse

      if (!result.success) {
        this.logger.warn(`Turnstile verification failed: ${result['error-codes']?.join(', ')}`)
      }

      return result.success
    } catch (error) {
      this.logger.error(`Turnstile verification error: ${error}`)
      return false
    }
  }
}
