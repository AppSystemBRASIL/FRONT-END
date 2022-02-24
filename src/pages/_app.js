import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import { AuthProvider } from '../context/AuthContext';

import 'antd/dist/antd.css';
import '../styles/index.scss';
import '../styles/nprogress.scss';

Router.events.on('routeChangeStart', () => {
  NProgress.start();
});

Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

import { ThemeProvider } from 'styled-components';

import {
  ConfigProvider
} from 'antd';
import pt_BR from 'antd/lib/locale/pt_BR';

const theme = {
  colors: {
    red: {
      primary: '#CC0000',
      secondary: '#FF4C4C',
    }
  }
};

function MyApp({ Component, pageProps }) {
  return (
    <ConfigProvider locale={pt_BR}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Head>
            <link rel="shortcut icon" href="/logo.jpeg" />
            <link rel='stylesheet' href='https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css' />
          </Head>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </ConfigProvider>
  )
}

export default MyApp;