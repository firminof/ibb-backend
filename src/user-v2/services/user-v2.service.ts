import {BadRequestException, Injectable, Logger, NotFoundException} from "@nestjs/common";
import * as process from "process";

import {UserV2Entity} from "../domain/entity/user-v2.entity";
import {UserV2Repository} from "../repository/user-v2.repository";
import {EmailService} from "../../user/service/email.service";
import {AuthService} from "../../auth/services/auth.service";
import {EventEmitter2} from "@nestjs/event-emitter";
import {formatCPF, formatNome, formatTelefone} from "../../common/helpers/helpers";
import {IMember} from "../domain/entity/abstractions/user-v2.abstraction";
import {CreateUserV2Dto} from "../dto/create-user-v2.dto";
import {EstadoCivilEnum, Providers, StatusEnum, UserRoles} from "../../user/domain/entity/abstractions/user";
import {validateCPFLength} from "../../common/validations/cpf";
import {formatPhoneNumber} from "../../common/validations/telefone";
import {DeepPartial} from "typeorm";
import {DeleteUserV2Dto} from "../dto/delete-user-v2.dto";
import {SendEmailDto} from "../../user/dto/send-email.dto";
import {InviteV2Repository} from "../repository/invite-v2.repository";
import {InviteV2Entity} from "../domain/entity/invite-v2.entity";
import {UpdateUserV2Dto} from "../dto/update-user-v2.dto";

@Injectable()
export class UserV2Service {
    constructor(
        private readonly userV2Repository: UserV2Repository,
        private readonly emailService: EmailService,
        private readonly authService: AuthService,
        private readonly eventEmitter: EventEmitter2,
        private readonly inviteV2Repository: InviteV2Repository
    ) {
    }

