export interface UserAddressV2 {
    cep: string;
    rua: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
}

export enum UserRolesV2 {
    ADMIN = 'ADMIN',
    MEMBRO = 'MEMBRO',
}

export enum StatusEnumV2 {
    visitante = 'visitante',
    congregado = 'congregado',
    ativo = 'ativo',
    inativo = 'inativo',
    transferido = 'transferido',
    falecido = 'falecido',
    excluido = 'excluido',
}

export enum CivilStateEnumV2 {
    solteiro = 'solteiro',
    casado = 'casado',
    separado = 'separado',
    divorciado = 'divorciado',
    viuvo = 'viuvo',
}

export enum ProvidersV2 {
    microsoftCom = 'microsoft.com',
    googleCom = 'google.com',
    password = 'password',
}

export interface FirebaseProviderInfoV2 {
    providerId: ProvidersV2;
    uid: string;
}

export interface IMember {
    id: string;
    nome: string;
    isMember: boolean;
    isDiacono: boolean;
}

export interface Historico {
    chave: string;
    antigo: string;
    novo: string;
    updatedAt: Date;
}

export interface UserV2 {
    // Identificação na base de dados
    _id?: string;

    // Identificação Básica
    nome: string;
    foto: string;
    cpf: string;
    rg: string;
    email: string;
    telefone: string;
    dataNascimento: Date;

    // Nivel de acesso
    role: UserRolesV2;

    // Status de membresia
    status: StatusEnumV2;

    // Informações Pessoais
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
    diacono: IMember;
    ministerio: string[];

    // Dados de Endereço
    endereco: UserAddressV2 | null;

    // Dados de Ingresso
    ingresso: {
        data: Date | null;
        forma: string | null;
        local: string | null;
    };

    // Transferência
    transferencia: {
        data: Date | null;
        motivo: string | null;
        local: string | null;
    };

    // Falecimento
    falecimento: {
        data: Date | null;
        motivo: string | null;
        local: string | null;
    };

    // Exclusão
    exclusao: {
        data: Date | null;
        motivo: string | null;
    };

    // Visitas
    visitas: {
        motivo: string | null;
    };

    // Informações de Autenticação
    autenticacao: {
        providersInfo: FirebaseProviderInfoV2[];
    };

    // Membro é diacono
    isDiacono: boolean;

    // Historico de atualizações do usuário
    historico: Historico[];
}