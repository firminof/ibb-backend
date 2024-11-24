import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {
    CivilStateEnumV2, FirebaseProviderInfoV2, IMember,
    ProvidersV2, StatusEnumV2, UserAddressV2,
    UserRolesV2
} from '../domain/entity/abstractions/user-v2.abstraction';
import {Column, ObjectIdColumn} from "typeorm";
import {IsEmail, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches} from "class-validator";
import {User} from "../../user/domain/entity/abstractions/user";

export class UserAddressV2Dto {
    @ApiProperty({description: 'CEP do endereço', example: '12345-678'})
    cep: string;

    @ApiProperty({description: 'Rua do endereço', example: 'Rua Principal'})
    rua: string;

    @ApiProperty({description: 'Número do endereço', example: '123'})
    numero: string;

    @ApiProperty({description: 'Complemento do endereço', example: 'Apartamento 101', nullable: true})
    complemento: string | null;

    @ApiProperty({description: 'Bairro do endereço', example: 'Centro'})
    bairro: string;

    @ApiProperty({description: 'Cidade do endereço', example: 'São Paulo'})
    cidade: string;

    @ApiProperty({description: 'Estado do endereço', example: 'SP'})
    estado: string;

    @ApiProperty({description: 'País do endereço', example: 'Brasil'})
    pais: string;
}

export class IMemberDto {
    @ApiProperty({description: 'ID do membro', example: 1})
    id: number;

    @ApiProperty({description: 'Nome do membro', example: 'João da Silva'})
    nome: string;

    @ApiProperty({description: 'Indica se é um membro ativo', example: true})
    isMember: boolean;

    @ApiProperty({description: 'Indica se é um diácono', example: false})
    isDiacono: boolean;
}

export class FirebaseProviderInfoV2Dto {
    @ApiProperty({description: 'ID do provedor', enum: ProvidersV2})
    providerId: ProvidersV2;

    @ApiProperty({description: 'UID do provedor', example: '1234567890'})
    uid: string;
}

export class CreateUserV2Dto {
    // Nome do usuário
    @Column()
    @ApiProperty({
        description: 'Nome completo do usuário',
        example: 'Maria Oliveira',
    })
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    nome: string;

    // Foto do usuário
    @Column()
    @ApiProperty({
        description: 'URL da foto do usuário',
        example: 'https://example.com/foto.jpg',
    })
    @IsString()
    @IsOptional()
    foto: string;

    // CPF do usuário
    @Column()
    @ApiProperty({
        description: 'CPF do usuário',
        example: '123.456.789-00',
    })
    @IsNotEmpty({ message: 'O CPF é obrigatório.' })
    cpf: string;

    // RG do usuário
    @Column()
    @ApiProperty({
        description: 'RG do usuário',
        example: '12.345.678-9',
    })
    @IsNotEmpty({ message: 'O RG é obrigatório.' })
    rg: string;

    // Email do usuário
    @Column()
    @ApiProperty({
        description: 'Email do usuário',
        example: 'maria@example.com',
    })
    @IsEmail({}, { message: 'O email deve ser válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório.' })
    email: string;

    // Telefone do usuário
    @Column()
    @ApiProperty({
        description: 'Telefone do usuário',
        example: '+55 11 98765-4321',
    })
    @IsString()
    @IsNotEmpty({ message: 'O telefone é obrigatório.' })
    telefone: string;

    // Data de nascimento do usuário
    @Column()
    @ApiProperty({
        description: 'Data de nascimento do usuário',
        example: '1990-01-01',
    })
    @IsISO8601({}, { message: 'A data de nascimento deve estar no formato ISO8601 (yyyy-mm-dd).' })
    @IsNotEmpty({ message: 'A data de nascimento é obrigatória.' })
    dataNascimento: Date;

    // Nível de Acesso
    @Column({type: 'enum', enum: UserRolesV2})
    @ApiProperty({enum: UserRolesV2, description: 'Nível de acesso do usuário', example: UserRolesV2.ADMIN})
    @IsNotEmpty({ message: 'Nível de acesso é obrigatório.' })
    role: UserRolesV2;

    // Status de membresia
    @ApiProperty({type: 'enum', enum: StatusEnumV2, description: 'Status de membresia'})
    @IsNotEmpty({ message: 'O Status de Membresia é obrigatório.' })
    status: StatusEnumV2;

    // Informações Pessoais
    @Column(type => Object)
    @ApiProperty({
        type: Object,
        description: 'Informações pessoais do usuário',
        example: {
            estadoCivil: CivilStateEnumV2.casado,
            casamento: {
                conjugue: {id: "1", nome: 'João Silva', isMember: true, isDiacono: false},
                dataCasamento: '2010-01-01',
            },
            filhos: [{id: "2", nome: 'Pedro Oliveira', isMember: false, isDiacono: false}],
            temFilhos: true,
        },
    })
    informacoesPessoais: {
        estadoCivil: CivilStateEnumV2;
        casamento: {
            conjugue: IMember | null;
            dataCasamento: Date | null;
        };
        filhos: IMember[];
        temFilhos: boolean;
    };

    // Cargo e Ministério
    @Column(type => Object)
    @ApiProperty({
        type: Object,
        description: 'Informações do cargo e ministério do usuário',
        example: {
            id: "1", nome: 'João Silva', isMember: true, isDiacono: true,
        },
    })
    diacono: IMember;

    @Column('simple-array')
    @ApiProperty({type: [String], description: 'Lista de ministérios', example: ['12345679', '12345678']})
    ministerio: string[];

    // Dados de Endereço
    @Column(type => UserAddressV2Dto)
    @ApiPropertyOptional({
        type: Object,
        description: 'Endereço do usuário',
        example: {
            cep: '12345-678',
            rua: 'Rua Principal',
            numero: '123',
            complemento: 'Apartamento 101',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            pais: 'Brasil',
        },
    })
    endereco: UserAddressV2 | null;

    // Dados de Ingresso
    @Column(type => Object)
    @ApiProperty({
        type: Object,
        description: 'Informações de ingresso do usuário',
        example: {data: '2015-06-15', forma: 'Por transferência', local: 'Igreja Matriz'},
    })
    ingresso: {
        data: Date | null;
        forma: string | null;
        local: string | null;
    };

    // Transferência
    @Column(type => Object)
    @ApiProperty({
        type: Object,
        description: 'Informações de transferência do usuário',
        example: {data: '2020-09-10', motivo: 'Mudança de cidade', local: 'Nova Igreja'},
    })
    transferencia: {
        data: Date | null;
        motivo: string | null;
        local: string | null;
    };

    // Falecimento
    @Column(type => Object)
    @ApiProperty({
        type: Object,
        description: 'Informações sobre falecimento do usuário',
        example: {data: '2022-01-01', motivo: 'Causa natural', local: 'São Paulo'},
    })
    falecimento: {
        data: Date | null;
        motivo: string | null;
        local: string | null;
    };

    // Exclusão
    @Column(type => Object)
    @ApiProperty({
        type: Object,
        description: 'Informações sobre exclusão do usuário',
        example: {data: '2023-05-01', motivo: 'Solicitação pessoal'},
    })
    exclusao: {
        data: Date | null;
        motivo: string | null;
    };

    // Visitas
    @Column(type => Object)
    @ApiProperty({
        type: Object,
        description: 'Informações sobre visitas realizadas pelo usuário',
        example: {motivo: 'Visita pastoral'},
    })
    visitas: {
        motivo: string | null;
    };

    @Column(type => Boolean)
    @ApiProperty({description: 'Indica se o membro é um diácono', example: false})
    isDiacono: boolean;
}
