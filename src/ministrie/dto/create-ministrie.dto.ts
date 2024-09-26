import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsNotEmpty, IsOptional} from "class-validator";
import {UserDto} from "../../user/dto/create-user.dto";

export class CreateMinistrieDto {
    @ApiProperty({type: String})
    @IsNotEmpty()
    nome: string;

    @ApiProperty({type: String})
    @IsNotEmpty()
    categoria: string;

    @ApiProperty({type: [UserDto]})
    @IsNotEmpty()
    @IsArray()
    responsavel: UserDto[];
}