    async getAll(): Promise<UserV2Entity[]> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][GET][getAll] - init`);
        try {
            const allMembers: UserV2Entity[] = await this.userV2Repository.getAll();
            if (allMembers.length === 0) return [];

            return this.mapMemberList(allMembers);
        } catch (e) {
            Logger.log(`> [Service][User V2][GET][getAll] catch - ${JSON.stringify(e)}`);

            if (e['message'] === 'No metadata for "UserV2Entity" was found.') {
                throw new BadRequestException('Nenhum item encontrado na base de dados!');
            }
            throw new BadRequestException(e['message']);
        }
    }

    async getAllDiaconos(): Promise<UserV2Entity[]> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][GET][getAllDiaconos] - init`);
        try {
            const allMembers: UserV2Entity[] = await this.userV2Repository.getAllDiaconos();
            if (allMembers.length === 0) return [];

            return this.mapMemberList(allMembers);
        } catch (e) {
            Logger.log(`> [Service][User V2][GET][getAllDiaconos] catch - ${JSON.stringify(e)}`);

            if (e['message'] === 'No metadata for "UserV2Entity" was found.') {
                throw new BadRequestException('Nenhum item encontrado na base de dados!');
            }
            throw new BadRequestException(e['message']);
        }
    }

    async getAllInvites(): Promise<InviteV2Entity[]> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][GET][getAllInvites] - init`);

        try {
            const allInvites: InviteV2Entity[] = await this.inviteV2Repository.getAll();
            if (allInvites.length === 0) return [];

            const allMembers: UserV2Entity[] = await this.userV2Repository.getAll();
            if (allMembers.length === 0) {
                Logger.warn("> [Service][User V2][GET][getAllInvites] - Nenhum membro encontrado.");
                return allInvites.map((item: InviteV2Entity) => ({
                    _id: item?._id?.toString(),
                    memberIdRequested: item.memberIdRequested,
                    to: item.to,
                    phone: item.phone,
                    isAccepted: item.isAccepted,
                    requestName: item.requestName, // Mantém o valor original,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                }));
            }

            // Criando um mapa para busca otimizada
            const memberMap: Map<string, UserV2Entity> = new Map(allMembers.map((member: UserV2Entity) => [member._id.toString(), member]));

            return allInvites.map((item: InviteV2Entity) => {
                const correspondingMember: UserV2Entity = memberMap.get(item.memberIdRequested?.toString());

                Logger.debug(`> [Service][User V2][GET][getAllInvites] - Invite ID: ${item._id}, Member ID: ${correspondingMember?._id?.toString()}, Member Found: ${correspondingMember?.nome ?? "N/A"}`);

                return {
                    _id: item._id.toString(),
                    memberIdRequested: item.memberIdRequested,
                    to: item.to,
                    phone: item.phone,
                    isAccepted: item.isAccepted,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    requestName: correspondingMember ? correspondingMember.nome : item.requestName,
                };
            });

        } catch (e) {
            Logger.error(`> [Service][User V2][GET][getAllInvites] catch - ${e.stack}`);

            if (e['message'] === 'No metadata for "InviteV2Entity" was found.') {
                throw new BadRequestException('Nenhum item encontrado na base de dados!');
            }
            if (e['message'] === 'Cannot read properties of undefined (reading \'_id\')') {
                throw new BadRequestException('Identificação do membro que enviou o convite está incorreto!');
            }
            throw new BadRequestException(e['message']);
        }
    }

    async getAllBirthdaysMonth(month: number): Promise<UserV2Entity[]> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][GET][getAllBirthdaysMonth] - init`);
        try {
            const allMembers: UserV2Entity[] = await this.userV2Repository.getAll();
            if (allMembers.length === 0) return [];

            const allBirthdaysMonth: UserV2Entity[] = [];

            allMembers.forEach((member: UserV2Entity) => {
                const dataNasc: Date = new Date(`${member.dataNascimento.toString().split('T')[0]}T03:01:00.000Z`);

                if ((dataNasc.getMonth() + 1) === Number(month)) {
                    allBirthdaysMonth.push(member);
                }
            })

            return this.mapMemberList(allBirthdaysMonth);

        } catch (e) {
            Logger.log(`> [Service][User V2][GET][getAllBirthdaysMonth] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async getById(id: string): Promise<UserV2Entity> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][GET][getById] - init`);
        try {
            const user: UserV2Entity = await this.userV2Repository.findById(id);
            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            const {foto, ...userToShow} = user;
            Logger.log(`> [Service][User V2][GET][getById] - ${JSON.stringify(userToShow)}`);

            const formatList: UserV2Entity[] = this.mapMemberList([user]);

            return formatList[0];
        } catch (e) {
            Logger.log(`> [Service][User][GET][getById] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    private async getInviteById(id: string): Promise<InviteV2Entity> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][GET][getInviteById] - init`);
        try {
            const invite: InviteV2Entity = await this.inviteV2Repository.findById(id);
            Logger.log(`> [Service][User V2][GET][getInviteById] - ${JSON.stringify(invite)}`);

            if (!invite) {
                throw new NotFoundException('Convite não encontrado!');
            }

            return invite;
        } catch (e) {
            Logger.log(`> [Service][User][GET][getInviteById] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async findByEmail(email: string): Promise<UserV2Entity> {
        Logger.log(`> `);
        Logger.log(`> [Controller][User V2][GET][findByEmail] - init`);
        try {
            const user: UserV2Entity = await this.userV2Repository.findByEmail(email);
            const {foto, ...userToShow} = user;
            Logger.log(`> [Service][User V2][GET][findByEmail] - ${JSON.stringify(userToShow)}`);
            if (!user) {
                throw new NotFoundException('Membro não encontrado!');

            }

            const formatList: UserV2Entity[] = this.mapMemberList([user]);
            return formatList[0];
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    private mapMemberList(members: UserV2Entity[]): UserV2Entity[] {
        return members.map((member: UserV2Entity) => {
            // Ajustar informações de diacono do membro
            member.diacono = {
                nome: member && member.diacono && member.diacono.nome ? formatNome(member.diacono.nome) : '',
                isDiacono: member && member.diacono && member.diacono.isDiacono ? member.diacono.isDiacono : false,
                isMember: member && member.diacono && member.diacono.isMember ? member.diacono.isMember : false,
                id: member && member.diacono && member.diacono.id ? member.diacono.id : ''
            }

            const filhos: IMember[] = [];

            // Ajustar informações de filhos
            if (member && member.informacoesPessoais.filhos && member.informacoesPessoais.filhos.length > 0) {
                member.informacoesPessoais.filhos.forEach((filho: IMember) => {
                    filho.nome = filho && filho.nome ? formatNome(filho.nome) : '';

                    filhos.push(filho);
                })
            }

            member.informacoesPessoais.filhos = filhos;

            // Ajustar informações de casamento (conjugue)
            if (member.informacoesPessoais.casamento) {
                member.informacoesPessoais.casamento.conjugue.nome = member && member.informacoesPessoais && member.informacoesPessoais.casamento && member.informacoesPessoais.casamento.conjugue ?
                    formatNome(member.informacoesPessoais.casamento.conjugue.nome) : '';

                member.informacoesPessoais.casamento.conjugue.id = member && member.informacoesPessoais && member.informacoesPessoais.casamento && member.informacoesPessoais.casamento.conjugue ?
                    member.informacoesPessoais.casamento.conjugue.id : '';

                member.informacoesPessoais.casamento.conjugue.isMember = member && member.informacoesPessoais && member.informacoesPessoais.casamento && member.informacoesPessoais.casamento.conjugue ?
                    member.informacoesPessoais.casamento.conjugue.isMember : false;

                member.informacoesPessoais.casamento.conjugue.isDiacono = member && member.informacoesPessoais && member.informacoesPessoais.casamento && member.informacoesPessoais.casamento.conjugue ?
                    member.informacoesPessoais.casamento.conjugue.isDiacono : false;
            } else {
                member.informacoesPessoais.casamento = {
                    conjugue: {
                        id: "-1",
                        isMember: false,
                        isDiacono: false,
                        nome: ""
                    },
                    dataCasamento: null
                }
            }

            // Ajustar informações de casamento (dataCasamento)
            if (member.informacoesPessoais.casamento.dataCasamento) {
                member.informacoesPessoais.casamento.dataCasamento = member.informacoesPessoais.casamento.dataCasamento ?
                    member.informacoesPessoais.casamento.dataCasamento : null
            }

            const user: UserV2Entity = {
                _id: member._id.toString(),
                nome: formatNome(member.nome),
                rg: member.rg,
                role: member.role,
                telefone: formatTelefone(member.telefone),
                cpf: formatCPF(member.cpf),
                email: member.email,
                dataNascimento: member.dataNascimento,
                idade: member.idade,
                diacono: member.diacono,
                endereco: member.endereco,
                status: member.status,
                ministerio: member.ministerio,

                informacoesPessoais: {
                    casamento: member.informacoesPessoais.casamento,
                    estadoCivil: member.informacoesPessoais.estadoCivil,
                    filhos: member.informacoesPessoais.filhos,
                    temFilhos: member.informacoesPessoais.temFilhos
                },

                exclusao: member.exclusao ? member.exclusao: {data: null, motivo: ''},
                falecimento: member.falecimento ? member.falecimento : {data: null, motivo: '', local: ''},
                ingresso: member.ingresso ? member.ingresso : {data: null, local: '', forma: ''},
                transferencia: member.transferencia ? member.transferencia : {data: null, motivo: '', local: ''},
                visitas: member.visitas ? member.visitas : {motivo: ''},

                autenticacao: member.autenticacao,
                isDiacono: member.isDiacono,
                createdAt: member.createdAt,
                updatedAt: member.updatedAt,
                foto: member.foto,
            }

            return user;
        })
    }

    async create(data: CreateUserV2Dto) {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][POST][Create] - init`);

        try {
            const user = await this.userV2Repository.findByEmail(data.email);

            const userFirebase = await this.authService.findUserByEmail(data.email);

            Logger.log(`> [Service][User V2][Post][POST] user - ${JSON.stringify(user)}`);
            Logger.log(`> [Service][User V2][Post][POST] userFirebase - ${JSON.stringify(userFirebase)}`);

            if (user) {
                throw new BadRequestException('Email já em uso!');
            }

            if (userFirebase) {
                throw new BadRequestException('Email já em uso no Firebase!');
            }

            return await this.createUserUniversal(data);
        } catch (e) {
            Logger.log(`> [Service][User V2][POST][Create] catch - ${JSON.stringify(e)}`);
            if (e['response']['message'].toString().includes('There is no user record corresponding to the provided identifier')) {
                return await this.createUserUniversal(data);
            }

            throw new BadRequestException(e['message']);
        }
    }

    async acceptInvite(inviteId: string, password: string, data: CreateUserV2Dto): Promise<UserV2Entity> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][POST][acceptInvite] - init`);

        try {
            const user = await this.userV2Repository.findByEmail(data.email);

            const userFirebase = await this.authService.findUserByEmail(data.email);

            Logger.log(`> [Service][User V2][Post][POST][acceptInvite] user - ${JSON.stringify(user)}`);
            Logger.log(`> [Service][User V2][Post][POST][acceptInvite] userFirebase - ${JSON.stringify(userFirebase)}`);

            if (user) {
                throw new BadRequestException('Email já em uso!');
            }

            if (userFirebase) {
                throw new BadRequestException('Email já em uso no Firebase!');
            }

            const invite: InviteV2Entity = await this.inviteV2Repository.findById(inviteId);

            if (!invite.isAccepted) {
                // crio o usuário mais desse vez mandando a senha de criação
                await this.createUserUniversal(data, password);

                // atualiza convite para aceito
                await this.inviteV2Repository.update(inviteId, {
                    isAccepted: true,
                })

                Logger.log(`> [Service][User V2][POST][acceptInvite] - finished 1`);
            }
            throw new BadRequestException('Convite aceito anteriormente!');

        } catch (e) {
            Logger.log(`> [Service][User V2][POST][acceptInvite] catch - ${JSON.stringify(e)}`);
            if (e['response']['message'].toString().includes('There is no user record corresponding to the provided identifier')) {
                const invite: InviteV2Entity = await this.inviteV2Repository.findById(inviteId);

                if (!invite.isAccepted) {
                    // crio o usuário mais desse vez mandando a senha de criação
                    await this.createUserUniversal(data, password);

                    // atualiza convite para aceito
                    await this.inviteV2Repository.update(inviteId, {
                        isAccepted: true,
                    })

                    Logger.log(`> [Service][User V2][POST][acceptInvite] - finished 2`);
                    return;
                } else {
                    throw new BadRequestException('Convite aceito anteriormente!');
                }
            }

            throw new BadRequestException(e['message']);
        }
    }

    private async createUserUniversal(data: CreateUserV2Dto, password?: string): Promise<UserV2Entity> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][Post][createUserUniversal] - init`);
        Logger.log(`> [Service][User V2][Post][createUserUniversal] data - ${JSON.stringify(data)}`);

        if (!(data && data.role in UserRoles)) {
            throw new BadRequestException('Regra de usuário inválida!');
        }

        if (!(data && data.status in StatusEnum)) {
            throw new BadRequestException('Status inválido!');
        }

        if (!(data && data.informacoesPessoais.estadoCivil in EstadoCivilEnum)) {
            throw new BadRequestException('Estado civil inválido!');
        }

        if (data && data.cpf) {
            validateCPFLength(data.cpf);
        }

        const user: UserV2Entity = new UserV2Entity();
        user.cpf = data.cpf;
        user.nome = data.nome;
        user.rg = data.rg;
        user.telefone = data.telefone;
        user.role = data.role;
        user.status = data.status;
        user.ministerio = data.ministerio;
        user.dataNascimento = data.dataNascimento;
        user.diacono = data.diacono;
        user.email = data.email;
        user.endereco = data.endereco;
        user.exclusao = {
            data: data.exclusao.data,
            motivo: data.exclusao.motivo
        };
        user.falecimento = {
            data: data.falecimento.data,
            local: data.falecimento.local,
            motivo: data.falecimento.motivo
        };
        user.informacoesPessoais = {
            casamento: {
                conjugue: data.informacoesPessoais.casamento.conjugue,
                dataCasamento: data.informacoesPessoais.casamento.dataCasamento
            },
            estadoCivil: data.informacoesPessoais.estadoCivil,
            filhos: data.informacoesPessoais.filhos,
            temFilhos: data.informacoesPessoais.temFilhos,
        };
        user.ingresso = {
            data: data.ingresso.data,
            forma: data.ingresso.forma,
            local: data.ingresso.local,
        }
        user.transferencia = {
            data: data.transferencia.data,
            local: data.transferencia.local,
            motivo: data.transferencia.motivo,
        };
        user.visitas = {
            motivo: data.visitas.motivo
        }

        user.foto = data.foto;
        user.isDiacono = data.isDiacono;

        const {foto,...userToShow} = user;
        Logger.debug(`> save member ${password ? 'aceitando convite' : ''}: `, JSON.stringify(userToShow));

        const saved: UserV2Entity = await this.userV2Repository.save(user);

        const phoneNumber: string = formatPhoneNumber(saved.telefone);

        const savedFirebase = {
            mongoId: saved._id,
            name: saved.nome,
            email: saved.email,
            role: saved.role,
            phoneNumber,
        };

        if (saved) {
            try {
                const userFirebase = await this.authService.registerUser(savedFirebase, password);

                await this.update(saved._id, {
                    ...saved,
                    autenticacao: {
                        providersInfo: [{
                            providerId: Providers.password,
                            uid: userFirebase.uid
                        }]
                    }
                })
            } catch (e) {
                await this.userV2Repository.delete(saved._id);
                throw new BadRequestException(
                    `${e.message}`,
                );
            }
        }

        Logger.log(`> [Service][User V2][POST][Create] saved - ${JSON.stringify(saved)}`);
        Logger.log(`> [Service][User V2][POST][Create] savedFirebase - ${JSON.stringify(savedFirebase)}`);
        Logger.log(`> [Service][User V2][POST][Create] - finished`);
        return saved;
    }

    async update(id: string, data:any): Promise<UserV2Entity> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][PUT][update] init`);
        Logger.log(`> [Service][User V2][PUT][update][id] - ${id}`);
        Logger.log(`> [Service][User V2][PUT][update][data] - ${JSON.stringify(data)}`);

        try {
            const user: UserV2Entity = await this.userV2Repository.findOneBy({ _id: id });
            const {foto,...userToShow} = user;
            Logger.log(`> [Service][User V2][PUT][update][findById] - ${JSON.stringify(userToShow)}`);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            // Filtrar apenas os campos que mudaram
            const updatedData = Object.keys(data).reduce((acc, key) => {
                if (JSON.stringify(data[key]) !== JSON.stringify(user[key])) {
                    acc[key] = data[key];
                }
                return acc;
            }, {});

            if (Object.keys(updatedData).length === 0) {
                Logger.log(`> [Service][User V2][PUT][update] No changes detected`);
                return user; // Retorna o usuário sem alterações
            }

            Logger.log(`> [Service][User V2][PUT][update][updatedData] - ${JSON.stringify(updatedData)}`);

            // Realizar o update diretamente no banco
            await this.userV2Repository.update(id, updatedData);

            // Retornar o estado atualizado do usuário
            const updatedUser: UserV2Entity = await this.userV2Repository.findOneBy({ _id: id });
            Logger.log(`> [Service][User V2][PUT][update][updatedUser] - ${JSON.stringify(updatedUser)}`);
            return updatedUser!;
        } catch (e) {
            Logger.log(`> [Service][User V2][PUT][update] catch - ${JSON.stringify(e)}`);
            if (e['message'].includes('E11000 duplicate key error collection')) {
                throw new BadRequestException('Houve uma falha ao atualizar o membro, tente novamente.');
            }
            throw new BadRequestException(e['message']);
        }
    }



    async delete(param: DeleteUserV2Dto): Promise<boolean> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][DELETE] init`);
        try {
            const user: UserV2Entity = await this.userV2Repository.findById(param.id);
            Logger.log(`> [Service][User V2][PUT][update][findById] - ${JSON.stringify(user)}`);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            await this.authService.removeUserV2(user);
            await this.userV2Repository.deleteUser(user);

            return true;
        } catch (e) {
            Logger.error(`> [Service][User V2][DELETE] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async deleteInvite(param: DeleteUserV2Dto): Promise<boolean> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][DELETE INVITE] init`);
        try {
            const invite: InviteV2Entity = await this.inviteV2Repository.findById(param.id);
            Logger.log(`> [Service][User V2][DELETE INVITE][findById] - ${JSON.stringify(invite)}`);

            if (!invite) {
                throw new NotFoundException('Membro não encontrado!');
            }

            await this.inviteV2Repository.deleteInvite(invite);

            return true;
        } catch (e) {
            Logger.log(`> [Service][User V2][DELETE INVITE] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async sendInvite(data: SendEmailDto): Promise<string> {
        Logger.log(`> `);
        Logger.log(`> [Service][User V2][POST][sendInvite] - init`);

        if (data.phone.length > 0 && data.phone !== 'string') {
            const inviteToSave: InviteV2Entity = {
                memberIdRequested: data.memberIdRequested,
                requestName: data.requestName,
                to: data.to,
                phone: data.phone,
                isAccepted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            const savedInvite: InviteV2Entity = await this.inviteV2Repository.save(inviteToSave);

            Logger.log(`Convite criado (whatsapp): ${JSON.stringify(savedInvite)}`);
            const linkConvite: string = `${process.env.APPLICATION_URL_PROD}/invite?id=${savedInvite._id.toString()}`;


            this.eventEmitter.emit('twillio-whatsapp.send-invite.send', {
                email: data.to,
                numeroWhatsapp: data.phone,
                linkConvite
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

        const inviteToSave: InviteV2Entity = {
            memberIdRequested: data.memberIdRequested,
            requestName: data.requestName,
            to: data.to,
            phone: data.phone,
            isAccepted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const savedInvite: InviteV2Entity = await this.inviteV2Repository.save(inviteToSave);

        Logger.log(`Convite criado (email): ${JSON.stringify(savedInvite)}`);
        const linkConvite: string = `${process.env.APPLICATION_URL_PROD}/invite?id=${savedInvite._id.toString()}`;

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
}