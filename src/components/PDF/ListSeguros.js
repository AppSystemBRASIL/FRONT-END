import { format } from 'date-fns';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import jsonComposto from '../../data/jsonComposto.json';
function juroComposto({ parcela, percentual }) {
  return jsonComposto[percentual][parcela];
}

export default async function printListSeguros(seguros, corretora, filtros, comissao) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  let content = null;

  if(!comissao) {
    function getTableListHeaderWidth() {
      const array = [];
      array.push(55);
      array.push(25);
      array.push('*');
      if(!filtros.corretor) {
        array.push(100);
      }
      array.push(65);
      array.push(20);
      return array;
    }
  
    function getTableListHeader() {
      const array = [];
      array.push({
        text: 'VIGÊNCIA',
        fontSize: 10,
      });
      array.push({
        text: 'ANO',
        fontSize: 10,
      });
      array.push({
        text: 'SEGURADO',
        fontSize: 10,
      });
      if(!filtros.corretor) {
        array.push({
          text: 'PRODUTOR',
          fontSize: 10,
        });
      }
      array.push({
        text: 'SEGURADORA',
        fontSize: 10,
      });
      array.push({
        text: '%',
        fontSize: 10,
        alignment: 'center'
      });
      return array;
    }
  
    function getTableList(item) {
      const array = [];
      array.push({
        text: format(item.seguro.vigenciaFinal.toDate(), 'dd/MM/yyyy'),
        fontSize: 10
      });
      array.push({
        text: item.segurado.anoAdesao,
        fontSize: 10,
      });
      array.push({
        text: item.segurado.nome,
        fontSize: 10
      });
      if(!filtros.corretor) {
        array.push({
          text: item.corretor && item.corretor.nome.split(' ').slice(0, 2).join(' '),
          fontSize: 10
        });
      }
      array.push({
        text: item.seguradora.razao_social.split(' ')[0],
        fontSize: 10
      });
      array.push({
        text: item.valores.percentual,
        fontSize: 10
      });
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
          body: [...seguros].map((item) => getTableList(item))
        }
      },
      {
        table: {
          widths: '*',
          border: null,
          body: [
            [ 
              {
                text: '',
                alignment: 'left',
                bold: true,
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
                text: `QUANTIDADE DE SEGUROS: ${[...seguros].length.toString().padStart(2, '0')}`,
                alignment: 'left',
              }
            ],
          ]
        }
      }
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
            text: `${new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(item.valores.comissao)} | ${Number(item.valores.corretor.percentual).toFixed(0)}% \n`,
            fontSize: 10
          },
          {
            text: `COMISSÃO: ${new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format((item.valores.corretor.percentual / 100) * item.valores.comissao)}`,
            fontSize: 7
          }
        ],
        alignment: 'center'
      });
      array.push({
        text: `${item.valores.parcelas > 4 ? new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(Number(item.valores.corretor.valor * juroComposto({
          parcela: String(item.valores.parcelas),
          percentual: String(item.valores.juros || 0)
        })) -  item.valores.corretor.valor) : '--------'}`,
        fontSize: 10,
        alignment: 'center'
      });
      array.push({
        text: `${item.valores.parcelas > 4 ? new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(Number(item.valores.corretor.valor * juroComposto({
          parcela: String(item.valores.parcelas),
          percentual: String(item.valores.juros || 0)
        }))) : new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format((item.valores.corretor.percentual / 100) * item.valores.comissao)}`,
        fontSize: 10,
        alignment: 'center'
      });
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
                    text: new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format([...seguros].reduce((a, b) => Number(b.valores.parcelas > 4 ? Number(b.valores.corretor.valor * juroComposto({
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
      }
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