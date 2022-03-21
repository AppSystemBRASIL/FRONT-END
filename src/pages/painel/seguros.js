import React, { useState, useEffect } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Input, Modal, DatePicker, Select, notification, Divider } from 'antd';

import TableSeguro from '../../components/Table/Seguro';

import { maskCEP, maskCPF, maskDate, maskMoney, maskOnlyLetters, maskOnlyNumbers, maskPhone, maskYear } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';
import { FaPlus, FaPrint } from 'react-icons/fa';

import firebase from '../../auth/AuthConfig';

import {
  
} from '../../hooks/mask'
import generateToken from 'hooks/generateToken';
import { addDays, addYears, endOfDay, format, setHours, setMinutes } from 'date-fns';
import axios from 'axios';
import printListSeguros from 'components/PDF/ListSeguros';

import { useTheme } from 'styled-components';
import { validateCPF } from 'hooks/validate';

const Seguro = () => {
  const { user, corretora, setCollapsedSideBar, businessInfo } = useAuth();

  const theme = useTheme();

  const [width, setwidth] = useState(0);

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
    setwidth(window.screen.width);
  }, []);

  const [cpf, setCPF] = useState('');
  const [placa, setPlaca] = useState('');

  const [seguradora, setSeguradora] = useState(null);
  const [corretor, setCorretor] = useState(null);

  const [date, setDate] = useState(null);

  const [totalSeguro, setTotalSeguro] = useState(0);
  const [totalPremio, setTotalPremio] = useState(0);
  const [totalComissao, setTotalComissao] = useState(0);

  const [viewNewSeguro, setViewNewSeguro] = useState(false);

  const [seguros, setSeguros] = useState([]);

  const [valoresIniciais, setValoresIniciais] = useState({
    seguros: 0,
    totalPremio: 0,
    totalComissao: 0,
  });

  const [dataNewSeguro, setDataNewSeguro] = useState({
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
  });

  useEffect(() => {
    if(user) {
      firebase.firestore().collection('relatorios').doc('seguros').collection(user.tipo !== 'corretor' ? 'corretora' : 'corretor').doc(user.tipo !== 'corretor' ? user.corretora.uid : user.uid).onSnapshot((response) => {
        if(response.exists) {
          const data = response.data();
  
          setValoresIniciais({
            seguros: data.total,
            totalPremio: data.valores.premio,
            totalComissao: data.valores.comissao,
          });
        }
      })
    }
  }, [user]);

  useEffect(() => {
    if(String(dataNewSeguro.cep).length === 9) {
      axios.get(`https://viacep.com.br/ws/${String(dataNewSeguro.cep).split('-').join('')}/json`, {
        headers: {
          'content-type': 'application/json;charset=utf-8',
        },
      })
      .then((response) => {
        const data = response.data;

        setDataNewSeguro(e => ({...e, bairro: data.bairro, cidade: data.localidade, estado: data.uf}))
      })
      .catch((error) => {
        console.log(error);
      })
    }
  }, [dataNewSeguro.cep])

  useEffect(() => {
    const dados = {
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

    if(user) {
      if(user.tipo === 'corretor') {
        dados.corretorUid = user.uid;
        dados.corretorDisplayName = user.displayName;
      }
    }

    setDataNewSeguro(dados);
  }, [viewNewSeguro, user]);

  const [seguradoras, setSeguradoras] = useState([]);
  const [corretores, setCorretores] = useState([]);

  useEffect(() => {
    if(user) {
      if(user.tipo === 'corretor') {
        setCorretor(user.uid);

        setDataNewSeguro(e => ({
          ...e,
          corretorUid: user.uid,
          corretorDisplayName: user.displayName
        }));
      }

      firebase.firestore().collection('seguradoras').get()
      .then((response) => {
        const array = [];

        if(!response.empty) {
          response.forEach(item => {
            array.push(item.data());
          })
        }

        setSeguradoras(array);
      })

      firebase.firestore().collection('usuarios').where('corretora.uid', '==', user.corretora.uid).get()
      .then((response) => {
        const array = [];

        if(!response.empty) {
          response.forEach(item => {
            array.push(item.data());
          })
        }

        setCorretores(array);
      })
    }
  }, [user]);

  useEffect(() => {
    setDataNewSeguro(e => ({
      ...e,
      comissao: Number((Number(String(dataNewSeguro.premio).split('.').join('').split(',').join('.')) / 100) * dataNewSeguro.percentual)
    }))
  }, [dataNewSeguro.premio, dataNewSeguro.percentual]);

  const printSeguros = async () => await printListSeguros(seguros, corretora, {
    date,
    corretor: !corretor ? null : corretor === 'null' ? corretora.razao_social : corretores.filter(e => e.uid === corretor)[0].displayName,
    seguradora: !seguradora ? null : seguradoras.filter(e => e.uid === seguradora)[0].razao_social.split(' ')[0],
    placa,
    cpf
  });

  useEffect(() => {
    if(String(dataNewSeguro.placa).length === 7 && dataNewSeguro.search === false) {
      firebase.firestore().collection('seguros').where('veiculo.placa', '==', String(dataNewSeguro.placa)).get()
      .then((response) => {
        const array = [];

        response.forEach((item) => {
          const data = item.data();

          array.push({...data, created: data.created.toDate()})
        });

        const arrayFirst = array.length > 0 ? array.sort((a, b) => a.vigencia - b.vigencia)[0] : null;

        if(arrayFirst) {
          const dataSeguro = {
            placa: arrayFirst.veiculo.placa,
            seguradora: arrayFirst.seguradora.uid,
            vigencia: format(arrayFirst.seguro.vigencia.toDate(), 'dd/MM/yyyy'),
            premio: arrayFirst.comissao.premio,
            franquia: arrayFirst.comissao.franquia,
            percentual: arrayFirst.comissao.percentual,
            anoAdesao: arrayFirst.segurado.anoAdesao,
            veiculo: arrayFirst.veiculo.veiculo,
            nome: arrayFirst.segurado.nome,
            cpf: arrayFirst.segurado.cpf,
            telefone: arrayFirst.segurado.telefone,
            condutor: arrayFirst.veiculo.condutor,
            cep: arrayFirst.endereco.cep,
            bairro: arrayFirst.endereco.bairro,
            cidade: arrayFirst.endereco.cidade,
            estado: arrayFirst.endereco.estado,
          }

          if(arrayFirst.corretor) {
            dataSeguro.corretorUid = arrayFirst.corretor ? arrayFirst.corretor.uid : null;
            dataSeguro.corretorDisplayName = arrayFirst.corretor ? arrayFirst.corretor.nome : null;
          }

          setDataNewSeguro(e => ({
            ...e,
            ...dataSeguro
          }));
        }
      })
    }
  }, [dataNewSeguro.placa]);

  const salvarSeguro = async () => {
    function objetoVazio(obj) {
      for (const prop in obj) {
        if((prop !== 'corretorUid' && prop !== 'corretorDisplayName') && obj[prop] === null) {
          return false;
        };
      }

      return true;
    }

    if(!objetoVazio(dataNewSeguro)) {
      notification.destroy();
      notification.warn({
        message: 'PREENCHA TODOS OS CAMPOS OBRIGATÓRIOS!'
      });

      return;
    }

    if(dataNewSeguro.placa && dataNewSeguro.placa.length < 7) {
      notification.destroy();
      notification.warn({
        message: 'PLACA INVÁLIDA!'
      });

      return;
    }

    if(!validateCPF(dataNewSeguro.cpf)) {
      notification.destroy();
      notification.warn({
        message: 'CPF INVÁLIDO!'
      });

      return;
    }

    const vigencia = dataNewSeguro.vigencia.split('/');

    const data = {
      seguradora: {
        uid: seguradoras.filter(x => x.uid === dataNewSeguro.seguradora)[0].uid,
        razao_social: seguradoras.filter(x => x.uid === dataNewSeguro.seguradora)[0].razao_social,
      },
      veiculo: {
        condutor: dataNewSeguro.condutor,
        veiculo: dataNewSeguro.veiculo,
        placa: dataNewSeguro.placa,
      },
      endereco: {
        cep: dataNewSeguro.cep,
        bairro: dataNewSeguro.bairro,
        cidade: dataNewSeguro.cidade,
        estado: dataNewSeguro.estado,
      },
      seguro: {
        vigencia: setMinutes(setHours(new Date(vigencia[2], (vigencia[1] - 1), vigencia[0]), 0), 0),
        vigenciaFinal: endOfDay(setMinutes(setHours(addYears(new Date(vigencia[2], (vigencia[1] - 1), vigencia[0]), 1), 0), 0)),
      },
      segurado: {
        anoAdesao: dataNewSeguro.anoAdesao,
        nome: dataNewSeguro.nome,
        cpf: dataNewSeguro.cpf,
        telefone: dataNewSeguro.telefone,
      },
      corretora: {
        uid: corretora.uid,
        razao_social: corretora.razao_social
      },
      corretor: (!dataNewSeguro.corretorUid && !dataNewSeguro.corretorDisplayName) ? null : {
        nome: dataNewSeguro.corretorDisplayName,
        uid: dataNewSeguro.corretorUid
      },
      comissao: {
        premio: Number(String(dataNewSeguro.premio).split('.').join('').split(',').join('.')),
        franquia: Number(String(dataNewSeguro.franquia).split('.').join('').split(',').join('.')),
        percentual: Number(dataNewSeguro.percentual),
        comissao: dataNewSeguro.comissao
      },
      ativo: true,
      uid: generateToken(),
      created: new Date(),
      tipo: 'veicular'
    };

    await firebase.firestore().collection('seguros').doc(data.uid).set({
      ...data
    }, { merge: true })
    .then(() => {
      notification.success({
        message: 'SEGURO CADASTRADO COM SUCESSO!',
      });

      if(data.corretor) {
        firebase.firestore().collection('relatorios').doc('seguros').collection('corretor').doc(data.corretor.uid).set({
          total: firebase.firestore.FieldValue.increment(1),
          valores: {
            premio: firebase.firestore.FieldValue.increment(Number(String(dataNewSeguro.premio).split('.').join('').split(',').join('.'))),
            comissao: firebase.firestore.FieldValue.increment(dataNewSeguro.comissao),
          }
        }, { merge: true })
      }

      if(data.corretora) {
        firebase.firestore().collection('relatorios').doc('seguros').collection('corretora').doc(data.corretora.uid).set({
          total: firebase.firestore.FieldValue.increment(1),
          valores: {
            premio: firebase.firestore.FieldValue.increment(Number(String(dataNewSeguro.premio).split('.').join('').split(',').join('.'))),
            comissao: firebase.firestore.FieldValue.increment(dataNewSeguro.comissao),
          }
        }, { merge: true })
      }

      setViewNewSeguro(false);
    })
    .catch(() => {
      notification.error({
        message: 'OCORREU UM ERRO AO CADASTRAR!'
      })
    });
  }

  const verifyFilter = !date && !corretor && !seguradora && (!placa && !cpf);

  if(!user && !corretora) {
    return <></>;
  }

  if(!user) {
    return <></>;
  }

  return (
    <LayoutAdmin title='SEGUROS'>
      <CardComponent>
        <Modal onOk={salvarSeguro} title='NOVO SEGURO' cancelText='FECHAR' okText='SALVAR' onCancel={() => setViewNewSeguro(false)} visible={viewNewSeguro} closable={() => setViewNewSeguro(false)} style={{ top: 10 }} width='50%' okButtonProps={{ style: { background: theme.colors[businessInfo.layout.theme].primary, border: 'none' }}}>
          <Row gutter={[10, 20]}>
            {user.tipo !== 'corretor' && (
              <Col span={24}>
                <label>CORRETOR:</label>
                <Select allowClear placeholder='SELECIONAR CORRETOR' style={{ width: '100%' }} onChange={response => {
                  setDataNewSeguro(e => !response ? ({ ...e, corretorUid: null, corretorDisplayName: null }) : ({...e, corretorUid: response, corretorDisplayName: corretores.filter(resp => resp.uid === response)[0].displayName }));

                  document.getElementById('placaModal').focus();
                }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                }
                value={dataNewSeguro.corretorUid}
                >
                  {corretores?.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto)).map((item, index) => (
                    <Select.Option key={index} value={item.uid}>
                      {item.nomeCompleto}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            )}
            <Col span={5}>
              <label>PLACA: <span style={{ color: 'red' }}>*</span></label>
              <Input id='placaModal' autoComplete='off' value={dataNewSeguro.placa} maxLength={7} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, placa: String(response.target.value).toUpperCase()}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('seguradora').focus()
                }
              }} placeholder='PLACA' />
            </Col>
            <Col span={19}>
              <label>SEGURADORA: <span style={{ color: 'red' }}>*</span></label>
              <Select id='seguradora' placeholder='SELECIONAR SEGURADORA' style={{ width: '100%', textTransform: 'uppercase' }} onChange={response => {
                setDataNewSeguro(e => ({...e, seguradora: response }));
                document.getElementById('inicioVigencia').focus()
              }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              value={dataNewSeguro.seguradora}
              >
                {seguradoras?.sort((a, b) => a.razao_social.localeCompare(b.razao_social)).map((item, index) => (
                  <Select.Option key={index} value={item.uid}>
                    {item.razao_social}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={12}>
              <label>INICIO VIGÊNCIA: <span style={{ color: 'red' }}>*</span></label>
              <Input
                autoComplete='off'
                id='inicioVigencia' format='DD/MM/yyyy' style={{ width: '100%' }}
                onChange={(e) => setDataNewSeguro(response => ({...response, vigencia: maskDate(e.target.value)}))}
                value={dataNewSeguro.vigencia}
                placeholder='00/00/0000'
                onKeyPress={(e) => {
                  if(e.code === 'Enter') {
                    document.getElementById('premioModal').focus()
                  }
                }
              } />
            </Col>
            <Col span={12}>
              <label>FINAL DA VIGÊNCIA: <span style={{ color: 'red' }}>*</span></label>
              <Input
                readOnly
                autoComplete='off'
                id='finalVigencia' format='DD/MM/yyyy' style={{ width: '100%' }}
                value={!((!dataNewSeguro.vigencia ? '' : (dataNewSeguro.vigencia.split('/')[0] && dataNewSeguro.vigencia.split('/')[0].length === 2) && (dataNewSeguro.vigencia.split('/')[1] && dataNewSeguro.vigencia.split('/')[1].length === 2) && (dataNewSeguro.vigencia.split('/')[2] && dataNewSeguro.vigencia.split('/')[2].length === 4))) ? '' : (`${dataNewSeguro.vigencia.split('/')[0] && dataNewSeguro.vigencia.split('/')[0]}/${dataNewSeguro.vigencia.split('/')[1]}/${Number(dataNewSeguro.vigencia.split('/')[2]) + 1}`)}
                placeholder='00/00/0000'
              />
            </Col>
            <Col span={12}>
              <label>PRÊMIO LÍQUIDO: <span style={{ color: 'red' }}>*</span></label>
              <Input id='premioModal' prefix='R$' autoComplete='off' value={dataNewSeguro.premio} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, premio: !response.target.value ? '' : maskMoney(response.target.value)}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('franquiaModal').focus();
                }
              }} placeholder='0' />
            </Col>
            <Col span={12}>
              <label>VALOR DA FRÂNQUIA: <span style={{ color: 'red' }}>*</span></label>
              <Input id='franquiaModal' prefix='R$' autoComplete='off' value={dataNewSeguro.franquia} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, franquia: !response.target.value ? '' : maskMoney(response.target.value)}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('percentualModal').focus();
                }
              }} placeholder='0' />
            </Col>
            <Col span={12}>
              <label>COMISSÃO: <span style={{ color: 'red' }}>*</span></label>
              <Input id='percentualModal' maxLength={2} max={99} prefix='%' autoComplete='off' value={dataNewSeguro.percentual} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, percentual: !response.target.value ? '' : maskOnlyNumbers(response.target.value)}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('anoAdesao').focus();
                }
              }} placeholder='0' />
            </Col>
            <Col span={12}>
              <label>COMISSÃO: </label>
              <Input id='comissaoModal' readOnly prefix='R$' autoComplete='off' value={!dataNewSeguro.comissao ? '' : String(Number(dataNewSeguro.comissao).toFixed(2)).split('.').join(',')} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, comissao: !response.target.value ? '' : maskMoney(response.target.value)}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  //document.getElementById('placa').focus();
                }
              }} placeholder='0' />
            </Col>
            <Col span={5}>
              <label>ANO DE ADESÃO: <span style={{ color: 'red' }}>*</span></label>
              <Input id='anoAdesao' autoComplete='off' value={dataNewSeguro.anoAdesao} maxLength={4} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, anoAdesao: !response.target.value ? '' : maskYear(response.target.value)}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('veiculoSeguro').focus();
                }
              }} placeholder='ANO DE ADESÃO' />
            </Col>
            <Col span={19}>
              <label>VEÍCULO: <span style={{ color: 'red' }}>*</span></label>
              <Input autoComplete='off' id='veiculoSeguro' placeholder='VEÍCULO'
                onKeyPress={(e) => {
                  if(e.code === 'Enter') {
                    document.getElementById('nomeSeguradoText').focus();
                  }
                }}
                value={dataNewSeguro.veiculo}
                onChange={(e) => setDataNewSeguro(response => ({...response, veiculo: String(e.target.value).toUpperCase()}))}  
              />
            </Col>
            <Col span={8}>
              <label>SEGURADO: <span style={{ color: 'red' }}>*</span></label>
              <Input autoComplete='off' id='nomeSeguradoText' style={{ textTransform: 'uppercase' }} placeholder='NOME DO SEGURADO'
                onKeyPress={(e) => {
                  if(e.code === 'Enter') {
                    document.getElementById('cpfSeguro').focus()
                  }
                }}
                value={dataNewSeguro.nome}
                onChange={(e) => setDataNewSeguro(response => ({...response, nome: maskOnlyLetters(String(e.target.value).toUpperCase())}))}
              />  
            </Col>
            <Col span={8}>
              <label>CPF: <span style={{ color: 'red' }}>*</span></label>
              <Input autoComplete='off' id='cpfSeguro' placeholder='CPF DO SEGURADO'
                onKeyPress={(e) => {
                  if(e.code === 'Enter') {
                    if(validateCPF(dataNewSeguro.cpf)) {
                      document.getElementById('telefoneModal').focus()
                    }else {
                      notification.warn({
                        message: 'CPF INVÁLIDO!'
                      })
                    }
                  }
                }}
                value={dataNewSeguro.cpf}
                onChange={(e) => setDataNewSeguro(response => ({...response, cpf: maskCPF(e.target.value)}))}
              />
            </Col>
            <Col span={8}>
              <label>TELEFONE: <span style={{ color: 'red' }}>*</span></label>
              <Input id='telefoneModal' autoComplete='off' maxLength={15} value={dataNewSeguro.telefone} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, telefone: !response.target.value ? '' : maskPhone(response.target.value)}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('condutorText').focus();
                }
              }} placeholder='TELEFONE' />
            </Col>
            <Col span={24}>
              <label>CONDUTOR: <span style={{ color: 'red' }}>*</span></label>
              <Input autoComplete='off' id='condutorText' style={{ textTransform: 'uppercase' }} placeholder='NOME DO CONDUTOR'
                onKeyPress={(e) => {
                  if(e.code === 'Enter') {
                    document.getElementById('cepModal').focus()
                  }
                }}
                value={dataNewSeguro.condutor}
                onChange={(e) => setDataNewSeguro(response => ({...response, condutor: maskOnlyLetters(String(e.target.value).toUpperCase())}))}
              />  
            </Col>
            <Col span={6}>
              <label>CEP: <span style={{ color: 'red' }}>*</span></label>
              <Input id='cepModal' autoComplete='off' value={dataNewSeguro.cep} maxLength={9} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, cep: !response.target.value ? '' : maskCEP(response.target.value)}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('bairroModal').focus();
                }
              }} placeholder='CEP' />
            </Col>
            <Col span={6}>
              <label>BAIRRO: <span style={{ color: 'red' }}>*</span></label>
              <Input id='bairroModal' autoComplete='off' value={dataNewSeguro.bairro} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, bairro: !response.target.value ? '' : response.target.value}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('cidadeModal').focus();
                }
              }} placeholder='BAIRRO' />
            </Col>
            <Col span={6}>
              <label>CIDADE: <span style={{ color: 'red' }}>*</span></label>
              <Input id='cidadeModal' autoComplete='off' value={dataNewSeguro.cidade} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, cidade: !response.target.value ? '' : response.target.value}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('estadoModal').focus();
                }
              }} placeholder='CIDADE' />
            </Col>
            <Col span={6}>
              <label>ESTADO: <span style={{ color: 'red' }}>*</span></label>
              <Input id='estadoModal' autoComplete='off' value={dataNewSeguro.estado} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, estado: !response.target.value ? '' : response.target.value}))} onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  //document.getElementById('telefoneModal').focus();
                }
              }} placeholder='ESTADO' />
            </Col>
          </Row>
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
          {((date || corretor || seguradora || (placa.length === 7 || cpf.length === 14)) && seguros.length > 0) && (
            <span
              style={{
                position: 'absolute',
                top: 15,
                right: 15,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                zIndex: 1
              }}
              onClick={printSeguros}
            >
              <FaPrint style={{ marginRight: 5 }} /> IMPRIMIR
            </span>
          )}
          <Col span={24}>
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444', textAlign: 'center', marginBottom: 10}}>SEGUROS <sup><FaPlus style={{ cursor: 'pointer' }} onClick={() => setViewNewSeguro(true)} /></sup></h1>
          </Col>
          <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '30%', background: '#fff', border: '1px solid rgba(0, 0, 0, .2)', padding: '10px 0', borderRadius: 5 }}>TOTAL DE SEGUROS:<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{String(verifyFilter ? valoresIniciais.seguros : seguros.length).padStart(2, '0')}</span></div>
            <div style={{ width: '70%', background: '#fff', border: '1px solid rgba(0, 0, 0, .2)', padding: '10px 0', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <div>
                TOTAL EM PRÊMIO LÍQUIDO<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{Number(verifyFilter ? valoresIniciais.totalPremio : totalPremio).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <Divider style={{ borderColor: 'rgba(0, 0, 0, .2)' }} type='vertical' />
              <div>
                MÉDIA DO PRÊMIO LÍQUIDO<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{verifyFilter ? Number((valoresIniciais.totalPremio / valoresIniciais.seguros) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : !seguros.length > 0 ? 'R$ 0,00' : Number(totalPremio / seguros.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
            <div style={{ width: '100%', background: '#fff', border: '1px solid rgba(0, 0, 0, .2)', padding: '10px 0', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <div>
                TOTAL DAS COMISSÕES<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{Number(verifyFilter ? valoresIniciais.totalComissao : totalComissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <Divider style={{ borderColor: 'rgba(0, 0, 0, .2)' }} type='vertical' />
              <div>
                VALOR MÉDIO DAS COMISSÕES<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{verifyFilter ? Number((valoresIniciais.totalComissao / valoresIniciais.seguros) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : !seguros.length > 0 ? 'R$ 0,00' : Number(totalComissao / seguros.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <Divider style={{ borderColor: 'rgba(0, 0, 0, .2)' }} type='vertical' />
              <div>
                MÉDIA DAS COMISSÕES<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{verifyFilter ? Number(((valoresIniciais.totalComissao / valoresIniciais.totalPremio) * 100) || 0).toFixed(2).split('.').join(',') : !seguros.length > 0 ? 0 : Number((totalComissao / totalPremio) * 100).toFixed(2).split('.').join(',')}%</span>
              </div>
            </div>
          </Col>
          <Divider style={{ borderColor: '#d1d1d1', marginBottom: 15 }} />
          <Col span={24}
            style={{
              display: width > 768 && 'flex',
              alignItems: width > 768 && 'center',
              flexDirection: width > 768 && 'row',
              justifyContent: width > 768 && 'space-between',
              textAlign: 'center'
            }}
          >
            <div
              style={{ marginLeft: 20, marginRight: 20  , border: '.5px solid #d1d1d1', height: '50px', width: 1, alignItems: 'center', display: 'flex' }}
            />
            <div>
              <div style={{ width: '100%' }}>PERIODO:</div>
              <DatePicker.RangePicker format='DD/MM/yyyy' style={{ width: '100%' }} value={date} onChange={(e) => setDate(e)} />
            </div>
            {(user && user.tipo !== 'corretor') && (
              <>
                <div
                  style={{ marginLeft: 20, marginRight: 20  , border: '.5px solid #d1d1d1', height: '50px', width: 1, alignItems: 'center', display: 'flex' }}
                />
                <div>
                  <div style={{ width: '100%' }}>CORRETOR:</div>
                  <Select allowClear placeholder='SELECIONAR CORRETOR' style={{ width: '100%' }} onChange={e => {
                    setCorretor(e ? e : null);
                  }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  value={corretor}
                  >
                    <Select.Option value={'null'}>{corretora.razao_social}</Select.Option>
                    {corretores?.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto)).map((item, index) => (
                      <Select.Option key={index} value={item.uid}>
                        {item.nomeCompleto}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </>
            )}
            <div
              style={{ marginLeft: 20, marginRight: 20  , border: '.5px solid #d1d1d1', height: '50px', width: 1, alignItems: 'center', display: 'flex' }}
            />
            <div>
              <div style={{ width: '100%' }}>SEGURADORA:</div>
              <Select allowClear placeholder='SELECIONAR SEGURADORA' style={{ width: '100%' }} onChange={e => {
                setSeguradora(e ? e : null);
              }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              value={seguradora}
              >
                {seguradoras?.sort((a, b) => a.razao_social.localeCompare(b.razao_social)).map((item, index) => (
                  <Select.Option key={index} value={item.uid}>
                    {item.razao_social}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div
              style={{ marginLeft: 20, marginRight: 20  , border: '.5px solid #d1d1d1', height: '50px', width: 1, alignItems: 'center', display: 'flex' }}
            />
            {cpf.length === 0 && (
              <>
                <div>
                  <div style={{ width: '100%' }}>PLACA:</div>
                  <Input maxLength={7} style={{ width: '100%' }} allowClear type='text' value={placa} placeholder='AAA0000' onChange={(e) => setPlaca(String(e.target.value).toUpperCase())} />
                </div>
                <div
                  style={{ marginLeft: 20, marginRight: 20  , border: '.5px solid #d1d1d1', height: '50px', width: 1, alignItems: 'center', display: 'flex' }}
                />
              </>
            )}
            {placa.length === 0 && (
              <>
                <div>
                  <div style={{ width: '100%' }}>CPF:</div>
                  <Input style={{ width: '100%' }} type='tel' value={cpf} allowClear placeholder='000.000.000-00' onChange={(e) => setCPF(maskCPF(e.target.value))} />
                </div>
                <div
                  style={{ marginLeft: 20, marginRight: 20  , border: '.5px solid #d1d1d1', height: '50px', width: 1, alignItems: 'center', display: 'flex' }}
                />
              </>
            )}
          </Col>
        </Row>
        <TableSeguro
          seguradora={seguradora}
          corretor={corretor}
          date={date}
          cpf={cpf}
          placa={placa}
          user={user}
          infiniteData={true}
          setTotalSeguro={setTotalSeguro}
          setTotalPremio={setTotalPremio} 
          setTotalComissao={setTotalComissao} 
          corretora={corretora.uid}
          setSeguros={setSeguros}
          setViewNewSeguro={setViewNewSeguro}
          setDataNewSeguro={setDataNewSeguro}
        />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Seguro;