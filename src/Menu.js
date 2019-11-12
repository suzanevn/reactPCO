const Menu = [
    {
        heading: 'Main Navigation',
        translate: 'sidebar.heading.HEADER'
    },
    {
        name: 'Menu',
        icon: 'icon-speedometer',
        translate: 'sidebar.nav.MENU',
        label: { value: 1, color: 'info' },
        submenu: [{
            name: 'Login',
            path: '/login',
            translate: 'titles.login'
        },
        {
            name: 'PCO Admin',
            translate: 'titles.pco',
            path: 'pcoView'
        },
        {
            name: 'PCO Gerente',
            translate: 'titles.pcogerente',
            path: 'pcoViewGerente'
        },
        {
            name: 'PCO2',
            translate: 'titles.pco2',
            path: 'pcoView2'
        },
        {
            name: 'PCO Planilha',
            translate: 'titles.pcoplanilha',
            path: 'pcoPlan'
        }
    ]
    }
];

export default Menu;
