import {BadRequestException, Injectable, Logger, NotFoundException, Param} from "@nestjs/common";
import {MinisterioCategoriasEnum, MinistrieEntity} from "../domain/entity/ministrie.entity";
import {MinistrieRepository} from "../repository/ministrie.repository";
import {CreateMinistrieDto} from "../dto/create-ministrie.dto";
import {UpdateMinistrieDto} from "../dto/update-ministrie.dto";
import {DeleteMinistrieDto} from "../dto/delete-ministrie.dto";
import {IListMinistriesDto} from "../dto/list-ministries.dto";
import {formatDataHoraPtbr, formatNome} from "../../common/helpers/helpers";

@Injectable()
export class MinistrieService {
    constructor(private readonly ministrieRepository: MinistrieRepository) {
    }

    async getAll(): Promise<MinistrieEntity[]> {
        Logger.log('[Service][Ministrie][GET][getAll] - Fetching all ministries');

        try {
            const ministerios = await this.ministrieRepository.getAll();

            return ministerios.map((ministerio) => ({
                _id: ministerio._id.toString(),
                nome: formatNome(ministerio.nome),
                responsavel: ministerio.responsavel,
                categoria: ministerio.categoria,
                updatedAt: ministerio.updatedAt,
                createdAt: ministerio.createdAt,
            }));
        } catch (error) {
            Logger.error('[Service][Ministrie][GET][getAll] - Error fetching ministries', error.stack);
            throw new BadRequestException(error.message || 'Erro ao buscar ministérios');
        }
    }

    async getById(@Param('id') id: string): Promise<MinistrieEntity> {
        Logger.log('[Service][Ministrie][GET][getById] - Fetching 1 ministrie');

        try {
            return await this.ministrieRepository.findById(id);

        } catch (error) {
            Logger.error('[Service][Ministrie][GET][getById] - Error fetching ministries', error.stack);
            throw new BadRequestException(error.message || 'Erro ao buscar ministérios');
        }
    }

    async create(data: CreateMinistrieDto): Promise<MinistrieEntity> {
        Logger.log('[Service][Ministrie][POST][create] - Starting ministry creation');

        try {
            if (!data) throw new BadRequestException('Dados não fornecidos');

            if (data.nome.length <= 3) {
                throw new BadRequestException('O nome do ministério deve ter mais de 3 caracteres.');
            }

            if (!data.responsavel?.length) {
                throw new BadRequestException('É necessário especificar pelo menos um responsável.');
            }

            if (!(data.categoria in MinisterioCategoriasEnum)) {
                throw new BadRequestException('Categoria inválida!');
            }

            const newMinistrie: MinistrieEntity = {
                nome: data.nome,
                responsavel: data.responsavel,
                categoria: data.categoria,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            Logger.debug('[Service][Ministrie][POST][create] - New ministry data:', newMinistrie);

            const saved = await this.ministrieRepository.save(newMinistrie);

            Logger.log('[Service][Ministrie][POST][create] - Ministry created successfully');
            return saved;
        } catch (error) {
            Logger.error('[Service][Ministrie][POST][create] - Error creating ministry', error.stack);
            throw new BadRequestException(error.message || 'Erro ao criar ministério');
        }
    }

    async update(id: string, data: UpdateMinistrieDto): Promise<MinistrieEntity> {
        Logger.log('[Service][Ministrie][PUT][update] - Starting update process');

        try {
            const ministrie = await this.ministrieRepository.findById(id);

            if (!ministrie) {
                throw new NotFoundException('Ministério não encontrado!');
            }

            const updatedMinistrie = {
                ...ministrie,
                ...data,
                updatedAt: new Date(),
            };

            const saved = await this.ministrieRepository.save(updatedMinistrie);

            Logger.log('[Service][Ministrie][PUT][update] - Ministry updated successfully');
            return saved;
        } catch (error) {
            Logger.error('[Service][Ministrie][PUT][update] - Error updating ministry', error.stack);
            throw new BadRequestException(error.message || 'Erro ao atualizar ministério');
        }
    }

    async delete(param: DeleteMinistrieDto): Promise<void> {
        Logger.log('[Service][Ministrie][DELETE] - Starting delete process');

        try {
            const ministrie = await this.ministrieRepository.findById(param.id);

            if (!ministrie) {
                throw new NotFoundException('Ministério não encontrado!');
            }

            await this.ministrieRepository.deleteMinistrie(ministrie);
            Logger.log('[Service][Ministrie][DELETE] - Ministry deleted successfully');
        } catch (error) {
            Logger.error('[Service][Ministrie][DELETE] - Error deleting ministry', error.stack);
            throw new BadRequestException(error.message || 'Erro ao deletar ministério');
        }
    }
}