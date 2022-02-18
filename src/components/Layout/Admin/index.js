import React, { Fragment, useEffect, useState } from 'react';
import Head from 'next/head';
import Router from 'next/router';

import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';

import useAuth from '../../../hooks/useAuth';

import useForm from '../../CreditCard/useForm';

import SideBar from './sideBar';
import Header from './header';
import Content from './content';

import firebase from '../../../auth/AuthConfig'

import {
  Result,
  Button,
  Spin
} from 'antd';

import { LoadingOutlined } from '@ant-design/icons';

import {
  FaRegUser,
  FaRegCreditCard,
  FaRegCalendarAlt,
  FaCodepen,
  FaSignOutAlt
} from 'react-icons/fa';

import {
  DivBoxPayment
} from './styled';

import Footer from './footer';

import { maskPhone } from '../../../hooks/mask';

const LayoutAdmin = ({ children, title }) => {
  const { user, setUser, corretora, signOut, loading, collapsedSideBar, logged, initial, businessInfo } = useAuth();

  const { handleChange, handleFocus, handleSubmit, values, errors } = useForm();

  const [maxLenghtNumberCard, setMaxLenghtNumberCard] = useState(16);
  const [maxCVV, setMaxCVV] = useState(3);

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentTransaction, setPaymentTransaction] = useState(false);

  useEffect(() => {
    if(!loading && !initial) {
      if(!logged) {
        if(!user) {
          Router.push('/painel/login');
        }
      }
    }
  }, [loading, user, logged, initial]);

  const pagarMensalidade = async (e, tipoPagamento) => {
    setLoadingPayment(true);

    const pagamento = await handleSubmit(e, {
      typePayment: tipoPagamento,
      name: values.name,
      number: values.number,
      expiration: values.expiration,
      email: user.email,
      nome: user.nome,
      cpf: user.cpf,
      phone: user.telefone,
    }).then((response) => {
      return response;
    });

    if(!pagamento) {
      
    }else if(pagamento.status === 'paid') {
      setPaymentTransaction(true);

      await firebase.firestore().collection('assinaturas').doc(pagamento.id.toString()).set(pagamento);
      await firebase.firestore().collection('transacoes').doc(pagamento.current_transaction.id.toString()).set(pagamento.current_transaction);
      
      setTimeout(() => {
        setUser(response => ({
          ...response,
          idCustomer: pagamento.customer.id,
          card: pagamento.card,
          assinatura: {
            id: pagamento.id,
            plano: {
              id: pagamento.plan.id,
            },
            status: pagamento.status,
            metodo_pagamento: pagamento.payment_method
          },
          status: pagamento.status
        }));

        setPaymentTransaction(false);
      }, 5000);
    }
    setLoadingPayment(false);
  }

  if(paymentTransaction) {
    return (
      <DivBoxPayment>
        <Head>
          <title>PAGAMENTO CONFIRMADO</title>
        </Head>
        <div className='checkout' style={{ display: 'flex' }}>
          <div className='order' style={{ width: '100%' }}> 
            <Result
              style={{
                marginTop: 100,
              }}
              status="success"
              title={
                <h2 style={{ color: '#333', fontWeight: 'bold', textAlign: 'center' }}>
                  PAGAMENTO CONCLUÍDO COM SUCESSO
                </h2>
              }
              subTitle={
                <h3 style={{ color: '#333', textAlign: 'center' }}>
                  SEU PAGAMENTO FOI EFETUADO COM SUCESSO, VOCÊ ESTÁ SENDO REDIRECIONADO PARA SUA PÁGINA DE GESTÃO
                </h3>
              }
            />
            <center>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 50, color: '#52c41a' }} spin />} />
            </center>
          </div>
        </div>
      </DivBoxPayment>
    )
  }

  if(user){
    if(user.status === 'initial' || user.status === 'unpad') {
      return (
        <DivBoxPayment>
          <Head>
            <title>PAGAMENTO DA MENSALIDADE {user.status === 'unpad' && '- ATRASADA'}</title>
          </Head>
          <div className='checkout'>
            <div className='order'>
              <h2 style={{color: '#444'}}>INFORMAÇÕES</h2>
              <div className='info'>
                <h3><b>CORRETOR:</b> <br/> {user.displayName.toUpperCase()}</h3>
                <br/>
                <h3><b>CORRETORA:</b> <br/> {corretora.razao_social.toUpperCase()}</h3>
                <br/>
                <h3><b>TELEFONE:</b> <br/> {maskPhone(corretora.telefone)}</h3>
              </div>
              <br/>
              <p style={{color: '#6d819c', fontSize: 15, fontWeight: '500', textTransform: 'uppercase'}}>
                A utilização de sistema de gestão de seguros é fundamental para que o corretor consiga otimizar seu tempo e focar nas vendas.
              </p>
              <br/>
              <h5 className='total'>Custo mensal</h5>
              <h1>R$ 50,00</h1>
            </div>
            <h2 style={{color: '#444'}}>PAGAMENTO {user.status === 'unpad' && '- ATRASADO'}</h2>
            <div id='payment' className='payment'>
              <div className='card'>
                <Cards
                  cvc={values.cvv}
                  expiry={values.expiration}
                  focused={values.focus}
                  name={values.name}
                  number={values.number}
                  callback={(e) => {
                    if(e.issuer === 'amex') {
                      setMaxCVV(4);
                    }else {
                      setMaxCVV(3);
                    }
                    setMaxLenghtNumberCard(e.maxLength);
                  }}
                />
              </div>
              <div className='card-form'>
                <p className={'field '+((errors && !errors.cname) && 'error')}>
                  <FaRegUser size={25} color='#dddfe6' />
                  <input
                    autoComplete='off'
                    id='namecard'
                    name='name'
                    type='text'
                    value={values.name}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase().replace(/[0-9!@#¨$%^&*)(+=._-]+/g, "");
                      handleChange(e);
                    }}
                    onFocus={handleFocus}
                    placeholder='NOME NO CARTÃO'
                    pattern='\d*'
                    title='Nome do Titular'
                  />
                </p>
                <p className={'field '+((errors && !errors.cnumber) && 'error')}>
                  <FaRegCreditCard size={25} color='#dddfe6' />
                  <input
                    autoComplete='off'
                    id='cardnumber'
                    name='number'
                    type='tel'
                    value={values.number}
                    maxLength={maxLenghtNumberCard}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "").replace(/(\d{4})(\d)/, '$1 $2').replace(/(\d{4})(\d)/, '$1 $2').replace(/(\d{4})(\d)/, '$1 $2');

                      handleChange(e);
                    }}
                    onFocus={handleFocus}
                    placeholder='•••• •••• •••• ••••'
                    pattern="{{9999}} {{9999}} {{9999}} {{9999}}"
                    title='Número do Cartão'
                  />
                </p>
                <p className={'field space '+((errors && !errors.cexp) && 'error')}>
                  <FaRegCalendarAlt size={25} color='#dddfe6' />
                  <input
                    autoComplete='off'
                    type='tel'
                    id='cardexpiration'
                    name='expiration'
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "").replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1');
                      
                      handleChange(e);
                    }}
                    onFocus={handleFocus}
                    placeholder="MM / YYYY"
                    pattern="\d*"
                    title='Validate'
                  />
                </p>
                <p className={'field space '+((errors && !errors.ccvv) && 'error')}>
                  <FaCodepen size={25} color='#dddfe6' />
                  <input
                    autoComplete='off'
                    type='tel'
                    id='cardcvv'
                    name='cvv'
                    maxLength={maxCVV}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "").replace(/(\d{4})(\d)/);
                      
                      handleChange(e);
                    }}
                    onFocus={handleFocus}
                    placeholder="CVV"
                    pattern="\d*"
                    title='CVV'
                  />
                </p>
                {loadingPayment ? (
                  <Button style={{backgroundColor: '#ffa500', borderColor: '#333'}} disabled={true} className={'button-cta disabled'} title='AGUARDE O RETORNO'>
                    <span>PROCESSANDO...</span>
                  </Button>
                ) : (
                  <Button disabled={loadingPayment || !values.name.split(' ')[1] || values.number.length < maxLenghtNumberCard || values.expiration.length < 5 || values.cvv.length < 3} style={{cursor: 'pointer'}} onClick={(e) => pagarMensalidade(e, 'credit_card')} className={'button-cta '+((!values.name.split(' ')[1] || values.number.length < maxLenghtNumberCard || values.expiration.length < 5 || values.cvv.length < 3) && 'disabled')} title='Confirmar mensalidade'>
                    <span>PAGAR MENSALIDADE</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className='logout' onClick={signOut} style={{position: 'relative'}}>
            <div style={{cursor: 'pointer', flexDirection: 'row', display: 'flex', alignSelf: 'center', alignItems: 'center'}}>
              <FaSignOutAlt color='white' />
              <h3 style={{color: 'white'}}>DESLOGAR</h3>
            </div>
          </div>
        </DivBoxPayment>
      )
    }else if(user.status === 'wait_payment') {
      return (
        <>AGUARDANDO PAGAMENTO</>
      )
    }

    return (
      <Fragment>
        <Head>
          <title>
            {title} - {businessInfo.displayName}
          </title>
        </Head>
        <Header collapsed={collapsedSideBar} />
        <SideBar responsive={true} collapsed={collapsedSideBar} />
        <Content sidebar={false} collapsed={collapsedSideBar} >
          {children}
        </Content>
        <Footer />
        <br/>
        <br/>
        <br/>
        <br/>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Head>
        <title>CARREGANDO...</title>
      </Head>
    </Fragment>
  );
}

export default LayoutAdmin;

export const CardComponent = ({children}) => {
  return (
    <div
      style={{
        boxShadow: '1px 1px 10px #D1D1D1',
        border: '1px solid #D1D1D1',
        margin: 0,
        backgroundColor: '#FFFFFF',
      }}
    >
      {children}
    </div>
  )
};