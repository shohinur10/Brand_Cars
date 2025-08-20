import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Member } from '../../libs/dto/member';
import { JwtService } from '@nestjs/jwt';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  public async hashPassword(memberPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(memberPassword, salt);
  }

  public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async createToken(member: Member): Promise<string> {
    console.log('member:', member);
    const payload: T = {};
    Object.keys(member['_doc'] ? member['_doc'] : member).forEach((ele) => {
      payload[`${ele}`] = member[`${ele}`];
    });

    delete payload.memberPassword; // Remove password from the payload

    // Use default expiration from AuthModule (30 days)
    return await this.jwtService.signAsync(payload);
  }

  public async verifyToken(token: string): Promise<Member> {
    try {
      const member = await this.jwtService.verifyAsync(token);
      member._id = shapeIntoMongoObjectId(member._id);
      return member;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('JWT token expired. Please login again.');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid JWT token.');
      }
      throw error;
    }
  }
}


