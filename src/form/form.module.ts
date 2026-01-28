import { Module } from '@nestjs/common'
import { EmailModule } from '../email/email.module'
import { FormController } from './form.controller'

@Module({
  imports: [EmailModule],
  controllers: [FormController]
})
export class FormModule {}
