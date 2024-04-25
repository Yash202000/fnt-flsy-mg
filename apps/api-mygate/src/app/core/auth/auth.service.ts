import { PrismaService } from '@fnt-flsy/prisma-client-mygate';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DASHBOARD_API_KEY } from '../consts/env.consts';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private prismaService: PrismaService
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

  async validateUserRequest(request: { headers: { [x: string]: string } }) {
    const apiKey = request.headers['api-key'];
    return apiKey != undefined && apiKey == DASHBOARD_API_KEY;
  }
}
