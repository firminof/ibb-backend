import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Twilio} from 'twilio';
import {formatToInternationalStandard} from "../helpers/helpers";
import {TwilioWhatsappInputDto, WhatsappMessageStatus,} from "../dto/twillio-whatsapp.dto";

import * as dotenv from 'dotenv';
import {MessageInstance} from "twilio/lib/rest/api/v2010/account/message";
import * as process from "process";

dotenv.config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const sender = process.env.TWILIO_SENDER;

const client = new Twilio(accountSid, authToken);

@Injectable()
export class TwilioMessagingService {
    constructor() {
    }

    @OnEvent('twillio-whatsapp.send')
    async sendWhatsappMessageWithTwilio(input: TwilioWhatsappInputDto) {
        let tentativas: number = 0;

        try {
            /*
            *Mensagem enviada pela Igreja Batista Do Brooklin.*

{{1}},

{{2}}

_Esta mensagem foi enviada automaticamente, não responda._
             */
            const treatedRecipient = formatToInternationalStandard(
                input.numeroWhatsapp,
            );

            Logger.log(``);
            Logger.log(`> [Service][Twillio][WhatsApp] de: ${sender}`);
            Logger.log(`> [Service][Twillio][WhatsApp] para: ${treatedRecipient}`);
            Logger.log(`> [Service][Twillio][WhatsApp] nome: ${input.nomeMembro}`);

            const message = await client.messages.create({
                contentSid: process.env.TWILIO_CONTENT_SID_SAUDACAO,
                messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
                from: `whatsapp:${sender}`,
                contentVariables: JSON.stringify({
                    1: input.nomeMembro,
                    2: input.conteudoMensagem
                }),
                to: `whatsapp:${treatedRecipient}`,
            });

            await new Promise((resolve) => setTimeout(resolve, 3000));

            let whatsAppStatusMessage: string = '';

            // Verificar o status da mensagem
            const checkMessage: MessageInstance = await client.messages(message.sid).fetch();

            whatsAppStatusMessage = WhatsappMessageStatus[checkMessage.status.toUpperCase()];
            Logger.log('[Service][Twillio][WhatsApp] - messageStatus: ', whatsAppStatusMessage);

            if (tentativas <= 8 && whatsAppStatusMessage.toString().includes('UNDELIVERED')) {
                Logger.log('[Service][Twillio][WhatsApp] - reenviar mensagem');
                tentativas += 1;
                setTimeout(() => this.sendWhatsappMessageWithTwilio(input), 25000);
                if (tentativas > 8) {
                    throw new BadRequestException(
                        `Mensagem não entregue!`,
                    );
                }
            }

            return whatsAppStatusMessage;

        } catch (e) {
            Logger.log(`> [Service][Twillio][WhatsApp] catch: ${e['message']}`);
            throw new BadRequestException(
                `Erro ao enviar menssagem de whatsapp com Twilio: ${e.message}`,
            );
        }
    }

    @OnEvent('twillio-whatsapp.send')
    async sendWhatsappMessagePedirOracaoWithTwilio(input: TwilioWhatsappInputDto, membro: string) {
        let tentativas: number = 0;

        try {
            /*
            *Mensagem enviada pela Igreja Batista Do Brooklin*

Olá {{1}},

o membro {{2}} está *pedindo oração.*
Veja a mensagem que ele escreveu:

{{3}}

_Esta mensagem foi enviada automaticamente, não responda._
             */
            const treatedRecipient = formatToInternationalStandard(
                input.numeroWhatsapp,
            );

            Logger.log(``);
            Logger.log(`> [Service][Twillio][WhatsApp] de: ${sender}`);
            Logger.log(`> [Service][Twillio][WhatsApp] para: ${treatedRecipient}`);
            Logger.log(`> [Service][Twillio][WhatsApp] nome: ${input.nomeMembro}`);
            Logger.log(`> [Service][Twillio][WhatsApp] membro: ${membro}`);

            const message = await client.messages.create({
                contentSid: process.env.TWILIO_CONTENT_SID_PEDIR_ORACAO,
                messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
                from: `whatsapp:${sender}`,
                contentVariables: JSON.stringify({
                    1: input.nomeMembro,
                    2: membro,
                    3: input.conteudoMensagem
                }),
                to: `whatsapp:${treatedRecipient}`,
            });

            await new Promise((resolve) => setTimeout(resolve, 3000));

            let whatsAppStatusMessage: string = '';

            // Verificar o status da mensagem
            const checkMessage: MessageInstance = await client.messages(message.sid).fetch();

            whatsAppStatusMessage = WhatsappMessageStatus[checkMessage.status.toUpperCase()];
            Logger.log('[Service][Twillio][WhatsApp] - messageStatus: ', whatsAppStatusMessage);

            if (tentativas <= 8 && whatsAppStatusMessage.toString().includes('UNDELIVERED')) {
                Logger.log('[Service][Twillio][WhatsApp] - reenviar mensagem');
                tentativas += 1;
                setTimeout(() => this.sendWhatsappMessageWithTwilio(input), 25000);
                if (tentativas > 8) {
                    throw new BadRequestException(
                        `Mensagem não entregue!`,
                    );
                }
            }

            return whatsAppStatusMessage;

        } catch (e) {
            Logger.log(`> [Service][Twillio][WhatsApp] catch: ${e['message']}`);
            throw new BadRequestException(
                `Erro ao enviar menssagem de whatsapp com Twilio: ${e.message}`,
            );
        }
    }

