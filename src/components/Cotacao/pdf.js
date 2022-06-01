import pdfMake, { fonts } from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { format } from 'date-fns';

export default async function cotacaoPDF(dados, type) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  const details = [
    {
			table: {
        widths: ['55%', '25%', '20%'],
				body: [
          [ 
            [
              {
                text: dados.corretora.razao_social,
                alignment: 'left',
                bold: true,
                fontSize: 18,
                marginTop: 5
              },
              {
                text: `FOMULÁRIO PARA CÁLCULO DE ${String(dados.tipo).split('-').join(' ').toUpperCase()}`,
                alignment: 'left',
                bold: true,
                fontSize: 10,
              }
            ],
            [
              {
                text: `DATA: ${format(dados.created.toDate(), 'dd/MM/yyyy')}`,
                alignment: !dados.corretor ? 'center' : 'left',
                bold: true,
                fontSize: 10,
                marginTop: !dados.corretor ? 15 : 0
              },
              {
                text: !dados.corretor ? '' : 'PRODUTOR:',
                alignment: 'left',
                bold: true,
                fontSize: 10,
              },
              {
                text: !dados.corretor ? '' : String(dados.corretor.nome).toUpperCase(),
                alignment: 'left',
                bold: true,
                fontSize: 10,
              }
            ],
            [
              {
                qr: `https://seguro.appsystembrasil.com.br/cotacao/${dados.uid}`,
                fit: 65,
                alignment: 'center',
              },
              {
                text: 'DOCUMENTO DIGITAL',
                alignment: 'center',
                fontSize: 8,
                border: [false, true, true, true],
              }
            ]
          ],
				]
			}
		}
  ];

  const bodySegurado = [];

  if(dados.segurado.nome) {
    bodySegurado.push([{
      text: 'NOME',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.segurado.nome).toUpperCase(),
      fontSize: 10,
    }])
  }

  if(dados.segurado.cpf) {
    bodySegurado.push([{
      text: 'CPF / CNPJ',
      bold: true,
      fontSize: 10,
    }, {
      text: dados.segurado.cpf,
      fontSize: 10,
    }]);
  }

  if(dados.segurado.celular) {
    bodySegurado.push([{
      text: 'TELEFONE',
      bold: true,
      fontSize: 10,
    }, {
      text: dados.segurado.celular,
      fontSize: 10
    }]);
  }

  if(dados.segurado.email) {
    bodySegurado.push([{
      text: 'EMAIL',
      bold: true,
      fontSize: 10,
    }, {
      text: dados.segurado.email,
      fontSize: 10
    }]);
  }

  if(dados.segurado.estadoCivil) {
    bodySegurado.push([{
      text: 'ESTADO CIVIL',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.segurado.estadoCivil).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.endereco.cep) {
    bodySegurado.push([{
      text: 'CEP',
      bold: true,
      fontSize: 10,
    }, {
      text: dados.segurado.cep,
      fontSize: 10,
    }]);
  }

  if(dados.endereco.estado) {
    bodySegurado.push([{
      text: 'ESTADO',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.endereco.estado).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.endereco.cidade) {
    bodySegurado.push([{
      text: 'CIDADE',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.endereco.cidade).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.segurado.cnh) {
    bodySegurado.push([{
      text: 'DATA 1° CNH',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.segurado.cnh).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.segurado.proprietario) {
    bodySegurado.push([{
      text: 'PROPRIETÁRIO',
      bold: true,
      fontSize: 10,
    }, {
      text: `${dados.segurado.proprietario ? 'SIM' : 'NÃO'}`,
      fontSize: 10,
    }]);
  }

  if(dados.segurado.profissao) {
    bodySegurado.push([{
      text: 'PROFISSÃO',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.segurado.profissao).toUpperCase(),
      fontSize: 10,
    }]);
  }

  details.push({
    table: {
      widths: ['30%', '70%'],
      body: [
        [
          {
            text: 'DADOS DO SEGURADO',
            fontSize: 10,
            bold: true,
          },
          {
            text: null,
            fontSize: 10,
            bold: true
          }
        ]
      ]
    }
  })

  details.push({
    table: {
      widths: ['30%', '70%'],
      body: bodySegurado
    }
  })

  const bodySeguro = [];

  if(dados.seguro.plano) {
    bodySeguro.push([{
      text: 'PLANO',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.seguro.plano).toUpperCase(),
      fontSize: 10,
    }])
  }
  
  if(dados.seguro.tipo) {
    bodySeguro.push([{
      text: 'TIPO DO SEGURO',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.seguro.tipo).toUpperCase(),
      fontSize: 10,
    }])
  }

  if(dados.seguro.seguradora) {
    bodySeguro.push([{
      text: 'SEGURADORA',
      bold: true,
      fontSize: 10,
    }, {
      text: dados.seguro.seguradora,
      fontSize: 10,
    }])
  }

  if(dados.seguro.vigencia) {
    bodySeguro.push([{
      text: 'FIM DA VIGÊNCIA',
      bold: true,
      fontSize: 10,
    }, {
      text: dados.seguro.vigencia,
      fontSize: 10,
    }])
  }

  if(dados.seguro.sinistro) {
    bodySeguro.push([{
      text: 'HOUVE SINISTRO',
      bold: true,
      fontSize: 10,
    }, {
      text: dados.seguro.tipo === 'NOVO' ? null : `${dados.seguro.sinistro ? 'SIM' : 'NÃO'}`,
      fontSize: 10,
    }])
  }

  if(bodySeguro.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'DADOS DO SEGURO',
              fontSize: 10,
              bold: true,
            },
            {
              text: null,
              fontSize: 10,
            }
          ]
        ]
      }
    })

    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodySeguro
      }
    })
  }

  const bodyVeiculo = [];

  if(dados.veiculo.veiculo) {
    bodyVeiculo.push([{
      text: 'VEÍCULO',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.veiculo.veiculo).toUpperCase(),
      fontSize: 10,
    }])
  }

  if(dados.veiculo.placa) {
    bodyVeiculo.push([{
      text: 'PLACA DO VEÍCULO',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.veiculo.placa).toUpperCase(),
      fontSize: 10,
    }])
  }

  if((dados.veiculo.ano && dados.veiculo.modelo)) {
    bodyVeiculo.push([{
      text: 'ANO/MODELO',
      bold: true,
      fontSize: 10,
    }, {
      text: `${(dados.veiculo.ano && dados.veiculo.modelo) ? `${dados.veiculo.ano} - ${dados.veiculo.modelo}` : ''}`,
      fontSize: 10,
    }])
  }

  if(dados.veiculo.cep) {
    bodyVeiculo.push([{
      text: 'CEP',
      bold: true,
      fontSize: 10,
    }, {
      text: dados.veiculo.cep,
      fontSize: 10,
    }])
  }

  if(dados.veiculo.financiado) {
    bodyVeiculo.push([{
      text: 'FINANCIADO',
      bold: true,
      fontSize: 10,
    }, {
      text: `${dados.veiculo.financiado ? 'SIM' : 'NÃO'}`,
      fontSize: 10,
    }])
  }

  if(dados.veiculo.blindado) {
    bodyVeiculo.push([{
      text: 'BLINDADO',
      bold: true,
      fontSize: 10,
    }, {
      text: `${dados.veiculo.blindado ? 'SIM' : 'NÃO'}`,
      fontSize: 10,
    }])
  }

  if(dados.veiculo.kitGas) {
    bodyVeiculo.push([{
      text: 'TEM KIT GÁS',
      bold: true,
      fontSize: 10,
    }, {
      text: `${dados.veiculo.kitGas ? 'SIM' : 'NÃO'}`,
      fontSize: 10,
    }])
  }
  
  if(bodyVeiculo.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'DADOS DO VEÍCULO',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              text: null,
              fontSize: 10,
            }
          ]
        ]
      }
    });

    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodyVeiculo
      }
    });
  }

  const bodyCondutor = [];

  if(dados.condutor.nome) {
    bodyCondutor.push([{
      text: 'NOME',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.condutor.nome).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.condutor.relacao) {
    bodyCondutor.push([{
      text: 'RELAÇÃO COM O SEGURADO',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.condutor.relacao).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.condutor.cpf) {
    bodyCondutor.push([{
      text: 'CPF',
      bold: true,
      fontSize: 10,
    }, {
      text: dados.condutor.cpf,
      fontSize: 10,
    }]);
  }

  if(dados.condutor.estadoCivil) {
    bodyCondutor.push([{
      text: 'ESTADO CIVIL',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.condutor.estadoCivil).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.condutor.profissao) {
    bodyCondutor.push([{
      text: 'PROFISSAO',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.condutor.profissao).toUpperCase(),
      fontSize: 10
    }]);
  }

  if(bodyCondutor.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'PRINCIPAL CONDUTOR',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              text: '(A PESSOA QUE UTILIZA O VEÍCULO DO SEGURADO 2 OU MAIS DIAS POR SEMANA, CASO EXISTAM MAIS DE UM CONDUTOR NESTA CONDIÇÃO, SERÁ DEFINIDO SEMPRE O DE MENOR IDADE)',
              fontSize: 8,
            }
          ]
        ]
      }
    });

    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodyCondutor
      }
    })
  }

  const bodyImovel = [];

  if(dados.imovel.cep) {
    bodyImovel.push([{
      text: 'CEP',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.imovel.cep).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.imovel.propriedadeImovel) {
    bodyImovel.push([{
      text: 'PROPRIEDADE DO IMÓVEL',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.imovel.propriedadeImovel).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.imovel.tipoImovel) {
    bodyImovel.push([{
      text: 'TIPO DO IMÓVEL',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.imovel.tipoImovel).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.imovel.usoImovel) {
    bodyImovel.push([{
      text: 'USO DO IMÓVEL',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.imovel.usoImovel).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.imovel.valorImovel) {
    bodyImovel.push([{
      text: 'VELOR DO IMÓVEL',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.imovel.valorImovel).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.imovel.valorMoveis) {
    bodyImovel.push([{
      text: 'VALOR DOS MÓVEIS',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.imovel.valorMoveis).toUpperCase(),
      fontSize: 10,
    }]);
  }
  
  if(bodyImovel.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'DADOS DO IMÓVEL',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              text: null,
              fontSize: 10,
            }
          ]
        ]
      }
    });
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodyImovel
      }
    })
  }

  const bodyViagem = [];

  if(dados.viagem.destino) {
    bodyViagem.push([{
      text: 'DESTINO',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.viagem.destino).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.viagem.ida) {
    bodyViagem.push([{
      text: 'IDA',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.viagem.ida).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.viagem.motivo) {
    bodyViagem.push([{
      text: 'MOTIVO',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.viagem.motivo).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.viagem.origem) {
    bodyViagem.push([{
      text: 'ORIGEM',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.viagem.origem).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.viagem.retorno) {
    bodyViagem.push([{
      text: 'RETORNO',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.viagem.retorno).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.viagem.tipo) {
    bodyViagem.push([{
      text: 'TIPO',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.viagem.tipo).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.viagem.transporte) {
    bodyViagem.push([{
      text: 'TRANSPORTE',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.viagem.transporte).toUpperCase(),
      fontSize: 10,
    }]);
  }
  
  if(bodyViagem.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'DADOS DA VIAGEM',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              text: null,
              fontSize: 10,
            }
          ]
        ]
      }
    });
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodyViagem
      }
    })
  }

  const bodyRisco = [];

  if(dados.riscos.condutorResideMenor) {
    bodyRisco.push([{
      text: 'DEPENDENTES MENORES',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(dados.riscos.condutorResideMenor).toUpperCase(),
      fontSize: 10,
    }]);
  }

  if(dados.riscos.usoVeiculo) {
    bodyRisco.push([{
      text: 'USO DO VEÍCULO',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.riscos.usoVeiculo).toUpperCase(),
      fontSize: 10,
    }])
  }

  if(dados.riscos.residenciaVeiculo) {
    bodyRisco.push([{
      text: 'RESIDE EM',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.riscos.residenciaVeiculo).toUpperCase(),
      fontSize: 10,
    }])
  }

  if(dados.riscos.garagemResidencia) {
    bodyRisco.push([{
      text: 'GARAGEM NA RESIDÊNCIA',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.riscos.garagemResidencia).toUpperCase(),
      fontSize: 10,
    }])
  }

  if(dados.riscos.garagemTrabalho) {
    bodyRisco.push([{
      text: 'GARAGEM NO TRABALHO',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.riscos.garagemTrabalho).toUpperCase(),
      fontSize: 10,
    }])
  }

  if(dados.riscos.garagemEscola) {
    bodyRisco.push([{
      text: 'GARAGEM NA ESCOLA',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.riscos.garagemEscola).toUpperCase(),
      fontSize: 10,
    }])
  }

  if(dados.riscos.praticaEsporte) {
    bodyRisco.push([{
      text: 'PRATICARÁ ESPORTE RADICAL',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.riscos.praticaEsporteFrenquencia).toUpperCase(),
      fontSize: 10,
    }])
  }

  if(dados.riscos.utilizaraMotocicleta) {
    bodyRisco.push([{
      text: 'UTILIZARÁ MOTOCICLETA',
      bold: true,
      fontSize: 10,
    }, {
      text: String(dados.riscos.utilizaraMotocicleta).toUpperCase(),
      fontSize: 10,
    }])
  }
  
  if(bodyRisco.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'AVALIAÇÃO DE RISCO',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              text: null,
              fontSize: 10,
            }
          ]
        ]
      }
    });
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodyRisco
      }
    })
  }

  const bodyBeneficiarios = [];

  if(dados.beneficiarios?.quantidade > 0) {
    bodyBeneficiarios.push([{
      text: 'QUANTIDADE',
      bold: true,
      fontSize: 10,
    },
    {
      text: String(`${dados.beneficiarios.quantidade} PESSOAS`).toUpperCase(),
      fontSize: 10,
    }]);

    for(let i = 0; i < [...dados.beneficiarios.nascimento || []].length || 0; i++) {
      bodyBeneficiarios.push([{
        text: 'NASCIMENTO',
        bold: true,
        fontSize: 10,
      },
      {
        text: String(`${dados.beneficiarios.nascimento[i]}`).toUpperCase(),
        fontSize: 10,
      }]);
    }
  }

  if(bodyBeneficiarios.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'BENEFÍCIARIOS',
              fontSize: 10,
              bold: true,
            },
            {
              text: null,
              fontSize: 10,
            }
          ]
        ]
      }
    });

    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodyBeneficiarios
      }
    })
  }

  if(dados.tipo === 'seguro-veicular') {
    details.push({
      table: {
        widths: ['100%'],
        body: [
          [
            {
              text: 'DADOS PARA FECHAMENTO',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            }
          ]
        ]
      }
    },
    {
      table: {
        widths: ['100%'],
        body: [
          [{
            text: 'ENDEREÇO:',
            bold: true,
            fontSize: 10,
            border: [true, true, true, true],
          }]
        ]
      }
    },
    {
      table: {
        widths: ['33.33%', '33.33%', '33.33%'],
        body: [
          [
            {
              text: 'RG:',
              bold: true,
              fontSize: 10,
              border: [true, false, false, true],
            },
            {
              text: 'EMISSOR:',
              bold: true,
              fontSize: 10,
              border: [false, false, false, true],
            },
            {
              text: 'DATA DE EMISSÃO:',
              bold: true,
              fontSize: 10,
              border: [false, false, true, true],
            }
          ]
        ]
      }
    },
    {
      table: {
        widths: ['34%', '16%', '16%', '34%'],
        body: [
          [
            {
              text: 'CPF:',
              bold: true,
              fontSize: 10,
              border: [true, false, false, true],
            },
            {
              text: 'BANCO:',
              bold: true,
              fontSize: 10,
              border: [false, false, false, true],
            },
            {
              text: 'AGÊNCIA:',
              bold: true,
              fontSize: 10,
              border: [false, false, false, true],
            },
            {
              text: 'DIA DA PARCELA:',
              bold: true,
              fontSize: 10,
              border: [false, false, true, true],
            }
          ]
        ]
      }
    },
    {
      table: {
        widths: ['33.33%', '33.33%', '33.33%'],
        body: [
          [
            {
              text: 'N CARTÃO:',
              bold: true,
              fontSize: 10,
              border: [true, false, false, true],
            },
            {
              text: 'BANDEIRA:',
              bold: true,
              fontSize: 10,
              border: [false, false, false, true],
            },
            {
              text: 'VALIDADE:',
              bold: true,
              fontSize: 10,
              border: [false, false, true, true],
            }
          ]
        ]
      }
    },
    {
      table: {
        widths: ['100%'],
        body: [
          [{
            text: 'NOME NO CARTÃO:',
            bold: true,
            fontSize: 10,
            border: [true, false, true, true],
          }]
        ]
      }
    },
    {
      table: {
        widths: ['33%', '67%'],
        body: [
          [
            {
              text: 'APÓLICE:',
              bold: true,
              fontSize: 10,
              border: [true, false, false, true],
            },
            {
              text: 'C.I:',
              bold: true,
              fontSize: 10,
              border: [false, false, true, true],
            }
          ]
        ]
      }
    })
  }

  const docDefinitions = {
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content: [details],
  };

  if(type === undefined || !type) {
    pdfMake.createPdf(docDefinitions).open();
  }else if(type === 'href') {
    pdfMake.createPdf(docDefinitions).getBlob(blob => {
      window.location.href = window.URL.createObjectURL(blob);;
    });
  }
}