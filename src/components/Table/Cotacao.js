import { useState, useEffect } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Table,
  Tag,
  Button,
  Empty,
  Menu,
  Dropdown
} from 'antd';

import {
  DownOutlined
} from '@ant-design/icons';

import { FaTimesCircle, FaFile, FaPlus, FaPrint } from 'react-icons/fa';

import _ from 'lodash';

import { format } from 'date-fns';

import { iniciarCotacao, apagarCotacao, vincularSeguro, verSolicitacaoCotacao, verSeguro } from '../../functions';
import ModalSeguro from 'components/Modal/seguro';

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

  const dadaInitial = {
    comissaoCorretora: '100,00',
    comissaoCorretoraValor: 0,
    comissaoCorretor: '0,00',
    comissaoCorretorValor: 0,
    parcelas: null,
    uid: null,
    search: false,
    corretorUid: null,
    corretorDisplayName: null,
    anoAdesao: null,
    nome: null,
    cep: null,
    bairro: null,
    cidade: null,
    estado: null,
    telefone: null,
    veiculo: null,
    premio: null,
    franquia: null,
    percentual: null,
    comissao: null,
    placa: null,
    vigencia: null,
    seguradora: null,
    cpf: null,
    veiculo: null,
    condutor: null
  };

  const dataSeguroInitial = {
    comissaoCorretora: '100,00',
    comissaoCorretoraValor: 0,
    comissaoCorretor: '0,00',
    comissaoCorretorValor: 0,
    parcelas: null,
    uid: null,
    search: false,
    corretorUid: null,
    corretorDisplayName: null,
    anoAdesao: null,
    nome: null,
    cep: null,
    bairro: null,
    cidade: null,
    estado: null,
    telefone: null,
    veiculo: null,
    premio: null,
    franquia: null,
    percentual: null,
    comissao: null,
    placa: null,
    vigencia: null,
    seguradora: null,
    cpf: null,
    veiculo: null,
    condutor: null
  };
  
  const [dataSeguroView, setDataSeguroView] = useState(dataSeguroInitial);

  const [visible, setVisible] = useState(false);

  const vincularSeguroModal = async (dados) => {
    await setDataSeguroView((e) => ({
      ...e,
      uid: dados.uid,
      search: true,
      placa: dados.veiculo.placa,
      corretorUid: dados.corretor ? dados.corretor.uid : null,
      seguradora: dados.seguradora ? dados.seguradora.uid : null,
      nome: dados.segurado.nome,
      anoAdesao: dados.segurado.anoAdesao,
      veiculo: dados.veiculo.veiculo,
      telefone: dados.segurado.telefone,
      cpf: dados.segurado.cpf,
      condutor: dados.veiculo.condutor,
      cep: dados.veiculo.cep,
      condutor: dados.condutor.nome,
      profissao: dados.segurado.profissao || 'OUTROS',
      juros: dados.valores?.juros || null
    }));

    setVisible(true);
  }

  return (
    <>
      <ModalSeguro data={dataSeguroView} visible={visible} setVisible={setVisible} callback={() => vincularSeguro(dataSeguroView)} />
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
                SEGURADO
              </div>
            ]
          }
          render={(segurado, dados) => (
            <>
              {loadingData && (
                <span style={{ fontSize: '.6rem' }}>
                  SEGURO {String(dados.tipo).toUpperCase().split('-').join(' ')} {((dados.tipo === 'veicular' || dados.seguro.tipo === 'veicular')) && `- ${dados.veiculo.placa}`}
                </span>
              )}
              <div className={!loadingData && 'skeleton'}>
                {segurado && String(segurado.nome).toUpperCase()}
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
                <Tag style={{color: !loadingData && 'transparent', textAlign: 'center'}} color={status === 0 ? 'gray' : status === 1 ? '#87d068' : status ? '#1890ff' : 'transparent'}>
                  <b>
                    {status === 0 ? 'AGUARDANDO COTAÇÃO' : status === 1 ? 'COTANDO SEGURO' : 'SEGURO GERADO'}
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
                      <Menu.Item icon={<FaPrint />} onClick={() => verSolicitacaoCotacao(dados)}>
                        IMPRIMIR COTAÇÃO
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
                            <Menu.Item icon={<FaFile />} onClick={() => vincularSeguroModal(dados)}>
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