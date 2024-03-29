import { useEffect, useRef, useState } from 'react';

import { Col, Divider, Input, InputNumber, Modal, notification, Row, Select } from 'antd';

import useAuth from 'hooks/useAuth';

import { useTheme } from 'styled-components';

import { addYears, endOfDay, format, startOfDay } from 'date-fns';
import { maskCEP, maskCPF, maskDate, maskMoney, maskOnlyLetters, maskPercentual, maskPhone, maskPlaca, maskYear } from 'hooks/mask';

import axios from 'axios';
import generateToken from 'hooks/generateToken';
import { validarCelular, validateCPF } from 'hooks/validate';
import firebase from '../../auth/AuthConfig';

import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import jsonComposto from '../../data/jsonComposto.json';

function juroComposto({ parcela, percentual }) {
  return jsonComposto[percentual][parcela];
}

export default function ModalSeguro({ data, visible, setVisible, callback }) {
  const dataInitial = data;
  const { user, corretora, businessInfo } = useAuth();

  const placaRef = useRef();

  useEffect(() => {
    if(visible) {
      setTimeout(() => {
        document.getElementById('placaModal').focus();
        placaRef.current.focus();
      }, 100);
    }
  }, [visible]);

  const theme = useTheme();

  const [seguradoras, setSeguradoras] = useState([]);
  const [corretores, setCorretores] = useState([]);

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
    condutor: null,
    profissao: null,
    usoVeiculo: null,
    modelo: null,
    juros: businessInfo.comissao.juros
  };

  async function fechar(openView) {
    await setDataNewSeguro(dadaInitial);
    await setVisible(false);
    await setDataNewSeguro(dadaInitial);

    if(openView) {
      setTimeout(() => {
        setVisible(true);
      }, 500);
    }
  }
  const [dataNewSeguro, setDataNewSeguro] = useState(data || dadaInitial);

  useEffect(() => {
    const getPercentualComissao = () => {
      const corretorSearch = corretores.filter(e => e.uid === dataNewSeguro.corretorUid);

      if(corretorSearch.length === 0) {
        return '00,00';
      }

      const percentualComissaoProdutor = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(corretorSearch[0].comissao);

      return percentualComissaoProdutor;
    }

    const comissaoCorretor = Number(getPercentualComissao().split(',').join('.'));

    if(dataNewSeguro.corretorUid) {
      setDataNewSeguro(e => ({
        ...e,
        comissaoCorretor: getPercentualComissao(),
        comissaoCorretora: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(100 - comissaoCorretor),
      }));
    }else {
      setDataNewSeguro(e => ({
        ...e,
        comissaoCorretor: '0,00',
        comissaoCorretora: '100,00',
      }));
    }
  }, [dataNewSeguro.corretorUid, dataNewSeguro.parcelas]);

  useEffect(() => {
    if(user) {
      if(user.tipo === 'corretor') {
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
    const dados = data ? {...data, usoVeiculo: data?.usoVeiculo || null, modelo: data?.modelo || null, juros: data?.juros || businessInfo.comissao.juros } : dadaInitial;

    if(user) {
      if(user.tipo === 'corretor') {
        dados.corretorUid = user.uid;
        dados.corretorDisplayName = user.displayName;
      }
    }

    setDataNewSeguro(dados);
  }, [visible, user]);

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
            vigencia: format(utcToZonedTime(new Date(arrayFirst.seguro.vigencia.seconds * 1000), 'America/Sao_Paulo'), 'dd/MM/yyyy'),
            premio: 0,
            franquia: 0,
            percentual: '',
            anoAdesao: arrayFirst.segurado.anoAdesao,
            veiculo: arrayFirst.veiculo.veiculo,
            nome: arrayFirst.segurado.nome,
            usoVeiculo: arrayFirst?.riscos?.usoVeiculo || null,
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

  useEffect(() => {
    const premio = Number(String(dataNewSeguro.premio).split('.').join('').split(',').join('.'));

    const percentual = Number(String(dataNewSeguro.percentual).split('.').join('').split(',').join('.'));

    const comissaoCorretor = Number(String(dataNewSeguro.comissaoCorretor).split(',').join('.'));
    const comissaoCorretora = Number(String(dataNewSeguro.comissaoCorretora).split(',').join('.'));

    const comissaoNumber = Number((premio / 100) * percentual);
    const comissaoCorretoraValorNumber = (comissaoNumber / 100) * comissaoCorretora;
    const comissaoCorretorValorNumber = (comissaoNumber / 100) * comissaoCorretor;

    setDataNewSeguro(e => ({
      ...e,
      comissao: comissaoNumber,
      comissaoCorretoraValor: comissaoCorretoraValorNumber,
      comissaoCorretorValor: comissaoCorretorValorNumber,
    }));
  }, [dataNewSeguro.premio, dataNewSeguro.percentual, dataNewSeguro.comissaoCorretor]);

  useEffect(() => {
    if(user) {
      if(user.tipo === 'corretor') {
        //setCorretor(user.uid);

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
    if(String(dataNewSeguro.cep).length === 9) {
      axios.get(`https://viacep.com.br/ws/${String(dataNewSeguro.cep).split('-').join('')}/json`, {
        headers: {
          'content-type': 'application/json;charset=utf-8'
        },
      })
      .then((response) => {
        const data = response.data;

        setDataNewSeguro(e => ({...e, bairro: data.bairro, cidade: data.localidade, estado: data.uf}))
      })
    }
  }, [dataNewSeguro.cep]);

  const salvarSeguro = async () => {
    function objetoVazio(obj) {
      delete obj.profissao;

      for (const prop in obj) {
        if((prop !== 'condutor' && prop !== 'corretorUid' && prop !== 'corretorDisplayName' && prop !== 'bairro' && prop !== 'uid' &&  prop !== 'search') && obj[prop] === null) {
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

    /*
      if(dataNewSeguro.placa && dataNewSeguro.placa.length < 7) {
        notification.destroy();
        notification.warn({
          message: 'PLACA INVÁLIDA!'
        });

        return;
      }
    */

    if(!validateCPF(dataNewSeguro.cpf)) {
      notification.destroy();
      notification.warn({
        message: 'CPF INVÁLIDO!'
      });

      return;
    }

    /*
      if(!validarPlaca(dataNewSeguro.placa)) {
        notification.destroy();
        notification.warn({
          message: 'PLACA INVÁLIDA!'
        });

        return;
      }
    */

    if(!validarCelular(dataNewSeguro.telefone)) {
      notification.destroy();
      notification.warn({
        message: 'CELULAR INVÁLIDO!'
      });

      return;
    }

    const vigencia = dataNewSeguro.vigencia.split('/');
    const vigenciaData = new Date(Number(vigencia[2]), Number(Number(vigencia[1]) - 1), Number(vigencia[0]));

    const vigenciaInicio = zonedTimeToUtc(startOfDay(vigenciaData), 'America/Sao_Paulo');
    const vigenciaFinal = zonedTimeToUtc(addYears(endOfDay(vigenciaData), 1), 'America/Sao_Paulo');

    const data = {
      seguradora: {
        uid: seguradoras.filter(x => x.uid === dataNewSeguro.seguradora)[0].uid,
        razao_social: seguradoras.filter(x => x.uid === dataNewSeguro.seguradora)[0].razao_social,
      },
      veiculo: {
        condutor: dataNewSeguro.condutor,
        veiculo: dataNewSeguro.veiculo,
        placa: dataNewSeguro?.placa || null,
        placaQuery: dataNewSeguro?.placa ? `${dataNewSeguro?.placa[3]}${dataNewSeguro?.placa[5]}${dataNewSeguro?.placa[6]}` : null,
        modelo: dataNewSeguro.modelo
      },
      endereco: {
        cep: dataNewSeguro.cep,
        bairro: dataNewSeguro.bairro,
        cidade: dataNewSeguro.cidade,
        estado: dataNewSeguro.estado,
      },
      seguro: {
        vigencia: vigenciaInicio,
        vigenciaFinal: vigenciaFinal,
      },
      segurado: {
        anoAdesao: dataNewSeguro.anoAdesao,
        nome: dataNewSeguro.nome,
        cpf: dataNewSeguro.cpf,
        telefone: dataNewSeguro.telefone,
      },
      corretor: null,
      corretora: {
        uid: corretora.uid,
        razao_social: corretora.razao_social,
        comissao: {
          percentual: Number(100 - Number(String(dataNewSeguro.comissaoCorretor).split(',').join('.'))),
          valor: dataNewSeguro.comissaoCorretoraValor
        }
      },
      riscos: {
        usoVeiculo: dataNewSeguro.usoVeiculo || null,
      },
      valores: {
        parcelas: dataNewSeguro.parcelas,
        premio: Number(String(dataNewSeguro.premio).split('.').join('').split(',').join('.')),
        franquia: Number(String(dataNewSeguro.franquia).split('.').join('').split(',').join('.')),
        percentual: Number(String(dataNewSeguro.percentual).split(',').join('.')),
        comissao: dataNewSeguro.comissao,
        corretora: {
          percentual: Number(100 - Number(String(dataNewSeguro.comissaoCorretor).split(',').join('.'))),
          valor: dataNewSeguro.comissaoCorretoraValor
        }
      },
      ativo: true,
      uid: generateToken(),
      tipo: 'veicular',
      externo: false
    };

    if(dataNewSeguro.corretorUid) {
      const comissaoCorretorJSON = {
        percentual: Number(Number(Number(String(dataNewSeguro.comissaoCorretor).split(',').join('.')).toFixed(2))),
        valor: dataNewSeguro.comissaoCorretorValor
      }
      
      data.corretor = {
        nome: corretores.filter(e => e.uid === dataNewSeguro.corretorUid)[0].displayName,
        uid: dataNewSeguro.corretorUid,
        comissao: comissaoCorretorJSON
      };

      data.valores = {
        ...data.valores,
        corretor: comissaoCorretorJSON,
        juros: dataNewSeguro.juros
      }
    }

    if(dataNewSeguro.search) {
      data.uid = dataNewSeguro.uid;
    }

    if(!dataNewSeguro.search) {
      data.created = new Date();
    }

    Modal.confirm({
      title: 'DESEJA REALMENTE SALVAR?',
      type: 'info',
      content: '',
      okText: 'SALVAR',
      cancelText: 'CANCELAR',
      okButtonProps: {
        style: {
          background: theme.colors[businessInfo.layout.theme].primary,
          color: '#FFFFFF',
          border: 'none',
          outline: 'none'
        }
      },
      onOk: async () => await firebase.firestore().collection('seguros').doc(data.uid).set(data, { merge: true })
        .then(async () => {
          const premioValor = Number(String(dataNewSeguro.premio).split('.').join('').split(',').join('.'));
          const comissaoValor = dataNewSeguro.comissao;
  
          await firebase.firestore().collection('relatorios').doc('seguros').collection('corretor').doc(String(dataNewSeguro.corretorUid)).set({
            total: firebase.firestore.FieldValue.increment(dataNewSeguro.search ? 0 : 1),
            valores: {
              premio: firebase.firestore.FieldValue.increment((dataInitial && (dataInitial?.premio === dataNewSeguro?.premio)) ? 0 : premioValor),
              comissao: firebase.firestore.FieldValue.increment((dataInitial && (dataInitial?.comissao === dataNewSeguro?.comissao)) ? 0 : comissaoValor),
            }
          }, { merge: true });

          await firebase.firestore().collection('relatorios').doc('seguros').collection('corretora').doc(String(corretora.uid)).set({
            total: firebase.firestore.FieldValue.increment(dataNewSeguro.search ? 0 : 1),
            valores: {
              premio: firebase.firestore.FieldValue.increment((dataInitial && (dataInitial?.premio === dataNewSeguro?.premio)) ? 0 : premioValor),
              comissao: firebase.firestore.FieldValue.increment((dataInitial && (dataInitial?.comissao === dataNewSeguro?.comissao)) ? 0 : comissaoValor),
            }
          }, { merge: true });

          firebase.firestore().collection('clientes').doc(String(data.segurado.cpf).split('.').join('').split('-').join('')).set({
            cpf: String(data.segurado.cpf).split('.').join('').split('-').join(''),
            nome: data.segurado.nome,
            anoAdesao: Number(data.segurado.anoAdesao),
            telefone: data.segurado.telefone,
            corretora: corretora.uid
          }, { merge: true });

          if(callback) {
            callback();
          }else {
            notification.success({
              message: `SEGURO ${dataNewSeguro.search ? 'ALTERADO' : 'CADASTRADO'} COM SUCESSO!`,
            });
          }

          await fechar(true);
        })
        .catch((error) => {
          notification.error({
            message: 'OCORREU UM ERRO AO CADASTRAR!'
          })
        })
    })
  }

  return (
    <Modal onOk={salvarSeguro} title='NOVO SEGURO' cancelText='FECHAR' okText='SALVAR' onCancel={async () => await fechar()} visible={visible} closable={async () => await fechar()} style={{ top: 10 }} width='60%' cancelButtonProps={{ style: { border: '1px solid black', outline: 'none', color: 'black' } }} okButtonProps={{ style: { background: theme.colors[businessInfo.layout.theme].primary, border: 'none' }}}>
      <Row gutter={[10, 20]}>
        {user.tipo !== 'corretor' && (
          <Col span={24}>
            <label>PRODUTOR:</label>
            <Select allowClear placeholder='SELECIONAR PRODUTOR' style={{ width: '100%' }} onChange={response => {
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
              <Select.Option value={null}>
                {corretora.razao_social}
              </Select.Option>
              {corretores?.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto)).map((item, index) => (
                <Select.Option key={index} value={item.uid}>
                  {item.nomeCompleto} ({item.comissao}%)
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
        <Col span={5}>
          <label>PLACA:</label>
          <Input ref={placaRef} id='placaModal' autoFocus={true} autoComplete='off' value={dataNewSeguro.placa} maxLength={7} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, placa: maskPlaca(String(response.target.value)).toUpperCase()}))} onKeyPress={(e) => {
            if(e.code === 'Enter') {
              document.getElementById('seguradora').focus();
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
                document.getElementById('anoAdesao').focus()
              }
            }
          } />
        </Col>
        <Col span={12}>
          <label>FINAL DA VIGÊNCIA: <span style={{ color: 'red' }}>*</span></label>
          <Input
            readOnly
            autoComplete='off'
            id='finalVigencia'
            format='DD/MM/yyyy'
            style={{ width: '100%' }}
            value={!((!dataNewSeguro.vigencia ? '' : (dataNewSeguro.vigencia.split('/')[0] && dataNewSeguro.vigencia.split('/')[0].length === 2) && (dataNewSeguro.vigencia.split('/')[1] && dataNewSeguro.vigencia.split('/')[1].length === 2) && (dataNewSeguro.vigencia.split('/')[2] && dataNewSeguro.vigencia.split('/')[2].length === 4))) ? '' : (`${dataNewSeguro.vigencia.split('/')[0] && dataNewSeguro.vigencia.split('/')[0]}/${dataNewSeguro.vigencia.split('/')[1]}/${Number(dataNewSeguro.vigencia.split('/')[2]) + 1}`)}
            placeholder='00/00/0000'
          />
        </Col>
        <Col span={5}>
          <label>ANO DE ADESÃO: <span style={{ color: 'red' }}>*</span></label>
          <Input id='anoAdesao' autoComplete='off' value={dataNewSeguro.anoAdesao} maxLength={4} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, anoAdesao: !response.target.value ? '' : maskYear(response.target.value)}))} onKeyPress={(e) => {
            if(e.code === 'Enter') {
              document.getElementById('veiculoSeguro').focus();
            }
          }} placeholder='ANO DE ADESÃO' />
        </Col>
        <Col span={8}>
          <label>VEÍCULO: <span style={{ color: 'red' }}>*</span></label>
          <Input autoComplete='off' id='veiculoSeguro' placeholder='VEÍCULO'
            onKeyPress={(e) => {
              if(e.code === 'Enter') {
                document.getElementById('modeloVeiculoSeguro').focus();
              }
            }}
            value={dataNewSeguro.veiculo}
            onChange={(e) => setDataNewSeguro(response => ({...response, veiculo: String(e.target.value).toUpperCase()}))}  
          />
        </Col>
        <Col span={5}>
          <label>ANO DO MODELO: <span style={{ color: 'red' }}>*</span></label>
          <Input autoComplete='off' id='modeloVeiculoSeguro' placeholder='0000'
            onKeyPress={(e) => {
              if(e.code === 'Enter') {
                document.getElementById('usoVeiculoSeguro').focus();
              }
            }}
            value={dataNewSeguro.modelo}
            onChange={(e) => setDataNewSeguro(response => ({...response, modelo: String(e.target.value).toUpperCase()}))}  
          />
        </Col>
        <Col span={6}>
          <label>USO DO VEÍCULO: <span style={{ color: 'red' }}>*</span></label>
          <Select
            id='usoVeiculoSeguro'
            value={dataNewSeguro.usoVeiculo}
            placeholder='SELECIONAR O USO DO VEÍCULO'
            onDropdownVisibleChange={(e) => {
              if(!e) {
                if(!dataNewSeguro.usoVeiculo) {
                  setDataNewSeguro(x => ({ ...x, usoVeiculo: String('lazer e ida e volta ao trabalho').toUpperCase() }));
                }

                document.getElementById('nomeSeguradoText').focus();
              }
            }}
            onChange={(e) => {
              if(e) {
                setDataNewSeguro(x => ({ ...x, usoVeiculo: e }));
              }else {
                setDataNewSeguro(x => ({ ...x, usoVeiculo: String('lazer e ida e volta ao trabalho').toUpperCase() }))
              }

              document.getElementById('nomeSeguradoText').focus();
            }}
            style={{
              width: '100%'
            }}
          >
            {['lazer e ida e volta ao trabalho', 'só lazer', 'visita a clientes', 'motorista de aplicativo', 'táxi', 'transporte de mercadorias', 'outros']
            .map((item, index) => (
              <Select.Option key={index} value={item.toUpperCase()}>
                {item.toUpperCase()}
              </Select.Option>
            ))}
          </Select> 
        </Col>
        <Col span={13}>
          <label>SEGURADO: <span style={{ color: 'red' }}>*</span></label>
          <Input autoComplete='off' id='nomeSeguradoText' style={{ textTransform: 'uppercase' }} placeholder='NOME DO SEGURADO'
            onKeyPress={(e) => {
              if(e.code === 'Enter') {
                document.getElementById('cpfSeguro').focus()
              }
            }}
            value={dataNewSeguro.nome}
            onChange={(e) => {
              const nomeText = maskOnlyLetters(String(e?.target?.value || '').toUpperCase());
              setDataNewSeguro(response => ({...response, nome: nomeText, condutor: nomeText }));
            }}
          />  
        </Col>
        <Col span={5}>
          <label>CPF: <span style={{ color: 'red' }}>*</span></label>
          <Input autoComplete='off' id='cpfSeguro' placeholder='CPF DO SEGURADO'
            onKeyPress={(e) => {
              if(e.code === 'Enter') {
                if(validateCPF(dataNewSeguro.cpf || '')) {
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
        <Col span={6}>
          <label>TELEFONE: <span style={{ color: 'red' }}>*</span></label>
          <Input id='telefoneModal' autoComplete='off' maxLength={15} value={dataNewSeguro.telefone} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, telefone: !response.target.value ? '' : maskPhone(response.target.value)}))} onKeyPress={(e) => {
            if(e.code === 'Enter') {
              if(validarCelular(dataNewSeguro.telefone || '')) {
                document.getElementById('condutorText').focus();
              }else {
                notification.warn({
                  message: 'CELULAR INVÁLIDO!'
                })
              }
            }
          }} placeholder='TELEFONE' />
        </Col>
        <Col span={24}>
          <label>CONDUTOR:</label>
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
              document.getElementById('parcelasModal').focus();
            }
          }} placeholder='CEP' />
        </Col>
        <Col span={6}>
          <label>BAIRRO:</label>
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
              document.getElementById('parcelasModal').focus();
            }
          }} placeholder='ESTADO' />
        </Col>
        <Col span={24}>
          <Divider style={{ padding: 0, margin: 0 }} />
        </Col>
        <Col span={24}>
          <h3>COMISSÃO</h3>
        </Col>
        <Col span={4}>
          <label>PARCELAS: <span style={{ color: 'red' }}>*</span></label>
          <InputNumber disabled={data} id='parcelasModal' autoComplete='off' value={dataNewSeguro.parcelas} style={{ textTransform: 'uppercase', width: '100%' }} onChange={(response) => setDataNewSeguro(e => ({...e, parcelas: !response ? 1 : response}))} max={12} onKeyPress={(e) => {
            if(e.code === 'Enter') {
              document.getElementById('premioModal').focus();
            }
          }} placeholder='0' />
        </Col>
        <Col span={8}>
          <label>PRÊMIO LÍQUIDO: <span style={{ color: 'red' }}>*</span></label>
          <Input disabled={data} id='premioModal' prefix='R$' autoComplete='off' value={dataNewSeguro.premio} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, premio: !response.target.value ? '' : maskMoney(response.target.value)}))} onKeyPress={(e) => {
            if(e.code === 'Enter') {
              document.getElementById('franquiaModal').focus();
            }
          }} placeholder='0' />
        </Col>
        <Col span={4}>
          <label>FRANQUIA: <span style={{ color: 'red' }}>*</span></label>
          <Input disabled={data} id='franquiaModal' prefix='R$' autoComplete='off' value={dataNewSeguro.franquia} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, franquia: !response.target.value ? '' : maskMoney(response.target.value)}))} onKeyPress={(e) => {
            if(e.code === 'Enter') {
              document.getElementById('percentualModal').focus();
            }
          }} placeholder='0' />
        </Col>
        <Col span={4}>
          <label>PERCENTUAL: <span style={{ color: 'red' }}>*</span></label>
          <Input disabled={data}  id='percentualModal' maxLength={5} prefix='%' autoComplete='off' value={dataNewSeguro.percentual || ''} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, percentual: maskPercentual(response.target.value || '')}))} onKeyPress={(e) => {
            if(e.code === 'Enter') {
              if(dataNewSeguro.comissao && dataNewSeguro.corretorUid) {
                document.getElementById('percentualModalfsdfds').focus(); 
              }else {
                salvarSeguro();
              }
            }
          }} placeholder='0' />
        </Col>
        <Col span={4}>
          <label>COMISSÃO:</label>
          <Input disabled={data} id='comissaoModal' readOnly prefix='R$' autoComplete='off' value={!dataNewSeguro.comissao ? '' : Number(dataNewSeguro.comissao).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, comissao: !response.target.value ? '' : maskMoney(response.target.value)}))} onKeyPress={(e) => {
            if(e.code === 'Enter') {
              //document.getElementById('placa').focus();
            }
          }} placeholder='0' />
        </Col>
        {dataNewSeguro.comissao > 0 && (
          <Col span={24} style={{ background: '#f1f1f1', padding: 10 }}>
            <Row gutter={[10, 20]}>
              {dataNewSeguro.corretorUid && (
                <>
                  <Col span={4}>
                    <label>% PRODUTOR: <span style={{ color: 'red' }}>*</span></label>
                    <Input disabled={data} id='percentualModalfsdfds' maxLength={5} prefix='%' autoComplete='off' value={dataNewSeguro.comissaoCorretor} onChange={(response) => setDataNewSeguro(e => ({...e, comissaoCorretor: maskPercentual(String(response.target.value) || '0')}))} onKeyPress={(e) => {
                      if(e.code === 'Enter') {
                        salvarSeguro();
                      }
                    }} placeholder='0' />
                  </Col>
                  <Col span={8}>
                    <label>COMISSÃO: <sup style={{ color: 'red' }}>PRODUTOR</sup></label>
                    <Input disabled={data} readOnly id='comissaoModal' prefix='R$' autoComplete='off' value={Number((Number(dataNewSeguro.comissao) / 100) * Number(Number(String(dataNewSeguro.comissaoCorretor).split('.').join('').split(',').join('.')))).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} placeholder='0' />
                  </Col>
                  <Col span={4}>
                    <label>DESCONTO: <span style={{ color: 'red' }}>*</span></label>
                    <Input disabled={data} readOnly prefix='R$' id='percentualModalfsdfds' maxLength={5} autoComplete='off' value={Number(dataNewSeguro.comissaoCorretorValor - dataNewSeguro.comissaoCorretorValor * juroComposto({
                      parcela: String(dataNewSeguro.parcelas),
                      percentual: String(businessInfo.comissao.juros)
                    }) || 0).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} onChange={(response) => setDataNewSeguro(e => ({...e, comissaoCorretor: maskPercentual(String(response.target.value) || '0')}))} onKeyPress={(e) => {
                      if(e.code === 'Enter') {
                        document.getElementById('anoAdesao').focus();
                      }
                    }} placeholder='0' />
                  </Col>
                  <Col span={8}>
                    <label>VALOR LÍQUIDO: <sup style={{ color: 'red' }}>PRODUTOR</sup></label>
                    <Input disabled={data} readOnly id='comissaoModal' prefix='R$' autoComplete='off' value={dataNewSeguro.parcelas <= 4 ? Number(dataNewSeguro.comissaoCorretorValor).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : Number(dataNewSeguro.comissaoCorretorValor * juroComposto({
                      parcela: String(dataNewSeguro.parcelas),
                      percentual: String(businessInfo.comissao.juros)
                    }) || 0).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} placeholder='0' />
                  </Col>
                </>
              )}
              <Col span={4}>
                <label>% CORRETORA: <span style={{ color: 'red' }}>*</span></label>
                <Input disabled={data} readOnly id='percentualCorretoraModal' maxLength={dataNewSeguro.corretorUid ? 5 : 6} prefix='%' autoComplete='off' value={Number(100 - Number(String(dataNewSeguro.comissaoCorretor).split('.').join('').split(',').join('.'))).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} style={{ textTransform: 'uppercase' }} placeholder='0' />
              </Col>
              <Col span={8}>
                <label>COMISSÃO: <sup style={{ color: 'red' }}>CORRETORA</sup></label>
                <Input disabled={data} readOnly id='comissaoModal' prefix='R$' autoComplete='off' value={Number(Number(Number(Number(Number(String(dataNewSeguro.premio).split('.').join('').split(',').join('.')) / 100) *  Number(String(dataNewSeguro.percentual).split('.').join('').split(',').join('.'))) / 100) * Number(100 - Number(String(dataNewSeguro.comissaoCorretor).split(',').join('.')))).toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, comissaoCorretoraValor: !response.target.value ? '' : maskMoney(response.target.value)}))} placeholder='0' />
              </Col>
              {(dataNewSeguro.corretorUid && dataNewSeguro.parcelas > 4) && (
                <Col span={4}>
                  <label>JUROS AO MÊS: <span style={{ color: 'red' }}>*</span></label>
                  <Input disabled={data} readOnly id='percentualCorretoraModal' max={7} step={0.5} prefix='%' autoComplete='off' value={dataNewSeguro.juros} onChange={() => setDataNewSeguro(e => ({...e, juros: Number(e)}))} placeholder='0' />
                </Col>
              )}
            </Row>
          </Col>
        )}
      </Row>
    </Modal>
  )
}