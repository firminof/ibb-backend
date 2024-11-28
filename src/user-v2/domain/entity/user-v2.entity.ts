import {Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn} from "typeorm";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {
    CivilStateEnumV2, FirebaseProviderInfoV2,
    IMember, StatusEnumV2, UserAddressV2, UserRolesV2,
    UserV2,
} from "./abstractions/user-v2.abstraction";
import {Expose, Type} from "class-transformer";
import {FirebaseProviderInfoV2Dto, IMemberDto, UserAddressV2Dto} from "../../dto/create-user-v2.dto";
import {User} from "../../../user/domain/entity/abstractions/user";

export class CasamentoDto {
    @ApiPropertyOptional({ description: "Dados do cônjuge", type: IMemberDto })
    @Type(() => IMemberDto)
    conjugue: IMemberDto | null;

    @ApiPropertyOptional({ description: "Data do casamento", example: "2000-01-01" })
    dataCasamento: Date | null;
}

export class InformacoesPessoaisDto {
    @ApiProperty({
        description: "Estado civil do usuário",
        enum: CivilStateEnumV2,
        example: CivilStateEnumV2.solteiro,
    })
    estadoCivil: CivilStateEnumV2;

    @ApiPropertyOptional({ description: "Informações sobre o casamento", type: CasamentoDto })
    @Type(() => CasamentoDto)
    casamento: CasamentoDto | null;

    @ApiProperty({ description: "Lista de filhos", type: [IMemberDto] })
    @Type(() => IMemberDto)
    filhos: IMemberDto[];

    @ApiProperty({description: "Membro tem filhos", type: Boolean})
    temFilhos: boolean;
}

export class IngressoDto {
    @ApiPropertyOptional({ description: "Data de ingresso", example: "2020-01-01" })
    data: Date | null;

    @ApiPropertyOptional({ description: "Forma de ingresso", example: "Transferência" })
    forma: string | null;

    @ApiPropertyOptional({ description: "Local de ingresso", example: "Igreja Central" })
    local: string | null;
}

export class TransferenciaDto {
    @ApiPropertyOptional({ description: "Data da transferência", example: "2021-01-01" })
    data: Date | null;

    @ApiPropertyOptional({ description: "Motivo da transferência", example: "Mudança de cidade" })
    motivo: string | null;

    @ApiPropertyOptional({ description: "Local de transferência", example: "Nova Igreja" })
    local: string | null;
}

export class FalecimentoDto {
    @ApiPropertyOptional({ description: "Data do falecimento", example: "2023-01-01" })
    data: Date | null;

    @ApiPropertyOptional({ description: "Motivo do falecimento", example: "Doença" })
    motivo: string | null;

    @ApiPropertyOptional({ description: "Local do falecimento", example: "Hospital Municipal" })
    local: string | null;
}

export class ExclusaoDto {
    @ApiPropertyOptional({ description: "Data de exclusão", example: "2023-01-01" })
    data: Date | null;

    @ApiPropertyOptional({ description: "Motivo da exclusão", example: "Solicitação do membro" })
    motivo: string | null;
}

export class VisitasDto {
    @ApiPropertyOptional({ description: "Motivo da visita", example: "Evangelismo" })
    motivo: string | null;
}

export class AutenticacaoDto {
    @ApiProperty({ description: "Informações do provedor de autenticação", type: [FirebaseProviderInfoV2Dto] })
    providersInfo: FirebaseProviderInfoV2[];
}

export class HistoricoDto {
    @ApiProperty({ description: "Chave que identifica qual campo alterou", example: 'nome' })
    chave: string;

    @ApiProperty({ description: "Valor antigo", example: 'João' })
    antigo: string;

    @ApiProperty({ description: "Valor antigo", example: 'João Silva' })
    novo: string;

    @UpdateDateColumn()
    updatedAt: Date;
}

@Entity()
export class UserV2Entity implements UserV2 {
    // Identificação na base de dados
    @ObjectIdColumn()
    @ApiProperty({
        description: 'Identificação do usuário no banco de dados',
        example: '673ecfbc376a0b1f631c9383',
        type: String
    })
    _id?: UserV2['_id'];

    // Nome do usuário
    @Column()
    @ApiProperty({
        description: 'Nome completo do usuário',
        example: 'Maria Oliveira',
    })
    nome: UserV2['nome'];

    // Foto do usuário
    @Column()
    @ApiProperty({
        description: 'Foto do usuário',
        example: 'base64',
    })
    foto: UserV2['foto'];

    // CPF do usuário
    @Column()
    @ApiProperty({
        description: 'CPF do usuário',
        example: '123.456.789-00',
    })
    cpf: UserV2['cpf'];

    // RG do usuário
    @Column()
    @ApiProperty({
        description: 'RG do usuário',
        example: '12.345.678-9',
    })
    rg: UserV2['rg'];

    // Email do usuário
    @Column()
    @ApiProperty({
        description: 'Email do usuário',
        example: 'maria@example.com',
    })
    email: UserV2['email'];

    // Telefone do usuário
    @Column()
    @ApiProperty({
        description: 'Telefone do usuário',
        example: '+55 11 98765-4321',
    })
    telefone: UserV2['telefone'];

    // Data de nascimento do usuário
    @Column()
    @ApiProperty({
        description: 'Data de nascimento do usuário',
        example: '1990-01-01',
    })
    dataNascimento: UserV2['dataNascimento'];

    @Expose()
    @ApiProperty({ description: 'Idade do usuário', example: 34 })
    get idade(): number | null {
        if (!this.dataNascimento) {
            return null; // Retorna explicitamente `null` se a data de nascimento não for válida
        }

        const today = new Date();
        const birthDate = new Date(this.dataNascimento);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age; // Sempre retorna um número ou null
    }

    // Nível de Acesso
    @Column({ type: "enum", enum: UserRolesV2 })
    role: UserV2['role'];

    // Status de membresia
    @Column({ type: "enum", enum: StatusEnumV2 })
    status: UserV2['status'];

    // Cargo e Ministério
    @Column()
    @ApiProperty({type: Object})
    diacono: UserV2['diacono'];

    @Column("simple-array")
    @ApiProperty({type: [String]})
    ministerio: UserV2['ministerio'];

    @Column()
    @ApiProperty({ type: InformacoesPessoaisDto })
    @Type(() => InformacoesPessoaisDto) // Garante a transformação para o DTO
    informacoesPessoais: UserV2['informacoesPessoais'];

    @Column()
    @ApiPropertyOptional({ type: UserAddressV2Dto })
    endereco: UserV2['endereco'];

    @Column()
    @ApiProperty({ type: IngressoDto })
    ingresso: UserV2['ingresso'];

    @Column()
    @ApiProperty({ type: TransferenciaDto })
    transferencia: UserV2['transferencia'];

    @Column()
    @ApiProperty({ type: FalecimentoDto })
    falecimento: UserV2['falecimento'];

    @Column()
    @ApiProperty({ type: ExclusaoDto })
    exclusao: UserV2['exclusao'];

    @Column()
    @ApiProperty({ type: VisitasDto })
    visitas: UserV2['visitas'];

    @Column()
    @ApiProperty({ type: AutenticacaoDto })
    autenticacao: UserV2['autenticacao'];

    @Column()
    @ApiProperty({type: Boolean})
    isDiacono: UserV2['isDiacono'];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    @ApiProperty({type: HistoricoDto})
    historico: HistoricoDto[];
}
