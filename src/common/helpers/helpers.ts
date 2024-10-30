import {UserEntity} from "../../user/domain/entity/user.entity";
import {IUser, IUserResponseApi} from "../../user/dto/list-users.dto";

export const calcularIdade = (dataNascimento: Date) => {
    // Converter a string de data de nascimento em um objeto Date
    const dataNasc: Date = new Date(`${dataNascimento.toString().split('T')[0]}T03:01:00.000Z`);
    const hoje: Date = new Date();

    // Calcular a diferença entre o ano atual e o ano de nascimento
    let idade: number = hoje.getFullYear() - dataNasc.getFullYear();

    // Ajustar a idade caso o aniversário ainda não tenha ocorrido no ano atual
    const mesAtual: number = hoje.getMonth();
    const mesNasc: number = dataNasc.getMonth();
    const diaAtual: number = hoje.getDate();
    const diaNasc: number = dataNasc.getDate();

    if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
        idade--;
    }

    return idade;
}

export const formatDataPtbr = (data: any): string => {
    if (data) {
        let data_iso: Date = new Date(`${data.toString().split('T')[0]}T03:01:00.000Z`);

        if (data instanceof Date) {
            data_iso = data;
            return formatDataHoraPtbr(data_iso);
        }

        const data_dia: string = `${data_iso.getDate() <= 9 ? '0' + data_iso.getDate() : data_iso.getDate()}`;
        const data_mes: string = `${(data_iso.getMonth() + 1 <= 9) ? '0' + (data_iso.getMonth() + 1) : data_iso.getMonth() + 1}`;
        const data_ano: string = `${data_iso.getFullYear()}`;
        return `${data_dia}/${data_mes}/${data_ano}`; //EX: 15/11/2024
    }
    return ''
}

export const formatDataHoraPtbr = (data_iso: Date): string => {
    const data_dia: string = `${data_iso.getDate() <= 9 ? '0' + data_iso.getDate() : data_iso.getDate()}`;
    const data_mes: string = `${(data_iso.getMonth() + 1 <= 9) ? '0' + (data_iso.getMonth() + 1) : data_iso.getMonth() + 1}`;
    const data_ano: string = `${data_iso.getFullYear()}`;

    const hours: string = `${data_iso.getHours() <= 9 ? '0' + data_iso.getHours() : data_iso.getHours()}`;
    const minutes: string = `${data_iso.getMinutes() <= 9 ? '0' + data_iso.getMinutes() : data_iso.getMinutes()}`;
    const seconds: string = `${data_iso.getSeconds() <= 9 ? '0' + data_iso.getSeconds() : data_iso.getSeconds()}`;

    const hora: string = `${hours}:${minutes}:${seconds}`;
    return `${data_dia}/${data_mes}/${data_ano} ${hora}`; //EX: 15/11/2024 10:24:50
}
export const formatCPF = (cpf: string): string => {
    if (cpf) {
        const treatedCpf = cpf.replace(/\.|\-/g, '');
        const formattedCpf = treatedCpf
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
        return formattedCpf;
    }
    return ''
};

export const formatTelefone = (telefone): string => {
    // Remover qualquer caractere que não seja número
    const telefoneLimpo = telefone.replace(/\D/g, '');

    // Verificar se o telefone tem 10|11 dígitos (incluindo o DDD)
    if (telefoneLimpo.length === 10 || telefoneLimpo.length === 11) {
        // Formatando o telefone com os parênteses e o hífen
        return `(${telefoneLimpo.slice(0, 2)}) ${telefoneLimpo.slice(2, 7)}-${telefoneLimpo.slice(7)}`;
    } else {
        // Retornar erro se o telefone for inválido
        return '';
    }
}

export const formatNome = (nome: string) => {
    return nome.toLowerCase().split(' ').map(function (palavra) {
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }).join(' ');
}

export const formatListMember = (allMembers: UserEntity[]) => {
    if (allMembers.length === 0) return [];

    return allMembers.map((member: UserEntity) => {
        const data_nascimento: string = formatDataPtbr(member.data_nascimento);
        const data_casamento: string = formatDataPtbr(member.data_casamento);
        const transferencia: string = formatDataPtbr(member.transferencia);
        const idade: number = calcularIdade(member.data_nascimento);
        const cpf: string = formatCPF(member.cpf);
        const telefone: string = formatTelefone(member.telefone);
        const nome: string = formatNome(member.nome);

        const updatedAt: string = formatDataPtbr(member.updatedAt);
        const falecimento: string = formatDataPtbr(member.falecimento);
        const excluido: string = formatDataPtbr(member.excluido);
        const data_ingresso: string = formatDataPtbr(member.data_ingresso);
        const diacono: IUser = {
            id: member.diacono.id,
            nome: member && member.diacono && member.diacono.nome ? formatNome(member.diacono.nome) : ''
        }
        const filhos: IUser[] = [];
        if (member && member.filhos && member.filhos.length > 0) {
            member.filhos.forEach((filho: IUser) => {
                filho.nome = filho.nome ? formatNome(filho.nome) : '';
                filhos.push(filho);
            });
        }

        const user: IUserResponseApi = {
            _id: member._id,
            nome,
            cpf,
            rg: member.rg,
            email: member.email,
            role: member.role,
            status: member.status.toLowerCase(),
            data_nascimento: data_nascimento,
            estado_civil: member.estado_civil,
            conjugue: member.conjugue,
            foto: member.foto,
            ministerio: member.ministerio ? member.ministerio : [],
            possui_filhos: Boolean(member.possui_filhos),
            diacono,
            filhos,
            idade,
            telefone,
            data_casamento,
            transferencia,
            falecimento,
            excluido,
            updatedAt,
            data_ingresso,
            forma_ingresso: member.forma_ingresso,
            local_ingresso: member.local_ingresso,
            motivo_transferencia: member.motivo_transferencia,
            motivo_falecimento: member.motivo_falecimento,
            motivo_exclusao: member.motivo_exclusao,
            motivo_visita: member.motivo_visita,
            is_diacono: member.is_diacono
        }

        return user;
    });
}

export const formatToInternationalStandard = (phone: string) => {
    const includesCountryCode = phone.includes('+55');

    if (includesCountryCode) {
        return phone;
    }

    const treatedPhone = phone.replace(/\.|\-|([()])|\s|[+]/g, '');

    return '+55' + treatedPhone;
};