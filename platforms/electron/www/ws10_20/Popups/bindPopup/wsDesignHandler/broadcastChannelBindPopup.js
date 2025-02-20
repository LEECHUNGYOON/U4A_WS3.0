//BIND POPUP <-> 디자인상세화면(20화면) 통신을 위한 broadcast Channel instance.
let oChannel = undefined;

let oFrame = document.getElementById('ws_frame');

let sap = oFrame.contentWindow.sap;

/*************************************************************
 * @function - 디자인상세화면(20화면) <-> BINDPOPUP 통신을 위한 
 *             broadcast Channel생성.
 *************************************************************/
function createChannel() {

    //디자인상세화면(20화면)에서 전달받은 채널 key로 생성.
    oChannel = new BroadcastChannel(oAPP.attr.channelKey);

    //MESSAGE 이벤트 구성.
    oChannel.onmessage = function(oEvent) {
        
        if(typeof oEvent?.data?.PRCCD === "undefined"){
            return;
        }

        //프로세스 코드에 따른 분기.
        switch (oEvent?.data?.PRCCD) {
            case "BUSY_ON":
                //WS20 -> 바인딩 팝업 busy on 응답을 받은 경우.
                responseBindPopupBusyOn(oEvent);
                break;

            case "BUSY_OFF":
                //WS20 -> 바인딩 팝업 busy off 응답을 받은 경우.
                responseBindPopupBusyOff(oEvent);
                break;

            case "UPDATE_DESIGN_DATA":
                //WS20 -> 바인딩 팝업 갱신 요청건인경우.
                updateDesignData(oEvent);
                break;

            case "ERROR-ADDIT-DATA":
                //WS20 -> 바인딩 팝업의 바인딩 추가속성 정보 오류건 처리.
                responseAdditError(oEvent);
                break;

            case "DESIGN-TREE-SELECT-OBJID":
                //WS20 -> 바인딩 팝업의 디자인 영역 UI선택 처리.
                responeSelectDesignTreeOBJID(oEvent);
                break;
        
            default:
                //정해지지 않은 프로세스 코드가 호출된 경우,
                //크리티컬 오류 메시지 처리 해야함.
                break;
        }

    };

}



/*************************************************************
 * @function - BIND POPUP => 디자인상세화면(20화면) 데이터 전송 처리.
 *************************************************************/
function sendPostMessage (oData) {

    //BIND POPUP <=> 디자인상세화면(20화면) 통신을 위한 BROADCAST는
    //바인딩 팝업이 종료되기 전까지는 반드시 존재 해야함.
    //따라서 해당 INSTANCE가 없을경우 치명적 오류를 발생 처리함.
    if(typeof oChannel === "undefined" || oChannel === null){

        var _errMsg = 
            `Popups\\bindPopup\\wsDesignHandler\\broadcastChannelBindPopup.js` +
            `\nBIND POPUP => WS20 통신을 위한 채널 정보가 존재하지 않습니다.`;

        if(typeof oData?.PRCCD !== "undefined"){
            _errMsg += `\n처리 Process Code : ${oData.PRCCD}`;
        }

        throw(new Error(_errMsg));

    }

    try {
        oChannel.postMessage(oData);    

    } catch (error) {

        var _errMsg = 
            `Popups\\bindPopup\\wsDesignHandler\\broadcastChannelBindPopup.js` +
            `\nBIND POPUP => WS20 oChannel.postMessage 오류`;

        if(typeof oData?.PRCCD !== "undefined"){
            _errMsg += `\n처리 Process Code : ${oData.PRCCD}`;
        }

        if(typeof error?.message !== "undefined"){
            _errMsg += `\n${error.message}`;
        }

        throw(new Error(_errMsg));
    }
    
}



/*************************************************************
 * @function - BIND POPUP 채널 종료 처리.
 *************************************************************/
function closeChannel(){

    if(typeof oChannel === "undefined" || oChannel === null){
        return;
    }

    //채널 종료 처리.
    oChannel.close();

    //채널 instance 초기화.
    oChannel = undefined;

}



/*************************************************************
 * @function - BIND POPUP 채널 생성됨 여부.
 *************************************************************/
function isCreateChannel(){
    
    //broadcast 채널이 생성되지 않은경우 생성되지 않음 flag return.
    if(typeof oChannel === "undefined" || oChannel === null){
        return false;
    }

    return true;
    
};


