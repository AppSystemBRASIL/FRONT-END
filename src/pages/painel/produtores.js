import React, { useState, useEffect } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Input, Modal, DatePicker, Select, notification, Divider, InputNumber, Switch } from 'antd';

import TableCorretores from '../../components/Table/Corretores';

import { maskCEP, maskCPF, maskDate, maskMoney, maskOnlyLetters, maskOnlyNumbers, maskPhone, maskPlaca, maskYear } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';
import { FaPlus, FaTimes } from 'react-icons/fa';

import firebase from '../../auth/AuthConfig';

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
    conta_o: null,
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
        conta_o: null,
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
        conta_o: dataNewSeguro.conta_o || null,
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
    <LayoutAdmin title='PRODUTORES'>
      <CardComponent>
        <Modal onOk={salvarSeguro} title={(
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>NOVO PRODUTOR</span>
            <div style={{ gap: 10, display: 'flex' }}>
              <labe>status:</labe>
              <Switch checked={dataNewSeguro.status} onChange={value => setDataNewSeguro(e => ({ ...e, status: value }))} checkedChildren='ativo' unCheckedChildren='desativo' style={{ marginRight: 20, background: dataNewSeguro.status && theme.colors[businessInfo.layout.theme].primary }} />
            </div>
          </div>
        )} cancelText='FECHAR' okText='SALVAR' onCancel={() => setViewNewSeguro(false)} visible={viewNewSeguro} closable={() => setViewNewSeguro(false)} style={{ top: 10 }} width='50%' cancelButtonProps={{ style: { border: '1px solid black', outline: 'none', color: 'black' } }} okButtonProps={{ style: { background: theme.colors[businessInfo.layout.theme].primary, border: 'none' }}}>
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
              <Input type='tel' disabled={dataNewSeguro.uid} placeholder='000.000.000-00' value={dataNewSeguro.cpf} onChange={value => setDataNewSeguro(e => ({...e, cpf: maskCPF(value.target.value)}))} />
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
              <InputNumber decimalSeparator=',' value={dataNewSeguro.comissao} placeholder='0' style={{ width: '100%' }} max={100} min={0}
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
                <Input value={dataNewSeguro.agencia} style={{ width: '60%' }} placeholder='AGÊNCIA' onChange={value => setDataNewSeguro(e => ({...e, agencia: value.target.value}))} />
                <Input value={dataNewSeguro.agencia_d} style={{ width: '40%' }} placeholder='DIGÍTO' onChange={value => setDataNewSeguro(e => ({...e, agencia_d: value.target.value}))} />
              </Input.Group>
            </Col>
            <Col span={8}>
              <label>CONTA:</label>
              <Input.Group compact>
                <Input value={dataNewSeguro.conta} style={{ width: '50%' }} placeholder='CONTA' onChange={value => setDataNewSeguro(e => ({...e, conta: value.target.value}))} />
                <Input value={dataNewSeguro.conta_d} style={{ width: '25%' }} placeholder='DIGÍTO' onChange={value => setDataNewSeguro(e => ({...e, conta_d: value.target.value}))} />
                <Input value={dataNewSeguro.conta_o} style={{ width: '25%' }} placeholder='OPERAÇÃO' onChange={value => setDataNewSeguro(e => ({...e, conta_o: value.target.value}))} />
              </Input.Group>
            </Col>
            <Col span={24}>
              <label>PIX:</label>
              <Input value={dataNewSeguro.pix} placeholder='PREENCHA COM O PIX PARA RECEBIMENTO' onChange={value => setDataNewSeguro(e => ({...e, pix: value.target.value}))} />
            </Col>
          </Row>
          {dataNewSeguro.uid && (
            <>
              <br/>
              <Row>
                <Col span={24}>
                  <span style={{
                    cursor: 'pointer',
                    color: 'red'
                  }}
                    onClick={() => {
                      Modal.confirm({
                        title: 'DESEJA REALMENTE EXCLUIR O PRODUTOR?',
                        content: 'Ao excluir o produtor, essa opção não poderá ser revertida.',
                        okText: 'EXCLUIR',
                        cancelText: 'CANCELAR',
                        okButtonProps: {
                          style: {
                            background: theme.colors[businessInfo.layout.theme].primary,
                            color: '#FFFFFF',
                            border: 'none',
                            outline: 'none'
                          }
                        },
                        onOk: async () => {
                          await firebase.firestore().collection('usuarios').doc(String(dataNewSeguro.uid)).delete()
                          .then(() => {
                            setViewNewSeguro(false);
                          });
                        } 
                      })
                    }}
                  ><u>Deseja excluir o produtor?</u></span>
                </Col>
              </Row>
            </>
          )}
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
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444', textAlign: 'center'}}>PRODUTORES <sup><FaPlus style={{ cursor: 'pointer' }} onClick={() => setViewNewSeguro(true)} /></sup></h1>
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
          setView={setViewNewSeguro}
          setData={setDataNewSeguro}
          businessInfo={businessInfo}
        />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Seguro;