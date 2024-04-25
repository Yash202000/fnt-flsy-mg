import { PrismaService } from '@fnt-flsy/prisma-client-mygate';
import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DASHBOARD_API_KEY } from '../consts/env.consts';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

interface  IUserAuthenticatePayload {
  name: string,
  email: string,
  iat: number,
  exp: number
}


@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private prismaService: PrismaService,
    private jwt :JwtService
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = Number(
      this.configService.get<number>('bcrypt.saltRounds')
    );
    return await bcrypt.hash(password, saltRounds);
  }

  comparePasswords(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async validateDeviceRequest(request: any) {
    console.log(request)
    const deviceId = request.params.deviceId;
    const device = await this.prismaService.device.findFirst({
      where: {
        deviceId: deviceId,
      },
    });
    if (!device) {
      return false;
    }
    if (device.isDeviceKeyExempt) {
      return true;
    }
    const deviceKey = request.headers['device-key'];
    const device_Id = request.headers['device-id'];
    if (
      deviceKey == undefined ||
      device_Id == undefined ||
      device_Id != deviceId
    ) {
      return false;
    }
    return await this.comparePasswords(deviceKey, device.deviceKey);
  }

  async validateBearerToken( request :any ){
    console.log("VALIDATE")
    // console.log(request.headers)
    const authheader = request.headers.authorization;
    console.log(authheader)
    if(!authheader){
      throw new HttpException('Auth header is missing',HttpStatus.UNAUTHORIZED)
    }
    const secret = this.configService.get('USER_TOKEN')
    console.log(authheader , authheader.startsWith('Bearer '))
    if(authheader && authheader.startsWith('Bearer ')){
      console.log(true)

      const token = authheader.split(' ')[1];
      console.log("TOKEN : ", token)
      try {
        
        const decoded = jwt.verify(token, secret);
        const decodedJSONString = JSON.stringify(decoded);
        console.log(typeof decodedJSONString , decodedJSONString);
        const finaldata  : IUserAuthenticatePayload =  JSON.parse(decodedJSONString);
        
          const user = await this.prismaService.user.findFirst({
            where:{
              email : finaldata.email
            }
          })
          if(!user){
            throw new ForbiddenException("Invalid Token")
          }
          return true;
           

      } catch (error) {
   
      throw new HttpException (error ,  HttpStatus.UNAUTHORIZED)
      }
    } else {
    
    throw new ForbiddenException ("Authorization header must start with Bearer");
    }

  }

  async validateUserRequest(request: { headers: { [x: string]: string } }) {
    const apiKey = request.headers['api-key'];
    return apiKey != undefined && apiKey == DASHBOARD_API_KEY;
  }


  async createToken(username: string, email: string): Promise<{ access_token: string }> {
    const payload = {
        name: username,
        email
    };

    // console.log(payload)
    const secret = this.configService.get('USER_TOKEN')
    const token = await this.jwt.signAsync(payload,
        { expiresIn: '10m', secret: secret })

    return {
        access_token: token,
    };

}
}


function next() {
  throw new Error('Function not implemented.');
}

