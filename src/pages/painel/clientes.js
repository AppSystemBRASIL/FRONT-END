import React, { useState, useEffect } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Input, Modal, DatePicker, Select, notification, Divider, InputNumber, Switch } from 'antd';

import TableClientes from '../../components/Table/Clientes';

import { maskCEP, maskCPF, maskDate, maskMoney, maskOnlyLetters, maskOnlyNumbers, maskPhone, maskPlaca, maskYear } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';
import { FaPlus, FaTimes } from 'react-icons/fa';

import firebase from '../../auth/AuthConfig';

import axios from 'axios';

import { useTheme } from 'styled-components';

import banco from '../../data/bancos';

const Seguro = () => {
  const { user, corretora, setCollapsedSideBar, businessInfo } = useAuth();

  if(!businessInfo) {
    return <></>;
  }

  const theme = useTheme();

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
  }, []);

  const [seguradora, setSeguradora] = useState(null);
  const [corretor, setCorretor] = useState(null);

  const [viewNewSeguro, setViewNewSeguro] = useState(false);

  const [seguros, setSeguros] = useState([]);

  const [dataNewSeguro, setDataNewSeguro] = useState({
    uid: null,
    cpf: null,
    telefone: null,
    nome: null,
    email: null,
    comissao: 100 - businessInfo.comissao.percentual,
    banco: null,
    agencia: null,
    agencia_d: null,
    conta: null,
    conta_d: null,
    pix: null,
    status: true
  });

  useEffect(() => {
    if(!viewNewSeguro) {
      setDataNewSeguro({
        uid: null,
        cpf: null,
        telefone: null,
        nome: null,
        email: null,
        comissao: 100 - businessInfo.comissao.percentual,
        banco: null,
        agencia: null,
        agencia_d: null,
        conta: null,
        conta_d: null,
        pix: null,
        status: true
      })
    }
  }, [viewNewSeguro]);

  const salvarSeguro = async () => {
    if(!dataNewSeguro.nome || !dataNewSeguro.cpf || !dataNewSeguro.telefone || !dataNewSeguro.comissao) {
      notification.error({
        message: 'PREENCHA OS DADOS OBRIGATÓRIOS'
      });

      return;
    }

    await firebase.firestore().collection('usuarios').doc(String(dataNewSeguro.cpf).split('.').join('').split('-').join('')).set({
      uid: String(dataNewSeguro.cpf).split('.').join('').split('-').join(''),
      corretora: {
        uid: corretora.uid,
        verified: true,
      },
      cpf: dataNewSeguro.cpf,
      displayName: dataNewSeguro.nome,
      email: dataNewSeguro.email,
      emailVerified: false,
      nomeCompleto: dataNewSeguro.nome,
      status: 'paid',
      telefone: dataNewSeguro.telefone,
      tipo: 'corretor',
      created: new Date(),
      comissao: dataNewSeguro.comissao,
      dadosBancarios: {
        banco: dataNewSeguro.banco || null,
        agencia: dataNewSeguro.agencia || null,
        agencia_d: dataNewSeguro.agencia_d || null,
        conta: dataNewSeguro.conta || null,
        conta_d: dataNewSeguro.conta_d || null,
        pix: dataNewSeguro.pix || null
      },
      status: dataNewSeguro.status
    }, { merge: true })
    .then(() => {
      setViewNewSeguro(false);
    });
  }

  if(!user && !corretora) {
    return <></>;
  }

  if(!user) {
    return <></>;
  }

  return (
    <LayoutAdmin title='CLIENTES'>
      <CardComponent>
        <Row
          style={{
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
            position: 'relative'
          }}
        >
          <Col span={24}>
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444', textAlign: 'center'}}>CLIENTES</h1>
          </Col>
        </Row>
        <TableClientes
          seguradora={seguradora}
          corretor={corretor}
          user={user}
          infiniteData={true}
          corretora={corretora.uid}
          setSeguros={setSeguros}
          seguros={seguros}
          setView={setViewNewSeguro}
          setData={setDataNewSeguro}
          businessInfo={businessInfo}
        />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Seguro;