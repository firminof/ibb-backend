import {Module} from '@nestjs/common';
import {AuthService} from "./services/auth.service";
import {AuthController} from "./controller/auth.controller";
import {EmailService} from "../user/service/email.service";

@Module({
    imports: [],
    providers: [
        AuthService,
        EmailService
    ],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {
}
