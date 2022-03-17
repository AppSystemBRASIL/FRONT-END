import React, { useState, useEffect } from 'react';
import Head from 'next/head';

import LayoutAdmin from '../../components/Layout/Admin';
import { Content } from 'antd/lib/layout/layout';
import { Row, Col, Image, Input, Divider } from 'antd';

import firebase from '../../auth/AuthConfig';
import useAuth from '../../hooks/useAuth';

import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';

const Perfil = () => {
  const { loading, user, corretora, businessInfo } = useAuth();

  const CardComponent = ({children}) => {
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
  }

  if(!user) {
    return (
      <>

      </>
    );
  } 

  return (
    <LayoutAdmin>
      <Head>
        <title>PERFIL - {businessInfo ? businessInfo.razao_social : 'SEGURO APPSYSTEM-BRAISL'}</title>
      </Head>
      <Content>
        <Row gutter={[16, 20]}>
          <Col span={24}>
            <CardComponent>
              <Row
                style={{
                  display: 'flex', 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: 10,
                }}
              >
                <Col span={24}>
                  <center>
                    <h1 style={{textAlign: 'center', margin: 0, padding: 0, fontWeight: '700', color: '#444'}}>
                      MEU PERFIL
                    </h1>
                  </center>
                </Col>
              </Row>
              <Divider style={{margin: 0, padding: 0}} />
              <Row
                gutter={[20, 20]}
                style={{
                  padding: 20
                }}
              >
                <Col span={3}>
                  <Image preview='false' src='https://i1.wp.com/terracoeconomico.com.br/wp-content/uploads/2019/01/default-user-image.png?ssl=1' alt='usuário' />
                  <center>
                    <label>{user.displayName}</label>
                  </center>
                </Col>
                <Col span={7}>
                  <label>NOME COMPLETO:</label>
                  <Input type='text' value={user.nomeCompleto} readOnly />
                  <br />
                  <label>CPF:</label>
                  <Input type='text' value={user.cpf} readOnly />
                </Col>
                <Col span={7}>
                  <label>EMAIL:</label>
                  <Input type='text' value={user.email} readOnly />
                  <br />
                  <label>CELULAR:</label>
                  <Input type='text' value={user.telefone} readOnly />
                </Col>
                <Col span={7}>
                  <label>NOME COMPLETO:</label>
                  <Input type='text' value={user.nomeCompleto} readOnly />
                </Col>
              </Row>
              <Divider style={{margin: 0, padding: 0}} />
              <Row
                style={{
                  display: 'flex', 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: 10,
                }}
              >
                <Col span={24}>
                  <center>
                    <h1 style={{textAlign: 'center', margin: 0, padding: 0, fontWeight: '700', color: '#444'}}>
                      MINHA CORRETORA
                    </h1>
                  </center>
                </Col>
              </Row>
              <Divider style={{margin: 0, padding: 0}} />
              <Row
                gutter={[20, 20]}
                style={{
                  padding: 20
                }}
              >
                <Col span={3}>
                  <Image preview='false' src={corretora.icon} alt='corretora' />
                  <center>
                    <label>{corretora.razao_social}</label>
                  </center>
                </Col>
                <Col span={7}>
                  <label>RAZÃO SOCIAL:</label>
                  <Input type='text' value={corretora.razao_social} readOnly />
                  <br />
                  <label>CELULAR:</label>
                  <Input type='text' value={corretora.telefone} readOnly />
                </Col>
                <Col span={7}>
                  <label>EMAIL:</label>
                  <Input type='text' value={corretora.email} readOnly />
                </Col>
                <Col span={7}>
                  <label>SITE:</label>
                  <Input type='text' value={corretora.site} readOnly />
                </Col>
              </Row>
              <Divider style={{margin: 0, padding: 0}} />
              <Row
                style={{
                  display: 'flex', 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: 10,
                }}
              >
                <Col span={24}>
                  <center>
                    <h1 style={{textAlign: 'center', margin: 0, padding: 0, fontWeight: '700', color: '#444'}}>
                      MINHA ASSINATURA
                    </h1>
                  </center>
                </Col>
              </Row>
              <Divider style={{margin: 0, padding: 0}} />
              <Row
                gutter={[20, 20]}
                style={{
                  padding: 20
                }}
              >
                <Col span={7}>
                  <Cards
                    expiry={user.card.expiration_date}
                    name={user.card.holder_name}
                    number={`${String(user.card.first_digits).slice(0, 4)}••••••••${user.card.last_digits}`}
                  />
                </Col>
                <Col span={8}>
                  <label>FORMA DE PAGAMENTO:</label>
                  <Input type='text' value={'CARTÃO DE CRÉDITO'} readOnly />
                  <br />
                  <br />
                  <br />
                  <br />
                  <label>ASSINATURA:</label>
                  <Input type='text' value={user.assinatura.id} readOnly />
                </Col>
                <Col span={9}>
                  <label>STATUS DA ASSINATURA:</label>
                  <Input type='text' value={user.assinatura.status === 'paid' ? 'PAGO' : 'PENDENTE'} readOnly />
                  <br />
                  <br />
                  <br />
                  <br />
                  <label>PLANO:</label>
                  <Input type='text' value={user.assinatura.plano.id} readOnly />
                </Col>
              </Row>
            </CardComponent>
          </Col>
        </Row>
      </Content>
    </LayoutAdmin>
  );
}

export default Perfil;