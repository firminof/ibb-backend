import {BadRequestException, Injectable, Logger, NotFoundException} from "@nestjs/common";
import {UserRepository} from "../repository/user.repository";
import {UserEntity} from "../domain/entity/user.entity";
import {CreateUserDto} from "../dto/create-user.dto";
import {CreateUserValidation} from "./create-user-validation";
import {UpdateUserDto} from "../dto/update-user.dto";
import {DeleteUserDto} from "../dto/delete-user.dto";
import {IUserResponseApi} from "../dto/list-users.dto";
import {formatListMember} from "../../common/helpers/helpers";
import {EmailService} from "./email.service";
import {SendEmailDto} from "../dto/send-email.dto";
import {CreateUserInviteDto} from "../dto/create-user-invite.dto";
import {UpdateInfoDto} from "../dto/update-info.dto";
import {formatPhoneNumber} from "../../common/validations/telefone";
import {AuthService} from "../../auth/services/auth.service";
import {Providers} from "../domain/entity/abstractions/user";
import * as process from "process";
import {EventEmitter2, OnEvent} from "@nestjs/event-emitter";

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private createUserValidation: CreateUserValidation,
        private emailService: EmailService,
        private authService: AuthService,
        private eventEmitter: EventEmitter2
    ) {
    }

    async getAll(): Promise<IUserResponseApi[]> {
        Logger.log(`> [Service][User][GET][getAll] - init`);
        try {
            const allMembers: UserEntity[] = await this.userRepository.getAll();

            return formatListMember(allMembers);
        } catch (e) {
            Logger.log(`> [Service][User][GET][getAll] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async getById(id: string): Promise<IUserResponseApi> {
        Logger.log(`> [Service][User][GET][getById] - init`);
        try {
            const user: UserEntity = await this.userRepository.findById(id);
            Logger.log(`> [Service][User][GET][getById] - ${JSON.stringify(user)}`);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            const formatList = formatListMember([user]);

            return formatList[0];
        } catch (e) {
            Logger.log(`> [Service][User][GET][getById] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async getAllBirthdaysMonth(month: number): Promise<IUserResponseApi[]> {
        Logger.log(`> [Service][User][GET][getAllBirthdaysMonth] - init`);
        try {
            const allMembers: UserEntity[] = await this.userRepository.getAll();

            const allBirthdaysMonth: UserEntity[] = [];

            allMembers.forEach((member: UserEntity) => {
                const dataNasc: Date = new Date(`${member.data_nascimento.toString().split('T')[0]}T03:01:00.000Z`);

                if ((dataNasc.getMonth() + 1) === Number(month)) {
                    allBirthdaysMonth.push(member);
                }
            })

            return formatListMember(allBirthdaysMonth);
        } catch (e) {
            Logger.log(`> [Service][User][GET][getAllBirthdaysMonth] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async create(data: CreateUserDto) {
        Logger.log(`> [Service][User][POST][Create] - init`);
        try {
            const user = await this.userRepository.findByEmail(data.email);

            const userFirebase = await this.authService.findUserByEmail(data.email);

            Logger.log(`> [Service][User][Post][POST] user - ${JSON.stringify(user)}`);
            Logger.log(`> [Service][User][Post][POST] userFirebase - ${JSON.stringify(userFirebase)}`);

            if (user) {
                throw new BadRequestException('Email já em uso!');
            }

            if (userFirebase) {
                throw new BadRequestException('Email já em uso no Firebase!');
            }

            return await this.createUserUniversal(data);

        } catch (e) {
            Logger.log(`> [Service][User][POST][Create] catch - ${JSON.stringify(e)}`);
            Logger.log(`> [Service][User][POST][Create] catch message - ${e['response']['message']}`);
            if (e['response']['message'].toString().includes('There is no user record corresponding to the provided identifier')) {
                return await this.createUserUniversal(data);
            }
            throw new BadRequestException(e['message']);
        }
    }

    async createUserUniversal(data: CreateUserDto) {
        const validatedInput: CreateUserDto = this.createUserValidation.validate(data);

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
            data_ingresso: validatedInput.data_ingresso,
            excluido: validatedInput.excluido,
            falecimento: validatedInput.falecimento,
            forma_ingresso: validatedInput.forma_ingresso,
            local_ingresso: validatedInput.local_ingresso,
            motivo_exclusao: validatedInput.motivo_exclusao,
            motivo_falecimento: validatedInput.motivo_falecimento,
            motivo_transferencia: validatedInput.motivo_transferencia,
            motivo_visita: validatedInput.motivo_visita,
            providersInfo: [],
            is_diacono: validatedInput.is_diacono
        }

        const saved = await this.userRepository.save(newUser);
        const phoneNumber = formatPhoneNumber(saved.telefone);

        const savedFirebase = {
            mongoId: saved._id,
            name: saved.nome,
            email: saved.email,
            role: saved.role,
            phoneNumber,
        };

        if (saved) {
            try {
                const userFirebase = await this.authService.registerUser(savedFirebase);

                await this.update(saved._id, {
                    providersInfo: [{
                        providerId: Providers.password,
                        uid: userFirebase.uid
                    }]
                })
            } catch (e) {
                await this.userRepository.delete(saved._id);
                throw new BadRequestException(
                    `Error while creating user in Firebase - ${e.message}`,
                );
            }
        }

        Logger.log(`> [Service][User][POST][Create] saved - ${JSON.stringify(saved)}`);
        Logger.log(`> [Service][User][POST][Create] savedFirebase - ${JSON.stringify(savedFirebase)}`);
        Logger.log(`> [Service][User][POST][Create] - finished`);
        return saved;

        return saved;
    }

    async registrationUpdate(data: UpdateInfoDto) {
        Logger.log(`> [Service][User][POST][registrationUpdate] - init`);
        try {
            return Logger.log(`> [Service][User][POST][registrationUpdate] - finished`);
        } catch (e) {
            Logger.log(`> [Service][User][POST][registrationUpdate] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async acceptInvite(data: CreateUserInviteDto) {
        Logger.log(`> [Service][User][POST][acceptInvite] - init`);
        try {
            const user = await this.userRepository.findByEmail(data.email);
            Logger.log(`> [Service][User][Post][acceptInvite] user - ${JSON.stringify(user)}`);

            if (user) {
                throw new BadRequestException('Email já em uso!');
            }

            const validatedInput: CreateUserInviteDto = this.createUserValidation.validateInvite(data);

            const newUser: UserEntity = {
                conjugue: validatedInput.conjugue,
                cpf: validatedInput.cpf,
                data_casamento: validatedInput.data_casamento,
                data_nascimento: validatedInput.data_nascimento,
                diacono: {
                    id: 0,
                    nome: '',
                    is_membro: false
                },
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
                transferencia: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                data_ingresso: null,
                excluido: null,
                falecimento: null,
                forma_ingresso: null,
                local_ingresso: null,
                motivo_exclusao: null,
                motivo_falecimento: null,
                motivo_transferencia: null,
                motivo_visita: null,
                providersInfo: [],
                is_diacono: validatedInput.is_diacono,
            }

            const saved = await this.userRepository.save(newUser);
            Logger.log(`> [Service][User][POST][acceptInvite] saved - ${JSON.stringify(saved)}`);
            Logger.log(`> [Service][User][POST][acceptInvite] - finished`);
        } catch (e) {
            Logger.log(`> [Service][User][POST][acceptInvite] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async update(id: string, data: UpdateUserDto) {
        Logger.log(`> [Service][User][PUT][update] init`);
        Logger.log(`> [Service][User][PUT][update][data] - ${JSON.stringify(data)}`);
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
            if (e['message'].includes('E11000 duplicate key error collection'))
                throw new BadRequestException('Houve uma falha ao atualizar o membro, tente novamente.');
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
            await this.authService.removeUser(user);
        } catch (e) {
            Logger.log(`> [Service][User][DELETE] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async sendInvite(data: SendEmailDto) {
        Logger.log(`> [Service][User][POST][sendInvite] - init`);

        if (data.phone.length > 0 && data.phone !== 'string') {
            this.eventEmitter.emit('twillio-whatsapp.send-invite.send', {
                email: data.to,
                numeroWhatsapp: data.phone
            })
            return 'Convite enviado por WhatsApp!'
        }

        if (!data) {
            throw new NotFoundException('Configuração do email não informada!');
        }

        if (data.to.length === 0) {
            throw new NotFoundException('Destinatário não informado!');
        }

        if (data.subject.length === 0) {
            throw new NotFoundException('Assunto não informado!');
        }

        if (data.text.length === 0) {
            throw new NotFoundException('Texto não informado!');
        }

        const linkConvite = `${process.env.APPLICATION_URL_PROD}/invite?email=${data.to}`;

        data.html =
            `
            <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite de Membresia</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center" style="background-color: #f8f8f8; padding: 20px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
                    <tr>
                        <td align="center">
                            <h1 style="color: #333333;">🎉 Convite Especial!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <img src="http://cdn.mcauto-images-production.sendgrid.net/9b153d64518b45c6/8ec43570-853b-496f-9111-76bc28cdae49/1600x673.jpeg" alt="Imagem de Boas-Vindas" style="max-width: 100%; height: auto; border-radius: 10px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: left;">
                        
                            <p>Temos o prazer de convidá-lo(a) para fazer parte da nossa comunidade! É com grande entusiasmo que oferecemos a você a oportunidade de se tornar um membro e se juntar a nós em nossa jornada.</p>
                            <h3>Por que se juntar a nós?</h3>
                            <ul>
                                <li>Acesso exclusivo a eventos especiais</li>
                                <li>Conteúdo único para membros</li>
                            </ul>
                            <p>Estamos ansiosos para vê-lo(a) se juntar a nós e fazer parte de algo verdadeiramente especial.</p>
                            <p> Clique no botão abaixo para aceitar nosso convite e iniciar sua jornada conosco!</p>
                            <p style="text-align: center;">
                                <a href="${linkConvite}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Aceitar Convite</a>
                            </p>
                            <p>Se você tiver alguma dúvida, sinta-se à vontade para entrar em contato conosco.</p>
                            <p>Atenciosamente,</p>
                            <p><strong>Igreja Batista do Brooklin</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px; font-size: 12px; color: #666;">
                            <p>Se você não solicitou este convite, por favor, ignore este e-mail.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `;
        // {
        //     "to": "filipefirminof@hotmail.com",
        //     "subject": "Convite IBB",
        //     "text": "Convite IBB"
        // }
        try {
            const sendEmailBySendGrid = await this.emailService.sendEmail(data.to, data.subject, data.text, data.html);

            if (sendEmailBySendGrid.success) {
                return 'Email enviado com sucesso!'
            } else {
                return 'Falha ao enviar o email!'
            }
        } catch (e) {
            Logger.log(`> [Service][User][POST][sendInvite] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async findByEmail(email: string): Promise<IUserResponseApi> {
        try {
            return await this.userRepository.findByEmail(email);
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    @OnEvent('user-service.forget-password.send')
    async forgetPassword(data: { link: string, email: string }) {
        Logger.log(`> [Service][User][forgetPassword] init`);
        Logger.log(`> [Service][User][forgetPassword] - email: ${data.email}`);
        try {
            const user: UserEntity = await this.userRepository.findByEmail(data.email);
            Logger.log(`> [Service][User][forgetPassword][findByEmail] - ${JSON.stringify(user)}`);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            this.eventEmitter.emit('twillio-whatsapp.forget-password.send', {
                link: data.link,
                numeroWhatsapp: user.telefone
            })
        } catch (e) {
            Logger.log(`> [Service][User][forgetPassword] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }
}