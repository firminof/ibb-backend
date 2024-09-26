import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MinistrieRepository} from "./repository/ministrie.repository";
import {MinistrieController} from "./controller/ministrie.controller";
import {MinistrieService} from "./service/ministrie.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([MinistrieRepository]),
    ],
    controllers: [MinistrieController],
    providers: [
        MinistrieService,
        MinistrieRepository
    ],
    exports: [MinistrieService, TypeOrmModule, MinistrieRepository],
})

export class MinistrieModule{}