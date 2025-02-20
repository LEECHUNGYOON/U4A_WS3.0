/*************************************************************
 * @module - 메시지 팝오버 호출 처리.(N건 메시지 표현)
 *************************************************************/
export default async function(oTarget, aMessage){

    return new Promise((resolve)=>{

        if(typeof oTarget === "undefined"){
            return resolve();
        }

        if(oTarget === null){
            return resolve();
        }


        //기존 메시지 팝오버 종료처리.
        oAPP.fn.closeMessagePopover();


        var _oPopover = new sap.m.MessagePopover({
            afterClose:function(){

                //오류 표현 초기화.
                clearError();

                _oPopover.destroy();
            },
            beforeOpen:function(){

                //팝업에 화살표 처리.
                if(typeof _oPopover._oPopover._oControl !== "undefined" && _oPopover._oPopover._oControl !== null){
                    _oPopover._oPopover._oControl.setShowArrow(true);
                }

            },
            afterOpen:function() {
                resolve();
            }
        });

        
        if(typeof _oPopover._oPopover !== "undefined" && _oPopover._oPopover !== null){
            //메시지 팝오버 호출함 구분자 매핑.
            _oPopover._oPopover.data("msg_popover", true);
            
            //팝업 호출 위치.
            _oPopover._oPopover.setPlacement("PreferredLeftOrFlip");

        }    


        var _oModel = new sap.ui.model.json.JSONModel();

        _oPopover.setModel(_oModel);


        //091	오류 위치 확인
        var _txt = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "091");

        _oPopover.bindAggregation("items", {
            path: "/T_MSG",
            template: new sap.m.MessageItem({
                title: "{TITLE}",
                type: "{TYPE}",
                description: "{DESC}",
                subtitle: "{SUBTITLE}",
                link: new sap.m.Link({
                    text: _txt,
                    tooltip: _txt,
                    visible: "{LK_VIS}",
                    press: onSelLink,
                    customData: [
                        new sap.ui.core.CustomData({
                            key: "ACTCD",
                            value: "{ACTCD}"
                        }),
                        new sap.ui.core.CustomData({
                            key: "LINE_KEY",
                            value: "{LINE_KEY}"
                        })
                    ]
                })            
            })
        });

        _oModel.setData({T_MSG:aMessage});

        _oPopover.openBy(oTarget);

    });

};


/*************************************************************
 * @function - 오류 표현 초기화 처리.
 *************************************************************/
function clearError(){

    //DESIGN TREE의 오류 표현 필드 정보 초기화.
    oAPP.attr.oDesign.fn.resetErrorField();

    oAPP.attr.oDesign.oModel.refresh();

    
    //추가속성 정보 오류 표현 필드 초기화.
    oAPP.attr.oAddit.fn.resetErrorField();

    oAPP.attr.oAddit.oModel.refresh(true);


    //오류 표현 필드 초기화.
    oAPP.fn.resetMPROPMsg();

    oAPP.attr.oModel.refresh(true);

}


/*************************************************************
 * @event - 링크 선택 이벤트.
 *************************************************************/
function onSelLink(oEvent){

    var _oUi = oEvent?.oSource;

    if(typeof _oUi === "undefined" || _oUi === null){
        return;
    }

    var _ACTCD = _oUi.data("ACTCD");

    //라인 키 정보.
    var _LINE_KEY = _oUi.data("LINE_KEY");

    //라인 키 정보가 존재하지 않는경우 exit.
    if(typeof _LINE_KEY === "undefined" || _LINE_KEY === null || _LINE_KEY === ""){
        return;
    }

    switch (_ACTCD) {
        case oAPP.attr.CS_MSG_ACTCD.ACT01:
            //모델 필드 TREE 영역.
            
            break;
        
        case oAPP.attr.CS_MSG_ACTCD.ACT02:
            //디자인 TREE 영역.
            break;

        case oAPP.attr.CS_MSG_ACTCD.ACT03:
            //바인딩 추가속성 영역.
            break;

        case oAPP.attr.CS_MSG_ACTCD.ACT04:
            //디자인 tree 라인 오류 인경우 오류 발생 라인으로 이동 처리.
            setFocusErrorDesignLine(_LINE_KEY);
            break;

        case oAPP.attr.CS_MSG_ACTCD.ACT05:
            //바인딩 추가속성 정보 라인 오류 인경우 오류 발생 라인으로 이동 처리.
            setFocusErrorBindAdditLine(_LINE_KEY);
            break;

        case oAPP.attr.CS_MSG_ACTCD.ACT06:
            //디자인 TREE 하단 추가속성 TABLE 영역.
            break;

        case oAPP.attr.CS_MSG_ACTCD.ACT07:
            //디자인 TREE 하단 추가속성 TABLE 라인.
            setFocusErrorDesignBindAdditLine(_LINE_KEY);
            break;
        default:
            return;
    }
    
}


/*************************************************************
 * @function - 디자인 tree 영역 오류 발생 라인으로 이동 처리.
 *************************************************************/
function setFocusErrorDesignLine(LINE_KEY){

    //오류 표현 필드 초기화.
    oAPP.attr.oDesign.fn.resetErrorField();


    //디자인 트리 라인 정보 얻기.
    var _sTree = oAPP.attr.oDesign.fn.getDesignTreeLineData(LINE_KEY);

    if(typeof _sTree === "undefined"){
        return;
    }

    //오류 표현 처리.
    _sTree._check_vs      = "Error";
    // _sTree._highlight     = "Error";
    _sTree._style         = "u4aWsDesignTreeError";

    
    oAPP.attr.oDesign.oModel.refresh();

    //입력받은 KEY에 해당하는 라인 위치 얻기.
    var _pos = oAPP.attr.oDesign.fn.getTreeItemIndex(LINE_KEY);

    //라인 위치 정보를 얻지 못한 경우 EXIT.
    if(_pos === -1){
        return;
    }

    //해당 라인 선택 처리.
    oAPP.attr.oDesign.ui.TREE.setFirstVisibleRow(_pos);

}


/*************************************************************
 * @function - 바인딩 추가속성 정보 라인 오류 인경우 오류 발생 라인으로 이동 처리.
 *************************************************************/
function setFocusErrorBindAdditLine(LINE_KEY){


    //오류 표현 필드 초기화.
    oAPP.attr.oAddit.fn.resetErrorField();


    //오류 발생 라인 위치 얻기.
    var _sList = oAPP.attr.oAddit.oModel.oData.T_MPROP.find( item => item.ITMCD === LINE_KEY );

    if(typeof _sList === "undefined"){
        return;
    }

    _sList.stat    = "Error";
    _sList.statTxt = "";
    _sList._style  = "u4aWsDesignTreeError";


    oAPP.attr.oAddit.oModel.refresh(true);

}


/*************************************************************
 * @function - 디자인 TREE 하단 추가속성 TABLE 라인 오류 발생 라인으로 이동 처리.
 *************************************************************/
function setFocusErrorDesignBindAdditLine(LINE_KEY){


    //오류 표현 필드 초기화.
    oAPP.fn.resetMPROPMsg();


    //오류 발생 라인 위치 얻기.
    var _sList = oAPP.attr.oModel.oData.T_MPROP.find( item => item.ITMCD === LINE_KEY );

    if(typeof _sList === "undefined"){
        return;
    }

    _sList.stat    = "Error";
    _sList.statTxt = "";
    _sList._style  = "u4aWsDesignTreeError";


    oAPP.attr.oModel.refresh(true);

}