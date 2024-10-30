import {BadRequestException, Injectable, Logger} from "@nestjs/common";
import {CreateUserDto} from "../dto/create-user.dto";
import {EstadoCivilEnum, StatusEnum, UserRoles} from "../domain/entity/abstractions/user";
import {validateCPFLength} from "../../common/validations/cpf";
import {CreateUserInviteDto} from "../dto/create-user-invite.dto";

@Injectable()
export class CreateUserValidation {
    validate(createUserDto: CreateUserDto) {
        Logger.log(`> [Service][User][Post][validate] - init`);
        if (!(createUserDto && createUserDto.role in UserRoles)) {
            throw new BadRequestException('Regra de usuário inválida!');
        }

        if (!(createUserDto && createUserDto.status in StatusEnum)) {
            throw new BadRequestException('Status inválido!');
        }

        if (!(createUserDto && createUserDto.estado_civil in EstadoCivilEnum)) {
            throw new BadRequestException('Estado civil inválido!');
        }

        if (createUserDto && createUserDto.cpf) {
            validateCPFLength(createUserDto.cpf);
        }

        if (createUserDto && createUserDto.ministerio.length === 0) {
            createUserDto.ministerio = [];
        }

        if (createUserDto && createUserDto.filhos && createUserDto.filhos.length === 0) {
            createUserDto.filhos = [];
        }

        return createUserDto;
    }

    validateInvite(createUserInviteDto: CreateUserInviteDto) {
        Logger.log(`> [Service][User][Post][validateInvite] - init`);
        if (!(createUserInviteDto && createUserInviteDto.role in UserRoles)) {
            throw new BadRequestException('Regra de usuário inválida!');
        }

        if (!(createUserInviteDto && createUserInviteDto.status in StatusEnum)) {
            throw new BadRequestException('Status inválido!');
        }

        if (!(createUserInviteDto && createUserInviteDto.estado_civil in EstadoCivilEnum)) {
            throw new BadRequestException('Estado civil inválido!');
        }

        if (createUserInviteDto && createUserInviteDto.cpf) {
            validateCPFLength(createUserInviteDto.cpf);
        }

        if (createUserInviteDto && createUserInviteDto.ministerio.length === 0) {
            createUserInviteDto.ministerio = [];
        }

        if (createUserInviteDto && createUserInviteDto.filhos && createUserInviteDto.filhos.length === 0) {
            createUserInviteDto.filhos = [];
        }

        return createUserInviteDto;
    }

    capitalizeFirstLetter(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
}