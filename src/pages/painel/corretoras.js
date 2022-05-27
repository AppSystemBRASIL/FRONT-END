import React, { useState, useEffect } from 'react';
import firebase from '../../auth/AuthConfig';

import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Select, Input, Modal, Upload, Avatar, notification, Divider, InputNumber } from 'antd';

import {
  FileOutlined,
  PlusOutlined
} from '@ant-design/icons';

import TableCorretora from '../../components/Table/Corretora';

import { maskCNPJ, maskOnlyLetters, maskPhone } from '../../hooks/mask';
import generateToken from '../../hooks/generateToken';
import { statusPaymentText } from 'utils/statusPayment';

import useAuth from '../../hooks/useAuth';

const Corretora = () => {
  const { setCollapsedSideBar } = useAuth();

  const [cnpj, setCNPJ] = useState('');
  const [status, setStatus] = useState(null);

  const [modalNovaCorretora, setModalNovaCorretora] = useState(false);
  const [novaCorretora, setNovaCorretora] = useState({
    status: 'pending_payment',
    razao_social: null,
    cnpj: null,
    telefone: null,
    email: null,
    icon: null,
    logo: null,
    site: null,
    layout: {
      theme: null,
    },
    comissao: {
      percentual: 0,
      juros: 0
    }
  });
  const [loadingAddCorretora, setLoadingAddCorretora] = useState(false);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
    setWidth(window.screen.width);
  }, []);

  useEffect(() => {
    if(cnpj.length === 18) {
      setStatus(null);
    }
  }, [cnpj]);

  useEffect(() => {
    if(status !== null) {
      setCNPJ('');
    }
  }, [status]);

  useEffect(() => {
    setLoadingAddCorretora();
    setNovaCorretora({
      status: 'pending_payment',
      razao_social: null,
      telefone: null,
      email: null,
      icon: null,
      logo: null,
      site: null,
      layout: {
        theme: null,
      },
      comissao: {
        percentual: 0,
        juros: 0
      }
    })
  }, [modalNovaCorretora]);

  const adicionarCorretora = async () => {
    if(!novaCorretora.cnpj || !novaCorretora.razao_social || !novaCorretora.telefone || !novaCorretora.email || !novaCorretora.icon || !novaCorretora.logo || !novaCorretora.layout.theme || !novaCorretora.comissao.juros || !novaCorretora.comissao.percentual) {
      notification.warn({
        message: 'PREENCHA OS CAMPOS OBRIGATÓRIOS'
      })

      return;
    }

    setLoadingAddCorretora(true);

    const data = {
      ...novaCorretora,
      created: new Date(),
      uid: generateToken(),
      cnpj: String(novaCorretora.cnpj).split('.').join('').split('/').join('').split('-').join('')
    }

    await firebase
    .storage()
    .ref()
    .child(`corretora/${data.uid}/icon/${data.icon.name}`)
    .put(data.icon).then(async (snapshot) => {
      data.icon = await snapshot.ref.getDownloadURL();
    });

    await firebase
    .storage()
    .ref()
    .child(`corretora/${data.uid}/logo/${data.logo.name}`)
    .put(data.logo).then(async (snapshot) => {
      data.logo = await snapshot.ref.getDownloadURL();
    });

    delete data.iconBase;
    delete data.logoBase;

    await firebase.firestore().collection('corretoras').doc(data.uid).set(data, { merge: true })
    .then(() => {
      setModalNovaCorretora(false);
    });

    setLoadingAddCorretora(false);
  }

  return (
    <LayoutAdmin title='CORRETORAS'>
      <Modal style={{ top: 10 }} confirmLoading={loadingAddCorretora} title='ADICIONAR NOVA CORRETORA' visible={modalNovaCorretora} closable={() => setModalNovaCorretora(false)} onCancel={() => setModalNovaCorretora(false)} cancelText='FECHAR' okText='ADICIONAR' onOk={adicionarCorretora}>
        <Row gutter={[20, 10]}>
          <Col span={24}>
            <label>NOME FANTASIA: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <Input value={novaCorretora.razao_social} onChange={(e) => setNovaCorretora(response => ({...response, razao_social: maskOnlyLetters(String(e.target.value).toUpperCase())}))} />
          </Col>
          <Col span={12}>
            <label>CNPJ: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <Input value={novaCorretora.cnpj} onChange={(e) => setNovaCorretora(response => ({...response, cnpj: maskCNPJ(String(e.target.value))}))} />
          </Col>
          <Col span={12}>
            <label>TELEFONE: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <Input value={novaCorretora.telefone} onChange={(e) => setNovaCorretora(response => ({...response, telefone: maskPhone(String(e.target.value).toUpperCase())}))} />
          </Col>
          <Col span={24}>
            <label>EMAIL: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <Input value={novaCorretora.email} onChange={(e) => setNovaCorretora(response => ({...response, email: String(e.target.value).toUpperCase()}))} />
          </Col>
          <Col span={12}>
            <center>
              <label>ICON: <sup><span style={{ color: 'red' }}>*</span></sup></label>
              <br/>
              <Upload
                showUploadList={false}
                onChange={(e) => {
                  const reader = new FileReader();
                  reader.readAsDataURL(e.file.originFileObj)
                  reader.onload = () => {
                    setNovaCorretora(response => ({
                      ...response,
                      icon: e.file.originFileObj,
                      iconBase: reader.result
                    }));
                  } 
                }}
              >
                <Avatar className='imageCenterAvatar' src={novaCorretora.iconBase} style={{ cursor: 'pointer' }} shape='square' size={150} icon={<FileOutlined />} />
              </Upload>
            </center>
          </Col>
          <Col span={12}>
            <center>
              <label>LOGO: <sup><span style={{ color: 'red' }}>*</span></sup></label>
              <br/>
              <Upload
                showUploadList={false}
                onChange={(e) => {
                  const reader = new FileReader();
                  reader.readAsDataURL(e.file.originFileObj)
                  reader.onload = () => {
                    setNovaCorretora(response => ({
                      ...response,
                      logo: e.file.originFileObj,
                      logoBase: reader.result
                    }));
                  } 
                }}
              >
                <Avatar className='imageCenterAvatar' src={novaCorretora.logoBase} style={{ cursor: 'pointer' }} shape='square' size={150} icon={<FileOutlined />} />
              </Upload>
            </center>
          </Col>
          <Col span={12}>
            <label>SITE:</label>
            <Input value={novaCorretora.site} onChange={(e) => setNovaCorretora(response => ({...response, site: String(e.target.value).toUpperCase()}))} />
          </Col>
          <Col span={12}>
            <label>LAYOUT: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <Select value={novaCorretora.layout.theme} style={{ width: '100%' }} onChange={(e) => setNovaCorretora(response => ({...response, layout: { theme: e }}))}>
              {['blue', 'red', 'green', 'yellow', 'purple'].map((item) => (
                <Select.Option value={item}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 100, background: item, marginRight: 5 }} /> {item.toUpperCase()}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={24}>
            <Divider style={{ margin: 0, padding: 0 }} />
          </Col>
          <Col span={24}>
            <h4>COMISSÃO:</h4>
          </Col>
          <Col span={12}>
            <label>PERCENTUAL: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <InputNumber style={{ width: '100%' }} max={100} step={1} value={novaCorretora.comissao.percentual} onChange={(e) => setNovaCorretora(response => ({...response, comissao: { ...response.comissao, percentual: Number(e) }}))} />
          </Col>
          <Col span={12}>
            <label>JUROS: <sup>% mês</sup> <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <InputNumber style={{ width: '100%' }} step={.5} max={7} value={novaCorretora.comissao.juros} onChange={(e) => setNovaCorretora(response => ({...response, comissao: { ...response.comissao, juros: Number(e) }}))} />
          </Col>
        </Row>
      </Modal>
      <CardComponent>
        <Row
          style={{
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
            marginBottom: 10
          }}
        >
          <Col sm={24} md={12}
            style={{
              display: 'flex', 
              alignItems: 'center',
            }}
          >
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444'}}>CORRETORAS DE SEGUROS <sup><PlusOutlined onClick={() => setModalNovaCorretora(true)} /></sup></h1>
          </Col>
          <Col sm={24} md={12}
            style={{
              display: width > 768 && 'flex',
              alignItems: width > 768 && 'center',
              flexDirection: width > 768 && 'row',
              justifyContent: width > 768 && 'end'
            }}
          >
            <div style={{ marginRight: 10 }}>
              <div style={{ width: '100%' }}>FILTRO POR CNPJ:</div>
              <Input style={{ width: width <= 768 && 200 }} type='tel' value={cnpj} placeholder='00.000.000/0000-00' onKeyDown={(e) => {
                if(cnpj.length === 18 && e.code === 'Backspace') {
                  setCNPJ('');
                }
              }} onChange={(e) => setCNPJ(maskCNPJ(e.target.value))} />
            </div>
            {cnpj.length < 18 && (
              <div>
                <div style={{ width: '100%' }}>FILTRO POR STATUS:</div>
                <Select style={{ width: width <= 768 ? 150 : '100%' }}
                  onChange={(e) => setStatus(e)}
                  value={status}
                >
                  <Select.Option value={null}>TODAS</Select.Option>
                  {Object.keys(statusPaymentText).map((item, index) => (
                    <Select.Option value={item}>{statusPaymentText[item].toUpperCase()}</Select.Option>
                  ))}
                </Select>
              </div>
            )}
          </Col>
        </Row>
        <TableCorretora status={status} infiniteData={true} cnpj={cnpj} />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Corretora;