import {ObjectId} from "typeorm";

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
    estado_civil: boolean;
    conjugue?: IUser;
    data_casamento?: Date;
    possui_filhos: boolean;
    filhos: IUser;
    status: string;
    transferencia: Date;
    diacono: IUser;
    ministerio: number[];
    endereco?: UserAddress;
}