    @OnEvent('twillio-whatsapp.forget-password.send')
    async sendWhatsappMessageForgetPasswordWithTwilio(data: { link: string, numeroWhatsapp: string }) {
        try {
            const treatedRecipient: string = formatToInternationalStandard(
                data.numeroWhatsapp
            );

            /*
            *Redefinir senha*

Clique no link abaixo para mudar a senha.

{{1}}
             */

            Logger.log(``);
            Logger.log(`> [Service][Twillio][WhatsApp][ForgetPassword] para: ${treatedRecipient}`);

            const message = await client.messages.create({
                contentSid: process.env.TWILIO_CONTENT_SID_ESQUECI_SENHA,
                messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
                from: `whatsapp:${sender}`,
                contentVariables: JSON.stringify({
                    1: data.link.toString()
                }),
                to: `whatsapp:${treatedRecipient}`,
                attempt: 3
            });

            await new Promise((resolve) => setTimeout(resolve, 3000));

            let whatsAppStatusMessage: string = '';

            // Verificar o status da mensagem
            const checkMessage: MessageInstance = await client.messages(message.sid).fetch();

            whatsAppStatusMessage = WhatsappMessageStatus[checkMessage.status.toUpperCase()];
            Logger.log('[Service][Twillio][WhatsApp][ForgetPassword] - messageStatus: ', JSON.stringify(whatsAppStatusMessage));

            return whatsAppStatusMessage;

        } catch (e) {
            Logger.log(`> [Service][Twillio][WhatsApp][ForgetPassword] catch: ${e['message']}`);
            throw new BadRequestException(
                `Erro ao enviar menssagem de whatsapp com Twilio: ${e.message}`,
            );
        }
    }

    @OnEvent('twillio-whatsapp.send-invite.send', {async: true})
    async sendWhatsappMessageSendInviteWithTwilio(data: { numeroWhatsapp: string, linkConvite: string }) {
        try {
            /*
            *Você foi convidado para ser membro da Igreja Batista do Brooklin*

Estamos felizes em convidá-lo(a) para se juntar a nós.

Clique no link abaixo para aceitar o convite e completar seu cadastro.

{{1}}

_Se você não solicitou este convite, pode ignorar esta mensagem._
             */
            const treatedRecipient: string = formatToInternationalStandard(
                data.numeroWhatsapp
            );

            Logger.log(``);
            Logger.log(`> [Service][Twillio][WhatsApp][SendInvite] para: ${treatedRecipient}`);
            Logger.log(`> [Service][Twillio][WhatsApp][SendInvite] link(url): ${data.linkConvite}`);

            const message = await client.messages.create({
                contentSid: process.env.TWILIO_CONTENT_SID_CONVITE_MEMBRESIA,
                messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
                from: `whatsapp:${sender}`,
                contentVariables: JSON.stringify({
                    1: data.linkConvite.toString()
                }),
                to: `whatsapp:${treatedRecipient}`,
                attempt: 3
            });

            await new Promise((resolve) => setTimeout(resolve, 3000));

            let whatsAppStatusMessage: string = '';

            // Verificar o status da mensagem
            const checkMessage: MessageInstance = await client.messages(message.sid).fetch();

            whatsAppStatusMessage = WhatsappMessageStatus[checkMessage.status.toUpperCase()];
            Logger.log('[Service][Twillio][WhatsApp][SendInvite] - messageStatus: ', JSON.stringify(whatsAppStatusMessage));

            Logger.log('[Service][Twillio][WhatsApp][SendInvite] - finished');
            return whatsAppStatusMessage;

        } catch (e) {
            Logger.log(`> [Service][Twillio][WhatsApp][SendInvite] catch: ${e['message']}`);
            throw new BadRequestException(
                `Erro ao enviar menssagem de whatsapp com Twilio: ${e.message}`,
            );
        }
    }
}