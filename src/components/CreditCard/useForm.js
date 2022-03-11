import { useState } from 'react';
import valid from 'card-validator';
import pagarme from 'pagarme';

import {
  notification
} from 'antd';
import { PAGARME_KEY } from '../../config';

const validateInfo = (values) => {
  let errors = {};

  let creditCard = valid.number(values.number);

  creditCard.expirationDate = valid.expirationDate(values.expiration);
  creditCard.cardHolderName = valid.cardholderName(values.name);
  creditCard.cvv = valid.cvv(values.cvv);

  errors.show = true;
  errors.variant = '';
  errors.message = '';
  errors.cname = '';
  errors.cnumber = '';
  errors.cexp = '';
  errors.ccvv = false;

  if(values.cvv === null || !values.cvv.trim()) {
    errors.message = 'CVV não preenchido.'
  }else if(creditCard.cvv.isValid) {
    errors.ccvv = true;
  }else {
    errors.message = 'CVV inválido.'
  }

  if(values.expiration === null || !values.expiration.trim()) {
    errors.message = 'Válidade não preenchida.'
  }else if(creditCard.expirationDate.isValid) {
    errors.cexp = true;
  }else {
    errors.message = 'Válidade inválida.'
  }

  if(values.number === null || !values.number.trim()) {
    errors.message = 'Número não preenchida.'
  }else if(creditCard.isValid) {
    errors.cnumber = true;
  }else {
    errors.message = 'Número inválido.'
  }

  if(values.name === null || !values.name.trim()) {
    errors.message = 'Nome não preenchida.'
  }else if(creditCard.cardHolderName.isValid) {
    errors.cname = true;
  }else {
    errors.message = 'Nome inválido.'
  }

  if(errors.cname && errors.cnumber && errors.ccvv && errors.cexp) {
    errors.variant = 'success';
    errors.message = 'Cartão de Crédito válido.'
  }

  return errors;
}

const useForm = () => {
  const [values, setValues] = useState({
    name: '',
    number: '',
    expiration: '',
    cvv: '',
    focus: ''
  });

  const [errors, setErrors] = useState();

  const handleFocus = e => {
    const { name } = e.target;

    setValues({
      ...values,
      focus: name
    });
  }

  const handleChange = e => {
    const { name, value } = e.target;

    setValues({
      ...values,
      [name]: value
    });
  }

  const handleSubmit = async (r, e) => {
    r.preventDefault();

    const response = validateInfo(values);

    setErrors(response);

    if(response.variant !== 'success') {
      notification.error({
        message: response.message,
      });

      setTimeout(() => {
        setErrors(null);
      }, 5000);

      return false;
    }


    if(e.typePayment === 'boleto') {
      
    }else {
      const telefone = String(e.phone);

      const ddd = telefone.slice(1, 3);
      const phone = telefone.split('-').join('').split(' ').join('').split(')').join('').slice(3, telefone.length);

      try {
        const pagamento = await pagarme.client.connect({ api_key: PAGARME_KEY })
        .then(client => client.subscriptions.create({
          plan_id: '611793',
          card_holder_name: e.name,
          card_number: e.number,
          card_expiration_date: String(e.expiration).split('/').join(''),
          card_cvv: e.cvv,
          payment_method: e.typePayment,
          soft_descriptor: 'PG. APPSYSTEM',
          customer: {
            email: e.email,
            name: e.nome,
            document_number: e.cpf,
            address: {
              zipcode: '04571020',
              neighborhood: 'Bairro nomedobairro',
              street: 'Rua nomedarua',
              street_number: '000'
          },
            phone: {
              number: phone,
              ddd: ddd
            }
          },
          postback_url: 'https://seguro.appsystembrasil.com.br/api/postback/plano'
        }))
        .then(subscription => {
          return subscription;
        });

        return pagamento;
      }catch(error) {
        error.response.errors.forEach((element) => {
          notification.error({
            message: element.message
          })
        })

        return false;
      } 
    }
  }

  return {
    handleChange,
    handleFocus,
    handleSubmit,
    values,
    errors,
  }
}

export default useForm;