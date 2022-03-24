export function validateCPF(cpf) {	
	cpf = cpf.replace(/[^\d]+/g,'');	
	if(cpf == '') return false;	
	// Elimina CPFs invalidos conhecidos	
	if (cpf.length != 11 || 
		cpf == "00000000000" || 
		cpf == "11111111111" || 
		cpf == "22222222222" || 
		cpf == "33333333333" || 
		cpf == "44444444444" || 
		cpf == "55555555555" || 
		cpf == "66666666666" || 
		cpf == "77777777777" || 
		cpf == "88888888888" || 
		cpf == "99999999999")
			return false;		
	// Valida 1o digito	
	let add = 0;	
	for (let i=0; i < 9; i ++)		
		add += parseInt(cpf.charAt(i)) * (10 - i);	
	let rev = 11 - (add % 11);	
		if (rev == 10 || rev == 11)		
			rev = 0;	
		if (rev != parseInt(cpf.charAt(9)))		
			return false;		
	// Valida 2o digito	
	add = 0;	
	for (let i = 0; i < 10; i ++)		
		add += parseInt(cpf.charAt(i)) * (11 - i);	
	rev = 11 - (add % 11);	
	if (rev == 10 || rev == 11)	
		rev = 0;	
	if (rev != parseInt(cpf.charAt(10)))
		return false;		
	return true;   
}

export function validarPlaca(placa){
  var resposta = false;

  const regexPlaca = /^[a-zA-Z]{3}[0-9]{4}$/;
  const regexPlacaMercosulCarro = /^[a-zA-Z]{3}[0-9]{1}[a-zA-Z]{1}[0-9]{2}$/;
  const regexPlacaMercosulMoto = /^[a-zA-Z]{3}[0-9]{2}[a-zA-Z]{1}[0-9]{1}$/;

  if(regexPlaca.test(placa)){
    resposta = true;
  }

  if(regexPlacaMercosulCarro.test(placa)){
    resposta = true;
  }

  if(regexPlacaMercosulMoto.test(placa)){
    resposta = true;
  }

  return resposta;
}

export function validarCelular(phone) {
  var regex = /(\(\d{2}\)\s)(\d{5}\-\d{4})/g;
  return regex.test(phone);
}

export function validarData(data) {
  const regex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
  
  return regex.test(data);
}