import { BadRequestError } from 'passport-headerapikey';

export const validateCPF = (cpf: string) => {
  const treatedCpf = cpf.replace(/\.|\-/g, '');

  if (treatedCpf == '00000000000') {
    return false;
  }

  let sum = 0;
  let reminder;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(treatedCpf.substring(i - 1, i)) * (11 - i);
    reminder = (sum * 10) % 11;
  }

  if (reminder === 10 || reminder === 11) {
    reminder = 0;
  }

  if (reminder != parseInt(treatedCpf.substring(9, 10))) {
    return false;
  }

  sum = 0;

  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(treatedCpf.substring(i - 1, i)) * (12 - i);
    reminder = (sum * 10) % 11;
  }

  if (reminder === 10 || reminder === 11) {
    reminder = 0;
  }

  if (reminder != parseInt(treatedCpf.substring(10, 11))) {
    return false;
  }

  return true;
};

export const validateCPFLength = (cpf: string) => {
  const treatedCpf = cpf.replace(/\.|-|\s/g, '');
  if (treatedCpf.length < 11) {
    throw new BadRequestError('O CPF precisa conter 11 dígitos');
  }
  return cpf;
};
