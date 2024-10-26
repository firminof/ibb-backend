import {IUser} from "../../user/domain/entity/abstractions/user";

export interface IListMinistriesDto {
    _id: string;
    nome: string;
    categoria: string;
    responsavel: IUser[];
    createdAt: string | Date;
    updatedAt: string | Date;
}