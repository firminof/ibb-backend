import {BadRequestException, Injectable, Logger, NotFoundException} from "@nestjs/common";
import {UserRepository} from "../repository/user.repository";
import {UserEntity} from "../domain/entity/user.entity";
import {CreateUserDto} from "../dto/create-user.dto";
import {CreateUserValidation} from "./create-user-validation";
import {UpdateUserDto} from "../dto/update-user.dto";
import {DeleteUserDto} from "../dto/delete-user.dto";

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private createUserValidation: CreateUserValidation,
    ) {
    }

    async getAll(): Promise<UserEntity[]> {
        Logger.log(`> [Service][User][GET][getAll] - init`);
        try {
            return await this.userRepository.getAll();
        } catch (e) {
            Logger.log(`> [Service][User][GET][getAll] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async create(data: CreateUserDto) {
        Logger.log(`> [Service][User][POST][Create] - init`);
        try {
            const user = await this.userRepository.findByEmail(data.email);
            Logger.log(`> [Service][User][Post][POST] user - ${JSON.stringify(user)}`);

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
            Logger.log(`> [Service][User][POST][Create] saved - ${JSON.stringify(saved)}`);
            Logger.log(`> [Service][User][POST][Create] - finished`);
        } catch (e) {
            Logger.log(`> [Service][User][POST][Create] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async update(id: string, data: UpdateUserDto) {
        Logger.log(`> [Service][User][PUT][update] init`);
        try {
            const user: UserEntity = await this.userRepository.findById(id);
            Logger.log(`> [Service][User][PUT][update][findById] - ${JSON.stringify(user)}`);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            const saved = await this.userRepository.save({
                ...user,
                ...data
            })
            Logger.log(`> [Service][User][PUT][update] saved - ${JSON.stringify(saved)}`);
            Logger.log(`> [Service][User][PUT][update] finished`);
        } catch (e) {
            Logger.log(`> [Service][User][PUT][update] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async delete(param: DeleteUserDto) {
        Logger.log(`> [Service][User][DELETE] init`);
        try {
            const user: UserEntity = await this.userRepository.findById(param.id);
            Logger.log(`> [Service][User][PUT][update][findById] - ${JSON.stringify(user)}`);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            await this.userRepository.deleteUser(user);
        } catch (e) {
            Logger.log(`> [Service][User][DELETE] catch - ${JSON.stringify(e)}`);
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