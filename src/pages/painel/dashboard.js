import React, { useState, useEffect } from 'react';
import Head from 'next/head';

import { Content } from 'antd/lib/layout/layout';

import LayoutAdmin from '../../components/Layout/Admin';

import { Row, Col, Divider, Select, Button, Empty } from 'antd';

import firebase from '../../auth/AuthConfig';

import TableCotacao from '../../components/Table/Cotacao';
import TableSeguro from '../../components/Table/Seguro';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import colors from '../../utils/colors';

const getQtdYearCotacao = async (ano) => {
  const yearStart = new Date(Number(ano), 0, 0);
  const yearEnd = new Date(Number(ano)+1, 0, 0, 12);

  return await firebase.firestore().collection('cotacoes').where('created', '>=', yearStart).where('created', '<=', yearEnd).get()
  .then((snap) => {
    return snap.size;
  });
}

const getYearCotacao = async (ano) => {
  const yearStart = new Date(Number(ano)+1, 0, 0);
  const yearEnd = new Date(Number(ano)+1, 0, 0, 12);

  const janeiro = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(0))).where('created', '<', new Date(yearStart.setMonth(1))).get()
  .then((snap) => {
    return snap.size;
  });

  const fevereiro = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(1))).where('created', '<', new Date(yearStart.setMonth(2))).get()
  .then((snap) => {
    return snap.size;
  });

  const marco = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(2))).where('created', '<', new Date(yearStart.setMonth(3))).get()
  .then((snap) => {
    return snap.size;
  });

  const abril = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(3))).where('created', '<', new Date(yearStart.setMonth(4))).get()
  .then((snap) => {
    return snap.size;
  });

  const maio = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(4))).where('created', '<', new Date(yearStart.setMonth(5))).get()
  .then((snap) => {
    return snap.size;
  });

  const junho = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(5))).where('created', '<', new Date(yearStart.setMonth(6))).get()
  .then((snap) => {
    return snap.size;
  });

  const julho = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(6))).where('created', '<', new Date(yearStart.setMonth(7))).get()
  .then((snap) => {
    return snap.size;
  });

  const agosto = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(7))).where('created', '<', new Date(yearStart.setMonth(8))).get()
  .then((snap) => {
    return snap.size;
  });

  const setembro = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(8))).where('created', '<', new Date(yearStart.setMonth(9))).get()
  .then((snap) => {
    return snap.size;
  });

  const outubro = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(9))).where('created', '<', new Date(yearStart.setMonth(10))).get()
  .then((snap) => {
    return snap.size;
  });

  const novembro = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(10))).where('created', '<', new Date(yearStart.setMonth(11))).get()
  .then((snap) => {
    return snap.size;
  });

  const dezembro = await firebase.firestore().collection('cotacoes').where('created', '>=', new Date(yearStart.setMonth(11))).where('created', '<=', yearEnd).get()
  .then((snap) => {
    return snap.size;
  });

  return [
    {
      label: 'JAN',
      value: janeiro
    },
    {
      label: 'FEV',
      value: fevereiro
    },
    {
      label: 'MAR',
      value: marco
    },
    {
      label: 'ABR',
      value: abril
    },
    {
      label: 'MAI',
      value: maio
    },
    {
      label: 'JUN',
      value: junho
    },
    {
      label: 'JUL',
      value: julho
    },
    {
      label: 'AGO',
      value: agosto
    },
    {
      label: 'SET',
      value: setembro
    },
    {
      label: 'OUT',
      value: outubro
    },
    {
      label: 'NOV',
      value: novembro
    },
    {
      label: 'DEZ',
      value: dezembro
    },
  ]
}

import useAuth from '../../hooks/useAuth';

