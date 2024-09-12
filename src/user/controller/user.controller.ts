import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post, Put} from "@nestjs/common";
import {UserEntity} from "../domain/entity/user.entity";
import {UserService} from "../service/user.service";
import {CreateUserDto} from "../dto/create-user.dto";
import {UpdateUserDto} from "../dto/update-user.dto";
import {DeleteUserDto} from "../dto/delete-user.dto";

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
        Logger.log(`> [Controller][User][GET][getAll] - init`);
        return this.userService.getAll();
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
        return this.userService.delete(params);
    }
}