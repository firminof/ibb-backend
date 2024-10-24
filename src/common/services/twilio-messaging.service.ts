import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Twilio} from 'twilio';
import {formatToInternationalStandard} from "../helpers/helpers";
import {TwilioWhatsappInputDto, WhatsappMessageStatus,} from "../dto/twillio-whatsapp.dto";

import * as dotenv from 'dotenv';
import {MessageInstance} from "twilio/lib/rest/api/v2010/account/message";

dotenv.config();

const accountSid = 'AC37a819fea18afc89b6566d23ae33699b';
const authToken = 'a29c0fdaf26618e2df93d72ff2e9f3e4';
const sender = '+5511984252000';

const client = new Twilio(accountSid, authToken);

@Injectable()
export class TwilioMessagingService {
    constructor() {
    }

    @OnEvent('twillio-whatsapp.send')
    async sendWhatsappMessageWithTwilio(input: TwilioWhatsappInputDto) {
        let tentativas: number = 0;

        try {
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

    @OnEvent('twillio-whatsapp.forget-password.send')
    async sendWhatsappMessageForgetPasswordWithTwilio(data: {link: string, numeroWhatsapp: string}) {
        let tentativas: number = 0;

        try {
            const treatedRecipient: string = formatToInternationalStandard(
                data.numeroWhatsapp
            );

            Logger.log(``);
            Logger.log(`> [Service][Twillio][WhatsApp][ForgetPassword] para: ${treatedRecipient}`);

            const message = await client.messages.create({
                contentSid: process.env.TWILIO_CONTENT_SID_ESQUECI_SENHA,
                messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
                from: `whatsapp:${sender}`,
                contentVariables: JSON.stringify({
                    1: data.link
                }),
                to: `whatsapp:${treatedRecipient}`,
                attempt: 3
            });

            await new Promise((resolve) => setTimeout(resolve, 3000));

            let whatsAppStatusMessage: string = '';

            // Verificar o status da mensagem
            const checkMessage: MessageInstance = await client.messages(message.sid).fetch();

            whatsAppStatusMessage = WhatsappMessageStatus[checkMessage.status.toUpperCase()];
            Logger.log('[Service][Twillio][WhatsApp][ForgetPassword] - messageStatus: ', whatsAppStatusMessage);

            if (tentativas <= 8 && whatsAppStatusMessage.toString().includes('UNDELIVERED')) {
                Logger.log('[Service][Twillio][WhatsApp][ForgetPassword] - reenviar mensagem');
                tentativas += 1;
                setTimeout(() => this.sendWhatsappMessageForgetPasswordWithTwilio(data), 25000);
                if (tentativas > 8) {
                    throw new BadRequestException(
                        `Mensagem não entregue!`,
                    );
                    return;
                }
            }

            return whatsAppStatusMessage;

        } catch (e) {
            Logger.log(`> [Service][Twillio][WhatsApp][ForgetPassword] catch: ${e['message']}`);
            throw new BadRequestException(
                `Erro ao enviar menssagem de whatsapp com Twilio: ${e.message}`,
            );
        }
    }

    @OnEvent('twillio-whatsapp.send-invite.send')
    async sendWhatsappMessageSendInviteWithTwilio(data: {numeroWhatsapp: string}) {
        let tentativas = 0;

        try {
            const treatedRecipient: string = formatToInternationalStandard(
                data.numeroWhatsapp
            );
            let url: string = '';

            const treatedPhone = data.numeroWhatsapp.replace(/\.|\-|([()])|\s|[+]/g, '');

            if (process.env.APPLICATION_URL_PROD) {
                url = `${process.env.APPLICATION_URL_PROD}/invite?telefone=${treatedPhone}`;
            } else {
                url = `http://20.44.105.118/invite?telefone=${treatedPhone}`;
            }

            Logger.log(``);
            Logger.log(`> [Service][Twillio][WhatsApp][SendInvite] para: ${treatedRecipient}`);
            Logger.log(`> [Service][Twillio][WhatsApp][SendInvite] link(url): ${url}`);

            const message = await client.messages.create({
                contentSid: process.env.TWILIO_CONTENT_SID_CONVITE_MEMBRESIA,
                messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
                from: `whatsapp:${sender}`,
                contentVariables: JSON.stringify({
                    1: url
                }),
                to: `whatsapp:${treatedRecipient}`,
                attempt: 3
            });

            await new Promise((resolve) => setTimeout(resolve, 3000));

            let whatsAppStatusMessage: string = '';

            // Verificar o status da mensagem
            const checkMessage: MessageInstance = await client.messages(message.sid).fetch();

            whatsAppStatusMessage = WhatsappMessageStatus[checkMessage.status.toUpperCase()];
            Logger.log('[Service][Twillio][WhatsApp][SendInvite] - messageStatus: ', whatsAppStatusMessage);

            if (tentativas <= 8 && whatsAppStatusMessage.toString().includes('UNDELIVERED')) {
                Logger.log('[Service][Twillio][WhatsApp][SendInvite] - reenviar mensagem');
                tentativas += 1;
                setTimeout(() => this.sendWhatsappMessageSendInviteWithTwilio(data), 25000);

                if (tentativas > 8) {
                    throw new BadRequestException(
                        `Mensagem não entregue!`,
                    );
                }
                return;
            }

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