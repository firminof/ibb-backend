import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsOptional} from "class-validator";
import {UserDto} from "../../user/dto/update-user.dto";

export class UpdateMinistrieDto {
    @ApiProperty({type: String})
    @IsOptional()
    nome: string;

    @ApiProperty({type: String})
    @IsOptional()
    categoria: string;

    @ApiProperty({type: [UserDto]})
    @IsArray()
    @IsOptional()
    responsavel: UserDto[];
}