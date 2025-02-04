import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param, Patch,
    Post,
    Put,
    UploadedFile
} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {CreateUserV2Dto} from "../dto/create-user-v2.dto";
import {UserV2Entity} from "../domain/entity/user-v2.entity";
import {UserV2Service} from "../services/user-v2.service";
import {UpdateUserV2Dto} from "../dto/update-user-v2.dto";
import {DeleteUserV2Dto} from "../dto/delete-user-v2.dto";
import {SendEmailDto} from "../../user/dto/send-email.dto";
import {InviteV2Entity} from "../domain/entity/invite-v2.entity";
import {RequestUpdateV2Dto} from "../dto/request-update-v2.dto";
import {TwilioWhatsappInputDto} from "../../common/dto/twillio-whatsapp.dto";
import {TwilioMessagingService} from "../../common/services/twilio-messaging.service";
import {ApiImageFile} from "../decorators/api-file.decorator";
import {ParseFile} from "../decorators/parse-file.decorator";
import {UploadService} from "../services/upload.service";

@Controller('v2/user')
@ApiTags('User V2')

export class UserV2Controller {
    constructor(
        private readonly userV2Service: UserV2Service,
        private readonly twilioMessagingService: TwilioMessagingService,
        private readonly uploadService: UploadService,
        ) {
    }

    @Get('all')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserV2Entity,
        isArray: true
    })
    async getAll(): Promise<UserV2Entity[]> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][GET][getAll] - init`);
        return this.userV2Service.getAll();
    }

    @Get('diaconos')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserV2Entity,
        isArray: true
    })
    async getAllDiaconos(): Promise<UserV2Entity[]> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][GET][getAllDiaconos] - init`);
        return this.userV2Service.getAllDiaconos();
    }


    @Get('invites/all')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: InviteV2Entity,
        isArray: true
    })
    async getAllInvites(): Promise<InviteV2Entity[]> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][GET][getAllInvites] - init`);
        return this.userV2Service.getAllInvites();
    }

    @Get('invites/:id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: InviteV2Entity,
        isArray: true
    })
    async getAllByMemberIdRequested(@Param('id') id: string): Promise<InviteV2Entity[]> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][GET][getAllInvitesByMember] - init`);
        return this.userV2Service.getAllByMemberIdRequested(id);
    }

    @Get('invite/info/:id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: InviteV2Entity,
        isArray: true
    })
    async getInviteInfo(@Param('id') id: string): Promise<InviteV2Entity> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][GET][getInviteInfo] - init`);
        return this.userV2Service.getInviteInfo(id);
    }

    @Get('birthdays-month/:month')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserV2Entity,
        isArray: true
    })
    async getAllBirthdaysMonth(@Param('month') month: number): Promise<UserV2Entity[]> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][GET][getAllBirthdaysMonth] - init`);
        return this.userV2Service.getAllBirthdaysMonth(month);
    }

    @Get('get-by-id/:id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserV2Entity,
        isArray: false
    })
    async getById(@Param('id') id: string): Promise<UserV2Entity> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][GET][getById] - init`);
        return this.userV2Service.getById(id);
    }

    @Get('get-by-email/:email')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserV2Entity,
        isArray: false
    })
    async getByEmail(@Param('email') email: string): Promise<UserV2Entity> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][GET][getByEmail] - init`);
        return this.userV2Service.findByEmail(email);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED, type: UserV2Entity})
    async create(@Body() data: CreateUserV2Dto): Promise<UserV2Entity> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][POST][Create] - init`);
        return this.userV2Service.create(data);
    }

    @Post('/create-many')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED, type: [UserV2Entity]})
    async createMany(@Body() data: CreateUserV2Dto[]): Promise<UserV2Entity[]> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][POST][createMany] - init`);
        return this.userV2Service.createMany(data);
    }

    @Post('photo')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED})
    @ApiImageFile('file', true)
    async uploadImage(@UploadedFile(ParseFile) file): Promise<{ url: string }> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][POST][uploadImage] - init`);

        if (!file) {
            throw new BadRequestException('Nenhuma imagem foi enviada.');
        }

        const fileUrl = await this.uploadService.uploadFile(file);
        return { url: fileUrl };
    }

    @Put(':id/:password')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.NO_CONTENT, type: UserV2Entity})
    async update(
        @Param('id') id: string,
        @Param('password') password: string,
        @Body() data: UpdateUserV2Dto): Promise<UserV2Entity> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][PUT][Update] - init`);
        return this.userV2Service.updateWithPassword(id, data, password);
    }

    @Patch('/no-password/:id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.NO_CONTENT, type: UserV2Entity})
    async updateWithNoPassword(
        @Param('id') id: string,
        @Body() data: UpdateUserV2Dto): Promise<UserV2Entity> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][PUT][updateWithNoPassword] - init`);
        return this.userV2Service.updateWithNoPassword(id, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.OK})
    async delete(@Param() params: DeleteUserV2Dto): Promise<boolean> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][DELETE][Update] - init`);
        return this.userV2Service.delete(params);
    }

    @Delete('/invite/:id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.OK})
    async deleteInvite(@Param() params: DeleteUserV2Dto): Promise<boolean> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][DELETE INVITE][Update] - init`);
        return this.userV2Service.deleteInvite(params);
    }

    @Post('/send-invite')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED})
    async sendInvite(@Body() sendEmailDto: SendEmailDto) {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][POST][sendInvite] - init`);
        return this.userV2Service.sendInvite(sendEmailDto);
    }

    @Post('accept-invite/:password/:inviteId')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED})
    async acceptInvite(
        @Param('password') password: string,
        @Param('inviteId') inviteId: string,
        @Body() data: CreateUserV2Dto): Promise<UserV2Entity> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][POST][Accept Invite] - init`);
        Logger.debug(`> ${inviteId}`);
        return this.userV2Service.acceptInvite(inviteId, password, data);
    }

    @Post('request-update/:requestPassword')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED})
    async requestUpdate(@Body() data: RequestUpdateV2Dto, @Param('requestPassword') requestPassword: boolean) {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][POST][requestUpdate] - init`);
        return this.userV2Service.requestUpdate(data, requestPassword);
    }

    @Post('/whatsapp/send-message')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.OK})
    async sendWhatsappMessage(@Body() data: TwilioWhatsappInputDto) {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][POST][sendWhatsappMessage] - init`);
        Logger.log(`> [Controller][User V2][POST][sendWhatsappMessage] data - ${JSON.stringify(data)}`);
        return this.twilioMessagingService.sendWhatsappMessageWithTwilio(data);
    }

    @Post('/whatsapp/send-message/pedir-oracao/:membro')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.OK})
    async sendWhatsappMessagePedirOracao(@Param('membro') membro: string, @Body() data: TwilioWhatsappInputDto) {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][POST][sendWhatsappMessage] - init`);
        Logger.log(`> [Controller][User V2][POST][sendWhatsappMessage] data - ${JSON.stringify(data)}`);
        Logger.log(`> [Controller][User V2][POST][sendWhatsappMessage] membro - ${JSON.stringify(membro)}`);
        return this.twilioMessagingService.sendWhatsappMessagePedirOracaoWithTwilio(data, membro);
    }
}