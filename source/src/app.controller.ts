import { Controller, Get, Res, HttpStatus, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { DATA_1, DATA_BASE64 } from './data';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(200)
  getHello(@Res() res: Response): any {
    res.status(HttpStatus.OK).json({
      data: this.appService.getHello(),
      message: 'Hello World!',
      code: 1000,
    });
  }

  @Get('/option')
  getOption(@Res() res: Response): any {
    res.status(HttpStatus.OK).json({ output: { ...DATA_1 } });
  }

  @Get('/option/pako')
  getOptionPako(@Res() res: Response): any {
    const pako = require('pako');
    const output = pako.deflate(JSON.stringify(DATA_1));
    res.status(HttpStatus.OK).json({ output });
  }

  @Get('/option/base64')
  getOption2(@Res() res: Response): any {
    const output = DATA_BASE64;
    res.status(HttpStatus.OK).json({ output });
  }
}
