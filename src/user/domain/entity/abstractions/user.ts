export interface UserAddress {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
}

export enum UserRoles {
    'ADMIN' = 'ADMIN',
    'MEMBRO' = 'MEMBRO',
}

export enum StatusEnum {
    'visitante' = 'visitante',
    'congregado' = 'congregado',
    'ativo' = 'ativo',
    'inativo' = 'inativo',
    'transferido' = 'transferido',
    'falecido' = 'falecido',
    'excluido' = 'excluido',
}

export enum EstadoCivilEnum {
    'solteiro' = 'solteiro',
    'casado' = 'casado',
    'separado' = 'separado',
    'divorciado' = 'divorciado',
    'viuvo' = 'viuvo',
}

export enum Providers {
    'microsoft.com' = 'microsoft.com',
    'google.com' = 'google.com',
    'password' = 'password',
}

export interface FirebaseProviderInfo {
    providerId: Providers;
    uid: string;
}

export interface IUser {
    id: number;
    nome: string;
    is_membro: boolean;
}

export interface User {
    _id?: string;
    role: UserRoles;
    nome: string;
    cpf: string;
    rg: string;
    email: string;
    telefone: string;
    foto?: string;
    data_nascimento: Date;
    estado_civil: EstadoCivilEnum;
    conjugue?: IUser;
    data_casamento?: Date;
    possui_filhos: boolean;
    filhos: IUser[];
    status: StatusEnum;
    diacono: IUser;
    ministerio: string[];
    endereco?: UserAddress;

    data_ingresso?: Date | null;
    forma_ingresso?: string | null;
    local_ingresso?: string | null;

    transferencia: Date | null;
    motivo_transferencia?: string | null;

    falecimento?: Date | null;
    motivo_falecimento?: string | null;

    excluido?: Date | null;
    motivo_exclusao?: string | null;

    motivo_visita?: string | null;

    providersInfo: FirebaseProviderInfo[];

    is_diacono: boolean;
}