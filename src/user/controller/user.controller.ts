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

@Controller('v1/user')
@ApiTags('User')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('all')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserEntity,
        isArray: true,
    })
    async getAll(): Promise<IUserResponseApi[]> {
        Logger.log(`> [Controller][User][GET][getAll] - init`);
        return this.userService.getAll();
    }

    @Get('birthdays-month/:month')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserEntity,
        isArray: true,
    })
    async getAllBirthdaysMonth(@Param('month') month: number): Promise<IUserResponseApi[]> {
        Logger.log(`> [Controller][User][GET][getAllBirthdaysMonth] - init`);
        return this.userService.getAllBirthdaysMonth(month);
    }

    @Get('get-by-id/:id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserEntity,
        isArray: true,
    })
    async getById(@Param('id') id: string): Promise<IUserResponseApi> {
        Logger.log(`> [Controller][User][GET][getById] - init`);
        return this.userService.getById(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED})
    async create(@Body() data: CreateUserDto) {
        Logger.log(`> [Controller][User][POST][Create] - init`);
        return this.userService.create(data);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.NO_CONTENT})
    async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
        Logger.log(`> [Controller][User][PUT][Update] - init`);
        return this.userService.update(id, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.OK})
    async delete(@Param() params: DeleteUserDto) {
        Logger.log(`> [Controller][User][DELETE][Update] - init`);
        return this.userService.delete(params);
    }

    @Post('/email/send-invite')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED})
    async sendInvite(@Body() sendEmailDto: SendEmailDto) {
        Logger.log(`> [Controller][User][POST][sendInvite] - init`);
        return this.userService.sendInvite(sendEmailDto);
    }

    @Post('accept-invite')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED})
    async acceptInvite(@Body() data: CreateUserInviteDto) {
        Logger.log(`> [Controller][User][POST][acceptInvite] - init`);
        Logger.log(`> [Controller][User][POST][acceptInvite] data - ${data}`);

        return this.userService.acceptInvite(data);
    }

    @Post('update-info')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED})
    async updateInfo(@Body() data: UpdateInfoDto) {
        Logger.log(`> [Controller][User][POST][updateInfo] - init`);
        Logger.log(`> [Controller][User][POST][updateInfo] data - ${data}`);

        return this.userService.updateInfo(data);
    }
}