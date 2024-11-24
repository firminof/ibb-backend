import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post, Put} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {CreateUserV2Dto} from "../dto/create-user-v2.dto";
import {UserV2Entity} from "../domain/entity/user-v2.entity";
import {UserV2Service} from "../services/user-v2.service";
import {UpdateUserV2Dto} from "../dto/update-user-v2.dto";
import {DeepPartial} from "typeorm";
import {DeleteUserDto} from "../../user/dto/delete-user.dto";
import {DeleteUserV2Dto} from "../dto/delete-user-v2.dto";
import {SendEmailDto} from "../../user/dto/send-email.dto";
import {InviteV2Entity} from "../domain/entity/invite-v2.entity";

@Controller('v2/user')
@ApiTags('User V2')

export class UserV2Controller {
    constructor(private readonly userV2Service: UserV2Service) {
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
    @ApiResponse({status: HttpStatus.CREATED})
    async create(@Body() data: CreateUserV2Dto) {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][POST][Create] - init`);
        return this.userV2Service.create(data);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.NO_CONTENT})
    async update(@Param('id') id: string, @Body() data: UpdateUserV2Dto): Promise<UserV2Entity> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][PUT][Update] - init`);
        return this.userV2Service.update(id, data);
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

    @Post('accept-invite/:inviteId/:password')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED})
    async acceptInvite(
        @Param('inviteId') inviteId: string,
        @Param('password') password: string,
        @Body() data: CreateUserV2Dto): Promise<UserV2Entity> {
        Logger.log(``);
        Logger.log(`> [Controller][User V2][POST][Accept Invite] - init`);
        return this.userV2Service.acceptInvite(inviteId, password, data);
    }
}