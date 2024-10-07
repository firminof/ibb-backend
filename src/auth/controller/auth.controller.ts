import {Body, Controller, HttpCode, HttpStatus, Logger, Post,} from '@nestjs/common';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {AuthService} from "../services/auth.service";
import {ResetPasswordAuthDto} from "../dto/auth.dto";


@Controller('v1/auth')
@ApiTags('Auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({status: HttpStatus.OK})
    async resetPassword(@Body() data: ResetPasswordAuthDto) {
        Logger.log(`> [Controller][Auth][POST][resetPassword] - init`);
        return this.authService.resetPassword(data.email);
    }
}
