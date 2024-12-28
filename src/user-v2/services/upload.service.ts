import {Injectable, UploadedFile} from '@nestjs/common';
import {S3Client, PutObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as process from "process";
import {ParseFile} from "../decorators/parse-file.decorator";

@Injectable()
export class UploadService {
    private readonly s3: S3Client;
    private readonly bucketName: string;

    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucketName = process.env.AWS_S3_BUCKET;
    }

    async uploadFile(@UploadedFile(ParseFile) file): Promise<string> {
        const fileKey = `${uuidv4()}_${file.originalname}`;

        const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

        await this.s3.send(command);

        return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    }

    async deleteObject(fileKey: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });

            await this.s3.send(command);
            console.log(`Objeto ${fileKey} excluído com sucesso do bucket ${this.bucketName}.`);
        } catch (error) {
            console.error(`Erro ao excluir objeto do S3:`, error);
        }
    }
}
