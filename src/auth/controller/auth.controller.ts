import {Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post,} from '@nestjs/common';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {AuthService} from "../services/auth.service";
import {ResetPasswordAuthDto} from "../dto/auth.dto";
import {UserEntity} from "../../user/domain/entity/user.entity";


@Controller('v1/auth')
@ApiTags('Auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Get('reset-password/:email')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.OK})
    async resetPassword(@Param('email') email: string) {
        Logger.log(`> [Controller][Auth][POST][resetPassword] - init`);
        return this.authService.resetPassword(email);
    }

    @Get('find-user/:email')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.OK,})
    async findUserByEmail(@Param('email') email: string) {
        Logger.log(`> [Controller][Auth][POST][findUserByEmail] - init`);
        return this.authService.findUserByEmail(email);
    }
}
