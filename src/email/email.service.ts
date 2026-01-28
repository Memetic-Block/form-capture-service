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
    const privateKey = this.configService.get<string>('GMAIL_PRIVATE_KEY')?.replace(/\\n/g, '\n')

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: this.configService.get<string>('GMAIL_USER'),
        serviceClient: this.configService.get<string>('GMAIL_SERVICE_CLIENT'),
        privateKey
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
