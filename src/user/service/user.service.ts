import {BadRequestException, Injectable, Logger} from "@nestjs/common";
import {UserRepository} from "../repository/user.repository";
import {UserEntity} from "../domain/entity/user.entity";
import {CreateUserDto} from "../dto/create-user.dto";
import {CreateUserValidation} from "./create-user-validation";

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private createUserValidation: CreateUserValidation,
    ) {}

    async getAll(): Promise<UserEntity[]> {
        try {
            return await this.userRepository.getAll();
        } catch (e) {
            throw e;
        }
    }

    async create(data: CreateUserDto) {
        Logger.log(`> [Service][User][Post][Create] - init`);
        try {
            const user = await this.userRepository.findByEmail(data.email);
            Logger.log(`> [Service][User][Post][Create] user - ${JSON.stringify(user)}`);

            if (user) {
                throw new BadRequestException('Email já em uso!');
            }

            const validatedInput = this.createUserValidation.validate(data);

            const newUser: UserEntity = {
                conjugue: validatedInput.conjugue,
                cpf: validatedInput.cpf,
                data_casamento: validatedInput.data_casamento,
                data_nascimento: validatedInput.data_nascimento,
                diacono: validatedInput.diacono,
                email: validatedInput.email,
                endereco: validatedInput.endereco,
                estado_civil: validatedInput.estado_civil,
                filhos: validatedInput.filhos,
                foto: validatedInput.foto,
                ministerio: validatedInput.ministerio,
                nome: validatedInput.nome,
                possui_filhos: validatedInput.possui_filhos,
                rg: validatedInput.rg,
                role: validatedInput.role,
                status: validatedInput.status,
                telefone: validatedInput.telefone,
                transferencia: validatedInput.transferencia,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const saved = await this.userRepository.save(newUser);
            Logger.log(`> [Service][User][Post][Create] saved - ${JSON.stringify(saved)}`);
            Logger.log(`> [Service][User][Post][Create] - finished`);
        } catch (e) {
            Logger.log(`> [Service][User][Post][Create] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async findByEmail(email: string) {
        try {
            return await this.userRepository.findByEmail(email);
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }
}