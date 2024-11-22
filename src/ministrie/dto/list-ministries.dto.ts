import {IMemberDto} from "../../user-v2/dto/create-user-v2.dto";

export interface IListMinistriesDto {
    _id: string;
    nome: string;
    categoria: string;
    responsavel: IMemberDto[];
    createdAt: string | Date;
    updatedAt: string | Date;
}