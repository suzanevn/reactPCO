import React, { Component } from 'react';
import { NodeService } from '../../service/NodeService';
//import { TreeTable } from 'primereact/treetable';
import { TreeTable, TreeState } from 'cp-react-tree-table'
//import { Column } from "primereact/column";
import { Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter, Card,
         Dropdown, DropdownToggle,  DropdownMenu, DropdownItem } from 'reactstrap';
import { translate, Trans } from 'react-i18next';
//import 'src/components/modals/modals_lpn.css'
import './treetable.css'
//import './treetabledemo.css'
//import './treetablepronta.scss'
//import '../../styles/bootstrap/_tables.scss'

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
            treeValue: [],
            dadosreais: [],
            nodesfinalreal: []
        };
        this.nodeservice = new NodeService();

        this.rowClassName = this.rowClassName.bind(this);
        this.onRefreshStatus = this.onRefreshStatus.bind(this);
        this.renderIndexCell = this.renderIndexCell.bind(this);
        this.renderEditableCell = this.renderEditableCell.bind(this);
        this.expand = this.expand.bind(this);
        this.forJson = this.forJson.bind(this);
    }

    componentDidMount() {
        //this.nodeservice.getTreeTableNodes().then(data => this.constroi(data));
        this.nodeservice.getDadosReaisFormatado().then(data => this.constroi(data));
        //this.nodeservice.getDadosReaisMaior().then(data => this.constroi(data));
        // this.nodeservice.convertJson().then(data => this.setState({ nodesSemFormat: data }, () => this.forJson()));
        //this.nodeservice.getDadosReaisMaior().then(data => this.setState({ dadosreais: data }, () => this.forJson()));
        // this.constroi(this.state.nodesfinalreal)
    }
    
    constroi(val) {
        console.log('val', val)
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
        console.log('find node ', nodes , key)
        //let path = key.split('-');
        let path = key.split('+');
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
        console.log('row node ',node)
        //let keys = node.data.indice.split('-')
        let keys = node.data.key.split('+')
        return {
            'bg-gray': (keys.length === 1), 'bg-gray-light': (keys.length === 2), 'bg-gray-lighter': (keys.length === 3),
            'bg-yellow-light': node.data.status === 'alterado', 'bg-success-light':node.data.status==='confirmed', 'bg-danger-light':node.data.status==='rejected'
        }
    }

    onRefreshStatus(props, value) {
        console.log('on refresh ',props, value)
        props.data.status = value
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
            //let tamanho = node.data.indice.split('-').length;
            let tamanho = (""+node.data.key).split('+').length;
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
        return (
          <div >
            <span>{row.data[name]}</span>
          </div>
        );
    }

    toggleModal = (e, field) => {
        console.log('toggle modal ', e, field)
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
        let newNodes = JSON.parse(JSON.stringify(this.state.treeValue));
        this.state.rowEdit[this.state.fieldJustification]=this.state.justification
        let tamanho = newNodes.data.length
        for(let i=0;i<tamanho;i++){
            if(this.state.rowEdit.key===newNodes.data[i].data.key){
                newNodes.data[i].data[this.state.fieldJustification] = this.state.justification
                break
            }
        }
        this.setState({
            modal: !this.state.modal
        });
    }

     //busca o nó a ser alterado, seta o novo valor e atualiza o total
     onEditorValueChange(row, value, field) {
        let rowsplit = (""+row.data.key).split("+")
        
        value = value !== null && value !== '' ? value : 0
        let valueAnt = parseFloat((""+row.data[field]).replace(',', '.'));
        value = parseFloat(value.replace(',', '.'));
        
        console.log('value change row value field valueant', row, value, field, valueAnt)
        //if(value!==valueAnt){
            let newNodes = JSON.parse(JSON.stringify(this.state.treeValue));
            let tamanho = newNodes.data.length
            for(let i=0;i<tamanho;i++){
                console.log('rowsplit[0] newNodes.data[i].data.key', rowsplit[0], newNodes.data[i].data.key)
                if(rowsplit[0]===newNodes.data[i].data.key){
                    console.log('new nodesssss, value ant, value', newNodes, valueAnt, value)
                    newNodes.data[i].data[field] = parseFloat((""+newNodes.data[i].data[field]).replace(',', '.')).toFixed(2) - valueAnt + value
                    //newNodes.data[i].data[this.state.fieldJustification] = this.state.justification
                    break
                }
            }
            
            // newNodes.data[i].data.updateData({
            //     ...newNodes.data,
            //     [field]: parseFloat((""+newNodes.data[i].data[field]).replace(',', '.')).toFixed(2) - valueAnt + value
            //    // treeValue: newNodes
            // });
            // row.updateData({
            //     ...row.data,
            //     [field]: value,
            //     status: "alterado"
            // });
            //this.constroi(newNodes)
            console.log('new nodes depois ', newNodes)
       // }
    }

    renderEditableCell = (row, value) => {
        //console.log('row ',row)
        //se for grupo pai ou itens mostra o input, se não não mostra
        let tamanho = (""+row.data.key).split('+').length;
        //let tamanho = row.data.indice.split('-').length;
        if(tamanho<2 || tamanho>3){
            return (
                <div style={{}}>
                    <input type="text" value={row.data[value]} disabled={tamanho===1} style={{width:'80%'}}
                    onChange={(event) => {
                        row.updateData({
                            ...row.data,
                            [value]: event.target.value,
                            status: "alterado"
                        });
                    }} 
                    onBlur={(e) => this.onEditorValueChange(row, e.target.value, value)} />
                    <Button color="primary" size="xs" onClick={() => this.toggleModal(row, value)} data-toggle="tooltip" title="Justificativa" hidden={tamanho === 1}
                        tabIndex={-1} style={{ width: '22px' }}>
                        <em className="fa-1x icon-plus xs-1" ></em>
                    </Button> 
                    </div>
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
                            <textarea rows="6" className="form-control note-editor" defaultValue={this.state.justification} onBlur={(e)=>this.setState({justification: e.target.value})}></textarea>
                        </Card>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggleModalSave}>Save</Button>{' '}
                        <Button color="secondary" onClick={this.toggleModalClose}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                {/* <div className="react-grid-Main"> */}
                {/* <div className="table table-bordered content-section implementation react-grid-Header"> */}
                {/* <div className="cp_tree-table demo-tree-table"> */}
                <div className="table table-bordered content-section implementation react-grid-Header" >
                <TreeTable value={this.state.treeValue} onChange={this.handleOnChange}  //className="table table-bordered content-section implementation react-grid-Header"
                    height={620} rowClassName="cp_tree-table_row_teste"> 
                    {/* className={this.rowClassName} */}
                    <TreeTable.Column basis="180px" grow="0" renderCell={(e) => this.renderIndexCell(e,'grupoccconta')}
                        renderHeaderCell={() => <span>Grupo / CC / Conta</span>}  />
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'item')}
                        renderHeaderCell={() => <span>{t('titles.item')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderItemCell(e,'jan')} 
                        renderHeaderCell={() => <span>{t('titles.jan')}</span>}/>
                    <TreeTable.Column renderCell={(e) => this.renderEditableCell(e,'janalt')} 
                        renderHeaderCell={() => <span>{t('titles.janalt')}</span>} style={{backgroundColor: 'blue', background: 'red !important'}} />
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
                </div>
                {/* </div> */}
            </div>
        )
    }

