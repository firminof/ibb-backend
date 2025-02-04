import {Historico, UserV2} from "../../user-v2/domain/entity/abstractions/user-v2.abstraction";
import {Logger} from "@nestjs/common";


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
    return nome && nome.toString().length > 0 ? nome.toLowerCase().split(' ').map(function (palavra) {
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }).join(' ') : nome;
}

export const formatToInternationalStandard = (phone: string) => {
    const includesCountryCode: boolean = phone.includes('+55');

    if (includesCountryCode) {
        return phone.replace(/\.|\-|([()])|\s/g, '');
    }

    const treatedPhone: string = phone.replace(/\.|\-|([()])|\s|[+]/g, '');

    return '+55' + treatedPhone;
};

function formatChildrenHistory(oldValue: any[], newValue: any[]): string {
    // Comparar as mudanças entre filhos
    const formatChild = (child: any) => {
        return `nome: ${child.nome || 'não especificado'}, membro: ${child.isMember ? 'Sim' : 'Não'}, diác. ${child.isDiacono ? 'Sim' : 'Não'}`;
    };

    const changes: string[] = [];
    oldValue.forEach((oldChild, index) => {
        const newChild = newValue[index];
        // Verificar se houve alteração
        if (oldChild && newChild && (oldChild.nome !== newChild.nome || oldChild.isMember !== newChild.isMember || oldChild.isDiacono !== newChild.isDiacono)) {
            changes.push(`nome: ${newChild.nome || 'não especificado'}, membro: ${newChild.isMember ? 'Sim' : 'Não'}, diác. ${newChild.isDiacono ? 'Sim' : 'Não'}`);
        }
    });

    return changes.join(' | ');
}

export function gerarHistorico(oldState: any, newState: any): Historico[] {
    const changes: Historico[] = [];

    function compareArrays(prefix: string, oldArray: any[], newArray: any[]) {
        const formatted = formatChildrenHistory(oldArray, newArray);

        if (formatted) {
            changes.push({
                chave: prefix,
                antigo: formatted,
                novo: formatted,
                updatedAt: new Date(),
            });
        }
    }

    function compareObjects(prefix: string, oldObj: any, newObj: any) {
        if (prefix.startsWith('autenticacao')) return; // Ignora qualquer chave começando com 'autenticacao'
        if (prefix.startsWith('_id')) return; // Ignora qualquer chave começando com 'id'
        if (prefix.startsWith('historico')) return; // Ignora qualquer chave começando com 'historico'
        if (prefix.startsWith('updatedAt')) return; // Ignora qualquer chave começando com 'updatedAt'
        if (prefix.startsWith('createdAt')) return; // Ignora qualquer chave começando com 'updatedAt'
        if (prefix.startsWith('id')) return; // Ignora qualquer chave começando com 'updatedAt'
        if (prefix.startsWith('is_member')) return; // Ignora qualquer chave começando com 'updatedAt'

        if (oldObj === newObj) return;

        if (Array.isArray(oldObj) && Array.isArray(newObj)) {
            compareArrays(prefix, oldObj, newObj);
        } else if (typeof oldObj === 'object' && typeof newObj === 'object' && oldObj && newObj) {
            const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
            keys.forEach(key => {
                compareObjects(
                    `${prefix ? `${prefix}.` : ''}${key}`,
                    oldObj[key],
                    newObj[key]
                );
            });
        } else {
            changes.push({
                chave: prefix,
                antigo: formatValue(oldObj),
                novo: formatValue(newObj),
                updatedAt: new Date(),
            });
        }
    }

    compareObjects('', oldState, newState);
    return changes;
}

function formatValue(value: any): string {
    if (value === null || value === undefined) {
        return ''; // Valor vazio para null ou undefined
    } else if (typeof value === 'boolean') {
        return value ? 'Sim' : 'Não'; // Formata booleanos
    } else if (Array.isArray(value)) {
        return `[${value.map(item => JSON.stringify(item, null, 2)).join(', ')}]`; // Formata arrays
    } else if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null, 4); // Formata JSON com 4 espaços de indentação
        } catch {
            return '[Unserializable Object]';
        }
    } else {
        return String(value); // Retorna valores como estão
    }
}