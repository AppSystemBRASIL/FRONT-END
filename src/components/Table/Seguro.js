import { useEffect, useRef, useState } from 'react';

import firebase from '../../auth/AuthConfig';

import MaskedInput from 'antd-mask-input';

import {
  Button, Col, Divider, Dropdown, Empty, Input, Menu,
  Modal, notification,
  Popconfirm, Row, Select, Table, Tag, Tooltip
} from 'antd';

import {
  DownOutlined
} from '@ant-design/icons';
import { FaCog, FaEye, FaFileAlt, FaPlus, FaPrint, FaTimes } from 'react-icons/fa';

import { v4 as uuid } from 'uuid';


import ModalSeguro from 'components/Modal/seguro';
import { endOfDay, format, formatDistanceStrict, startOfDay } from 'date-fns';
import generateToken from 'hooks/generateToken';
import { maskCEP, maskDate, maskMoney, maskOnlyLetters, maskOnlyNumbers } from 'hooks/mask';
import { validarData } from 'hooks/validate';
import { useTheme } from 'styled-components';

import axios from 'axios';

import { utcToZonedTime } from 'date-fns-tz';
import { verSolicitacaoCotacao } from 'functions';
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
    if((type === 'VEÍCULO' || type === 'GERAL')) {
      if(!state.veiculo || !state.placa) {
        notification.warn({
          message: 'PREENCHA TODOS OS CAMPOS!'
        });
        
        return;
      }
    }

    if(type === 'ENDEREÇO') {
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

    if((type === 'VEÍCULO' || type === 'GERAL')) {
      dados.veiculo = {
        placa: state.placa,
        condutor: state.condutor,
        veiculo: state.veiculo,
        modelo: state.modelo,
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

    Modal.confirm({
      title: 'Deseja realmente confirmar o registro do endosso',
      content: 'Lembrando que ao confirmar a operação não será possível reverter, a não ser que exclua o registro.',
      okButtonProps: {
        background: theme.colors[businessInfo.layout.theme].primary,
        color: 'white',
        border: 'none',
        outline: 'none',
        marginLeft: 10,
        fontWeight: 'bold'
      },
      cancelButtonProps: {
        border: '1px solid black',
        outline: 'none',
        color: 'black'
      },
      okText: 'CONFIRMAR',
      cancelText: 'FECHAR',
      onOk: async () => await firebase.firestore().collection('seguros').doc(data.uid).set(dados, { merge: true })
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
    });
  }

  return (
    <>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <label>SEGURADO:</label>
          <Input value={data.segurado.nome} readOnly style={{ width: '100%', textTransform: 'uppercase' }} />
        </Col>  
        {(type === 'VEÍCULO' || type === 'GERAL') && (
          <>
            <Col span={5}>
              <label>PLACA:</label>
              <Input id='placaModalEndosso' onPressEnter={() => document.getElementById('veiculoModalEndosso').focus()} value={state.placa} maxLength={7} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='AAA0000' onChange={(e) => setState(resp => ({ ...resp, placa: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={6}>
              <label>VEÍCULO:</label>
              <Input id='veiculoModalEndosso' onPressEnter={() => document.getElementById('anoModeloVeiculoModalEndosso').focus()} value={state.veiculo} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='NOME DO VEÍCULO' onChange={(e) => setState(resp => ({ ...resp, veiculo: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={6}>
              <label>ANO DO MODELO:</label>
              <Input id='anoModeloVeiculoModalEndosso' onPressEnter={() => document.getElementById('franquiaModalEndosso').focus()} value={state.modelo} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='NOME DO VEÍCULO' onChange={(e) => setState(resp => ({ ...resp, modelo: String(e.target.value).toUpperCase() }))} />
            </Col>
            <Col span={7}>
              <label>FRANQUIA:</label>
              <Input id='franquiaModalEndosso' value={state.franquia} prefix='R$' style={{ textTransform: 'uppercase' }} onPressEnter={() => document.getElementById('condutorModalEndosso').focus()} onChange={(e) => setState(resp => ({ ...resp, franquia: !e.target.value ? null : maskMoney(e.target.value) }))} />
            </Col>
            <Col span={24}>
              <label>CONDUTOR:</label>
              <Input id='condutorModalEndosso' value={state.condutor} onPressEnter={() => type === 'GERAL' ? document.getElementById('cepModalEndosso').focus() : document.getElementById('valorModalEndosso').focus()} autoComplete='off' style={{ width: '100%', textTransform: 'uppercase' }} type='text' placeholder='NOME DO CONDUTOR' onChange={(e) => setState(resp => ({ ...resp, condutor: maskOnlyLetters(String(e.target.value).toUpperCase()) }))} />
            </Col>  
          </>
        )}
        {(type === 'ENDEREÇO' || type === 'GERAL') && (
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
          <label>COMISSÃO:</label>
          <Input id='comissaoModalEndosso' value={state.percentual} type='tel' prefix='%' autoComplete='off' maxLength={2} max={99} style={{ textTransform: 'uppercase' }} placeholder='0' onChange={(e) => setState(resp => ({ ...resp, percentual: !e.target.value ? null : maskOnlyNumbers(e.target.value) }))}
            onPressEnter={confirmarEndosso}
          />
        </Col>
        <Col span={8}>
          <label>COMISSÃO: </label>
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

const TableSeguro = ({ placaPremiada, anoAdesao, segurado, corretor, seguradora, date, infiniteData, limit, cpf, placa, corretora, user, seguros, setSeguros, businessInfo, header, pagination, cancel, externo, totalSegurados, totalSeguros }) => {
  const [loadingData, setLoadingData] = useState(false);

  const [lastData, setLastData] = useState(0);

  const [viewButtonMore, setViewButtonMore] = useState(false);
  const onSnapshot = useRef(null);

  const listLimitDefault = 10;

  const theme = useTheme();

  useEffect(() => {
    if(placaPremiada?.length === 3) {
      getCotacao('init');
    }else if((cpf.length === 14) || (placa.length === 7)) {
      getCotacao('init');
    }else if(cpf.length === 0) {
      if(placa.length >= 3 || placa.length === 0) {
        getCotacao('init');
      }
    }else if(placa.length === 0) {
      if(cpf.length === 14 || cpf.length === 0) {
        getCotacao('init');
      }
    }else if(anoAdesao) {
      getCotacao('init');
    }else if(segurado?.length > 3) {
      getCotacao('init');
    }
  }, [cpf, placa, seguradora, corretor, date, cancel, anoAdesao, segurado, placaPremiada]);

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

    let ref = firebase.firestore().collection('seguros').where('ativo', '==', cancel === undefined ? true : !cancel).where('externo', '==', externo === undefined ? false : externo);

    if(placaPremiada?.length === 3) {
      ref = ref.where('veiculo.placaQuery', '==', String(placaPremiada));
    }else {
      if(date) {
        ref = ref.where(cancel ? 'cancelada' : externo ? 'seguro.vigenciaFinal' : 'seguro.vigencia', '>=', startOfDay(new Date(date[0].toDate())));
        ref = ref.where(cancel ? 'cancelada' : externo ? 'seguro.vigenciaFinal' : 'seguro.vigencia', '<=', endOfDay(new Date(date[1].toDate())));
      }
  
      if(placa?.length >= 4) {
        ref = ref.orderBy('veiculo.placa', 'desc');
      }
  
      if(segurado?.length >= 3) {
        ref = ref.orderBy('segurado.nome', 'desc');
      }
  
      ref = ref.orderBy(cancel ? 'cancelada' : externo ? 'seguro.vigenciaFinal' : 'seguro.vigencia', 'asc');
  
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
  
      if(anoAdesao) {
        ref = ref.where('segurado.anoAdesao', '==', String(anoAdesao.year()));
      }
  
      if(segurado?.length > 3) {
        ref = ref.where('segurado.nome', '>=', String(segurado).toUpperCase()).where('segurado.nome', '<=', String(segurado).toUpperCase() + '~');
      }
  
      if(cpf !== undefined && cpf.length === 14) {
        ref = ref.where('segurado.cpf', '==', cpf);
        ref = ref.orderBy('created', 'desc');
      }else if(placa !== undefined && placa.length >= 4) {
        ref = ref.where('veiculo.placa', '>=', String(placa).toUpperCase()).where('veiculo.placa', '<=', String(placa).toUpperCase() + '~');
        ref = ref.orderBy('created', 'desc');
      }else if((!init && lastData !== 0)) {
        ref = ref.orderBy('created', 'asc');
        ref = ref.startAfter(lastData);
      }
    }

    const unsubscribe = ref.limit(((cpf !== undefined && cpf.length === 14) || (placa !== undefined && placa.length === 7) || (corretor !== undefined && corretor !== null) || (seguradora !== undefined && seguradora !== null)  || (date && (date[0] && date[1]))) || externo ? 10000 : limit || listLimitDefault)
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
            Ao confirmar a ação não será possível desfazer a mesma
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
              <b>VEÍCULO:</b>
              <br/>
              {dados.veiculo.veiculo}
            </Col>
            <Col span={12}>
              <b>DATA DE INICIO:</b>
              <br/>
              {format(utcToZonedTime(new Date(dados.seguro.vigencia.toDate()), 'America/Sao_Paulo'), 'dd/MM/yyyy')}
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
                      message: 'DATA NÃO PODE SER SUPERIOR AO DIA ATUAL!'
                    });

                    return;
                  }

                  const estorno = Math.abs((!dados.corretor ? dados.valores.comissao : dados.corretor.comissao.valor / 365) * Math.ceil((new Date(dados.seguro.vigencia.toDate()).getTime() - dateNew.getTime()) / (1000 * 3600 * 24)));

                  await firebase.firestore().collection('seguros').doc(dados.uid).set({
                    ativo: false,
                    cancelada: dateNew,
                    estorno
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
                <Col span={8}>
                  <label>VALOR DO ENDOSSO:</label>
                  <Input className={`${item.valores.valor < 0 ? 'text-danger' : item.valores.valor > 0 && 'text-success'}`} value={Number(Math.abs(item.valores.valor)).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} prefix={`${item.valores.valor < 0 ? '-' : item.valores.valor > 0 && '+'}R$`} style={{ textTransform: 'uppercase' }} readOnly />
                </Col>
                <Col span={8}>
                  <label>COMISSÃO:</label>
                  <Input value={Number(item.valores.percentual).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} prefix='%' style={{ textTransform: 'uppercase' }} readOnly />
                </Col>
                <Col span={8}>
                  <label>COMISSÃO: </label>
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
            {dados.tipo === 'ENDEREÇO' ? (
              <>
                <span>
                  <b>ENDEREÇO:</b>
                  <br/>
                  Bairro: {dados.endereco.bairro} | Cidade: {dados.endereco.cidade} | Estado: {dados.endereco.estado}
                </span>
              </>
            ) : (
              <>
                <span>
                  <b>VEÍCULO:</b>
                  <br/>
                  Veículo: {dados.veiculo.modelo} | Placa: {dados.veiculo.placa} | Condutor: {(dados.veiculo.condutor === 'O MESMO' || dados.veiculo.condutor === null || dados.veiculo.condutor === '') ? dados.segurado && dados.segurado.nome : dados.veiculo.condutor}
                </span>
              </>
            )}
          </>
        )
      },
      {
        title: <span style={{ float: 'right' }}>PRÊMIO LÍQUIDO | COMISSÃO</span>,
        dataIndex: 'valores',
        key: 'valores',
        width: 300,
        render: (valores, dados) => (
          <div style={{ float: 'right', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'left', gap: '1rem' }}>
            <div>
              <span style={{ color: valores.valor < 0 ? 'red' : valores.valor > 0 && 'green' }}>{valores.valor > 0 && '+'}{Number(valores.valor).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}</span> | {Number(valores.percentual).toFixed(0)}%
              <br/>
              <span style={{ fontSize: '.7rem' }}>comissão: <span style={{ color: valores.comissao < 0 ? 'red' : valores.valor > 0 && 'green' }}>{valores.comissao > 0 && '+'}{Number(valores.comissao).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}</span></span>
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
      vigencia: format(utcToZonedTime(new Date(dados.seguro.vigencia.toDate()), 'America/Sao_Paulo'), 'dd/MM/yyyy'),
      vigenciaFinal: format(utcToZonedTime(new Date(dados.seguro.vigenciaFinal.toDate()), 'America/Sao_Paulo'), 'dd/MM/yyyy'),
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
      usoVeiculo: dados.riscos?.usoVeiculo || String('lazer e ida e volta ao trabalho').toUpperCase(),
      modelo: dados.veiculo.modelo || null,
      juros: dados.valores?.juros || null
    }));

    setVisibleModalSeguro(true);
  }
  
  return (
    <>
      <ModalSeguro data={dataSeguroView} visible={visibleModalSeguro} setVisible={setVisibleModalSeguro} />
      <Table
        footer={() => (totalSeguros || totalSegurados) && (
          <>
            {(totalSeguros) && (
              <div>
                TOTAL DE SEGUROS: {String(totalSeguros).padStart(2, '0')}
              </div>
            )}
            {(totalSegurados) && (
              <div>
                TOTAL DE SEGURADOS: {String(totalSegurados).padStart(2, '0')}
              </div>
            )}
          </>
        )}
        dataSource={seguros?.map(item => ({...item, key: generateToken() })).sort((a, b) => a.segurado.nome.toLowerCase().localeCompare(b.segurado.nome.toLowerCase())).sort((a, b) => a.seguro.vigenciaFinal - b.seguro.vigenciaFinal)}
        pagination={pagination === undefined ? false : pagination}
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
              {(loadingData && segurado.anoAdesao) && (
                <span style={{ fontSize: '.6rem', position: 'absolute', bottom: 5, left: 16 }}>
                  DESDE {segurado.anoAdesao}
                </span>
              )}
              <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1 }}>
                {segurado ? String(segurado.nome).split(' ').slice(0, 2).join(' ') : '-----------------'}
              </div>
            </>
          )}
        />
        {((user.tipo === 'administrador' && !corretor) && (externo === undefined || externo === false)) && (
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
            render={(veiculo, dados) => (
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
                VIGÊNCIA
              </div>
            ]
          }
          render={(seguro, dados) => seguro && (
            <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1 }}>
              {format(utcToZonedTime(new Date(seguro.vigencia.toDate()), 'America/Sao_Paulo'), 'dd/MM/yyyy')}
              <br/>
              <span style={{ fontSize: '.7rem' }}>ATÉ: {format(utcToZonedTime(new Date(seguro.vigenciaFinal.toDate()), 'America/Sao_Paulo'), 'dd/MM/yyyy')}</span>
              {(dados.cancelada && !dados.ativo) && (
                <>
                  <br/>
                  <span style={{ fontSize: '.7rem' }}>CANCELADA: {format(new Date(dados.cancelada.toDate()), 'dd/MM/yyyy')}</span>
                </>
              )}
            </div>
          )}
        />
        {((externo === undefined || externo === false) && corretor !== 'null') && (
          <Table.Column
            width={300}
            key='valores'
            dataIndex='valores'
            title={
              [
                <div className={!loadingData && 'skeleton'}>
                  PRÊMIO LÍQUIDO {!corretor && '| COMISSÃO'}
                </div> 
              ]
            }
            render={(valores, dados) => valores && (
              <div className={!loadingData && 'skeleton'} style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'left', gap: '1rem' }}>
                <div>
                  {Number(valores.premio).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })} | {Number(valores.percentual).toFixed(0)}%
                  <br/>
                  <span style={{ fontSize: '.7rem' }}>COMISSÃO: {Number(valores.comissao).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}</span>
                </div>
              </div>
            )}
          />
        )}
        {((externo === undefined || externo === false) && corretor !== 'null') && (
          <Table.Column
            width={300}
            key='valores'
            dataIndex='valores'
            title={
              [
                <div className={!loadingData && 'skeleton'}>
                  VALOR LÍQUIDO | COMISSÃO
                </div> 
              ]
            }
            render={(valores, dados) => (valores?.corretor && valores?.corretor?.valor && valores?.juros) && (
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
                          DESCRIÇÃO
                        </center>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          -------------------------
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 7, paddingRight: 7 }}>
                            <div>COMISSÃO:</div>
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
        {(corretor !== 'null') && (
          <Table.Column
            width={200}
            key='uid'
            dataIndex='uid'
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
                            {dados?.externo ? (
                              <>
                                <Menu.Item icon={<FaPrint />} onClick={() => {
                                  verSolicitacaoCotacao(dados);
                                }}>
                                  IMPRIMIR
                                  {dados?.impresso && (
                                    <Tag
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        fontSize: 8
                                      }}
                                    >
                                      impresso
                                    </Tag>
                                  )}
                                </Menu.Item>
                                <Menu.Item icon={<FaTimes />} onClick={() => {
                                  Modal.confirm({
                                    title: 'DESEJA REALMENTE EXCLUIR',
                                    content: 'Se você excluir o registro, o mesmo não poderá ser recuperado.',
                                    cancelText: 'FECHAR',
                                    okText: 'EXCLUIR',
                                    okButtonProps: {
                                      style: {
                                        backgroundColor: theme.colors[businessInfo.layout.theme].primary,
                                        color: 'white',
                                        border: 'none'
                                      }
                                    },
                                    onOk: async () => {
                                      await firebase.firestore().collection('seguros').doc(uid).delete()
                                      .then(() => {
                                        window.location.reload();
                                      });
                                    }
                                  })
                                }}>
                                  EXCLUIR
                                </Menu.Item>
                              </>
                            ) : (
                              <>
                                {dados.ativo === true && (
                                  <>
                                    <Menu.Item icon={<FaFileAlt />} onClick={() => endossoData(dados, 'VEÍCULO')}>
                                      ENDOSSO DO VEÍCULO | CONDUTOR
                                    </Menu.Item>
                                    <Menu.Item icon={<FaFileAlt />} onClick={() => endossoData(dados, 'ENDEREÇO')}>
                                      ENDOSSO DO ENDEREÇO
                                    </Menu.Item>
                                    <Menu.Item icon={<FaFileAlt />} onClick={() => cancelarSeguro(dados)}>
                                      ENDOSSO DE CANCELAMENTO
                                    </Menu.Item>
                                  </>
                                )}
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
                              </>
                            )}
                          </Menu>
                        )}>
                          <Button block
                            style={{
                              border: '1px solid black',
                              outline: 'none',
                              color: 'black'
                            }}
                          >
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
        )}
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