import { useState, useEffect } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Table,
  Tag,
  Button,
  Modal,
  Empty,
  Menu,
  Dropdown
} from 'antd';
import {
  DownOutlined
} from '@ant-design/icons';

import { FaEye, FaTimesCircle, FaFile, FaPlus } from 'react-icons/fa';

import _ from 'lodash';
import { format } from 'date-fns';

import { iniciarCotacao, apagarCotacao, vincularSeguro, verSolicitacaoCotacao, verSeguro } from '../../functions';

const TableCotacao = ({ infiniteData, limit, status, cpf }) => {
  const [loadingData, setLoadingData] = useState(false);
  const [cotacoes, setCotacoes] = useState([]);

  const [lastData, setLastData] = useState(0);

  const [viewButtonMore, setViewButtonMore] = useState(false);

  const listLimitDefault = 10;

  useEffect(() => {
    (async () => {
      if(cpf === undefined || (cpf.length === 14 || cpf.length === 0)) {
        await setLastData(0);
        await setCotacoes([]);
        getCotacao('init');
      }
    })();
  }, [status, cpf]);

  const getCotacao = async (init) => {
    let ref = firebase.firestore()
    .collection('cotacoes');

    if(cpf !== undefined && cpf.length < 14 && status !== null && status >= 0) {
      ref = ref.where('status', '==', status);
    }else if(cpf !== undefined && cpf.length === 14 && status === null) {
      ref = ref.where('cpf', '==', cpf);
    }

    ref = ref.orderBy('created', 'desc');

    if((!init && lastData !== 0)) {
      ref = ref.startAfter(lastData);
    }

    ref.limit((cpf !== undefined && cpf.length === 14) ? 10000 : limit || listLimitDefault)
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

      setCotacoes(response => {
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
        dataSource={loadingData ? cotacoes : _.times(listLimitDefault)}
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
          key="segurado"
          dataIndex="segurado"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                NOME
              </div>
            ]
          }
          render={(segurado, dados) => (
            <>
              {loadingData && (
                <span style={{ fontSize: '.6rem' }}>
                  SEGURO {(dados.tipo || dados.seguro.tipo).toUpperCase()} {((dados.tipo === 'veicular' || dados.seguro.tipo === 'veicular')) && `- ${dados.veiculo.placa}`}
                </span>
              )}
              <div className={!loadingData && 'skeleton'}>
                {segurado && segurado.nome}
              </div>
            </>
          )}
        />
        <Table.Column
          key="segurado"
          dataIndex="segurado"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>CELULAR</center>
              </div>
            ]
          }
          render={(segurado) => (
            <div className={!loadingData && 'skeleton'}>
              <center>
                {segurado && segurado.celular}
              </center>
            </div>
          )}
        />
        <Table.Column
          key="created"
          dataIndex="created"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>
                  RECEBIDO
                </center>
              </div>
            ]
          }
          render={(created) => (
            <div className={!loadingData && 'skeleton'}>
              <center>
                {created && format(new Date(created.toDate()), 'dd/MM/yyyy')}
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
                <center>
                  STATUS
                </center>
              </div>
            ]
          }
          render={(status) => (
            <div className={!loadingData && 'skeleton'}>
              <center>
                <Tag style={{color: !loadingData && 'transparent', width: '100%', textAlign: 'center'}} color={status === 0 ? 'gray' : status === 1 ? '#87d068' : status ? '#1890ff' : 'transparent'}>
                  <b>
                    {status === 0 ? 'AGUARDANDO' : status === 1 ? 'INICIADO' : 'CONCLUÍDO'}
                  </b>
                </Tag>
              </center>
            </div>
          )}
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
          render={(uid, dados) => {
            return (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {loadingData ? (
                  <Dropdown overlay={() => (
                    <Menu>
                      <Menu.Item icon={<FaEye />} onClick={() => verSolicitacaoCotacao(dados)}>
                        VER SOLICITAÇÃO
                      </Menu.Item>
                      {dados.status === 2 ? (
                        <Menu.Item icon={<FaFile />} onClick={() => verSeguro(dados.uid)}>
                          VER SEGURO
                        </Menu.Item>
                      ) : (
                        <>
                          {dados.status < 1 ? (
                            <Menu.Item icon={<FaFile />} onClick={() => iniciarCotacao(dados.uid)}>
                              INICIAR COTAÇÃO
                            </Menu.Item>
                          ) : (
                            <Menu.Item icon={<FaFile />} onClick={() => vincularSeguro(dados)}>
                              VINCULAR SEGURO
                            </Menu.Item>
                          )}
                          <Menu.Item icon={<FaTimesCircle />} onClick={() => apagarCotacao(dados.uid, setCotacoes)}>
                            APAGAR
                          </Menu.Item>
                        </>
                      )}
                      
                    </Menu>
                  )}>
                    <Button block>
                      OPÇÕES <DownOutlined />
                    </Button>
                  </Dropdown>
                ) : (
                  <div className='skeleton' style={{ width: 70, height: 23 }} />
                )}
              </div>
            )
          }}
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
            MAIS COTAÇÕES <FaPlus style={{ marginLeft: 5 }} />
          </Button>
        </center>
      )}
    </>
  )
}

export default TableCotacao;