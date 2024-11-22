import {ApiProperty, PartialType} from "@nestjs/swagger";
import {IsArray, IsOptional} from "class-validator";
import {IMemberDto} from "../../user-v2/dto/create-user-v2.dto";
import {CreateMinistrieDto} from "./create-ministrie.dto";

export class UpdateMinistrieDto extends PartialType(CreateMinistrieDto) {}