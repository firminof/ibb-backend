import {IsArray, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class UpdateInfoDto {
    @ApiProperty({type: String})
    @IsOptional()
    @IsString()
    @IsArray()
    _id: string[];
}