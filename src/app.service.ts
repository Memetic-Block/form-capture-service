import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Formr Capture Service build & operated by Memetic Block, see https://memeticblock.com for more info'
  }
}
