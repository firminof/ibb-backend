import {Injectable, Logger} from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as process from "process";

@Injectable()
export class EmailService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    async sendEmail(to: string, subject: string, text: string, html: string): Promise<any> {
        const msg = {
            to,
            from: {
                email: process.env.SENDGRID_API_FROM, // Use um email verificado no SendGrid
                name: 'Secretaria IBB'
            },
            subject,
            text,
            html,
        };
        Logger.log(`> [Service][Email] from: ${msg.from.email}`);
        Logger.log(`> [Service][Email] to: ${msg.to}`);
        Logger.log(`> [Service][Email] subject: ${msg.subject}`);

        try {
            const response = await sgMail.send(msg);
            return {
                success: true,
                data: response,
            };
        } catch (error) {
            return {
                success: false,
                data: error,
            };
        }
    }
}