import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import * as admin from 'firebase-admin';
import {EventEmitter2} from '@nestjs/event-emitter';
import {firebaseApp} from "../config/firebase.config";
import {CreateRequest, UpdateRequest} from "firebase-admin/lib/auth";
import {formatNome, generateRandomEmail} from "../../common/helpers/helpers";
import {UserEntity} from "../../user/domain/entity/user.entity";
import {SendEmailDto} from "../../user/dto/send-email.dto";
import {EmailService} from "../../user/service/email.service";
import {TwilioMessagingService} from "../../common/services/twilio-messaging.service";
import {UserService} from "../../user/service/user.service";
import {UserV2Entity} from "../../user-v2/domain/entity/user-v2.entity";
import {formatPhoneNumber} from "../../common/validations/telefone";

export interface UserInfo {
    mongoId: string;
    name: string;
    email: string;
    role: string;
    phoneNumber: string;
}

@Injectable()
export class AuthService {
    constructor(
        private eventEmitter: EventEmitter2,
        private emailService: EmailService
    ) {
    }

    async registerUser(userInfo: UserInfo, password?: string) {
        Logger.log(`> [Service][Auth][registerUser]] - init`);

        const auth = admin.auth(firebaseApp);
        let randomPassword: string = '';
        let emailVerified: boolean = false;

        if (!password) {
            randomPassword =
                Math.random()           // Generate random number, eg: 0.123456
                    .toString(36)  // Convert  to base-36 : "0.4fzyo82mvyr"
                    .slice(-8);         // Cut off last 8 characters : "yo82mvyr";
        } else {
            randomPassword = password;
            emailVerified = true;
        }

        let userFirebase: CreateRequest = {
            password: randomPassword,
            displayName: formatNome(userInfo.name),
            emailVerified,
        }

        if (userInfo && userInfo.email.length > 0 && userInfo.email !== '') {
            userFirebase.email = userInfo.email;
        }

        // if (userInfo && userInfo.phoneNumber.length > 0) {
        //     userFirebase.phoneNumber = userInfo.phoneNumber && userInfo.phoneNumber.length > 0 ? userInfo.phoneNumber : ''
        // }

        Logger.debug(userFirebase)

        try {
            const userRecord = await auth.createUser(userFirebase);

            await auth.setCustomUserClaims(userRecord.uid, {
                role: userInfo.role,
                mongoId: userInfo.mongoId,
            });

            return userRecord;
        } catch (e) {
            Logger.error(e.stack);
            Logger.error(e);
            if (e.message.toString().includes('The user with the provided phone number already exists')) {
                throw new BadRequestException('Número de telefone já cadastrado, tente com outro.');
            }
            throw new BadRequestException(`Erro ao cadastrar no firebase: ${e.message}`);
        }
    }

