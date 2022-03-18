import React, { useEffect } from 'react';
import styled from 'styled-components';

import { Image } from 'antd';

import useAuth from '../../../hooks/useAuth'

import colors from '../../../utils/colors';

import Router from 'next/router';
import router from '../../../router';

const SideBar = ({ collapsed, responsive }) => {
  const { user, signOut, businessInfo, setCollapsedSideBar } = useAuth();

  const showMenu = (index) => {
    const list = document.querySelectorAll('li.list');

    for(let i = 0; i < list.length; i++) {
      if(list[i].id !== 'list_'+index){
        list[i].classList.remove('showMenu');
      }
    }

    document.getElementById('list_'+index).classList.toggle('showMenu');
  };

  useEffect(() => {
    const list = document.querySelectorAll('li.list');

    for(let i = 0; i < list.length; i++) {
      list[i].classList.remove('showMenu');
    }
  }, [collapsed]);

  return (
    <Side
      bg={businessInfo.layout.theme}
      className={(collapsed && 'close')+' '+(responsive && 'updateTheme')}
    >
      <div className="logo-details" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10 }}>
        {businessInfo.icon ? (
          <img width={50} preview={false} style={{ marginRight: 10 }} src={businessInfo.icon} />
        ) : (
          <i style={{fontSize: 45}} className='bx bx-car' />
        )}
        <span className="logo_name" style={{ marginTop: String(businessInfo.razao_social).length > 10 && 20, lineHeight: String(businessInfo.razao_social).length > 10 ? 1 : .7}}>
          <span style={{ fontSize: String(businessInfo.razao_social).length > 10 && 20 }}>
            {businessInfo.razao_social}
          </span>
          <br/>
          <span style={{fontSize: 13}}>
            sistema de gestão
          </span>
        </span>
      </div>
      <ul className="nav-links">
        {router.map((item, index) => {
          if(item.roles.includes(user.tipo)) {
            if(!item.pages) {
              return (
                <li id={'list_'+index} key={index} className='list'>
                  <span onClick={(e) => {
                    if(window.screen.width > 768) {
                      Router.push(item.patchname);
                      setCollapsedSideBar(true);
                    }
                  }}>
                    <i className={item.icon}></i>
                    <span className="link_name" onClick={(e) => {
                      e.stopPropagation();
                      Router.push(item.patchname)
                      setCollapsedSideBar(true);
                    }}>{item.title}</span>
                  </span>
                  <ul className="sub-menu blank" onClick={(e) => e.stopPropagation()}>
                    <li><span className="link_name" onClick={() => {
                      Router.push(item.patchname);
                      setCollapsedSideBar(true);
                    }}>{item.title}</span></li>
                  </ul>
                </li>
              );
            }
            
            return (
              <li onClick={() => {
                if(window.screen.width > 768) {
                  showMenu(index);
                }
              }} id={'list_'+index} key={index} className='list'>
                <div className="iocn-link">
                  <span>
                    <i className={item.icon}></i>
                    <span className="link_name">{item.title}</span>
                  </span>
                  <i className='bx bxs-chevron-down arrow'></i>
                </div>
                <ul className="sub-menu" onClick={(e) => e.stopPropagation()}>
                  <li
                    onClick={() => {
                      if(item.patchname) {
                        Router.push(item.patchname);
                        setCollapsedSideBar(true);
                      }
                    }}
                  ><span className="link_name">{item.title}</span></li>
                  {item.pages.map((item1, index1) => (
                    <li onClick={() => {
                      Router.push(item1.patchname);
                      setCollapsedSideBar(true);
                    }} key={index1}><span>{item1.title}</span></li>
                  ))}
                </ul>
              </li>
            );
          }
        })}
        <li>
          <div className="profile-details">
            <div className="profile-content">
              <Image preview={false} src="https://i1.wp.com/terracoeconomico.com.br/wp-content/uploads/2019/01/default-user-image.png?ssl=1" alt="profile" />
            </div>
            <span className='content-user'>
              <div className="name-job"
                onClick={() => {
                  Router.push('/painel/perfil')
                }}
              >
                <div className="profile_name" style={{textTransform: 'uppercase'}}>{user.displayName}</div>
                <div className="job" style={{textTransform: 'capitalize'}}>{user.tipo}</div>
              </div>
              <i onClick={signOut} className='bx bx-log-out'></i>
            </span>
          </div>
        </li>
      </ul>
    </Side>
  );
}

export default SideBar;

