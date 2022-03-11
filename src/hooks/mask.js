// 000.000.000-00
export const maskCPF = value => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

// 00.000.000/0000-00
export const maskCNPJ = value => {
  return value
    .replace(/\D+/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')  
    .replace(/(-\d{2})\d+?$/, '$1');
  };

// (00) 00000-0000
export const maskPhone = (value) => {
  value=value.replace(/\D/g,"");

  if(value.length <= 11) {
    value=value.replace(/^(\d{2})(\d)/g,"($1) $2");
  }else {
    value=value.replace(/^(\d{4})(\d)/g,"$1 $2");
  }

  if(value.length === 11) {
    value=value.replace(/(\d)(\d{1})$/,"$1-$2");
  }

  if(value.length >= 12) {
    value=value.replace(/(\d)(\d{4})$/,"$1-$2");
  }

  return String(value);
}

export const maskMoney = (value) => {
  value = value.replace('.', '').replace(',', '').replace(/\D/g, '')

  const options = { minimumFractionDigits: 2 }
  const result = new Intl.NumberFormat('pt-BR', options).format(
    parseFloat(value) / 100
  )

  return result
}


// 00000-000
export const maskCEP = value => {
  return value.replace(/\D/g, "").replace(/^(\d{5})(\d{3})+?$/, "$1-$2");
};

export const maskYear = value => {
  value=value.replace(/\D/g,"");

  return value.slice(0, 4);
};

// 00/00/0000
export const maskDate = value => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1");
};

// Aceita apenas que letras sejam digitadas
export const maskOnlyLetters = value => {
  return value.replace(/[0-9!@#¨$%^&*)(+=._-]+/g, "");
};

// Aceita apenas números
export const maskOnlyNumbers = value => {
  return value.replace(/\D/g, "");
};