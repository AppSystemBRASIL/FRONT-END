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
    cpf: null,
    telefone: null,
    nome: null,
    email: null,
    bairro: null,
    cidade: null,
    estado: null,
    cep: null,
    comissao: 100 - businessInfo.comissao.percentual,
    banco: null,
    agencia: null,
    agencia_d: null,
    conta: null,
    conta_d: null,
    pix: null
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
      comissao: 100 - businessInfo.comissao.percentual,
      banco: null,
      agencia: null,
      agencia_d: null,
      conta: null,
      conta_d: null,
      pix: null
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
    if(!dataNewSeguro.nome || !dataNewSeguro.cpf || !dataNewSeguro.telefone || !dataNewSeguro.comissao) {
      notification.error({
        message: 'PREENCHA OS DADOS OBRIGATÓRIOS'
      });

      return;
    }

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
      comissao: dataNewSeguro.parcelas || [],
      dadosBancarios: {
        banco: dataNewSeguro.banco || null,
        agencia: dataNewSeguro.agencia || null,
        agencia_d: dataNewSeguro.agencia_d || null,
        conta: dataNewSeguro.conta || null,
        conta_d: dataNewSeguro.conta_d || null,
        pix: dataNewSeguro.pix || null
      }
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
          <Row>
            <Col span={24}>
              <h3>DADOS PESSOAIS:</h3>
            </Col>
          </Row>
          <Row gutter={[10, 20]}>
            <Col span={8}>
              <label>NOME: <sup style={{ color: 'red' }}>*</sup></label>
              <Input type='text' placeholder='NOME COMPLETO' value={dataNewSeguro.nome} onChange={value => setDataNewSeguro(e => ({...e, nome: maskOnlyLetters(value.target.value.toUpperCase())}))} />
            </Col>
            <Col span={8}>
              <label>CPF: <sup style={{ color: 'red' }}>*</sup></label>
              <Input type='tel' placeholder='000.000.000-00' value={dataNewSeguro.cpf} onChange={value => setDataNewSeguro(e => ({...e, cpf: maskCPF(value.target.value)}))} />
            </Col>
            <Col span={8}>
              <label>CELULAR: <sup style={{ color: 'red' }}>*</sup></label>
              <Input type='tel' placeholder='(00) 00000-0000' value={dataNewSeguro.telefone} onChange={value => setDataNewSeguro(e => ({...e, telefone: maskPhone(value.target.value)}))} />
            </Col>
            <Col span={24}>
              <label>EMAIL:</label>
              <Input type='email' placeholder='EXEMPLO@HOSPEDAGEM.COM' value={dataNewSeguro.email} onChange={value => setDataNewSeguro(e => ({...e, email: value.target.value.toUpperCase()}))} />
            </Col>
          </Row>
          <br/>
          <Row>
            <Col span={24}>
              <h3>COMISSAO: <sup style={{ color: 'red' }}>*</sup></h3>
            </Col>
          </Row>
          <Row gutter={[10, 20]}>
            <Col>
              <InputNumber value={dataNewSeguro.comissao} placeholder='0' style={{ width: '100%' }} max={100} min={0}
                onChange={value => setDataNewSeguro(e => ({ ...e, comissao: value ? value : 0 }))}
              />
            </Col>
          </Row>
          <br/>
          <Row>
            <Col span={24}>
              <h3>DADOS BANCÁRIOS:</h3>
            </Col>
          </Row>
          <Row gutter={[10, 20]}>
            <Col span={8}>
              <label>BANCO:</label>
              <Select style={{ width: '100%' }}
                showSearch
                placeholder='SELECIONAR BANCO'
                optionFilterProp='children'
                onChange={value => setDataNewSeguro(e => ({...e, banco: String(value)}))}
                value={dataNewSeguro.banco}
              >
                {banco.map((item, index) => (
                  <Select.Option key={index} value={String(item.value)}>
                    {item.value} - {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <label>AGÊNCIA:</label>
              <Input.Group compact>
                <Input value={dataNewSeguro.agencia} style={{ width: '80%' }} placeholder='AGÊNCIA' onChange={value => setDataNewSeguro(e => ({...e, agencia: value}))} />
                <Input value={dataNewSeguro.agencia_d} style={{ width: '20%' }} placeholder='D' onChange={value => setDataNewSeguro(e => ({...e, agencia_d: value}))} />
              </Input.Group>
            </Col>
            <Col span={8}>
              <label>CONTA:</label>
              <Input.Group compact>
                <Input value={dataNewSeguro.conta} style={{ width: '80%' }} placeholder='CONTA' onChange={value => setDataNewSeguro(e => ({...e, conta: value}))} />
                <Input value={dataNewSeguro.conta_d} style={{ width: '20%' }} placeholder='D' onChange={value => setDataNewSeguro(e => ({...e, conta_d: value}))} />
              </Input.Group>
            </Col>
            <Col span={24}>
              <label>PIX:</label>
              <Input value={dataNewSeguro.pix} placeholder='PREENCHA COM O PIX PARA RECEBIMENTO' onChange={value => setDataNewSeguro(e => ({...e, pix: value}))} />
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