import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Get, HttpCode, HttpStatus, Logger, Post} from "@nestjs/common";
import {UserEntity} from "../domain/entity/user.entity";
import {UserService} from "../service/user.service";
import {CreateUserDto} from "../dto/create-user.dto";

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
    async getAll(): Promise<UserEntity[]> {
        return this.userService.getAll();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED, type: UserEntity})
    async create(@Body() data: CreateUserDto) {
        Logger.log(`> [Controller][User][Post][Create] - init`);
        return this.userService.create(data);
    }
}