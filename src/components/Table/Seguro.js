import { useState, useEffect, useRef } from 'react';

import firebase from '../../auth/AuthConfig';

import MaskedInput from 'antd-mask-input';

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
  notification,
  Popconfirm,
  Tooltip
} from 'antd';

import { FaCog, FaEye, FaFileAlt, FaPlus, FaTimes } from 'react-icons/fa';
import {
  DownOutlined
} from '@ant-design/icons';

import { v4 as uuid } from 'uuid';

import _ from 'lodash';


import { endOfDay, format, formatDistanceStrict, startOfDay } from 'date-fns';
import generateToken from 'hooks/generateToken';
import { maskCEP, maskMoney, maskOnlyNumbers, maskDate, maskOnlyLetters } from 'hooks/mask';
import axios from 'axios';
import { validarData } from 'hooks/validate';
import { useTheme } from 'styled-components';
import ModalSeguro from 'components/Modal/seguro';

import jsonComposto from '../../data/jsonComposto.json';
function juroComposto({ parcela, percentual }) {
  return jsonComposto[percentual][parcela];
}

const ContentEndosso = ({ data, type, businessInfo, theme }) => {
  const [state, setState] = useState({
    segurado: data.segurado,
    placa: data.veiculo.placa,
    veiculo: data.veiculo.veiculo,
    condutor: data.veiculo.condutor,
    tipoValor: '+',
    valor: 0,
    percentual: data.valores.percentual,
    comissao: 0,
    cep: data.endereco.cep,
    bairro: data.endereco.bairro,
    cidade: data.endereco.cidade,
    estado: data.endereco.estado,
    franquia: maskMoney(String(data.valores.franquia)),
    modelo: data.veiculo.modelo
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
    }
  }, [state.cep]);

  useEffect(() => {
    setState(e => ({...e, comissao: Number((Number(String(state.valor).split('.').join('').split(',').join('.')) / 100) * Number(state.percentual))}))
  }, [state.valor, state.percentual]);

  async function confirmarEndosso() {
    if((type === 'VE??CULO' || type === 'GERAL')) {
      if(!state.veiculo || !state.placa) {
        notification.warn({
          message: 'PREENCHA TODOS OS CAMPOS!'
        });
        
        return;
      }
    }

    if(type === 'ENDERE??O') {
      if(!state.cep || !state.cidade || !state.estado) {
        notification.warn({
          message: 'PREENCHA TODOS OS CAMPOS!'
        });
        
        return;
      }
    }

    if(state.valor === null || state.percentual === null || state.comissao === null) {
      notification.warn({
        message: 'PREENCHA TODOS OS CAMPOS!'
      });

      return;
    }

    const valorEndosso = state.tipoValor === '+' ? Number(String(state.valor).split('.').join('').split(',').join('.')) : -Number(String(state.valor).split('.').join('').split(',').join('.'));
    const comissaoEndosso = state.tipoValor === '+' ? state.comissao : -state.comissao;

    const dados = {
      valores: {
        franquia: Number(String(state.franquia).split('.').join('').split(',').join('.')),
        premio: firebase.firestore.FieldValue.increment(valorEndosso),
        comissao: firebase.firestore.FieldValue.increment(comissaoEndosso),
      },
      endossos: firebase.firestore.FieldValue.arrayUnion({
        uid: uuid(),
        segurado: state.segurado,
        valores: {
          valor: valorEndosso,
          percentual: Number(state.percentual),
          comissao: comissaoEndosso,
        },
        created: new Date(),
        tipo: type,
        veiculo: {
          placa: state.placa || null,
          condutor: state.condutor || null,
          veiculo: state.veiculo || null,
          modelo: state.modelo || null,
        },
        endereco: {
          cep: state.cep || null,
          bairro: state.bairro || null,
          cidade: state.cidade || null,
          estado: state.estado || null,
        }
      })
    }

    if((type === 'VE??CULO' || type === 'GERAL')) {
      dados.veiculo = {
        placa: state.placa,
        condutor: state.condutor,
        veiculo: state.veiculo,
        modelo: state.modelo,
      };
    }

    if(type === 'ENDERE??O') {
      dados.endereco = {
        cep: state.cep,
        bairro: state.bairro,
        cidade: state.cidade,
        estado: state.estado,
      }
    }

    await firebase.firestore().collection('seguros').doc(data.uid).set(dados, { merge: true })
    .then(async () => {
      if(data.corretor) {
        await firebase.firestore().collection('relatorios').doc('seguros').collection('corretor').doc(data.corretor.uid).set({
          valores: {
            premio: firebase.firestore.FieldValue.increment(valorEndosso),
            comissao: firebase.firestore.FieldValue.increment(comissaoEndosso),
          }
        }, { merge: true });
      }

      await firebase.firestore().collection('relatorios').doc('seguros').collection('corretora').doc(data.corretora.uid).set({
        valores: {
          premio: firebase.firestore.FieldValue.increment(valorEndosso),
          comissao: firebase.firestore.FieldValue.increment(comissaoEndosso),
        }
      }, { merge: true });

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
        <Col span={24}>
          <label>SEGURADO:</label>
          <Input value={data.segurado.nome} readOnly style={{ width: '100%', textTransform: 'uppercase' }} />
        </Col>  
        {(type === 'VE??CULO' || type === 'GERAL') && (
          <>
            <Col span={5}>
              <label>PLACA:</label>
              <Input id='placaModalEndosso' onPressEnter={() => document.getElementById('veiculoModalEndosso').focus()} value={state.placa} maxLength={7} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='AAA0000' onChange={(e) => setState(resp => ({ ...resp, placa: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={6}>
              <label>VE??CULO:</label>
              <Input id='veiculoModalEndosso' onPressEnter={() => document.getElementById('anoModeloVeiculoModalEndosso').focus()} value={state.veiculo} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='NOME DO VE??CULO' onChange={(e) => setState(resp => ({ ...resp, veiculo: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={6}>
              <label>ANO DO MODELO:</label>
              <Input id='anoModeloVeiculoModalEndosso' onPressEnter={() => document.getElementById('condutorModalEndosso').focus()} value={state.modelo} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='NOME DO VE??CULO' onChange={(e) => setState(resp => ({ ...resp, modelo: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={7}>
              <label>FRANQUIA:</label>
              <Input value={state.franquia} prefix='R$' style={{ textTransform: 'uppercase' }} onChange={(e) => setState(resp => ({ ...resp, franquia: !e.target.value ? null : maskMoney(e.target.value) }))} />
            </Col>
            <Col span={24}>
              <label>CONDUTOR:</label>
              <Input id='condutorModalEndosso' value={state.condutor} onPressEnter={() => type === 'GERAL' ? document.getElementById('cepModalEndosso').focus() : document.getElementById('valorModalEndosso').focus()} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='NOME DO CONDUTOR' onChange={(e) => setState(resp => ({ ...resp, condutor: maskOnlyLetters(String(e.target.value).toUpperCase()) }))} />
            </Col>  
          </>
        )}
        {(type === 'ENDERE??O' || type === 'GERAL') && (
          <>
            <Col span={6}>
              <label>CEP:</label>
              <Input id='cepModalEndosso' onPressEnter={() => document.getElementById('bairroModalEndosso').focus()} value={state.cep} autoComplete='off' maxLength={9} style={{ textTransform: 'uppercase' }} onChange={(e) => setState(resp => ({ ...resp, cep: maskCEP(e.target.value) }))} placeholder='CEP' />
            </Col>
            <Col span={6}>
              <label>BAIRRO:</label>
              <Input id='bairroModalEndosso' onPressEnter={() => document.getElementById('cidadeModalEndosso').focus()} value={state.bairro} autoComplete='off' style={{ textTransform: 'uppercase' }} placeholder='BAIRRO' onChange={(e) => setState(resp => ({ ...resp, bairro: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={6}>
              <label>CIDADE:</label>
              <Input id='cidadeModalEndosso' onPressEnter={() => document.getElementById('estadoModalEndosso').focus()} value={state.cidade} autoComplete='off' style={{ textTransform: 'uppercase' }} placeholder='CIDADE' onChange={(e) => setState(resp => ({ ...resp, cidade: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={6}>
              <label>ESTADO:</label>
              <Input id='estadoModalEndosso' onPressEnter={() => document.getElementById('valorModalEndosso').focus()} value={state.estado} autoComplete='off' style={{ textTransform: 'uppercase' }} placeholder='ESTADO' onChange={(e) => setState(resp => ({ ...resp, estado: String(e.target.value).toUpperCase() }))} />
            </Col>
          </>
        )}
        <Col span={8}>
          <label>VALOR DO ENDOSSO:</label>
          <Input value={state.valor} type='tel' id='valorModalEndosso' onPressEnter={() => document.getElementById('comissaoModalEndosso').focus()} addonBefore={(
            <Select value={state.tipoValor} showArrow={false} className='select-after' onChange={(e) => setState(resp => ({...resp, tipoValor: e}))}>
              <Select.Option value='+'>+</Select.Option>
              <Select.Option value='-'>-</Select.Option>
            </Select>
          )} autoComplete='off' style={{ textTransform: 'uppercase' }} prefix='R$' placeholder='0' onChange={(e) => setState(resp => ({ ...resp, valor: !e.target.value ? null : maskMoney(maskOnlyNumbers(e.target.value)) }))} />
        </Col>
        <Col span={8}>
          <label>COMISS??O:</label>
          <Input id='comissaoModalEndosso' value={state.percentual} type='tel' prefix='%' autoComplete='off' maxLength={2} max={99} style={{ textTransform: 'uppercase' }} placeholder='0' onChange={(e) => setState(resp => ({ ...resp, percentual: !e.target.value ? null : maskOnlyNumbers(e.target.value) }))} />
        </Col>
        <Col span={8}>
          <label>COMISS??O: </label>
          <Input addonBefore={(
            <Select value={state.tipoValor} showArrow={false} className='select-after'>
              <Select.Option value='+'>+</Select.Option>
              <Select.Option value='-'>-</Select.Option>
            </Select>
          )} value={!state.comissao ? 0 : Number(state.comissao).toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} type='tel' readOnly prefix='R$' autoComplete='off' style={{ textTransform: 'uppercase' }} placeholder='0' />
        </Col>
      </Row>
      <Divider />
      <div style={{ float: 'right' }}>
        <Button onClick={() => Modal.destroyAll()} style={{ border: '1px solid black', outline: 'none', color: 'black' }}>FECHAR</Button>
        <Button style={{ background: theme.colors[businessInfo.layout.theme].primary, color: 'white', border: 'none', outline: 'none', marginLeft: 10, fontWeight: 'bold' }} onClick={confirmarEndosso}>CONFIRMAR</Button>
      </div>
    </>
  )
}

const TableSeguro = ({ corretor, seguradora, date, infiniteData, limit, cpf, placa, corretora, user, seguros, setSeguros, businessInfo, nameFirst, header }) => {
  const [loadingData, setLoadingData] = useState(false);

  const [lastData, setLastData] = useState(0);

  const [viewButtonMore, setViewButtonMore] = useState(false);
  const onSnapshot = useRef(null);

  const listLimitDefault = 10;

  const theme = useTheme();

  useEffect(() => {
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
  }, [cpf, placa, seguradora, corretor, date]);

  useEffect(() => {
    getCotacao('init');
  }, []);

  const getCotacao = async (init) => {
    if(onSnapshot.current) {
      onSnapshot.current();
    }
    await setLastData(0);
    if(init) {
      await setSeguros([]); 
    }

    let ref = firebase.firestore().collection('seguros').where('ativo', '==', true);

    if(date) {
      ref = ref.where('seguro.vigenciaFinal', '>=', startOfDay(new Date(date[0].toDate())));
      ref = ref.where('seguro.vigenciaFinal', '<=', endOfDay(new Date(date[1].toDate())));
    }else {
      ref = ref.where('seguro.vigenciaFinal', '>=', new Date());
    }

    ref = ref.orderBy('seguro.vigenciaFinal', 'asc');

    if(user.tipo !== 'corretor') {
      ref = ref.where('corretora.uid', '==', corretora);
    }else {
      ref = ref.where('corretor.uid', '==', user.uid);
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

    const unsubscribe = ref.limit(((cpf !== undefined && cpf.length === 14) || (placa !== undefined && placa.length === 7) || (corretor !== undefined && corretor !== null) || (seguradora !== undefined && seguradora !== null)  || (date && (date[0] && date[1]))) ? 10000 : limit || listLimitDefault)
    .onSnapshot((snap) => {
      setViewButtonMore(false);

      if(!snap.empty) {
        const array = [];

        snap.forEach((item) => {
          array.push(item.data());
        });

        if(snap.docs[snap.docs.length - 1]) {
          setLastData(snap.docs[snap.docs.length - 1]);
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
  
          return objetos;
        });

        if(array.length === (limit || listLimitDefault)) {
          setViewButtonMore(true);
        }
      }
    });

    onSnapshot.current = unsubscribe;

    setLoadingData(true);
  }

  const cancelarSeguro = (dados) => {
    let dateCancel = null;

    const modal = Modal.confirm({
      width: '50%',
      title: 'DESEJA REALMENTE CANCELAR O SEGURO?',
      closable: true,
      content: [
        <>
          <h3>
            Ao confirmar a a????o n??o ser?? poss??vel desfazer a mesma
          </h3>
          <br/>
          <Row gutter={[0, 20]}>
            <Col span={12}>
              <b>SEGURADO:</b>
              <br/>
              {dados.segurado.nome}
            </Col>
            <Col span={12}>
              <b>SEGURADORA:</b>
              <br/>
              {dados.seguradora.razao_social}
            </Col>
            <Col span={12}>
              <b>PLACA:</b>
              <br/>
              {dados.veiculo.placa}
            </Col>
            <Col span={12}>
              <b>VE??CULO:</b>
              <br/>
              {dados.veiculo.veiculo}
            </Col>
            <Col span={12}>
              <b>DATA DE INICIO:</b>
              <br/>
              {format(dados.seguro.vigencia.toDate(), 'dd/MM/yyyy')}
            </Col>
            <Col span={12}>
              <b>DATA DO CANCELAMENTO:</b>
              <br/>
              <MaskedInput mask='11/11/1111' placeholderChar={null} type='tel' onChange={(e) => {
                if(e.target.value) {
                  const data = maskDate(e.target.value);
                  dateCancel = data;
                  
                  if(validarData(data)) {
                    const dia = dateCancel.split('/')[0];
                    const mes = dateCancel.split('/')[1];
                    const ano = dateCancel.split('/')[2];

                    const dataCancelamento = new Date(ano, (mes - 1), dia);
                    const dataVigencia = dados.seguro.vigenciaFinal.toDate();

                    const daysDistance = Number(formatDistanceStrict(dataCancelamento, dataVigencia, { unit: 'day', roundingMethod: 'floor' }).split(' ')[0]) - 1;
                  
                    const valorDay = dados.valores.comissao / 365;

                    const proporcaoValorDay = valorDay * daysDistance;
                  }
                }else {
                  dateCancel = '';
                }
              }} autoComplete='off' />
            </Col>
          </Row>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', float: 'right' }}>
            <div>
              <Button onClick={() => modal.destroy()}
                style={{
                  border: '1px solid black',
                  outline: 'none',
                  color: 'black'
                }}
              >
                FECHAR
              </Button>
              <Button
                style={{
                  marginLeft: 10,
                  background: theme.colors[businessInfo.layout.theme].primary,
                  color: '#FFFFFF',
                  border: 'none',
                  outline: 'none'
                }}
                onClick={async () => {
                  if(!validarData(dateCancel)) {
                    notification.destroy();
                    notification.warn({
                      message: 'PREENCHA A DATA DE CANCELAMENTO!'
                    });

                    return;
                  }

                  const dateNew = new Date(String(dateCancel).split('/')[2], String(dateCancel).split('/')[1] - 1, String(dateCancel).split('/')[0]);

                  if(dateNew > new Date()) {
                    notification.destroy();
                    notification.warn({
                      message: 'DATA N??O PODE SER SUPERIOR AO DIA ATUAL!'
                    });

                    return;
                  }

                  await firebase.firestore().collection('seguros').doc(dados.uid).set({
                    ativo: false,
                    cancelada: dateNew
                  }, { merge: true })
                  .then(async () => {
                    if(dados.corretor) {
                      await firebase.firestore().collection('relatorios').doc('seguros').collection('corretor').doc(dados.corretor.uid).set({
                        total: firebase.firestore.FieldValue.increment(-1),
                        valores: {
                          premio: firebase.firestore.FieldValue.increment(-dados.valores.premio),
                          comissao: firebase.firestore.FieldValue.increment(-dados.valores.comissao),
                        }
                      }, { merge: true });
                    }

                    if(dados.corretora) {
                      await firebase.firestore().collection('relatorios').doc('seguros').collection('corretora').doc(dados.corretora.uid).set({
                        total: firebase.firestore.FieldValue.increment(-1),
                        valores: {
                          premio: firebase.firestore.FieldValue.increment(-dados.valores.premio),
                          comissao: firebase.firestore.FieldValue.increment(-dados.valores.comissao),
                        }
                      }, { merge: true });
                    }

                    modal.destroy();

                    setSeguros(resp => resp.filter(e => e.uid !== dados.uid));
                  });
                }}
              >
                CONFIRMAR
              </Button>
            </div>
          </div>
        </>
      ],
      okButtonProps: {
        style: {
          display: 'none'
        }
      },
      cancelButtonProps: {
        style: {
          display: 'none'
        }
      }
    })
  }

  const endossoData = (data, type) => {
    Modal.confirm({
      icon: null,
      width: '50%',
      closable: true,
      title: [
        <>
          <h3 style={{ margin: 0 }}>ENDOSSO ({type})</h3>
          <Divider style={{ margin: 0, marginBottom: 10 }} />
        </>
      ],
      content: <ContentEndosso data={data} type={type} theme={theme} businessInfo={businessInfo} />,
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
      style: {
        top: 10,
      },
      closable: true,
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>ENDOSSO - {item.tipo}</h3>
                <h5>REGISTRO: {format(item.created.toDate(), 'dd/MM/yyyy')}</h5>
              </div>
              <Divider style={{ margin: 0, marginBottom: 10 }} />
              <Row gutter={[20, 20]}>
                <Col span={24}>
                  <label>SEGURADO:</label>
                  <Input value={dados.segurado.nome} style={{ width: '100%', textTransform: 'uppercase' }} readOnly />
                </Col>  
                {(item.tipo === 'VE??CULO' || item.tipo === 'GERAL') && (
                  <>
                    <Col span={8}>
                      <label>PLACA:</label>
                      <Input value={item.veiculo.placa} style={{ width: '100%', textTransform: 'uppercase' }} readOnly />
                    </Col>
                    <Col span={16}>
                      <label>VE??CULO:</label>
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
                {(item.tipo === 'ENDERE??O' || item.tipo === 'GERAL') && (
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
                <Col span={8}>
                  <label>VALOR DO ENDOSSO:</label>
                  <Input className={`${item.valores.valor < 0 ? 'text-danger' : item.valores.valor > 0 && 'text-success'}`} value={Number(Math.abs(item.valores.valor)).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} prefix={`${item.valores.valor < 0 ? '-' : item.valores.valor > 0 && '+'}R$`} style={{ textTransform: 'uppercase' }} readOnly />
                </Col>
                <Col span={8}>
                  <label>COMISS??O:</label>
                  <Input value={Number(item.valores.percentual).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} prefix='%' style={{ textTransform: 'uppercase' }} readOnly />
                </Col>
                <Col span={8}>
                  <label>COMISS??O: </label>
                  <Input className={`${item.valores.comissao < 0 ? 'text-danger' : item.valores.valor > 0 && 'text-success'}`} value={Number(Math.abs(item.valores.comissao)).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} prefix={`${item.valores.valor < 0 ? '-' : item.valores.valor > 0 && '+'}R$`} style={{ textTransform: 'uppercase' }} readOnly />
                </Col>
              </Row>
            </div>
          ))}
          <div style={{ float: 'right' }}>
            <Button onClick={() => Modal.destroyAll()}
              style={{
                border: '1px solid black',
                outline: 'none',
                color: 'black'
              }}
            >FECHAR</Button>
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

  const expandedRowRender = (endossos, dadosSeguro) => {
    const columns = [
      { title: 'DATA', dataIndex: 'created', key: 'created', width: 100, render: (e) => format(e.toDate(), 'dd/MM/yyyy') },
      { title: 'TIPO', dataIndex: 'tipo', key: 'tipo', width: 100 },
      {
        title: 'DADOS',
        dataIndex: 'uid',
        key: 'uid',
        render: (uid, dados) => (
          <>
            {dados.tipo === 'ENDERE??O' ? (
              <>
                <span>
                  <b>ENDERE??O:</b>
                  <br/>
                  Bairro: {dados.endereco.bairro} | Cidade: {dados.endereco.cidade} | Estado: {dados.endereco.estado}
                </span>
              </>
            ) : (
              <>
                <span>
                  <b>VE??CULO:</b>
                  <br/>
                  Ve??culo: {dados.veiculo.modelo} | Placa: {dados.veiculo.placa} | Condutor: {(dados.veiculo.condutor === 'O MESMO' || dados.veiculo.condutor === null || dados.veiculo.condutor === '') ? dados.segurado && dados.segurado.nome : dados.veiculo.condutor}
                </span>
              </>
            )}
          </>
        )
      },
      {
        title: <span style={{ float: 'right' }}>PR??MIO L??QUIDO | COMISS??O</span>,
        dataIndex: 'valores',
        key: 'valores',
        width: 300,
        render: (valores, dados) => (
          <div style={{ float: 'right', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'left', gap: '1rem' }}>
            <div>
              <span style={{ color: valores.valor < 0 ? 'red' : valores.valor > 0 && 'green' }}>{valores.valor > 0 && '+'}{Number(valores.valor).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}</span> | {Number(valores.percentual).toFixed(0)}%
              <br/>
              <span style={{ fontSize: '.7rem' }}>comiss??o: <span style={{ color: valores.comissao < 0 ? 'red' : valores.valor > 0 && 'green' }}>{valores.comissao > 0 && '+'}{Number(valores.comissao).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}</span></span>
            </div>
            {dados.corretor && (
              <FaEye color='#999' cursor='pointer' />
            )}
          </div>
        )
      },
      {
        title: null,
        dataIndex: 'uid',
        key: 'uid',
        render: (uid, dados) => (
          <Popconfirm title='Deseja realmente deletar?' okText='DELETAR' cancelText='CANCELAR' onConfirm={async () => {
            const endossos = dadosSeguro.endossos.filter((e) => e.uid !== dados.uid);

            await firebase.firestore().collection('seguros').doc(dadosSeguro.uid).set({
              endossos
            }, { merge: true })
            .then(async () => {
              if(dadosSeguro.corretor) {
                await firebase.firestore().collection('relatorios').doc('seguros').collection('corretor').doc(dadosSeguro.corretor.uid).set({
                  valores: {
                    premio: firebase.firestore.FieldValue.increment(-dados.valores.valor),
                    comissao: firebase.firestore.FieldValue.increment(-dados.valores.comissao),
                  }
                }, { merge: true });
              }

              if(dadosSeguro.corretora) {
                await firebase.firestore().collection('relatorios').doc('seguros').collection('corretora').doc(dadosSeguro.corretora.uid).set({
                  valores: {
                    premio: firebase.firestore.FieldValue.increment(-dados.valores.valor),
                    comissao: firebase.firestore.FieldValue.increment(-dados.valores.comissao),
                  }
                }, { merge: true });
              }
            });
          }}>
            <FaTimes color='red' cursor='pointer' />
          </Popconfirm>
        )
      }
    ];

    return <Table columns={columns} dataSource={endossos} pagination={false} />;
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
  const [visibleModalSeguro, setVisibleModalSeguro] = useState(false);

  const verAjuste = async (dados) => {
    await setDataSeguroView((e) => ({
      uid: dados.uid,
      search: true,
      placa: dados.veiculo.placa,
      corretorUid: dados.corretor ? dados.corretor.uid : null,
      seguradora: dados.seguradora ? dados.seguradora.uid : null,
      vigencia: format(dados.seguro.vigencia.toDate(), 'dd/MM/yyyy'),
      vigenciaFinal: format(dados.seguro.vigenciaFinal.toDate(), 'dd/MM/yyyy'),
      premio: Number(dados.valores.premio).toLocaleString('pt-br', {minimumFractionDigits: 2}),
      franquia: Number(dados.valores.franquia).toLocaleString('pt-br', {minimumFractionDigits: 2}),
      comissao: dados.valores.comissao,
      percentual: dados.valores.percentual,
      nome: dados.segurado.nome,
      anoAdesao: dados.segurado.anoAdesao,
      veiculo: dados.veiculo.veiculo,
      telefone: dados.segurado.telefone,
      cpf: dados.segurado.cpf,
      condutor: dados.veiculo.condutor,
      cep: dados.endereco.cep,
      bairro: dados.endereco.bairro,
      cidade: dados.endereco.cidade,
      estado: dados.endereco.estado,
      parcelas: dados.valores.parcelas,
      comissaoCorretor: dados.corretor ? dados.valores.corretor.percentual : null,
      comissaoCorretorValor: dados.corretor ? dados.valores.corretor.valor : null,
      comissaoCorretora: dados.valores.corretora.percentual,
      comissaoCorretoraValor: dados.valores.corretora.valor,
      profissao: dados.segurado.profissao || 'OUTROS',
      usoVeiculo: dados.riscos?.usoVeiculo || 'OUTROS',
      modelo: dados.veiculo.modelo || null,
      juros: dados.valores?.juros || null
    }));

    setVisibleModalSeguro(true);
  }
  
  return (
    <>
      <ModalSeguro data={dataSeguroView} visible={visibleModalSeguro} setVisible={setVisibleModalSeguro} />
      <Table
        dataSource={seguros?.map(item => ({...item, key: generateToken() })).sort((a, b) => a.segurado.nome.toLowerCase().localeCompare(b.segurado.nome.toLowerCase())).sort((a, b) => a.seguro.vigenciaFinal - b.seguro.vigenciaFinal)}
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
        expandable={{
          rowExpandable: record => [...record.endossos || []].length > 0,
          expandedRowRender: record => (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'left',
                  alignItems: 'center',
                  color: '#444',
                  background: '#F1F1F1',
                  padding: '1rem'
                }}
              >
                <FaFileAlt style={{ marginRight: 10 }} /> <span style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>DADOS DOS ENDOSSOS</span>
              </div>
              {expandedRowRender([...record.endossos || []].sort((a, b) => b.created - a.created), record)}
            </>
          )
        }}
        title={header}
      >
        <Table.Column
          width={300}
          key='segurado'
          dataIndex='segurado'
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
                  DESDE {segurado.anoAdesao}
                </span>
              )}
              <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1 }}>
                {segurado ? String(segurado.nome).split(' ').slice(0, nameFirst ? 1 : 3).join(' ') : '000000000'}
              </div>
            </>
          )}
        />
        {(user.tipo === 'administrador' && !corretor) && (
          <Table.Column
            width={200}
            key='corretor'
            dataIndex='corretor'
            title={
              [
                <div className={!loadingData && 'skeleton'}>
                  PRODUTOR
                </div>
              ]
            }
            render={(corretor) => (
              <>
                <div className={!loadingData && 'skeleton'}>
                  {corretor ? String(corretor.nome) : `-------------`}
                </div>
              </>
            )}
          />
        )}
        {!corretor && (
          <Table.Column
            key='veiculo'
            width={120}
            dataIndex='veiculo'
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
        )}
        {!corretor && (
          <Table.Column
            key='seguradora'
            dataIndex='seguradora'
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
        )}
        <Table.Column
          width={220}
          key='seguro'
          dataIndex='seguro'
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                VIG??NCIA
              </div>
            ]
          }
          render={(seguro) => seguro && (
            <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1 }}>
              {format(seguro.vigencia.toDate(), 'dd/MM/yyyy')}
              <br/>
              <span style={{ fontSize: '.7rem' }}>AT??: {format(seguro.vigenciaFinal.toDate(), 'dd/MM/yyyy')}</span>
            </div>
          )}
        />
        <Table.Column
          width={300}
          key='valores'
          dataIndex='valores'
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                PR??MIO L??QUIDO {!corretor && '| COMISS??O'}
              </div> 
            ]
          }
          render={(valores, dados) => valores && (
            <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'left', gap: '1rem' }}>
              <div>
                {Number(valores.premio).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })} | {Number(valores.percentual).toFixed(0)}%
                <br/>
                <span style={{ fontSize: '.7rem' }}>COMISS??O: {Number(valores.comissao).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}</span>
              </div>
            </div>
          )}
        />
        {corretor && (
          <Table.Column
            width={300}
            key='valores'
            dataIndex='valores'
            title={
              [
                <div className={!loadingData && 'skeleton'}>
                  VALOR L??QUIDO | COMISS??O
                </div> 
              ]
            }
            render={(valores, dados) => valores.corretor && (
              <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'left', gap: '1rem' }}>
                <div>
                  {Number(valores.corretor.valor).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}
                  {valores.parcelas > 4 && (
                    <sup
                      style={{ color: 'red' }}
                    >
                      - R$ {new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(Number(valores.corretor.valor - valores.corretor.valor * juroComposto({
                        parcela: String(valores.parcelas),
                        percentual: String(valores.juros || 0)
                      })))}
                    </sup>
                  )}
                  <br/>
                  <span style={{ fontSize: '.7rem' }}>
                    TOTAL: {Number(valores.parcelas > 4 ? Number(valores.corretor.valor * juroComposto({
                      parcela: String(valores.parcelas),
                      percentual: String(valores.juros || 0)
                    })) : valores.corretor.valor).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}
                  </span>
                </div>
                {dados.corretor && (
                  <Tooltip
                    style={{
                      width: 300
                    }}
                    title={(
                      <div style={{ width: 200 }}>
                        <center>
                          DESCRI????O
                        </center>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          -------------------------
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 7, paddingRight: 7 }}>
                            <div>COMISS??O:</div>
                            <div>
                              {new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2, currency: 'BRL', style: 'currency' }).format(valores.corretor.valor)}
                            </div>
                          </div>
                          {valores.parcelas && (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'center' }}>
                                -------------------------
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 7, paddingRight: 7 }}>
                                <div>PARCELAS:</div>
                                <div>
                                  {valores.parcelas}X
                                </div>
                              </div>
                              {valores.parcelas > 4 && (
                                <>
                                  {/*
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 7, paddingRight: 7 }}>
                                      <div>JUROS:</div>
                                      <div>
                                        {new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(valores.juros)}%
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                      -------------------------
                                    </div>
                                  */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 7, paddingRight: 7 }}>
                                    <div>DESCONTO:</div>
                                    <div>
                                      - {new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2, currency: 'BRL', style: 'currency' }).format(valores.corretor.valor - valores.corretor.valor * juroComposto({
                                          parcela: String(valores.parcelas),
                                          percentual: String(valores.juros || 0)
                                        }))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            -------------------------
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 7, paddingRight: 7 }}>
                            <div>TOTAL</div>
                            <div>
                              {new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2, currency: 'BRL', style: 'currency' }).format(valores.parcelas > 4 ? valores.corretor.valor * juroComposto({
                                parcela: String(valores.parcelas),
                                percentual: String(valores.juros || 0)
                              }) : valores.corretor.valor)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  >
                    <FaEye color='#999' cursor='pointer' />
                  </Tooltip>
                )}
              </div>
            )}
          />
        )}
        <Table.Column
          width={200}
          key='uid'
          dataIndex='uid'
          title={
            [
              <div style={{width: !loadingData && 70, height: !loadingData && 23}} className={!loadingData && 'skeleton'}>
                {loadingData && (
                  <center>
                    A????O
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
                          <Menu.Item icon={<FaFileAlt />} onClick={() => endossoData(dados, 'VE??CULO')}>
                            ENDOSSO DO VE??CULO | CONDUTOR
                          </Menu.Item>
                          <Menu.Item icon={<FaFileAlt />} onClick={() => endossoData(dados, 'ENDERE??O')}>
                            ENDOSSO DO ENDERE??O
                          </Menu.Item>
                          <Menu.Item icon={<FaFileAlt />} onClick={() => cancelarSeguro(dados)}>
                            ENDOSSO DE CANCELAMENTO
                          </Menu.Item>
                          {dados.endossos?.length > 0 && (
                            <Menu.Item icon={<FaFileAlt />} onClick={() => verEndossos(dados)}>
                              REGISTROS DE ENDOSSOS
                            </Menu.Item>
                          )}
                          <Menu.Item icon={<FaCog />} onClick={async () => {
                            await verAjuste(dados);
                          }}>
                            AJUSTE GERAL
                          </Menu.Item>
                        </Menu>
                      )}>
                        <Button block
                          style={{
                            border: '1px solid black',
                            outline: 'none',
                            color: 'black'
                          }}
                        >
                          OP????ES <DownOutlined />
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
      {(infiniteData === false && viewButtonMore === true) && (
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