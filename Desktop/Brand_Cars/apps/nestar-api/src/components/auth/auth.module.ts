import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'temporary-secret-key-for-development-only-change-in-production',
      signOptions: { expiresIn: '30d' }, // Token expiration time
    })
  ],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard], // Exporting both AuthService and AuthGuard
})
export class AuthModule {}
