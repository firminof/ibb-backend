import {Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class InviteV2Entity {
    // Identificação na base de dados
    @ObjectIdColumn()
    @ApiProperty({
        description: 'Identificação do convite enviado',
        example: '673ecfbc376a0b1f631c9383',
        type: String
    })
    _id?: string;

    // ID do usuário que mandou o convite
    @Column()
    @ApiProperty()
    memberIdRequested: string;

    // Nome do usuário que mandou o convite
    @Column()
    @ApiProperty()
    requestName: string;

    // Email do convidado (se foi por email)
    @Column()
    @ApiProperty()
    to: string | null;

    // Email do convidado (se foi por telefone)
    @Column()
    @ApiProperty()
    phone: string | null;

    // Convite aceito e preenchido pelo membro convidado
    @Column()
    @ApiProperty()
    isAccepted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}