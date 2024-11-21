import {IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class SendEmailDto {
    @ApiProperty({type: String})
    @IsOptional()
    @IsString()
    memberIdRequested: string;

    @ApiProperty({type: String})
    @IsOptional()
    @IsString()
    requestName: string;

    @ApiProperty({type: String})
    @IsOptional()
    to: string;

    @ApiProperty({type: String})
    @IsOptional()
    subject: string;

    @ApiProperty({type: String})
    @IsOptional()
    text: string;

    @ApiProperty({type: String})
    @IsOptional()
    html: string;

    @ApiProperty({type: String})
    @IsOptional()
    phone: string;
}