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
    estado_civil: boolean;
    conjugue: IUser | null;
    data_casamento?: string | null;
    possui_filhos: boolean;
    filhos: IUser[]  | null;
    status: string;
    transferencia: string | null;
    diacono: IUser;
    ministerio: number[];
    role?: string;
    updatedAt: string;
}