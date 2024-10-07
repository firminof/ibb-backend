import {Logger} from "@nestjs/common";

export const formatPhoneNumber = (phone: string) => {
    // Remove qualquer caractere não numérico
    phone = phone.replace(/\D/g, '');
    Logger.log(`> [Validations][formatPhoneNumber] - ${phone}`);

    // Adiciona o código do país (+55) se o número tiver 11 ou 12 dígitos (para celular ou fixo com código do país)
    const countryCode = '+55 ';

    // Formato para números de celular com 9 dígitos no corpo (e código do país)
    if (phone.length === 13) {
        return countryCode + phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '($2) $3-$4');
    }

    // Formato para números fixos com 8 dígitos no corpo (e código do país)
    if (phone.length === 12) {
        return countryCode + phone.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '($2) $3-$4');
    }

    // Formato para números de celular sem código do país
    if (phone.length === 11) {
        return countryCode +  phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    // Formato para números fixos sem código do país
    if (phone.length === 10) {
        return countryCode + phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    // Retorna o número sem formatação se não corresponder aos padrões
    return countryCode + phone;
}