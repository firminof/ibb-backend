import {BadRequestException, Injectable, Logger, UploadedFile} from '@nestjs/common';
import {v4 as uuidv4} from 'uuid';
import {ParseFile} from "../decorators/parse-file.decorator";
import {BlobServiceClient, BlockBlobClient} from "@azure/storage-blob";
import * as process from "process";
import {CivilStateEnumV2, StatusEnumV2, UserRolesV2, UserV2} from "../domain/entity/abstractions/user-v2.abstraction";
import * as csv from 'csv-parser';
import * as streamifier from 'streamifier';
import {formatPhoneNumber} from "../../common/validations/telefone";
import {formatCPF, formatNome} from "../../common/helpers/helpers";

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

    async uploadCsv(@UploadedFile(ParseFile) file): Promise<UserV2[]> {
        Logger.log(``);
        Logger.log(`> [Service][User V2][POST][uploadCsv] - init`);
        try {
            const results: UserV2[] = [];
            const headers = [
                'Nome', 'Ativo', 'Estado Civil', 'CPF', 'Ident', 'Email', 'data nascimento', 'TipoPessoa',
                'DataCasam', 'NomeVinculo', 'DataFalec', 'Falecido', 'Telefone', 'EnderecoCompleto',
                'Bairro', 'Cidade', 'UF', 'Pais', 'CEP', 'Complemento', 'Numero'
            ];

            return new Promise((resolve, reject) => {
                const stream = streamifier.createReadStream(file.buffer)
                    .pipe(csv({headers, skipLines: 1}))
                    .on('data', (data) => {
                        results.push({
                            historico: [],
                            nome: data['Nome'],
                            foto: '',
                            cpf: data['CPF'],
                            rg: data['Ident'],
                            email: this.tratarVariosEmails(data['Email']),
                            telefone: this.tratarTelefone(data['Telefone']),
                            dataNascimento: this.tratarDataNascimento(data['data nascimento']),
                            role: UserRolesV2.MEMBRO,
                            status: data['Ativo'] === 'S' ? StatusEnumV2.ativo : StatusEnumV2.inativo,
                            informacoesPessoais: {
                                estadoCivil: this.tratarEstadoCivil(data['Estado Civil']),
                                casamento: {
                                    conjugue: {
                                        id: '',
                                        nome: '',
                                        isMember: false,
                                        isDiacono: false
                                    },
                                    dataCasamento: null,
                                },
                                filhos: [],
                                temFilhos: false,
                            },
                            diacono: {
                                id: '',
                                nome: '',
                                isDiacono: false,
                                isMember: false,
                            },
                            ministerio: [],
                            endereco: {
                                cep: data['CEP'],
                                rua: data['EnderecoCompleto'],
                                numero: data['Numero'],
                                complemento: data['Complemento'] || null,
                                bairro: data['Bairro'],
                                cidade: data['Cidade'],
                                estado: data['UF'],
                                pais: data['Pais'],
                            },
                            ingresso: {
                                data: null,
                                forma: '',
                                local: '',
                            },
                            transferencia: {
                                data: null,
                                motivo: '',
                                local: '',
                            },
                            falecimento: {
                                data: null,
                                motivo: '',
                                local: '',
                            },
                            exclusao: {
                                data: null,
                                motivo: '',
                            },
                            visitas: {
                                motivo: '',
                            },
                            autenticacao: {
                                providersInfo: [],
                            },
                            isDiacono: false
                        } as UserV2);
                    })
                    .on('end', () => resolve(results))
                    .on('error', (error) => reject(error));
            });
        } catch (e) {
            Logger.error(e.stack);
            Logger.error(e);
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

    private tratarEstadoCivil(estadoCivil: string) {
        switch (estadoCivil.split('(a)')[0]) {
            case 'Solteiro':
                return CivilStateEnumV2.solteiro;
            case 'Casado':
                return CivilStateEnumV2.casado;
            case 'Divorciado':
                return CivilStateEnumV2.divorciado;
            case 'Viúvo':
                return CivilStateEnumV2.viuvo;
            case 'Separado':
                return CivilStateEnumV2.separado;
            default:
                return CivilStateEnumV2.solteiro;
        }
    }

    private tratarVariosEmails(emails: string): string {
        if (emails.includes(';')){
            return emails.split(';').map(email => email.trim())[0];
        }
        return emails;
    }

    private tratarTelefone(telefone: string): string {
        if (!telefone) {
            return '';
        }

        const telefoneRegex = /\d{2,5}-\d{4,5}/g;
        const match = telefone.match(telefoneRegex);

        if (match) {
            return formatPhoneNumber(match[0]);
        }

        if (telefone.includes('cel:')) {
            return formatPhoneNumber(telefone.split('cel:')[1].trim());
        }

        if (telefone.includes('WA:')) {
            return formatPhoneNumber(telefone.split('WA:')[1].trim());
        }

        if (telefone.includes('Res:')) {
            return formatPhoneNumber(telefone.split('Res:')[1].trim());
        }
    }

    private tratarDataNascimento(dataNascimento: Date): Date {
        if (!dataNascimento) {
            return new Date('1900-01-01')
        }

        const diaMesAno = dataNascimento.toString().split('T')[0];
        return new Date(`${diaMesAno}T03:00:00.000Z`);
    }
}
