import { useState, useEffect } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Table,
  Button,
  Empty,
  Dropdown,
  Menu,
  Modal,
  Divider,
  Select,
  Row,
  Col,
  Input,
  notification
} from 'antd';

import { FaFileAlt, FaPlus } from 'react-icons/fa';
import {
  DownOutlined
} from '@ant-design/icons'

import _ from 'lodash';

import { format, startOfDay } from 'date-fns';
import generateToken from 'hooks/generateToken';
import { maskCEP, maskMoney, maskOnlyNumbers } from 'hooks/mask';
import axios from 'axios';

const ContentEndosso = ({ data, type }) => {
  const [state, setState] = useState({
    placa: data.veiculo.placa,
    veiculo: data.veiculo.veiculo,
    condutor: data.veiculo.condutor,
    valor: null,
    percentual: data.comissao.percentual,
    comissao: null,
    cep: data.endereco.cep,
    bairro: data.endereco.bairro,
    cidade: data.endereco.cidade,
    estado: data.endereco.estado,
  });

  useEffect(() => {
    if(String(state.cep).length === 9) {
      axios.get(`https://viacep.com.br/ws/${String(state.cep).split('-').join('')}/json`, {
        headers: {
          'content-type': 'application/json;charset=utf-8',
        },
      })
      .then((response) => {
        const data = response.data;

        setState(e => ({...e, bairro: data.bairro, cidade: data.localidade, estado: data.uf}))
      })
      .catch((error) => {
        console.log(error);
      })
    }
  }, [state.cep])

  useEffect(() => {
    setState(e => ({...e, comissao: Number((Number(String(state.valor).split('.').join('').split(',').join('.')) / 100) * Number(state.percentual))}))
  }, [state.valor, state.percentual]);

  async function confirmarEndosso() {
    if((type === 'VEÍCULO' || type === 'GERAL')) {
      if(!state.veiculo || !state.placa) {
        notification.warn({
          message: 'PREENCHA TODOS OS CAMPOS!'
        });
        
        return;
      }
    }

    if(type === 'ENDEREÇO') {
      if(!state.cep || !state.bairro || !state.cidade || !state.estado) {
        notification.warn({
          message: 'PREENCHA TODOS OS CAMPOS!'
        });
        
        return;
      }
    }

    if(state.valor >= 0 || !state.percentual || !state.comissao) {
      notification.warn({
        message: 'PREENCHA TODOS OS CAMPOS!'
      });
      
      return;
    }

    const dados = {
      endossos: firebase.firestore.FieldValue.arrayUnion({
        valores: {
          valor: Number(String(state.valor).split('.').join('').split(',').join('.')),
          percentual: Number(state.percentual),
          comissao: state.comissao,
        },
        created: new Date(),
        tipo: type,
        veiculo: {
          placa: state.placa,
          condutor: state.condutor,
          modelo: state.veiculo
        },
        endereco: {
          cep: state.cep,
          bairro: state.bairro,
          cidade: state.cidade,
          estado: state.estado,
        }
      })
    }

    if((type === 'VEÍCULO' || type === 'GERAL')) {
      dados.veiculo = {
        placa: state.placa,
        condutor: state.condutor,
        veiculo: state.veiculo
      };
    }

    if(type === 'ENDEREÇO') {
      dados.endereco = {
        cep: state.cep,
        bairro: state.bairro,
        cidade: state.cidade,
        estado: state.estado,
      }
    }

    await firebase.firestore().collection('seguros').doc(data.uid).set(dados, { merge: true })
    .then(() => {
      Modal.destroyAll();
      notification.success({
        message: 'ENDOSSO GERADO COM SUCESSO!'
      });
    })
    .catch(() => {
      notification.error({
        message: 'ERRO AO GERAR ENDOSSO!'
      });
    })
  }

  return (
    <>
      <Row gutter={[20, 20]}>
        {(type === 'VEÍCULO' || type === 'GERAL') && (
          <>
            <Col span={8}>
              <label>PLACA:</label>
              <Input value={state.placa} maxLength={7} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='AAA0000' onChange={(e) => setState(resp => ({ ...resp, placa: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={16}>
              <label>VEÍCULO:</label>
              <Input value={state.veiculo} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='NOME DO VEÍCULO' onChange={(e) => setState(resp => ({ ...resp, veiculo: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={24}>
              <label>CONDUTOR:</label>
              <Input value={state.condutor} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='NOME DO CONDUTOR' onChange={(e) => setState(resp => ({ ...resp, condutor: maskOnlyLetters(String(e.target.value).toUpperCase()) }))} />
            </Col>  
          </>
        )}
        <Col span={8}>
          <label>VALOR DO ENDOSSO:</label>
          <Input value={state.valor} type='tel' autoComplete='off' style={{ textTransform: 'uppercase' }} prefix='R$' placeholder='0' onChange={(e) => setState(resp => ({ ...resp, valor: !e.target.value ? null : maskMoney(maskOnlyNumbers(e.target.value)) }))} />
        </Col>
        <Col span={8}>
          <label>COMISSÃO:</label>
          <Input value={state.percentual} type='tel' prefix='%' autoComplete='off' maxLength={2} max={99} style={{ textTransform: 'uppercase' }} placeholder='0' onChange={(e) => setState(resp => ({ ...resp, percentual: !e.target.value ? null : maskOnlyNumbers(e.target.value) }))} />
        </Col>
        <Col span={8}>
          <label>COMISSÃO: </label>
          <Input value={!state.comissao ? 0 : Number(state.comissao).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} type='tel' readOnly prefix='R$' autoComplete='off' style={{ textTransform: 'uppercase' }} placeholder='0' />
        </Col>
        {(type === 'ENDEREÇO' || type === 'GERAL') && (
          <>
            <Col span={6}>
              <label>CEP:</label>
              <Input value={state.cep} autoComplete='off' maxLength={9} style={{ textTransform: 'uppercase' }} onChange={(e) => setState(resp => ({ ...resp, cep: maskCEP(e.target.value) }))} placeholder='CEP' />
            </Col>
            <Col span={6}>
              <label>BAIRRO:</label>
              <Input value={state.bairro} autoComplete='off' style={{ textTransform: 'uppercase' }} placeholder='BAIRRO' onChange={(e) => setState(resp => ({ ...resp, bairro: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={6}>
              <label>CIDADE:</label>
              <Input value={state.cidade} autoComplete='off' style={{ textTransform: 'uppercase' }} placeholder='CIDADE' onChange={(e) => setState(resp => ({ ...resp, cidade: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={6}>
              <label>ESTADO:</label>
              <Input value={state.estado} autoComplete='off' style={{ textTransform: 'uppercase' }} placeholder='ESTADO' onChange={(e) => setState(resp => ({ ...resp, estado: String(e.target.value).toUpperCase() }))} />
            </Col>
          </>
        )}
      </Row>
      <Divider />
      <div style={{ float: 'right' }}>
        <Button onClick={() => Modal.destroyAll()}>FECHAR</Button>
        <Button style={{ background: '#141414', color: 'white', border: 'none', outline: 'none', marginLeft: 10, fontWeight: 'bold' }} onClick={confirmarEndosso}>CONFIRMAR</Button>
      </div>
    </>
  )
}

const TableSeguro = ({ corretor, seguradora, date, infiniteData, limit, cpf, placa, corretora, user, setTotalSeguro, setTotalPremio, setTotalComissao, setSeguros: setSegurosList }) => {
  const [loadingData, setLoadingData] = useState(false);
  const [seguros, setSeguros] = useState([]);

  const [lastData, setLastData] = useState(0);

  const [viewButtonMore, setViewButtonMore] = useState(false);

  const listLimitDefault = 10;

  useEffect(() => {
    (async () => {
      await setLastData(0);
      await setSeguros([]);

      if((cpf.length === 14) || (placa.length === 7)) {
        getCotacao('init');
      }else if(cpf.length === 0) {
        if(placa.length === 7 || placa.length === 0) {
          getCotacao('init');
        }
      }else if(placa.length === 0) {
        if(cpf.length === 14 || cpf.length === 0) {
          getCotacao('init');
        }
      }
    })();
  }, [cpf, placa, seguradora, corretor, date]);

  useEffect(() => {
    (async () => {
      await setLastData(0);
      await setSeguros([]);
      getCotacao('init');
    })();
  }, []);

  const getCotacao = async (init) => {
    let ref = firebase.firestore().collection('seguros').where('ativo', '==', true);

    if(date) {
      ref = ref.where('seguro.vigencia', '>=', startOfDay(new Date(date[0].toDate())));
      ref = ref.where('seguro.vigencia', '<=', startOfDay(new Date(date[1].toDate())));
      ref = ref.orderBy('seguro.vigencia', 'asc');
    }else {
      ref = ref.where('seguro.vigenciaFinal', '>=', new Date());
      ref = ref.orderBy('seguro.vigenciaFinal', 'asc');
    }


    if(user.tipo !== 'corretor') {
      ref = ref.where('corretora.uid', '==', corretora);
    }else {
      ref = ref.where('corretor.uid', '==', user.uid);
    }

    if(cpf !== undefined && cpf.length === 14) {
      ref = ref.where('segurado.cpf', '==', cpf);
      ref = ref.orderBy('created', 'desc');
    }if(placa !== undefined && placa.length === 7) {
      ref = ref.where('veiculo.placa', '==', placa);
      ref = ref.orderBy('created', 'desc');
    }else if((!init && lastData !== 0)) {
      ref = ref.orderBy('created', 'asc');
      ref = ref.startAfter(lastData);
    }

    if(corretor) {
      if(corretor === 'null') {
        ref = ref.where('corretor', '==', null);
      }else {
        ref = ref.where('corretor.uid', '==', corretor);
      }
    }

    if(seguradora) {
      ref = ref.where('seguradora.uid', '==', seguradora);
    }

    ref.limit(((cpf !== undefined && cpf.length === 14) || (placa !== undefined && placa.length === 7) || (corretor !== undefined && corretor !== null) || (seguradora !== undefined && seguradora !== null)) ? 10000 : limit || listLimitDefault)
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

      setSeguros(response => {
        const objetos = [...response];

        array.map((item) => {
          const index = objetos.findIndex(resp => resp.uid === item.uid);
          if(index >= 0) {
            objetos[index] = item;
          }else {
            objetos.push(item);
          }
        });

        setTotalPremio(objetos.reduce((a, b) => a + Number(String(b.comissao.premio).split('.').join('').split(',').join('.')), 0))
        setTotalComissao(objetos.reduce((a, b) => a + Number(String(b.comissao.comissao)), 0))

        setSegurosList(objetos);
        return objetos;
      });

      if(array.length === (limit || listLimitDefault)) {
        setViewButtonMore(true);
      }

      setTotalSeguro(snap.size);
    });
    
    setLoadingData(true);
  }

  const cancelarSeguro = (dados) => {
    Modal.confirm({
      width: '50%',
      title: 'DESEJA REALMENTE CANCELAR O SEGURO?',
      content: [
        <>
          <h3>
            Ao confirmar a ação não será possível desfazer a mesma
          </h3>
          <br/>
          <span>
            <b>SEGURADO:</b> {dados.segurado.nome}
            <br/>
            <b>SEGURADORA:</b> {dados.seguradora.razao_social}
            <br/>
            <b>PLACA:</b> {dados.veiculo.placa}
            <br/>
            <b>VEÍCULO:</b> {dados.veiculo.veiculo}
          </span>
        </>
      ],
      onOk: () => {
        firebase.firestore().collection('seguros').doc(dados.uid).set({
          ativo: false
        }, { merge: true })
        .then(() => {
          if(dados.corretor) {
            firebase.firestore().collection('relatorios').doc('seguros').collection('corretor').doc(dados.corretor.uid).set({
              total: firebase.firestore.FieldValue.increment(-1),
              valores: {
                premio: firebase.firestore.FieldValue.increment(-Number(String(dados.comissao.premio).split('.').join('').split(',').join('.'))),
                comissao: firebase.firestore.FieldValue.increment(-dados.comissao.comissao),
              }
            }, { merge: true });
          }

          if(dados.corretora) {
            firebase.firestore().collection('relatorios').doc('seguros').collection('corretora').doc(dados.corretora.uid).set({
              total: firebase.firestore.FieldValue.increment(-1),
              valores: {
                premio: firebase.firestore.FieldValue.increment(-Number(String(dados.comissao.premio).split('.').join('').split(',').join('.'))),
                comissao: firebase.firestore.FieldValue.increment(-dados.comissao.comissao),
              }
            }, { merge: true });
          }

          setSeguros(resp => resp.filter(e => e.uid !== dados.uid));
        });
      },
      okText: 'CONFIRMAR',
      cancelText: 'FECHAR'
    })
  }

  const endossoData = (data, type) => {
    Modal.confirm({
      icon: null,
      width: '50%',
      title: [
        <>
          <h3 style={{ margin: 0 }}>ENDOSSO ({type})</h3>
          <Divider style={{ margin: 0, marginBottom: 10 }} />
        </>
      ],
      content: <ContentEndosso data={data} type={type} />,
      okButtonProps: {
        style: {
          display: 'none',
        }
      },
      cancelButtonProps: {
        style: {
          display: 'none',
        }
      },
    });
  }

  const verEndossos = (dados) => {
    Modal.confirm({
      icon: null,
      width: '50%',
      title: [
        <>
          <h3 style={{ margin: 0 }}>REGISTROS DE ENDOSSOS ({dados.segurado.nome})</h3>
          <Divider style={{ margin: 0, marginBottom: 10 }} />
        </>
      ],
      content: [
        <>
          {dados.endossos?.sort((a, b) => b.created - a.created).map((item, index) => (
            <div
              key={index}
              style={{
                background: '#F4F4F4',
                border: '1px solid #d1d1d1',
                borderRadius: 5,
                width: '100%',
                padding: 10,
                marginBottom: 10
              }}
            >
              <h3 style={{ margin: 0 }}>ENDOSSO - {item.tipo}</h3>
              <Divider style={{ margin: 0, marginBottom: 10 }} />
              <Row gutter={[20, 20]}>
                {(item.tipo === 'VEÍCULO' || item.tipo === 'GERAL') && (
                  <>
                    <Col span={8}>
                      <label>PLACA:</label>
                      <Input value={item.veiculo.placa} style={{ width: '100%', textTransform: 'uppercase' }} readOnly />
                    </Col>
                    <Col span={16}>
                      <label>VEÍCULO:</label>
                      <Input value={item.veiculo.modelo} style={{ width: '100%', textTransform: 'uppercase' }} readOnly />
                    </Col>
                    {item.veiculo.condutor && (
                      <Col span={24}>
                        <label>CONDUTOR:</label>
                        <Input value={item.veiculo.condutor} style={{ width: '100%', textTransform: 'uppercase' }} readOnly />
                      </Col>  
                    )}
                  </>
                )}
                <Col span={8}>
                  <label>VALOR DO ENDOSSO:</label>
                  <Input value={Number(item.valores.valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} prefix='R$' style={{ textTransform: 'uppercase' }} readOnly />
                </Col>
                <Col span={8}>
                  <label>COMISSÃO:</label>
                  <Input value={Number(item.valores.comissao).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} prefix='%' style={{ textTransform: 'uppercase' }} readOnly />
                </Col>
                <Col span={8}>
                  <label>COMISSÃO: </label>
                  <Input value={Number(item.valores.percentual).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} prefix='R$' style={{ textTransform: 'uppercase' }} readOnly />
                </Col>
                {(item.tipo === 'ENDEREÇO' || item.tipo === 'GERAL') && (
                  <>
                    <Col span={6}>
                      <label>CEP:</label>
                      <Input value={item.endereco.cep} style={{ textTransform: 'uppercase' }} readOnly />
                    </Col>
                    <Col span={6}>
                      <label>BAIRRO:</label>
                      <Input value={item.endereco.bairro} style={{ textTransform: 'uppercase' }} readOnly />
                    </Col>
                    <Col span={6}>
                      <label>CIDADE:</label>
                      <Input value={item.endereco.cidade} style={{ textTransform: 'uppercase' }} readOnly />
                    </Col>
                    <Col span={6}>
                      <label>ESTADO:</label>
                      <Input value={item.endereco.estado} style={{ textTransform: 'uppercase' }} readOnly />
                    </Col>
                  </>
                )}
              </Row>
            </div>
          ))}
          <div style={{ float: 'right' }}>
            <Button onClick={() => Modal.destroyAll()}>FECHAR</Button>
          </div>
        </>
      ],
      okButtonProps: {
        style: {
          display: 'none',
        }
      },
      cancelButtonProps: {
        style: {
          display: 'none',
        }
      },
    });
  }
  
  return (
    <>
      <Table
        dataSource={loadingData ? seguros.map(item => ({...item, key: generateToken(), seguro: { vigencia: item.seguro.vigencia, vigenciaFinal: item.seguro.vigenciaFinal }})).sort((a, b) => a.seguro.vigencia - b.seguro.vigencia).sort((a, b) => a.segurado.nome.toLowerCase().localeCompare(b.segurado.nome.toLowerCase())) : _.times(listLimitDefault)}
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
          width={300}
          key="segurado"
          dataIndex="segurado"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                SEGURADO
              </div>
            ]
          }
          render={(segurado) => (
            <>
              {loadingData && (
                <span style={{ fontSize: '.6rem', position: 'absolute', bottom: 5, left: 16 }}>
                  desde {segurado.anoAdesao}
                </span>
              )}
              <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1 }}>
                {segurado ? String(segurado.nome) : '000000000'}
              </div>
            </>
          )}
        />
        {user.tipo === 'administrador' && (
          <Table.Column
            width={150}
            key="corretor"
            dataIndex="corretor"
            title={
              [
                <div className={!loadingData && 'skeleton'}>
                  CORRETOR
                </div>
              ]
            }
            render={(corretor, dados) => (
              <>
                <div className={!loadingData && 'skeleton'}>
                  {corretor ? String(corretor.nome) : `-------------`}
                </div>
              </>
            )}
          />
        )}
        <Table.Column
          key="veiculo"
          width={120}
          dataIndex="veiculo"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                PLACA
              </div>
            ]
          }
          render={(veiculo) => (
            <div className={!loadingData && 'skeleton'}>
              {veiculo ? String(veiculo.placa).slice(0, 3)+'-'+String(veiculo.placa).slice(3, 10) : 'A AVISAR'}
            </div>
          )}
        />
        <Table.Column
          key="seguradora"
          dataIndex="seguradora"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                SEGURADORA
              </div>
            ]
          }
          render={(seguradora) => (
            <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1 }}>
              {seguradora ? seguradora.razao_social : '00000000000'}
            </div>
          )}
        />
        <Table.Column
          width={220}
          key="seguro"
          dataIndex="seguro"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                VIGÊNCIA
              </div>
            ]
          }
          render={(seguro) => seguro && (
            <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1 }}>
              {format(seguro.vigencia.toDate(), 'dd/MM/yyyy')}
              <br/>
              <span style={{ fontSize: '.7rem' }}>até: {format(seguro.vigenciaFinal.toDate(), 'dd/MM/yyyy')}</span>
            </div>
          )}
        />
        <Table.Column
          width={250}
          key="comissao"
          dataIndex="comissao"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                PRÊMIO LÍQUIDO | COMISSÃO
              </div> 
            ]
          }
          render={(comissao) => comissao && (
            <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1 }}>
              {Number(comissao.premio).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })} | {Number(comissao.percentual).toFixed(0)}%
              <br/>
              <span style={{ fontSize: '.7rem' }}>comissão: {Number(comissao.comissao).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}</span>
            </div>
          )}
        />
        <Table.Column
          width={200}
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
                      <Dropdown overlay={() => (
                        <Menu>
                          <Menu.Item icon={<FaFileAlt />} onClick={() => endossoData(dados, 'VEÍCULO')}>
                            ENDOSSO DO VEÍCULO | CONDUTOR
                          </Menu.Item>
                          <Menu.Item icon={<FaFileAlt />} onClick={() => endossoData(dados, 'ENDEREÇO')}>
                            ENDOSSO DO ENDEREÇO
                          </Menu.Item>
                          {dados.endossos?.length > 0 && (
                            <Menu.Item icon={<FaFileAlt />} onClick={() => verEndossos(dados)}>
                              REGISTROS DE ENDOSSOS
                            </Menu.Item>
                          )}
                          <Menu.Item icon={<FaFileAlt />} onClick={() => cancelarSeguro(dados)}>
                            ENDOSSO DE CANCELAMENTO
                          </Menu.Item>
                        </Menu>
                      )}>
                        <Button block>
                          OPÇÕES <DownOutlined />
                        </Button>
                      </Dropdown>
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
            MAIS SEGUROS <FaPlus style={{ marginLeft: 5 }} />
          </Button>
        </center>
      )}
    </>
  )
}

export default TableSeguro;