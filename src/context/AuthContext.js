import { createContext, useEffect, useState } from 'react';
import firebase from '../auth/AuthConfig';

import verifyCode from '../auth/errors';
import { notification, Modal, Input, ConfigProvider } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Router from 'next/router';
import { useTheme } from 'styled-components';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const theme = useTheme();

  const [businessInfo, setBusinessInfo] = useState(null)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);

  const [corretora, setCorretora] = useState(null);

  const [initial, setInitial] = useState(true);

  const [collapsedSideBar, setCollapsedSideBar] = useState(false);

  const [logoutFunction, setLogoutFunction] = useState(true);

  useEffect(() => {
    if(window.screen.width > 768) {
      setCollapsedSideBar(true);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLogoutFunction(false);
    }, 5000);
  }, [logoutFunction]);

  useEffect(() => {
    if(user && user.uid) {
      firebase.firestore().collection('usuarios').doc(user.uid).set(user, { merge: true });
    }
  }, [user]);

  useEffect(() => {
    if(businessInfo) {
      ConfigProvider.config({
        theme: {
          primaryColor: theme.colors[businessInfo.layout.theme].primary
        }
      });
    }
  }, [businessInfo]);

  useEffect(() => {
    try {
      setLoading(true);

      if(process.env.NEXT_PUBLIC_UID_CORRETORA) {
        firebase.firestore().collection('corretoras').doc(process.env.NEXT_PUBLIC_UID_CORRETORA).get()
        .then((response) => {
          if(response.exists) {
            setBusinessInfo(response.data());
          }
        })
      }else {
        firebase.firestore().collection('corretoras').where('site', '==', window.location.hostname).get()
        .then((res) => {
          if(!res.empty) {
            res.forEach((item) => {
              setBusinessInfo(item.data());
            })
          }
        })
      }

      firebase.auth().onAuthStateChanged((user) => {
        if(user) {
          if(user.emailVerified){
            const docRef = firebase.firestore().collection('usuarios').doc(user.uid);

            docRef.get().then((doc) => {
              if(doc.exists){
                const docRef1 = firebase.firestore().collection('corretoras').doc(doc.data().corretora.uid);

                docRef1.get().then((doc1) => {
                  if(doc1.exists){
                    if(doc.data().corretora.verified) {
                      const dataCorretora = doc1.data();
                      setCorretora(data => ({...data, ...dataCorretora}));

                      setBusinessInfo(dataCorretora);

                      setUser(data => ({...data, emailVerified: user.emailVerified, ...doc.data()}));
                      setLogged(true);
                    }else {
                      notification.warn({
                        message: 'PERFIL EM ANÁLISE',
                        description: 'AGUARDE A CORRETORA FAZER A ANÁLISE DO SEU PERFIL. FIQUE NO AGUARDO DO EMAIL QUE IREMOS ENVIA-LO.'
                      });
                      
                      signOut();
                    }
                  }else {
                    signOut();
                  }
                });
              }else {
                signOut();
              }
            });
          }
        }else {
          setTimeout(() => {
            if(!logoutFunction) {
              showPromiseConfirm();
            }
          }, 1500);
        }
      });
    }finally {
      setLoading(false);

      setTimeout(() => {
        setInitial(false);
      }, 2000)
    }
  }, []);

  const { confirm } = Modal;

  function showPromiseConfirm() {
    confirm({
      title: 'Sessão expirada!',
      icon: <ExclamationCircleOutlined />,
      content: [
        <>
          <h2>Fazer login</h2>
          <label>Email: </label>
          <Input id='emailSessao' type='email' />
          <label>Senha: </label>
          <Input id='senhaSessao' type='password' />
        </>
      ],
      okText: 'VALIDAR',
      cancelText: 'SAIR',
      onOk () {
        (async () => {
          const result = await signIn(document.getElementById('emailSessao').value, document.getElementById('senhaSessao').value);
          if(result && result.code) {
            showPromiseConfirm();
          }
        })();
      },
      onCancel() {
        signOut();
        Router.push('/painel/login')
      },
    });
  }

  const viewError = (error) => {
    notification.warn({
      message: 'Ocorreu algum erro.',
      description: verifyCode(error.code)
    });

    return error;
  }

  const signIn = async (email, senha) => {
    try {
      return await firebase.auth().signInWithEmailAndPassword(email, senha).then((response) => {
        if(!response.user.emailVerified){
          response.user.sendEmailVerification();

          notification.warn({
            message: 'VERIFICAÇÃO DE EMAIL',
            description: 'Você ainda não fez a verificação de perfil no seu email.'
          });
        }
        return response.user;
      });
    }catch(error) {
      return viewError(error);
    }
  }

  const forgOut = async (email) => {
    try {
      return await firebase.auth().sendPasswordResetEmail(email);
    }catch(error) {
      return viewError(error);
    }
  }

  const signOut = async () => {
    try {
      return await firebase.auth().signOut()
      .then(() => {
        setLogoutFunction(true);
        setUser(null);
        setLogged(null);
        setLoading(false);
        setInitial(false);
      });
    }finally {
      setLoading(false);
    }
  }

  const signUp = async (props) => {
    try {
      await firebase.auth().createUserWithEmailAndPassword(props.email, props.senha)
      .then(async (response) => {
        delete props.senha;

        const displayName = () => {
          const name = props.nomeCompleto.split(' ')

          if(name[1] === 'da' || name[1] === 'de') {
            return name[0]+' '+name[2];
          }else {
            return name[0]+' '+name[1];
          }
        }

        response.user.sendEmailVerification();

        await firebase.firestore().collection('usuarios').doc(response.user.uid).set({
          corretora: {
            uid: props.corretora,
            verified: false
          },
          displayName: displayName(),
          nomeCompleto: props.nomeCompleto,
          email: props.email,
          tipo: 'corretor',
          status: 'initial',
          uid: response.user.uid,
          telefone: String(props.telefone).split('(').join('').split(')').join('').split(' ').join('').split('-').join(''),
          cpf: String(props.cpf).split('.').join('').split('-').join('')
        }, { merge: true })
      });

      return 'CADASTRADO'
    } catch (error) {
      return viewError(error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        initial,
        user,
        corretora,
        setUser,
        loading,
        logged,
        signIn,
        signOut,
        forgOut,
        signUp,
        businessInfo,
        collapsedSideBar,
        setCollapsedSideBar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthConsumer = AuthContext.Consumer;

export default AuthContext;