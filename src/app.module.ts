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
        MinistrieModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
