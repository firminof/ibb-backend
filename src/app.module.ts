import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ORMConfig} from "./config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule} from "@nestjs/config";
import {Config} from "./config/config";
import {EventEmitterModule} from "@nestjs/event-emitter";
import {ScheduleModule} from "@nestjs/schedule";
import {UserModule} from "./user/user.module";
import {MinistrieModule} from "./ministrie/ministrie.module";
import {AuthModule} from "./auth/auth.module";
import {TwilioMessagingService} from "./common/services/twilio-messaging.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [Config],
            isGlobal: true,
        }),
        TypeOrmModule.forRoot(ORMConfig),
        EventEmitterModule.forRoot({
            wildcard: true,
        }),
        ScheduleModule.forRoot(),

        UserModule,
        MinistrieModule,
        AuthModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
