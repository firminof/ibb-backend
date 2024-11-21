import {PartialType} from "@nestjs/swagger";
import {CreateUserV2Dto} from "./create-user-v2.dto";

export class UpdateUserV2Dto extends PartialType(CreateUserV2Dto){}