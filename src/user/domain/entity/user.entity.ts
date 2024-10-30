import {Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn,} from 'typeorm';
import {User} from "./abstractions/user";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {UserAddressDto, UserDto} from "../../dto/create-user.dto";

@Entity()
export class UserEntity implements User {
    @ObjectIdColumn()
    _id?: User['_id'];

    @Column()
    @ApiProperty({type: String})
    role: User['role'];

    @Column()
    @ApiProperty({type: String})
    nome: User['nome'];

    @Column()
    @ApiProperty({type: String})
    cpf: User['cpf'];

    @Column()
    @ApiProperty({type: String})
    rg: User['rg'];

    @Column()
    @ApiProperty({type: String})
    email: User['email'];

    @Column()
    @ApiProperty({type: String})
    telefone: User['telefone'];

    @Column()
    @ApiPropertyOptional({type: String})
    foto: User['foto'];

    @Column()
    @ApiProperty({type: Date})
    data_nascimento: User['data_nascimento'];

    @Column()
    @ApiProperty({type: String})
    estado_civil: User['estado_civil'];

    @Column()
    @ApiPropertyOptional({type: UserDto})
    conjugue: User['conjugue'];

    @Column()
    @ApiProperty({type: Date})
    data_casamento: User['data_casamento'];

    @Column()
    @ApiProperty({type: Boolean})
    possui_filhos: User['possui_filhos'];

    @Column()
    @ApiProperty({type: UserDto})
    filhos: User['filhos'];

    @Column()
    @ApiProperty({type: String})
    status: User['status'];

    @Column()
    @ApiPropertyOptional({type: Date})
    transferencia: User['transferencia'];

    @Column()
    @ApiProperty({type: UserDto})
    diacono: User['diacono'];

    @Column()
    @ApiProperty({type: Number})
    ministerio: User['ministerio'] = [];

    @Column()
    @ApiProperty({type: UserAddressDto})
    endereco: User['endereco'];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    @ApiPropertyOptional({type: Date})
    data_ingresso: User['data_ingresso']

    @Column()
    @ApiProperty({type: String})
    forma_ingresso: User['forma_ingresso']

    @Column()
    @ApiProperty({type: String})
    local_ingresso: User['local_ingresso']

    @Column()
    @ApiProperty({type: String})
    motivo_transferencia: User['motivo_transferencia']

    @Column()
    @ApiPropertyOptional({type: Date})
    falecimento: User['falecimento']

    @Column()
    @ApiProperty({type: String})
    motivo_falecimento: User['motivo_falecimento']

    @Column()
    @ApiPropertyOptional({type: Date})
    excluido: User['excluido']

    @Column()
    @ApiProperty({type: String})
    motivo_exclusao: User['motivo_exclusao']

    @Column()
    @ApiProperty({type: String})
    motivo_visita: User['motivo_visita']

    @Column()
    providersInfo: User['providersInfo'] = [];

    @Column()
    @ApiProperty({type: Boolean})
    is_diacono: User['is_diacono'];
}