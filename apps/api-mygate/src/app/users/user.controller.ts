import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserSignInDTO, UserSignUpDTO } from "./dto/user.dto";
import { UserService } from "./user.service";
import { AuthGuard } from "../core/auth/auth.guard";
import { UserAuthGuard } from "../core/auth/user-auth.guard";

@ApiTags('user')
@Controller('user')
export class userController{
    constructor(
        private userService : UserService
    ){}

    @ApiOperation({
        summary:'create new user'
    })
    @ApiResponse({
        status:200,
        description :'Success',
    })

    @Post('signup')
    userSignup(@Body() SignUpBody:UserSignUpDTO){
        return this.userService.UserSignup(SignUpBody);
    }



    @ApiOperation({
        summary:'SignIn user'
    })
    @ApiResponse({
        status:200,
        description :'Success',
    })

    @Post('signin')
    // @UseGuards(UserAuthGuard)
    // @UseGuards(UserAuthGuard)
    userSignin(@Body() SignInBody:UserSignInDTO){
        return this.userService.UserSignIn(SignInBody);
    }

}