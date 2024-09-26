import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {MinistrieEntity} from "../domain/entity/ministrie.entity";

@Injectable()
export class MinistrieRepository extends Repository<MinistrieEntity> {
    constructor(private dataSource: DataSource) {
        super(MinistrieEntity, dataSource.createEntityManager());
    }

    async getAll(): Promise<MinistrieEntity[]> {
        const ministries: MinistrieEntity[] = await this.find({ where: {}, order: { nome: 'ASC' } });

        return ministries.sort((a: any, b: any) =>
            a.nome
                .replace(/[^a-zA-Z0-9]/g, '')
                .toLowerCase()
                .trim() >
            b.nome
                .replace(/[^a-zA-Z0-9]/g, '')
                .toLowerCase()
                .trim()
                ? 1
                : -1,
        );
    }

    async findById(id: string) : Promise<MinistrieEntity> {
        return await this.findOneById(id);
    }

    async deleteMinistrie(ministrie: MinistrieEntity) {
        return this.remove(ministrie);
    }
}