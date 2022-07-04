import { useState, useEffect } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Table,
  Button,
  Modal,
  Empty,
  Row,
  Col,
  Input,
} from 'antd';

import {
  CloseCircleFilled
} from '@ant-design/icons';

import { FaEye, FaPlus } from 'react-icons/fa';

import _ from 'lodash';

const TableSeguradora = ({ infiniteData, limit, cnpj }) => {
  const [loadingData, setLoadingData] = useState(false);
  const [seguradoras, setSeguradoras] = useState([]);

  const [lastData, setLastData] = useState(0);

  const [viewButtonMore, setViewButtonMore] = useState(false);

  const listLimitDefault = 10;

  useEffect(() => {
    (async () => {
      if(cnpj === undefined || (cnpj.length === 18 || cnpj.length === 0)) {
        await setLastData(0);
        await setSeguradoras([]);
        getCotacao('init');
      }
    })();
  }, [cnpj]);

  const getCotacao = async (init) => {
    let ref = firebase.firestore()
    .collection('seguradoras')
    .orderBy('razao_social');

    if((!init && lastData !== 0)) {
      ref = ref.startAfter(lastData);
    }

    ref.limit((cnpj !== undefined && cnpj.length === 18) ? 10000 : limit || listLimitDefault)
    .onSnapshot((snap) => {
      setViewButtonMore(false);

      const array = [];

      if(!snap.empty) {
        snap.forEach((item) => {
          array.push(item.data());
        });
      }

      if(snap.docs[snap.docs.length-1]) {
        setLastData(snap.docs[snap.docs.length-1]);
      }

      setSeguradoras(response => {
        const objetos = [...response];

        array.map((item) => {
          const index = objetos.findIndex(resp => resp.uid === item.uid);
          if(index >= 0) {
            objetos[index] = item;
          }else {
            objetos.push(item);
          }
        });

        return objetos;
      });

      if(array.length === (limit || listLimitDefault)) {
        setViewButtonMore(true);
      }
    })
    
    setLoadingData(true);
  }
  
  return (
    <>
      <Table
        dataSource={loadingData ? seguradoras.sort((a, b) => a.created + b.created) : _.times(listLimitDefault)}
        pagination={false}
        scroll={{ x: 'calc(100% - 0px)' }}
        locale={{
          emptyText: [
            <Empty 
              description={
                <h1 style={{color: 'gray'}}>
                  NENHUM REGISTRO ENCONTRADO
                </h1>
              }
            />
          ]
        }}
      >
        <Table.Column
          key="razao_social"
          dataIndex="razao_social"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                EMPRESA
              </div>
            ]
          }
          render={(razao_social) => razao_social}
        />
        <Table.Column
          width={100}
          key="uid"
          dataIndex="uid"
          title={
            [
              <div style={{width: !loadingData && 70, height: !loadingData && 23}} className={!loadingData && 'skeleton'}>
                {loadingData && (
                  <center>
                    AÇÃO
                  </center>
                )}
              </div>
            ]
          }
          render={(uid, dados) => (
            <>
              {!uid ? (
                <div className='skeleton' style={{ width: 70, height: 23 }} />
              ) : (
                <>
                  {loadingData ? (
                    <div
                      className={!loadingData && 'skeleton'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around'
                      }}
                    >
                      <Button
                        onClick={() => {
                          Modal.confirm({
                            style: {
                              top: 10,
                            },
                            width: window.screen.width <= 768 ? '100%' : '40%',
                            icon: null,
                            title: 'DADOS DA CORRETORA',
                            content: [
                              <Row gutter={[20, 15]}>
                                <Col span={24}>
                                  <label>NOME DA SEGURADORA: <sup><span style={{ color: 'red' }}>*</span></sup></label>
                                  <Input readOnly value={dados.razao_social} />
                                </Col>
                                <Col span={24}>
                                  <Row>
                                    <Col span={24}>
                                      <label>CONTATOS DA SEGURADORA:</label>
                                    </Col>
                                  </Row>
                                  <br/>
                                  <Row gutter={[10, 20]}>
                                    {dados.contatos.length > 0 ? dados.contatos.map((item, index) => (
                                      <Col key={index} span={24} style={{ border: '1px solid #d9d9d9', padding: '20px 10px' }}>
                                        <div>
                                          <label>SETOR:</label>
                                          <Input readOnly value={item.setor} style={{ padding: 0, outline: 'none', borderRadius: 0, border: 'none', borderBottom: '1px solid #d9d9d9' }} />
                                        </div>
                                        {item.telefones.map((item1, index1) => (
                                          <Row gutter={[10, 10]} style={{ marginTop: 10 }}>
                                            <Col span={14}>
                                              <label>LOCAL:</label>
                                              <br/>
                                              <Input value={item1.locais} style={{ padding: 0, outline: 'none', borderRadius: 0, border: 'none', borderBottom: '1px solid #d9d9d9' }} />
                                            </Col>
                                            <Col span={10}>
                                              <label>CONTATO:</label>
                                              <br/>
                                              <Input
                                              readOnly
                                              value={item1.telefone}
                                              placeholder='(00) 00000-0000'
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
                            ],
                            cancelText: 'FECHAR',
                            okButtonProps: {
                              style: {
                                display: 'none'
                              }
                            }
                          })
                        }}
                        type='primary'
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: 'none',
                          outline: 'none',
                          position: 'relative',
                        }}
                      >
                        <FaEye />
                      </Button>
                    </div>
                  ) : (
                    <div className='skeleton' style={{ width: 70, height: 23 }} />
                  )}
                </>
              )}
            </>
          )}
        />
      </Table>
      {(infiniteData === true && viewButtonMore === true) && (
        <center>
          <Button type='primary' onClick={() => getCotacao()} style={{
            display: 'flex',
            alignItems: 'center',
            margin: 10,
            fontWeight: 'bold'
          }}>
            MAIS SEGURADORAS <FaPlus style={{ marginLeft: 5 }} />
          </Button>
        </center>
      )}
    </>
  )
}

export default TableSeguradora;