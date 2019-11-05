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
            rowEdit: [],
            dadosreais: [],
            nodesfinalreal:[]
        };
        this.nodeservice = new NodeService();

        this.rowClassName = this.rowClassName.bind(this);
        this.onRefreshStatus = this.onRefreshStatus.bind(this);
        this.renderEditableCell = this.renderEditableCell.bind(this);
    }

    findAllChildren (id, results, field, id2,field2) {
        let nodestate = this.state.dadosreais
        let meses=[25]
        let periodo=''
        for (let d=0; d in nodestate; d++) {
            if (nodestate[d][field] === id && nodestate[d][field2] === id2) {
                nodestate[d].PERIODO = nodestate[d].PERIODO.substring(4, 6);
                //periodo = this.state.meses[parseInt(nodestate[d].AK2_PERIOD, 10)];
                periodo = nodestate[d].PERIODO;
                meses[parseInt(periodo, 10)] = nodestate[d].VLR_ORI;
                meses[parseInt(periodo, 10)+12] = nodestate[d].VLR_ALT;
                //mesesstr=+periodo+':'+valor+',' 
                nodestate[d].meses = meses   
                results.push(nodestate[d])
            }
        }
    }
    
    forJson(){
        var resultsTotal = []
        let grupo=[]
        var resultsConta = []
        let contacontabil=''
        let centrocusto=''
        let adicionados=[]
        let cont=0
        for(let i=0;i<this.state.dadosreais.length;i++){
            if(!adicionados.find(key => key === this.state.dadosreais[i].GRUPO+this.state.dadosreais[i].CONTA+this.state.dadosreais[i].CC)){
                grupo = this.state.dadosreais[i].GRUPO
                contacontabil = this.state.dadosreais[i].CONTA
                centrocusto = this.state.dadosreais[i].CC
                adicionados[cont++]=grupo+contacontabil+centrocusto
                resultsConta=[]
                this.findAllChildren(contacontabil, resultsConta, 'CONTA', centrocusto, 'CC')
                resultsTotal.push(resultsConta)
            }
        }
        
        this.montarDados(resultsTotal)

        console.log('results total final ', resultsTotal)
        // let jsonteste = JSON.stringify(resultsTotal)
    }
    
    //TODO: faltando agrupar os grupos/cc/conta
    montarDados(resultsTotal){
        console.log('resultsTotal dentro montardados', resultsTotal)
        let arrayFinal = []
        let adicionados = 0
        let expandedKeys = { ...this.state.expandedKeys };
        let key1='0',key2='0',key3='0',key4='0'
        let grupocccontaid = ''
        for(let i = 0; i<resultsTotal.length;i++){
            grupocccontaid = resultsTotal[i][0].GRUPO//+"+"+resultsTotal[i][0].CC//+"+"+resultsTotal[i][0].CONTA
            //let encontrou = arrayFinal.find( obj => obj.grupocccontaid === grupocccontaid )
            let encontrou = arrayFinal.find( obj => obj.data.grupoccconta === grupocccontaid )
            console.log('encontrou ', encontrou)
            if(arrayFinal.length===0 || encontrou===undefined || !encontrou){
                expandedKeys[key1] = true
                expandedKeys[key1+'+'+key2] = true
                expandedKeys[key1+'+'+key2+'+'+key3] = true
                expandedKeys[key1+'+'+key2+'+'+key3+'+'+key4] = true

                arrayFinal.push({
                    id: adicionados,//indica a posição no array
                    expanded: true,
                    key: key1,
                    grupocccontaid : grupocccontaid,
                    data: {
                        grupoccconta: resultsTotal[i][0].GRUPO,
                        indice: resultsTotal[i][0].GRUPO,
                        jan: resultsTotal[i][0].meses[1],fev: resultsTotal[i][0].meses[2],mar: resultsTotal[i][0].meses[3],abr: resultsTotal[i][0].meses[4],
                        mai: resultsTotal[i][0].meses[5],jun: resultsTotal[i][0].meses[6],jul: resultsTotal[i][0].meses[7],ago: resultsTotal[i][0].meses[8],
                        set: resultsTotal[i][0].meses[9],out: resultsTotal[i][0].meses[10],nov: resultsTotal[i][0].meses[11],dez: resultsTotal[i][0].meses[12],
                        janalt: resultsTotal[i][0].meses[1],fevalt: resultsTotal[i][0].meses[2],maralt: resultsTotal[i][0].meses[3],abralt: resultsTotal[i][0].meses[4],
                        maialt: resultsTotal[i][0].meses[5],junalt: resultsTotal[i][0].meses[6],julalt: resultsTotal[i][0].meses[7],agoalt: resultsTotal[i][0].meses[8],
                        setalt: resultsTotal[i][0].meses[9],outalt: resultsTotal[i][0].meses[10],novalt: resultsTotal[i][0].meses[11],dezalt: resultsTotal[i][0].meses[12],
                    },
                    children: [{
                        key: key1+'+'+key2,
                        data: {
                            grupoccconta: resultsTotal[i][0].CC,
                            indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC
                        },
                        children:[{
                            key: key1+'+'+key2+'+'+key3,
                            data: {
                                grupoccconta: resultsTotal[i][0].CONTA,
                                indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC
                            },
                            children:[{
                                key: key1+'+'+key2+'+'+key3+'+'+key4,
                                item: '1',
                                data: {
                                    key: key1+'+'+key2+'+'+key3+'+'+key4,
                                    indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+1',
                                    PERIODO: resultsTotal[i][0].PERIODO,
                                    VLR_ORI: resultsTotal[i][0].VLR_ORI,
                                    jan: resultsTotal[i][0].meses[1],fev: resultsTotal[i][0].meses[2],mar: resultsTotal[i][0].meses[3],abr: resultsTotal[i][0].meses[4],
                                    mai: resultsTotal[i][0].meses[5],jun: resultsTotal[i][0].meses[6],jul: resultsTotal[i][0].meses[7],ago: resultsTotal[i][0].meses[8],
                                    set: resultsTotal[i][0].meses[9],out: resultsTotal[i][0].meses[10],nov: resultsTotal[i][0].meses[11],dez: resultsTotal[i][0].meses[12],
                                    janalt: resultsTotal[i][0].meses[1],fevalt: resultsTotal[i][0].meses[2],maralt: resultsTotal[i][0].meses[3],abralt: resultsTotal[i][0].meses[4],
                                    maialt: resultsTotal[i][0].meses[5],junalt: resultsTotal[i][0].meses[6],julalt: resultsTotal[i][0].meses[7],agoalt: resultsTotal[i][0].meses[8],
                                    setalt: resultsTotal[i][0].meses[9],outalt: resultsTotal[i][0].meses[10],novalt: resultsTotal[i][0].meses[11],dezalt: resultsTotal[i][0].meses[12],
                                    jusjan:"",jusfev:"",jusmar:"",jusabr:"",jusmai:"",jusjun:"",jusjul:"",jusago:"",jusset:"",jusout:"",jusnov:"",jusdez:""
                                }
                            }]
                        }]
                    }]
                })
                adicionados++
                key1++
            }else{
                //depois, mudar para validar somente grupo acima e validar CC aqui e abaixo a conta
                //add conta no centro de custo
                console.log('encontrou/resultstotal else///////// ',encontrou,resultsTotal[i][0])
                let encontrouCC = encontrou.children.find( obj => obj.data.grupoccconta === resultsTotal[i][0].CC )
                console.log('encontrou CC ',encontrouCC)
                
                if(encontrouCC){
                    let ultimoChildren = encontrou.children[0].children.length
                    console.log('ultimo children',ultimoChildren)
                    let keysplit = encontrou.children[0].children[ultimoChildren-1].children[0].key.split("+")
                    let key1tmp=parseInt(keysplit[0]),key2tmp=parseInt(keysplit[1]),key3tmp=parseInt(keysplit[2])+1,key4tmp=parseInt(keysplit[3])
                    expandedKeys[key1tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp+'+'+key4tmp] = true
                    console.log('keyyyyy split',keysplit,'ultimo children',ultimoChildren)
                    console.log('keys tmp ', key1tmp, key2tmp, key3tmp, key4tmp)
                    //console.log('key split 2', keysplit[2])
                    arrayFinal[encontrou.id].children[0].children.push({
                        key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                        data: {
                            grupoccconta: resultsTotal[i][0].CONTA,
                            indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC
                        },
                        children:[{
                            key: key1tmp+"+"+key2tmp+"+"+key3tmp +"+"+key4tmp,
                            item: '1',
                            data: {
                                key: key1tmp+"+"+key2tmp+"+"+key3tmp+"+"+key4tmp,
                                indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+1',
                                PERIODO: resultsTotal[i][0].PERIODO,
                                VLR_ORI: resultsTotal[i][0].VLR_ORI,
                                jan: resultsTotal[i][0].meses[1],fev: resultsTotal[i][0].meses[2],mar: resultsTotal[i][0].meses[3],abr: resultsTotal[i][0].meses[4],
                                mai: resultsTotal[i][0].meses[5],jun: resultsTotal[i][0].meses[6],jul: resultsTotal[i][0].meses[7],ago: resultsTotal[i][0].meses[8],
                                set: resultsTotal[i][0].meses[9],out: resultsTotal[i][0].meses[10],nov: resultsTotal[i][0].meses[11],dez: resultsTotal[i][0].meses[12],
                                janalt: resultsTotal[i][0].meses[1],fevalt: resultsTotal[i][0].meses[2],maralt: resultsTotal[i][0].meses[3],abralt: resultsTotal[i][0].meses[4],
                                maialt: resultsTotal[i][0].meses[5],junalt: resultsTotal[i][0].meses[6],julalt: resultsTotal[i][0].meses[7],agoalt: resultsTotal[i][0].meses[8],
                                setalt: resultsTotal[i][0].meses[9],outalt: resultsTotal[i][0].meses[10],novalt: resultsTotal[i][0].meses[11],dezalt: resultsTotal[i][0].meses[12],
                                jusjan:"",jusfev:"",jusmar:"",jusabr:"",jusmai:"",jusjun:"",jusjul:"",jusago:"",jusset:"",jusout:"",jusnov:"",jusdez:""
                            }
                        }]
                    })
                }else{
                    let ultimoChildren = encontrou.children.length
                    let keysplit = encontrou.children[ultimoChildren-1].key.split("+")
                    console.log('ultimochildren',ultimoChildren,'keysplit ',keysplit)
                    let key1tmp=parseInt(keysplit[0]),key2tmp=parseInt(keysplit[1])+1,key3tmp=parseInt(keysplit[2]),key4tmp=parseInt(keysplit[3])
                    
                    
                    
                    key2tmp=key2tmp++
                    key3tmp=0
                    expandedKeys[key1tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp+'+'+key4tmp] = true
                    console.log('elseeeeeeee key2tmp',key2tmp)
                    arrayFinal[encontrou.id].children.push({
                            key: key1tmp+"+"+key2tmp,
                            data: {
                                grupoccconta: resultsTotal[i][0].CC,
                                indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC
                            },
                            children:[{
                                key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                                data: {
                                    grupoccconta: resultsTotal[i][0].CONTA,
                                    indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC
                                },
                                children:[{
                                    key: key1tmp+"+"+key2tmp+"+"+key3tmp +"+"+key4tmp,
                                    item: '1',
                                    data: {
                                        key: key1tmp+"+"+key2tmp+"+"+key3tmp+"+"+key4tmp,
                                        indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+1',
                                        PERIODO: resultsTotal[i][0].PERIODO,
                                        VLR_ORI: resultsTotal[i][0].VLR_ORI,
                                        jan: resultsTotal[i][0].meses[1],fev: resultsTotal[i][0].meses[2],mar: resultsTotal[i][0].meses[3],abr: resultsTotal[i][0].meses[4],
                                        mai: resultsTotal[i][0].meses[5],jun: resultsTotal[i][0].meses[6],jul: resultsTotal[i][0].meses[7],ago: resultsTotal[i][0].meses[8],
                                        set: resultsTotal[i][0].meses[9],out: resultsTotal[i][0].meses[10],nov: resultsTotal[i][0].meses[11],dez: resultsTotal[i][0].meses[12],
                                        janalt: resultsTotal[i][0].meses[1],fevalt: resultsTotal[i][0].meses[2],maralt: resultsTotal[i][0].meses[3],abralt: resultsTotal[i][0].meses[4],
                                        maialt: resultsTotal[i][0].meses[5],junalt: resultsTotal[i][0].meses[6],julalt: resultsTotal[i][0].meses[7],agoalt: resultsTotal[i][0].meses[8],
                                        setalt: resultsTotal[i][0].meses[9],outalt: resultsTotal[i][0].meses[10],novalt: resultsTotal[i][0].meses[11],dezalt: resultsTotal[i][0].meses[12],
                                        jusjan:"",jusfev:"",jusmar:"",jusabr:"",jusmai:"",jusjun:"",jusjul:"",jusago:"",jusset:"",jusout:"",jusnov:"",jusdez:""
                                    }
                                }]
                            }]
                    })
                }
            }
        }
        console.log('arrayFinal fim montar dados', arrayFinal)
        this.setState({
            nodesfinalreal:arrayFinal,
            expandedKeys: expandedKeys
        })
    }

    componentDidMount() {
        this.nodeservice.getTreeTableNodes().then(data => this.setState({ nodes: data }));
        this.nodeservice.convertJson().then(data => this.setState({ nodesSemFormat: data }));
        this.nodeservice.getDadosReais().then(data => this.setState({ dadosreais: data }, () => this.forJson()));
        //alterar depois para buscar com mais dados
        //this.nodeservice.getDadosReaisMaior().then(data => this.setState({ dadosreais: data }, () => this.forJson()));
        
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
        //let path = key.split('-');
        let path = key.split('+');
        let node;
        while (path.length) {
            let list = node ? node.children : nodes;
            //node = list[parseInt(path[0], 10)];
            node = list[path[0]];
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
    
    toggleModalClose = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    
    //salvar da modal de justificativa
    toggleModalSave = () => {
        //let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
        let newNodes = JSON.parse(JSON.stringify(this.state.nodesfinalreal));
        console.log('row edit', this.state.rowEdit)
        let nodeporkey = this.findNodeByKey(newNodes, this.state.rowEdit.key)
        console.log('indice, node por key ',this.state.rowEdit.key, nodeporkey)
        nodeporkey.data[this.state.fieldJustification]=this.state.justification
        this.setState({
            nodesfinalreal: newNodes,
            modal: !this.state.modal
        });
    }

    //busca o nó a ser alterado, seta o novo valor e atualiza o total
    onEditorValueChange(row, value, field) {
        value = value !== null && value !== '' ? value : 0
        let valueAnt = parseFloat(row.data[field].replace(',', '.'));
        value = parseFloat(value.replace(',', '.'));
        if(value!==valueAnt){
            //let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
            let newNodes = JSON.parse(JSON.stringify(this.state.nodesfinalreal));
            
            //busca o no pai e altera o total
            let noPai = this.findNodeByKey(newNodes, row.key.split('+')[0])
            noPai.data[field] = parseFloat(noPai.data[field].replace(',', '.')).toFixed(2) - valueAnt + value
            
            //busca o no atual e seta o novo valor e altera o status
            let editedNode = this.findNodeByKey(newNodes, row.key);
            editedNode.data[field] = value;
            editedNode.data.status = 'alterado'
            
            this.setState({
                nodesfinalreal: newNodes
                //nodes: newNodes
            });
        }
    }

    //monta o campo edit em cada celula
    renderEditableCell = (row, field) => {
        //let tamanho = row.data.indice.split('-').length;
        let tamanho = row.data.indice.split('+').length;
        //se for nó pai mostra só o input com o total
        if (tamanho < 2) {
            return (
                <InputText type="text" value={row.data[field]} style={{ width: '100%' }} disabled={true} />
            );
        //se for os itens mostra o input para edicao e o botao para justificativa    
        } else if (tamanho > 3) {
            return (
                <ButtonGroup>
                    <InputText type='text' defaultValue={row.data[field]} style={{ width: '100%' }} //format='###.##' placeholder="0.00" 
                        onBlur={(e) => this.onEditorValueChange(row, e.target.value, field)} >
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
        //let keys = node.key.split('-')
        let keys = node.key+''.split('+')
        return {
            'bg-gray': (keys.length === 1), 'bg-gray-light': (keys.length === 2), 'bg-gray-lighter': (keys.length === 3),
            'bg-yellow-light': node.data.status === 'alterado', 'bg-success-light':node.data.status==='confirmed', 'bg-danger-light':node.data.status==='rejected'
        }
    }

    //altera a cor da linha para verde(confirmado) ou vermelho(rejeitado)
    onRefreshStatus(props, value) {
        //let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
        let newNodes = JSON.parse(JSON.stringify(this.state.nodesfinalreal));
        let editedNode = this.findNodeByKey(newNodes, props.key);
        editedNode.data.status = value
        this.setState({
            nodesfinalreal: newNodes
            //nodes: newNodes
        });
    }

    //monta os botoes da ultima coluna
    actionTemplate(node) {
        //let keys = node.key.split('-')
        let keys = (""+node.key).split('+')
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
                        <Button color="secondary" onClick={this.toggleModalClose}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                <div className="table table-bordered content-section implementation react-grid-Header">
                    <TreeTable value={this.state.nodesfinalreal} expandedKeys={this.state.expandedKeys} //nodesfinalreal
                        tableClassName="p-treetable p-component " scrollable scrollHeight="700px" scrollWidth="1600px"  
                        rowClassName={this.rowClassName} onToggle={e => this.setState({ expandedKeys: e.value })} responsive >
                        <Column field="grupoccconta" header={t('titles.header')} expander style={{ width: '200px' }} />
                        <Column field="item" header={t('titles.item')} style={{ width: '100px' }} />
                        <Column field="jan" header={t('titles.jan')} style={{ width: '100px' }} />
                        <Column field="janalt" header={t('titles.janalt')} body={(e) => this.renderEditableCell(e,'janalt')} style={{ width: '100px' }} />
                        <Column field="fev" header={t('titles.feb')} style={{ width: '100px' }} />
                        <Column field="fevalt" header={t('titles.febalt')} body={(e) => this.renderEditableCell(e,'fevalt')} style={{ width: '100px' }} />
                        <Column field="mar" header={t('titles.mar')} style={{ width: '100px' }} />
                        <Column field="maralt" header={t('titles.maralt')} body={(e) => this.renderEditableCell(e,'maralt')} style={{ width: '100px' }} />
                        <Column field="abr" header={t('titles.apr')} style={{ width: '100px' }} />
                        <Column field="abralt" header={t('titles.apralt')} body={(e) => this.renderEditableCell(e,'abralt')} style={{ width: '100px' }} />
                        <Column field="mai" header={t('titles.may')} style={{ width: '100px' }} />
                        <Column field="maialt" header={t('titles.mayalt')} body={(e) => this.renderEditableCell(e,'maialt')} style={{ width: '100px' }} />
                        <Column field="jun" header={t('titles.jun')} style={{ width: '100px' }} />
                        <Column field="junalt" header={t('titles.junalt')} body={(e) => this.renderEditableCell(e,'junalt')} style={{ width: '100px' }} />
                        <Column field="jul" header={t('titles.jul')} style={{ width: '100px' }} />
                        <Column field="julalt" header={t('titles.julalt')} body={(e) => this.renderEditableCell(e,'julalt')} style={{ width: '100px' }} />
                        <Column field="ago" header={t('titles.aug')} style={{ width: '100px' }} />
                        <Column field="agoalt" header={t('titles.augalt')} body={(e) => this.renderEditableCell(e,'agoalt')} style={{ width: '100px' }} />
                        <Column field="set" header={t('titles.sep')} style={{ width: '100px' }} />
                        <Column field="setalt" header={t('titles.sepalt')} body={(e) => this.renderEditableCell(e,'setalt')} style={{ width: '100px' }} />
                        <Column field="out" header={t('titles.oct')} style={{ width: '100px' }} />
                        <Column field="outalt" header={t('titles.octalt')} body={(e) => this.renderEditableCell(e,'outalt')} style={{ width: '100px' }} />
                        <Column field="nov" header={t('titles.nov')} style={{ width: '100px' }} />
                        <Column field="novalt" header={t('titles.novalt')} body={(e) => this.renderEditableCell(e,'novalt')} style={{ width: '100px' }} />
                        <Column field="dez" header={t('titles.dec')} style={{ width: '100px' }} />
                        <Column field="dezalt" header={t('titles.decalt')} body={(e) => this.renderEditableCell(e,'dezalt')} style={{ width: '100px' }} />
                        <Column body={(e) => this.actionTemplate(e)} style={{ textAlign: 'center', width: '8em' }} />
                    </TreeTable>
                </div>
            </div>
        )
    }
}

export default translate('translations')(PcoList);