import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common'
import { EmailService } from '../email/email.service'
import { TurnstileGuard } from '../turnstile/turnstile.guard'
import { FormSubmissionDto } from './dto/form-submission.dto'

@Controller('form')
export class FormController {
  private readonly logger = new Logger(FormController.name)

  constructor(private readonly emailService: EmailService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(TurnstileGuard)
  async submitForm(@Body() formData: FormSubmissionDto) {
    this.logger.log(`Received form submission from ${formData.email}: ${formData.subject}`)

    await this.emailService.sendFormSubmission(formData)

    return {
      success: true,
      message: 'Form submitted successfully'
    }
  }
}
