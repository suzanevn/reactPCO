import React, { Component } from 'react';
import { NodeService } from '../../service/NodeService';
import { InputText } from 'primereact/inputtext';
import { TreeTable } from 'primereact/treetable';
import { Column } from "primereact/column";
import { Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter, Card,
         Dropdown, DropdownToggle,  DropdownMenu, DropdownItem } from 'reactstrap';
import { translate, Trans } from 'react-i18next';

class PcoList extends Component {
    constructor(props, context) {
        super(props, context);
console.log('props ini ',props)

        this.state = {
            count: 0,
            nodes: [],
            expandedKeys: {},
            dropdownOpen: false,
            modal: false,
            nodesSemFormat: []
        };
        this.nodeservice = new NodeService();

        this.valueEditor = this.valueEditor.bind(this);
        //this.requiredValidator = this.requiredValidator.bind(this);
        this.rowClassName = this.rowClassName.bind(this);
        this.onRefreshStatus = this.onRefreshStatus.bind(this);
        this.criarSubPasta = this.criarSubPasta.bind(this);
    }

    forJson(){
        console.log('for json ',this.state.nodesSemFormat)
        let noarray = this.state.nodesSemFormat
        let ccant='';
        //let novoarray = [];
        // for(let i=0; i<noarray.length;i++){
       
        // }
        var myMap = new Map();
        var jsonarray = [];
        // jsonarray.push({
        //     root: []
        // });
        //let i=0;
        //noarray.forEach((e)=> {
        for(let i=0;i<noarray.length;i++){
            console.log('e ',noarray, 'ant ',ccant)
            //if(noarray[i].cc==='' || noarray[i].cc===ccant){
                myMap.set("cc", noarray[i].cc);
                jsonarray.push({
                    key: noarray[i].grupo,
                    expanded: true,
                    data:{
                        grupoccconta: noarray[i].grupo
                    },
                    children:[  
                        {  
                            key: noarray[i].grupo+"-"+noarray[i].cc,
                            data:{
                                grupoccconta:noarray[i].cc
                            },
                            children:[  
                                {  
                                    key: noarray[i].grupo+"-"+noarray[i].cc+"-"+noarray[i].conta,
                                    data:{
                                        grupoccconta:noarray[i].conta
                                    },
                                    children:[  
                                        {  
                                            key: noarray[i].grupo+"-"+noarray[i].cc+"-"+noarray[i].conta+"-"+noarray[i].item,
                                            data:{  
                                                grupoccconta:"",
                                                item:noarray[i].item
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    cc: noarray[i].cc,
                });
                console.log('criar no child')
           // }else{
                // myMap.set("cc", noarray[i].cc);
                // jsonarray.push({
                //     key: noarray[i].cc,
                //     expanded: true,
                //     data:{
                //         grupoccconta: noarray[i].cc
                //     },
                //     children:[  
                //         {  
                //             key: noarray[i].cc+"-"+noarray[i].conta,
                //         }
                //     ],
                //     cc: noarray[i].cc,
                // });
                // jsonarray.push({
                //     key: noarray[i].cc,
                //     cc: noarray[i].cc,
                //     children: [{
                //         "name": "child1"
                //       },
                //       {
                //         "name": "child2"
                //       }
                //     ]
                // });
                console.log('ir para proximo')
           // }
            ccant=noarray[i].cc;
           // i++;
        }

        console.log("map ", myMap)
        console.log("json resp ", jsonarray)

        // let json = this.state.nodesSemFormat;
        // json.forEach(function(obj) {
        //     //var ul = document.createElement('ul');
        //     //document.body.appendChild(ul);
        //     console.log('obj ',obj)
        //     //this.criarSubPasta(obj, ul);
        // })

        // console.log('resultado ',json)
    }
    criarSubPasta(obj, parent) {
        // criar <li>nome</li>
        var nameLi = document.createElement('li'); 
        nameLi.innerHTML = obj.name;
        parent.appendChild(nameLi);
      
        // parar aqui se não houver children
        if (!obj.children) return;
      
        // preparar um novo <ul></ul> para as subpastas
        var childrenLi = document.createElement('li');
        var ul = document.createElement('ul');
        parent.appendChild(childrenLi);
        childrenLi.appendChild(ul);
        obj.children.forEach(function(child) {
          // correr a mesma lógica recursivamente nas subpastas
          this.criarSubPasta(child, ul);
        });
      }


    componentDidMount() {
        this.nodeservice.getTreeTableNodes().then(data => this.setState({ nodes: data }));
        this.nodeservice.convertJson().then(data => this.setState({ nodesSemFormat: data }, () => this.forJson()));
        

        let expandedKeys = { ...this.state.expandedKeys };
        //expande as colunas
        expandedKeys['0'] = true
        expandedKeys['1'] = true
        expandedKeys['2'] = true
        expandedKeys['3'] = true
        expandedKeys['4'] = true
        expandedKeys['0-0'] = true
        expandedKeys['1-0'] = true
        expandedKeys['2-0'] = true
        expandedKeys['3-0'] = true
        expandedKeys['4-0'] = true
        expandedKeys['0-0-0'] = true
        expandedKeys['1-0-0'] = true
        expandedKeys['2-0-0'] = true
        expandedKeys['3-0-0'] = true
        expandedKeys['4-0-0'] = true
        this.setState({ expandedKeys: expandedKeys });
    }

    onEditorValueChange(props, value) {
        let valueAnt = props.node.data[props.field];
        let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
        //busca o no pai e altera o total
        let noPai = this.findNodeByKey(newNodes, props.node.key.split('-')[0])
        console.log('props field', props.field, 'no pai', noPai, 'total', props.node.data[props.field], 'valant', valueAnt, 'valatual', value)
        noPai.data[props.field] = noPai.data[props.field] - parseInt(valueAnt, 10) + parseInt(value, 10)

        //busca o no atual e seta o novo valor e altera o status
        let editedNode = this.findNodeByKey(newNodes, props.node.key);
        editedNode.data[props.field] = value;
        editedNode.data.status = 'alterado'
        //console.log('node by key ',this.findNodeByKey(newNodes, separado[0]+'-'+separado[1]+'-'+separado[2]))
        //console.log('children ',newNodes[separado[0]].children[separado[1]])

        this.setState({
            nodes: newNodes
        });
    }

    findNodeByKey(nodes, key) {
        let path = key.split('-');
        let node;
        while (path.length) {
            let list = node ? node.children : nodes;
            node = list[parseInt(path[0], 10)];
            path.shift();
        }
        return node;
    }

    inputTextEditor(props, field) {
        //console.log('props tab index', props)
        console.log('input ', props, field)
        this.rowClassName(props.node)
        return (
            <div>
                <InputText type="text" value={props.node.data[field]} style={{width:'50px'}}
                    onChange={(e) => this.onEditorValueChange(props, e.target.value)} />
                <Button color="primary" size="xs" onClick={this.toggleModal} data-toggle="tooltip" title="Justificativa">
                    <em className="fa-1x icon-plus xs-1"></em>
                </Button>    
            </div>
        );
    }

    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }

    //se não for nó do item não deixa aparecer o input para editar
    valueEditor(props) {
        //console.log('value editor', props.node.data.corFundo)
        let separado = props.node.key.split('-')
        if (separado.length >= 4) {
            return this.inputTextEditor(props, props.field);
        }
    }

    // requiredValidator(props) {
    //     let value = props.node.data[props.field];
    //     return value && value.length > 0;
    // }

    //altera a cor da linha
    rowClassName(node) {
        let keys = node.key.split('-')
        //console.log('row class name status', node.data.status)
        return {
            'bg-gray': (keys.length === 1), 'bg-gray-light': (keys.length === 2), 'bg-gray-lighter': (keys.length === 3),
            'bg-yellow-light': node.data.status === 'alterado', 'bg-success-light':node.data.status==='confirmed', 'bg-danger-light':node.data.status==='rejected'
        }
    }

    onRefreshStatus(props, value) {
        console.log('on refresh',props,value)
        let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
        let editedNode = this.findNodeByKey(newNodes, props.key);
        editedNode.data.status = value
        this.setState({
            nodes: newNodes
        });
    }

    actionTemplate(node, column) {
        let keys = node.key.split('-')
        return <div hidden={keys.length<4}  >
            <ButtonGroup>
                <Button color="success" className="btn-labeled" onClick={() => this.onRefreshStatus(node,'confirmed')} data-toggle="tooltip" title="Aceitar">
                    <span className="btn-md"><i className="fa fa-check"></i></span></Button>
                <Button color="danger" className="btn-labeled" onClick={() => this.onRefreshStatus(node,'rejected')} data-toggle="tooltip" title="Rejeitar">
                    <span className="btn-md"><i className="fa fa-times"></i></span></Button>
            </ButtonGroup>
        </div>;
    }

    changeLanguage = lng => {
        this.props.i18n.changeLanguage(lng);
    }

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
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
                <div className="react-grid-Main">
                {/* <div className="table table-bordered content-section implementation react-grid-Header"> */}
                    <TreeTable value={this.state.nodes} expandedKeys={this.state.expandedKeys} 
                    tableClassName="p-treetable p-component " scrollable scrollHeight="700px" scrollWidth="1600px"  
                    // tableClassName="table bg-gray-dark"
                        rowClassName={this.rowClassName} 
                        onToggle={e => this.setState({ expandedKeys: e.value })} responsive >
                        <Column field="grupoccconta" header="Grupo / CC / Conta" expander style={{ width: '200px' }} />
                        <Column field="item" header="Item" style={{ width: '70px' }} />
                        <Column field="jan" header={t('titles.jan')} style={{ width: '70px' }} />
                        <Column field="janalt" header={t('titles.janalt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'1' }} />
                        <Column field="fev" header={t('titles.feb')} style={{ width: '70px' }} />
                        <Column field="fevalt" header={t('titles.febalt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'2' }} />
                        <Column field="mar" header={t('titles.mar')} style={{ width: '70px' }} />
                        <Column field="maralt" header={t('titles.maralt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'3' }} />
                        <Column field="abr" header={t('titles.apr')} style={{ width: '70px' }} />
                        <Column field="abralt" header={t('titles.apralt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'4' }} />
                        <Column field="mai" header={t('titles.may')} style={{ width: '70px' }} />
                        <Column field="maialt" header={t('titles.mayalt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'5' }} />
                        <Column field="jun" header={t('titles.jun')} style={{ width: '70px' }} />
                        <Column field="junalt" header={t('titles.junalt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'6' }} />
                        <Column field="jul" header={t('titles.jul')} style={{ width: '70px' }} />
                        <Column field="julalt" header={t('titles.julalt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'7' }} />
                        <Column field="ago" header={t('titles.aug')} style={{ width: '70px' }} />
                        <Column field="agoalt" header={t('titles.augalt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'8' }} />
                        <Column field="set" header={t('titles.sep')} style={{ width: '70px' }} />
                        <Column field="setalt" header={t('titles.sepalt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'9' }} />
                        <Column field="out" header={t('titles.oct')} style={{ width: '70px' }} />
                        <Column field="outalt" header={t('titles.octalt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'10' }} />
                        <Column field="nov" header={t('titles.nov')} style={{ width: '70px' }} />
                        <Column field="novalt" header={t('titles.novalt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'11' }} />
                        <Column field="dez" header={t('titles.dec')} style={{ width: '70px' }} />
                        <Column field="dezalt" header={t('titles.decalt')} editor={this.valueEditor} style={{ width: '70px', tabIndex:'12' }} />
                        <Column body={(e) => this.actionTemplate(e)} style={{ textAlign: 'center', width: '8em', tabIndex:'13' }} />
                    </TreeTable>
                    <div className="content-heading">
                    <div>Dashboard
                        <small><Trans i18nKey='dashboard.WELCOME'></Trans></small>
                    </div>
                    <div>{t('dashboard.WELCOME')}</div>
                    {/* <Trans i18nKey="dashboard" >
                        Hello <strong title={t('WELCOME')}></strong>, you have unread message. 
                        </Trans> */}
                    </div>
                </div>
            </div>
        )
    }
}

export default translate('translations')(PcoList);