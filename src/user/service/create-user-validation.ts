import {BadRequestException, Injectable, Logger} from "@nestjs/common";
import {CreateUserDto} from "../dto/create-user.dto";
import {UserRoles} from "../domain/entity/abstractions/user";
import {validateCPFLength} from "../../common/validations/cpf";

@Injectable()
export class CreateUserValidation {
    validate(createUserDto: CreateUserDto) {
        Logger.log(`> [Service][User][Post][validate] - init`);
        if (!(createUserDto.role in UserRoles)) {
            throw new BadRequestException('Regra de usuário inválida!');
        }

        if (createUserDto.cpf) {
            validateCPFLength(createUserDto.cpf);
        }

        if (createUserDto.ministerio.length === 0) {
            createUserDto.ministerio = [];
        }

        return createUserDto;
    }
}