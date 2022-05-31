import React, { useState, useEffect } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Input, Modal, DatePicker, Select, notification, Divider, InputNumber } from 'antd';

import TableCorretores from '../../components/Table/Corretores';

import { maskCEP, maskCPF, maskDate, maskMoney, maskOnlyLetters, maskOnlyNumbers, maskPhone, maskPlaca, maskYear } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';
import { FaPlus, FaTimes } from 'react-icons/fa';

import firebase from '../../auth/AuthConfig';

import axios from 'axios';

import { useTheme } from 'styled-components';

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
    cpf: null,
    telefone: null,
    nome: null,
    email: null,
    bairro: null,
    cidade: null,
    estado: null,
    cep: null,
    comissao: 100 - businessInfo.comissao.percentual
  });

  useEffect(() => {
    setDataNewSeguro({
      cpf: null,
      telefone: null,
      nome: null,
      email: null,
      bairro: null,
      cidade: null,
      estado: null,
      cep: null,
      comissao: 100 - businessInfo.comissao.percentual
    })
  }, [viewNewSeguro]);

  useEffect(() => {
    if(String(dataNewSeguro.cep).length === 9) {
      axios.get(`https://viacep.com.br/ws/${String(dataNewSeguro.cep).split('-').join('')}/json`, {
        headers: {
          'content-type': 'application/json;charset=utf-8',
        },
      })
      .then((response) => {
        const data = response.data;

        setDataNewSeguro(e => ({...e, bairro: data.bairro, cidade: data.localidade, estado: data.uf}))
      })
      .catch((error) => {
        console.log(error);
      })
    }
  }, [dataNewSeguro.cep]);

  const salvarSeguro = async () => {
    await firebase.firestore().collection('usuarios').add({
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
      comissao: dataNewSeguro.parcelas || []
    })
    .then((response) => {
      firebase.firestore().collection('usuarios').doc(response.id).set({ uid: response.id }, { merge: true });
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
    <LayoutAdmin title='PRODUTORES'>
      <CardComponent>
        <Modal onOk={salvarSeguro} title='NOVO PRODUTOR' cancelText='FECHAR' okText='SALVAR' onCancel={() => setViewNewSeguro(false)} visible={viewNewSeguro} closable={() => setViewNewSeguro(false)} style={{ top: 10 }} width='50%' cancelButtonProps={{ style: { border: '1px solid black', outline: 'none', color: 'black' } }} okButtonProps={{ style: { background: theme.colors[businessInfo.layout.theme].primary, border: 'none' }}}>
          <Row gutter={[10, 20]}>
            <Col span={8}>
              <label>NOME:</label>
              <Input type='text' placeholder='NOME COMPLETO' value={dataNewSeguro.nome} onChange={value => setDataNewSeguro(e => ({...e, nome: maskOnlyLetters(value.target.value.toUpperCase())}))} />
            </Col>
            <Col span={8}>
              <label>CPF:</label>
              <Input type='tel' placeholder='000.000.000-00' value={dataNewSeguro.cpf} onChange={value => setDataNewSeguro(e => ({...e, cpf: maskCPF(value.target.value)}))} />
            </Col>
            <Col span={8}>
              <label>CELULAR:</label>
              <Input type='tel' placeholder='(00) 00000-0000' value={dataNewSeguro.telefone} onChange={value => setDataNewSeguro(e => ({...e, telefone: maskPhone(value.target.value)}))} />
            </Col>
            <Col span={24}>
              <label>EMAIL:</label>
              <Input type='email' placeholder='EXEMPLO@HOSPEDAGEM.COM' value={dataNewSeguro.email} onChange={value => setDataNewSeguro(e => ({...e, email: value.target.value.toUpperCase()}))} />
            </Col>
          </Row>
          <br/>
          <Row gutter={[10, 0]}>
            <Col span={24}>
              <h3>COMISSAO:</h3>
            </Col>
            <Col>
              <InputNumber value={dataNewSeguro.comissao} style={{ width: '100%' }} max={100} min={0}
                onChange={value => setDataNewSeguro(e => ({ ...e, comissao: value }))}
              />
            </Col>
          </Row>
        </Modal>
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
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444', textAlign: 'center'}}>CORRETORES <sup><FaPlus style={{ cursor: 'pointer' }} onClick={() => setViewNewSeguro(true)} /></sup></h1>
          </Col>
        </Row>
        <TableCorretores
          seguradora={seguradora}
          corretor={corretor}
          user={user}
          infiniteData={true}
          corretora={corretora.uid}
          setSeguros={setSeguros}
          seguros={seguros}
          setViewNewSeguro={setViewNewSeguro}
          setDataNewSeguro={setDataNewSeguro}
          businessInfo={businessInfo}
        />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Seguro;