/************************************************************************
 * busy off 요청건에 대한 처리.
 ************************************************************************/
function responseBindPopupBusyOff(oEvent){

    //BUSY OFF 요청건이 아닌경우 exit.
    if(oEvent.data.PRCCD !== "BUSY_OFF"){
        return false;
    }


    //busy off.
    // oAPP.fn.setBusy(false);

    //WS20 -> 바인딩 팝업으로 BUSY 요청건인경우, 다른 영역에 BUSY를 요청 처리 하지 않음.
    //(다른 영역에 BUSY 요청을 보내게 되면 WS20에도 BUSY 요청을 보내게 되어 
    //WS20 화면을 제어 할 수 없음)
    oAPP.fn.setBusy(false, {ISBROAD:true});

    
    //busy off 요청임 flag return.
    return true;

}


/************************************************************************
 * busy on 요청건에 대한 처리.
 ************************************************************************/
function responseBindPopupBusyOn(oEvent){

    //BUSY ON 요청건이 아닌경우 exit.
    if(oEvent.data.PRCCD !== "BUSY_ON"){
        return false;
    }
    

    //busy on.
    // oAPP.fn.setBusy(true);

    //WS20 -> 바인딩 팝업으로 BUSY 요청건인경우, 다른 영역에 BUSY를 요청 처리 하지 않음.
    //(다른 영역에 BUSY 요청을 보내게 되면 WS20에도 BUSY 요청을 보내게 되어 
    //WS20 화면을 제어 할 수 없음)
    oAPP.fn.setBusy(true, {ISBROAD:true});


    //busy on 요청임 flag return.
    return true;

}



/************************************************************************
 * 디자인 영역 갱신 처리건인경우.
 ************************************************************************/
async function updateDesignData(oEvent){

    //디자인 영역 갱신 요청건이 아닌경우 exit.
    if(oEvent.data.PRCCD !== "UPDATE_DESIGN_DATA"){
        return false;
    }


    oAPP.fn.setBusy(true);


    await oAPP.fn.waitBusyOpened();


    //호출된 모든 팝업 종료 처리.
    oAPP.fn.closeAllPopups();


    oAPP.attr.T_0014 = JSON.parse(JSON.stringify(oEvent.data.T_0014));
    oAPP.attr.T_0015 = JSON.parse(JSON.stringify(oEvent.data.T_0015));
    oAPP.attr.T_CEVT = JSON.parse(JSON.stringify(oEvent.data.T_CEVT));


    //디자인 트리 FILTER 초기화.
    oAPP.fn.resetUiTableFilterSort(oAPP.attr.oDesign.ui.TREE);


    // //바인딩 추가속성 정보 초기화.
    // oAPP.fn.clearSelectAdditBind();


    //추가속성 정보 화면 비활성 처리.
    oAPP.fn.setAdditLayout("");

    
    //디자인 영역으로 화면 이동 처리
    await oAPP.attr.oDesign.fn.moveDesignPage();

                        
    //추가속성 바인딩 버튼 활성 처리.
    oAPP.attr.oAddit.fn.setAdditBindButtonEnable(true);

    
    //디자인 영역 데이터 구성 처리.
    oAPP.attr.oDesign.fn.setDesignTreeData();

    // //바인딩 추가 속성 정보 구성 처리.
    // oAPP.attr.oAddit.fn.setAdditialListData();

    //메인 모델 갱신 처리.
    oAPP.attr.oModel.refresh();


    //모델 데이터 변경시 메인에 해당 내용 전달 처리 이벤트 등록 해제.
    oAPP.attr.oDesign.oModel.detachMessageChange(oAPP.attr.oDesign.fn.onModelDataChanged);

    //디자인 영역 모델 갱신 처리.
    oAPP.attr.oDesign.oModel.refresh(true);


    //모델 데이터 변경시 메인에 해당 내용 전달 처리 이벤트 등록.
    oAPP.attr.oDesign.oModel.attachMessageChange(oAPP.attr.oDesign.fn.onModelDataChanged);


    // //바인딩 추가 속성 정보 모델 갱신 처리.
    // oAPP.attr.oAddit.oModel.refresh();

    //디자인 영역에 busy off 요청 처리
    sendDesignAreaBusyOff();


    await new Promise((resolve)=>{
        oAPP.attr.oDesign.ui.TREE.attachEventOnce("rowsUpdated", ()=>{
            resolve();
        });
    });

    //tree table 컬럼길이 재조정 처리.
    oAPP.fn.setUiTableAutoResizeColumn(oAPP.attr.oDesign.ui.TREE);

    oAPP.fn.setBusy(false);


    //디자인 영역 갱신 요청임 flag return.
    return true;

}


