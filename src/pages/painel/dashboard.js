import React, { useState, useEffect } from 'react';
import Head from 'next/head';

import { Content } from 'antd/lib/layout/layout';

import LayoutAdmin from '../../components/Layout/Admin';

import { Row, Col } from 'antd';

import TableCotacao from '../../components/Table/Cotacao';

import useAuth from '../../hooks/useAuth';
import Router from 'next/router';

const Dashboard = () => {
  const { setCollapsedSideBar } = useAuth();

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);

    Router.push('/painel/cotacoes');
  }, []);

  const [qtdCotacoesTotal, setQtdCotacoesTotal] = useState(null);
  const [qtdCotacoesAguardando, setQtdCotacoesAguardando] = useState(null);
  const [qtdCotacoesIniciado, setQtdCotacoesIniciado] = useState(null);
  const [qtdCotacoesConcluido, setQtdCotacoesConcluido] = useState(null);
  const [qtdCotacaoAnual, setQtdCotacaoAnual] = useState(null);
  const [cotacoesList, setCotacoesList] = useState([]);

  const [yearSelected, setYearSelected] = useState(new Date().getFullYear());

  const [qtdAnos, setQtdAnos] = useState([]);

  const [cotacoesYearData, setCotacoesYearData] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [loadingArea, setLoadingArea] = useState(false);

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

  return (
    <LayoutAdmin title='PAINEL'>
      <Row gutter={[16, 20]}>
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