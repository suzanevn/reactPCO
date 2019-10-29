import React, { Component } from 'react';
import { NodeService } from '../../service/NodeService';
import { InputText } from 'primereact/inputtext';
import { TreeTable } from 'primereact/treetable';
import { Column } from "primereact/column";
import { Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter, Card,
         Dropdown, DropdownToggle,  DropdownMenu, DropdownItem } from 'reactstrap';
import { translate, Trans } from 'react-i18next';
import './input.css'

class PcoList extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            nodes: [],
            expandedKeys: {},
            dropdownOpen: false,
            modal: false,
            nodesSemFormat: [],
            nodesFormat: [],
            justification:'',
            fieldJustification:'',
            rowEdit: []
        };
        this.nodeservice = new NodeService();

        this.rowClassName = this.rowClassName.bind(this);
        this.onRefreshStatus = this.onRefreshStatus.bind(this);
        this.renderEditableCell = this.renderEditableCell.bind(this);
        this.criarSubPasta = this.criarSubPasta.bind(this);
    }

    forJson(){
        console.log('sem formato ',this.state.nodesSemFormat)
        console.log('nodes atual ',this.state.nodes)
        let noarray = this.state.nodesSemFormat
        //let ccant='';
        let grupoant='';
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
            //se o grupo não for o mesmo do anterior, cria um novo
            if(noarray[i].grupo!==grupoant){
                console.log('if grupoant', grupoant)
                myMap.set("cc", noarray[i].grupo);
                jsonarray.push({
                    key: noarray[i].grupo,
                    expanded: true,
                    data:{
                        grupoccconta: noarray[i].grupo
                    },
                    children:[  
                        {  
                            key: noarray[i].grupo+"-"+noarray[i].cc,
                            expanded: true,
                            data:{
                                grupoccconta:noarray[i].cc
                            },
                            children:[  
                                {  
                                    key: noarray[i].grupo+"-"+noarray[i].cc+"-"+noarray[i].conta,
                                    expanded: true,
                                    data:{
                                        grupoccconta:noarray[i].conta
                                    },
                                    children:[  
                                        {  
                                            key: noarray[i].grupo+"-"+noarray[i].cc+"-"+noarray[i].conta+"-"+noarray[i].item,
                                            expanded: true,
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
                grupoant=noarray[i].grupo
            }else{
                console.log('else')
                //busca nó do grupo e seta o resto como filho
                console.log('json array ',jsonarray)
                let newNodes = JSON.parse(JSON.stringify(jsonarray));
                let nodeporkey = this.findNodeByKey(newNodes, "Grupo1")
                console.log('key, new nodes, nodepor key ',noarray[i].grupo,newNodes,nodeporkey)
                console.log('group 1 ',newNodes.Group1)
                // newNodes[0].push({
                //     children:[  
                //         {  
                //             key: noarray[i].grupo+"-"+noarray[i].cc,
                //             expanded: true,
                //             data:{
                //                 grupoccconta:noarray[i].cc
                //             },
                //             children:[  
                //                 {  
                //                     key: noarray[i].grupo+"-"+noarray[i].cc+"-"+noarray[i].conta,
                //                     expanded: true,
                //                     data:{
                //                         grupoccconta:noarray[i].conta
                //                     },
                //                     children:[  
                //                         {  
                //                             key: noarray[i].grupo+"-"+noarray[i].cc+"-"+noarray[i].conta+"-"+noarray[i].item,
                //                             expanded: true,
                //                             data:{  
                //                                 grupoccconta:"",
                //                                 item:noarray[i].item
                //                             }
                //                         }
                //                     ]
                //                 }
                //             ]
                //         }
                //     ],
                //     cc: noarray[i].cc,
                // });
            }
        }

        console.log("json resp ", jsonarray)
        this.setState({
            nodesFormat:jsonarray
        })

        // let json = this.state.nodesSemFormat;
        // json.forEach(function(obj) {
        //     //var ul = document.createElement('ul');
        //     //document.body.appendChild(ul);
        //     //this.criarSubPasta(obj, ul);
        // })

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
        //this.nodeservice.getPlanilhas().then(data => console.log('data', data));

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

    findNodeByKey(nodes, key) {
        console.log('findNodeByKey', nodes,key)
        let path = key.split('-');
        let node;
        console.log('split', path)
        while (path.length) {
            let list = node ? node.children : nodes;
            node = list[parseInt(path[0], 10)];
            console.log('node while ',node)
            path.shift();
        }
        return node;
    }

    toggleModal = (e, field) => {
        let jusfield='';
        //monta o nome do campo justificativa
        if(field!==undefined){
            let fieldsplit = field.split('');
            jusfield='jus'+fieldsplit[0]+fieldsplit[1]+fieldsplit[2]
        }
        this.setState({
            modal: !this.state.modal,
            justification: e.data!==undefined&&jusfield!==''?e.data[jusfield]:'',
            rowEdit: e.data,
            fieldJustification:jusfield
        });
    }
    
    //salvar da modal de justificativa
    toggleModalSave = () => {
        let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
        let nodeporkey = this.findNodeByKey(newNodes, this.state.rowEdit.indice)
        nodeporkey.data[this.state.fieldJustification]=this.state.justification
        this.setState({
            nodes: newNodes,
            modal: !this.state.modal
        });
    }

    //busca o nó a ser alterado, seta o novo valor e atualiza o total
    onEditorValueChange(row, value, field) {
        value = value !== null && value !== '' ? value : 0
        let valueAnt = row.data[field];
        if(parseInt(value, 10)!==parseInt(valueAnt, 10)){
            let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
            //busca o no pai e altera o total
            let noPai = this.findNodeByKey(newNodes, row.key.split('-')[0])
            noPai.data[field] = noPai.data[field] - parseInt(valueAnt, 10) + parseInt(value, 10)
            //busca o no atual e seta o novo valor e altera o status
            let editedNode = this.findNodeByKey(newNodes, row.key);
            editedNode.data[field] = value;
            editedNode.data.status = 'alterado'
            this.setState({
                nodes: newNodes
            });
        }
    }

    //monta o campo edit em cada celula
    renderEditableCell = (row, field) => {
        let tamanho = row.data.indice.split('-').length;
        //se for nó pai mostra só o input com o total
        if (tamanho < 2) {
            return (
                <InputText type="text" value={row.data[field]} style={{ width: '40px' }} disabled={true} />
            );
        //se for os itens mostra o input para edicao e o botao para justificativa    
        } else if (tamanho > 3) {
            return (
                <ButtonGroup>
                    <InputText type='number' defaultValue={row.data[field]} style={{ width: '40px' }}
                        onBlur={(e) => this.onEditorValueChange(row, e.target.value, field)}>
                    </InputText>
                    <Button color="primary" size="xs" onClick={() => this.toggleModal(row, field)} data-toggle="tooltip" title="Justificativa" hidden={tamanho === 1}
                        tabIndex={-1} style={{ width: '22px' }}>
                        <em className="fa-1x icon-plus xs-1" ></em>
                    </Button>
                </ButtonGroup>
            );
        } else {
            return;
        }
    }

    //altera a cor da linha
    rowClassName(node) {
        let keys = node.key.split('-')
        return {
            'bg-gray': (keys.length === 1), 'bg-gray-light': (keys.length === 2), 'bg-gray-lighter': (keys.length === 3),
            'bg-yellow-light': node.data.status === 'alterado', 'bg-success-light':node.data.status==='confirmed', 'bg-danger-light':node.data.status==='rejected'
        }
    }

    //altera a cor da linha para verde(confirmado) ou vermelho(rejeitado)
    onRefreshStatus(props, value) {
        let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
        let editedNode = this.findNodeByKey(newNodes, props.key);
        editedNode.data.status = value
        this.setState({
            nodes: newNodes
        });
    }

    //monta os botoes da ultima coluna
    actionTemplate(node) {
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
                            <textarea rows="6" className="form-control note-editor" defaultValue={this.state.justification} onBlur={(e)=>this.setState({justification: e.target.value})}></textarea>
                        </Card>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggleModalSave}>Save</Button>{' '}
                        <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                <div className="table table-bordered content-section implementation react-grid-Header">
                    <TreeTable value={this.state.nodes} expandedKeys={this.state.expandedKeys} 
                        tableClassName="p-treetable p-component " scrollable scrollHeight="700px" scrollWidth="1600px"  
                        rowClassName={this.rowClassName} onToggle={e => this.setState({ expandedKeys: e.value })} responsive >
                        <Column field="grupoccconta" header={t('titles.header')} expander style={{ width: '200px' }} />
                        <Column field="item" header={t('titles.item')} style={{ width: '70px' }} />
                        <Column field="jan" header={t('titles.jan')} style={{ width: '70px' }} />
                        <Column field="janalt" header={t('titles.janalt')} body={(e) => this.renderEditableCell(e,'janalt')} style={{ width: '70px' }} />
                        <Column field="fev" header={t('titles.feb')} style={{ width: '70px' }} />
                        <Column field="fevalt" header={t('titles.febalt')} body={(e) => this.renderEditableCell(e,'fevalt')} style={{ width: '70px' }} />
                        <Column field="mar" header={t('titles.mar')} style={{ width: '70px' }} />
                        <Column field="maralt" header={t('titles.maralt')} body={(e) => this.renderEditableCell(e,'maralt')} style={{ width: '70px' }} />
                        <Column field="abr" header={t('titles.apr')} style={{ width: '70px' }} />
                        <Column field="abralt" header={t('titles.apralt')} body={(e) => this.renderEditableCell(e,'abralt')} style={{ width: '70px' }} />
                        <Column field="mai" header={t('titles.may')} style={{ width: '70px' }} />
                        <Column field="maialt" header={t('titles.mayalt')} body={(e) => this.renderEditableCell(e,'maialt')} style={{ width: '70px' }} />
                        <Column field="jun" header={t('titles.jun')} style={{ width: '70px' }} />
                        <Column field="junalt" header={t('titles.junalt')} body={(e) => this.renderEditableCell(e,'junalt')} style={{ width: '70px' }} />
                        <Column field="jul" header={t('titles.jul')} style={{ width: '70px' }} />
                        <Column field="julalt" header={t('titles.julalt')} body={(e) => this.renderEditableCell(e,'julalt')} style={{ width: '70px' }} />
                        <Column field="ago" header={t('titles.aug')} style={{ width: '70px' }} />
                        <Column field="agoalt" header={t('titles.augalt')} body={(e) => this.renderEditableCell(e,'agoalt')} style={{ width: '70px' }} />
                        <Column field="set" header={t('titles.sep')} style={{ width: '70px' }} />
                        <Column field="setalt" header={t('titles.sepalt')} body={(e) => this.renderEditableCell(e,'setalt')} style={{ width: '70px' }} />
                        <Column field="out" header={t('titles.oct')} style={{ width: '70px' }} />
                        <Column field="outalt" header={t('titles.octalt')} body={(e) => this.renderEditableCell(e,'outalt')} style={{ width: '70px' }} />
                        <Column field="nov" header={t('titles.nov')} style={{ width: '70px' }} />
                        <Column field="novalt" header={t('titles.novalt')} body={(e) => this.renderEditableCell(e,'novalt')} style={{ width: '70px' }} />
                        <Column field="dez" header={t('titles.dec')} style={{ width: '70px' }} />
                        <Column field="dezalt" header={t('titles.decalt')} body={(e) => this.renderEditableCell(e,'dezalt')} style={{ width: '70px' }} />
                        <Column body={(e) => this.actionTemplate(e)} style={{ textAlign: 'center', width: '8em' }} />
                    </TreeTable>
                </div>
            </div>
        )
    }
}

export default translate('translations')(PcoList);