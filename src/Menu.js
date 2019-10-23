const Menu = [
    {
        heading: 'Main Navigation',
        translate: 'sidebar.heading.HEADER'
    },
    {
        name: 'Single View',
        path: 'singleview',
        icon : 'icon-grid',
        translate: 'sidebar.nav.SINGLEVIEW'
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
            name: 'PCO Planilha',
            translate: 'titles.pcoplanilha',
            path: 'pcoPlan'
        }
    ]
    }
];

export default Menu;
