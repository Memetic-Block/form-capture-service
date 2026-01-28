import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EmailModule } from './email/email.module'
import { FormModule } from './form/form.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    EmailModule,
    FormModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