const Dashboard = () => {
  const { user, corretora, setCollapsedSideBar } = useAuth();

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
  }, []);

  const [qtdCotacoesTotal, setQtdCotacoesTotal] = useState(null);
  const [qtdCotacoesAguardando, setQtdCotacoesAguardando] = useState(null);
  const [qtdCotacoesIniciado, setQtdCotacoesIniciado] = useState(null);
  const [qtdCotacoesConcluido, setQtdCotacoesConcluido] = useState(null);
  const [qtdCotacaoAnual, setQtdCotacaoAnual] = useState(null);
  const [cotacoesList, setCotacoesList] = useState([]);

  const cotacoesListLoading = [{}, {}, {}, {}, {}, {}, {}, {}];

  const [yearSelected, setYearSelected] = useState(new Date().getFullYear());

  const [qtdAnos, setQtdAnos] = useState([]);

  const [cotacoesYearData, setCotacoesYearData] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [loadingArea, setLoadingArea] = useState(false);

  useEffect(() => {
    (async () => {
      await firebase.firestore().collection('cotacoes').get()
      .then((snap) => {
        setQtdCotacoesTotal(snap.size);
      });

      await firebase.firestore().collection('cotacoes').where('status', '==', 0).get()
      .then((snap) => {
        setQtdCotacoesAguardando(snap.size);
      });

      await firebase.firestore().collection('cotacoes').where('status', '==', 1).get()
      .then((snap) => {
        setQtdCotacoesIniciado(snap.size);
      });

      await firebase.firestore().collection('cotacoes').where('status', '==', 2).get()
      .then((snap) => {
        setQtdCotacoesConcluido(snap.size);
      });

      await firebase.firestore().collection('cotacoes').orderBy('created', 'desc').limit(1).get()
      .then((snap) => {
        let data = {};
        
        if(!snap.empty) {
          snap.forEach((item) => {
            data = new Date(item.data().created.toDate()).getFullYear();
          })
        }

        setQtdAnos([]);

        for(let i = data; i <= new Date().getFullYear(); i++) {
          setQtdAnos(res => [...res, i]);
        }
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setCotacoesYearData(await getYearCotacao(yearSelected));
      setQtdCotacaoAnual(await getQtdYearCotacao(yearSelected));

      setLoadingArea(true);
    })();
  }, [yearSelected]);

  useEffect(() => {
    if(qtdCotacoesTotal !== null && qtdCotacoesAguardando !== null && qtdCotacoesIniciado !== null && qtdCotacoesConcluido !== null && qtdCotacaoAnual !== null && cotacoesYearData.length && cotacoesList.length) {
      setLoadingData(true);
    }
  }, [qtdCotacoesTotal, qtdCotacoesAguardando, qtdCotacoesIniciado, qtdCotacoesConcluido, qtdCotacaoAnual, cotacoesYearData, cotacoesList]);

  const CardComponent = ({children, style}) => {
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
  
  const Analistic = ({ title, value, subtitle, loading }) => {
    const valor = Number(value);
  
    return (
      <CardComponent
        style={{
          padding: '10px 10px',
          height: 70,
          alignSelf: 'center',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {loading ? (
            <>
              <h3 style={{color: colors.text.secondary, padding: 0, margin: 0}}>{String(title).toUpperCase()}</h3>
              <h6 style={{color: colors.text.primary, padding: 0, margin: 0}}>{String(subtitle).toUpperCase()}</h6>
            </>
          ) : (
            <>
              <div style={{width: 200, height: 20}} className='skeleton' />
              <div style={{marginTop: 5, width: 130, height: 10}} className='skeleton' />
            </>
          )}
        </div>
        <div
          className={!loading && 'skeleton'}
          style={{
            backgroundColor: colors.text.primary,
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 10,
            opacity: .8,
            fontSize: '1.7rem',
            color: 'white',
            fontWeight: '600'
          }}
        >
          {valor}
        </div>
      </CardComponent>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{backgroundColor: 'white', paddingTop: 10, paddingLeft: 10, paddingRight: 10, paddingBottom: .5, boxShadow: '1px 1px 10px #D1D1D1'}}>
          <p className="label">{`${label} | 2021`}<hr style={{margin: 0, padding: 0, marginBottom: 5, marginTop: 5, borderColor: '#333'}} /><center><h2>{payload[0].value}</h2></center></p>
        </div>
      );
    }
  
    return null;
  };  

  const COLORS = ['#808080', colors.success.default, colors.primary.default];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text key={index} x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <LayoutAdmin title='PAINEL'>
      <Row gutter={[16, 20]}>
        <Col span={24}>
          <Row gutter={[16, 20]}>
            <Col xs={12} md={6}>
              <Analistic loading={loadingData} title='COTAÇÕES TOTAIS' subtitle='Todas as suas contações' value={qtdCotacoesTotal} />
            </Col>
            <Col xs={12} md={6}>
              <Analistic loading={loadingData} title='COTAÇÕES EM AGUARDO' subtitle='Todas as contações pendentes' value={qtdCotacoesAguardando} />
            </Col>
            <Col xs={12} md={6}>
              <Analistic loading={loadingData} title='COTAÇÕES INICIADAS' subtitle='Todas as contações iniciadas' value={qtdCotacoesIniciado} />
            </Col>
            <Col xs={12} md={6}>
              <Analistic loading={loadingData} title='COTAÇÕES CONCLUÍDAS' subtitle='Todos os contações concluídos' value={qtdCotacoesConcluido} />
            </Col>
          </Row>
        </Col>
        <Col span={24} md={24}>
          <CardComponent>
            <Row
              style={{
                paddingTop: 5,
                paddingLeft: 20,
                paddingRight: 20,
                paddingBottom: 5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Col xs={24} md={20} style={{paddingTop: 15, paddingBottom: 5}}>
                {loadingData ? (
                  <>
                    <div style={{ lineHeight: 0, margin: 0, marginTop: 10, marginBottom: 5, padding: 0, color: colors.text.primary, fontSize: '1.7rem', fontWeight: '500', textTransform: 'uppercase' }}>Registro de Cotações</div>
                    {!loadingArea ? (
                      <div className={'skeleton'} style={{ width: 150, height: 15, marginTop: 15 }} />
                    ) : (
                      <div style={{margin: 0, padding: 0, lineHeight: 2.5, fontWeight: '500'}}><span style={{fontWeight: '600', color: (!loadingData || !loadingArea) ? 'transparent' : colors.text.primary}}>TOTAL: </span>{Number(qtdCotacaoAnual) === 0 ? 'NENHUM REGISTRO' : Number(qtdCotacaoAnual) > 9 ? qtdCotacaoAnual : String('0'+qtdCotacaoAnual)} {Number(qtdCotacaoAnual) !== 0 && 'COTAÇÕES'}</div>
                    )}
                  </>
                ) : (
                  <>
                    <div className={'skeleton'} style={{ width: 330, height: 30 }} />
                    <div className={'skeleton'} style={{ width: 150, height: 20, marginTop: 5 }} />
                  </>
                )}
              </Col>
              <Col xs={24} md={4} className={!loadingData && 'skeleton'} style={{
                display: 'flex',
                alignItems: 'center',
                height: !loadingData ? 30 : '100%'
              }}>
                {loadingData && (
                  <>
                    <span style={{marginRight: 10, color: colors.text.primary, fontSize: '1rem', fontWeight: '500'}}>ANO: </span>
                    <Select value={yearSelected} onChange={(e) => setYearSelected(e)} defaultValue={new Date().getFullYear()} style={{width: '100%'}}>
                      {qtdAnos.map((item, index) => (
                        <Select.Option value={item} key={index}>{item}</Select.Option>
                      ))}
                    </Select>
                  </>
                )}
              </Col>
            </Row>
            {(loadingData && loadingArea) && (
              <Divider style={{margin: 0, padding: 0, marginBottom: 20}} />
            )}
            <Row className={(!loadingData || !loadingArea) && 'skeleton'} style={{ height: 250 }}>
              {(loadingData && loadingArea) && (
                <>
                  {cotacoesYearData[0].value > 0
                  || cotacoesYearData[1].value > 0
                  || cotacoesYearData[2].value > 0
                  || cotacoesYearData[3].value > 0
                  || cotacoesYearData[4].value > 0
                  || cotacoesYearData[5].value > 0
                  || cotacoesYearData[6].value > 0
                  || cotacoesYearData[7].value > 0
                  || cotacoesYearData[8].value > 0
                  || cotacoesYearData[9].value > 0
                  || cotacoesYearData[10].value > 0
                  || cotacoesYearData[11].value > 0
                  ? (
                    <ResponsiveContainer width='100%' height={250}>
                      <AreaChart data={cotacoesYearData}
                        margin={{
                          bottom: 0,
                          left: -30,
                          right: 0,
                        }}
                      >
                        <XAxis style={{opacity: .8}} dataKey='label'  />
                        <YAxis style={{opacity: .8}} type='number' />
                        <CartesianGrid style={{opacity: .4}} />
                        <Tooltip content={CustomTooltip} />
                        <Area style={{opacity: .8}} type='monotone' dataKey='value' stroke={colors.text.secondary} fill={colors.text.primary} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        textAlign: 'center',
                        width: '100%',
                        marginBottom: 50
                      }}
                    >
                      <Empty 
                        
                        description={
                          <h1 style={{color: 'gray'}}>
                            NENHUM REGISTRO ENCONTRADO
                          </h1>
                        }
                      >
                        <Button 
                          style={{
                            background: 'gray',
                            color: 'white',
                            fontWeight: '700',
                            outline: 'none',
                            border: 'none'
                          }}
                          onClick={() => {
                            setYearSelected(new Date().getFullYear())
                          }}
                        >RESTAURAR</Button>
                      </Empty>
                    </div>
                  )}
                </>
              )}
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