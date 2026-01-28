import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class FormSubmissionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject: string

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message: string

  @IsNotEmpty()
  @IsString()
  turnstileToken: string
}
