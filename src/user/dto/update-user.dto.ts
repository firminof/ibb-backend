import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";
import {User, UserAddress} from "../domain/entity/abstractions/user";
import {IsDateString, IsEmail, IsNotEmpty, IsOptional, IsUppercase} from "class-validator";

export class UserDto {
    @ApiProperty({type: Number})
    @Type(() => Number)
    id: number;

    @ApiProperty({type: String})
    @Type(() => String)
    nome: string;
}

export class UserAddressDto {
    @ApiProperty({ type: String })
    @Type(() => String)
    cep: UserAddress['cep'];

    @ApiProperty({ type: String })
    @Type(() => String)
    rua: UserAddress['rua'];

    @ApiProperty({ type: String })
    @Type(() => String)
    numero: UserAddress['numero'];

    @ApiPropertyOptional({ type: String })
    @Type(() => String)
    complemento: UserAddress['complemento'];

    @ApiProperty({ type: String })
    @Type(() => String)
    bairro: UserAddress['bairro'];

    @ApiProperty({ type: String })
    @Type(() => String)
    cidade: UserAddress['cidade'];

    @ApiProperty({ type: String })
    @Type(() => String)
    estado: UserAddress['estado'];

    @ApiProperty({ type: String })
    @Type(() => String)
    pais: UserAddress['pais'];
}

export class UpdateUserDto {
    @ApiPropertyOptional({type: String})
    @IsOptional()
    @IsUppercase()
    role?: User['role'];

    @ApiPropertyOptional({type: String})
    @IsOptional()
    nome?: User['nome'];

    @ApiPropertyOptional({type: String})
    @IsOptional()
    cpf?: User['cpf'];

    @ApiPropertyOptional({type: String})
    @IsOptional()
    rg?: User['rg'];

    @ApiPropertyOptional({type: String})
    @IsEmail()
    @IsOptional()
    email?: User['email'];

    @ApiPropertyOptional({type: String})
    @IsOptional()
    telefone?: User['telefone'];

    @ApiPropertyOptional({type: String})
    @IsOptional()
    foto?: User['foto'];

    @ApiPropertyOptional({type: Date})
    @IsOptional()
    data_nascimento?: User['data_nascimento'];

    @ApiPropertyOptional({type: String})
    @IsOptional()
    estado_civil?: User['estado_civil'];

    @ApiPropertyOptional({type: UserDto})
    @IsOptional()
    conjugue?: User['conjugue'];

    @ApiPropertyOptional({ type: String, format: 'YYYY-MM-DD' })
    @IsOptional()
    @IsDateString()
    data_casamento?: User['data_casamento'];

    @ApiPropertyOptional({type: Boolean})
    @IsOptional()
    possui_filhos?: User['possui_filhos'];

    @ApiPropertyOptional({type: UserDto})
    @IsOptional()
    filhos?: User['filhos'];

    @ApiPropertyOptional({type: String})
    @IsOptional()
    status?: User['status'];

    @ApiPropertyOptional({type: Date})
    @IsOptional()
    transferencia?: User['transferencia'];

    @ApiPropertyOptional({type: UserDto})
    @IsOptional()
    diacono?: User['diacono'];

    @ApiPropertyOptional({type: Number})
    @IsOptional()
    ministerio?: User['ministerio'] = [];

    @ApiPropertyOptional({ type: UserAddressDto })
    @IsOptional()
    endereco?: User['endereco'];

    @ApiProperty({ type: Date })
    @IsOptional()
    data_ingresso?: User['data_ingresso']

    @ApiProperty({ type: String })
    @IsOptional()
    forma_ingresso?: User['forma_ingresso']

    @ApiProperty({ type: String })
    @IsOptional()
    local_ingresso?: User['local_ingresso']

    @ApiProperty({ type: String })
    @IsOptional()
    motivo_transferencia?: User['motivo_transferencia']

    @ApiProperty({ type: Date })
    @IsOptional()
    falecimento?: User['falecimento']

    @ApiProperty({ type: String })
    @IsOptional()
    motivo_falecimento?: User['motivo_falecimento']

    @ApiProperty({ type: Date })
    @IsOptional()
    excluido?: User['excluido']

    @ApiProperty({ type: String })
    @IsOptional()
    motivo_exclusao?: User['motivo_exclusao']

    @ApiProperty({ type: String })
    @IsOptional()
    motivo_visita?: User['motivo_visita']

    @IsOptional()
    providersInfo?: User['providersInfo']
}