import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
