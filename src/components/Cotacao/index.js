import { Row, Col, Tag, Button, Divider } from 'antd';
import { FaTimes, FaCheck } from 'react-icons/fa';

import colors from '../../utils/colors';

import { vincularSeguro, iniciarCotacao, apagarCotacao, verSeguro } from '../../functions';

const Cotacao = ({ dados, setData }) => {
  return (
    <>
      <center>
        <h1 style={{padding: 0, margin: 0, color: '#444', fontWeight: 'bold'}}>DADOS DA {dados.textTipo}</h1>
      </center>
      <Divider />
      <Tag style={{width: '100%', textAlign: 'center', top: 0, left: 0, height: 30, display: 'flex', alignItems: 'center', alignSelf: 'center', alignContent: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20}} color={dados.status === 0 ? 'gray' : dados.status === 1 ? 'green' : 'blue'}>
        {dados.status === 0 ? 'AGUARDANDO' : dados.status === 1 ? 'INICIADO' : 'CONCLUÍDO'}
      </Tag>
      <Divider />
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
            <u>DADOS DO SEGURADO</u>
          </h1>
        </Col>
        <Col span={12}>
          <>
            <label>SEGURADO:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.nomeCompleto}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>CPF:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.cpf}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>CELULAR:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.celular}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>ESTADO CÍVIL:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.estadoCivil}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>CEP:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.cep}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>TEMPO DE CNH:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.data1CNH}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>O SEGURADO É O PROPRIETÁRIO:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.seguradoProprietario ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  SIM <FaCheck size={30} color={colors.success.default} style={{marginLeft: 10}} />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  NÃO <FaTimes size={30} color={colors.danger.default} style={{marginLeft: 10}} />
                </div>
              )}
            </h1>
          </>
        </Col>
        <Divider />
        <Col span={24}>
          <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
            <u>INFORMAÇÃO DO SEGURO</u>
          </h1>
        </Col>
        <Col span={12}>
          <>
            <label>TIPO DE SEGURO:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.tipoSeguro}
            </h1>
          </>
        </Col>
        {dados.tipoSeguro === 'RENOVAÇÃO' && (
          <>
            <Col span={12}>
              <>
                <label>SEGURADORA:</label>
                <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
                  {dados.seguradora}
                </h1>
              </>
            </Col>
            <Col span={12}>
              <>
                <label>FIM DA VIGÊNCIA:</label>
                <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
                  {dados.fimVigencia}
                </h1>
              </>
            </Col>
            <Col span={12}>
              <>
                <label>HOUVE SINISTRO NESTA VIGÊNCIA:</label>
                <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
                  {dados.houveSinistro ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      SIM <FaCheck size={30} color={colors.success.default} style={{marginLeft: 10}} />
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      NÃO <FaTimes size={30} color={colors.danger.default} style={{marginLeft: 10}} />
                    </div>
                  )}
                </h1>
              </>
            </Col>
          </>
        )}
        <Divider />
        <Col span={24}>
          <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
            <u>DADOS DO VEÍCULO</u>
          </h1>
        </Col>
        <Col span={12}>
          <>
            <label>PLACA DO VEÍCULO:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.placa}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>CEP ONDE VEÍCLO DORME:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.CEPVeiculo}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>FINANCIADO:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.financiado ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  SIM <FaCheck size={30} color={colors.success.default} style={{marginLeft: 10}} />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  NÃO <FaTimes size={30} color={colors.danger.default} style={{marginLeft: 10}} />
                </div>
              )}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>BLINDADO:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.blindado ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  SIM <FaCheck size={30} color={colors.success.default} style={{marginLeft: 10}} />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  NÃO <FaTimes size={30} color={colors.danger.default} style={{marginLeft: 10}} />
                </div>
              )}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>TEM KIT GÁS:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.kitGas ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  SIM <FaCheck size={30} color={colors.success.default} style={{marginLeft: 10}} />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  NÃO <FaTimes size={30} color={colors.danger.default} style={{marginLeft: 10}} />
                </div>
              )}
            </h1>
          </>
        </Col>
        <Divider />
        <Col span={24}>
          <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
            <u>DADOS DO CONDUTOR</u>
          </h1>
        </Col>
        <Col span={24}>
          <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
            PRINCIPAL CONDUTOR
          </h1>
        </Col>
        <Col span={12}>
          <>
            <label>NOME:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.condutorPrincipal.nomeCompleto}
            </h1>
          </>
        </Col>
        {dados.principalCondutor === 'OUTRA PESSOA' && (
          <Col span={12}>
            <>
              <label>RELAÇÃO COM O SEGURADO:</label>
              <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
                {dados.condutorPrincipal.relacaoSegurado}
              </h1>
            </>
          </Col>
        )}
        <Col span={12}>
          <>
            <label>CPF:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.condutorPrincipal.CPF}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>DATA PRIMEIRA CNH:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.condutorPrincipal.data1CNH}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>ESTADO CÍVIL:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.condutorPrincipal.estadoCivil}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>PROFISSÃO:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.profissaoPrincipalCondutor}
            </h1>
          </>
        </Col>
        <Divider />
        <Col span={24}>
          <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
            <u>INFORMAÇÃO DA COTAÇÃO</u>
          </h1>
        </Col>
        <Col span={12}>
          <>
            <label>EXISTEM RESIDENTES OU DEPENDENTES COM IDADE ENTRE 17 OU 26 ANOS:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.dependenteMenor}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>USO DO VEÍCULO:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.usoVeiculo}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>RESIDE EM:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.residencia}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>GARAGEM NA RESIDÊNCIA:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.garagemResidencia}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>GARAGEM NO TRABALHO:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.garagemTrabalho}
            </h1>
          </>
        </Col>
        <Col span={12}>
          <>
            <label>GARAGEM NA ESCOLA:</label>
            <h1 style={{padding: 0, margin: 0, fontSize: '1.3rem', border: 'none', outlineStyle: 'none', fontWeight: 'bold', color: '#444'}}>
              {dados.garagemEscola}
            </h1>
          </>
        </Col>
        <Divider />
        <Row gutter={[10, 10]} style={{width: '100%'}}>
          <Col span={dados.status < 2 ? 12 : 24} style={{width: '100%'}}>
            <Button 
              block
              onClick={() => {
                if(dados.status === 0) {
                  iniciarCotacao(dados.uid);
                }else if(dados.status === 1) {
                  vincularSeguro(dados);
                }else if(dados.status === 2) {
                  verSeguro(dados);
                }
              }}
              style={{
                background: colors.primary.default,
                color: 'white',
                fontWeight: 'bold',
                outline: 'none',
                border: 'none',
                fontSize: '1.2rem',
                alignItems: 'center',
                alignContent: 'center',
                alignSelf: 'center',
                display: 'flex',
                justifyContent: 'center',
                height: 35,
                width: '100%',
                flex: 1
              }}
            >
              {dados.status === 0 ? 'INICIAR NEGOCIAÇÃO' :  dados.status < 2 ? 'CONCLUIR COTAÇÃO' : dados.status === 2 ? 'VER SEGURO' : 'VINCULAR SEGURO'}
            </Button>
          </Col>
          {dados.status < 2 && (
            <Col span={12}>
              <Button 
                onClick={() => apagarCotacao(dados.uid, setData)}
                block
                style={{
                  background: colors.danger.default,
                  color: 'white',
                  fontWeight: 'bold',
                  outline: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  alignItems: 'center',
                  alignContent: 'center',
                  alignSelf: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  height: 35
                }}
              >
                DELETAR COTAÇÃO
              </Button>
            </Col>
          )}
        </Row>
      </Row>
    </>
  )
}

export default Cotacao;