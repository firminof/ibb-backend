import {BadRequestException, Injectable, Logger, NotFoundException} from "@nestjs/common";
import * as process from "process";

import {HistoricoDto, UserV2Entity} from "../domain/entity/user-v2.entity";
import {UserV2Repository} from "../repository/user-v2.repository";
import {EmailService} from "../../user/service/email.service";
import {AuthService} from "../../auth/services/auth.service";
import {EventEmitter2} from "@nestjs/event-emitter";
import {formatCPF, formatNome, formatTelefone, gerarHistorico} from "../../common/helpers/helpers";
import {CivilStateEnumV2, Historico, IMember} from "../domain/entity/abstractions/user-v2.abstraction";
import {CreateUserV2Dto} from "../dto/create-user-v2.dto";
import {EstadoCivilEnum, Providers, StatusEnum, UserRoles} from "../../user/domain/entity/abstractions/user";
import {validateCPFLength} from "../../common/validations/cpf";
import {formatPhoneNumber} from "../../common/validations/telefone";
import {DeleteUserV2Dto} from "../dto/delete-user-v2.dto";
import {SendEmailDto} from "../../user/dto/send-email.dto";
import {InviteV2Repository} from "../repository/invite-v2.repository";
import {InviteV2Entity} from "../domain/entity/invite-v2.entity";
import {RequestUpdateV2Dto} from "../dto/request-update-v2.dto";
import {TwilioMessagingService} from "../../common/services/twilio-messaging.service";
import {UploadService} from "./upload.service";
import {firebaseApp} from "../../auth/config/firebase.config";
import * as admin from 'firebase-admin';

@Injectable()
export class UserV2Service {
    constructor(
        private readonly userV2Repository: UserV2Repository,
        private readonly emailService: EmailService,
        private readonly authService: AuthService,
        private readonly eventEmitter: EventEmitter2,
        private readonly inviteV2Repository: InviteV2Repository,
        private readonly twilioMessagingService: TwilioMessagingService,
        private readonly uploadService: UploadService,
    ) {
    }

    async getAll(): Promise<UserV2Entity[]> {
        Logger.log(`> [Service][User V2][GET][getAll] - init`);
        try {
            const allMembers: UserV2Entity[] = await this.userV2Repository.getAll();
            if (allMembers.length === 0) return [];
            let mappedMembers: UserV2Entity[] = [];

            try {
                Logger.log(`> [Service][User V2][GET][getAll] - membros recolhidos`);
                mappedMembers = await this.mapMemberList(allMembers);
            } catch (e) {
                Logger.log(`> [Service][User V2][GET][getAll][Erro] - mapear membros `, e.stack);
            }

            Logger.log(`> [Service][User V2][GET][getAll] - membros mapeados`);
            return mappedMembers;

        } catch (e) {
            Logger.log(`> [Service][User V2][GET][getAll] catch - ${JSON.stringify(e)}`);

            if (e['message'] === 'No metadata for "UserV2Entity" was found.') {
                throw new BadRequestException('Nenhum item encontrado na base de dados!');
            }
            throw new BadRequestException(e['message']);
        }
    }

    async getAllTotal(): Promise<{ total: number }> {
        Logger.log(`> [Service][User V2][GET][getAllTotal] - init`);
        try {
            const allMembers: UserV2Entity[] = await this.userV2Repository.getAll();
            if (allMembers.length === 0) return {total: 0};

            return {total: allMembers.length};

        } catch (e) {
            Logger.log(`> [Service][User V2][GET][getAllTotal] catch - ${JSON.stringify(e)}`);

            if (e['message'] === 'No metadata for "UserV2Entity" was found.') {
                throw new BadRequestException('Nenhum item encontrado na base de dados!');
            }
            throw new BadRequestException(e['message']);
        }
    }

