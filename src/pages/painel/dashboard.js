import React, { useEffect, useRef, useState } from 'react';

import LayoutAdmin from '../../components/Layout/Admin';

import { Row, Col, Input, DatePicker, Select, InputNumber, Button, Divider, Modal } from 'antd';

import TableCotacao from '../../components/Table/Cotacao';

import moment from 'moment';

import useAuth from '../../hooks/useAuth';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import firebase from '../../auth/AuthConfig';
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import { theme } from 'pages/_app';
import { FaPrint } from 'react-icons/fa';
import generateToken from 'hooks/generateToken';
import printListSeguros from 'components/PDF/ListSeguros';

export const options = {
  responsive: true
};

function diasNoMes(mes, ano) {
  return new Date(ano, mes, 0).getDate();
}

function getDates(month, year) {
  return Array.from({ length: diasNoMes(month, year) }).map((item, index) => `${String(index + 1).padStart(2, '0')}`);
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
);

const Dashboard = () => {
  const { setCollapsedSideBar, businessInfo } = useAuth();

  const [date, setDate] = useState([startOfMonth(new Date()), endOfMonth(new Date())]);

  const [dataSeguros, setDataSeguros] = useState([]);
  const [dataSegurosCancelados, setDataSegurosCancelados] = useState([]);

  const [seguradoras, setSeguradoras] = useState([]);

  const [anoAdesao, setAnoAdesao] = useState(null);
  const [seguradora, setSeguradora] = useState(null);

  const labels = getDates(new Date().getMonth(), new Date().getFullYear());

  const datePickerRef = useRef();

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);

    firebase.firestore().collection('seguradoras').get()
    .then((response) => {
      const array = [];

      response.forEach(item => array.push(item.data()));

      setSeguradoras(array);
    })
  }, []);

  useEffect(() => {
    if(!businessInfo) {
      return;
    }

    getSeguros();
  }, [businessInfo, date, seguradora, anoAdesao]);

  async function getSeguros() {
    setDataSeguros([]);
    setDataSegurosCancelados([]);

    let ref = firebase.firestore().collection('seguros').where('corretora.uid', '==', businessInfo.uid);

    if(seguradora) {
      ref = ref.where('seguradora.uid', '==', seguradora);
    }

    if(anoAdesao && String(anoAdesao)?.length === 4) {
      ref = ref.where('segurado.anoAdesao', '==', String(anoAdesao));
    }
    
    const refAtivos = ref.where('seguro.vigencia', '>=', startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), 1)))
    .where('seguro.vigencia', '<=', endOfDay(new Date(date ? date[1].getFullYear() : new Date().getFullYear(), date ? date[1].getMonth() : new Date().getMonth(), 1)))
    .orderBy('seguro.vigencia', 'asc');

    const refCancel = ref.where('cancelada', '>=', startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), 1)))
    .where('cancelada', '<=', endOfDay(new Date(date ? date[1].getFullYear() : new Date().getFullYear(), date ? date[1].getMonth() : new Date().getMonth(), 1)))
    .orderBy('cancelada', 'asc');

    await getDados(refAtivos, setDataSeguros);
    await getDados(refCancel, setDataSegurosCancelados);

    async function getDados(data, setData) {
      await data.get()
      .then((response) => {
        const array = [];

        response.forEach(item => array.push(item.data()));

        const dataTranted = array.map(item => ({
          ...item,
          seguro: {
            ...item.seguro,
            vigencia: new Date(item.seguro.vigencia.seconds * 1000),
            vigenciaFinal: new Date(item.seguro.vigenciaFinal.seconds * 1000)
          }
        }));

        setData(dataTranted);

        return dataTranted;
      });
    }
  }

  const data = {
    labels: labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()),
    datasets: [
      {
        fill: true,
        label: 'SEGUROS ATIVOS',
        data: labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()).map((item) => dataSeguros.filter(e => e.ativo).filter(e => e.seguro.vigencia >= startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item))) && e.seguro.vigencia <= endOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item)))).length),
        borderColor: theme.colors[businessInfo?.layout?.theme || 'blue']?.primary,
        backgroundColor: theme.colors[businessInfo?.layout?.theme || 'blue']?.secondary+'55',
      },
      {
        fill: true,
        label: 'SEGUROS CANCELADOS',
        data: labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()).map((item) => dataSegurosCancelados.filter(e => !e.ativo || cancelada).filter(e => e.seguro.vigencia >= startOfDay(new Date(date ? date[1].getFullYear() : new Date().getFullYear(), date ? date[1].getMonth() : new Date().getMonth(), Number(item))) && e.seguro.vigencia <= endOfDay(new Date(date ? date[1].getFullYear() : new Date().getFullYear(), date ? date[1].getMonth() : new Date().getMonth(), Number(item)))).length),
        borderColor: theme.colors[businessInfo?.layout?.theme || 'blue']?.primary,
        backgroundColor: theme.colors[businessInfo?.layout?.theme || 'blue']?.secondary,
      },
    ],
  };

  const CardComponent = ({ children, style }) => {
    return (
      <div
        style={{
          boxShadow: '1px 1px 10px #D1D1D1',
          border: '1px solid #D1D1D1',
          padding: 0,
          margin: 0,
          backgroundColor: '#FFFFFF',
          ...style
        }}
      >
        {children}
      </div>
    )
  }


  const totalSeguros = labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()).map((item) => dataSeguros.filter(e => e.ativo).filter(e => e.seguro.vigencia >= startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item))) && e.seguro.vigencia <= endOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item)))).length).reduce((a, b) => a + b, 0);
  const totalPremioNumber = labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()).map((item) => dataSeguros.filter(e => e.ativo).filter(e => e.seguro.vigencia >= startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item))) && e.seguro.vigencia <= endOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item)))).reduce((a, b) => a + b.valores.premio, 0)).reduce((a, b) => a + b, 0);
  const totalPremioLiquido = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPremioNumber);
  const mediaPremioLiquido = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()).map((item) => dataSeguros.filter(e => e.ativo).filter(e => e.seguro.vigencia >= startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item))) && e.seguro.vigencia <= endOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item)))).reduce((a, b) => a + b.valores.premio, 0)).reduce((a, b) => a + b, 0) / totalSeguros) || 0);

  const comissaoNumber = labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()).map((item) => dataSeguros.filter(e => e.ativo).filter(e => e.seguro.vigencia >= startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item))) && e.seguro.vigencia <= endOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item)))).reduce((a, b) => a + b.valores.comissao, 0)).reduce((a, b) => a + b, 0);
  const totalComissao = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comissaoNumber);
  const mediaComissao = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comissaoNumber / totalSeguros);
  const percentualComissao = (comissaoNumber / totalPremioNumber) * 100;

  const totalSegurosCancelados = labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()).map((item) => dataSegurosCancelados.filter(e => e.cancelada >= startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item))) && e.cancelada <= endOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item)))).length).reduce((a, b) => a + b, 0);
  const totalPremioNumberCancelados = labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()).map((item) => dataSegurosCancelados.filter(e => e.cancelada >= startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item))) && e.cancelada <= endOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item)))).reduce((a, b) => a + b.valores.premio, 0)).reduce((a, b) => a + b, 0);
  const totalPremioLiquidoCancelados = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPremioNumberCancelados);
  const mediaPremioLiquidoCancelados = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()).map((item) => dataSegurosCancelados.filter(e => e.cancelada >= startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item))) && e.cancelada <= endOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item)))).reduce((a, b) => a + b.valores.premio, 0)).reduce((a, b) => a + b, 0) / totalSegurosCancelados) || 0);

  const comissaoNumberCancelados = labels.slice(!date ? 0 : new Date(date[0]).getDate() - 1, !date ? 31 : new Date(date[1]).getDate()).map((item) => dataSegurosCancelados.filter(e => e.cancelada >= startOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item))) && e.cancelada <= endOfDay(new Date(date ? date[0].getFullYear() : new Date().getFullYear(), date ? date[0].getMonth() : new Date().getMonth(), Number(item)))).reduce((a, b) => a + b.valores.comissao, 0)).reduce((a, b) => a + b, 0);
  const totalComissaoCancelados = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comissaoNumberCancelados);
  const mediaComissaoCancelados = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comissaoNumberCancelados / totalSegurosCancelados);
  const percentualComissaoCancelados = ((comissaoNumberCancelados / totalPremioNumberCancelados) || 0) * 100;

  const printPerformance = async () => await printListSeguros(dataSeguros?.map(item => ({...item, key: generateToken(), seguro: { ...item.seguro, vigenciaFinal: moment(item.seguro.vigenciaFinal) } })).sort((a, b) => a.segurado.nome.toLowerCase().localeCompare(b.segurado.nome.toLowerCase())).sort((a, b) => a.seguro.vigenciaFinal - b.seguro.vigenciaFinal), businessInfo.uid, {
    date: [
      moment(date[0]),
      moment(date[1])
    ],
    corretor: businessInfo.razao_social,
    seguradora: !seguradora ? null : seguradoras.filter(e => e.uid === seguradora)[0].razao_social.split(' ')[0]
  });

  if(!businessInfo) {
    return <></>;
  }

  return (
    <LayoutAdmin title='PAINEL'>
      <Row gutter={[16, 20]}>
        <Col span={24}>
          <CardComponent style={{ padding: 20 }}>
            <Row gutter={[16, 0]}>
              <Col span={24}>
                <CardComponent>
                  <Row gutter={[16, 0]}>
                    <Col span={24}>
                      <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        alignItems: 'flex-end',
                        padding: 20,
                        paddingBottom: 0
                      }}>
                        <div>
                          <label>SEGURADORA:</label>
                          <br/>
                          {seguradora}
                          <Select style={{ width: 200 }} value={seguradora} onChange={setSeguradora}>
                            <Select.Option value={null}>
                              {businessInfo?.razao_social}
                            </Select.Option>
                            {seguradoras.map((item, index) => (
                              <Select.Option key={index} value={item.uid}>
                                {item.razao_social}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                        <div>
                          <label>PERIODO:</label>
                          <br/>
                          <DatePicker.RangePicker ref={datePickerRef} value={!date ? null : [moment(date[0]), moment(date[1])]} format='DD/MM/YYYY' onChange={value => {
                            if(!value) {
                              setDate(null)
                            }else {
                              const valueFirst = startOfDay(new Date(value[0]));
                              const valueLast = endOfDay(new Date(value[1]));

                              const endMonth = endOfMonth(valueFirst);

                              if(valueLast > endMonth) {
                                alert('A data final não pode ser maior que a data final do mês de busca');
                                console.log(datePickerRef.current);
                              }else {
                                setDate([valueFirst, valueLast]);
                              }
                            }
                          }}/>
                        </div>
                        <div>
                          <label>ANO DE ADESÃO:</label>
                          <br/>
                          <InputNumber style={{ width: 150 }} value={anoAdesao} min={2000} max={new Date().getFullYear()} onChange={setAnoAdesao} />
                        </div>
                        {(seguradora || date || anoAdesao) && (
                          <label
                            onClick={() => {
                              setDate([startOfMonth(new Date()), endOfMonth(new Date())]);
                              setSeguradora(null);
                              setAnoAdesao(null);

                              getSeguros();
                            }}
                            style={{
                              color: theme.colors[businessInfo?.layout?.theme].primary,
                              cursor: 'pointer'
                            }}
                          >
                            RESETAR
                          </label>
                        )}
                      </div>
                      {(totalSeguros > 0 && date) && (
                        <FaPrint
                          style={{
                            position: 'absolute',
                            top: 15,
                            right: 30
                          }}
                          size={20}
                          cursor='pointer'
                          onClick={printPerformance}
                        />
                      )}
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', textAlign: 'center', padding: 20 }}>
                        <div style={{ width: '30%', background: '#fff', border: '1px solid rgba(0, 0, 0, .2)', padding: '10px 0', borderRadius: 5 }}>
                          TOTAL DE SEGUROS
                          <br/>
                          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>
                            {totalSeguros}
                          </span>
                        </div>
                        <div style={{ width: '70%', background: '#fff', border: '1px solid rgba(0, 0, 0, .2)', padding: '10px 0', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                          <div>
                            TOTAL DE PRÊMIO LÍQUIDO
                            <br/>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>
                            {totalPremioLiquido}
                            </span>
                          </div>
                          <Divider style={{ borderColor: 'rgba(0, 0, 0, .2)' }} type='vertical' />
                          <div>
                            MÉDIA DO PRÊMIO LÍQUIDO
                            <br/>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>
                              {mediaPremioLiquido}
                            </span>
                          </div>
                        </div>
                        <div style={{ width: '100%', background: '#fff', border: '1px solid rgba(0, 0, 0, .2)', padding: '10px 0', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                          <div>
                            TOTAL DAS COMISSÕES
                            <br/>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>
                              {totalComissao}
                            </span>
                          </div>
                          <Divider style={{ borderColor: 'rgba(0, 0, 0, .2)' }} type='vertical' />
                          <div>
                            VALOR MÉDIO DAS COMISSÕES
                            <br/>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>
                              {mediaComissao}
                            </span>
                          </div>
                          <Divider style={{ borderColor: 'rgba(0, 0, 0, .2)' }} type='vertical' />
                          <div>
                            MÉDIA DAS COMISSÕES
                            <br/>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>
                              {(percentualComissao || 0).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row> 
                </CardComponent>
              </Col>
            </Row>
            <Row
              gutter={[16, 20]}
              style={{ marginTop: 20 }}
            >
              <Col span={18}>
                <CardComponent>
                  <Line height={100} title='RELATÓRIO DE VENDAS' options={options} data={data}
                    style={{
                      marginTop: 30,
                      padding: 20
                    }}
                  />
                </CardComponent>
              </Col>
              <Col span={6}>
                <Row gutter={[10, 23.6]}>
                  <Col span={24}>
                    <CardComponent>
                      <div style={{ width: '100%', background: '#fff', padding: '10px 0', textAlign: 'center' }}>
                        TOTAL DE SEGUROS CANCELADOS
                        <br/>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>
                          {totalSegurosCancelados}
                        </span>
                      </div>
                    </CardComponent>
                  </Col>
                  <Col span={24}>
                    <CardComponent>
                      <div style={{ width: '100%', background: '#fff', padding: '10px 0', textAlign: 'center' }}>
                        TOTAL DE PRÊMIO LÍQUIDO CANCELADO
                        <br/>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>
                          {totalPremioLiquidoCancelados}
                        </span>
                      </div>
                    </CardComponent>
                  </Col>
                  <Col span={24}>
                    <CardComponent>
                      <div style={{ width: '100%', background: '#fff', padding: '10px 0', textAlign: 'center' }}>
                        MÉDIA DO PRÊMIO LÍQUIDO CANCELADO
                        <br/>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>
                          {mediaPremioLiquidoCancelados}
                        </span>
                      </div>
                    </CardComponent>
                  </Col>
                  <Col span={24}>
                    <CardComponent>
                      <div style={{ width: '100%', background: '#fff', padding: '10px 0', textAlign: 'center' }}>
                        TOTAL DE COMISSÕES CANCELADAS
                        <br/>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>
                          {totalComissaoCancelados}
                        </span>
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 5,
                            right: 20
                          }}
                        >
                          {percentualComissaoCancelados}%
                        </span>
                      </div>
                    </CardComponent>
                  </Col>
                </Row>
              </Col>
            </Row>
          </CardComponent>
        </Col>
        <Col span={24}>
          <CardComponent>
            <TableCotacao />
          </CardComponent>
        </Col>
      </Row>
    </LayoutAdmin>
  );
}

export default Dashboard;