import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import * as admin from 'firebase-admin';
import {EventEmitter2, OnEvent} from '@nestjs/event-emitter';
import {firebaseApp} from "../config/firebase.config";
import {CreateRequest} from "firebase-admin/lib/auth";
import {formatNome} from "../../common/helpers/helpers";
import {UserEntity} from "../../user/domain/entity/user.entity";

export interface UserInfo {
    mongoId: string;
    name: string;
    email: string;
    role: string;
    phoneNumber: string;
}

@Injectable()
export class AuthService {
    constructor(private eventEmitter: EventEmitter2) {
    }

    async registerUser(userInfo: UserInfo) {
        Logger.log(`> [Service][Auth][registerUser]] - init`);
        try {
            const auth = admin.auth(firebaseApp);

            const randomPassword =
                Math.random()           // Generate random number, eg: 0.123456
                    .toString(36)  // Convert  to base-36 : "0.4fzyo82mvyr"
                    .slice(-8);         // Cut off last 8 characters : "yo82mvyr";

            const userFirebase: CreateRequest = {
                email: userInfo.email,
                password: randomPassword,
                phoneNumber: userInfo.phoneNumber && userInfo.phoneNumber.length > 0 ? userInfo.phoneNumber : '',
                displayName: formatNome(userInfo.name),
                emailVerified: false,
            }

            const userRecord = await auth.createUser(userFirebase);

            await auth.setCustomUserClaims(userRecord.uid, {
                role: userInfo.role,
                mongoId: userInfo.mongoId,
            });

            const passwordResetLink = await auth.generatePasswordResetLink(
                userInfo.email,
            );

            return userRecord;
        } catch (e) {
            throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async resetPassword(email: string) {
        Logger.log(`> [Service][Auth][POST][resetPassword] - init`);
        try {
            const auth = admin.auth(firebaseApp);

            const passwordResetLink = await auth.generatePasswordResetLink(email);

            // this.eventEmitter.emit('password-reset-link.generated', {
            //   link: passwordResetLink,
            //   email,
            // });

            return {
                link: passwordResetLink,
                email,
            }
        } catch (e) {
            throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async removeUser(user: UserEntity) {
        try {
            const uids = user.providersInfo.map((info) => info.uid);

            uids.map((uid) => this.removeUserByUid(uid));
        } catch (e) {
            throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async removeUserByUid(uid: string) {
        try {
            const auth = admin.auth(firebaseApp);
            await auth.deleteUser(uid);
        } catch (e) {
            throw new BadRequestException(`Erro no firebase: ${e.message}`);
        }
    }

    async findUserByEmail(email: string) {
        const auth = admin.auth(firebaseApp);

        const userRecord = await auth.getUserByEmail(email);

        return userRecord;
    }

    async findUserByUid(uid: string) {
        const auth = admin.auth(firebaseApp);

        return await auth.getUser(uid);
    }

    async setCustomClaimsForUser(uid: string, role: string, mongoId: string) {
        const auth = admin.auth(firebaseApp);

        const userRecord = await auth.getUser(uid);

        if (!userRecord.customClaims) {
            await auth.setCustomUserClaims(uid, {role, mongoId});
        }
    }
}
