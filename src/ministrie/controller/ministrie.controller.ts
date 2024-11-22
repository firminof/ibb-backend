import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post, Put} from "@nestjs/common";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {MinistrieService} from "../service/ministrie.service";
import {MinistrieEntity} from "../domain/entity/ministrie.entity";
import {CreateMinistrieDto} from "../dto/create-ministrie.dto";
import {UpdateUserDto} from "../../user/dto/update-user.dto";
import {DeleteUserDto} from "../../user/dto/delete-user.dto";
import {DeleteMinistrieDto} from "../dto/delete-ministrie.dto";
import {UpdateMinistrieDto} from "../dto/update-ministrie.dto";
import {IListMinistriesDto} from "../dto/list-ministries.dto";

@Controller('v1/ministrie')
@ApiTags('Ministrie')
export class MinistrieController {
    constructor(private ministrieService: MinistrieService) {
    }

    @Get('all')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: MinistrieEntity,
        isArray: true
    })
    async getAll(): Promise<MinistrieEntity[]> {
        Logger.log(``);
        Logger.log(`> [Controller][Ministrie][GET][getAll] - init`);
        return this.ministrieService.getAll();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.CREATED})
    async create(@Body() data: CreateMinistrieDto) {
        Logger.log(``);
        Logger.log(`> [Controller][Ministrie][POST][Create] - init`);
        return this.ministrieService.create(data);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.NO_CONTENT})
    async update(@Param('id') id: string, @Body() data: UpdateMinistrieDto) {
        Logger.log(``);
        Logger.log(`> [Controller][Ministrie][PUT][Update] - init`);
        return this.ministrieService.update(id, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.OK})
    async delete(@Param() params: DeleteMinistrieDto) {
        Logger.log(``);
        Logger.log(`> [Controller][Ministrie][DELETE][Update] - init`);
        return this.ministrieService.delete(params);
    }
}