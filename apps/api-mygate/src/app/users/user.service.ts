
import { UserSignInDTO, UserSignUpDTO } from "./dto/user.dto";
import { PrismaService } from "@fnt-flsy/prisma-client-mygate";
import { AuthService } from "../core/auth/auth.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class UserService{
    constructor(
        private prisma: PrismaService,
        private authService : AuthService
    ){}


    async UserSignup(SignUpBody: UserSignUpDTO){
        const hash = await this.authService.hashPassword(SignUpBody.password);
        try{
            const user = await this.prisma.user.create({
                data:{
                    email: SignUpBody.email,
                    firstName : SignUpBody.firstName,
                    lastName : SignUpBody.lastName,
                    isActive: true,
                    password: hash,
                }
            })

            return {
                status : HttpStatus.CREATED
            }

        }catch(error){
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code ==='P0002'){
                    throw new ForbiddenException('User Already Exist with same credentials');
                }
            }
            throw error;
        }
    }


    async UserSignIn(SignInBody :UserSignInDTO) {
        console.log(SignInBody)
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email: SignInBody.email
                }
            });
    
            if (!user) {
                throw new ForbiddenException("Credentials Incorrect");
            }
            // console.log(SignInBody.password, user.password)
            const pwMatch = await this.authService.comparePasswords(SignInBody.password, user.password);
    
            if (!pwMatch) {
                throw new ForbiddenException("Password Incorrect!");
            }
            
            // console.log(user.id , user.email)
            return this.authService.createToken(user.firstName, user.email);
        } catch (error) {
            throw error; 
    }
    
}
}