    async getAllDiaconos(): Promise<UserV2Entity[]> {
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

    async getAllByMemberIdRequested(id: string): Promise<InviteV2Entity[]> {
        Logger.log(`> [Service][User V2][GET][getAllByMemberIdRequested] - init`);

        try {
            const allInvites: InviteV2Entity[] = await this.inviteV2Repository.findByMemberIdRequested(id);
            if (allInvites.length === 0) return [];

            const allMembers: UserV2Entity[] = await this.userV2Repository.getAll();
            if (allMembers.length === 0) {
                Logger.warn("> [Service][User V2][GET][getAllByMemberIdRequested] - Nenhum membro encontrado.");
                return allInvites.map((item: InviteV2Entity) => ({
                    _id: item?._id?.toString(),
                    memberIdRequested: item.memberIdRequested,
                    to: item && item.to && item.to !== '' ? item.to : item.phone,
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

                Logger.debug(`> [Service][User V2][GET][getAllByMemberIdRequested] - Invite ID: ${item._id}, Member ID: ${correspondingMember?._id?.toString()}, Member Found: ${correspondingMember?.nome ?? "N/A"}`);

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
            Logger.error(`> [Service][User V2][GET][getAllByMemberIdRequested] catch - ${e.stack}`);

            if (e['message'] === 'No metadata for "InviteV2Entity" was found.') {
                throw new BadRequestException('Nenhum item encontrado na base de dados!');
            }
            if (e['message'] === 'Cannot read properties of undefined (reading \'_id\')') {
                throw new BadRequestException('Identificação do membro que enviou o convite está incorreto!');
            }
            throw new BadRequestException(e['message']);
        }
    }

    async getInviteInfo(id: string): Promise<InviteV2Entity> {
        Logger.log(`> [Service][User V2][GET][getInviteInfo] - init`);

        try {
            const invite: InviteV2Entity = await this.inviteV2Repository.findById(id);
            if (!invite)
                throw new NotFoundException('Nenhum convite encontrado na base de dados!');

            const allMembers: UserV2Entity[] = await this.userV2Repository.getAll();

            if (allMembers.length === 0) {
                Logger.warn("> [Service][User V2][GET][getInviteInfo] - Nenhum membro encontrado.");
                const mappedInvite: InviteV2Entity[] = [invite].map((item: InviteV2Entity) => ({
                    _id: item?._id?.toString(),
                    memberIdRequested: item.memberIdRequested,
                    to: item && item.to && item.to !== '' ? item.to : item.phone,
                    phone: item.phone,
                    isAccepted: item.isAccepted,
                    requestName: item.requestName, // Mantém o valor original,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                }));

                return mappedInvite[0];
            }

            // Criando um mapa para busca otimizada
            const memberMap: Map<string, UserV2Entity> = new Map(allMembers.map((member: UserV2Entity) => [member._id.toString(), member]));

            const mappedInvite: InviteV2Entity[] = [invite].map((item: InviteV2Entity) => {
                const correspondingMember: UserV2Entity = memberMap.get(item.memberIdRequested?.toString());

                Logger.debug(`> [Service][User V2][GET][getInviteInfo] - Invite ID: ${item._id}, Member ID: ${correspondingMember?._id?.toString()}, Member Found: ${correspondingMember?.nome ?? "N/A"}`);

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

            return mappedInvite[0];

        } catch (e) {
            Logger.error(`> [Service][User V2][GET][getInviteInfo] catch - ${e.stack}`);

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
        Logger.log(`> [Service][User V2][GET][getById] - init`);
        try {
            const user: UserV2Entity = await this.userV2Repository.findById(id);
            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            let formatList: UserV2Entity[] = [];

            try {
                Logger.log(`> [Service][User V2][GET][getById] - membro  recolhido`);
                formatList = await this.mapMemberList([user]);
            } catch (e) {
                Logger.log(`> [Service][User V2][GET][getById][Erro] - mapear membros `, e.stack);
            }
            // const formatList: UserV2Entity[] = await this.mapMemberList([user]);

            return formatList[0];
        } catch (e) {
            Logger.log(`> [Service][User][GET][getById] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    private async getInviteById(id: string): Promise<InviteV2Entity> {
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
        Logger.log(`> [Controller][User V2][GET][findByEmail] - init`);
        try {
            const user: UserV2Entity = await this.userV2Repository.findByEmail(email);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');

            }

            const formatList: UserV2Entity[] = await this.mapMemberList([user]);
            return formatList[0];
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    async loginFindUserByEmail(email: string) {
        Logger.log(`> [Service][UserV2][POST][loginFindUserByEmail] - init`);
        const auth = admin.auth(firebaseApp);
        let returnData;

        try {
            returnData = await auth.getUserByEmail(email);
        } catch (error) {
            console.log(JSON.stringify(error));
            if (error.errorInfo.code === 'auth/user-not-found') {
                const member: UserV2Entity = await this.findByEmail(email);

                if (member.autenticacao.providersInfo.length > 0) {
                    if (member.autenticacao.providersInfo[0].uid) {
                        return await auth.getUser(member.autenticacao.providersInfo[0].uid);
                    }
                }
            }

            // throw new BadRequestException(`Erro inesperado: ${error.errorInfo.message}`);
            // if (error.errorInfo.message.toString().includes('There is no user record corresponding to the provided identifier')) {
            //     throw new BadRequestException(`Membro não cadastrado, solicite um convite para fazer parte da nossa comunidade`);
            // }
        }

        return returnData;
    }

    private async mapMemberList(members: UserV2Entity[]): Promise<UserV2Entity[]> {
        try {
            return Promise.all(
                members.map(async (member: UserV2Entity): Promise<UserV2Entity> => {
                    let diacono: IMember = {
                        id: "",
                        isMember: false,
                        isDiacono: false,
                        nome: "",
                    };

                    if (member?.diacono?.id) {
                        try {
                            const getDiaconoById: UserV2Entity = await this.userV2Repository.findById(member.diacono.id);

                            diacono = {
                                id: member.diacono.id,
                                nome: getDiaconoById?.nome || "",
                                isMember: true,
                                isDiacono: getDiaconoById?.isDiacono || false,
                            };
                        } catch (error) {
                            console.error(`Erro ao buscar informações do diácono com ID ${member.diacono.id}:`, error);
                            // Diacono permanece com os valores padrão
                        }
                    }

                    if (member?.informacoesPessoais?.temFilhos && member.informacoesPessoais.filhos?.length > 0) {
                        // Itera sobre os filhos para buscar informações adicionais na base de dados
                        for (const filho of member.informacoesPessoais.filhos) {
                            // Ignora filhos que possuem apenas nome preenchido sem ID
                            if (filho?.id === '' && filho?.nome) continue;

                            if (filho && filho.id && filho.id.length === 24) {
                                try {
                                    // Busca as informações do filho na base de dados
                                    const getFilhoById: UserV2Entity = await this.userV2Repository.findById(filho.id);

                                    // Atualiza os dados do filho com os valores encontrados
                                    filho.nome = getFilhoById?.nome || '';
                                    filho.isMember = true;
                                    filho.isDiacono = getFilhoById?.isDiacono || false;
                                } catch (error) {
                                    console.error(`Erro ao buscar informações do filho com ID ${filho.id}:`, error);
                                    // Define valores padrão em caso de erro na busca
                                    filho.nome = '';
                                    filho.isMember = false;
                                    filho.isDiacono = false;
                                }
                            } else {
                                // Define valores padrão para filhos sem ID
                                filho.nome = filho?.nome || '';
                                filho.isMember = false;
                                filho.isDiacono = false;
                            }
                        }
                    } else {
                        // Garante que a lista de filhos esteja inicializada como um array vazio
                        member.informacoesPessoais = {
                            ...member.informacoesPessoais,
                            filhos: [],
                        };
                    }


                    // Ajustar informações de casamento (conjugue)
                    if (member.informacoesPessoais?.casamento?.conjugue) {
                        const conjugue = member.informacoesPessoais.casamento.conjugue;

                        if (conjugue.id?.length === 24) {
                            const getConjugueById: UserV2Entity = await this.userV2Repository.findById(conjugue.id);

                            conjugue.nome = formatNome(getConjugueById?.nome || '');
                            conjugue.isMember = true;
                            conjugue.isDiacono = getConjugueById?.isDiacono || false;
                        } else {
                            conjugue.nome = conjugue.nome || '';
                            conjugue.id = conjugue.id || '';
                            conjugue.isMember = conjugue.isMember || false;
                            conjugue.isDiacono = conjugue.isDiacono || false;
                        }
                    } else {
                        member.informacoesPessoais = {
                            ...member.informacoesPessoais,
                            casamento: {
                                conjugue: {
                                    id: '',
                                    nome: '',
                                    isMember: false,
                                    isDiacono: false,
                                },
                                dataCasamento: null,
                            },
                        };
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
                        // telefone: member.telefone,
                        telefone: formatTelefone(member.telefone),
                        cpf: formatCPF(member.cpf),
                        email: member.email,
                        dataNascimento: member.dataNascimento,
                        idade: member.idade,
                        diacono: diacono,
                        endereco: member.endereco,
                        status: member.status,
                        ministerio: member && member.ministerio ? member.ministerio : [],

                        informacoesPessoais: {
                            casamento: member.informacoesPessoais.casamento,
                            estadoCivil: member.informacoesPessoais.estadoCivil,
                            filhos: member.informacoesPessoais.filhos,
                            temFilhos: member.informacoesPessoais.temFilhos
                        },

                        exclusao: member.exclusao ? member.exclusao : {data: null, motivo: ''},
                        falecimento: member.falecimento ? member.falecimento : {data: null, motivo: '', local: ''},
                        ingresso: member.ingresso ? member.ingresso : {data: null, local: '', forma: ''},
                        transferencia: member.transferencia ? member.transferencia : {data: null, motivo: '', local: ''},
                        visitas: member.visitas ? member.visitas : {motivo: ''},

                        autenticacao: member.autenticacao,
                        isDiacono: member.isDiacono,
                        createdAt: member.createdAt,
                        updatedAt: member.updatedAt,
                        historico: member.historico
                            .filter((historico: HistoricoDto) => historico.chave !== 'autenticacao'),
                        // .sort((a: HistoricoDto, b: HistoricoDto) => {
                        //     // Ordena por data (mais recente primeiro)
                        //     return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                        // }),
                        foto: member.foto ? member.foto : '',
                    }

                    return user;
                })
            )
        } catch (e) {
            Logger.error('Mapear membros: ', e.stack);
        }
    }

    async create(data: CreateUserV2Dto) {
        Logger.log(`> [Service][User V2][POST][Create] - init`);

        let user: UserV2Entity = new UserV2Entity();
        let userFirebase;

        try {
            if (data.email.length > 0) {
                user = await this.userV2Repository.findByEmail(data.email);

                if (user) {
                    throw new BadRequestException('Email já em uso!');
                }

                userFirebase = await this.authService.findUserByEmail(data.email);

                if (userFirebase) {
                    throw new BadRequestException('Email já em uso no Firebase!');
                }
            }

            return await this.createUserUniversal(data);
        } catch (e) {
            Logger.log(`> [Service][User V2][POST][Create] catch - ${JSON.stringify(e)}`);
            Logger.log(`> [Service][User V2][POST][Create] catch - ${e['response']['message']}`);
            if (e['response']['message'].toString().includes('There is no user record corresponding to the provided identifier')) {
                Logger.log('Criando membro pela primeira vez dentro do catch')
                return await this.createUserUniversal(data);
            }

            throw new BadRequestException(e['response']['message']);
        }
    }

    async createMany(data: CreateUserV2Dto[]) {
        Logger.log(`> [Service][User V2][POST][createMany] - init`);

        const createUsers: UserV2Entity[] = [];
        const createdUsers: UserV2Entity[] = [];

        for (const user of data) {
            try {
                createUsers.push(user as UserV2Entity);
            } catch (error) {
                Logger.log(`Erro ao tratar usuário ${JSON.stringify(user)} - ${error?.message}`);
            }
        }

        // Logger.debug(createUsers)

        for (const userData of createUsers) {
            try {
                await new Promise((resolve, reject) => {setTimeout(async () => {resolve(true)}, 3000)})

                const newUser: UserV2Entity = await this.create(userData);
                createdUsers.push(newUser);
            } catch (error) {
                Logger.log(`Erro ao criar usuário ${JSON.stringify(userData)} - ${error?.message}`);
            }
        }

        return createdUsers;
    }


    async acceptInvite(inviteId: string, password: string, data: CreateUserV2Dto): Promise<UserV2Entity> {
        Logger.log(`> [Service][User V2][POST][acceptInvite] - init`);

        let user: UserV2Entity = new UserV2Entity();
        let userFirebase;

        try {
            user = await this.userV2Repository.findByEmail(data.email);

            if (user) {
                throw new BadRequestException('Email já em uso!');
            }

            if (data.email.length > 0) {
                userFirebase = await this.authService.findUserByEmail(data.email);

                if (userFirebase) {
                    throw new BadRequestException('Email já em uso no Firebase!');
                }
            }

            const invite: InviteV2Entity = await this.inviteV2Repository.findById(inviteId);

            if (!invite.isAccepted) {
                // crio o usuário mais desse vez mandando a senha de criação
                await this.createUserUniversal(data, password);

                // atualiza convite para aceito
                await this.inviteV2Repository.update(inviteId, {
                    isAccepted: true,
                    updatedAt: new Date()
                })

                Logger.log(`> [Service][User V2][POST][acceptInvite] - finished 1`);
            }
            throw new BadRequestException('Convite aceito anteriormente!');

        } catch (e) {
            Logger.log(`> [Service][User V2][POST][acceptInvite] catch - ${JSON.stringify(e)}`);
            if (e['response']['message'].toString().includes('There is no user record corresponding to the provided identifier')) {
                const invite: InviteV2Entity = await this.inviteV2Repository.findById(inviteId);

                if (invite && !invite.isAccepted) {
                    // crio o usuário mais desse vez mandando a senha de criação
                    await this.createUserUniversal(data, password);

                    // atualiza convite para aceito
                    await this.inviteV2Repository.update(inviteId, {
                        isAccepted: true,
                        updatedAt: new Date()
                    })

                    Logger.log(`> [Service][User V2][POST][acceptInvite] - finished 2`);
                    return;
                }
                throw new BadRequestException('Convite já aceito!');
            }

            throw new BadRequestException('Falha ao aceitar o convite, o mesmo pode ter sido removido!');
        }
    }

    private async createUserUniversal(data: CreateUserV2Dto, password?: string): Promise<UserV2Entity> {
        Logger.log(`> [Service][User V2][Post][createUserUniversal] - init`);

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

        if (data && data.email.length === 0) {
            data.email = '';
        }

        if (data && data.telefone.length === 0) {
            data.telefone = '';
        }

        let diacono: IMember = {} as IMember;

        if (data && data.diacono && data.diacono.id && data.diacono.id.length === 24) {
            const getDiaconoById: UserV2Entity = await this.getById(data.diacono.id);
            diacono.nome = getDiaconoById?.nome;
            diacono.isDiacono = getDiaconoById?.isDiacono;
            diacono.isMember = true;
            diacono.id = data?.diacono?.id;
        }

        const user: UserV2Entity = new UserV2Entity();
        user.cpf = data.cpf;
        user.nome = formatNome(data.nome);
        user.rg = data.rg;
        user.telefone = data.telefone;
        user.role = data.role;
        user.status = data.status;
        user.ministerio = data.ministerio;
        user.dataNascimento = data.dataNascimento;
        user.diacono = diacono;
        user.email = data.email.toLowerCase();
        user.endereco = data.endereco;
        user.exclusao = {
            data: data && data.exclusao && data.exclusao.data ? data.exclusao.data : null,
            motivo: data && data.exclusao && data.exclusao.motivo ? data.exclusao.motivo : null
        };
        user.falecimento = {
            data: data && data.falecimento && data.falecimento.data ? data.falecimento.data : null,
            local: data && data.falecimento && data.falecimento.local ? data.falecimento.local : null,
            motivo: data && data.falecimento && data.falecimento.motivo ? data.falecimento.motivo : null
        };
        user.informacoesPessoais = {
            casamento: {
                conjugue: data && data.informacoesPessoais && data.informacoesPessoais.casamento && data.informacoesPessoais.casamento.conjugue ? data.informacoesPessoais.casamento.conjugue : null,
                dataCasamento: data && data.informacoesPessoais && data.informacoesPessoais.casamento && data.informacoesPessoais.casamento.dataCasamento ? data.informacoesPessoais.casamento.dataCasamento : null
            },
            estadoCivil: data && data.informacoesPessoais && data.informacoesPessoais.estadoCivil ? data.informacoesPessoais.estadoCivil : CivilStateEnumV2.solteiro,
            filhos: data && data.informacoesPessoais && data.informacoesPessoais.filhos ? data.informacoesPessoais.filhos : [],
            temFilhos: data && data.informacoesPessoais && data.informacoesPessoais.temFilhos ? data.informacoesPessoais.temFilhos : false,
        };
        user.ingresso = {
            data: data && data.ingresso && data.ingresso.data ? data.ingresso.data : null,
            forma: data && data.ingresso && data.ingresso.forma ? data.ingresso.forma : null,
            local: data && data.ingresso && data.ingresso.local ? data.ingresso.local : null,
        }
        user.transferencia = {
            data: data && data.transferencia && data.transferencia.data ? data.transferencia.data : null,
            local: data && data.transferencia && data.transferencia.local ? data.transferencia.local : null,
            motivo: data && data.transferencia && data.transferencia.motivo ? data.transferencia.motivo : null,
        };
        user.visitas = {
            motivo: data && data.visitas && data.visitas.motivo ? data.visitas.motivo : null
        }

        user.foto = data.foto ? data.foto : '';
        user.isDiacono = data.isDiacono;
        user.historico = [{
            chave: '',
            antigo: 'SEM INFORMAÇÕES ANTERIORES',
            novo: 'MEMBRO CRIADO',
            updatedAt: new Date()
        }];
        user.autenticacao = {
            providersInfo: []
        };

        const {foto, ...userToShow} = user;
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

        let updatedUser: UserV2Entity;

        if (saved) {
            try {
                const userFirebase = await this.authService.registerUser(savedFirebase, password);

                Logger.debug(userFirebase.uid);
                setTimeout(async () => {
                   updatedUser = await this.updateWithNoPassword(saved._id, {
                       autenticacao: {
                           providersInfo: [{
                               providerId: Providers.password,
                               uid: userFirebase.uid
                           }]
                       }
                   }, true)
                }, 1500);
            } catch (e) {
                await this.userV2Repository.delete(saved._id);
                throw new BadRequestException(
                    `${e.message}`,
                );
            }
        }

        Logger.log(`> [Service][User V2][POST][Create] - finished`);
        return updatedUser;
    }

    async updateWithPassword(id: string, data: any, password: string): Promise<UserV2Entity> {
        Logger.log(`> [Service][User V2][PUT][updateWithPassword] init`);
        Logger.log(`> [Service][User V2][PUT][updateWithPassword][id] - ${id}`);
        Logger.log(`> [Service][User V2][PUT][updateWithPassword][password] - ${password}`);

        try {
            const user: UserV2Entity = await this.userV2Repository.findById(id);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            const changes: Historico[] = gerarHistorico(user, data);
            // Faz o merge do histórico antigo com o novo
            data.historico = [...user.historico, ...changes];
            data.updatedAt = new Date();

            // Realizar o update diretamente no banco
            const updatedUserMongoDb = await this.userV2Repository.update(id, data);

            // Retornar o estado atualizado do usuário
            const updatedUser: UserV2Entity = await this.userV2Repository.findById(id);

            // Realizar o update no firebase
            const savedFirebase = {
                mongoId: updatedUserMongoDb.raw._id,
                name: updatedUserMongoDb.raw.nome,
                email: updatedUserMongoDb.raw.email,
                role: updatedUserMongoDb.raw.role,
                phoneNumber: updatedUserMongoDb.raw.telefone,
            };

            // Atualizar CustomClaims do Firebase
            for (const providerAuth of updatedUser.autenticacao.providersInfo) {
                Logger.debug(`> [Service][User V2][UPDATE][updateWithPassword] - Member ID: ${providerAuth.uid.toString() ?? "N/A"}, ROLE: ${updatedUser.role ?? "N/A"}, MONGOID: ${updatedUser._id ?? "N/A"}`);

                await this.authService.updateUser(savedFirebase, providerAuth.uid);
                await this.authService.setCustomClaimsForUser(providerAuth.uid, updatedUser.role, updatedUser._id);
                if (password && password.length > 0) {
                    await this.authService.updatePassword(providerAuth.uid, password);
                }
            }

            return updatedUser!;
        } catch (e) {
            Logger.log(`> [Service][User V2][PUT][update] catch - ${e.stack}`);
            if (e['message'].includes('E11000 duplicate key error collection')) {
                throw new BadRequestException('Houve uma falha ao atualizar o membro, tente novamente.');
            }
            throw new BadRequestException(e['message']);
        }
    }

    async updateWithNoPassword(id: string, data: any, isMassive?: boolean): Promise<UserV2Entity> {
        Logger.log(`> [Service][User V2][PUT][updateWithNoPassword] init`);
        Logger.log(`> [Service][User V2][PUT][updaupdateWithNoPasswordte][id] - ${id}`);

        try {
            const user: UserV2Entity = await this.userV2Repository.findById(id);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            if (!isMassive){
                const changes: Historico[] = gerarHistorico(user, data);
                // Faz o merge do histórico antigo com o novo
                data.historico = [...user.historico, ...changes];
            }

            data.updatedAt = new Date();

            // Realizar o update diretamente no banco
            await this.userV2Repository.update(id, data);

            // Retornar o estado atualizado do usuário
            const updatedUser: UserV2Entity = await this.userV2Repository.findById(id);

            // Realizar o update no firebase
            const savedFirebase = {
                mongoId: updatedUser._id,
                name: updatedUser.nome,
                email: updatedUser.email,
                role: updatedUser.role,
                phoneNumber: updatedUser.telefone,
            };

            // Atualizar no Firebase
            for (const providerAuth of updatedUser.autenticacao.providersInfo) {
                Logger.debug(`> [Service][User V2][UPDATE][updateWithNoPassword] - Member ID: ${providerAuth.uid.toString() ?? "N/A"}, ROLE: ${updatedUser.role ?? "N/A"}, MONGOID: ${updatedUser._id ?? "N/A"}`);
                await this.authService.updateUser(savedFirebase, providerAuth.uid);
                await this.authService.setCustomClaimsForUser(providerAuth.uid, updatedUser.role, updatedUser._id);
            }
            return updatedUser!;
        } catch (e) {
            Logger.error(e.stack)
            Logger.log(`> [Service][User V2][PUT][updateWithNoPassword] catch - ${e.stack}`);
            if (e['message'].includes('E11000 duplicate key error collection')) {
                throw new BadRequestException('Houve uma falha ao atualizar o membro, tente novamente.');
            }
            throw new BadRequestException(e['message']);
        }
    }

    async deleteMany(): Promise<any[]> {
        Logger.log(`> [Service][User V2][DELETE][deleteMany] init`);
        try {
            const deletedUsers: any[] = [];
            const getAllMembers: UserV2Entity[] = await this.getAll();

            const ignoreUsers: Set<string> = new Set([
                '677428dffcee13e798bc6f09',
                '6754afd1f5035ab83da457b5',
                '67993401a78d21fa6369c044',
                '6759bb5ef5035ab83da457b9',
                '675e1acff5035ab83da457bc',
                '677ef89e867c9bb4293adb30',
                '67871474a78d21fa6369c042',
            ]);

            for (const userData of getAllMembers) {
                if (ignoreUsers.has(userData._id)) {
                    Logger.log(`ID ignorado: ${userData._id}`);
                    deletedUsers.push({ id: userData._id, deleted: false });
                    continue;
                }

                try {
                    Logger.log(`ID sendo excluído: ${userData._id}`);
                    // const user: UserV2Entity = await this.userV2Repository.findById(userData._id);

                    await this.delete({id: userData._id});
                } catch (error) {
                    Logger.log(`Erro ao excluir usuário ${JSON.stringify(userData)} - ${error?.message}`);
                }
            }

            return deletedUsers;
        } catch (e) {
            Logger.error(`> [Service][User V2][DELETE][deleteMany] catch - ${JSON.stringify(e)}`);
            // throw new BadRequestException(e['message']);
        }
    }

    async delete(param: DeleteUserV2Dto): Promise<boolean> {
        Logger.log(`> [Service][User V2][DELETE] init`);
        try {
            const user: UserV2Entity = await this.userV2Repository.findById(param.id);

            if (!user) {
                throw new NotFoundException('Membro não encontrado!');
            }

            const photoFileKey: string = user.foto && user.foto.length > 0 ? user.foto : '';

            if (photoFileKey != '') {
                await this.uploadService.deleteObject(photoFileKey);
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
        Logger.log(`> [Service][User V2][DELETE INVITE] init`);
        try {
            const invite: InviteV2Entity = await this.inviteV2Repository.findById(param.id);

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

    async requestUpdate(data: RequestUpdateV2Dto, requestPassword: boolean = false): Promise<string> {
        Logger.log(`> [Service][User V2][POST][requestUpdate] - init`);
        try {
            for (const id of data._id) {
                Logger.debug(`> [Service][User V2][POST][requestUpdate] ID: ${id}`)
                // Busca do usuário no repositório
                const user: UserV2Entity = await this.userV2Repository.findById(id.toString());
                if (!user) {
                    Logger.warn(`Usuário com ID ${id} não encontrado.`);
                    continue; // Pula para o próximo ID se o usuário não for encontrado
                }

                // Construção do link de atualização
                const linkAtualizacao: string = `${process.env.APPLICATION_URL_PROD}/member?id=${user._id.toString()}&requestPassword=${requestPassword}`;

                if (user && user.telefone && user.telefone.length > 0) {
                    await this.twilioMessagingService.sendWhatsappMessageAtualizacaoCadastralWithTwilio({
                        linkAtualizacao: linkAtualizacao,
                        numeroWhatsapp: user.telefone,
                        nome: user.nome,
                    });
                } else {
                    Logger.log(`Membro sem telefone: ${user.nome}`);
                }

                // Geração do HTML do e-mail
                if (user && user.email && user.email.length > 0) {
                    const html: string = this.generateUpdateEmailHtml(linkAtualizacao);

                    try {
                        // Envio do e-mail
                        const emailResponse = await this.emailService.sendEmail(
                            user.email,
                            'Atualize seus dados',
                            'Realize a atualização de seus dados com a Igreja Batista do Brooklin',
                            html
                        );

                        if (emailResponse.success) {
                            Logger.log(`E-mail enviado com sucesso para ${user.email}`);
                        } else {
                            Logger.error(`Falha ao enviar e-mail para ${user.email}`);
                        }
                    } catch (emailError) {
                        Logger.error(
                            `Erro ao enviar e-mail para ${user.email}: ${JSON.stringify(emailError)}`
                        );
                        throw new BadRequestException(
                            `Erro ao enviar e-mail: ${emailError.message || emailError}`
                        );
                    }

                    return 'Processo de envio de e-mails concluído!';
                } else {
                    Logger.log(`Membro sem email: ${user.nome}`);
                }
            }
        } catch (e) {
            Logger.error(`Erro no processo de atualização: ${JSON.stringify(e)}`);
            throw new BadRequestException(e.message || 'Erro inesperado ao atualizar dados.');
        }
    }

    /**
     * Gera o HTML do e-mail de atualização cadastral.
     * @param linkAtualizacao Link para a atualização cadastral
     * @returns HTML formatado
     */
    private generateUpdateEmailHtml(linkAtualizacao: string): string {
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atualize seu Cadastro</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center" style="background-color: #f8f8f8; padding: 20px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
                    <tr>
                        <td align="center">
                            <h1 style="color: #333333;">🔄 Atualização Cadastral</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <img src="http://cdn.mcauto-images-production.sendgrid.net/9b153d64518b45c6/8ec43570-853b-496f-9111-76bc28cdae49/1600x673.jpeg" alt="Imagem de Boas-Vindas" style="max-width: 100%; height: auto; border-radius: 10px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: left;">
                            <p>Olá,</p>
                            <p>Estamos realizando uma atualização de cadastro em nossa plataforma para garantir que todas as informações estejam corretas e atualizadas.</p>
                            <h3>Por que atualizar seu cadastro?</h3>
                            <ul>
                                <li>Facilitar a comunicação com a nossa equipe</li>
                                <li>Garantir acesso a todas as funcionalidades da plataforma</li>
                            </ul>
                            <p>Para realizar a atualização, basta clicar no botão abaixo e preencher as informações solicitadas. É rápido e simples!</p>
                            <p><b>Se já estiver conectado na plataforma, o link irá direto a tela de edição. Senão deverá se autenticar e clicar em "EDITAR" em seu perfil!</b></p>
                            <p style="text-align: center;">
                                <a href="${linkAtualizacao}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Atualizar Cadastro</a>
                            </p>
                            <p>Se precisar de ajuda, nossa equipe está à disposição para auxiliá-lo.</p>
                            <p>Atenciosamente,</p>
                            <p><strong>Igreja Batista do Brooklin</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px; font-size: 12px; color: #666;">
                            <p>Se você já atualizou seu cadastro recentemente, por favor, desconsidere este e-mail.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
    }

    async sendInvite(data: SendEmailDto): Promise<string> {
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

            await this.twilioMessagingService.sendWhatsappMessageSendInviteWithTwilio({
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