/************************************************************************
 * @function - 바인딩 팝업의 바인딩 추가속성 정보 오류건 처리.
 ************************************************************************/
async function responseAdditError(oEvent){

    //바인딩 팝업의 바인딩 추가속성 정보 오류건 처리가 아닌경우 exit.
    if(oEvent.data.PRCCD !== "ERROR-ADDIT-DATA"){
        return false;
    }

    if(typeof oEvent?.data?.T_ERMSG === "undefined"){
        return true;
    }

    if(oEvent.data.T_ERMSG.length === 0){
        return true;
    }

    oAPP.fn.setBusy(true);


    var _aBindError = [];

    for (let i = 0, l = oEvent.data.T_ERMSG.length; i < l; i++) {
        
        var _sERMSG = oEvent.data.T_ERMSG[i];


        var _sBindError = JSON.parse(JSON.stringify(oAPP.types.TY_BIND_ERROR));
        
        //바인딩 추가속성 정보 TABLE 라인.
        _sBindError.ACTCD    = oAPP.attr.CS_MSG_ACTCD.ACT05;
        _sBindError.LINE_KEY = _sERMSG.ITMCD;
        _sBindError.TYPE     = "Error";
        _sBindError.TITLE    = _sERMSG.ERMSG;
        _sBindError.DESC     = _sERMSG.ERMSG;

        _aBindError.push(_sBindError);
        _sBindError = null;

    }


    //오류 팝업 호출 처리.
    await oAPP.fn.showMessagePopoverOppener(oAPP.attr.oAddit.ui.ROOT, _aBindError);

    oAPP.fn.setBusy(false);

    //디자인 영역 갱신 요청임 flag return.
    return true;


}


/************************************************************************
 * @function - 바인딩 팝업의 디자인 영역 UI선택 처리.
 ************************************************************************/
function responeSelectDesignTreeOBJID(oEvent){

    //바인딩 팝업의 디자인 영역 UI선택 처리 건이 아닌경우 exit.
    if(oEvent.data.PRCCD !== "DESIGN-TREE-SELECT-OBJID"){
        return false;
    }

    // oAPP.fn.setBusy(true);
    oAPP.fn.setBusy(true, {ISBROAD:true});

    //전달받은 파라메터가 존재하지 않는경우 exit.
    if(typeof oEvent?.data?.OBJID === "undefined" || oEvent.data.OBJID === ""){
        // oAPP.fn.setBusy(false);
        oAPP.fn.setBusy(false, {ISBROAD:true});
        return true;
    }

    //디자인 영역에 출력데이터가 존재하지 않는경우 exit.
    if(oAPP.attr.oDesign.oModel.oData.zTREE_DESIGN.length === 0){
        // oAPP.fn.setBusy(false);
        oAPP.fn.setBusy(false, {ISBROAD:true});
        return true;
    }

    //날라온 OBJID에 해당하는 라인 검색.
    var _sTree = oAPP.fn.getDesignTreeData(oEvent.data.OBJID);

    //대상 라인을 찾지 못한 경우 exit.
    if(typeof _sTree === "undefined"){
        // oAPP.fn.setBusy(false);
        oAPP.fn.setBusy(false, {ISBROAD:true});
        return true;
    }

    //찾은 라인 정보 갖고 현재 화면상에 존재하는지 확인.
    var _indx = oAPP.attr.oDesign.fn.findTargetRowIndex(_sTree.CHILD);

    //화면상에 존재하는 라인인경우.
    if(_indx !== -1){
        //해당 라인 선택 처리.
        oAPP.attr.oDesign.ui.TREE.setSelectedIndex(_indx);

        // oAPP.fn.setBusy(false);
        oAPP.fn.setBusy(false, {ISBROAD:true});

        return true;
    }


    //해당 라인 위치 검색.
    var _indx = oAPP.attr.oDesign.fn.getTreeItemIndex(_sTree.CHILD);

    //해당 라인을 찾지 못한 경우 exit.
    if(_indx === -1){

        // oAPP.fn.setBusy(false);
        oAPP.fn.setBusy(false, {ISBROAD:true});

        return true;
    }

    //해당 라인 선택 처리.
    oAPP.attr.oDesign.ui.TREE.setSelectedIndex(_indx);

    //해당 라인으로 이동 처리.
    oAPP.attr.oDesign.ui.TREE.setFirstVisibleRow(_indx);

    // oAPP.fn.setBusy(false);
    oAPP.fn.setBusy(false, {ISBROAD:true});

    return true;

}


