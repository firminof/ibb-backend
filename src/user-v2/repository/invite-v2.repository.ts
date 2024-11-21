import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {InviteV2Entity} from "../domain/entity/invite-v2.entity";
import {UserEntity} from "../../user/domain/entity/user.entity";

@Injectable()
export class InviteV2Repository extends Repository<InviteV2Entity> {
    constructor(private dataSource: DataSource) {
        super(InviteV2Entity, dataSource.createEntityManager())
    }

    async getAll(): Promise<InviteV2Entity[]> {
        const invites: InviteV2Entity[] = await this.find({ where: {}, order: { requestName: 'ASC' } });

        return invites.sort((a: any, b: any) =>
            a.requestName
                .replace(/[^a-zA-Z0-9]/g, '')
                .toLowerCase()
                .trim() >
            b.requestName
                .replace(/[^a-zA-Z0-9]/g, '')
                .toLowerCase()
                .trim()
                ? 1
                : -1,
        );
    }

    async findById(id: string): Promise<InviteV2Entity> {
        return await this.findOneById(id);
    }

    async findByEmail(email: string): Promise<any> {
        const invites: InviteV2Entity[] = await this.find({
            where: {
                to: email,
            },
        });

        return invites[0];
    }

    async deleteInvite(invite: InviteV2Entity): Promise<InviteV2Entity> {
        return this.remove(invite);
    }
}