import React, { Component } from 'react';
import { NodeService } from '../../service/NodeService';
import { InputText } from 'primereact/inputtext';
import { TreeTable } from 'primereact/treetable';
import { Column } from "primereact/column";
import { Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter, Card,
         Dropdown, DropdownToggle,  DropdownMenu, DropdownItem, ButtonToolbar } from 'reactstrap';
import { translate, Trans } from 'react-i18next';
//import { Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom'
import './input.css'

class PcoList extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            expandedKeys: {},
            dropdownOpen: false,
            modal: false,
            justification:'',
            fieldJustification:'',
            rowEdit: [],
            dadosreais: [],
            nodesfinalreal:[],
            perfil: this.props.location.pathname
        };
        this.nodeservice = new NodeService();
        //TODO: validar perfil

        this.rowClassName = this.rowClassName.bind(this);
        this.onRefreshStatus = this.onRefreshStatus.bind(this);
        this.renderEditableCell = this.renderEditableCell.bind(this);
    }

    componentDidMount() {
        //this.nodeservice.getTreeTableNodes().then(data => this.setState({ nodes: data }));
        //this.nodeservice.convertJson().then(data => this.setState({ nodesSemFormat: data }));
        //this.nodeservice.getDadosReais().then(data => this.setState({ dadosreais: data }, () => this.convertLines()));
        this.nodeservice.getDadosReaisMaior().then(data => this.setState({ dadosreais: data }, () => this.convertLines()));
    }
    
    //converte os dados de cada linha em grupos, por conta e centro de custo
    convertLines(){
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
        //admin
        if(this.state.perfil==='/pcoView'){
            this.montarDados(resultsTotal)
        //gerente
        }else{
            this.montarDadosGerente(resultsTotal)
        }
        console.log('results total final ', resultsTotal)
    }
    
    //agrupa os dados em 12 meses cada
    findAllChildren (id, results, field, id2,field2) {
        let nodestate = this.state.dadosreais
        let meses=[25]
        let periodo=''
        for (let d=0; d in nodestate; d++) {
            if (nodestate[d][field] === id && nodestate[d][field2] === id2) {
                nodestate[d].PERIODO = nodestate[d].PERIODO.substring(4, 6);
                periodo = nodestate[d].PERIODO;
                //salva o dado na posicao do array referente ao mes, ex, meses[1] é janeiro
                meses[parseInt(periodo, 10)] = nodestate[d].VLR_ORI;
                meses[parseInt(periodo, 10)+12] = nodestate[d].VLR_ALT;
                nodestate[d].meses = meses   
                results.push(nodestate[d])
            }
        }
    }
    
    //monta o json para grupos/cc/conta
    montarDados(resultsTotal){
        //console.log('resultsTotal dentro montardados', resultsTotal)
        let arrayFinal = []
        let adicionados = 0
        let expandedKeys = { ...this.state.expandedKeys };
        let key1='0',key2='0',key3='0',key4='0'
        let grupocccontaid = ''
        for(let i = 0; i<resultsTotal.length;i++){
            grupocccontaid = resultsTotal[i][0].GRUPO//+"+"+resultsTotal[i][0].CC//+"+"+resultsTotal[i][0].CONTA
            let encontrou = arrayFinal.find( obj => obj.data.grupoccconta === grupocccontaid )
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
                                    item: ""+key4+1,
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
                    //para saber a posição do CC no array
                    let keyconta = encontrouCC.key.split("+")
                    //pega o ultimo children da conta adicionada no CC e adiciona no próximo
                    let ultimoChildren = encontrouCC.children.length

                    let keysplit = encontrou.children[keyconta[1]].children[ultimoChildren-1].children[0].key.split("+")
                    let key1tmp=parseInt(keysplit[0]),key2tmp=parseInt(keysplit[1]),key3tmp=parseInt(keysplit[2])+1,key4tmp=parseInt(keysplit[3]) || 0
                    expandedKeys[key1tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp+'+'+key4tmp] = true
                    //adiciona conta no grupo referente ao ID, no CC encontrado
                    arrayFinal[encontrou.id].children[keysplit[1]].children.push({
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
                                indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+'+key4,
                                item: ""+key4tmp+1,
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
                    //atualizar o total
                    this.atualizarTotal(arrayFinal[encontrou.id], resultsTotal[i][0])
                    
                //se o CC não está adicionado irá add um novo com a nova conta    
                }else{
                    //busca a ultima posicao de CC adicionado para adicionar no proximo
                    let ultimoChildren = encontrou.children.length
                    //busca a ultima key adicionada para add a proxima
                    let keysplit = encontrou.children[ultimoChildren-1].key.split("+")
                    let key1tmp=parseInt(keysplit[0]),key2tmp=parseInt(keysplit[1])+1,key3tmp=parseInt(keysplit[2]),key4tmp=parseInt(keysplit[3]) || 0
                    key2tmp=key2tmp++
                    key3tmp=0
                    //expande os nós ja criados
                    expandedKeys[key1tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp+'+'+key4tmp] = true
                    
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
                                    item: ""+key4tmp+1,
                                    data: {
                                        key: key1tmp+"+"+key2tmp+"+"+key3tmp+"+"+key4tmp,
                                        indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+1',
                                        item: ""+key4tmp+1,
                                        PERIODO: resultsTotal[i][0].PERIODO,
                                        VLR_ORI: resultsTotal[i][0].VLR_ORI,
                                        jan: resultsTotal[i][0].meses[1] || 0,fev: resultsTotal[i][0].meses[2] || 0,mar: resultsTotal[i][0].meses[3] || 0,abr: resultsTotal[i][0].meses[4] || 0,
                                        mai: resultsTotal[i][0].meses[5] || 0,jun: resultsTotal[i][0].meses[6] || 0,jul: resultsTotal[i][0].meses[7] || 0,ago: resultsTotal[i][0].meses[8] || 0,
                                        set: resultsTotal[i][0].meses[9] || 0,out: resultsTotal[i][0].meses[10] || 0,nov: resultsTotal[i][0].meses[11] || 0,dez: resultsTotal[i][0].meses[12] || 0,
                                        janalt: resultsTotal[i][0].meses[1] || 0,fevalt: resultsTotal[i][0].meses[2] || 0,maralt: resultsTotal[i][0].meses[3] || 0,abralt: resultsTotal[i][0].meses[4] || 0,
                                        maialt: resultsTotal[i][0].meses[5] || 0,junalt: resultsTotal[i][0].meses[6] || 0,julalt: resultsTotal[i][0].meses[7] || 0,agoalt: resultsTotal[i][0].meses[8] || 0,
                                        setalt: resultsTotal[i][0].meses[9] || 0,outalt: resultsTotal[i][0].meses[10] || 0,novalt: resultsTotal[i][0].meses[11] || 0,dezalt: resultsTotal[i][0].meses[12] || 0,
                                        jusjan:"",jusfev:"",jusmar:"",jusabr:"",jusmai:"",jusjun:"",jusjul:"",jusago:"",jusset:"",jusout:"",jusnov:"",jusdez:""
                                    }
                                }]
                            }]
                    })
                    //atualizar o total
                    this.atualizarTotal(arrayFinal[encontrou.id], resultsTotal[i][0])
                }
            }
        }
        console.log('arrayFinal fim montar dados', arrayFinal)
        this.setState({
            nodesfinalreal:arrayFinal,
            expandedKeys: expandedKeys
        })
    }

    atualizarTotal(arrayFinal, resultsTotal) {
        arrayFinal.data.jan = parseFloat(parseFloat(arrayFinal.data.jan) + parseFloat(resultsTotal.meses[1] || 0)).toFixed(2)
        arrayFinal.data.fev = parseFloat(parseFloat(arrayFinal.data.fev) + parseFloat(resultsTotal.meses[2] || 0)).toFixed(2)
        arrayFinal.data.mar = parseFloat(parseFloat(arrayFinal.data.mar) + parseFloat(resultsTotal.meses[3] || 0)).toFixed(2)
        arrayFinal.data.abr = parseFloat(parseFloat(arrayFinal.data.abr) + parseFloat(resultsTotal.meses[4] || 0)).toFixed(2)
        arrayFinal.data.mai = parseFloat(parseFloat(arrayFinal.data.mai) + parseFloat(resultsTotal.meses[5] || 0)).toFixed(2)
        arrayFinal.data.jun = parseFloat(parseFloat(arrayFinal.data.jun) + parseFloat(resultsTotal.meses[6] || 0)).toFixed(2)
        arrayFinal.data.jul = parseFloat(parseFloat(arrayFinal.data.jul) + parseFloat(resultsTotal.meses[7] || 0)).toFixed(2)
        arrayFinal.data.ago = parseFloat(parseFloat(arrayFinal.data.ago) + parseFloat(resultsTotal.meses[8] || 0)).toFixed(2)
        arrayFinal.data.set = parseFloat(parseFloat(arrayFinal.data.set) + parseFloat(resultsTotal.meses[9] || 0)).toFixed(2)
        arrayFinal.data.out = parseFloat(parseFloat(arrayFinal.data.out) + parseFloat(resultsTotal.meses[10] || 0)).toFixed(2)
        arrayFinal.data.nov = parseFloat(parseFloat(arrayFinal.data.nov) + parseFloat(resultsTotal.meses[11] || 0)).toFixed(2)
        arrayFinal.data.dez = parseFloat(parseFloat(arrayFinal.data.dez) + parseFloat(resultsTotal.meses[12] || 0)).toFixed(2)

        arrayFinal.data.janalt = parseFloat(parseFloat(arrayFinal.data.janalt) + parseFloat(resultsTotal.meses[13] || 0)).toFixed(2)
        arrayFinal.data.fevalt = parseFloat(parseFloat(arrayFinal.data.fevalt) + parseFloat(resultsTotal.meses[14] || 0)).toFixed(2)
        arrayFinal.data.maralt = parseFloat(parseFloat(arrayFinal.data.maralt) + parseFloat(resultsTotal.meses[15] || 0)).toFixed(2)
        arrayFinal.data.abralt = parseFloat(parseFloat(arrayFinal.data.abralt) + parseFloat(resultsTotal.meses[16] || 0)).toFixed(2)
        arrayFinal.data.maialt = parseFloat(parseFloat(arrayFinal.data.maialt) + parseFloat(resultsTotal.meses[17] || 0)).toFixed(2)
        arrayFinal.data.junalt = parseFloat(parseFloat(arrayFinal.data.junalt) + parseFloat(resultsTotal.meses[18] || 0)).toFixed(2)
        arrayFinal.data.julalt = parseFloat(parseFloat(arrayFinal.data.julalt) + parseFloat(resultsTotal.meses[19] || 0)).toFixed(2)
        arrayFinal.data.agoalt = parseFloat(parseFloat(arrayFinal.data.agoalt) + parseFloat(resultsTotal.meses[20] || 0)).toFixed(2)
        arrayFinal.data.setalt = parseFloat(parseFloat(arrayFinal.data.setalt) + parseFloat(resultsTotal.meses[21] || 0)).toFixed(2)
        arrayFinal.data.outalt = parseFloat(parseFloat(arrayFinal.data.outalt) + parseFloat(resultsTotal.meses[22] || 0)).toFixed(2)
        arrayFinal.data.novalt = parseFloat(parseFloat(arrayFinal.data.novalt) + parseFloat(resultsTotal.meses[23] || 0)).toFixed(2)
        arrayFinal.data.dezalt = parseFloat(parseFloat(arrayFinal.data.dezalt) + parseFloat(resultsTotal.meses[24] || 0)).toFixed(2)
    }

    //monta o json para cc/conta
    montarDadosGerente(resultsTotal){
        //console.log('resultsTotal dentro montardados', resultsTotal)
        let arrayFinal = []
        let adicionados = 0
        let expandedKeys = { ...this.state.expandedKeys };
        let key1='0',key2='0',key3='0'
        let cccontaid = ''
        for(let i = 0; i<resultsTotal.length;i++){
            cccontaid = resultsTotal[i][0].CC//+"+"+resultsTotal[i][0].CC//+"+"+resultsTotal[i][0].CONTA
            let encontrou = arrayFinal.find( obj => obj.data.grupoccconta === cccontaid )
            if(arrayFinal.length===0 || encontrou===undefined || !encontrou){
                expandedKeys[key1] = true
                expandedKeys[key1+'+'+key2] = true
                expandedKeys[key1+'+'+key2+'+'+key3] = true
                //expandedKeys[key1+'+'+key2+'+'+key3+'+'+key4] = true

                arrayFinal.push({
                    id: adicionados,//indica a posição no array
                    expanded: true,
                    key: key1,
                    grupocccontaid : cccontaid,
                    data: {
                        grupoccconta: resultsTotal[i][0].CC,
                        indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC,
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
                                grupoccconta: resultsTotal[i][0].CONTA,
                                indice: resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA
                            },
                            children:[{
                                key: key1+'+'+key2+'+'+key3,
                                item: ""+key3+1,
                                data: {
                                    key: key1+'+'+key2+'+'+key3,
                                    indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+'+key3,
                                    item: ""+key3+1,
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
                adicionados++
                key1++
            }else{
                //add conta no centro de custo
                let encontrouConta = encontrou.children.find( obj => obj.data.grupoccconta === resultsTotal[i][0].CONTA )
                //se CC ja esta adicionado, somente adiciona a nova conta dentro dele
                if(encontrouConta){
                    //para saber a posição do CC no array
                    let keyconta = encontrouConta.key.split("+")
                    //pega o ultimo children da conta adicionada no CC e adiciona no próximo
                    let ultimoChildren = encontrouConta.children.length

                    let keysplit = encontrou.children[keyconta[1]].children[ultimoChildren-1].key.split("+")
                    let key1tmp=parseInt(keysplit[0]),key2tmp=parseInt(keysplit[1]),key3tmp=parseInt(keysplit[2])+1 || 0
                    expandedKeys[key1tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp] = true
                    //expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp+'+'+key4tmp] = true
                    //adiciona conta no grupo referente ao ID, no CC encontrado
                    arrayFinal[encontrou.id].children[keysplit[1]].children.push({
                        key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                        data: {
                            grupoccconta: resultsTotal[i][0].CONTA,
                            indice: resultsTotal[i][0].CC
                        },
                        children:[{
                            key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                            item: ""+key3tmp+1,
                            data: {
                                key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                                indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+1',
                                item: ""+key3tmp+1,
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
                    //atualizar o total
                    this.atualizarTotal(arrayFinal[encontrou.id], resultsTotal[i][0])
                    
                //se o CC não está adicionado irá add um novo com a nova conta    
                }else{
                    //busca a ultima posicao de CC adicionado para adicionar no proximo
                    let ultimoChildren = encontrou.children.length
                    //busca a ultima key adicionada para add a proxima
                    let keysplit = encontrou.children[ultimoChildren-1].key.split("+")
                    let key1tmp=parseInt(keysplit[0]),key2tmp=parseInt(keysplit[1])+1,key3tmp=parseInt(keysplit[2]) || 0
                    key2tmp=key2tmp++
                    key3tmp=0
                    //expande os nós ja criados
                    expandedKeys[key1tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp] = true
                    expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp] = true
                    //expandedKeys[key1tmp+'+'+key2tmp+'+'+key3tmp+'+'+key4tmp] = true
                    
                    arrayFinal[encontrou.id].children.push({
                            key: key1tmp+"+"+key2tmp,
                                data: {
                                    grupoccconta: resultsTotal[i][0].CONTA,
                                    indice: resultsTotal[i][0].CC
                                },
                                children:[{
                                    key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                                    item: ""+key3tmp+1,
                                    data: {
                                        key: key1tmp+"+"+key2tmp+"+"+key3tmp,
                                        indice: resultsTotal[i][0].GRUPO+'+'+resultsTotal[i][0].CC+'+'+resultsTotal[i][0].CONTA+'+1',
                                        item: ""+key3tmp+1,
                                        PERIODO: resultsTotal[i][0].PERIODO,
                                        VLR_ORI: resultsTotal[i][0].VLR_ORI,
                                        jan: resultsTotal[i][0].meses[1] || 0,fev: resultsTotal[i][0].meses[2] || 0,mar: resultsTotal[i][0].meses[3] || 0,abr: resultsTotal[i][0].meses[4] || 0,
                                        mai: resultsTotal[i][0].meses[5] || 0,jun: resultsTotal[i][0].meses[6] || 0,jul: resultsTotal[i][0].meses[7] || 0,ago: resultsTotal[i][0].meses[8] || 0,
                                        set: resultsTotal[i][0].meses[9] || 0,out: resultsTotal[i][0].meses[10] || 0,nov: resultsTotal[i][0].meses[11] || 0,dez: resultsTotal[i][0].meses[12] || 0,
                                        janalt: resultsTotal[i][0].meses[1] || 0,fevalt: resultsTotal[i][0].meses[2] || 0,maralt: resultsTotal[i][0].meses[3] || 0,abralt: resultsTotal[i][0].meses[4] || 0,
                                        maialt: resultsTotal[i][0].meses[5] || 0,junalt: resultsTotal[i][0].meses[6] || 0,julalt: resultsTotal[i][0].meses[7] || 0,agoalt: resultsTotal[i][0].meses[8] || 0,
                                        setalt: resultsTotal[i][0].meses[9] || 0,outalt: resultsTotal[i][0].meses[10] || 0,novalt: resultsTotal[i][0].meses[11] || 0,dezalt: resultsTotal[i][0].meses[12] || 0,
                                        jusjan:"",jusfev:"",jusmar:"",jusabr:"",jusmai:"",jusjun:"",jusjul:"",jusago:"",jusset:"",jusout:"",jusnov:"",jusdez:""
                                    }
                                }]
                    })
                    //atualizar o total
                    this.atualizarTotal(arrayFinal[encontrou.id], resultsTotal[i][0])
                }
            }
        }
        console.log('arrayFinal fim montar dados', arrayFinal)
        this.setState({
            nodesfinalreal:arrayFinal,
            expandedKeys: expandedKeys
        })
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
        let rowsplit = row.key.split("+")
        
        value = value !== null && value !== '' ? value : 0
        let valueAnt = parseFloat((""+row.data[field]).replace(',', '.'));
        value = parseFloat(value.replace(',', '.'));
        if(value!==valueAnt){
            let newNodes = JSON.parse(JSON.stringify(this.state.nodesfinalreal));
            
            //encontra nó pai pela key
            let noPaibykey = this.state.nodesfinalreal[rowsplit[0]]
            noPaibykey.data[field] = parseFloat((""+noPaibykey.data[field]).replace(',', '.')).toFixed(2) - valueAnt + value
            newNodes[rowsplit[0]]=noPaibykey

            //busca o no pai e altera o total
            //let noPai = this.findNodeByKey(newNodes, row.key.split('+')[0])
            //noPai.data[field] = parseFloat((""+noPai.data[field]).replace(',', '.')).toFixed(2) - valueAnt + value
            
            //busca o no atual e seta o novo valor e altera o status
            let editedNode = this.findNodeByKey(newNodes, row.key);
            editedNode.data[field] = value;
            editedNode.data.status = 'alterado'
            
            this.setState({
                nodesfinalreal: newNodes
            });
        }
    }

    //monta o campo edit em cada celula
    renderEditableCell = (row, field) => {
        //let tamanho = row.data.indice.split('-').length;
        let tamanho = (""+row.key).split('+').length;
        //se for nó pai mostra só o input com o total
        if (tamanho < 2) {
            return (
                <InputText type="text" value={row.data[field]} style={{ width: '100%' }} disabled={true} />
            );
        //se for os itens mostra o input para edicao e o botao para justificativa    
        } else if ((tamanho > 3 && this.state.perfil==='/pcoView') || (tamanho > 2 && this.state.perfil==='/pcoViewGerente')) {
            return (
                <ButtonGroup>
                    <InputText type='tel' defaultValue={row.data[field]} style={{ width: '100%' }} //format='###.##' placeholder="0.00" 
                        onBlur={(e) => this.onEditorValueChange(row, e.target.value, field)} pattern="^-?[0-9]\d*\.?\d*$">
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
        let keys = (""+node.key).split('+')
        //se for perfil admin são 4 linhas de agrupamento
        if(this.state.perfil==='/pcoView'){
            return {
                'bg-gray': (keys.length === 1), 'bg-gray-light': (keys.length === 2), 'bg-gray-lighter': (keys.length === 3),
                'bg-yellow-light': node.data.status === 'alterado', 'bg-success-light':node.data.status==='confirmed', 'bg-danger-light':node.data.status==='rejected'
            }
        //se for perfil gerente são 3 linhas de agrupamento
        }else{
            return {
                'bg-gray': (keys.length === 1), 'bg-gray-light': (keys.length === 2), 
                'bg-yellow-light': node.data.status === 'alterado', 'bg-success-light':node.data.status==='confirmed', 'bg-danger-light':node.data.status==='rejected'
            }
        }
    }

    //altera a cor da linha para verde(confirmado) ou vermelho(rejeitado)
    onRefreshStatus(props, value) {
        let newNodes = JSON.parse(JSON.stringify(this.state.nodesfinalreal));
        let editedNode = this.findNodeByKey(newNodes, props.key);
        editedNode.data.status = value
        this.setState({
            nodesfinalreal: newNodes
        });
    }

    //monta os botoes da ultima coluna
    actionTemplate(node) {
        //let keys = node.key.split('-')
        let keys = (""+node.key).split('+')
        //se for perfil admin mostra os botões para aprovar ou reprovar
        if(this.state.perfil==='/pcoView'){
            return <div hidden={keys.length<4} >
            <ButtonGroup>
                <Button color="success" className="btn-labeled" onClick={() => this.onRefreshStatus(node,'confirmed')} data-toggle="tooltip" title="Aceitar">
                    <span className="btn-md"><i className="fa fa-check"></i></span></Button>
                <Button color="danger" className="btn-labeled" onClick={() => this.onRefreshStatus(node,'rejected')} data-toggle="tooltip" title="Rejeitar">
                    <span className="btn-md"><i className="fa fa-times"></i></span></Button>
            </ButtonGroup>
            </div>
        //se for perfil gerente mostra o botão para salvar
        }else{
            return <div hidden={keys.length<3}  >
            <ButtonGroup>
                <Button color="success" className="btn-labeled" onClick={() => this.saveDataRow(node)} data-toggle="tooltip" title="Salvar">
                    <span className="btn-md"><i className="fa fa-check"></i></span></Button>
            </ButtonGroup>
            </div>
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

    saveData () {
        //TODO: salvar
    }
    
    saveDataRow(node){
        //TODO: fazer o salvar
    }

    render() {
        const {t}= this.props;
        return (
            <div className="App">
                <div className="content-section introduction treetableeditdemo">
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
                <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggleModal}><Trans i18nKey='titles.justification'></Trans></ModalHeader>
                    <ModalBody>
                        <Card body>
                            <textarea rows="6" className="form-control note-editor" defaultValue={this.state.justification} onBlur={(e)=>this.setState({justification: e.target.value})}></textarea>
                        </Card>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggleModalSave}>{t('titles.save')}</Button>{' '}
                        <Button color="secondary" onClick={this.toggleModalClose}>{t('titles.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                <div className="table table-bordered content-section implementation react-grid-Header content-section implementation pagination-sm">
                    <TreeTable value={this.state.nodesfinalreal} expandedKeys={this.state.expandedKeys} //nodesfinalreal  
                        paginator={true} rows={3}
                        tableClassName="p-treetable p-component " scrollable scrollHeight="700px" scrollWidth="1600px"  
                        rowClassName={this.rowClassName} onToggle={e => this.setState({ expandedKeys: e.value })} responsive> 
                        <Column field="grupoccconta" header={t('titles.header')} expander style={{ width: '230px' }} />
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
                    <ButtonToolbar>
                        <div className="ml-auto">
                            <Button color="success" size="lg" onClick={this.saveData} hidden={this.state.perfil!=='/pcoView'}>
                                {t('titles.save')}
                            </Button>
                            <Link to='/pcoplan' >
                                <Button color="primary" size="lg" > 
                                    {t('titles.cancel')}
                                </Button>
                            </Link>
                        {/* <Button color="success" className="btn-labeled" onClick={() => this.onRefreshStatus(node,'confirmed')} data-toggle="tooltip" title="Aceitar">
                            <span className="btn-md"><i className="fa fa-check"></i></span></Button>
                        <Button color="danger" className="btn-labeled" onClick={() => this.onRefreshStatus(node,'rejected')} data-toggle="tooltip" title="Rejeitar">
                            <span className="btn-md"><i className="fa fa-times"></i></span></Button> */}
                            </div>
                    </ButtonToolbar>
                </div>
            </div>
        )
    }
}

export default translate('translations')(PcoList);