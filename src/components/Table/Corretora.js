import { useState, useEffect } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Table,
  Tag,
  Button,
  Modal,
  Empty,
  Row,
  Col,
  Input,
  Avatar,
  Select
} from 'antd';

import {
  FileOutlined
} from '@ant-design/icons';

import { FaEye, FaPlus, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

import _ from 'lodash';
import { format } from 'date-fns';

import {
  maskCNPJ
} from '../../hooks/mask';

import { statusPaymentColors, statusPaymentText } from '../../utils/statusPayment';

const TableCotacao = ({ infiniteData, limit, status, cnpj }) => {
  const [loadingData, setLoadingData] = useState(false);
  const [corretoras, setCorretoras] = useState([]);

  const [lastData, setLastData] = useState(0);

  const [viewButtonMore, setViewButtonMore] = useState(false);

  const listLimitDefault = 10;

  useEffect(() => {
    (async () => {
      if(cnpj === undefined || (cnpj.length === 18 || cnpj.length === 0)) {
        await setLastData(0);
        await setCorretoras([]);
        getCotacao('init');
      }
    })();
  }, [status, cnpj]);

  const getCotacao = async (init) => {
    let ref = firebase.firestore()
    .collection('corretoras');

    if(cnpj !== undefined && cnpj.length < 18 && status !== null) {
      ref = ref.where('status', '==', status);
    }else if(cnpj !== undefined && cnpj.length === 18 && status === null) {
      ref = ref.where('cnpj', '==', String(cnpj).split('.').join('').split('/').join('').split('-').join(''));
    }

    ref = ref.orderBy('created', 'desc');

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

      setCorretoras(response => {
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
        dataSource={loadingData ? corretoras.sort((a, b) => a.created + b.created) : _.times(listLimitDefault)}
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
          render={(razao_social, dados, index) => (
            <div className={!loadingData && 'skeleton'}
              style={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  backgroundImage: `url(${dados.icon})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: 52,
                  height: 52,
                  marginRight: 5,
                  borderRadius: 5
                }}
              />
              <div>
                <span><b>{razao_social ? razao_social : 'NOME DA EMPRESA'}</b></span>
                <br/>
                <span style={{ color: loadingData && '#777' }}>{dados.site ? String(dados.site).toLowerCase() : 'NOME DA EMPRESA'}</span>
              </div>
            </div>
          )}
        />
        <Table.Column
          key="uid"
          dataIndex="uid"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                CONTATOS
              </div>
            ]
          }
          render={(item, dados, index) => (
            <div className={!loadingData && 'skeleton'}>
              <span>
                <span>
                  <FaWhatsapp /> {dados.telefone}
                </span>
                <br/>
                <span>
                  <FaEnvelope /> {dados.email}
                </span>
              </span>
            </div>
          )}
        />
        <Table.Column
          key="created"
          dataIndex="created"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>INGRESSÃO</center>
              </div>
            ]
          }
          render={(data) => (
            <div className={!loadingData && 'skeleton'}>
              <center>
                {data ? format(new Date(data.toDate()), 'dd/MM/yyyy') : '00/00/0000'}
              </center>
            </div>
          )}
        />
        <Table.Column
          key="status"
          dataIndex="status"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>STATUS</center>
              </div>
            ]
          }
          render={(status) => {      
            return (
              <div className={!loadingData && 'skeleton'}>
                <center>
                  <Tag color={statusPaymentColors[status]} style={{ minWidth: 100 }}>
                    <b>{statusPaymentText[status]}</b>
                  </Tag>
                </center>
              </div>
            )
          }}
        />
        <Table.Column
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
                        onClick={async () => {
                          Modal.confirm({
                            style: {
                              top: 10,
                            },
                            width: window.screen.width <= 768 ? '100%' : '40%',
                            icon: null,
                            title: 'DADOS DA CORRETORA',
                            content: [
                              <Row gutter={[20, 10]}>
                                <span style={{
                                  position: 'absolute',
                                  fontSize: '.6rem',
                                  color: '#999',
                                  top: 0,
                                  left: 2,
                                  fontWeight: 'bold'
                                }}>
                                  {dados.uid}
                                </span>
                                <Tag style={{
                                  position: 'absolute',
                                  top: 0,
                                  right: -8,
                                  fontWeight: 'bold',
                                  fontSize: '.8rem',
                                }} color={statusPaymentColors[dados.status]}>
                                  {statusPaymentText[dados.status].toUpperCase()}
                                </Tag>
                                <Col span={24}>
                                  <label>NOME FANTASIA:</label>
                                  <Input readOnly value={dados.razao_social} />
                                </Col>
                                <Col span={12}>
                                  <label>CNPJ:</label>
                                  <Input readOnly value={maskCNPJ(dados.cnpj || '')} />
                                </Col>
                                <Col span={12}>
                                  <label>TELEFONE:</label>
                                  <Input readOnly value={dados.telefone} />
                                </Col>
                                <Col span={24}>
                                  <label>EMAIL:</label>
                                  <Input readOnly value={dados.email} />
                                </Col>
                                <Col span={12}>
                                  <center>
                                    <label>ICON:</label>
                                    <br/>
                                    <Avatar className='imageCenterAvatar' src={dados.icon} shape='square' size={150} icon={<FileOutlined />} />
                                  </center>
                                </Col>
                                <Col span={12}>
                                  <center>
                                    <label>LOGO:</label>
                                    <br/>
                                    <Avatar className='imageCenterAvatar' src={dados.logo} shape='square' size={150} icon={<FileOutlined />} />
                                  </center>
                                </Col>
                                <Col span={12}>
                                  <label>SITE:</label>
                                  <Input readOnly value={dados.site} />
                                </Col>
                                <Col span={12}>
                                  <label>LAYOUT:</label>
                                  <Select readOnly disabled value={dados.layout.theme} style={{ width: '100%' }}>
                                    {['blue', 'red', 'green', 'yellow', 'purple'].map((item) => (
                                      <Select.Option value={item}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <div style={{ width: 10, height: 10, borderRadius: 100, background: item, marginRight: 5 }} /> {item.toUpperCase()}
                                        </div>
                                      </Select.Option>
                                    ))}
                                  </Select>
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
            MAIS CORRETORAS <FaPlus style={{ marginLeft: 5 }} />
          </Button>
        </center>
      )}
    </>
  )
}

export default TableCotacao;