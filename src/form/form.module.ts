import { Module } from '@nestjs/common'
import { EmailModule } from '../email/email.module'
import { TurnstileModule } from '../turnstile/turnstile.module'
import { FormController } from './form.controller'

@Module({
  imports: [EmailModule, TurnstileModule],
  controllers: [FormController]
})
export class FormModule {}
