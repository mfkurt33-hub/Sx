import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: { email: string; password: string; firstName: string; lastName: string },
  ) {
    return this.authService.register(body.email, body.password, body.firstName, body.lastName);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
