import {IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class SendEmailDto {
    @ApiProperty({type: String})
    @IsOptional()
    @IsString()
    requestName: string;

    @ApiProperty({type: String})
    @IsEmail()
    to: string;

    @ApiProperty({type: String})
    @IsNotEmpty()
    subject: string;

    @ApiProperty({type: String})
    @IsNotEmpty()
    text: string;

    @ApiProperty({type: String})
    @IsEmpty()
    html: string;
}