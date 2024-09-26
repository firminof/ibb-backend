import {DataSource, Repository} from "typeorm";
import {UserEntity} from "../domain/entity/user.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class UserRepository extends Repository<UserEntity> {
    constructor(private dataSource: DataSource) {
        super(UserEntity, dataSource.createEntityManager());
    }

    async getAll(): Promise<UserEntity[]> {
        const users: UserEntity[] = await this.find({ where: {}, order: { nome: 'ASC' } });

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

    async findById(id: string): Promise<UserEntity> {
        return await this.findOneById(id);
    }

    async deleteUser(user: UserEntity) {
        return this.remove(user);
    }

    async findByEmail(email: string): Promise<any> {
        const user: UserEntity[] = await this.find({
            where: {
                email,
            }
        });

        return user[0];
    }
}