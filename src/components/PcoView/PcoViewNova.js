import React, { Component } from 'react';
import { NodeService } from '../../service/NodeService';
//import { TreeTable } from 'primereact/treetable';
import { TreeTable, TreeState } from 'cp-react-tree-table'
//import { Column } from "primereact/column";
import { Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter, Card,
         Dropdown, DropdownToggle,  DropdownMenu, DropdownItem } from 'reactstrap';
import { translate, Trans } from 'react-i18next';
//import 'src/components/modals/modals_lpn.css'
//import './treetable.css'

class PcoList extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            count: 0,
            nodes: [],
            expandedKeys: {},
            dropdownOpen: false,
            modal: false,
            nodesSemFormat: [],
            nodesFormat: [],
            treeValue: []
        };
        this.nodeservice = new NodeService();

        this.rowClassName = this.rowClassName.bind(this);
        this.onRefreshStatus = this.onRefreshStatus.bind(this);
        this.renderIndexCell = this.renderIndexCell.bind(this);
        this.renderEditableCell = this.renderEditableCell.bind(this);
        this.expand = this.expand.bind(this);
    }

    componentDidMount() {
        this.nodeservice.getTreeTableNodes().then(data => this.constroi(data));
        // this.nodeservice.convertJson().then(data => this.setState({ nodesSemFormat: data }, () => this.forJson()));
    }
    
    constroi(val) {
        //console.log('val', val)
        this.setState({
            treeValue: TreeState.create(val)
        },()=>this.expand())
        console.log('treevalue', this.state.treeValue)
    }

    expand(){
        this.setState({
            treeValue: TreeState.expandAll(this.state.treeValue)
        })
    }

    findNodeByKey(nodes, key) {
        //console.log('find node ', nodes , key)
        let path = key.split('-');
        let node;
        while (path.length) {
            let list = node ? node.children : nodes;
            node = list[parseInt(path[0], 10)];
            path.shift();
        }
        return node;
    }

    //altera a cor da linha
    rowClassName(node) {
        //console.log('row node ',node)
        let keys = node.data.indice.split('-')
        return {
            'bg-gray': (keys.length === 1), 'bg-gray-light': (keys.length === 2), 'bg-gray-lighter': (keys.length === 3),
            'bg-yellow-light': node.data.status === 'alterado', 'bg-success-light':node.data.status==='confirmed', 'bg-danger-light':node.data.status==='rejected'
        }
    }

    onRefreshStatus(props, value) {
        //console.log('on refresh ',props, value)
        this.rowClassName(props)
        // let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
        // let editedNode = this.findNodeByKey(newNodes, props.key);
        // editedNode.data.status = value
        // this.setState({
        //     nodes: newNodes
        // });
    }

    actionTemplate(node, column) {
        //console.log('node action',node)
        //if(node.key!==undefined){

            //let keys = node.key.split('-')
            //hidden={keys.length<4}
            let tamanho = node.data.indice.split('-').length;
        console.log('tamanho',tamanho)
        if(tamanho>3){
            return <div   >
            <ButtonGroup>
                <Button color="success" className="btn-labeled" onClick={() => this.onRefreshStatus(node,'confirmed')} data-toggle="tooltip" title="Aceitar">
                    <span className="btn-md"><i className="fa fa-check"></i></span></Button>
                <Button color="danger" className="btn-labeled" onClick={() => this.onRefreshStatus(node,'rejected')} data-toggle="tooltip" title="Rejeitar">
                    <span className="btn-md"><i className="fa fa-times"></i></span></Button>
            </ButtonGroup>
        </div>;
        }else{
            return
        }
    }

    changeLanguage = lng => {
        this.props.i18n.changeLanguage(lng);
    }

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    handleOnChange = (newValue) => {
        this.setState({ treeValue: newValue });
      }

    renderIndexCell = (row, name) => {
        //console.log('row index e name ',row, name)
        return (
          <div style={{ paddingLeft: (row.metadata.depth * 15) + 'px'}}
            className={row.metadata.hasChildren ? 'with-children' : 'without-children'}>
            {(row.metadata.hasChildren)
              ? (
                  <button className="toggle-button" onClick={row.toggleChildren}></button>
                )
              : ''
            }
            <span>{row.data[name]}</span>
          </div>
        );
    }
    
    renderItemCell = (row, name) => {
        //console.log('row index data name',row.data[name])
        return (
          <div >
            <span>{row.data[name]}</span>
          </div>
        );
    }

    renderEditableCell = (row, value) => {
        console.log('row edittttt '+row.data.indice,row)
        //se for grupo pai ou itens mostra o input, se não não mostra
        let tamanho = row.data.indice.split('-').length;
        console.log('tamanho',tamanho)
        if(tamanho<2 || tamanho>3){
            return (
                <input type="text" value={row.data[value]} disabled={tamanho===1}
                onChange={(event) => {
                    console.log('event',event)
                    row.updateData({
                        ...row.data,
                        [value]: event.target.value,
                    });
                }}/>
                );
        }else{
            return;
        }
      }

    render() {
        // let style={backgroundColor:'#ffffb3'}
        const {t}= this.props;
        return (
            <div className="App">
                <div className="content-section introduction treetableeditdemo">
                    <div className="feature-intro">
                        <div className="ml-auto">
                        <h1>PCO</h1>
                        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle>
                                Language
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-left-forced animated fadeInUpShort">
                                <DropdownItem onClick={() => this.changeLanguage('en')}>English</DropdownItem>
                                <DropdownItem onClick={() => this.changeLanguage('es')}>Português</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                    </div>
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggleModal}><Trans i18nKey='titles.justification'></Trans></ModalHeader>
                    <ModalBody>
                        <Card body>
                            <textarea rows="6" className="form-control note-editor"></textarea>
                        </Card>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggleModal}>Do Something</Button>{' '}
                        <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                {/* <div className="react-grid-Main"> */}
                {/* <div className="table table-bordered content-section implementation react-grid-Header"> */}
                <TreeTable value={this.state.treeValue} onChange={this.handleOnChange} className="table table-bordered content-section implementation react-grid-Header"
                    height={620}>
                    <TreeTable.Column basis="180px" grow="0" renderCell={(e) => this.renderIndexCell(e,'grupoccconta')}
                        renderHeaderCell={() => <span>Grupo / CC / Conta</span>} style={{width:'100px'}}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'item')} style={{width:'100px'}}
                        renderHeaderCell={() => <span>{t('titles.item')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'jan')} style={{width:'100px'}}
                        renderHeaderCell={() => <span>{t('titles.jan')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'janalt')}
                        renderHeaderCell={() => <span>{t('titles.janalt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'fev')}
                        renderHeaderCell={() => <span>{t('titles.feb')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'fevalt')}
                        renderHeaderCell={() => <span>{t('titles.febalt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'mar')}
                        renderHeaderCell={() => <span>{t('titles.mar')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'maralt')}
                        renderHeaderCell={() => <span>{t('titles.maralt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'abr')}
                        renderHeaderCell={() => <span>{t('titles.apr')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'abralt')}
                        renderHeaderCell={() => <span>{t('titles.apralt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'mai')}
                        renderHeaderCell={() => <span>{t('titles.may')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'maialt')}
                        renderHeaderCell={() => <span>{t('titles.mayalt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'jun')}
                        renderHeaderCell={() => <span>{t('titles.jun')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'junalt')}
                        renderHeaderCell={() => <span>{t('titles.junalt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'ago')}
                        renderHeaderCell={() => <span>{t('titles.aug')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'agoalt')}
                        renderHeaderCell={() => <span>{t('titles.augalt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'set')}
                        renderHeaderCell={() => <span>{t('titles.sep')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'setalt')}
                        renderHeaderCell={() => <span>{t('titles.sepalt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'out')}
                        renderHeaderCell={() => <span>{t('titles.oct')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'outalt')}
                        renderHeaderCell={() => <span>{t('titles.octalt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'nov')}
                        renderHeaderCell={() => <span>{t('titles.nov')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'novalt')}
                        renderHeaderCell={() => <span>{t('titles.novalt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'dez')}
                        renderHeaderCell={() => <span>{t('titles.dec')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'dezalt')}
                        renderHeaderCell={() => <span>{t('titles.decalt')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.actionTemplate(e)}
                        renderHeaderCell={() => <span>{t('titles.action')}</span>}/>
                </TreeTable>
                {/* </div> */}
            </div>
        )
    }
}

export default translate('translations')(PcoList);