import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import * as admin from 'firebase-admin';
import {EventEmitter2} from '@nestjs/event-emitter';
import {firebaseApp} from "../config/firebase.config";
import {CreateRequest} from "firebase-admin/lib/auth";
import {formatNome} from "../../common/helpers/helpers";
import {UserEntity} from "../../user/domain/entity/user.entity";
import {SendEmailDto} from "../../user/dto/send-email.dto";
import {EmailService} from "../../user/service/email.service";
import {TwilioMessagingService} from "../../common/services/twilio-messaging.service";
import {UserService} from "../../user/service/user.service";

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

    async registerUser(userInfo: UserInfo) {
        Logger.log(`> [Service][Auth][registerUser]] - init`);
        try {
            const auth = admin.auth(firebaseApp);

            const randomPassword =
                Math.random()           // Generate random number, eg: 0.123456
                    .toString(36)  // Convert  to base-36 : "0.4fzyo82mvyr"
                    .slice(-8);         // Cut off last 8 characters : "yo82mvyr";

            const userFirebase: CreateRequest = {
                email: userInfo.email,
                password: randomPassword,
                phoneNumber: userInfo.phoneNumber && userInfo.phoneNumber.length > 0 ? userInfo.phoneNumber : '',
                displayName: formatNome(userInfo.name),
                emailVerified: false,
            }

            const userRecord = await auth.createUser(userFirebase);

            await auth.setCustomUserClaims(userRecord.uid, {
                role: userInfo.role,
                mongoId: userInfo.mongoId,
            });

            const passwordResetLink = await auth.generatePasswordResetLink(
                userInfo.email,
            );

            return userRecord;
        } catch (e) {
            throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async resetPassword(email: string) {
        Logger.log(`> [Service][Auth][POST][resetPassword] - init`);
        try {
            const auth = admin.auth(firebaseApp);

            const passwordResetLink = await auth.generatePasswordResetLink(email);

            this.eventEmitter.emit('user-service.forget-password.send', {
                link: passwordResetLink,
                email
            })

            return await this.sendEmailResetEmail({
                html: '',
                text: 'Redefinir senha',
                subject: 'Redefinir senha',
                to: email,
                requestName: 'IBB',
                phone: ''
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

    async removeUserByUid(uid: string) {
        try {
            const auth = admin.auth(firebaseApp);
            await auth.deleteUser(uid);
        } catch (e) {
            throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async findUserByEmail(email: string) {
        Logger.log(`> [Service][Auth][POST][findUserByEmail] - init`);
        const auth = admin.auth(firebaseApp);
        let returnData;

        try {
            returnData = await auth.getUserByEmail(email);
        } catch (error) {
            console.log(error);
            switch (error.errorInfo.code) {
                case 'auth/user-not-found':
                    returnData = false;
                default:
                    throw new BadRequestException(`Erro inesperado: ${error.errorInfo.message}`);
            }
        }

        return returnData;
    }

    async findUserByUid(uid: string) {
        const auth = admin.auth(firebaseApp);

        return await auth.getUser(uid);
    }

    async setCustomClaimsForUser(uid: string, role: string, mongoId: string) {
        const auth = admin.auth(firebaseApp);

        const userRecord = await auth.getUser(uid);

        if (!userRecord.customClaims) {
            await auth.setCustomUserClaims(uid, {role, mongoId});
        }
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
                            <img src="http://cdn.mcauto-images-production.sendgrid.net/9b153d64518b45c6/8ec43570-853b-496f-9111-76bc28cdae49/1600x673.jpeg" alt="Imagem de Boas-Vindas" style="max-width: 100%; height: auto; border-radius: 10px;">
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
                throw new BadRequestException('Falha ao enviar o email!');
            }
        } catch (e) {
            Logger.log(`> [Service][Auth][sendEmailResetEmail] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }
}
