import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, firstName: string, lastName: string, organizationName?: string) {
    // Check if user exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kayıtlı');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      organizationId: '',
      role: 'editor',
      aiCreditLimit: 50,
      aiCreditUsed: 0,
    });

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // Find user with password
    const user = await this.userModel.findOne({ email }).select('+password').exec();
    if (!user) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.lastActiveAt = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya aktif değil');
    }
    
    user.lastActiveAt = new Date();
    await user.save();

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      // Don't reveal if user exists
      return { message: 'E-posta gönderildi (eğer kayıtlıysa)' };
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save();

    // TODO: Send email with reset token
    console.log('Password reset token:', resetToken);

    return { message: 'Şifre sıfırlama e-postası gönderildi' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();

    if (!user) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş token');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Şifre başarıyla güncellendi' };
  }
}
