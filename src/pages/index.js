import React, { useEffect } from 'react';
import Router from 'next/router';

const Index = () => {
  useEffect(() => Router.push('/painel'), []);

  return (
    <></>
  )
}

export default Index;