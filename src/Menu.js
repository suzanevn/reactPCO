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
            name: 'PCO',
            translate: 'titles.pco',
            path: 'pcoView'
        },
        {
            name: 'PCONova',
            translate: 'titles.pco2',
            path: 'pcoViewNova'
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
