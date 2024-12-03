import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post, Put} from "@nestjs/common";
import {UserEntity} from "../domain/entity/user.entity";
import {UserService} from "../service/user.service";
import {CreateUserDto} from "../dto/create-user.dto";
import {UpdateUserDto} from "../dto/update-user.dto";
import {DeleteUserDto} from "../dto/delete-user.dto";
import {IUserResponseApi} from "../dto/list-users.dto";
import {SendEmailDto} from "../dto/send-email.dto";
import {CreateUserInviteDto} from "../dto/create-user-invite.dto";
import {UpdateInfoDto} from "../dto/update-info.dto";
import {TwilioMessagingService} from "../../common/services/twilio-messaging.service";
import {TwilioWhatsappInputDto} from "../../common/dto/twillio-whatsapp.dto";

@Controller('v1/user')
@ApiTags('User')
export class UserController {
    constructor() {}

}