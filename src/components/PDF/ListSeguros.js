import { format } from 'date-fns';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import firebase from '../../auth/AuthConfig';

import bancos from '../../data/bancos.json';

import jsonComposto from '../../data/jsonComposto.json';
function juroComposto({ parcela, percentual }) {
  return jsonComposto[percentual][parcela];
}

export default async function printListSeguros(seguros, corretora, filtros, comissao, type, externo) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  let content = null;

  if(type && type === 'estorno') {
    function getTableListHeaderWidth() {
      const array = [];
      array.push(80);
      array.push(25);
      array.push(60);
      if(filtros.corretor !== 'XCAR CORRETORA DE SEGUROS') {
        array.push(60);
      }
      array.push(filtros.corretor === 'XCAR CORRETORA DE SEGUROS' ? 70 : 60);
      array.push(65);
      array.push('*');
      return array;
    }
  
    function getTableListHeader() {
      const array = [];
      array.push({
        text: 'CANCELAMENTO\nFINAL VIGÊNCIA',
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: 'DIAS',
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: 'COMISSÃO TOTAL',
        fontSize: 10,
        alignment: 'center'
      });
      if(filtros.corretor !== 'XCAR CORRETORA DE SEGUROS') {
        array.push({
          text: 'COMISSÃO PRODUTOR',
          fontSize: 10,
          alignment: 'center'
        }); 
      }
      
      array.push({
        text: 'ESTORNO',
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: 'PLACA',
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: 'SEGURADO',
        fontSize: 10,
      });
      return array;
    }
  
    function getTableList(item) {
      const array = [];
      array.push({
        text: `${format(item.seguro.vigencia.toDate(), 'dd/MM/yyyy')}\n${format(item.seguro.vigenciaFinal.toDate(), 'dd/MM/yyyy')}`,
        alignment: 'center',
        fontSize: 10
      });
      array.push({
        text: Math.abs(Math.ceil((new Date(item.seguro.vigencia.toDate()).getTime() - new Date(item.cancelada.toDate()).getTime()) / (1000 * 3600 * 24))),
        alignment: 'center',
        fontSize: 10
      });
      array.push({
        text: new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(item.valores.comissao),
        alignment: 'center',
        fontSize: 10
      });
      if(filtros.corretor !== 'XCAR CORRETORA DE SEGUROS') {
        array.push({
          text: !item.corretor ? '-----------' : new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(item.corretor.comissao.valor),
          alignment: 'center',
          fontSize: 10
        });
      }
      array.push({
        text: new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format((!item.corretor ? item.valores.comissao : item.corretor.comissao.valor / 365) * Math.ceil((new Date(item.seguro.vigencia.toDate()).getTime() - new Date(item.cancelada.toDate()).getTime()) / (1000 * 3600 * 24)) - (item.corretor ? item.corretor.comissao.valor : item.valores.comissao)),
        alignment: 'center',
        fontSize: 10
      });
      array.push({
        text: item.veiculo.placa,
        alignment: 'center',
        fontSize: 10
      });
      array.push({
        text: item.segurado.nome,
        fontSize: 10
      });
      return array;
    }

    function getBottomList() {
      const array = [];

      array.push({
        text: `TOTAL ESTORNO`,
        alignment: 'left',
        fontSize: 10,
        color: 'red'
      });

      array.push({
        text: '',
      });

      array.push({
        text: new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format([...seguros].reduce((a, b) => a + b.valores.comissao, 0)),
        alignment: 'center',
        fontSize: 10,
      });
      
      if(filtros.corretor !== 'XCAR CORRETORA DE SEGUROS') {
        array.push({
          text: new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format([...seguros].reduce((a, b) => a + b.corretor.comissao.valor, 0)),
          alignment: 'center',
          fontSize: 10,
        });
      }

      array.push({
        text: new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format([...seguros].reduce((a, b) => a + (!b.corretor ? b.valores.comissao : b.corretor.comissao.valor / 365) * Math.ceil((new Date(b.seguro.vigencia.toDate()).getTime() - new Date(b.cancelada.toDate()).getTime()) / (1000 * 3600 * 24)) - (b.corretor ? b.corretor.comissao.valor : b.valores.comissao), 0)),
        alignment: 'center',
        fontSize: 10,
        color: 'red'
      });

      array.push({
        text: '',
      });

      array.push({
        text: '',
      });

      return array;
    }


    const dadosBancarios = (externo === true || filtros.corretor === 'XCAR CORRETORA DE SEGUROS') ? null : await firebase.firestore().collection('usuarios').doc(seguros[0].corretor.uid).get()
    .then((response) => {
      return response.data().dadosBancarios;
    });

    content = [
      {
        table: {
          widths: ['*', 154.4],
          body: [
            [ 
              [
                {
                  text: corretora.razao_social,
                  alignment: 'left',
                  bold: true,
                  fontSize: 18,
                  marginTop: 5
                },
                {
                  text: `RELATÓRIO DE SEGUROS ${type === 'estorno' ? 'CANCELADOS' : ''}`,
                  alignment: 'left',
                  bold: true,
                  fontSize: 10,
                  color: 'red',
                  marginBottom: 10
                }
              ],
              [
                {
                  text: filtros.date && `PERÍODO:\n${format(filtros.date[0].toDate(), 'dd/MM/yyyy')} - ${format(filtros.date[1].toDate(), 'dd/MM/yyyy')}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.corretor && `PRODUTOR:\n${filtros.corretor}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.seguradora && `SEGURADORA:\n${filtros.seguradora}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.placa && `PLACA: ${filtros.placa}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.cpf && `CPF: ${filtros.cpf}`,
                  bold: true,
                  fontSize: 10,
                }
              ]
            ],
          ]
        }
      },
      {
        table: {
          widths: getTableListHeaderWidth(),
          body: [
            getTableListHeader(),
          ]
        }
      },
      {
        table: {
          widths: getTableListHeaderWidth(),
          body: [...seguros].map((item) => getTableList(item))
        }
      },
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: 'd',
              color: 'white'
            }
          ]]
        }
      },
      {
        table: {
          widths: getTableListHeaderWidth(),
          body: [
            getBottomList()
          ]
        }
      },
      {
        table: {
          widths: '*',
          body: [
            [ 
              {
                text: `QUANTIDADE DE SEGUROS: ${[...seguros].length.toString().padStart(2, '0')}`,
                alignment: 'left',
                fontSize: 10
              }
            ],
          ]
        }
      },
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: 'd',
              color: 'white',
              border: [false, false, false, false]
            }
          ]]
        }
      },
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: 'd',
              color: 'white',
              border: [false, false, false, false]
            }
          ]]
        }
      },
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: `DADOS BANCÁRIOS: ${filtros.corretor}`,
            }
          ]]
        }
      },
      {
        table: {
          widths: ['*', 80, 60, 140],
          body: [[
            {
              text: 'BANCO',
            },
            {
              text: 'CONTA',
            },
            {
              text: 'AGÊNCIA',
            },
            {
              text: 'PIX',
            },
          ]]
        }
      },
      {
        table: {
          widths: ['*', 80, 60, 140],
          body: [[
            {
              text: !dadosBancarios?.banco ? '-----------------------------------------------' : bancos.filter(e => e.value === dadosBancarios.banco)[0].label.toUpperCase()+' - '+dadosBancarios.banco,
            },
            {
              text: !dadosBancarios?.conta ? '------------------------' : `${dadosBancarios.conta}${dadosBancarios.conta_d ? ` - ${dadosBancarios.conta_d}` : ''}${dadosBancarios.conta_o ? ` | ${dadosBancarios.conta_o}` : ''}`,
            },
            {
              text: !dadosBancarios?.agencia ? '------------------' : `${dadosBancarios.agencia}${dadosBancarios.agencia_d ? ` - ${dadosBancarios.agencia_d}` : ''}`,
            },
            {
              text: `${dadosBancarios?.pix ? dadosBancarios.pix : '-------------------'}`,
            },
          ]]
        }
      },
    ];
  }else if(!comissao) {
    function getTableListHeaderWidth() {
      const array = [];
      array.push(15);
      array.push(55);
      if(seguros[0].valores) {
        array.push(25);
      }
      array.push('*');
      if(!filtros.corretor) {
        if(seguros[0].valores) {
          array.push(100);
        }
      }
      array.push(65);
      if(externo === undefined || externo === false) {
        //array.push(60);
        array.push(20);
      }
      
      return array;
    }
  
    function getTableListHeader() {
      const array = [];
      array.push({
        text: '#',
        alignment: 'center',
        fontSize: 10,
      });
      array.push({
        text: 'VIGÊNCIA',
        fontSize: 10,
      });
      if(seguros[0].valores) {
        array.push({
          text: 'ANO',
          fontSize: 10,
        });
      }
      array.push({
        text: 'SEGURADO',
        fontSize: 10,
      });
      if(!filtros.corretor) {
        if(seguros[0].valores) {
          array.push({
            text: 'PRODUTOR',
            fontSize: 10,
          });
        }
      }
      array.push({
        text: 'SEGURADORA',
        fontSize: 10,
      });
      if(externo === undefined || externo === false) {
        /*
          array.push({
            text: 'PRÊMIO',
            fontSize: 10,
          });
        */
        array.push({
          text: '%',
          fontSize: 10,
          alignment: 'center'
        });
      }

      return array;
    }
  
    function getTableList(item, index) {
      const array = [];
      array.push({
        alignment: 'center',
        text: index || '',
        fontSize: 10
      });
      array.push({
        text: format(item.seguro.vigencia.toDate(), 'dd/MM/yyyy'),
        fontSize: 10
      });
      if(seguros[0].valores) {
        array.push({
          text: item.segurado.anoAdesao,
          fontSize: 10,
        });
      }
      array.push({
        text: `${item.segurado.nome.split(' ')[0]} ${['DE', 'DA', 'da', 'de'].includes(item.segurado.nome.split(' ')[1]) ? item.segurado.nome.split(' ')[2] : item.segurado.nome.split(' ')[1]}`,
        fontSize: 10
      });
      if(!filtros.corretor) {
        if(seguros[0].valores) {
          array.push({
            text: item.corretor && item.corretor.nome.split(' ').slice(0, 2).join(' '),
            fontSize: 10
          });
        }
      }
      array.push({
        text: item.seguradora.razao_social.split(' ')[0],
        fontSize: 10
      });
      if(externo === undefined || externo === false) {
        /*
          array.push({
            text: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valores.premio),
            fontSize: 10
          });
        */
        array.push({
          text: item.valores.percentual,
          fontSize: 10,
          alignment: 'center'
        });
      }
      return array;
    }
  
    content = [
      {
        table: {
          widths: ['*', 154.4],
          body: [
            [ 
              [
                {
                  text: corretora.razao_social,
                  alignment: 'left',
                  bold: true,
                  fontSize: 18,
                  marginTop: 5
                },
                {
                  text: 'RELATÓRIO DE SEGUROS',
                  alignment: 'left',
                  bold: true,
                  fontSize: 10,
                  marginBottom: 10
                }
              ],
              [
                {
                  text: filtros.date && `PERÍODO:\n${format(filtros.date[0].toDate(), 'dd/MM/yyyy')} - ${format(filtros.date[1].toDate(), 'dd/MM/yyyy')}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.corretor && `PRODUTOR:\n${filtros.corretor}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.seguradora && `SEGURADORA:\n${filtros.seguradora}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.placa && `PLACA: ${filtros.placa}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.cpf && `CPF: ${filtros.cpf}`,
                  bold: true,
                  fontSize: 10,
                }
              ]
            ],
          ]
        }
      },
      {
        table: {
          widths: getTableListHeaderWidth(),
          body: [
            getTableListHeader(),
          ]
        }
      },
      {
        table: {
          widths: getTableListHeaderWidth(),
          body: [...seguros].map((item, index) => getTableList(item, (index + 1)))
        }
      },
      /*{
        table: {
          widths: '*',
          body: [
            [ 
              {
                text: `QUANTIDADE DE SEGUROS: ${[...seguros].length.toString().padStart(2, '0')}`,
                alignment: 'left',
              }
            ],
          ]
        }
      },
      {
        table: {
          widths: '*',
          body: [
            [ 
              {
                text: seguros[0].valores && `TOTAL EM PRÊMIOS: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format([...seguros].reduce((a, b) => a + b?.valores?.premio || 0, 0))}`,
                alignment: 'left',
              }
            ],
          ]
        }
      }*/
    ];
  }else {
    function getTableListHeaderWidth() {
      const array = [];

      array.push(70);
      array.push(90);
      array.push(50);
      array.push(100);
      array.push(75);
      array.push('*');
      array.push('*');

      return array;
    }
  
    function getTableListHeader() {
      const array = [];

      array.push({
        text: 'PERÍODO DE VIGÊNCIA',
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: 'SEGURADO',
        fontSize: 10,
      });
      array.push({
        text: 'PARCELAS',
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: 'PRÊMIO LÍQUIDO\nCOMISSÃO',
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: 'VALOR LÍQUIDO\nCOMISSÃO',
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: 'DESCONTO FINANCEIRO',
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: 'TOTAL A RECEBER',
        fontSize: 10,
        alignment: 'center'
      });

      return array;
    }

    function getTableList(item) {
      const array = [];
      array.push({
        text: [
          {
            text: `${format(item.seguro.vigenciaFinal.toDate(), 'dd/MM/yyyy')}\n`,
            fontSize: 10
          },
          {
            text: `ATÉ ${format(item.seguro.vigencia.toDate(), 'dd/MM/yyyy')}`,
            fontSize: 7
          }
        ],
        alignment: 'center'
      });
      array.push({
        text: comissao ? item.segurado.nome.split(' ').slice(0, 2).join(' ') : item.segurado.nome,
        fontSize: 10
      });
      array.push({
        text: `${item.valores.parcelas}X`,
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: [
          {
            text: `${Number(item.valores.premio).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })} | ${Number(item.valores.percentual).toFixed(0)}% \n`,
            fontSize: 10
          },
          {
            text: `COMISSÃO: ${Number(item.valores.comissao).toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}`,
            fontSize: 7
          }
        ],
        alignment: 'center'
      });

      array.push({
        text: [
          {
            text: !item?.valores?.corretor?.percentual ? '--------' : `${new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(item.valores.comissao)} | ${Number(item.valores.corretor.percentual).toFixed(0)}% \n`,
            fontSize: 10
          },
          {
            text: !item?.valores?.corretor?.percentual ? '--------' : `COMISSÃO: ${new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format((item.valores.corretor.percentual / 100) * item.valores.comissao)}`,
            fontSize: 7
          }
        ],
        alignment: 'center'
      });
      array.push({
        text: !item?.valores?.corretor?.percentual ? '--------' : `${item.valores.parcelas > 4 ? new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(Number(item.valores.corretor.valor * juroComposto({
          parcela: String(item.valores.parcelas),
          percentual: String(item.valores.juros || 0)
        })) -  item.valores.corretor.valor) : '--------'}`,
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: !item?.valores?.corretor?.percentual ? '--------' : `${item.valores.parcelas > 4 ? new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(Number(item.valores.corretor.valor * juroComposto({
          parcela: String(item.valores.parcelas),
          percentual: String(item.valores.juros || 0)
        }))) : new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format((item.valores.corretor.percentual / 100) * item.valores.comissao)}`,
        fontSize: 10,
        alignment: 'center'
      });

      return array;
    }

    const dadosBancarios = (externo === true || filtros.corretor === 'XCAR CORRETORA DE SEGUROS') ? null : await firebase.firestore().collection('usuarios').doc(seguros[0].corretor.uid).get()
    .then((response) => {
      return response.data().dadosBancarios;
    });

    content = [
      {
        table: {
          widths: ['*', 154.4],
          body: [
            [ 
              [
                {
                  text: corretora.razao_social,
                  alignment: 'left',
                  bold: true,
                  fontSize: 18,
                  marginTop: 5
                },
                {
                  text: 'RELATÓRIO DE COMISSÃO SEGUROS',
                  alignment: 'left',
                  bold: true,
                  fontSize: 10,
                  marginBottom: 10
                }
              ],
              [
                {
                  text: filtros.date && `PERÍODO:\n${format(filtros.date[2] ? filtros.date[0] : filtros.date[0].toDate(), 'dd/MM/yyyy')} - ${format(filtros.date[2] ? filtros.date[1] : filtros.date[1].toDate(), 'dd/MM/yyyy')}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.corretor && `PRODUTOR:\n${filtros.corretor}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.seguradora && `SEGURADORA:\n${filtros.seguradora}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.placa && `PLACA: ${filtros.placa}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: filtros.cpf && `CPF: ${filtros.cpf}`,
                  bold: true,
                  fontSize: 10,
                }
              ]
            ],
          ]
        }
      },
      {
        table: {
          widths: getTableListHeaderWidth(),
          body: [getTableListHeader()]
        }
      },
      {
        table: {
          widths: getTableListHeaderWidth(),
          body: [...seguros].map((item) => getTableList(item))
        }
      },
      {
        table: {
          widths: '*',
          body: [
            [ 
              {
                text: `QUANTIDADE DE SEGUROS: ${[...seguros].length.toString().padStart(2, '0')}`,
                alignment: 'left',
              }
            ],
          ]
        }
      },
      {
        table: {
          widths: '*',
          body: [
            [ 
              {
                text: [
                  {
                    text: 'COMISSÃO GERADA:\n',
                  },
                  {
                    text: new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format([...seguros].reduce((a, b) => b.valores.comissao + a, 0)),
                    bold: true,
                    fontSize: 15,
                    color: '#000000'
                  }
                ],
                alignment: 'left',
              },
            ],
          ]
        }
      },
      {
        table: {
          widths: '*',
          body: [
            [ 
              {
                text: [
                  {
                    text: 'COMISSÃO A PAGAR: \n',
                  },
                  {
                    text: new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(filtros.corretor === 'XCAR CORRETORA DE SEGUROS' ? 0 : [...seguros].reduce((a, b) => Number(b.valores.parcelas > 4 ? Number(b.valores.corretor.valor * juroComposto({
                      parcela: String(b.valores.parcelas),
                      percentual: String(b.valores.juros || 0)
                    })) : b.valores.corretor.valor) + a, 0)),
                    bold: true,
                    fontSize: 15,
                    color: '#000000'
                  }
                ],
                alignment: 'left',
              }
            ],
          ]
        }
      },
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: 'd',
              color: 'white',
              border: [false, false, false, false]
            }
          ]]
        }
      },
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: 'd',
              color: 'white',
              border: [false, false, false, false]
            }
          ]]
        }
      },
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: `DADOS BANCÁRIOS: ${filtros.corretor}`,
            }
          ]]
        }
      },
      {
        table: {
          widths: ['*', 80, 60, 140],
          body: [[
            {
              text: 'BANCO',
            },
            {
              text: 'CONTA',
            },
            {
              text: 'AGÊNCIA',
            },
            {
              text: 'PIX',
            },
          ]]
        }
      },
      {
        table: {
          widths: ['*', 80, 60, 140],
          body: [[
            {
              text: !dadosBancarios?.banco ? '-----------------------------------------------' : bancos.filter(e => e.value === dadosBancarios.banco)[0].label.toUpperCase()+' - '+dadosBancarios.banco,
            },
            {
              text: !dadosBancarios?.conta ? '------------------------' : `${dadosBancarios.conta}${dadosBancarios.conta_d ? ` - ${dadosBancarios.conta_d}` : ''}${dadosBancarios.conta_o ? ` | ${dadosBancarios.conta_o}` : ''}`,
            },
            {
              text: !dadosBancarios?.agencia ? '------------------' : `${dadosBancarios.agencia}${dadosBancarios.agencia_d ? ` - ${dadosBancarios.agencia_d}` : ''}`,
            },
            {
              text: `${dadosBancarios?.pix ? dadosBancarios.pix : '-------------------'}`,
            },
          ]]
        }
      },
    ];
  }

  const docDefinitions = {
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content
  }

  const print = pdfMake.createPdf(docDefinitions);

  return print.print();
}