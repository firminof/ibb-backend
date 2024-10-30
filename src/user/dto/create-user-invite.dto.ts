import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";
import {User, UserAddress} from "../domain/entity/abstractions/user";
import {IsDate, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsUppercase} from "class-validator";
import {UserAddressDto, UserDto} from "./create-user.dto";

export class CreateUserInviteDto {
    @ApiProperty({type: String})
    @IsNotEmpty()
    @IsUppercase()
    role: User['role'];

    @ApiProperty({type: String})
    @IsNotEmpty()
    nome: User['nome'];

    @ApiProperty({type: String})
    @IsNotEmpty()
    cpf: User['cpf'];

    @ApiProperty({type: String})
    @IsNotEmpty()
    rg: User['rg'];

    @ApiProperty({type: String})
    @IsEmail()
    @IsNotEmpty()
    email: User['email'];

    @ApiProperty({type: String})
    @IsNotEmpty()
    telefone: User['telefone'];

    @ApiProperty({type: String})
    @IsOptional()
    foto: User['foto'];

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    data_nascimento: User['data_nascimento'];

    @ApiProperty({type: String})
    @IsNotEmpty()
    estado_civil: User['estado_civil'];

    @ApiProperty({type: UserDto})
    @IsOptional()
    conjugue: User['conjugue'];

    @ApiProperty({ type: Date})
    @IsOptional()
    data_casamento: User['data_casamento'];

    @ApiProperty({type: Boolean})
    @IsNotEmpty()
    possui_filhos: User['possui_filhos'];

    @ApiProperty({type: [UserDto]})
    @IsOptional()
    filhos: User['filhos'];

    @ApiProperty({type: String})
    @IsNotEmpty()
    status: User['status'];

    @ApiProperty({type: [Number]})
    @IsNotEmpty()
    ministerio: User['ministerio'] = [];

    @ApiPropertyOptional({ type: UserAddressDto })
    @IsOptional()
    endereco: User['endereco'];

    @ApiProperty({ type: Date })
    @IsOptional()
    data_ingresso: User['data_ingresso']

    @ApiProperty({ type: String })
    @IsOptional()
    forma_ingresso: User['forma_ingresso']

    @ApiProperty({ type: String })
    @IsOptional()
    local_ingresso: User['local_ingresso']

    @ApiProperty({ type: String })
    @IsOptional()
    motivo_transferencia: User['motivo_transferencia']

    @ApiProperty({ type: Date })
    @IsOptional()
    falecimento: User['falecimento']

    @ApiProperty({ type: String })
    @IsOptional()
    motivo_falecimento: User['motivo_falecimento']

    @ApiProperty({ type: Date })
    @IsOptional()
    excluido: User['excluido']

    @ApiProperty({ type: String })
    @IsOptional()
    motivo_exclusao: User['motivo_exclusao']

    @ApiProperty({ type: String })
    @IsOptional()
    motivo_visita: User['motivo_visita']

    @IsNotEmpty()
    login: {
        password: string;
    }

    @ApiProperty({type: Boolean})
    @IsOptional()
    is_diacono: User['is_diacono'];
}