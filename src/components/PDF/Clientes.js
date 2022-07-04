import { format } from 'date-fns';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

export default async function printListSeguros({ clientes }) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  const content = [
    {
			table: {
        widths: '*',
				body: [
          [
            {
              text: 'LISTAGEM DE CLIENTES',
              alignment: 'left',
              border: [true, true, false, true],
              bold: true,
              fontSize: 20,
            },
            {
              text: `TOTAL: ${String(clientes.length).padStart(2, '0')}`,
              alignment: 'right',
              border: [false, true, true, true],
              bold: true,
              fontSize: 15,
            }
          ]
				]
			}
		},
    {
			table: {
        widths: ['*', 100, 100, 50],
        border: null,
				body: [
          [ 
            {
              text: 'NOME',
              alignment: 'left',
              bold: true,
            },
            {
              text: 'CPF',
              alignment: 'left',
              bold: true,
            },
            {
              text: 'CELULAR',
              alignment: 'left',
              bold: true,
            },
            {
              text: 'ADESÃO',
              alignment: 'center',
              bold: true,
            },
          ]
        ]
			}
    },
    {
			table: {
        widths: ['*', 100, 100, 50],
        border: null,
				body: clientes.map((item, index) => [ 
          {
            text: item.nome,
            alignment: 'left',
            bold: true,
          },
          {
            text: item.cpf,
            alignment: 'left',
            bold: true,
          },
          {
            text: item.telefone,
            alignment: 'left',
            bold: true,
          },
          {
            text: item.anoAdesao,
            alignment: 'center',
            bold: true,
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