import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, IsUppercase} from "class-validator";
import {User} from "../../user/domain/entity/abstractions/user";

export class ResetPasswordAuthDto {
    @ApiProperty({type: String})
    @IsNotEmpty()
    @IsEmail()
    email: string;
}