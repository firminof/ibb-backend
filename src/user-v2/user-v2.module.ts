import {Module} from "@nestjs/common";
import {UserV2Controller} from "./controller/user-v2.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserV2Repository} from "./repository/user-v2.repository";
import {UserV2Service} from "./services/user-v2.service";
import {EmailService} from "../user/service/email.service";
import {AuthService} from "../auth/services/auth.service";
import {TwilioMessagingService} from "../common/services/twilio-messaging.service";
import {InviteV2Repository} from "./repository/invite-v2.repository";
import {UploadService} from "./services/upload.service";
import {AuthModule} from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserV2Repository, InviteV2Repository]),
    ],
    controllers: [UserV2Controller],
    providers: [
        UserV2Repository,
        InviteV2Repository,
        UserV2Service,
        EmailService,
        AuthService,
        TwilioMessagingService,
        UploadService
    ],
    exports: [TypeOrmModule, UserV2Repository, InviteV2Repository,  UserV2Service, UploadService]
})

export class UserV2Module {
}