//**************************************************************** */
    findAllChildren (id, results, field, id2,field2) {
        let nodestate = this.state.dadosreais
        let meses=[25]
        let periodo=''
        for (let d=0; d in nodestate; d++) {
            if (nodestate[d][field] === id && nodestate[d][field2] === id2) {
                nodestate[d].PERIODO = nodestate[d].PERIODO.substring(4, 6);
                periodo = nodestate[d].PERIODO;
                meses[parseInt(periodo, 10)] = nodestate[d].VLR_ORI;
                meses[parseInt(periodo, 10)+12] = nodestate[d].VLR_ALT;
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

    //agrupa grupos/cc/conta
    montarDados(resultsTotal){
        //console.log('resultsTotal dentro montardados', resultsTotal)
        let arrayFinal = []
        let adicionados = 0
        //let expandedKeys = { ...this.state.expandedKeys };
        let key1='0',key2='0',key3='0',key4='0'
        let grupocccontaid = ''
        for(let i = 0; i<resultsTotal.length;i++){
            grupocccontaid = resultsTotal[i][0].GRUPO//+"+"+resultsTotal[i][0].CC//+"+"+resultsTotal[i][0].CONTA
            //let encontrou = arrayFinal.find( obj => obj.grupocccontaid === grupocccontaid )
            let encontrou = arrayFinal.find( obj => obj.data.grupoccconta === grupocccontaid )
            //console.log('encontrou ', encontrou)
            if(arrayFinal.length===0 || encontrou===undefined || !encontrou){
                // expandedKeys[key1] = true
                // expandedKeys[key1+'+'+key2] = true
                // expandedKeys[key1+'+'+key2+'+'+key3] = true
                // expandedKeys[key1+'+'+key2+'+'+key3+'+'+key4] = true

                arrayFinal.push({
                    id: adicionados,//indica a posição no array
                    expanded: true,
                    key: key1,
                    grupocccontaid : grupocccontaid,
                    data: {
                        key: key1,
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
                            key: key1+'+'+key2,
                            grupoccconta: resultsTotal[i][0].CC,
                            indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC
                        },
                        children:[{
                            key: key1+'+'+key2+'+'+key3,
                            data: {
                                key: key1+'+'+key2+'+'+key3,
                                grupoccconta: resultsTotal[i][0].CONTA,
                                indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC
                            },
                            children:[{
                                key: key1+'+'+key2+'+'+key3+'+'+key4,
                                item: '1',
                                data: {
                                    key: key1+'+'+key2+'+'+key3+'+'+key4,
                                    indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+1',
                                    item: key4+''+1,
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
                //add conta no centro de custo
                let encontrouCC = encontrou.children.find( obj => obj.data.grupoccconta === resultsTotal[i][0].CC )
                //se CC ja esta adicionado, somente adiciona a nova conta dentro dele
                if(encontrouCC){
                    //let encontrouConta = encontrouCC.children.find( obj => obj.data.grupoccconta === resultsTotal[i][0].CONTA )
                    //para saber a posição do CC no array
                    let keyconta = encontrouCC.key.split("+")
                    //pega o ultimo children da conta adicionada no CC e adiciona no próximo
                    let ultimoChildren = encontrouCC.children.length

                    let keysplit = encontrou.children[keyconta[1]].children[ultimoChildren-1].children[0].key.split("+")
                    let key1tmp=parseInt(keysplit[0]),key2tmp=parseInt(keysplit[1]),key3tmp=parseInt(keysplit[2])+1,key4tmp=parseInt(keysplit[3]) || 0
                    // expandedKeys[key1tmp] = true
                    // expandedKeys[key1tmp+'+'+key2tmp] = true
                    // expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp] = true
                    // expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp+'+'+key4tmp] = true
                    //adiciona conta no grupo referente ao ID, no CC encontrado
                    arrayFinal[encontrou.id].children[keysplit[1]].children.push({
                        key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                        data: {
                            key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                            grupoccconta: resultsTotal[i][0].CONTA,
                            indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC
                        },
                        children:[{
                            key: key1tmp+"+"+key2tmp+"+"+key3tmp+"+"+key4tmp,
                            item: '1',
                            data: {
                                key: key1tmp+"+"+key2tmp+"+"+key3tmp+"+"+key4tmp,
                                indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+1',
                                item: key4tmp+''+1,
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
                    //parseFloat(noPai.data[field].replace(',', '.')).toFixed(2)
                    //atualizar o total
                    arrayFinal[encontrou.id].data.jan=parseFloat(parseFloat(arrayFinal[encontrou.id].data.jan)+parseFloat(resultsTotal[i][0].meses[1])).toFixed(2)
                    arrayFinal[encontrou.id].data.fev=parseFloat(parseFloat(arrayFinal[encontrou.id].data.fev)+parseFloat(resultsTotal[i][0].meses[2])).toFixed(2)
                    arrayFinal[encontrou.id].data.mar=parseFloat(parseFloat(arrayFinal[encontrou.id].data.mar)+parseFloat(resultsTotal[i][0].meses[3])).toFixed(2)
                    arrayFinal[encontrou.id].data.abr=parseFloat(parseFloat(arrayFinal[encontrou.id].data.abr)+parseFloat(resultsTotal[i][0].meses[4])).toFixed(2)
                    arrayFinal[encontrou.id].data.mai=parseFloat(parseFloat(arrayFinal[encontrou.id].data.mai)+parseFloat(resultsTotal[i][0].meses[5])).toFixed(2)
                    arrayFinal[encontrou.id].data.jun=parseFloat(parseFloat(arrayFinal[encontrou.id].data.jun)+parseFloat(resultsTotal[i][0].meses[6])).toFixed(2)
                    arrayFinal[encontrou.id].data.jul=parseFloat(parseFloat(arrayFinal[encontrou.id].data.jul)+parseFloat(resultsTotal[i][0].meses[7])).toFixed(2)
                    arrayFinal[encontrou.id].data.ago=parseFloat(parseFloat(arrayFinal[encontrou.id].data.ago)+parseFloat(resultsTotal[i][0].meses[8])).toFixed(2)
                    arrayFinal[encontrou.id].data.set=parseFloat(parseFloat(arrayFinal[encontrou.id].data.set)+parseFloat(resultsTotal[i][0].meses[9])).toFixed(2)
                    arrayFinal[encontrou.id].data.out=parseFloat(parseFloat(arrayFinal[encontrou.id].data.out)+parseFloat(resultsTotal[i][0].meses[10])).toFixed(2)
                    arrayFinal[encontrou.id].data.nov=parseFloat(parseFloat(arrayFinal[encontrou.id].data.nov)+parseFloat(resultsTotal[i][0].meses[11])).toFixed(2)
                    arrayFinal[encontrou.id].data.dez=parseFloat(parseFloat(arrayFinal[encontrou.id].data.dez)+parseFloat(resultsTotal[i][0].meses[12])).toFixed(2)
                    
                    arrayFinal[encontrou.id].data.janalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.janalt)+parseFloat(resultsTotal[i][0].meses[1])).toFixed(2)
                    arrayFinal[encontrou.id].data.fevalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.fevalt)+parseFloat(resultsTotal[i][0].meses[2])).toFixed(2)
                    arrayFinal[encontrou.id].data.maralt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.maralt)+parseFloat(resultsTotal[i][0].meses[3])).toFixed(2)
                    arrayFinal[encontrou.id].data.abralt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.abralt)+parseFloat(resultsTotal[i][0].meses[4])).toFixed(2)
                    arrayFinal[encontrou.id].data.maialt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.maialt)+parseFloat(resultsTotal[i][0].meses[5])).toFixed(2)
                    arrayFinal[encontrou.id].data.junalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.junalt)+parseFloat(resultsTotal[i][0].meses[6])).toFixed(2)
                    arrayFinal[encontrou.id].data.julalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.julalt)+parseFloat(resultsTotal[i][0].meses[7])).toFixed(2)
                    arrayFinal[encontrou.id].data.agoalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.agoalt)+parseFloat(resultsTotal[i][0].meses[8])).toFixed(2)
                    arrayFinal[encontrou.id].data.setalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.setalt)+parseFloat(resultsTotal[i][0].meses[9])).toFixed(2)
                    arrayFinal[encontrou.id].data.outalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.outalt)+parseFloat(resultsTotal[i][0].meses[10])).toFixed(2)
                    arrayFinal[encontrou.id].data.novalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.novalt)+parseFloat(resultsTotal[i][0].meses[11])).toFixed(2)
                    arrayFinal[encontrou.id].data.dezalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.dezalt)+parseFloat(resultsTotal[i][0].meses[12])).toFixed(2)

                //se o CC não está adicionado irá add um novo com a nova conta    
                }else{
                    //busca a ultima posicao de CC adicionado para adicionar no proximo
                    let ultimoChildren = encontrou.children.length
                    //busca a ultima key adicionada para add a proxima
                    let keysplit = encontrou.children[ultimoChildren-1].key.split("+")
                    //console.log('keysplit else 2',keysplit)
                    let key1tmp=parseInt(keysplit[0]),key2tmp=parseInt(keysplit[1])+1,key3tmp=parseInt(keysplit[2]),key4tmp=parseInt(keysplit[3]) || 0
                    key2tmp=key2tmp++
                    key3tmp=0
                    //expande os nós ja criados
                    // expandedKeys[key1tmp] = true
                    // expandedKeys[key1tmp+'+'+key2tmp] = true
                    // expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp] = true
                    // expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp+'+'+key4tmp] = true
                    
                    arrayFinal[encontrou.id].children.push({
                            key: key1tmp+"+"+key2tmp,
                            data: {
                                key: key1tmp+"+"+key2tmp,
                                grupoccconta: resultsTotal[i][0].CC,
                                indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC
                            },
                            children:[{
                                key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                                data: {
                                    key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                                    grupoccconta: resultsTotal[i][0].CONTA,
                                    indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC
                                },
                                children:[{
                                    key: key1tmp+"+"+key2tmp+"+"+key3tmp +"+"+key4tmp,
                                    item: '1',
                                    data: {
                                        key: key1tmp+"+"+key2tmp+"+"+key3tmp+"+"+key4tmp,
                                        indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+1',
                                        item: key4tmp+''+1,
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
                    console.log('arrayfinal ',arrayFinal[encontrou.id])
                    //atualizar o total
                    arrayFinal[encontrou.id].data.jan=parseFloat(parseFloat(arrayFinal[encontrou.id].data.jan)+parseFloat(resultsTotal[i][0].meses[1])).toFixed(2)
                    arrayFinal[encontrou.id].data.fev=parseFloat(parseFloat(arrayFinal[encontrou.id].data.fev)+parseFloat(resultsTotal[i][0].meses[2])).toFixed(2)
                    arrayFinal[encontrou.id].data.mar=parseFloat(parseFloat(arrayFinal[encontrou.id].data.mar)+parseFloat(resultsTotal[i][0].meses[3])).toFixed(2)
                    arrayFinal[encontrou.id].data.abr=parseFloat(parseFloat(arrayFinal[encontrou.id].data.abr)+parseFloat(resultsTotal[i][0].meses[4])).toFixed(2)
                    arrayFinal[encontrou.id].data.mai=parseFloat(parseFloat(arrayFinal[encontrou.id].data.mai)+parseFloat(resultsTotal[i][0].meses[5])).toFixed(2)
                    arrayFinal[encontrou.id].data.jun=parseFloat(parseFloat(arrayFinal[encontrou.id].data.jun)+parseFloat(resultsTotal[i][0].meses[6])).toFixed(2)
                    arrayFinal[encontrou.id].data.jul=parseFloat(parseFloat(arrayFinal[encontrou.id].data.jul)+parseFloat(resultsTotal[i][0].meses[7])).toFixed(2)
                    arrayFinal[encontrou.id].data.ago=parseFloat(parseFloat(arrayFinal[encontrou.id].data.ago)+parseFloat(resultsTotal[i][0].meses[8])).toFixed(2)
                    arrayFinal[encontrou.id].data.set=parseFloat(parseFloat(arrayFinal[encontrou.id].data.set)+parseFloat(resultsTotal[i][0].meses[9])).toFixed(2)
                    arrayFinal[encontrou.id].data.out=parseFloat(parseFloat(arrayFinal[encontrou.id].data.out)+parseFloat(resultsTotal[i][0].meses[10])).toFixed(2)
                    arrayFinal[encontrou.id].data.nov=parseFloat(parseFloat(arrayFinal[encontrou.id].data.nov)+parseFloat(resultsTotal[i][0].meses[11])).toFixed(2)
                    arrayFinal[encontrou.id].data.dez=parseFloat(parseFloat(arrayFinal[encontrou.id].data.dez)+parseFloat(resultsTotal[i][0].meses[12])).toFixed(2)

                    arrayFinal[encontrou.id].data.janalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.janalt)+parseFloat(resultsTotal[i][0].meses[1])).toFixed(2)
                    arrayFinal[encontrou.id].data.fevalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.fevalt)+parseFloat(resultsTotal[i][0].meses[2])).toFixed(2)
                    arrayFinal[encontrou.id].data.maralt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.maralt)+parseFloat(resultsTotal[i][0].meses[3])).toFixed(2)
                    arrayFinal[encontrou.id].data.abralt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.abralt)+parseFloat(resultsTotal[i][0].meses[4])).toFixed(2)
                    arrayFinal[encontrou.id].data.maialt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.maialt)+parseFloat(resultsTotal[i][0].meses[5])).toFixed(2)
                    arrayFinal[encontrou.id].data.junalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.junalt)+parseFloat(resultsTotal[i][0].meses[6])).toFixed(2)
                    arrayFinal[encontrou.id].data.julalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.julalt)+parseFloat(resultsTotal[i][0].meses[7])).toFixed(2)
                    arrayFinal[encontrou.id].data.agoalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.agoalt)+parseFloat(resultsTotal[i][0].meses[8])).toFixed(2)
                    arrayFinal[encontrou.id].data.setalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.setalt)+parseFloat(resultsTotal[i][0].meses[9])).toFixed(2)
                    arrayFinal[encontrou.id].data.outalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.outalt)+parseFloat(resultsTotal[i][0].meses[10])).toFixed(2)
                    arrayFinal[encontrou.id].data.novalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.novalt)+parseFloat(resultsTotal[i][0].meses[11])).toFixed(2)
                    arrayFinal[encontrou.id].data.dezalt=parseFloat(parseFloat(arrayFinal[encontrou.id].data.dezalt)+parseFloat(resultsTotal[i][0].meses[12])).toFixed(2)
                }
            }
        }
        console.log('arrayFinal fim montar dados', arrayFinal)
        console.log('jsonnnnn ',JSON.stringify(arrayFinal))
        this.setState({
            nodesfinalreal:arrayFinal,
           // expandedKeys: expandedKeys
        })
    }

}

export default translate('translations')(PcoList);