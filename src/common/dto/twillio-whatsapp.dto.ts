import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";

export enum WhatsappMessageStatus {
    'SENT' = 'SENT',
    'FAILED' = 'FAILED',
    'DELIVERED' = 'DELIVERED',
    'QUEUED' = 'QUEUED',
    'UNDELIVERED' = 'UNDELIVERED',
}

export class TwilioWhatsappInputDto {
    @ApiProperty({type: String})
    @Type(() => String)
    linkAplicacao: string

    @ApiProperty({type: String})
    @Type(() => String)
    numeroWhatsapp: string

    @ApiProperty({type: String})
    @Type(() => String)
    nomeMembro: string

    @ApiProperty({type: String})
    @Type(() => String)
    nomeCompanhia: string

    @ApiProperty({type: String})
    @Type(() => String)
    conteudoMensagem: string
}