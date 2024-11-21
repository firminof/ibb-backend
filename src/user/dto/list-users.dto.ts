export interface IUser {
    id: number;
    nome: string;
}

export interface IUserResponseApi {
    _id: string;
    nome: string;
    cpf: string;
    rg: string;
    email: string;
    idade: number;
    telefone: string;
    foto: string;
    data_nascimento: string;
    estado_civil: string;
    conjugue: IUser | null;
    data_casamento?: string | null;
    possui_filhos: boolean;
    filhos: IUser[]  | null;
    status: string;

    diacono: IUser;
    ministerio: string[];
    role?: string;
    updatedAt: string;
    createdAt: string;

    data_ingresso?: string | null;
    forma_ingresso?: string | null;
    local_ingresso?: string | null;

    transferencia: string | null;
    motivo_transferencia?: string | null;

    falecimento?: string | null;
    motivo_falecimento?: string | null;

    excluido?: string | null;
    motivo_exclusao?: string | null;

    motivo_visita?: string | null;

    is_diacono: boolean;
}