export const Side = styled.div`
  position: fixed;
  top: 0;
  left: -280px;
  height: 100%;
  width: 280px;
  background: ${props => props.bg ? props.theme.colors[props.bg].primary : colors.primary.default};
  z-index: 100;
  transition: all 0.5s ease;

  &.updateTheme {
    @media screen and (max-width: 768px) {
      left: -280px;
    }

    left: 0;
  }

  @media screen and (max-width: 768px) {
    left: 0;
  }

  &.close {
    width: 78px;

    @media screen and (max-width: 768px) {
      left: 0;
    }

    .logo-details {
      .logo_name {
        transition-delay: 0s;
        opacity: 0;
        pointer-events: none;
      }
    }
    
    i {
      &.arrow {
        display: none;
      }
    }

    .nav-links {
      overflow: visible;

      li {
        .iocn-link {
          display: block;
        }

        span {
          .link_name {
            opacity: 0;
            pointer-events: none;
          }
        }

        .sub-menu {
          position: absolute;
          left: 100%;
          top: -10px;
          margin-top: 0;
          padding: 10px 20px;
          border-radius: 0 6px 6px 0;
          opacity: 0;
          display: block;
          pointer-events: none;
          transition: 0s;

          .link_name {
            font-size: 18px;
            opacity: 1;
            display: block;
          }
        }

        &:hover {
          .sub-menu {
            top: 0;
            opacity: 1;
            pointer-events: auto;
            transition: all 0.4s ease;
          }
        }
      }
    }

    .profile-details {
      background: none;
      width: 78px;

      img {
        padding: 10px;
      } 

      .content-user {
        i, .profile_name, .job {
          opacity: 0;
          display: none;
        }
      }

      &:hover {
        .content-user {
          background-color: ${props => props.bg ? props.theme.colors[props.bg].primary : colors.primary.default};

          i, .profile_name, .job {
            opacity: 1;
            display: block;
          }

          .profile_name, .job {
            left: 100%;
            top: -100px;
            margin-top: 0;
            padding: 0 20px 0 20px;
            border-radius: 0 6px 6px 0;
            opacity: 1;
          }
        }
      }
    }
  }

  .logo-details {
    height: 60px;
    width: 100%;
    display: flex;
    align-items: center;

    i {
      font-size: 30px;
      color: #fff;
      height: 50px;
      min-width: 78px;
      text-align: center;
      line-height: 50px;
    }

    .logo_name {
      font-size: 22px;
      color: #fff;
      font-weight: 600;
      transition: 0.3s ease;
      transition-delay: 0.1s;
    }
  }

  .nav-links {
    height: 100%;
    padding: 30px 0 150px 0;
    overflow: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    .list {
      cursor: pointer;

      &:hover {
        background-color: ${props => props.bg ? props.theme.colors[props.bg].secondary : colors.primary.hover};
      }
    }

    li {
      position: relative;
      list-style: none;
      transition: all 0.4s ease;

      &:hover {
        .sub-menu {
          &.blank {
            top: 50%;
            transform: translateY(-50%);
          } 
        }
      }

      .iocn-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      i {
        height: 50px;
        min-width: 78px;
        text-align: center;
        line-height: 50px;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      &.showMenu {
        i {
          &.arrow {
            transform: rotate(-180deg);
          }
        }

        .sub-menu {
          display: block;
        }
      }

      span {
        cursor: pointer;
        display: flex;
        align-items: center;
        text-decoration: none;

        .link_name {
          font-size: 18px;
          font-weight: 400;
          color: #F0F0F0;
          transition: all 0.4s ease;
        }
      }

      .sub-menu {
        padding: 6px 6px 14px 80px;
        background: ${props => props.bg ? props.theme.colors[props.bg].primary : colors.primary.default};
        display: none;

        .link_name {
          display: none;
        }

        &.blank {
          opacity: 1;
          pointer-events: auto;
          padding: 3px 20px 6px 16px;
          opacity: 0;
          pointer-events: none;
        }

        span {
          color: #fff;
          font-size: 15px;
          padding: 5px 0;
          white-space: nowrap;
          opacity: 0.6;
          transition: all 0.3s ease;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }

  .profile-details {
    position: fixed;
    bottom: 0;
    width: 280px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${props => props.bg ? props.theme.colors[props.bg].secondary : colors.primary.hover};
    padding: 6px 0;
    transition: all 0.5s ease;

    .profile-content {
      display: flex;
      align-items: center;
    }

    img {
      height: 52px;
      width: 52px;
      object-fit: cover;
      border-radius: 16px;
      margin: 0 14px 0 12px;
      background: ${props => props.bg ? props.theme.colors[props.bg].secondary : colors.primary.hover};
      transition: all 0.5s ease;
    }

    .content-user {
      i, .profile_name, .job {
        transition: all 1s ease;
      }

      .profile_name, .job {
        width: 100%;
        color: #FFFFFF;
        font-size: 18px;
        font-weight: 500;
        white-space: nowrap;
        transition: all .5s ease;
        opacity: 1;
      }

      .job {
        font-size: 12px;
      }
    }
  }

  .home-section{
    position: relative;
    background: #E4E9F7;
    height: 100vh;
    left: 280px;
    width: calc(100% - 280px);
    transition: all 0.5s ease;
  }
`;