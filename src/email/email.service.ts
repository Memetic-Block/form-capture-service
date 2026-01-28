import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

export interface FormEmailData {
  name: string
  email: string
  subject: string
  message: string
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: Transporter

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS')
      }
    })
  }

  async sendFormSubmission(data: FormEmailData): Promise<void> {
    const { name, email, subject, message } = data

    const emailBody = `New form submission received:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from the form capture service.
`

    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to: this.configService.get<string>('MAIL_TO'),
      replyTo: email,
      subject: `[Form Submission] ${subject}`,
      text: emailBody
    }

    try {
      const result = (await this.transporter.sendMail(mailOptions)) as { messageId?: string }
      this.logger.log(`Email sent successfully: ${result.messageId}`)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.logger.error(`Failed to send email: ${err.message}`, err.stack)
      throw err
    }
  }
}
