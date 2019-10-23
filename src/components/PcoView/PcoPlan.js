import React, { Component } from 'react';
import ContentWrapper from '../Layout/ContentWrapper';
import { Container, Button, Dropdown, DropdownToggle,  DropdownMenu, DropdownItem } from 'reactstrap';
import ReactDataGrid from 'react-data-grid';
import { NodeService } from '../../service/NodeService';
import { translate } from 'react-i18next';

// Custom Formatter component
const EditButtons = props => (
    <div>
        <Button ><span className="fas fa-user-edit"></span></Button>
        <Button><span className="fas fa-binoculars"></span></Button>
    </div>
)

class PcoPlan extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = { 
            originalRows:[], 
            rows:[], 
            dados:[],
            dropdownOpen: false,
            modal: false
        };
        const {t} = this.props;
        this._columns = [
            {
                key: 'name',
                name: t('titles.name'),
                sortable: true
            },
            {
                key: 'status',
                name: t('titles.status'),
                sortable: true
            },
            {
                key: 'year',
                name: t('titles.year'),
                sortable: true
            },
            {
                key: 'complete',
                name: t('titles.action'),
                formatter: EditButtons,
                sortable: true
            }
        ];

        this.nodeservice = new NodeService();
        this.constroi = this.constroi.bind(this)
    }
    
    componentDidMount() {
        //this.nodeservice.getPlanilhas().then(data => this.setState({dados:data}));
        this.nodeservice.getPlanilhas().then(data => this.constroi(data));
    }

    constroi(val){
        this.setState({
            dados:val
        })
        console.log('val',val)
        console.log('val state',this.state.dados)
        let originalRows = this.createRows(1000);
        let rows = originalRows.slice(0);
        this.setState({
            originalRows:originalRows,
            rows: rows
        });
    }
    getRandomDate = (start, end) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleDateString();
    };

    createRows = () => {
        let rows = [];
        console.log(this.state.dados.length)
        for (let i = 0; i < this.state.dados.length; i++) {
            rows.push({
                name: this.state.dados[i].name,
                status: this.state.dados[i].status,
                year: this.state.dados[i].year,
                complete: Math.min(100, Math.round(Math.random() * 110)),
            });
        }
        // for (let i = 1; i < 4; i++) {
        //     rows.push({
        //         id: i,
        //         name: 'Task ' + i,
        //         status: ['Critical', 'High', 'Medium', 'Low'][Math.floor((Math.random() * 3) + 1)],
        //         year: this.getRandomDate(new Date(2018, 3, 1), new Date()),
        //         complete: Math.min(100, Math.round(Math.random() * 110)),
        //     });
        // }

        return rows;
    };

    rowGetter = (i) => this.state.rows[i]

    handleGridSort = (sortColumn, sortDirection) => {
        const comparer = (a, b) => {
          if (sortDirection === 'ASC') {
            return (a[sortColumn] > b[sortColumn]) ? 1 : -1;
          } else if (sortDirection === 'DESC') {
            return (a[sortColumn] < b[sortColumn]) ? 1 : -1;
          }
        };

        const rows = sortDirection === 'NONE' ? this.state.originalRows.slice(0) : this.state.rows.sort(comparer);

        this.setState({ rows });
    };

    changeLanguage = lng => {
        this.props.i18n.changeLanguage(lng);
    }

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    render() {
        return  (
            <ContentWrapper>
                <div className="content-heading">
                    <div>Planilhas PCO</div>
                    <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                        <DropdownToggle>
                            Language
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu animated fadeInUpShort">
                            <DropdownItem onClick={() => this.changeLanguage('en')}>English</DropdownItem>
                            <DropdownItem onClick={() => this.changeLanguage('es')}>Português</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <Container fluid>
                    <ReactDataGrid
                        onGridSort={this.handleGridSort}
                        columns={this._columns}
                        rowGetter={this.rowGetter}
                        rowsCount={this.state.rows.length}
                        minHeight={600} />
                </Container>
            </ContentWrapper>
        )
    }
}

export default translate('translations') (PcoPlan);