    async updateUser(userInfo: UserInfo, uid: string) {
        Logger.log(`> [Service][Auth][updateUser]] - init`);
        try {
            const auth = admin.auth(firebaseApp);

            const userInFirebase = await auth.getUser(uid);

            let userFirebase: UpdateRequest = {
                displayName: formatNome(userInfo.name),
            }

            if (userInfo.email === '' && userInFirebase.email !== '') {
                // TESTE
                if (userInFirebase.email && userInFirebase.email.split('@')) {
                    userFirebase.email = `${userInFirebase.email.split('@')[0]}_desativado@${userInFirebase.email.split('@')[1]}`;
                } else {
                    userFirebase.email = generateRandomEmail();
                }
            }

            if (userInfo.email !== '') {
                userFirebase.email = userInfo.email;
            }

            const userRecord = await auth.updateUser(uid, userFirebase);

            await auth.setCustomUserClaims(userRecord.uid, {
                role: userInfo.role,
                mongoId: userInfo.mongoId,
            });

            return userRecord;
        } catch (e) {
            Logger.error(e);
            Logger.error(e.stack)
            if (e.message.toString().includes('The user with the provided phone number already exists')) {
                throw new BadRequestException('Número de telefone já cadastrado, tente com outro.');
            }
            throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async resetPassword(email: string) {
        Logger.log(`> [Service][Auth][POST][resetPassword] - init`);
        try {
            const auth = admin.auth(firebaseApp);

            const passwordResetLink = await auth.generatePasswordResetLink(email);

            this.eventEmitter.emit('user-service-v2.forget-password.send', {
                link: passwordResetLink,
                email
            })

            return await this.sendEmailResetEmail({
                html: '',
                text: 'Redefinir senha',
                subject: 'Redefinir senha',
                to: email,
                requestName: 'IBB',
                phone: '',
                memberIdRequested: ''
            }, passwordResetLink);

        } catch (e) {
            if (e.message === 'INTERNAL ASSERT FAILED: Unable to create the email action link') {
                throw new BadRequestException(`Email ${email} não está cadastrado na plataforma. Não é possível recuperar a senha.`);
            }

            throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async removeUser(user: UserEntity) {
        try {
            const uids = user.providersInfo.map((info) => info.uid);

            uids.map((uid) => this.removeUserByUid(uid));
        } catch (e) {
            throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async removeUserV2(user: UserV2Entity) {
        Logger.log(`> [Service][User V2][DELETE][removeUserV2] init`);
        // Logger.log(JSON.stringify(user));
        try {
            const uids: string[] = user.autenticacao.providersInfo.map((info) => info.uid);

            uids.map(async (uid) => await this.removeUserByUid(uid));
        } catch (e) {
            Logger.error(e);
            // throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async removeUserByUid(uid: string) {
        try {
            const auth = admin.auth(firebaseApp);
            await auth.deleteUser(uid);
        } catch (e) {
            // throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async findUserByEmail(email: string) {
        Logger.log(`> [Service][Auth][POST][findUserByEmail] - init`);
        const auth = admin.auth(firebaseApp);
        let returnData;

        try {
            returnData = await auth.getUserByEmail(email);
        } catch (error) {
            console.log(JSON.stringify(error));
            throw new BadRequestException(`Erro inesperado: ${error.errorInfo.message}`);
            // if (error.errorInfo.message.toString().includes('There is no user record corresponding to the provided identifier')) {
            //     throw new BadRequestException(`Membro não cadastrado, solicite um convite para fazer parte da nossa comunidade`);
            // }
        }

        return returnData;
    }

    async findUserByPhoneNumber(phone: string) {
        Logger.log(`> [Service][Auth][POST][findUserByPhoneNumber] - init`);
        const auth = admin.auth(firebaseApp);
        let returnData;

        try {
            returnData = await auth.getUserByPhoneNumber(phone);
        } catch (error) {
            console.log(JSON.stringify(error));
            throw new BadRequestException(`Erro inesperado: ${error.errorInfo.message}`);
            // if (error.errorInfo.message.toString().includes('There is no user record corresponding to the provided identifier')) {
            //     throw new BadRequestException(`Membro não cadastrado, solicite um convite para fazer parte da nossa comunidade`);
            // }
        }

        return returnData;
    }

    async findUserByUid(uid: string) {
        const auth = admin.auth(firebaseApp);

        return await auth.getUser(uid);
    }

    async setCustomClaimsForUser(uid: string, role: string, mongoId: string) {
        const auth = admin.auth(firebaseApp);

        // const userRecord = await auth.getUser(uid);
        Logger.debug(`> [Service][Auth]setCustomClaimsForUser]`);

        await auth.setCustomUserClaims(uid, {role, mongoId});
    }

    async updatePassword(uid: string, password: string) {
        const auth = admin.auth(firebaseApp);
        Logger.debug(`> [Service][Auth][updatePassword]`);

        await auth.updateUser(uid, {password})
    }

    async sendEmailResetEmail(data: SendEmailDto, link: string) {
        Logger.log(`> [Service][Auth][sendEmailResetEmail] - init`);
        Logger.log(`> [Service][Auth][sendEmailResetEmail] data - ${JSON.stringify(data)}`);

        data.html =
            `
            <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir senha</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center" style="background-color: #f8f8f8; padding: 20px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
                    <tr>
                        <td align="center">
                            <h1 style="color: #333333;">Redefinir senha!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <img src="http://cdn.mcauto-images-production.sendgrid.net/9b153d64518b45c6/d1e861d7-2d8a-4702-b0bb-158f58f22948/2245x945.png" alt="Imagem de Boas-Vindas" style="max-width: 100%; height: auto; border-radius: 10px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: left;">     
                            <p> Clique no botão abaixo para mudar a senha.</p>
                            <p style="text-align: center;">
                                <a href="${link}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Mudar Senha</a>
                            </p>
                            <p>Se você tiver alguma dúvida, sinta-se à vontade para entrar em contato conosco.</p>
                            <p>Atenciosamente,</p>
                            <p><strong>Igreja Batista do Brooklin</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px; font-size: 12px; color: #666;">
                            <p>Se você não solicitou esta mudança, por favor, ignore este e-mail.</p>
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

            Logger.log(`> [Service][Auth][sendEmailResetEmail] sendEmailBySendGrid - ${JSON.stringify(sendEmailBySendGrid)}`);
            if (sendEmailBySendGrid.success) {
                return 'Email enviado com sucesso!'
            } else {
                console.error('Falha ao enviar o email!');
            }
        } catch (e) {
            Logger.log(`> [Service][Auth][sendEmailResetEmail] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }
}
