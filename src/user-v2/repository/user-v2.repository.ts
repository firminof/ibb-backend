import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {UserV2Entity} from "../domain/entity/user-v2.entity";

@Injectable()
export class UserV2Repository extends Repository<UserV2Entity> {
    constructor(private dataSource: DataSource) {
        super(UserV2Entity, dataSource.createEntityManager());
    }

    async getAll(): Promise<UserV2Entity[]> {
        const users: UserV2Entity[] = await this.find({ where: {}, order: { nome: 'ASC' } });

        return users.sort((a: any, b: any) =>
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

    async findById(id: string): Promise<UserV2Entity> {
        return await this.findOneById(id);
    }

    async deleteUser(user: UserV2Entity) {
        return this.remove(user);
    }

    async findByEmail(email: string): Promise<any> {
        const users: UserV2Entity[] = await this.find({
            where: {
                email,
            },
        });

        return users[0];
    }
}