import {BadRequestException, Injectable, Logger, NotFoundException} from "@nestjs/common";
import {UserEntity} from "../domain/entity/user.entity";
import {EventEmitter2, OnEvent} from "@nestjs/event-emitter";
import {UserV2Repository} from "../../user-v2/repository/user-v2.repository";

@Injectable()
export class UserService {
    constructor(
        private eventEmitter: EventEmitter2,
        private userRepository: UserV2Repository,
    ) {
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