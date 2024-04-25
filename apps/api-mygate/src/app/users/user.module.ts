import { Module } from "@nestjs/common";
import { userController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthModule } from "../core/auth/auth.module";
import { AuthService } from "../core/auth/auth.service";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@fnt-flsy/prisma-client-mygate";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports:[],
    providers:[UserService,ConfigService,PrismaService,AuthService,JwtService ],
    controllers:[userController]
})

export class  UserModule{} 