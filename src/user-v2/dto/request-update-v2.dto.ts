import {ApiProperty} from "@nestjs/swagger";
import {IsArray} from "class-validator";

export class RequestUpdateV2Dto {
    @ApiProperty({type: [String]})
    @IsArray()
    _id: string[];
}