import React, { Fragment } from 'react';
import useAuth from '../../hooks/useAuth';

import Head from 'next/head';

import Login from './login';
import LoadingPage from './loading';

import Router from 'next/router';

const Index = () => {
  const { user, loading, logged, initial } = useAuth();

  if(user) {
    Router.push('/painel/dashboard')
    return (
      <Fragment>
        <Head>
          <title>CARREGANDO...</title>
        </Head>
        <LoadingPage />
      </Fragment>
    );
  }
  
  if(!user && !logged && !loading && !initial){
    return <Login />;
  }

  if(initial) {
    return (
      <Fragment>
        <Head>
          <title>CARREGANDO...</title>
        </Head>
        <LoadingPage />
      </Fragment>
    );
  }

  return <></>;
}

export default Index;