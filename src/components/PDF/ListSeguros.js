import { format } from 'date-fns';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

export default async function printListSeguros(seguros, corretora, filtros) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  const widthTable = [15, 55, 25, '*', 65, 20];

  const content = [
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
                text: filtros.date && `Período:\n${format(filtros.date[0].toDate(), 'dd/MM/yyyy')} - ${format(filtros.date[1].toDate(), 'dd/MM/yyyy')}`,
                bold: true,
                fontSize: 10,
              },
              {
                text: filtros.corretor && `Produtor:\n${filtros.corretor}`,
                bold: true,
                fontSize: 10,
              },
              {
                text: filtros.seguradora && `Seguradora:\n${filtros.seguradora}`,
                bold: true,
                fontSize: 10,
              },
              {
                text: filtros.placa && `Placa: ${filtros.placa}`,
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
        widths: widthTable,
				body: [
					[
            {
              text: null,
            },
            {
              text: 'VIGÊNCIA',
              fontSize: 10,
            },
            {
              text: 'ANO',
              fontSize: 10,
            },
            {
              text: 'SEGURADO',
              fontSize: 10,
            },
            {
              text: 'SEGURADORA',
              fontSize: 10,
            },
            {
              text: '%',
              fontSize: 10,
              alignment: 'center'
            },
          ],
				]
			}
		},
    {
			table: {
        widths: widthTable,
				body: [...seguros].map((item) => [
          {
            text: item.corretor && `${item.corretor.nome.split(' ')[0].slice(0, 1)}${item.corretor.nome.split(' ')[1].slice(0, 1)}`,
            fontSize: 10,
            bold: true,
            alignment: 'center'
          },
          {
            text: format(item.seguro.vigenciaFinal.toDate(), 'dd/MM/yyyy'),
            fontSize: 10
          },
          {
            text: item.segurado.anoAdesao,
            fontSize: 10,
          },
          {
            text: item.segurado.nome,
            fontSize: 10
          },
          {
            text: item.seguradora.razao_social.split(' ')[0],
            fontSize: 10
          },
          {
            text: item.valores.percentual,
            fontSize: 10
          },
        ])
			}
		}
  ];

  const docDefinitions = {
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content
  }

  pdfMake.createPdf(docDefinitions).print();
}