import React, { Fragment, useEffect, useState } from 'react';
import Head from 'next/head';
import { Alert, Button, Image, notification, Select } from 'antd';

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBusinessTime,
  FaUserAlt,
  FaIdCard,
  FaPhoneAlt
} from 'react-icons/fa';

import styled from 'styled-components';

import Colors from '../../utils/colors';

import useAuth from '../../hooks/useAuth';
import Router from 'next/router';

import firebase from '../../auth/AuthConfig';

const Login = () => {
  const [modeView, setModeView] = useState('sign-in-mode');
  const [typeFormSecondary, setTypeFormSecondary] = useState('cadastrar');
  const [formSecondary, setFormSecondary] = useState(false);

  const [viewPassword, setViewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);

  const [sendEmail, setSendEmail] = useState({
    status: false,
    email: null,
  });

  const [corretoras, setCorretoras] = useState([]);

  useEffect(() => {
    firebase.firestore().collection('corretoras').onSnapshot(snapshot => {
      const array = [];
      
      if(!snapshot.empty) {
        snapshot.forEach(doc => {
          array.push(doc.data());
        });
      }

      setCorretoras(array);
    });
  }, []);

  const [corretora, setCorretora] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [CPF, setCPF] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaRepeat, setSenhaRepeat] = useState('');

  const { user, signIn, signUp, forgOut, logged, initial, signOut } = useAuth();

  useEffect(() => {
    if(user) {
      Router.push('/painel/dashboard');
    }
  }, [logged]);

  useEffect(() => {
    setTimeout(() => {
      if(modeView === 'sign-up-mode') {
        setFormSecondary(true);
        setViewPassword(true);
      }else {
        setFormSecondary(false);
        setViewPassword(false);
      }

      setCorretora('');
      setNomeCompleto('');
      setCPF('');
      setTelefone('');
      setEmail('');
      setSenha('');
      setSenhaRepeat('');

      document.querySelectorAll('.input-field').forEach((doc) => {
        doc.classList.remove('invalid');
      });
    }, 1000);
  }, [modeView]);

  const acessar = async () => {
    setLoading(true);
    setLoadingType('loading');

    setSendEmail({
      status: false,
      email: null,
    });

    if(!email || !senha){
      if(!email) {
        notification.info({
          message: 'PREENCHA O EMAIL',
        })
      }else {
        if(!validateEmail()){
          notification.warn({
            message: 'DADOS INVÁLIDOS',
            description: 'O endereço de email é inválido'
          });

          document.getElementById('email').focus();
        }
      }

      if(!senha) {
        notification.info({
          message: 'PREENCHA A SENHA',
        });

        document.getElementById('senha').focus();
      }

      if(!email && !senha) {
        document.getElementById('email').focus();
      }

      setLoading(false);
      setLoadingType(null);

      return;
    }

    if(!validateEmail()){
      notification.warn({
        message: 'DADOS INVÁLIDOS',
        description: 'O endereço de email é inválido'
      });

      document.getElementById('email').focus();

      setLoading(false);
      setLoadingType(null);

      return;
    }

    const response = await signIn(email, senha);
    
    if(response && response.code){
      setLoadingType('error');
    }else if(response && response.emailVerified){
      setLoadingType('success');
    }else {
      setLoadingType('warning');
      setEmail('');
      setSenha('');
      setSendEmail({
        status: true,
        email: response.email,
      });
    }

    setLoading(false);

    setTimeout(() => {
      setLoadingType(null);
    }, 3000);
  }

  const recuperar = async () => {
    setLoading(true);
    setLoadingType('loading');

    if(!email){
      if(!email) {
        notification.info({
          message: 'PREENCHA O EMAIL',
        });

        document.getElementById('email1').focus();
      }else {
        if(!validateEmail()){
          notification.warn({
            message: 'DADOS INVÁLIDOS',
            description: 'O endereço de email é inválido'
          });

          document.getElementById('email1').focus();
        }
      }

      setLoading(false);
      setLoadingType(null);

      return;
    }

    if(!validateEmail()){
      notification.warn({
        message: 'DADOS INVÁLIDOS',
        description: 'O endereço de email é inválido'
      });

      document.getElementById('email1').focus();

      setLoading(false);
      setLoadingType(null);

      return;
    }

    const response = await forgOut(email);

    if(response && response.code){
      setLoadingType('error');
    }else {
      setLoadingType('success');
    }

    setLoading(false);
    setEmail('');

    setTimeout(() => {
      setLoadingType(null);
    }, 3000);
  }

  const maskOnlyLetters = value => {
    return value.replace(/[0-9!@#¨$%^&*)(+=._-]+/g, "");
  };

  const validateEmail = () => (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(email);

  const validateCPF = () => (/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/).test(CPF);

  const validateTelefone = () => (/\(\d{2}\)\s\d{4,5}\-\d{4}/g).test(telefone);

  const maskCPF = value => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const maskPhone = value => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})/, "$1-$2");
  };

  const solicitar = async () => {
    if(!corretora) {
      notification.warn({
        message: 'Selecione sua corretora parceira',
        description: 'Selecione a sua corretora',
      });

      if(!document.getElementById('corretoraInput').classList.contains('invalid')){
        document.getElementById('corretoraInput').classList.toggle('invalid');
      }
    }

    if(!nomeCompleto.split(' ')[1]) {
      notification.warn({
        message: 'Nome inválido',
        description: 'Preencha ao menos um sobrenome',
      });

      if(!document.getElementById('nomeCompletoInput').classList.contains('invalid')){
        document.getElementById('nomeCompletoInput').classList.toggle('invalid');
      }
    }

    if(!validateCPF()) {
      notification.warn({
        message: 'CPF inválido',
        description: 'Preencha corretamento seu CPF',
      });

      if(!document.getElementById('CPFInput').classList.contains('invalid')){
        document.getElementById('CPFInput').classList.toggle('invalid');
      }
    }

    if(!validateTelefone()) {
      notification.warn({
        message: 'Telefone inválido',
        description: 'Preencha corretamento seu telefone',
      });

      if(!document.getElementById('TelefoneInput').classList.contains('invalid')){
        document.getElementById('TelefoneInput').classList.toggle('invalid');
      }
    }

    if(!validateEmail()) {
      notification.warn({
        message: 'Email inválido',
        description: 'Preencha corretamento seu email',
      });

      if(!document.getElementById('EmailInput').classList.contains('invalid')){
        document.getElementById('EmailInput').classList.toggle('invalid');
      }
    }

    if(senha.length < 6) {
      if(!document.getElementById('senhaInput').classList.contains('invalid')){
        document.getElementById('senhaInput').classList.toggle('invalid');
      }
    }

    if(senhaRepeat.length < 6) {
      if(!document.getElementById('senhaRepeatInput').classList.contains('invalid')){
        document.getElementById('senhaRepeatInput').classList.toggle('invalid');
      }
    }

    if(senha.length < 6 || senhaRepeat.length < 6) {
      notification.warn({
        message: 'Senhas inválidas',
        description: 'As senhas precisam conter pelo menos 6 caracteres',
      });
    }

    if((senha.length > 5 && senhaRepeat.length > 5) && (senha !== senhaRepeat)) {
      notification.warn({
        message: 'As senhas não conferem',
        description: 'As senhas precisam ser iguais para confirmação de senha',
      });

      if(!document.getElementById('senhaInput').classList.contains('invalid')){
        document.getElementById('senhaInput').classList.toggle('invalid');
      }
      if(!document.getElementById('senhaRepeatInput').classList.contains('invalid')){
        document.getElementById('senhaRepeatInput').classList.toggle('invalid');
      }
    }

    if(!corretora || !nomeCompleto.split(' ')[1] || !validateCPF() || !validateTelefone() || !validateEmail() || senha.length < 6 || senhaRepeat.length < 6) {
      return;
    }

    setLoading(true);
    setLoadingType('loading');

    const data = {
      corretora,
      nomeCompleto,
      cpf: CPF,
      telefone,
      email,
      senha
    }

    const response = await signUp(data);

    if(response === 'CADASTRADO') {
      setCorretora(null);
      setNomeCompleto('');
      setCPF('');
      setTelefone('');
      setEmail('');
      setSenha('');
      setSenhaRepeat('');

      notification.success({
        message: 'SOLICITADO COM SUCESSO',
        description: [
          <>
            AGUARDE. EM ATÉ 24HORAS VOCÊ SERÁ INFORMADO SOBRE SUA SOLICITAÇÃO.
            <br/>
            NÃO ESQUEÇA DE VERIFICAR SEU EMAIL.
          </>
        ]
      });

      setLoadingType('success');
      setLoading(false);
    }else {
      setLoadingType('error');
      setLoading(false);
    }

    setTimeout(() => {
      signOut();
      setLoading(false);
      setLoadingType(null);
    }, 3000);
  }

  if((!user || logged === false) && !initial){
    return (
      <Fragment>
        <Head>
          <title>{modeView === 'sign-in-mode' ? 'LOGIN' : 'CADASTRAR'} - SEGURO APPSYSTEM-BRAISL</title>
        </Head>
        <Container className={modeView}>
          <div className='forms-container'>
            <div className='signin-signup'>
              <div className='sign-form signin'>
                <h2 className='title'>FAZER LOGIN</h2>
                {sendEmail.status && (
                  <Alert style={{textAlign: 'center'}} type='warning' message={
                    <span>Foi reenviado um email de verificação de perfil para seu email: <b>{sendEmail.email}</b></span>
                  } />
                )}
                <div className='input-field'>
                  <div className='i'>
                    <FaEnvelope />
                  </div>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    autoComplete='off'
                    onChange={(e) => setEmail(String(e.target.value).toUpperCase())}
                    onKeyPress={(e) => {
                      const keyCode = e.key;
  
                      if(keyCode === ' ') {
                        e.preventDefault();
                      }
  
                      if(e.code === 'Enter') {
                        document.getElementById('senha').focus();
                      }
                    }}
                    placeholder='Email'
  
                  />
                </div>
                <div className='input-field password'>
                  <div className='i'>
                    <FaLock />
                  </div>
                  <input
                    id='senha'
                    type={!viewPassword ? 'password' : 'text'}
                    value={senha}
                    autoComplete='off'
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyPress={(e) => {
                      const keyCode = e.key;
  
                      if(keyCode === ' ') {
                        e.preventDefault();
                      }
  
                      if(e.code === 'Enter') {
                        acessar();
                      }
                    }}
                    placeholder='Senha'
                  />
                  <div className='i viewPassword'>
                    {viewPassword ? <FaEye onClick={() => setViewPassword(false)} /> : <FaEyeSlash onClick={() => setViewPassword(true)} />}
                  </div>
                </div>
                <Button style={{ width: '80%' }} className={`btn solid ${loadingType}`} loading={loading} disabled={loadingType ? true : false} onClick={acessar}>
                  {loadingType === 'loading' ? 'CARREGANDO' : loadingType === 'success' ? 'ACESSANDO...' : loadingType === 'error' ? 'FALHOU' : loadingType === 'warning' ?'VERIFICAR EMAIL' : 'ACESSAR'}
                </Button>
              </div>
  
              <div style={{ display: typeFormSecondary === 'cadastrar' && formSecondary ? 'flex' : 'none' }} className='sign-form signup'>
                <h2 className='title'>SOLICITAR ACESSO</h2>
                <div id='corretoraInput' className='input-field'>
                  <span className='info-danger'>
                    {corretora !== '' ? 'Campo inválido' : 'Campo não preenchido'}
                  </span>
                  <div className='i'>
                    <FaBusinessTime />
                  </div>
                  <Select
                  style={{ color: corretora !== '' ? '#010101' : '#AAAAAA', fontWeight: corretora !== '' ? '600' : '500', outline: 'none'}}
                  showSearch
                  id='selectCorretoraLogin'
                  onChange={(e) => setCorretora(e)}
                  optionFilterProp="children"
                  onBlur={(e) => {
                    if(corretora) {
                      if(corretora !== '') {
                        document.getElementById('nomeCompleto').focus();
                        e.target.parentElement.parentElement.parentElement.parentElement.classList.remove('invalid');
                      }else {
                        if(!e.target.parentElement.parentElement.parentElement.parentElement.classList.contains('invalid')) {
                          e.target.parentElement.parentElement.parentElement.parentElement.classList.toggle('invalid');
                        }
                      }
                    }else {
                      e.target.parentElement.parentElement.parentElement.parentElement.classList.remove('invalid');
                    }
                  }}
                  filterOption={(input, option) => {
                    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 && option.key !== null
                  }}
                  placeholder='SELECIONAR CORRETORA'
                  value={corretora}>
                    <Select.Option value={null}>SELECIONAR CORRETORA</Select.Option>
                    {corretoras && corretoras.map((item, key) => (
                      <Select.Option key={key} value={item.uid}>{item.razao_social}</Select.Option>
                    ))}
                  </Select>
                </div>
                <div id='nomeCompletoInput' className='input-field'>
                  <span className='info-danger'>
                    {nomeCompleto ? 'Campo inválido' : 'Campo não preenchido'}
                  </span>
                  <div className='i'>
                    <FaUserAlt />
                  </div>
                  <input
                    id='nomeCompleto'
                    type='text'
                    value={nomeCompleto}
                    autoComplete='off'
                    onChange={(e) => setNomeCompleto(String(maskOnlyLetters(e.target.value)).toUpperCase())}
                    onBlur={(e) => {
                      if(nomeCompleto){
                        if(nomeCompleto.split(' ')[1]) {
                          e.target.parentElement.classList.remove('invalid');
                          document.getElementById('cpf').focus();
                        }else {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                        }
                      }else {
                        e.target.parentElement.classList.remove('invalid');
                      }
                    }}
                    onKeyPress={(e) => {
                      if(e.code === 'Enter') {
                        if(nomeCompleto.split(' ')[1]) {
                          e.target.parentElement.classList.remove('invalid');
                          document.getElementById('cpf').focus();
                        }else {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                        }
                      }
                    }}
                    placeholder='Nome Completo'
                  />
                </div>
                <div id='CPFInput' className='input-field'>
                  <span className='info-danger'>
                    {CPF ? 'Campo inválido' : 'Campo não preenchido'}
                  </span>
                  <div className='i'>
                    <FaIdCard />
                  </div>
                  <input
                    id='cpf'
                    type='tel'
                    value={CPF}
                    autoComplete='off'
                    onChange={(e) => setCPF(maskCPF(e.target.value))}
                    onBlur={(e) => {
                      if(CPF) {
                        if(!validateCPF()) {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }

                          return;
                        }

                        e.target.parentElement.classList.remove('invalid');
                        document.getElementById('telefone').focus();
                      }else {
                        e.target.parentElement.classList.remove('invalid');
                      }
                    }}
                    onKeyPress={(e) => {
                      if(e.code === 'Enter') {
                        if(!validateCPF()) {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }

                          return;
                        }

                        e.target.parentElement.classList.remove('invalid');
                        document.getElementById('telefone').focus();
                      }
                    }}
                    placeholder='CPF - Pessoa física'
                  />
                </div>
                <div id='TelefoneInput' className='input-field'>
                  <span className='info-danger'>
                    {telefone ? 'Campo inválido' : 'Campo não preenchido'}
                  </span>
                  <div className='i'>
                    <FaPhoneAlt />
                  </div>
                  <input
                    id='telefone'
                    type='tel'
                    value={telefone}
                    autoComplete='off'
                    maxLength={15}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    onBlur={(e) => {
                      if(telefone) {
                        if(!validateTelefone()) {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }

                          return;
                        }

                        e.target.parentElement.classList.remove('invalid');
                        document.getElementById('email1').focus();
                      }else {
                        e.target.parentElement.classList.remove('invalid');
                      }
                    }}
                    onKeyPress={(e) => {
                      if(e.code === 'Enter') {
                        if(!validateTelefone()) {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }

                          return;
                        }

                        e.target.parentElement.classList.remove('invalid');
                        document.getElementById('email1').focus();
                      }
                    }}
                    placeholder='Telefone para contato'
                  />
                </div>
                <div id='EmailInput' className='input-field'>
                  <span className='info-danger'>
                    {email ? 'Campo inválido' : 'Campo não preenchido'}
                  </span>
                  <div className='i'>
                    <FaEnvelope />
                  </div>
                  <input
                    id='email1'
                    type='email'
                    value={email}
                    autoComplete='off'
                    onChange={(e) => setEmail(String(e.target.value).toUpperCase())}
                    onBlur={(e) => {
                      if(email) {
                        if(!email) {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                          return;
                        }

                        if(!validateEmail(email)){
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                          return;
                        }

                        e.target.parentElement.classList.remove('invalid');
                        document.getElementById('senha1').focus();
                      }else {
                        e.target.parentElement.classList.remove('invalid');
                      }
                    }}
                    onKeyPress={(e) => {
                      const keyCode = e.key;
  
                      if(keyCode === ' ') {
                        e.preventDefault();
                      }
  
                      if(e.code === 'Enter') {
                        if(!email) {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                          return;
                        }

                        if(!validateEmail(email)){
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                          return;
                        }

                        e.target.parentElement.classList.remove('invalid');
                        document.getElementById('senha1').focus();
                      }
                    }}
                    placeholder='Email'
                  />
                </div>
                <div id='senhaInput' className='input-field password'>
                  <span className='info-danger'>
                    {senha ? 'Campo inválido' : 'Campo não preenchido'}
                  </span>
                  <div className='i'>
                    <FaLock />
                  </div>
                  <input
                    id='senha1'
                    type={!viewPassword ? 'password' : 'text'}
                    value={senha}
                    autoComplete='off'
                    onBlur={(e) => {
                      if(senha) {
                        if(senha.length > 5) {
                          e.target.parentElement.classList.remove('invalid');
                        }else {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                        }
                      }else {
                        e.target.parentElement.classList.remove('invalid');
                      }
                    }}
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyPress={(e) => {
                      const keyCode = e.key;
  
                      if(keyCode === ' ') {
                        e.preventDefault();
                      }
  
                      if(e.code === 'Enter') {
                        if(senha.length > 5) {
                          e.target.parentElement.classList.remove('invalid');
                          document.getElementById('senhaRepeat').focus();
                        }else {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                        }
                      }
                    }}
                    placeholder='Senha'
                  />
                  <div className='i viewPassword'>
                    {viewPassword ? <FaEye onClick={() => setViewPassword(false)} /> : <FaEyeSlash onClick={() => setViewPassword(true)} />}
                  </div>
                </div>
                <div id='senhaRepeatInput' className='input-field password'>
                  <span className='info-danger'>
                    {senhaRepeat ? 'Campo inválido' : 'Campo não preenchido'}
                  </span>
                  <div className='i'>
                    <FaLock />
                  </div>
                  <input
                    id='senhaRepeat'
                    type={!viewPassword ? 'password' : 'text'}
                    value={senhaRepeat}
                    autoComplete='off'
                    onBlur={(e) => {
                      if(senhaRepeat) {
                        if(senhaRepeat.length > 5) {
                          e.target.parentElement.classList.remove('invalid');
                        }else {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                        }
                      }else {
                        e.target.parentElement.classList.remove('invalid');
                      }
                    }}
                    onChange={(e) => setSenhaRepeat(e.target.value)}
                    onKeyPress={(e) => {
                      const keyCode = e.key;
  
                      if(keyCode === ' ') {
                        e.preventDefault();
                      }
  
                      if(e.code === 'Enter') {
                        if(senhaRepeat.length > 5) {
                          e.target.parentElement.classList.remove('invalid');
                          solicitar();
                        }else {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                        }
                      }
                    }}
                    placeholder='Repetir a senha'
                  />
                  <div className='i viewPassword'>
                    {viewPassword ? <FaEye onClick={() => setViewPassword(false)} /> : <FaEyeSlash onClick={() => setViewPassword(true)} />}
                  </div>
                </div>
                <Button style={{width: '80%'}} className={`btn solid ${loadingType}`} loading={loading} disabled={loadingType ? true : false} onClick={solicitar}>
                  {loadingType === 'loading' ? 'CARREGANDO' : loadingType === 'success' ? 'SOLICITADO' : loadingType === 'error' ? 'FALHOU' : 'SOLICITAR'}
                </Button>
              </div>

              <div style={{ display: typeFormSecondary === 'recuperar' && formSecondary ? 'flex' : 'none' }} className='sign-form signup'>
                <h2 className='title'>RECUPERAR ACESSO</h2>
                <div className='input-field'>
                  <span className='info-danger'>
                    {email ? 'Campo inválido' : 'Campo não preenchido'}
                  </span>
                  <div className='i'>
                    <FaEnvelope />
                  </div>
                  <input
                    id='email2'
                    type='email'
                    value={email}
                    autoComplete='off'
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={(e) => {
                      if(email) {
                        if(!email) {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                          return;
                        }

                        if(!validateEmail(email)){
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                          return;
                        }

                        e.target.parentElement.classList.remove('invalid');
                      }else {
                        e.target.parentElement.classList.remove('invalid');
                      }
                    }}
                    onKeyPress={(e) => {
                      const keyCode = e.key;
  
                      if(keyCode === ' ') {
                        e.preventDefault();
                      }
  
                      if(e.code === 'Enter') {
                        if(!email) {
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                          return;
                        }

                        if(!validateEmail(email)){
                          if(!e.target.parentElement.classList.contains('invalid')) {
                            e.target.parentElement.classList.toggle('invalid');
                          }
                          return;
                        }

                        e.target.parentElement.classList.remove('invalid');
                        recuperar();
                      }
                    }}
                    placeholder='Email'
                  />
                </div>
                <Button style={{width: '80%'}} className={`btn solid ${loadingType}`} loading={loading} disabled={loadingType ? true : false} onClick={recuperar}>
                  {loadingType === 'loading' ? 'CARREGANDO' : loadingType === 'success' ? 'EMAIL ENVIADO' : loadingType === 'error' ? 'FALHOU' : 'RECUPERAR'}
                </Button>
              </div>
            </div>
          </div>
          <div className='panels-container'>
            <div className='panel left'>
              <div className='content'>
                <h3>SOLICITAR OU RECUPERAR</h3>
                <p>Siga os passos para solicitar ou recuperar seu <br/> acesso na plataforma</p>
                <Button style={{ marginRight: 10 }} className='btn transparent' onClick={() => {setModeView('sign-up-mode'); setTypeFormSecondary('cadastrar')}}>SOLICITAR</Button>
                OU
                <Button style={{ marginLeft: 10 }} className='btn transparent' onClick={() => {setModeView('sign-up-mode'); setTypeFormSecondary('recuperar')}}>RECUPERAR</Button>
              </div>
              <Image preview={false} className='imagem' src='/undraw_Data_trends_re_2cdy.svg' alt='imagem' layout='fill' />
            </div>
            <div className='panel right'>
              <div className='content'>
                <h3>JÁ POSSUI UM ACESSO?</h3>
                <p>Informe suas credências de acesso ou recuperarção de <br/> perfil na plataforma</p>
                <Button style={{ marginRight: 10 }} className='btn transparent' onClick={() => typeFormSecondary === 'cadastrar' ? setTypeFormSecondary('recuperar') : setTypeFormSecondary('cadastrar') }>
                  {typeFormSecondary === 'cadastrar' ? 'RECUPERAR' : 'SOLICITAR'}
                </Button>
                OU
                <Button style={{ marginLeft: 10 }} className='btn transparent' onClick={() => setModeView('sign-in-mode')}>ACESSAR</Button>
              </div>
              <Image preview={false} className='imagem' src='/undraw_Data_trends_re_2cdy.svg' alt='imagem' layout='fill' />
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Head>
        <title>CARREGANDO...</title>
      </Head>
    </Fragment>
  );
}

