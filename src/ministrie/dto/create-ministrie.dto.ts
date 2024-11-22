import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsNotEmpty} from "class-validator";
import {IMemberDto} from "../../user-v2/dto/create-user-v2.dto";
import {MinisterioCategoriasEnum} from "../domain/entity/ministrie.entity";

export class CreateMinistrieDto {
    @ApiProperty({type: String})
    @IsNotEmpty()
    nome: string;

    @ApiProperty({type: 'enum', enum: MinisterioCategoriasEnum, description: 'Categoria do ministério'})
    @IsNotEmpty({ message: 'A categoria é obrigatório.' })
    categoria: MinisterioCategoriasEnum;

    @ApiProperty({type: [IMemberDto]})
    @IsNotEmpty()
    @IsArray()
    responsavel: IMemberDto[];
}