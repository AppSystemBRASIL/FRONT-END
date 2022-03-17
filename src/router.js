const router = [
  {
    title: 'PAINEL',
    patchname: '/painel/dashboard',
    icon: 'bx bx-bar-chart-alt-2',
    roles: ['administrador', 'corretor', 'gestor']
  },
  {
    title: 'COTAÇÕES/SEGUROS',
    icon: 'bx bx-file',
    pages: [
      {
        title: 'COTAÇÕES',
        patchname: '/painel/ cotacoes',
        icon: 'bx bx-file',
      },
      {
        title: 'SEGUROS',
        patchname: '/painel/seguros',
        icon: 'bx bx-file',
      }
    ],
    roles: ['administrador', 'corretor', 'gestor']
  },
  {
    title: 'CORRETORAS/SEGURADORAS',
    icon: 'bx bxs-school',
    pages: [
      {
        title: 'CORRETORAS',
        patchname: '/painel/corretoras',
        icon: 'bx bxs-school',
      },
      {
        title: 'SEGURADORAS',
        patchname: '/painel/seguradoras',
        icon: 'bx bxs-school',
      }
    ],
    roles: ['administrador']
  },
  {
    title: 'CORRETORES',
    patchname: '/painel/corretores',
    icon: 'bx bx-user',
    roles: ['administrador', 'gestor']
  },
  {
    title: 'MENSAGENS',
    patchname: '/painel/mensagens',
    icon: 'bx bx-chat',
    roles: ['administrador', 'gestor']
  },
]

export default router;