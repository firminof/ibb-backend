import {BadRequestException, Injectable, Logger} from "@nestjs/common";
import {CreateUserDto} from "../dto/create-user.dto";
import {EstadoCivilEnum, StatusEnum, UserRoles} from "../domain/entity/abstractions/user";
import {validateCPFLength} from "../../common/validations/cpf";
import {CreateUserInviteDto} from "../dto/create-user-invite.dto";

@Injectable()
export class CreateUserValidation {
    validate(createUserDto: CreateUserDto) {
        Logger.log(`> [Service][User][Post][validate] - init`);
        if (!(createUserDto.role in UserRoles)) {
            throw new BadRequestException('Regra de usuário inválida!');
        }

        if (!(createUserDto.status in StatusEnum)) {
            throw new BadRequestException('Status inválido!');
        }

        if (!(createUserDto.estado_civil in EstadoCivilEnum)) {
            throw new BadRequestException('Estado civil inválido!');
        }

        if (createUserDto.cpf) {
            validateCPFLength(createUserDto.cpf);
        }

        if (createUserDto.ministerio.length === 0) {
            createUserDto.ministerio = [];
        }

        return createUserDto;
    }

    validateInvite(createUserInviteDto: CreateUserInviteDto) {
        Logger.log(`> [Service][User][Post][validateInvite] - init`);
        if (!(createUserInviteDto.role in UserRoles)) {
            throw new BadRequestException('Regra de usuário inválida!');
        }

        if (!(createUserInviteDto.status in StatusEnum)) {
            throw new BadRequestException('Status inválido!');
        }

        if (!(createUserInviteDto.estado_civil in EstadoCivilEnum)) {
            throw new BadRequestException('Estado civil inválido!');
        }

        if (createUserInviteDto.cpf) {
            validateCPFLength(createUserInviteDto.cpf);
        }

        if (createUserInviteDto.ministerio.length === 0) {
            createUserInviteDto.ministerio = [];
        }

        return createUserInviteDto;
    }

    capitalizeFirstLetter(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
}