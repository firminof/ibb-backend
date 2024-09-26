import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString} from "class-validator";
import {Type} from "class-transformer";

export class DeleteMinistrieDto {
    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Type(() => String)
    id: string;
}