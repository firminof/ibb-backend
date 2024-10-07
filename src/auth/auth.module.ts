import { Module } from '@nestjs/common';
import {AuthService} from "./services/auth.service";
import {AuthController} from "./controller/auth.controller";

@Module({
  imports: [],
  providers: [
    AuthService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
