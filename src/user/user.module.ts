import {Module} from "@nestjs/common";
import {UserController} from "./controller/user.controller";
import {UserRepository} from "./repository/user.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserService} from "./service/user.service";
import {CreateUserValidation} from "./service/create-user-validation";
import {EmailService} from "./service/email.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRepository]),
    ],
    controllers: [UserController],
    providers: [
        UserService,
        UserRepository,
        CreateUserValidation,
        EmailService
    ],
    exports: [UserService, TypeOrmModule, UserRepository]
})

export class UserModule {
}