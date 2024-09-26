import {BadRequestException, Injectable, Logger, NotFoundException} from "@nestjs/common";
import {MinistrieEntity} from "../domain/entity/ministrie.entity";
import {MinistrieRepository} from "../repository/ministrie.repository";
import {CreateMinistrieDto} from "../dto/create-ministrie.dto";
import {UpdateMinistrieDto} from "../dto/update-ministrie.dto";
import {DeleteMinistrieDto} from "../dto/delete-ministrie.dto";

@Injectable()
export class MinistrieService {
    constructor(private ministrieRepository: MinistrieRepository) {
    }

    async getAll(): Promise<MinistrieEntity[]> {
        Logger.log(`> [Service][Ministrie][GET][getAll] - init`);

        try {
            return await this.ministrieRepository.getAll();
        } catch (e) {
            Logger.log(`> [Service][Ministrie][GET][getAll] catch - ${JSON.stringify(e)}`);
            // if (e['message'] == 'No metadata for "MinistrieEntity" was found.') {
            //     throw new BadRequestException
            // }
            throw new BadRequestException(e['message']);
        }
    }

    async create(data: CreateMinistrieDto) {
        Logger.log(`> [Service][Ministrie][POST][create] - init`);

        try {
            const newMinistrie: MinistrieEntity = {
                nome: data.nome,
                responsavel: data.responsavel,
                categoria: data.categoria,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            Logger.log(`> [Service][Ministrie][POST][create] newMinistrie - ${JSON.stringify(newMinistrie)}`);

            const saved = await this.ministrieRepository.save(newMinistrie);
            Logger.log(`> [Service][Ministrie][POST][create] saved - ${JSON.stringify(saved)}`);
            Logger.log(`> [Service][Ministrie][POST][create] - finished`);
        } catch (e) {
            Logger.log(`> [Service][Ministrie][POST][create] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async update(id: string, data: UpdateMinistrieDto) {
        Logger.log(`> [Service][Ministrie][PUT][update] init`);

        try {
            const ministrie: MinistrieEntity = await this.ministrieRepository.findById(id);

            Logger.log(`> [Service][User][PUT][update][findById] - ${JSON.stringify(ministrie)}`);

            if (!ministrie) {
                throw new NotFoundException('Ministério não encontrado!');
            }

            const saved = await this.ministrieRepository.save({
                ...ministrie,
                ...data
            })
            Logger.log(`> [Service][Ministrie][PUT][update] saved - ${JSON.stringify(saved)}`);
            Logger.log(`> [Service][Ministrie][PUT][update] finished`);
        } catch (e) {
            Logger.log(`> [Service][Ministrie][PUT][update] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }
    }

    async delete(param: DeleteMinistrieDto) {
        Logger.log(`> [Service][Ministrie][DELETE] init`);

        try {
            const ministrie: MinistrieEntity = await this.ministrieRepository.findById(param.id);

            Logger.log(`> [Service][User][DELETE][update][findById] - ${JSON.stringify(ministrie)}`);

            if (!ministrie) {
                throw new NotFoundException('Ministério não encontrado!');
            }

            await this.ministrieRepository.deleteMinistrie(ministrie);
        } catch (e) {
            Logger.log(`> [Service][Ministrie][DELETE] catch - ${JSON.stringify(e)}`);
            throw new BadRequestException(e['message']);
        }

    }
}