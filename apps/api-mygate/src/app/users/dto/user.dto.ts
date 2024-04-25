import { IsEmail, IsNotEmpty, IsString } from "class-validator"


export class UserSignUpDTO{
    @IsEmail()
    @IsNotEmpty()
    email : string;

    
    phoneNumber? : string;
    
    @IsString()
    @IsNotEmpty()
    firstName : string;
    
    @IsString()
    @IsNotEmpty()
    lastName : string;
    
    isActive : boolean;
    @IsString()
    @IsNotEmpty()
    password :string;
}


export class UserSignInDTO{
    @IsEmail()
    @IsNotEmpty()
    email : string;

    @IsString()
    @IsNotEmpty()
    password :string;
}