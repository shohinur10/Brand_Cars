import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      secret: `${process.env.SECRET_KEY}`,
      signOptions: { expiresIn: '30d' }, // Token expiration time
    })
  ], // No imports needed for AuthModule
  providers: [AuthService],
  exports: [AuthService], // Exporting AuthService to make it available in other modules
})
export class AuthModule {}