/*************************************************************
 * @function - 디자인 영역 ATTR 정보 갱신처리.
 *************************************************************/
function updateBindPopupDesignData(){
    
    oAPP.fn.setBusy(true);
    
    var _sData = {};

    //데이터 동기화 프로세스 코드.
    _sData.PRCCD = "UPDATE-DESIGN-DATA";

    
    //디자인 트리 전송 data(T_0014) 구성.
    _sData.T_0014 = set0014Data();


    //attribute data(T_0015) 구성.
    _sData.oPrev  = setPrevdata();


    //클라이언트이벤트, sap.ui.core.HTML 의 content 입력정보.
    _sData.T_CEVT = oAPP.attr.T_CEVT;


    //바인딩 팝업에 데이터 전송.
    sendPostMessage(_sData);


}


/*************************************************************
 * @function - 디자인 트리 전송 data(T_0014) 구성.
 *************************************************************/
function set0014Data(){

    //디자인 트리 -> table화.
    var _aTree = oAPP.fn.parseTree2Tab(oAPP.attr.oDesign.oModel.oData.zTREE_DESIGN, "zTREE_DESIGN");

    //14번 정보만 발췌.
    _aTree = _aTree.filter( item => item.DATYP === "01");
    
    var _aT_0014 = [];


    for (let i = 0, l = _aTree.length; i < l; i++) {

        var _sTree = _aTree[i];

        var _s0014 = {};

        _s0014.APPID   = _sTree.S_14_APPID;
        _s0014.GUINR   = _sTree.S_14_GUINR;
        _s0014.OBJID   = _sTree.S_14_OBJID;
        _s0014.POSIT   = _sTree.S_14_POSIT;
        _s0014.POBID   = _sTree.S_14_POBID;
        _s0014.UIOBK   = _sTree.S_14_UIOBK;
        _s0014.PUIOK   = _sTree.S_14_PUIOK;
        _s0014.ISAGR   = _sTree.S_14_ISAGR;
        _s0014.AGRID   = _sTree.S_14_AGRID;
        _s0014.ISDFT   = _sTree.S_14_ISDFT;
        _s0014.OBDEC   = _sTree.S_14_OBDEC;
        _s0014.AGTYP   = _sTree.S_14_AGTYP;
        _s0014.UIATK   = _sTree.S_14_UIATK;
        _s0014.UIATT   = _sTree.S_14_UIATT;
        _s0014.UIASN   = _sTree.S_14_UIASN;
        _s0014.UIATY   = _sTree.S_14_UIATY;
        _s0014.UIADT   = _sTree.S_14_UIADT;
        _s0014.UIADS   = _sTree.S_14_UIADS;
        _s0014.VALKY   = _sTree.S_14_VALKY;
        _s0014.ISLST   = _sTree.S_14_ISLST;
        _s0014.ISMLB   = _sTree.S_14_ISMLB;
        _s0014.TOOLB   = _sTree.S_14_TOOLB;
        _s0014.UIFND   = _sTree.S_14_UIFND;
        _s0014.PUIATK  = _sTree.S_14_PUIATK;
        _s0014.UILIB   = _sTree.S_14_UILIB;
        _s0014.ISEXT   = _sTree.S_14_ISEXT;
        _s0014.TGLIB   = _sTree.S_14_TGLIB;
        _s0014.DEL_UOK = _sTree.S_14_DEL_UOK;
        _s0014.DEL_POK = _sTree.S_14_DEL_POK;
        _s0014.ISECP   = _sTree.S_14_ISECP;

        _aT_0014.push(_s0014);
        _s0014 = null;
        
    }

    return _aT_0014;

}


/*************************************************************
 * @function - attribute data(T_0015) 구성.
 *************************************************************/
