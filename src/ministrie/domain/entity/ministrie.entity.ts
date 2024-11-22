import {Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {IMemberDto} from "../../../user-v2/dto/create-user-v2.dto";
import {Type} from "class-transformer";

export enum MinisterioCategoriasEnum {
    eclesiastico = 'eclesiastico',
    pessoas = 'pessoas',
    coordenacao = 'coordenacao',
}

@Entity()
export class MinistrieEntity {
    @ObjectIdColumn()
    @ApiProperty({
        description: 'Identificação do ministério no banco de dados',
        example: '673ecfbc376a0b1f631c9383',
        type: String
    })
    _id?: string;

    @Column()
    @ApiProperty({
        description: 'Nome do ministério',
        example: '673ecfbc376a0b1f631c9383',
        type: String
    })
    nome: string;

    @Column({type: "enum", enum: MinisterioCategoriasEnum})
    @ApiProperty()
    categoria: MinisterioCategoriasEnum;

    @Column()
    @ApiProperty({description: "Lista de responsáveis", type: [IMemberDto]})
    @Type(() => IMemberDto)
    responsavel: IMemberDto[];

    @CreateDateColumn()
    @ApiProperty()
    createdAt: Date;

    @UpdateDateColumn()
    @ApiProperty()
    updatedAt: Date;
}