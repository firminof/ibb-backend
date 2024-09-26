import {Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {UserDto} from "../../../user/dto/create-user.dto";

@Entity()
export class MinistrieEntity {
    @ObjectIdColumn()
    _id?: string;

    @Column()
    @ApiProperty({type: String})
    nome: string;

    @Column()
    @ApiProperty({type: String})
    categoria: string;

    @Column()
    @ApiProperty()
    responsavel: UserDto[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}