function setPrevdata(){

    //15번 정보 발췌.
    var _oPrev = {};

    for (const key in oAPP.attr.prev) {

        var _oUi = oAPP.attr.prev[key];

        if(typeof _oUi._T_0015 === "undefined"){
            continue;
        }
                

        _oPrev[key] = {};

        var _sParam = _oPrev[key];

        //attr 수집정보.
        _sParam._T_0015    = _oUi._T_0015;

        //모델 바인딩 정보.
        _sParam._MODEL     = _oUi._MODEL;

        //N바인딩된 UI정보.
        _sParam._BIND_AGGR = {};

        //N건 바인딩된 정보 수집.
        setBindAggrData(_sParam._BIND_AGGR, _oUi);

            
    }

    return _oPrev;

}



/*************************************************************
 * @function - N건 바인딩된 정보 수집.
 *************************************************************/
function setBindAggrData(sParam, oUi){

    if(Object.entries(oUi._BIND_AGGR).length === 0){
        return;
    }


    for (const key in oUi._BIND_AGGR) {

        var _aAggr =  oUi._BIND_AGGR[key];

        sParam[key] = [];
        
        for (let i = 0, l = _aAggr.length; i < l; i++) {
            
            var _sAggr = _aAggr[i];

            sParam[key].push(_sAggr._OBJID);
            
        }

    }
    

}


/*************************************************************
 * @function - 바인딩 팝업 디자인 영역에 그려진 최상위 UI 정보 전송.
 *************************************************************/
function sendRootObjectID(oData){

    var _sData = {};
    
    //최상위 UI정보 프로세스코드.
    _sData.PRCCD = "ROOT_OBJID";

    
    //최상위 UI OBJECT ID 매핑.
    _sData.OBJID = oData;


    //WS 3.0 디자인 영역에 데이터 전송.
    sendPostMessage(_sData);

}


/*************************************************************
 * @function - WS 디자인 영역의 TREE 라인 선택 처리.
 *************************************************************/
function selectDesignTreeOBJID(oData){

    var _sParam = {
        PRCCD   : "DESIGN-TREE-SELECT-OBJID",
        OBJID : oData
    };


    //WS 3.0 디자인 영역에 데이터 전송.
    sendPostMessage(_sParam);

}


/*************************************************************
 * @function - WS 디자인 영역의 busy off 요청 처리.
 *************************************************************/
function sendDesignAreaBusyOff(oData){

    var _sParam = {
        PRCCD   : "BUSY_OFF"
    };


    //WS 3.0 디자인 영역에 데이터 전송.
    sendPostMessage(_sParam);

}


/*************************************************************
 * @function - WS 디자인 영역의 busy on 요청 처리.
 *************************************************************/
function sendDesignAreaBusyOn(oData){

    var _sParam = {
        PRCCD   : "BUSY_ON",
        OPTION  : undefined
    };


    //BUSY DIALOG 처리용 파라메터가 존재하는경우.
    if(typeof oData !== "undefined"){
        _sParam.OPTION = JSON.parse(JSON.stringify(oData));
    }

    //WS 3.0 디자인 영역에 데이터 전송.
    sendPostMessage(_sParam);

}


/*************************************************************
 * @module - 디자인상세화면(20화면) <-> BINDPOPUP 통신 처리 모듈.
 *************************************************************/
module.exports = function(PRCCD, oData){

    switch (PRCCD) {
        case "CHANNEL-CREATE":
            //채널 생성.
            createChannel(oData);
            break;

        case "CHANNEL-CLOSE":
            //broadcast Channel 종료처리.
            closeChannel();
            break;

        case "GET-CHANNEL-ID":
            //채널 아이디 return.
            return C_CHID;

        case "IS-CHANNEL-CREATE":
            //채널 생성됨 여부 return.
            return isCreateChannel();

        case "UPDATE-DESIGN-DATA":
            //디자인 영역 ATTR 정보 갱신처리.
            updateBindPopupDesignData(oData);
            break;

        case "SEND-ROOT-OBJID":
            //바인딩 팝업 디자인 영역에 그려진 최상위 UI 정보 전송.
            sendRootObjectID(oData);
            break;

        case "DESIGN-TREE-SELECT-OBJID":
            //WS디자인영역 tree 라인 선택 처리.
            selectDesignTreeOBJID(oData);
            break;

        case "BUSY_OFF":
            //디자인 영역에 busy off 요청 처리
            sendDesignAreaBusyOff(oData);
            break;

        case "BUSY_ON":
            //디자인 영역에 busy on 요청 처리
            sendDesignAreaBusyOn(oData);
            break;

        default:
            break;
    }

};