import {Module} from "@nestjs/common";
import {UserController} from "./controller/user.controller";
import {UserRepository} from "./repository/user.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserService} from "./service/user.service";
import {CreateUserValidation} from "./service/create-user-validation";
import {EmailService} from "./service/email.service";
import {AuthService} from "../auth/services/auth.service";
import {TwilioMessagingService} from "../common/services/twilio-messaging.service";
import {UserV2Repository} from "../user-v2/repository/user-v2.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRepository, UserV2Repository]),
    ],
    controllers: [UserController],
    providers: [
        UserService,
        UserRepository,
        CreateUserValidation,
        EmailService,
        AuthService,
        TwilioMessagingService,
    ],
    exports: [UserService, TypeOrmModule, UserRepository]
})

export class UserModule {
}