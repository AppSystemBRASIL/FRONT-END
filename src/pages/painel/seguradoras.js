import React, { useState, useEffect } from 'react';
import firebase from '../../auth/AuthConfig';

import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Input, Modal, notification, Empty } from 'antd';

import {
  PlusOutlined,
  CloseCircleFilled
} from '@ant-design/icons';

import TableSeguradora from '../../components/Table/Seguradora';

import { maskOnlyLetters, maskPhone } from '../../hooks/mask';
import generateToken from '../../hooks/generateToken';

import useAuth from '../../hooks/useAuth';

const Seguradoras = () => {
  const { setCollapsedSideBar } = useAuth();

  const [modalNovaSeguradora, setModalNovaSeguradora] = useState(false);
  const [novaSeguradora, setNovaSeguradora] = useState({
    razao_social: null,
    contatos: []
  });
  const [loadingAddSeguradora, setLoadingAddSeguradora] = useState(false);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
    setWidth(window.screen.width);
  }, []);

  useEffect(() => {
    setLoadingAddSeguradora();
    setNovaSeguradora({
      razao_social: null,
      contatos: []
    })
  }, [modalNovaSeguradora]);

  const adicionarSeguradora = async () => {
    if(novaSeguradora.razao_social === null || novaSeguradora.contatos.length === 0) {
      notification.warn({
        message: 'PREENCHA OS CAMPOS OBRIGATÓRIOS'
      });

      return;
    }

    setLoadingAddSeguradora(true);

    const data = {
      ...novaSeguradora,
      created: new Date(),
      uid: generateToken(),
    }

    await firebase.firestore().collection('seguradoras').doc(data.uid).set(data, { merge: true })
    .then(() => {
      setModalNovaSeguradora(false);
    });

    setLoadingAddSeguradora(false);
  }

  const addContato = () => {
    setNovaSeguradora(response => ({
      ...response,
      contatos: [
        ...response.contatos,
        {
          telefones: [
            {
              locais: '',
              telefone: '',
            },
            {
              locais: '',
              telefone: '',
            },
          ],
          setor: ''
        }
      ]
    }))
  }

  return (
    <LayoutAdmin title='SEGURADORAS'>
      <Modal style={{ top: 10 }} confirmLoading={loadingAddSeguradora} title='ADICIONAR NOVA SEGURADORA' visible={modalNovaSeguradora} closable={() => setModalNovaSeguradora(false)} onCancel={() => setModalNovaSeguradora(false)} cancelText='FECHAR' okText='ADICIONAR' onOk={adicionarSeguradora}>
        <Row gutter={[20, 15]}>
          <Col span={24}>
            <label>NOME DA SEGURADORA: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <Input value={novaSeguradora.razao_social} onChange={(e) => setNovaSeguradora(response => ({...response, razao_social: maskOnlyLetters(String(e.target.value).toUpperCase())}))} />
          </Col>
          <Col span={24}>
            <Row>
              <Col span={24}>
                <label>CONTATOS DA SEGURADORA: <sup><PlusOutlined style={{ cursor: 'pointer' }} onClick={addContato} /></sup></label>
              </Col>
            </Row>
            <br/>
            <Row gutter={[10, 20]}>
              {novaSeguradora.contatos.length > 0 ? novaSeguradora.contatos.map((item, index) => (
                <Col span={24} style={{ border: '1px solid #d9d9d9', padding: '50px 10px' }} key={index}>
                  <CloseCircleFilled style={{
                    cursor: 'pointer',
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    fontSize: '1rem'
                  }} onClick={async () => {
                    await setNovaSeguradora(response => ({ ...response }));
                    setNovaSeguradora({
                      ...novaSeguradora,
                      contatos: novaSeguradora.contatos.filter(resp => resp !== novaSeguradora.contatos[index])
                    });
                  }} />
                  <div>
                    <label>SETOR:</label>
                    <Input onChange={async (e) => {
                      novaSeguradora.contatos[index].setor = String(e.target.value).toUpperCase();

                      await setNovaSeguradora(response => ({ ...response }));
                      setNovaSeguradora(novaSeguradora);
                    }} value={item.setor} style={{ padding: 0, outline: 'none', borderRadius: 0, border: 'none', borderBottom: '1px solid #d9d9d9' }} />
                  </div>
                  {item.telefones.map((item1, index1) => (
                    <Row gutter={[10, 10]} style={{ marginTop: 10 }} key={index}>
                      <Col span={14}>
                        <label>LOCAL:</label>
                        <br/>
                        <Input
                        onChange={async (e) => {
                          novaSeguradora.contatos[index].telefones[index1].locais = String(e.target.value).toUpperCase();

                          await setNovaSeguradora(response => ({ ...response }));
                          setNovaSeguradora(novaSeguradora);
                        }}
                        value={item1.locais} style={{ padding: 0, outline: 'none', borderRadius: 0, border: 'none', borderBottom: '1px solid #d9d9d9' }} />
                      </Col>
                      <Col span={10}>
                        <label>CONTATO:</label>
                        <br/>
                        <Input
                        value={item1.telefone}
                        onChange={async (e) => {
                          const telefone = e.target.value;
                          novaSeguradora.contatos[index].telefones[index1].telefone = telefone;

                          await setNovaSeguradora(response => ({ ...response }));
                          setNovaSeguradora(novaSeguradora);
                        }}
                        style={{ padding: 0, outline: 'none', borderRadius: 0, border: 'none', borderBottom: '1px solid #d9d9d9' }} />
                      </Col>
                    </Row>
                  ))}
                </Col>
              )) : (
                <Col span={24}>
                  <Empty
                    description='NENHUM CONTATO'
                  />
                </Col>
              )}
            </Row>
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
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444'}}>SEGURADORAS DE SEGUROS <sup><PlusOutlined onClick={() => setModalNovaSeguradora(true)} /></sup></h1>
          </Col>
        </Row>
        <TableSeguradora infiniteData={true} />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Seguradoras;