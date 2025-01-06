import {BadRequestException, Injectable, UploadedFile} from '@nestjs/common';
import {v4 as uuidv4} from 'uuid';
import {ParseFile} from "../decorators/parse-file.decorator";
import {BlobServiceClient, BlockBlobClient} from "@azure/storage-blob";
import * as process from "process";

@Injectable()
export class UploadService {

    constructor() {
    }

    private async getBlobServiceInstance() {
        const connectionString = process.env.CONNECTION_STRING_AZURE;

        const blobClientService = await BlobServiceClient.fromConnectionString(
            connectionString,
        );

        return blobClientService;
    }

    private async getBlobClient(imageName: string, containerName: string): Promise<BlockBlobClient> {
        const blobService = await this.getBlobServiceInstance();
        const containerClient = blobService.getContainerClient(containerName);
        return containerClient.getBlockBlobClient(imageName);
    }


    async uploadFile(@UploadedFile(ParseFile) file): Promise<string> {
        try {
            const fileName = file.originalname.replace(/([^a-zA-Z0-9-._]+)/gi, '-');
            const azureFileName = `${uuidv4()}_${fileName}`;
            let blockBlobClient;

            try {
                blockBlobClient = await this.getBlobClient(
                    azureFileName,
                    process.env.AZURE_CONTAINER_NAME,
                );
            } catch (e) {
                console.log(e);
                throw new BadRequestException('Erro ao obter informações para salvar a imagem');
            }
            const fileUrl = blockBlobClient.url;
            await blockBlobClient.uploadData(file.buffer);
            return fileUrl;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async deleteObject(fileUrl: string): Promise<string> {
        try {
            const fileName = fileUrl.split('/').pop();
            const blockBlobClient = await this.getBlobClient(
                fileName,
                process.env.AZURE_CONTAINER_NAME,
            );
            const res = await blockBlobClient.deleteIfExists();

            if (res.succeeded) {
                return 'Arquivo excluído!'
            }

            return 'Falha ao excluir o arquivo!'
        } catch (error) {
            console.error(`Erro ao excluir objeto do S3:`, error);
        }
    }
}