export default Login;

const Container = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #FFFFFF;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 2000px;
    height: 2000px;
    border-radius: 0;
    background: linear-gradient(-45deg, ${Colors.primary.default}, ${Colors.primary.default});
    top: 0;
    right: 48%;
    transform: translateY(-50%);
    z-index: 6;
    transition: 1.8s ease-in-out;
  }

  &.sign-up-mode {
    &::before {
      transform: translate(100%, -50%);
      right: 52%;
    }

    .signin-signup {
      left: 25%;
    }

    .panels-container {
      .panel {
        &.left {
          pointer-events: none;

          .imagem, .content {
            transform: translateX(-800px);
          }
        }

        &.right {
          pointer-events: all;

          .imagem, .content {
            transform: translateX(0px);
          }
        }
      }
    }

    .sign-form {
      &.signin {
        z-index: 1;
        opacity: 0;
      }

      &.signup {
        z-index: 2;
        opacity: 1;
      }
    }
  }

  .forms-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .signin-signup {
    position: absolute;
    top: 50%;
    left: 75%;
    transform: translate(-50%, -50%);
    width: 50%;
    display: grid;
    grid-template-columns: 1fr;
    z-index: 5;
    transition: 1s .7s ease-in-out ;
  }

  .sign-form {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 5rem;
    overflow: hidden;
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    transition: .2s .7s ease-in-out;

    &.signin {
      z-index: 2;
    }

    &.signup {
      z-index: 1;
      opacity: 0;
    }
  }

  .title {
    font-size: 2.2rem;
    color: #444444;
    margin-bottom: 10px;
    font-weight: 800;
  }

  .input-field {
    max-width: 380px;
    width: 100%;
    height: 55px;
    background-color: #F0F0F0;
    margin: 10px 0;
    border-radius: 55px;
    display: grid;
    grid-template-columns: 15% 85%;
    padding: 0 .4rem;
    position: relative;

    .info-danger {
      position: absolute;
      left: 20px;
      top: -22px;
      color: red;
      display: none;
    }

    &.invalid {
      border: 1px solid red;
      .info-danger {
        display: block;
      }

      .i {
        color: red;
      }
    }

    &.password {
      grid-template-columns: 15% 75% 10%;
    }

    .i {
      text-align: center;
      color: #ACACAC;
      font-size: 1.1rem;
      align-self: center;
      padding-top: 5px;

      &.viewPassword {
        cursor: pointer;
      }
    }

    input {
      background: none;
      outline: none;
      border: none;
      line-height: 1;
      font-weight: 600;
      font-size: 1.1rem;
      color: #333333;

      &::placeholder {
        color: #AAAAAA;
        font-weight: 500;
      }
    }
  }

  .btn {
    width: 150px;
    height: 50px;
    border: none;
    outline: none;
    border-radius: 50px;
    cursor: pointer;
    background-color: ${Colors.primary.default};
    color: #FFFFFF;
    text-transform: uppercase;
    font-weight: 600;
    margin: 10px 0;
    transition: .5s;
    color: white;

    &:hover {
      background-color: ${Colors.primary.hover};
    }

    &.loading {
      background-color: yellow;
      color: black;

      &:hover {
        background-color: none;
      }
    }

    &.success {
      background-color: green;

      &:hover {
        background-color: none;
      }
    }

    &.error {
      background-color: red;

      &:hover {
        background-color: none;
      }
    }

    
  }

  .social-text {
    padding: .7rem 0;
    font-size: 1rem;
  }

  .social-media {
    display: flex;
    justify-content: center;

    .social-icon {
      width: 46px;
      height: 46px;
      border: 1px solid #333;
      margin: 0 .45rem;
      display: flex;
      justify-content: center;
      align-items: center;
      text-decoration: none;
      color: #333;
      font-size: 1.1rem;
      border-radius: 50%;
      transition: .3s;

      &:hover {
        background-color: ${Colors.primary.default};
        color: #FFFFFF;
        border-color: ${Colors.primary.default};
      }
    }
  }

  .panels-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    
    .panel {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: space-around;
      text-align: center;
      z-index: 7;

      &.left {
        pointer-events: all;
        padding: 3rem 17% 2rem 12%;
      }

      &.right {
        pointer-events: none;
        padding: 3rem 12% 2rem 17%;

        .imagem, .content {
          transform: translateX(800px);
        }
      }

      .content {
        color: #FFFFFF;
        transition: .9s .6s ease-in-out;

        h3 {
          color: #FFFFFF;
          font-weight: 600;
          line-height: 1;
          font-size: 1.5rem;
        }

        p {
          font-size: .95rem;
          padding: .7rem 0;
        }

        .btn {
          margin: 0;
          background: none;
          border: 2px solid #FFFFFF;
          width: 130px;
          height: 41px;
          font-weight: 600;
          font-size: .8rem;

          &.transparent {
            &:hover {
              background-color: #FFFFFF;
              color: ${Colors.primary.default};
            }
          }
        }
      }
    }

    .imagem {
      width: 100%;
      transition: 1.1s .4s ease-in-out;
    }
  }

  @media screen and (max-width: 870px) {
    min-height: 800px;
    height: 100vh;

    &.sign-up-mode {
      &::before {
        transform: translate(-50%, 100%);
        bottom: 32%;
        right: initial;
      }

      .signin-signup {
        top: 5%;
        transform: translate(-50%, 0);
        left: 50%;
      }

      .panels-container {
        .panel {
          &.left {
            .imagem, .content {
              transform: translateY(-300px);
            }
          }
        }
      }
    }

    &::before {
      width: 1500px;
      height: 1500px;
      left: 30%;
      bottom: 68%;
      transform: translateX(-50%);
      right: initial;
      top: initial;
      transition: 2s ease-in-out;
    }

    .signin-signup {
      width: 100%;
      left: 50%;
      top: 95%;
      transform: translate(-50%, -100%);
      transition: 1s .8s ease-in-out;
    }

    .panels-container {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 2fr 1fr;

      .panel {
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        padding: 2.5rem 8%;

        .btn {
          width: 110px;
          height: 35px;
          font-size: .7rem;
          background-color: red;
        }

        .content {
          padding-right: 15%;
          transition: .9s .8s ease-in-out;

          h3 {
            font-size: 1.2rem;
          }

          p {
            font-size: .7rem;
            padding: .5rem 0;
          }
        }

        &.left {
          grid-row: 1 / 2;
        }

        &.right {
          grid-row: 3 / 4;
        }

        .imagem {
          width: 200px;
          transition: .9s .6s ease-in-out;
        }
      }

      .panel.right .content, .panel.right .imagem {
        transform: translateY(300px);
      }
    }
  }

  @media screen and (max-width: 570px) {
    &::before {
      bottom: 72%;
      left: 50%;

      .signin-signup {
        bottom: 28%;
        left: 50%;
      }
    }

    .sign-form {
      padding: 0 1.5rem;
    }

    .panels-container {
      left: 10px;

      .panel {
        &.left {
          padding: 0;
        }

        &.right {
          padding: 0;
        }

        .content {
          padding: 0.5rem 1rem;
        }

        .imagem {
          display: none;
        }
      }
    }
  }
`;