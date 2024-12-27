
/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_common.js
 * - file Desc : ws 공통 스크립트
 ************************************************************************/
(function (window, $, oAPP) {
    "use strict";

    oAPP.common = {};

    const
        REMOTE = parent.REMOTE,
        IPCRENDERER = parent.IPCRENDERER,
        APP = REMOTE.app,
        PATH = REMOTE.require('path'),
        APPPATH = APP.getAppPath(),
        APPCOMMON = oAPP.common;

    const
        SYSADM_BIND_ROOT = "/SYSADM";

    /************************************************************************
     * Child Window를 활성/비활성 처리 한다.
     * **********************************************************************
     * @param {Boolean} bIsShow 
     * - true : child window 보이기
     * - false : child window 숨김
     * **********************************************************************/
    oAPP.common.fnIsChildWindowShow = function (bIsShow) {

        var oCurrWin = REMOTE.getCurrentWindow(),
            aChild = oCurrWin.getChildWindows(),
            iChildCnt = aChild.length;

        if (iChildCnt <= 0) {
            return;
        }

        for (var i = 0; i < iChildCnt; i++) {
            var oChild = aChild[i];

            if (bIsShow) {
                oChild.show();
            } else {
                oChild.hide();
            }

        }

    }; // end of oAPP.common.fnIsChildWindowShow

    /************************************************************************
     * 모델 데이터 set
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     * @param {Object} oModelData
     * 
     * @param {Boolean} bIsRefresh 
     * model Refresh 유무
     ************************************************************************/
    oAPP.common.fnSetModelProperty = function (sModelPath, oModelData, bIsRefresh) {

        var oCoreModel = sap.ui.getCore().getModel();
        if (!oCoreModel) {
            return;
        }

        oCoreModel.setProperty(sModelPath, oModelData);

        if (bIsRefresh) {
            oCoreModel.refresh(true);
        }

    }; // end of oAPP.common.fnSetModelProperty

    /************************************************************************
     * 모델 데이터 get
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     ************************************************************************/
    oAPP.common.fnGetModelProperty = function (sModelPath) {

        let oCoreModel = sap.ui.getCore().getModel();
        if (!oCoreModel) {
            return;
        }

        return oCoreModel.getProperty(sModelPath);

    }; // end of oAPP.common.fnGetModelProperty    

    oAPP.common.fnGetMsgClsText = (sMsgCls, sMsgNum, p1, p2, p3, p4) => {

        // test -----

        // [!!YOON!!]  접속 서버 기준으로 바라볼지 여부
        let bIsServer = true;

        // [!!YOON!!]  test -----


        // Metadata에서 메시지 클래스 정보를 구한다.
        var oMeta = parent.getMetadata(),
            sLangu = oMeta.LANGU,
            aMsgClsTxt = oMeta["MSGCLS"];

        // test -----
        // [!!YOON!!] 서버 접속 언어 기준일 경우
        if(bIsServer === true){
            let oUserInfo = parent.getUserInfo();
            sLangu = oUserInfo.LANGU;
        }
        // [!!YOON!!]  test -----

        if (!aMsgClsTxt || !aMsgClsTxt.length) {
            return sMsgCls + "|" + sMsgNum;
        }

        // let sDefLangu = "E"; // default language    
        let sDefLangu = "EN"; // default language    

        // 현재 접속한 언어로 메시지를 찾는다.
        let oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.LANGU == sLangu && a.MSGNR == sMsgNum);

        // 현재 접속한 언어로 메시지를 못찾은 경우
        if (!oMsgTxt) {

            // 접속한 언어가 영어일 경우 빠져나간다.
            if (sDefLangu == sLangu) {
                return sMsgCls + "|" + sMsgNum;

            }

            // 접속한 언어가 영어가 아닌데 메시지를 못찾으면 영어로 찾는다.
            oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.LANGU == sDefLangu && a.MSGNR == sMsgNum);

            // 그래도 없다면 빠져나간다.
            if (!oMsgTxt) {
                return sMsgCls + "|" + sMsgNum;
            }

        }

        var sText = oMsgTxt.TEXT,
            aWithParam = [];

        // 파라미터로 전달 받은 Replace Text 수집
        aWithParam.push(p1 == null ? "" : p1);
        aWithParam.push(p2 == null ? "" : p2);
        aWithParam.push(p3 == null ? "" : p3);
        aWithParam.push(p4 == null ? "" : p4);

        var iWithParamLenth = aWithParam.length;
        if (iWithParamLenth == 0) {
            return sText;
        }

        // 메시지 클래스 텍스트에서 "& + 숫자" (예: &1) 값이 있는 것부터 순차적으로 치환한다.
        for (var i = 0; i < iWithParamLenth; i++) {

            var index = i + 1,
                sParamTxt = aWithParam[i];

            var sRegEx = "&" + index,
                oRegExp = new RegExp(sRegEx, "g");

            sText = sText.replace(oRegExp, sParamTxt);

        }

        sText = sText.replace(new RegExp("&\\d+", "g"), "");

        // 메시지 클래스 텍스트에서 "&" 를 앞에서 부터 순차적으로 치환한다."
        for (var i = 0; i < iWithParamLenth; i++) {

            var sParamTxt = aWithParam[i];

            sText = sText.replace(new RegExp("&", "i"), sParamTxt);

        }

        sText = sText.replace(new RegExp("&", "g"), "");

        return sText;

    }; // end of oAPP.common.fnTestGetMsgClsText

    // /************************************************************************
    //  * 메타데이터의 메시지 클래스 번호에 해당하는 메시지 리턴 
    //  * **********************************************************************
    //  * @param {String} sMsgNum  
    //  * - Message Class Number
    //  * 
    //  * @param {String} "P1 P2 P3 P4"
    //  * - Replace Text (총 4개만 가능)
    //  * 
    //  * @return {String}
    //  * - Message Text
    //  ************************************************************************/
    // oAPP.common.fnGetMsgClsTxt = function (sMsgNum, p1, p2, p3, p4) {

    //     // Metadata에서 메시지 클래스 정보를 구한다.
    //     var oMeta = parent.getMetadata(),
    //         aMsgClsTxt = oMeta["MSGCLS"];

    //     if (!aMsgClsTxt || !aMsgClsTxt.length) {
    //         return;
    //     }

    //     // 메시지 넘버에 해당하는 메시지 클래스 정보를 구한다.
    //     var oMsgTxt = aMsgClsTxt.find(a => a.MSGNR == sMsgNum);
    //     if (!oMsgTxt) {
    //         return;
    //     }

    //     var sText = oMsgTxt.TEXT,
    //         aWithParam = [];

    //     // 파라미터로 전달 받은 Replace Text 수집
    //     aWithParam.push(p1 == null ? "" : p1);
    //     aWithParam.push(p2 == null ? "" : p2);
    //     aWithParam.push(p3 == null ? "" : p3);
    //     aWithParam.push(p4 == null ? "" : p4);
    //     // if(p1){ aWithParam.push(p1); }        
    //     // if(p2){ aWithParam.push(p2); }
    //     // if(p3){ aWithParam.push(p3); }
    //     // if(p4){ aWithParam.push(p4); }

    //     var iWithParamLenth = aWithParam.length;
    //     if (iWithParamLenth == 0) {
    //         return sText;
    //     }

    //     // 메시지 클래스 텍스트에서 "& + 숫자" (예: &1) 값이 있는 것부터 순차적으로 치환한다.
    //     for (var i = 0; i < iWithParamLenth; i++) {

    //         var index = i + 1,
    //             sParamTxt = aWithParam[i];

    //         var sRegEx = "&" + index,
    //             oRegExp = new RegExp(sRegEx, "g");

    //         sText = sText.replace(oRegExp, sParamTxt);

    //     }

    //     sText = sText.replace(new RegExp("&\\d+", "g"), "");

    //     // 메시지 클래스 텍스트에서 "&" 를 앞에서 부터 순차적으로 치환한다."
    //     for (var i = 0; i < iWithParamLenth; i++) {

    //         var sParamTxt = aWithParam[i];

    //         sText = sText.replace(new RegExp("&", "i"), sParamTxt);

    //     }

    //     sText = sText.replace(new RegExp("&", "g"), "");

    //     return sText;

    // }; // end of oAPP.common.fnGetMsgClsTxt

    /************************************************************************
     * z-Index 구하기
     * **********************************************************************/
    oAPP.common.fnGetZIndex = function () {
        return sap.ui.core.Popup.getNextZIndex();
    };

    /************************************************************************
     * 각 페이지 이동 시 푸터 메시지가 있으면 숨김처리
     ************************************************************************/
    oAPP.common.fnHideFloatingFooterMsg = function () {

        if (oAPP.attr.footerMsgTimeout) {
            clearTimeout(oAPP.attr.footerMsgTimeout);
            delete oAPP.attr.footerMsgTimeout;
        }

        // Footer 메시지 모델 초기화
        oAPP.common.fnSetModelProperty("/FMSG", {});

    }; // end of oAPP.common.fnHideFloatingFooterMsg

    /************************************************************************
     * 멀티 푸터 메시지 닫기
     ************************************************************************/
    oAPP.common.fnMultiFooterMsgClose = function () {

        var sPopupName = "ERRMSGPOP";

        // 기존에 멀티 푸터 메시지 팝업이 열렸을 경우 닫는다
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN === true && oResult.WINDOW.isDestroyed() === false) {
            
            try {
                oResult.WINDOW.close();    
            } catch (error) {
                
            }
            
        }

    }; // end of oAPP.common.fnMultiFooterMsgClose

    /************************************************************************
     * 각 페이지의 짧은 푸터 메시지
     * **********************************************************************
     * @param {CHAR1} TYPE  
     * - S : success
     * - E : error
     * - W : warning
     * - I : information
     * @param {String} POS
     * - footer message를 실행할 화면 위치 정보
     * 예) WS10, WS20
     * @param {String} MSG  
     ************************************************************************/
    oAPP.common.fnShowFloatingFooterMsg = function (TYPE, POS, MSG) {

        oAPP.common.fnHideFloatingFooterMsg();

        var oMsg = {};

        // 메시지 타입별 아이콘 및 아이콘 색상 지정
        switch (TYPE) {
            case "S":
                oMsg.ICON = "sap-icon://message-success";
                oMsg.ICONCOLOR = "#abe2ab";

                parent.setSoundMsg('01'); // sap sound(success)
                break;

            case "E":
                oMsg.ICON = "sap-icon://message-error";
                oMsg.ICONCOLOR = "#f88";

                parent.setSoundMsg('02'); // sap sound(error)
                break;

            case "W":
                oMsg.ICON = "sap-icon://message-warning";
                oMsg.ICONCOLOR = "#f9a429";
                parent.setSoundMsg('01'); // sap sound(success)		

                break;

            case "I":
                oMsg.ICON = "sap-icon://message-information";
                oMsg.ICONCOLOR = "#346187";
                parent.setSoundMsg('01'); // sap sound(success)

                break;
        }

        oMsg.ISSHOW = true;
        oMsg.TXT = MSG;

        // 메시지 정보를 모델에 세팅
        oAPP.common.fnSetModelProperty("/FMSG/" + POS, oMsg);

        // 이전 timeout이 존재하면 일단 다 날리고 시작
        if (oAPP.attr.footerMsgTimeout) {
            clearTimeout(oAPP.attr.footerMsgTimeout);
            delete oAPP.attr.footerMsgTimeout;
        }

        // timeout 시간이 도래되면 Footer Message를 지운다.
        oAPP.attr.footerMsgTimeout = setTimeout(function () {

            oAPP.common.fnHideFloatingFooterMsg();

            clearTimeout(oAPP.attr.footerMsgTimeout);
            delete oAPP.attr.footerMsgTimeout;

        }, 10000);

    }; // end of oAPP.common.fnShowFloatingFooterMsg

    /*************************************************************************
     * [공통] 단축키 실행 할지 말지 여부 체크
     **************************************************************************/
    oAPP.common.fnShortCutExeAvaliableCheck = () => {

        if (oAPP.attr.isShortcutLock == true) {
            return "X";
        }

        // Busy Indicator가 실행중인지 확인
        if (parent.getBusy() == 'X') {
            zconsole.log("!! Busy가 켜져 있어서 단축기 실행 불가!!");
            return "X";
        }

        // 화면에 메뉴 팝업이 떠있을 경우 단축키 실행 불가.
        var oMenuDom = document.querySelector(".sapMMenu");
        if (oMenuDom) {
            var sId = oMenuDom.id,
                oMenu = sap.ui.getCore().byId(sId);
            if (oMenu && oMenu.bOpen) {
                zconsole.log("!! 메뉴가 떠 있어서 단축기 실행 불가!!");
                return "X";
            }
        }

        // 현재 Dialog Popup이 실행 되어 있는지 확인.
        var bIsDialogOpen = oAPP.fn.fnCheckIsDialogOpen();
        if (bIsDialogOpen) {
            zconsole.log("!! Dialog 팝업이 떠 있어서 단축기 실행 불가!!");
            return "X";
        }

        zconsole.log("!!___단축기 실행 가능__!!");

        return "";

    }; // end of oAPP.common.fnShortCutExeAvaliableCheck

    /*************************************************************************
     * Shortcut 설정
     **************************************************************************/
    oAPP.common.getShortCutList = function (sPgNo) {

        if(!sPgNo){
            return [];
        }
        
        var aShortCutWS10 = [{
            KEY: "F11", // [WS10] FullScreen
            DESC: "Browser Fullscreen",
            CODE: `new sap.m.Button({icon: "sap-icon://header"})`,
            fn: (e) => {

                e.stopImmediatePropagation();

                // var oCurrWin = REMOTE.getCurrentWindow(), // 현재 window
                //     bIsFull = oCurrWin.isFullScreen();

                // oCurrWin.setFullScreen(!bIsFull);

                /***************************************
                 * 2024-07-01 soccerhs
                 ***************************************
                 * ## F11 기능 변경
                 * - 기존: 전체창(Kiosk) 모드
                 * - 변경: 브라우저 전체창 모드
                 ***************************************/
                if(typeof sap === undefined){
                    return;
                }

                let oMaxWinBtn = sap.ui.getCore().byId("maxWinBtn");
                if(!oMaxWinBtn){
                    return;
                }

                oMaxWinBtn.firePress();

            }
        }, {
            KEY: "Ctrl+Shift+F", // [WS10] textSearchPopup
            DESC: "Text Search Popup",
            CODE: `new sap.m.Button({icon: "sap-icon://search"})`,
            fn: (e) => {

                e.stopImmediatePropagation();

                // 단축키 실행 할지 말지 여부 체크
                var result = oAPP.common.fnShortCutExeAvaliableCheck();

                // X 이면 실행 불가
                if (result == "X") {
                    return;
                }

                oAPP.fn.fnTextSearchPopupOpener();

            }
        }, {
            KEY: "Ctrl+F12", // [WS10] Application Create
            DESC: "Application Create",
            CODE: `new sap.m.Button({
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A01"),
                icon: "sap-icon://document",
                tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A01") + " (Ctrl+F12)",
            })`,
            fn: (e) => {

                e.stopImmediatePropagation();

                // 단축키 실행 할지 말지 여부 체크
                var result = oAPP.common.fnShortCutExeAvaliableCheck();

                // X 이면 실행 불가
                if (result == "X") {
                    return;
                }

                var oAppCreateBtn = sap.ui.getCore().byId("appCreateBtn");
                if (!oAppCreateBtn || !oAppCreateBtn.getEnabled() || !oAppCreateBtn.getVisible()) {
                    return;
                }

                oAppCreateBtn.firePress();

            }
        },
        {           
            KEY: "F6", // [WS10] Application Change
            DESC: "Application Change Mode",
            CODE: `new sap.m.Button({
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02"),
                icon: "sap-icon://edit",
                tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02") + " (F6)",
            })`,
            fn: (e) => {

                e.stopImmediatePropagation();

                // 커서 포커스 날리기
                if (document.activeElement && document.activeElement.blur) {
                    document.activeElement.blur();
                }

                // lock 걸기
                sap.ui.getCore().lock();

                // 단축키 실행 할지 말지 여부 체크
                var result = oAPP.common.fnShortCutExeAvaliableCheck();

                // X 이면 실행 불가
                if (result == "X") {
                    sap.ui.getCore().unlock();
                    return;
                }

                var oAppChangeBtn = sap.ui.getCore().byId("appChangeBtn");
                if (!oAppChangeBtn || !oAppChangeBtn.getEnabled() || !oAppChangeBtn.getVisible()) {
                    sap.ui.getCore().unlock();
                    return;
                }

                oAppChangeBtn.firePress();

            }
        },
        {
            KEY: "Ctrl+F10", // [WS10] Application Delete
            DESC: "Application Delete",
            CODE: `new sap.m.Button({
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03"),
                icon: "sap-icon://delete",
                type: sap.m.ButtonType.Reject,
                tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03") + " (Ctrl+F10)",
            })`,
            fn: (e) => {

                e.stopImmediatePropagation();

                if (sap.ui.getCore().isLocked()) {
                    zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                    return;
                }

                // 단축키 실행 할지 말지 여부 체크
                var result = oAPP.common.fnShortCutExeAvaliableCheck();

                // X 이면 실행 불가
                if (result == "X") {
                    return;
                }

                var oAppDelBtn = sap.ui.getCore().byId("appDelBtn");
                if (!oAppDelBtn || !oAppDelBtn.getEnabled() || !oAppDelBtn.getVisible()) {
                    return;
                }

                oAppDelBtn.firePress();

            }
        },
        {
            KEY: "Shift+F11", // [WS10] Application Copy
            DESC: "Application Copy",
            CODE: `new sap.m.Button({
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A04"),
                icon: "sap-icon://copy",
                tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A04") + " (Shift+F11)",
            })`,
            fn: (e) => {

                e.stopImmediatePropagation();

                if (sap.ui.getCore().isLocked()) {
                    zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                    return;
                }

                // 단축키 실행 할지 말지 여부 체크
                var result = oAPP.common.fnShortCutExeAvaliableCheck();

                // X 이면 실행 불가
                if (result == "X") {
                    return;
                }

                var oAppCopyBtn = sap.ui.getCore().byId("appCopyBtn");
                if (!oAppCopyBtn || !oAppCopyBtn.getEnabled() || !oAppCopyBtn.getVisible()) {
                    return;
                }

                oAppCopyBtn.firePress();

            }
        },
        {
            KEY: "F7", // [WS10] Display Button
            DESC: "Application Display Mode",
            CODE: `new sap.m.Button({
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05"),
                icon: "sap-icon://display",
                tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05") + " (F7)"
            })`,
            fn: (e) => {

                e.stopImmediatePropagation();

                // lock 걸기
                sap.ui.getCore().lock();

                // 메뉴 팝오버 닫기
                oAPP.common.fnCloseMenuPopover();

                // 단축키 실행 할지 말지 여부 체크
                var result = oAPP.common.fnShortCutExeAvaliableCheck();

                // X 이면 실행 불가
                if (result == "X") {
                    sap.ui.getCore().unlock();
                    return;
                }

                var oDisplayBtn = sap.ui.getCore().byId("displayBtn");
                if (!oDisplayBtn || !oDisplayBtn.getEnabled() || !oDisplayBtn.getVisible()) {
                    sap.ui.getCore().unlock();
                    return;
                }

                // 커서 포커스 날리기
                if (document.activeElement && document.activeElement.blur) {
                    document.activeElement.blur();
                }

                oDisplayBtn.firePress();

            }
        },
        {
            KEY: "F8", // [WS10] Application Execution
            DESC: "Application Execution",
            CODE: `new sap.m.Button({
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A06"),
                icon: "sap-icon://internet-browser",
                tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A06") + " (F8)"
            })`,
            fn: (e) => {

                e.stopImmediatePropagation();

                if (sap.ui.getCore().isLocked()) {
                    zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                    return;
                }

                // 단축키 실행 할지 말지 여부 체크
                var result = oAPP.common.fnShortCutExeAvaliableCheck();

                // X 이면 실행 불가
                if (result == "X") {
                    return;
                }

                var oAppExecBtn = sap.ui.getCore().byId("appExecBtn");
                if (!oAppExecBtn || !oAppExecBtn.getEnabled() || !oAppExecBtn.getVisible()) {
                    return;
                }

                oAppExecBtn.firePress();

            }
        },
        {
            KEY: "Ctrl+F1", // [WS10] Example Open
            DESC: "Example Open",
            CODE: `new sap.m.Button({
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A07"),
                icon: "sap-icon://learning-assistant",
                tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A07") + " (Ctrl+F1)"
            })`,
            fn: (e) => {

                e.stopImmediatePropagation();

                if (sap.ui.getCore().isLocked()) {
                    zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                    return;
                }

                // 단축키 실행 할지 말지 여부 체크
                var result = oAPP.common.fnShortCutExeAvaliableCheck();

                // X 이면 실행 불가
                if (result == "X") {
                    return;
                }

                var oExamBtn = sap.ui.getCore().byId("examBtn");
                if (!oExamBtn || !oExamBtn.getEnabled() || !oExamBtn.getVisible()) {
                    return;
                }

                oExamBtn.firePress();

            }
        },
        {
            KEY: "Ctrl+F3", // [WS10] Multi Preview
            DESC: "Multi Preview",
            CODE: `new sap.m.Button({
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A08"),
                icon: "sap-icon://desktop-mobile",
                tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A08") + " (Ctrl+F3)"
            })`,
            fn: (e) => {

                e.stopImmediatePropagation();

                if (sap.ui.getCore().isLocked()) {
                    zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                    return;
                }

                // 단축키 실행 할지 말지 여부 체크
                var result = oAPP.common.fnShortCutExeAvaliableCheck();

                // X 이면 실행 불가
                if (result == "X") {
                    return;
                }

                var oMultiPrevBtn = sap.ui.getCore().byId("multiPrevBtn");
                if (!oMultiPrevBtn || !oMultiPrevBtn.getEnabled() || !oMultiPrevBtn.getVisible()) {
                    return;
                }

                oMultiPrevBtn.firePress();

            }
        }

        ],
            aShortCutWS20 = [{
                KEY: "F11", // [WS20] FullScreen
                DESC: "Browser Fullscreen",
                CODE: `new sap.m.Button({icon: "sap-icon://header"})`,
                fn: (e) => {

                    e.stopImmediatePropagation();

                    // var oCurrWin = REMOTE.getCurrentWindow(), // 현재 window
                    //     bIsFull = oCurrWin.isFullScreen();

                    // oCurrWin.setFullScreen(!bIsFull);

                    /***************************************
                     * 2024-07-01 soccerhs
                     ***************************************
                    * ## F11 기능 변경
                    * - 기존: 전체창(Kiosk) 모드
                    * - 변경: 브라우저 전체창 모드
                    ***************************************/
                    if(typeof sap === undefined){
                        return;
                    }

                    let oMaxWinBtn = sap.ui.getCore().byId("maxWinBtn");
                    if(!oMaxWinBtn){
                        return;
                    }

                    oMaxWinBtn.firePress();

                }
            }, {
                KEY: "Ctrl+Shift+F", // [WS20] textSearchPopup
                DESC: "Text Search Popup",
                CODE: `new sap.m.Button({icon: "sap-icon://search"})`,
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    oAPP.fn.fnTextSearchPopupOpener();

                }
            }, {
                KEY: "Ctrl+F2", // [WS20] Syntax Check Button
                DESC: "Syntax Check",
                CODE: `new sap.m.Button({
                    icon: "sap-icon://validate",
                    tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B72") + " (Ctrl+F2)"
                })`,
                fn: async (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oSyntaxCheckBtn = sap.ui.getCore().byId("syntaxCheckBtn");
                    if (!oSyntaxCheckBtn || !oSyntaxCheckBtn.getEnabled() || !oSyntaxCheckBtn.getVisible()) {
                        return;
                    }

                    oSyntaxCheckBtn.focus();

                    sap.ui.getCore().lock();

                    await new Promise((resolve) => {

                        var _ointer = setInterval(() => {
    
                            if(parent.getBusy() === "X"){ return; } 
    
                            clearInterval(_ointer);
                            resolve();
                          
                        }, 0);

                    });

                    oSyntaxCheckBtn.firePress();

                }
            },
            {
                KEY: "F3", // [WS20] Back Button
                DESC: "Back",
                CODE: ``,
                fn: async (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // // lock 걸기
                    // sap.ui.getCore().lock();

                    // 메뉴 팝오버 닫기
                    oAPP.common.fnCloseMenuPopover();

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        sap.ui.getCore().unlock();
                        return;
                    }

                    // var oBackBtn = sap.ui.getCore().byId("backBtn");
                    // if (!oBackBtn || !oBackBtn.getEnabled() || !oBackBtn.getVisible()) {
                    //     sap.ui.getCore().unlock();
                    //     return;
                    // }

                    // 커서 포커스 날리기
                    if (document.activeElement && document.activeElement.blur) {
                        document.activeElement.blur();
                    }

                    var oBackBtn = sap.ui.getCore().byId("backBtn");
                    oBackBtn.focus();

                    sap.ui.getCore().lock();

                    await new Promise((resolve) => {

                        var _ointer = setInterval(() => {
    
                            if(parent.getBusy() === "X"){ return; } 
    
                            clearInterval(_ointer);
                            resolve();
                          
                        }, 0);

                    });

                    oBackBtn.firePress();

                }

            },
            {
                KEY: "Ctrl+F1", // [WS20] Display or Change Button
                DESC: "Display <---> Change",
                // DESC: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05") + " <--> " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02"),
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oChangeModeBtn = sap.ui.getCore().byId("changeModeBtn"),
                        oDisplayBtn = sap.ui.getCore().byId("displayModeBtn");

                    if (!oChangeModeBtn && !oDisplayBtn) {
                        return;
                    }

                    // 커서 포커스 날리기
                    if (document.activeElement && document.activeElement.blur) {
                        document.activeElement.blur();
                    }

                    var bIsChgVisi = oChangeModeBtn.getVisible(),
                        bIsDisVisi = oDisplayBtn.getVisible();

                    if (bIsChgVisi == true) {
                        oChangeModeBtn.focus();
                        oChangeModeBtn.firePress();
                        return;
                    }

                    if (bIsDisVisi == true) {
                        oDisplayBtn.focus();
                        oDisplayBtn.firePress();
                        return;
                    }

                }
            },
            {
                KEY: "Ctrl+F3", // [WS20] Activate Button
                DESC: "Activate",
                fn: async (e) => {
                    e.stopImmediatePropagation();
   
                    var oActivateBtn = sap.ui.getCore().byId("activateBtn");

                    if (!oActivateBtn || !oActivateBtn.getEnabled() || !oActivateBtn.getVisible()) {
                        return;
                    }


                    if (sap.ui.getCore().isLocked()) {
                        return;
                    }


                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }



                    // 커서 포커스 날리기
                    if (document.activeElement && document.activeElement.blur) {
                        document.activeElement.blur();
                    }

                    
                    oActivateBtn.focus();

                    sap.ui.getCore().lock();

                    await new Promise((resolve) => {

                        var _ointer = setInterval(() => {
    
                            if(parent.getBusy() === "X"){ return; } 
    
                            clearInterval(_ointer);
                            resolve();
                          
                        }, 0);

                    });

                    oActivateBtn.firePress();

                }
            },
            {
                /****************************************************************************************************
                 * [WS20] shortcut library bug,
                 ****************************************************************************************************
                 * Ctrl + F4 키를 누르면 Ctrl + S 이벤트를 발생시키는 버그를 발견하여,
                 * Ctrl + F4 키를 눌렀다면 이벤트 전파 방지를 하여 Ctrl + S 이벤트를
                 * 타지 않게 하기 위함.               
                 ****************************************************************************************************/
                KEY: "Ctrl+F4",
                VISIBLE: false,
                fn: (e) => {

                    e.stopImmediatePropagation();

                    zconsole.log("ws30/Ctrl+F4 key in!!");

                },
                
            },
            {
                KEY: "Ctrl+S", // [WS20] Save Button
                DESC: "Save",
                fn: async (e) => {

                    e.stopImmediatePropagation();
                    
                    var oSaveBtn = sap.ui.getCore().byId("saveBtn");
                    if (!oSaveBtn || !oSaveBtn.getEnabled() || !oSaveBtn.getVisible()) {
                        return;
                    }

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    // 커서 포커스 날리기
                    if (document.activeElement && document.activeElement.blur) {
                        document.activeElement.blur();
                    }


                    oSaveBtn.focus();

                    sap.ui.getCore().lock();

                    await new Promise((resolve) => {

                        var _ointer = setInterval(() => {
    
                            if(parent.getBusy() === "X"){ return; } 
    
                            clearInterval(_ointer);
                            resolve();
                          
                        }, 0);

                    });

                    oSaveBtn.firePress();

                }
            },     
            {
                KEY: "Ctrl+Shift+F12", // [WS20] Mime Button
                DESC: "Mime Repository",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oMimeBtn = sap.ui.getCore().byId("mimeBtn");
                    if (!oMimeBtn || !oMimeBtn.getEnabled() || !oMimeBtn.getVisible()) {
                        return;
                    }

                    oMimeBtn.firePress();
                }
            },
            {
                KEY: "Ctrl+F12", // [WS20] Controller Button
                DESC: "Controller (Class Builder)",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oControllerBtn = sap.ui.getCore().byId("controllerBtn");
                    if (!oControllerBtn || !oControllerBtn.getEnabled() || !oControllerBtn.getVisible()) {
                        return;
                    }

                    oControllerBtn.firePress();
                }
            },
            {
                KEY: "F8", // [WS20] Application Execution Button
                DESC: "Application Execution",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oAppExecBtn = sap.ui.getCore().byId("ws20_appExecBtn");
                    if (!oAppExecBtn || !oAppExecBtn.getEnabled() || !oAppExecBtn.getVisible()) {
                        return;
                    }

                    oAppExecBtn.firePress();
                }
            },
            {
                KEY: "Ctrl+F5", // [WS20] Multi Preview Button
                DESC: "Multi Preview",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oMultiPrevBtn = sap.ui.getCore().byId("ws20_multiPrevBtn");
                    if (!oMultiPrevBtn || !oMultiPrevBtn.getEnabled() || !oMultiPrevBtn.getVisible()) {
                        return;
                    }

                    oMultiPrevBtn.firePress();
                }
            },
            {
                KEY: "Ctrl+Shift+F10", // [WS20] Icon List Button
                DESC: "Icon List",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    // iconCollBtn

                    var oIconListBtn = sap.ui.getCore().byId("iconCollBtn");
                    if (!oIconListBtn || !oIconListBtn.getEnabled() || !oIconListBtn.getVisible()) {
                        return;
                    }

                    let oItem = sap.ui.getCore().byId("iconListMenuItem");

                    oIconListBtn.fireItemSelected({ item: oItem });

                    // var oIconListBtn = sap.ui.getCore().byId("iconListBtn");
                    // if (!oIconListBtn || !oIconListBtn.getEnabled() || !oIconListBtn.getVisible()) {
                    //     return;
                    // }

                    // oIconListBtn.firePress();
                }
            },
            {
                KEY: "Shift+F1", // [WS20] Add Server Event Button
                DESC: "Add Event Method",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oAddEventBtn = sap.ui.getCore().byId("addEventBtn");
                    if (!oAddEventBtn || !oAddEventBtn.getEnabled() || !oAddEventBtn.getVisible()) {
                        return;
                    }

                    oAddEventBtn.firePress();
                }
            },
            {
                KEY: "F9", // [WS20] Runtime Class Navigator Event Button
                DESC: "Runtime Class Navigator",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oRuntimeBtn = sap.ui.getCore().byId("runtimeBtn");
                    if (!oRuntimeBtn || !oRuntimeBtn.getEnabled() || !oRuntimeBtn.getVisible()) {
                        return;
                    }

                    oRuntimeBtn.firePress();
                }
            },
            {
                KEY: "Ctrl+F", // [WS20] Find
                DESC: "Find UI",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oFindBtn = sap.ui.getCore().byId("ws20_findBtn");
                    if (!oFindBtn || !oFindBtn.getEnabled() || !oFindBtn.getVisible()) {
                        return;
                    }

                    oFindBtn.firePress();
                }
            },
            {
                // KEY: "Ctrl+Z", // [WS20] UNDO
                KEY: "Ctrl+Shift+Z", // [WS20] UNDO
                DESC: "Undo",
                fn: (e) => {

                    // 20번 페이지의 앱 정보를 구한다.
                    let _oAppInfo = parent.getAppInfo();
                    if(!_oAppInfo){
                        return;
                    }

                    // 현재 문서 모드가 display일 경우
                    if(_oAppInfo.IS_EDIT !== "X"){                    
                        return;
                    }                    

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // lock 걸기
                    sap.ui.getCore().lock();

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        sap.ui.getCore().unlock();
                        return;
                    }                    

                    parent.require(oAPP.oDesign.pathInfo.undoRedo).executeHistory("UNDO");

                    // zconsole.log("UNDO!!");



                }
            },
            {
                // KEY: "Ctrl+X", // [WS20] REDO
                KEY: "Ctrl+Shift+X", // [WS20] REDO
                DESC: "Redo",
                fn: (e) => {

                    // 20번 페이지의 앱 정보를 구한다.
                    let _oAppInfo = parent.getAppInfo();
                    if(!_oAppInfo){
                        return;
                    }

                    // 현재 문서 모드가 display일 경우
                    if(_oAppInfo.IS_EDIT !== "X"){                    
                        return;
                    }           

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // lock 걸기
                    sap.ui.getCore().lock();

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        sap.ui.getCore().unlock();
                        return;
                    }                    

                    // zconsole.log("REDO!!");

                    parent.require(oAPP.oDesign.pathInfo.undoRedo).executeHistory("REDO");

                }
            }

            ],

            /*****************************************************
             * [WS30] USP 단축키
             *****************************************************/
            aShortCutWS30 = [{
                KEY: "F11", // [WS30] FullScreen
                DESC: "Browser Fullscreen",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    // var oCurrWin = REMOTE.getCurrentWindow(), // 현재 window
                    //     bIsFull = oCurrWin.isFullScreen();

                    // oCurrWin.setFullScreen(!bIsFull);

                    /***************************************
                     * 2024-07-01 soccerhs
                     ***************************************
                    * ## F11 기능 변경
                    * - 기존: 전체창(Kiosk) 모드
                    * - 변경: 브라우저 전체창 모드
                    ***************************************/
                    if(typeof sap === undefined){
                        return;
                    }

                    let oMaxWinBtn = sap.ui.getCore().byId("maxWinBtn");
                    if(!oMaxWinBtn){
                        return;
                    }

                    oMaxWinBtn.firePress();

                }
            },
            /****************************************************************************************************
             * shortcut library bug,
             ****************************************************************************************************
             * Ctrl + F4 키를 누르면 Ctrl + S 이벤트를 발생시키는 버그를 발견하여,
             * Ctrl + F4 키를 눌렀다면 이벤트 전파 방지를 하여 Ctrl + S 이벤트를
             * 타지 않게 하기 위함.               
             ****************************************************************************************************/
            {
                KEY: "Ctrl+F4", // [WS30]
                VISIBLE: false,
                fn: (e) => {

                    e.stopImmediatePropagation();

                    zconsole.log("ws30/Ctrl+F4 key in!!");

                }
            },
            {
                KEY: "F3",  // [WS30] 이전 페이지로 이동 
                DESC: "Back",
                fn: async (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    // var oBackBtn = sap.ui.getCore().byId("ws30_backBtn");
                    // if (!oBackBtn || !oBackBtn.getEnabled() || !oBackBtn.getVisible()) {
                    //     return;
                    // }

                    // 커서 포커스 날리기
                    if (document.activeElement && document.activeElement.blur) {
                        document.activeElement.blur();
                    }

                    var oBackBtn = sap.ui.getCore().byId("ws30_backBtn");
                    oBackBtn.focus();

                    oBackBtn.firePress();

                }
            }, {
                KEY: "Ctrl+F1", // [WS30] Display or Change Button
                DESC: "Display <---> Change",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    var oChangeModeBtn = sap.ui.getCore().byId("ws30_changeModeBtn"),
                        oDisplayBtn = sap.ui.getCore().byId("ws30_displayModeBtn");

                    if (!oChangeModeBtn && !oDisplayBtn) {
                        return;
                    }

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }                    

                    var bIsChgVisi = oChangeModeBtn.getVisible(),
                        bIsDisVisi = oDisplayBtn.getVisible();

                    // 커서 포커스 날리기
                    if (document.activeElement && document.activeElement.blur) {
                        document.activeElement.blur();
                    }

                    if (bIsChgVisi == true) {
                        oChangeModeBtn.focus();
                        oChangeModeBtn.firePress();
                        return;
                    }

                    if (bIsDisVisi == true) {
                        oDisplayBtn.focus();
                        oDisplayBtn.firePress();
                        return;
                    }

                }
            }, {
                KEY: "Ctrl+F3", // [WS30] Activate Button
                DESC: "Activate",
                fn: async (e) => {

                    e.stopImmediatePropagation();

                    var oActivateBtn = sap.ui.getCore().byId("ws30_activateBtn");
                    if (!oActivateBtn || !oActivateBtn.getEnabled() || !oActivateBtn.getVisible()) {
                        return;
                    }

                    // Active 버튼 누르기 전 커서의 위치를 저장한다.
                    if (oAPP.attr.beforeActiveElement) {
                        delete oAPP.attr.beforeActiveElement;
                    }

                    oAPP.attr.beforeActiveElement = document.activeElement;                    

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }                    

                    // 커서 포커스 날리기
                    if (document.activeElement && document.activeElement.blur) {
                        document.activeElement.blur();
                    }

                    oActivateBtn.focus();

                    sap.ui.getCore().lock();

                    await new Promise((resolve) => {

                        var _ointer = setInterval(() => {
    
                            if(parent.getBusy() === "X"){ return; } 
    
                            clearInterval(_ointer);
                            resolve();
                          
                        }, 0);

                    });

                    oActivateBtn.firePress();
                }
            }, {
                KEY: "Ctrl+S", // [WS30] Save Button
                DESC: "Save",
                fn: async (e) => {

                    // // Active 버튼 누르기 전 커서의 위치를 저장한다.
                    // if (oAPP.attr.beforeActiveElement) {
                    //     delete oAPP.attr.beforeActiveElement;
                    // }

                    // oAPP.attr.beforeActiveElement = document.activeElement;

                    e.stopImmediatePropagation();

                    var oSaveBtn = sap.ui.getCore().byId("ws30_saveBtn");
                    if (!oSaveBtn || !oSaveBtn.getEnabled() || !oSaveBtn.getVisible()) {
                        return;
                    }

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }                   

                    // 커서 포커스 날리기
                    if (document.activeElement && document.activeElement.blur) {
                        document.activeElement.blur();
                    }

                    oSaveBtn.focus();

                    sap.ui.getCore().lock();

                    await new Promise((resolve) => {

                        var _ointer = setInterval(() => {
    
                            if(parent.getBusy() === "X"){ return; } 
    
                            clearInterval(_ointer);
                            resolve();
                          
                        }, 0);

                    });

                    oSaveBtn.firePress();

                }
            }, {
                KEY: "Shift+F1", // [WS30] Code Editor Pretty Print
                DESC: "Pretty Print",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oBtn = sap.ui.getCore().byId("ws30_codeeditor_prettyBtn");
                    if (!oBtn || !oBtn.getEnabled() || !oBtn.getVisible()) {
                        return;
                    }

                    oBtn.firePress({
                        ISSHORTCUT: "X"
                    });

                }
            },
            {
                KEY: "F8", // [WS30] Application Execution Button
                DESC: "Application Execution",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oAppExecBtn = sap.ui.getCore().byId("ws30_appExecBtn");
                    if (!oAppExecBtn || !oAppExecBtn.getEnabled() || !oAppExecBtn.getVisible()) {
                        return;
                    }

                    oAppExecBtn.firePress();
                }
            },
            {
                KEY: "Ctrl+Shift+F12", // [WS30] Mime Button
                DESC: "Mime Repository",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oMimeBtn = sap.ui.getCore().byId("ws30_MimeBtn");
                    if (!oMimeBtn || !oMimeBtn.getEnabled() || !oMimeBtn.getVisible()) {
                        return;
                    }

                    oMimeBtn.firePress();
                }
            },
            {
                KEY: "Ctrl+F12", // [WS30] Controller Button
                DESC: "Controller (Class Builder)",
                fn: (e) => {

                    e.stopImmediatePropagation();

                    if (sap.ui.getCore().isLocked()) {
                        zconsole.log("!! 락 걸려서 단축기 실행 불가!!");
                        return;
                    }

                    // 단축키 실행 할지 말지 여부 체크
                    var result = oAPP.common.fnShortCutExeAvaliableCheck();

                    // X 이면 실행 불가
                    if (result == "X") {
                        return;
                    }

                    var oControllerBtn = sap.ui.getCore().byId("ws30_controllerBtn");
                    if (!oControllerBtn || !oControllerBtn.getEnabled() || !oControllerBtn.getVisible()) {
                        return;
                    }

                    oControllerBtn.firePress();
                }
            },
            ];

        // // Shortcut에 대한 이미지 경로
        // for(var oItem of aShortCutWS10){
        //     oItem.IMG_SRC = parent.PATH.join(sImgRootPath, "WS10", oItem.KEY + ".png")
        // }

        // for(var oItem of aShortCutWS20){
        //     oItem.IMG_SRC = parent.PATH.join(sImgRootPath, "WS20", oItem.KEY + ".png")
        // }

        // for(var oItem of aShortCutWS30){
        //     oItem.IMG_SRC = parent.PATH.join(sImgRootPath, "WS30", oItem.KEY + ".png")
        // }

        var oShortcutList = {
            "WS10": aShortCutWS10,
            "WS20": aShortCutWS20,
            "WS30": aShortCutWS30
        };

        return oShortcutList[sPgNo] || [];

    }; // end of oAPP.common.getShortCutList

    /************************************************************************
     * 현재 페이지 별 단축키 설정
     * **********************************************************************
     * @param {String} sPgNo  
     * - page 명
     * 예) WS10, WS20     
     ************************************************************************/
    oAPP.common.setShortCut = function (sPgNo) {

        var oShortcut = oAPP.attr.oShortcut;

        var aShortcutList = oAPP.common.getShortCutList(sPgNo),
            iLength = aShortcutList.length;

        for (var i = 0; i < iLength; i++) {

            var oShortcutInfo = aShortcutList[i];

            oShortcut.add(oShortcutInfo.KEY, oShortcutInfo.fn);

        }

    }; // end of oAPP.common.setShortCut

    /************************************************************************
     * 해당 페이지의 단축키 제거
     * **********************************************************************
     * @param {String} sPgNo  
     * - page 명
     * 예) WS10, WS20     
     ************************************************************************/
    oAPP.common.removeShortCut = function (sPgNo) {

        var oShortcut = oAPP.attr.oShortcut;

        var aShortcutList = oAPP.common.getShortCutList(sPgNo),
            iLength = aShortcutList.length;

        for (var i = 0; i < iLength; i++) {

            var oShortcutInfo = aShortcutList[i];

            oShortcut.remove(oShortcutInfo.KEY);

        }

    }; // end of oAPP.common.removeShortCut

    /************************************************************************
     * 로그인 상태 체크
     ************************************************************************/
    oAPP.common.sendAjaxLoginChk = function (fnCallback) {

        // var sPath = parent.getServerPath() + "/wsloginchk";
        var sPath = parent.getServerPath() + "/ping_check";

        sendAjax(sPath, undefined, (oReturn) => {

            if (typeof fnCallback == "function") {
                fnCallback(oReturn);
            }

        });

    }; // end of oAPP.common.sendAjaxLoginChk

    /************************************************************************
     * !! 현재 브라우저의 Child 기준 !!
     ************************************************************************
     * 에디터 타입별로 이미 오픈된 팝업이 있는지 확인
     * 있으면 새창을 띄우지 말고 focus 를 준다.
     * **********************************************************************
     * @param {Object} oEditInfo
     * - 오픈 하려는 에디터의 타입 정보
     * 
     * @return {Object} 
     *  - ISOPEN {Boolean} 
     *      true : 같은 타입의 오픈된 에디터 팝업이 이미 있는 경우.
     *      false : 같은 타입의 오픈된 에디터 팝업이 없는 신규일 경우.
     * 
     *  - WINDOW {Object}
     *      BrowserWindow Instance
     *  
     ************************************************************************/
    oAPP.common.getCheckAlreadyOpenWindow = function (OBJTY) {

        var oCurrWin = REMOTE.getCurrentWindow(), // 현재 window
            aChildWin = oCurrWin.getChildWindows(), // 현재 window의 child window           
            iChildWinCnt = aChildWin.length,
            sObjType = OBJTY;

        if (iChildWinCnt <= 0) {
            return {
                ISOPEN: false
            };
        }

        for (var i = 0; i < iChildWinCnt; i++) {

            var oWin = aChildWin[i];

            if (oWin.isDestroyed()) {
                continue;
            }

            try {

                var oWebCon = oWin.webContents;
                var oWebPref = oWebCon.getWebPreferences();
                var sType = oWebPref.OBJTY;

                if (sObjType != sType) {
                    continue;
                }

                oWin.focus();

                return {
                    ISOPEN: true,
                    WINDOW: oWin
                };

            } catch (error) {
                continue;
            }

        }

        return {
            ISOPEN: false
        };

    }; // end of oAPP.common.onCheckAlreadyOpenEditor

    /************************************************************************
     * !! 전체 떠있는 브라우저 기준 !!
     *************************************************************************
     * OBJTY 별로 이미 오픈된 팝업이 있는지 확인
     * 있으면 새창을 띄우지 말고 focus 를 준다.
     * ***********************************************************************
     * @param {Object} oEditInfo
     * - 오픈 하려는 에디터의 타입 정보
     * 
     * @return {Object} 
     *  - ISOPEN {Boolean} 
     *      true : 같은 타입의 오픈된 에디터 팝업이 이미 있는 경우.
     *      false : 같은 타입의 오픈된 에디터 팝업이 없는 신규일 경우.
     * 
     *  - WINDOW {Object}
     *      BrowserWindow Instance
     *  
     ************************************************************************/
    oAPP.common.getCheckAlreadyOpenWindow2 = (OBJTY) => {

        // 현재 떠있는 전체 윈도우를 구한다.
        let aAllWindows = REMOTE.BrowserWindow.getAllWindows(),
            iAllWinLength = aAllWindows.length;

        if (iAllWinLength <= 0) {
            return {
                ISOPEN: false
            };
        }

        // 현재 떠있는 브라우저의 키를 구한다.
        let oCurrWin = REMOTE.getCurrentWindow(),
            oCurrWinWebCon = oCurrWin.webContents,
            oCurrWinWebPref = oCurrWinWebCon.getWebPreferences(),
            sCurrWinBrowsKey = oCurrWinWebPref.browserkey;

        for (var i = 0; i < iAllWinLength; i++) {

            let oWin = aAllWindows[i];

            // 브라우저가 이미 죽었다면..
            if (oWin.isDestroyed()) {
                continue;
            }

            try {                
        
                let oWebCon     = oWin.webContents,
                    oWebPref    = oWebCon.getWebPreferences(),
                    sBrowsKey   = oWebPref.browserkey,
                    sOBJTY      = oWebPref.OBJTY;

                // // 현재 떠있는 브라우저의 키와 같은것을 찾는다.
                // if (sCurrWinBrowsKey !== sBrowsKey) {
                //     continue;
                // }

                // OBJTY가 있는지
                if (!sOBJTY) {
                    continue;
                }

                // OBJTY가 같은것인지
                if (sOBJTY !== OBJTY) {
                    continue;
                }

            } catch (error) {
                continue;       
            }

            // 찾으면 빠져나감
            return {
                ISOPEN: true,
                WINDOW: oWin
            };

        }

        // 그래도 못찾았다면..
        return {
            ISOPEN: false
        };

    };


    /************************************************************************
     *  컨트롤러 클래스 실행
     * **********************************************************************
     * @param {String} METHNM
     * - 클래스의 메소드 명
     * @param {String} INDEX
     * - 클래스 메소드 내의 소스 인덱스
     * @param {String} TCODE (반드시 METHNM, INDEX 파라미터는 null 처리 하고 사용 할 것.)
     * - SAP Transaction Code 
     * @param {String} oAppInfo (AppInfo를 던지고 싶을때 사용)
     * - APP Info
     ************************************************************************/
    oAPP.common.execControllerClass = function (METHNM, INDEX, TCODE, oAppInfo) {

        let oServerInfo = parent.getServerInfo();

        // IPCREDERER로 같은 client && SYSID 창에 일러스트 메시지를 뿌린다!!
        let oSendData = {
            PRCCD: "01",
            CLIENT: oServerInfo.CLIENT,
            SYSID: oServerInfo.SYSID,
            OPTIONS: {
                title: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "374"), // SAPGUI Launch
                description: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "373"), // Please wait a few minutes.
                illustrationType: "tnt-Radar",
                illustrationSize: sap.m.IllustratedMessageSize.Dialog
            }
        };

        // 같은 client && SYSID 창에 일러스트 메시지를 뿌린다!!
        parent.IPCRENDERER.send("if-browser-interconnection", oSendData); // #[ws_fn_ipc.js]

        var oParam = {
            METHNM: (METHNM == null ? "" : METHNM),
            INDEX: (INDEX == null ? "0" : INDEX),
            TCODE: (typeof TCODE == "undefined" ? "" : TCODE),
            oAppInfo: oAppInfo,
            BROWSKEY: parent.getBrowserKey() // 브라우저 키
        };

        //#[ws_fn_04.js] SAPGUI 멀티 로그인 여부 체크
        oAPP.fn.fnSapGuiMultiLoginCheck()
            .then(oAPP.fn.fnSapGuiMultiLoginCheckThen.bind(oParam))
            .catch((result) => {

                // 같은 client && SYSID 창에 IllustedMsgDialog를 닫는다
                oSendData.PRCCD = "02";

                parent.IPCRENDERER.send("if-browser-interconnection", oSendData);

                if (result && result.RTMSG) {
                    // 메시지 처리...
                    parent.showMessage(sap, 10, 'E', result.RTMSG);
                }

            });

    }; // end of oAPP.common.execControllerClass

    // /************************************************************************
    //  * 세션타임아웃 후 전체 로그아웃 및 같은 세션 창 전체 닫기
    //  * **********************************************************************/
    // oAPP.common.setSessionTimeout = function () {

    //     // 세션 타임 아웃 시, logoff 처리
    //     var sPath = parent.getServerPath() + '/logoff';

    //     fetch(sPath);

    //     parent.IPCRENDERER.send('if-browser-close', {
    //         ACTCD: "C", // 같은 세션을 가진 브라우저 중 로그오프가 된 브라우저의 키를 전달한다.
    //         SESSKEY: parent.getSessionKey(),
    //         BROWSKEY: parent.getBrowserKey()
    //     });

    // }; // end of oAPP.common.setSessionTimeout      
    

    /************************************************************************
     * APP 전체 대상 글로벌 Shortcut 지정하기
     ************************************************************************/
    oAPP.common.fnSetCommonShortcut = function () {

        var oShortcut = oAPP.attr.oShortcut;

        // 새창 띄우기
        oShortcut.add("Ctrl+N", () => {

            // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
            if (parent.getBusy() == 'X') {
                return;
            }

            // 단축키 실행 할지 말지 여부 체크
            var result = oAPP.common.fnShortCutExeAvaliableCheck();

            // X 이면 실행 불가
            if (result == "X") {
                return;
            }

            parent.onNewWindow();

        });

        // 브라우저 창 닫기
        oShortcut.add("Ctrl+W", () => {

            // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
            if (parent.getBusy() == 'X') {
                return;
            }

            // 단축키 실행 할지 말지 여부 체크
            var result = oAPP.common.fnShortCutExeAvaliableCheck();

            // X 이면 실행 불가
            if (result == "X") {
                return;
            }

            // 브라우저의 닫기 버튼 눌렀다는 플래그
            oAPP.attr.isPressWindowClose = "X";

            var oCurrWin = parent.REMOTE.getCurrentWindow();
            oCurrWin.close();

        });

        // 브라우저 zoom 기본설정
        oShortcut.add("Ctrl+0", () => {
            
            // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
            if (parent.getBusy() == 'X') {
                return;
            }

            // 브라우저 zoom을 0으로 설정            
            oAPP.fn.setBrowserZoomZero();

            // 설정된 zoom 값을 저장
            oAPP.fn.setPersonWinZoom("S");

        });

        oShortcut.add("Ctrl+Shift+F9", (e) => {    
            
            e.stopImmediatePropagation();

            // console.log("F9");
            // console.log(e);
        });

        // // Busy 켜기
        // oShortcut.add("Ctrl+Shift+X", (e) => {
            
        //     e.stopImmediatePropagation();

        //     parent.setBusy('X');
        //     console.log("X");
        //     console.log(e);
        // });

        // // Busy 끄기
        // oShortcut.add("Ctrl+Shift+Z", (e) => {

        //     e.stopImmediatePropagation();

        //     parent.setBusy('');

        //     console.log("Z");
        //     console.log(e);
        // });

    }; // end of oAPP.common.fnSetCommonShortcut


    /************************************************************************
     * APP 전체 대상 공통 Shortcut 지정하기
     ************************************************************************/
    oAPP.common.fnSetGlobalShortcut = function(){

        // var oGlobalShortcut = parent.GLOBALSHORTCUT;

        // oGlobalShortcut.register('Alt+F4', (e) => {

        //     debugger;

        //     e.preventDefault();

        //     console.log('Alt + F4 is disabled.');

        // });

    }; // end of oAPP.common.fnSetGlobalShortcut


    /************************************************************************
     * APP 전체 대상 글로벌 Shortcut 삭제
     * **********************************************************************/
    oAPP.common.fnRemoveGlobalShortcut = function () {

        var oGlobalShortcut = parent.GLOBALSHORTCUT;

        oGlobalShortcut.unregisterAll();

    }; // end of oAPP.common.fnRemoveGlobalShortcut

    /**
     * Gif Busy Dialog
     * @param {Boolean} bIsOpen 
     * 
     * @param {Function} fnExecFunc 
     */
    oAPP.common.fnSetBusyDialog = function (bIsOpen) {

        const BusyDialogID = "u4aWsBusyDialog";

        var oDialog = sap.ui.getCore().byId(BusyDialogID);
        if (oDialog) {

            if (oDialog.isOpen() == bIsOpen) {
                return;
            }

            if (bIsOpen) {

                oDialog.open();

                // 작업표시줄에 progress bar 실행
                parent.setProgressBar("S", bIsOpen);

                return;
            }

            // 작업표시줄에 progress bar 중지
            parent.setProgressBar("S", bIsOpen);

            oDialog.close();

            return;

        }

        var sLoaderGif = PATH.join(APPPATH, "\\img\\loader.gif"),
            oBusyDialog = new sap.m.Dialog(BusyDialogID, {

                // properties
                showHeader: false,
                escapeHandler: function () {


                },

                // aggregations
                content: [

                    new sap.m.VBox({
                        justifyContent: sap.m.FlexJustifyContent.Center,
                        alignItems: sap.m.FlexAlignItems.Center,
                        items: [

                            new sap.m.Avatar({
                                customDisplaySize: "10rem",
                                customFontSize: "3rem",
                                displaySize: sap.m.AvatarSize.Custom,
                                src: sLoaderGif
                            }).addStyleClass("u4aWsAvatarBusy")

                        ]

                    })

                ]

            }).addStyleClass(BusyDialogID);

        if (oBusyDialog.isOpen() == bIsOpen) {
            return;
        }

        if (bIsOpen) {

            oBusyDialog.open();

            // 작업표시줄에 progress bar 실행
            parent.setProgressBar("S", bIsOpen);

            return;
        }

        // 작업표시줄에 progress bar 중지
        parent.setProgressBar("S", bIsOpen);

        oBusyDialog.close();

    }; // end of oAPP.common.fnSetBusyDialog

    /************************************************************************
     * 현재 떠있는 화면에서 메뉴 또는 Popover 들을 전부 숨긴다.
     * **********************************************************************/
    oAPP.common.fnCloseMenuPopover = () => {

        var oMenu = document.querySelector(".sapMMenu");
        if (oMenu) {
            // zconsole.log("메뉴 찾았다!");
            oMenu.style.visibility = "hidden";
        }

        var oPopover = document.querySelector(".sapMPopover");
        if (oPopover) {
            // zconsole.log("팝오버 찾았다!");
            oPopover.style.visibility = "hidden";
        }

    }; // end of oAPP.common.fnCloseMenuPopover

    /************************************************************************
     * 확장자만 발췌
     * **********************************************************************/
    oAPP.common.fnGetFileExt = (sPath) => {

        if (sPath == null || typeof sPath != "string") {
            return;
        }


        var sExtension = parent.PATH.extname(sPath);
        sExtension = sExtension.replace('.', '');

        return sExtension;

    };

    /************************************************************************
     * 잘못된 Url 호출 또는 현재 버전에 지원되지 않는 서비스를 호출 하는 경우 오류 메시지
     ************************************************************************/
    oAPP.common.fnUnsupportedServiceUrlCall = (u4a_status, oResult) => {

        //오류 메시지 출력.
        parent.showMessage(sap, 20, oResult.RETCD, oResult.RTMSG);

        switch (u4a_status) {
            case "UA0001":








                break;

            default:

                break;
        }

    }; // end of oAPP.common.fnUnsupportedServiceUrlCall

    /************************************************************************
     * 공통 헤더 메뉴의 Admin 버튼 이벤트
     ************************************************************************/
    oAPP.common.fnAdminHeaderMenu = () => {

        // sap.m.MessageToast.show("준비중입니다.");

        let oAdminDialog = sap.ui.getCore().byId("admDlg");

        // Dialog가 이미 만들어졌을 경우
        if (oAdminDialog) {

            // 이미 오픈 되있다면 return.
            if (oAdminDialog.isOpen()) {
                return;
            }

            oAdminDialog.open();
            return;

        }

        // 실행 브라우저 선택 팝업
        let oDialog = new sap.m.Dialog("admDlg", {

            // Properties
            draggable: true,
            resizable: true,

            // Aggregations
            customHeader: new sap.m.Bar({
                contentLeft: [
                    new sap.m.Title({
                        text: "Admimistrator"
                    }).addStyleClass("sapUiTinyMarginBegin"),
                ]
            }),

            content: [

                new sap.m.Input({
                    // width: "200px",
                    type: sap.m.InputType.Password,
                    value: `{${SYSADM_BIND_ROOT}/PW}`,
                    valueState: `{${SYSADM_BIND_ROOT}/VS}`,
                    valueStateText: `{${SYSADM_BIND_ROOT}/VST}`,
                    submit: () => {
                        oAPP.common.fnAdminSubmit();
                    }
                }).bindProperty("valueState", {
                    parts: [
                        `{${SYSADM_BIND_ROOT}/VS}`,
                    ],
                    formatter: (VS) => {

                        if (!VS) {
                            return sap.ui.core.ValueState.None;
                        }

                    }
                })

            ],


            // new sap.m.Toolbar({
            //     content: [
            //         new sap.m.ToolbarSpacer(),

            //         new sap.ui.core.Icon({
            //             src: "sap-icon://internet-browser"
            //         }),

            //         new sap.m.Title({
            //             text: "Select Default Browser"
            //         }).addStyleClass("sapUiTinyMarginBegin"),

            //         new sap.m.ToolbarSpacer(),

            //         new sap.m.Button({
            //             icon: "sap-icon://decline",
            //             press: function () {

            //                 var oDialog = sap.ui.getCore().byId("selBrwsDlg");
            //                 if (oDialog == null) {
            //                     return;
            //                 }

            //                 if (oDialog.isOpen()) {
            //                     oDialog.close();
            //                 }

            //             }
            //         })
            //     ]
            // }),

            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: () => {
                        oAPP.common.fnAdminSubmit();
                    }
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: () => {

                        oDialog.close();

                    }
                }),
            ],
            afterClose: () => {

                oAPP.common.fnSetModelProperty(`${SYSADM_BIND_ROOT}/PW`, "");

            }

        }).addStyleClass("sapUiContentPadding");

        oDialog.open();

    }; // end of oAPP.common.fnAdminHeaderMenu

    oAPP.common.fnAdminSubmit = () => {

        debugger;

        APPCOMMON.fnSetModelProperty(`${SYSADM_BIND_ROOT}/VS`, "");
        APPCOMMON.fnSetModelProperty(`${SYSADM_BIND_ROOT}/VST`, "");


        let sAdminPw = APPCOMMON.fnGetModelProperty(`${SYSADM_BIND_ROOT}/PW`);
        if (!sAdminPw) {

            var sMsg = "비밀번호를 입력하세요.";

            APPCOMMON.fnSetModelProperty(`${SYSADM_BIND_ROOT}/VS`, sap.ui.core.ValueState.Error);
            APPCOMMON.fnSetModelProperty(`${SYSADM_BIND_ROOT}/VST`, sMsg);

            return;

        }

        // trial 버전이 아닐때만 수행
        var oWsSettings = oAPP.fn.fnGetSettingsInfo(),
            oSYSADMIN = oWsSettings.SYSADMIN,
            sAuthKey = oSYSADMIN.AUTHKEY,
            sKeyEnc = atob(sAuthKey);

    }; // end of oAPP.common.fnAdminSubmit

    /************************************************************************
     * 전체 화면 상단 공통 버튼
     ************************************************************************/
    oAPP.common.fnGetCommonHeaderButtons = () => {

        let HBOX1 = new sap.m.HBox({
            renderType: sap.m.FlexRendertype.Bare,
            alignItems: sap.m.FlexAlignItems.Center,     
        }).addStyleClass("u4aWsCommonHeaderArea");

        
        /****************************************
         * AI 연동 Switch
         * 
         * // ws20_ai_con_btn <== 아이디 바라보는거 다 제거해야함!!!!
         ****************************************/
        let SWITCH1 = new sap.m.Switch({
            state: "{/UAI/state}",
            change: function(oEvent){
                
                oAPP.fn.onAiConnSwitchBtn(oEvent);
                
            }

        });
        HBOX1.addItem(SWITCH1);

        SWITCH1.bindProperty("visible",  {
            parts: [                
                "/SERVERINFO/SYSID",
                "/WS10",
                "/WS20/APP/IS_EDIT",
                "/WS30/APP/IS_EDIT",
                "/UAI"
            ],
            formatter: async function(SYSID, WS10, WS20_IS_EDIT, WS30_IS_EDIT, UAI){                

                var _bIsBusy = await new Promise(function(resove){

                    let isbusy = false;

                    setTimeout(() => {

                        switch (SYSID) {
                            case "UHA":
                            case "U4A":
        
                                let ROOTNAV = sap.ui.getCore().byId("WSAPP");
                                let oCurrPage = ROOTNAV.getCurrentPage();
                                let sCurrId = oCurrPage.getId();

                                // "10번 페이지일 경우"
                                if(sCurrId === "WS10"){

                                    isbusy = true;                                    

                                }

                                // "20번 페이지일 경우"
                                if(sCurrId === "WS20"){

                                    isbusy = ( WS20_IS_EDIT === "X" ? true : false );

                                }
                                
                                // "30번 (USP) 페이지 일 경우"
                                if(sCurrId === "WS30"){

                                    isbusy = ( WS30_IS_EDIT === "X" ? true : false );

                                }
        
                                break;                    
                        
                            default:
                                break;
                        }

                        resove(isbusy);

                    }, 0);

                });

                return _bIsBusy;               

            }
        });

        
        /****************************************
         * 브라우저 투명도 팝업 버튼
         ****************************************/
        let BUTTON1 = new sap.m.Button({
            icon: "sap-icon://hide",
            press: () => {
                oAPP.fn.fnSetHideWindow();
            }
        });
        HBOX1.addItem(BUTTON1);

        
        /****************************************
         * SAP LOGO ICON
         ****************************************/
        let ICON1 = new sap.ui.core.Icon({
            src: "sap-icon://sap-logo-shape"
        });
        HBOX1.addItem(ICON1);

        
        /****************************************
         * T-CODE 검색
         ****************************************/
        let SEARCHFIELD1 = new sap.m.SearchField({

            // properties
            width: "200px",
            maxLength: 20, // SAP Standard 기준으로 T-CODE는 최대 20자
            placeholder: "SAP T-CODE",
            showSearchButton: false,
            enableSuggestions: true,

            // aggregations
            suggestionItems: {
                path: "/SUGG/TCODE",
                sorter: "{ path : '/SUGG/TCODE/TCODE' }",
                template: new sap.m.SuggestionItem({
                    // key: "{TCODE}",
                    text: "{TCODE}",
                })
            },

            // events
            search: (oEvent) => {
                oAPP.events.ev_pressTcodeInputSubmit(oEvent); // #[ws_events_01.js]                        
            },
            suggest: (oEvent) => {
                oAPP.events.ev_suggestSapTcode(oEvent);                        
            }

        });
        HBOX1.addItem(SEARCHFIELD1);
        
        SEARCHFIELD1.addStyleClass("u4aWs30sapTcodeInput");

        SEARCHFIELD1.addEventDelegate({
            onAfterRendering: function(oEvent){

                // 간헐적으로 SearchField에 값을 입력하면 maxlength가 적용이 되지 않아
                // 직접 maxlength 구현
                let oSF = oEvent.srcControl;
                let oSFInput = oSF.getDomRef("I");
                if(!oSFInput){
                    return;
                }

                oSFInput.setAttribute("maxlength", oSF.getMaxLength());                        

            }
        });


        /****************************************
         * Browser Pin Button
         ****************************************/
        let BUTTON2 = new sap.m.OverflowToolbarToggleButton({
            icon: "sap-icon://pushpin-off",
            pressed: "{/SETTING/ISPIN}",
            tooltip: "Browser Pin",
            press: oAPP.events.ev_windowPinBtn
        });
        HBOX1.addItem(BUTTON2);


        /****************************************
         * zoom 기능
         ****************************************/
        let BUTTON3 = new sap.m.Button({
            icon: "sap-icon://zoom-in",
            press: oAPP.events.ev_pressZoomBtn,
            tooltip: "zoom",
        });
        HBOX1.addItem(BUTTON3);


        /****************************************
         * 검색 버튼
         ****************************************/
        let BUTTON4 =  new sap.m.Button({
            icon: "sap-icon://search",
            tooltip: "window Text Search",
            press: oAPP.events.ev_winTxtSrchWS10
        });
        HBOX1.addItem(BUTTON4);


        /****************************************
         * Logoff 버튼
         ****************************************/
        let BUTTON5 = new sap.m.Button({
            icon: "sap-icon://log",
            type: sap.m.ButtonType.Reject,
            press: oAPP.events.ev_Logout
        });
        HBOX1.addItem(BUTTON5);


        return HBOX1;

    }; // end of oAPP.common.fnGetCommonHeaderButtons

    /**
     * Busy & Lock
     * @param {CHAR1} isbusy "X", ""
     */
    oAPP.common.fnSetBusyLock = (isbusy) => {

        let bIsbusy = (isbusy == "X" ? true : false);

        if (bIsbusy) {

            // 화면 Lock 걸기
            sap.ui.getCore().lock();

            // Busy를 킨다.
            parent.setBusy("X");

            return;
        }

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        // Busy를 끈다.
        parent.setBusy("");

    }; // end of oAPP.common.fnSetBusyLock

    /**
     * 주어진 시간 동안 멈추기
     * @param {Integer} iTime 멈추는 시간 (ms)
     * @returns 
     */
    oAPP.common.fnSleep = async (iTime) => {

        return new Promise((resolve) => {

            setTimeout(() => {

                resolve();

            }, iTime);

        });

    }; // end of oAPP.common.fnSleep

    /**
     * ProgressDialog
     * 
     * @param {Object} oOptions 
     * title
     * description
     * illustrationType
     * percentValue
     * displayValue
     */
    oAPP.common.fnProgressDialogOpen = (oOptions) => {

        var sDialogId = "u4aWsProgressDialog",
            sIllustId = "u4aWsIllustMsg",
            sPrgressId = "u4aWsProg";

        var oDialog = sap.ui.getCore().byId(sDialogId),
            oIllustMsg = sap.ui.getCore().byId(sIllustId),
            oProgressbar = sap.ui.getCore().byId(sPrgressId);

        if (oDialog && typeof oOptions === "object") {

            oIllustMsg.setTitle(oOptions.title || "");
            oIllustMsg.setDescription(oOptions.description || "");
            oIllustMsg.setIllustrationType(oOptions.illustrationType || "NoSearchResults");

            oProgressbar.setPercentValue(oOptions.percentValue || 0);
            oProgressbar.setDisplayValue(oOptions.displayValue || "");

            oDialog.open();

            return;
        }

        var oIllustMsg = new sap.m.IllustratedMessage(sIllustId, {
            illustrationSize: sap.m.IllustratedMessageSize.Dialog,
        }).addStyleClass(`${sDialogId}--illustMsg`);

        jQuery.sap.require("sap.m.ProgressIndicator");

        var oProgressbar = new sap.m.ProgressIndicator(sPrgressId, {
            visible: true,
            displayOnly: true,
            state: "Success",
        }).addStyleClass("sapUiSmallMarginBeginEnd sapUiMediumMarginBottom");

        new sap.m.Dialog(sDialogId, {

            // properties
            showHeader: false,
            horizontalScrolling: false,
            verticalScrolling: false,

            // aggregations
            content: [
                oIllustMsg,

                new sap.m.HBox({
                    renderType: "Bare",
                    items: [
                        oProgressbar
                    ]
                }),

            ],
            afterClose: () => {

                let oProg = new sap.ui.getCore().byId(sPrgressId);
                if (!oProg) {
                    return;
                }

                oProg.setPercentValue(0);
                oProg.setDisplayValue("");

            },
            // Events
            escapeHandler: () => { }, // esc 키 방지

        })
            .addStyleClass(sDialogId)
            .open();

        var oDialog = sap.ui.getCore().byId(sDialogId),
            oIllustMsg = sap.ui.getCore().byId(sIllustId),
            oProgressbar = sap.ui.getCore().byId(sPrgressId);

        oIllustMsg.setTitle(oOptions.title || "");
        oIllustMsg.setDescription(oOptions.description || "");
        oIllustMsg.setIllustrationType(oOptions.illustrationType || "NoSearchResults");

        oProgressbar.setPercentValue(oOptions.percentValue || 0);
        oProgressbar.setDisplayValue(oOptions.displayValue || "");

    }; // end of oAPP.common.fnProgressDialog

    /**
     * ProgressDialog Close
     */
    oAPP.common.fnProgressDialogClose = () => {

        var oDialog = sap.ui.getCore().byId("u4aWsProgressDialog");
        if (oDialog) {
            oDialog.close();
        }

    }; // end of oAPP.common.fnProgressDialogClose


    /**
     * IllustMessage Dialog Open
     * @param {*} options 
     * title
     * description
     * illustrationType
     * illustrationSize
     */
    oAPP.common.fnIllustMsgDialogOpen = (oOptions) => {

        var sDialogId = "u4aWsIllustedMsgDialog",
            sIllustId = "u4aWsIllustedMsg";

        var oDialog = sap.ui.getCore().byId(sDialogId),
            oIllustMsg = sap.ui.getCore().byId(sIllustId);

        if (oDialog && typeof oOptions === "object") {

            lf_setIllustMsg(oIllustMsg, oOptions);

            oDialog.open();

            return;
        }

        var oIllustMsg = new sap.m.IllustratedMessage(sIllustId).addStyleClass(`${sDialogId}--illustMsg`);

        new sap.m.Dialog(sDialogId, {

            // properties
            showHeader: false,
            horizontalScrolling: false,
            verticalScrolling: false,

            // aggregations
            content: [
                oIllustMsg,
            ],
            afterClose: () => {

                var oIllustMsg = sap.ui.getCore().byId(sIllustId);
                if (!oIllustMsg) {
                    return;
                }

                let oOptions = {
                    title: "",
                    description: "",
                    illustrationType: "NoSearchResults",
                    illustrationSize: sap.m.IllustratedMessageSize.Auto
                };

                lf_setIllustMsg(oIllustMsg, oOptions);

            },
            // Events
            escapeHandler: () => { }, // esc 키 방지

        })
            .addStyleClass(sDialogId)
            .open();

        var oIllustMsg = sap.ui.getCore().byId(sIllustId);

        lf_setIllustMsg(oIllustMsg, oOptions);

        function lf_setIllustMsg(oIllustMsg, oOptions) {

            oIllustMsg.setTitle(oOptions.title || "");
            oIllustMsg.setDescription(oOptions.description || "");
            oIllustMsg.setIllustrationType(oOptions.illustrationType || "NoSearchResults");
            oIllustMsg.setIllustrationSize(oOptions.illustrationSize || sap.m.IllustratedMessageSize.Auto);

        }

    }; // end of oAPP.common.fnIllustMsgDialogOpen

    /**
     * IllustMessage Dialog Close     
     */
    oAPP.common.fnIllustMsgDialogClose = () => {

        var sDialogId = "u4aWsIllustedMsgDialog",
            oDialog = sap.ui.getCore().byId(sDialogId);

        if (!oDialog) {
            return;
        }

        oDialog.close();

    }; // end of oAPP.common.fnIllustMsgDialogClose

    /**
     * WS Header Title 변경     
     */
    oAPP.common.setWSHeadText = (sText) => {

        let oHeaderText = sap.ui.getCore().byId("u4aWsHeaderTitle");
        oHeaderText.setText(sText);

    }; // end of oAPP.common.setWSHeadText

    /**
     * White List Object 유무 확인 
     * 
     * 1. REGTYP
     *   - C : Client,
     *   - S : Server
     * 
     * 2. CHGOBJ
     *  - CTS No
     * 
     * @returns true or false
     */
    oAPP.common.checkWLOList = (REGTYP = "", CHGOBJ = "") => {

        // whiteList Object 목록을 구한다.
        let aWLO = oAPP.common.getWsWLOList();

        // Array 형식인지 여부 확인
        if (!Array.isArray(aWLO)) {
            return false;
        }

        // 전달받은 파라미터에 해당하는 White List Object가 있는지 확인
        let oFindWLO = aWLO.find((elem) => {

            if (elem.REGTYP == REGTYP && elem.CHGOBJ == CHGOBJ) {
                return true;
            }

            return false;

        });

        if (!oFindWLO) {
            return false;
        }

        return true;

    }; // end of oAPP.common.checkWLOList

    /**
     * whiteList Object 목록     
     */
    oAPP.common.getWsWLOList = () => {

        let oCoreModel = sap.ui.getCore().getModel();
        if (!oCoreModel) {
            return [];
        }

        let aWLO = oCoreModel.getProperty("/METADATA/T_REG_WLO");

        if (!aWLO) {
            return [];
        }

        // 데이터 구조가 Array 인지 체크
        if (!Array.isArray(aWLO)) {
            return [];
        }

        if (aWLO.length == 0) {
            return [];
        }

        return aWLO;

    }; // end of oAPP.common.getWsWLOList

})(window, $, oAPP);

// application 초기 정보
function ajax_init_prc(oFormData, fn_callback, fn_fail) {

    var sPath = parent.getServerPath() + '/init_prc';

    parent.setBusy('X');

    // function sendAjax(sPath, oFormData, fn_success, bIsBusy, bIsAsync, meth, fn_error, bIsBlob) {

    sendAjax(
        sPath,
        oFormData,
        (oReturn) => { // success

            if (typeof fn_callback == "function") {
                fn_callback(oReturn);
            }

        },
        null,
        null,
        null,
        (oReturn) => { // fail
            if (typeof fn_fail == "function") {
                fn_fail(oReturn);
            }
        }
    );

} // end of ajax_init_prc

// critical 오류
function fnCriticalError() {

    // 현재 같은 세션으로 떠있는 브라우저 창을 전체 닫고 내 창은 Login 페이지로 이동.
    fn_logoff_success("");

}

// JSON Parse Error
function fnJsonParseError(e) {

    zconsole.error(e);

    // JSON parse 오류 일 경우는 critical 오류로 판단하여 메시지 팝업 호출 후 창 닫게 만든다.

    // 화면 Lock 해제
    sap.ui.getCore().unlock();

    parent.setBusy("");

    // Fatal Error! Please contact your system administrator.
    let sErrmsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "192") + " \n \n " + e.toString();
    // let sErrmsg = "Critical Error 관리자에게 문의 하세요. \n\n " + e.toString();

    parent.showMessage(sap, 20, "E", sErrmsg, fnCriticalError);

}

function sendAjax(sPath, oFormData, fn_success, bIsBusy, bIsAsync, meth, fn_error, bIsBlob) {

    let oUserInfo = parent.getUserInfo(),
        oSettings = parent.WSUTIL.getWsSettingsInfo(),
        sGlobalLangu = oSettings.globalLanguage || "EN";

    /**
     * 버전, 패치 레벨 정보를 무조건 전송 -- start
     */
    if (oFormData && oFormData instanceof FormData == true) {

        oFormData.append("WSVER", oUserInfo.WSVER);
        oFormData.append("WSPATCH_LEVEL", oUserInfo.WSPATCH_LEVEL);
        oFormData.append("WSLANGU", sGlobalLangu);

    }

    if (!meth || meth !== "POST") {

        if (sPath.indexOf("?") == -1) {
            sPath += "?";
        } else {
            sPath += "&";
        }

        sPath += `WSVER=${oUserInfo.WSVER}&WSPATCH_LEVEL=${oUserInfo.WSPATCH_LEVEL}&WSLANGU=${sGlobalLangu}`;
    }

    /**
     * 버전, 패치 레벨 정보를 무조건 전송 -- END
     */


    // 접속 서버가 HTTP Only 일 경우 서버 호출 시 ID, PW를 파라미터에 붙인다.

    // if (oUserInfo && oUserInfo.HTTP_ONLY == "1") {

    //     if (oFormData && oFormData instanceof FormData == true) {

    //         oFormData.append("sap-user", oUserInfo.ID);
    //         oFormData.append("sap-password", oUserInfo.PW);
    //         oFormData.append("sap-client", oUserInfo.CLIENT);
    //         oFormData.append("sap-language", oUserInfo.LANGU);

    //     }

    //     // POST 방식이 아닐 경우 호출 URL 파라미터에 ID, PW를 붙인다.
    //     if (meth && meth !== "POST") {

    //         if (sPath.indexOf("?") == -1) {
    //             sPath += "?";
    //         } else {
    //             sPath += "&";
    //         }

    //         sPath += `sap-user=${oUserInfo.ID}&sap-password=${oUserInfo.PW}&sap-client=${oUserInfo.CLIENT}&sap-language=${oUserInfo.LANGU}`;

    //     }

    // }

    // Default Values
    var busy = 'X',
        sMeth = 'POST',
        IsAsync = true;

    // if(typeof bIsBusy !== "undefined"){
    if (bIsBusy != null) {
        // Busy Indicator 실행
        busy = bIsBusy;
    }

    parent.setBusy(busy);

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () { // 요청에 대한 콜백
        if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
            if (xhr.status === 200 || xhr.status === 201) {

                // // 화면 Lock 해제                
                // sap.ui.getCore().unlock();

                let u4a_status = xhr.getResponseHeader("u4a_status");
                if (u4a_status) {

                    parent.setBusy("");
                    oAPP.common.fnSetBusyDialog(false);

                    try {
                        var oResult = JSON.parse(xhr.response);
                    } catch (error) {
                        fnJsonParseError(error);
                        return;
                    }

                    // 잘못된 url 이거나 지원하지 않는 기능 처리
                    oAPP.common.fnUnsupportedServiceUrlCall(u4a_status, oResult);

                    return;
                }

                if (xhr.responseType == 'blob') {
                    if (typeof fn_success == "function") {
                        fn_success(xhr.response, xhr);                        
                    }

                    return;

                }

                var oReturn = xhr.response;

                if (oReturn == "") {

                    oReturn = JSON.stringify({});
                }

                try {
                    var oResult = JSON.parse(oReturn);

                } catch (e) {

                    fnJsonParseError(e);

                    return;
                }

                // Critical Error 일 경우 로그아웃 처리
                if (oResult.RETCD == "Z") {

                    // 화면 Lock 해제
                    sap.ui.getCore().unlock();

                    parent.setBusy("");

                    parent.showMessage(sap, 20, 'E', oResult.RTMSG, fnCriticalError);

                    return;

                }

                // 로그인 티켓 만료되면 로그인 페이지로 이동한다.
                if (oResult.TYPE == "E") {

                    // error 콜백이 있다면 호출
                    if (typeof fn_error == "function") {
                        fn_error();
                    }

                    // 현재 같은 세션으로 떠있는 브라우저 창을 전체 닫고 내 창은 Login 페이지로 이동.
                    fn_logoff_success('X');

                    return;

                }

                if (typeof fn_success == "function") {
                    fn_success(oResult);
                }

            } else {

                // 화면 Lock 해제
                sap.ui.getCore().unlock();

                // 서버 세션이 죽었다면 오류 메시지 뿌리고 10번 화면으로 이동한다.
                parent.setBusy('');

                // error 콜백이 있다면 호출
                if (typeof fn_error == "function") {
                    fn_error();
                }

                var sCleanHtml = parent.setCleanHtml(xhr.response);
                if (!sCleanHtml || sCleanHtml == "") {
                    sCleanHtml = "Server connection fail!!"
                }

                parent.showMessage(sap, 20, 'E', sCleanHtml, fn_callback);

                function fn_callback() {

                    // 화면에 떠있는 Dialog 들이 있을 경우 모두 닫는다.
                    oAPP.fn.fnCloseAllWs20Dialogs();

                    // 현재 같은 세션으로 떠있는 브라우저 창을 전체 닫고 내 창은 Login 페이지로 이동.
                    fn_logoff_success("");

                    // // 10번 페이지로 이동
                    // oAPP.fn.fnOnMoveToPage("WS10");

                }

            }
        }
    };

    // if(typeof meth !== "undefined"){
    if (meth != null) {
        sMeth = meth;
    }

    // if(typeof bIsAsync !== "undefined"){
    if (bIsAsync != null) {
        IsAsync = bIsAsync;
    }
    
    xhr.withCredentials = true;

    // FormData가 없으면 GET으로 전송
    xhr.open(sMeth, sPath, IsAsync);

    // blob 파일일 경우
    if (bIsBlob == 'X') {
        xhr.responseType = 'blob';
    }

    if (oFormData) {
        xhr.send(oFormData);
    } else {
        xhr.send();
    }

} // end of sendAjax

// application unlock
function ajax_unlock_app(APPID, fn_callback) {

    var sPath = parent.getServerPath() + '/unlock_app';

    var oFormData = new FormData();
    oFormData.append('APPID', APPID);

    sendAjax(sPath, oFormData, (oReturn) => {

        if (typeof fn_callback == "function") {
            fn_callback(oReturn);
        }

    });

} // end of ajax_unlock_app

// 로그오프 성공시 타는 펑션
function fn_logoff_success(TYPE) {

    if (!TYPE) {

        parent.setBusy("");

        fnSessionTimeOutDialogOk();

        return;
    }

    if (TYPE == "X") {

        let sTitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D85"), // Session Timeout
            sDesc = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "349"), // Please Try Login Again!
            sIllustType = "tnt-SessionExpired",
            sIllustSize = sap.m.IllustratedMessageSize.Dialog;

        parent.IPCRENDERER.send('if-browser-close', {
            ACTCD: "A", // 나를 제외한 나머지는 다 죽인다.
            SESSKEY: parent.getSessionKey(),
            BROWSKEY: parent.getBrowserKey()
        });

        oAPP.fn.fnShowIllustMsgDialog(sTitle, sDesc, sIllustType, sIllustSize, fnSessionTimeOutDialogOk);

        parent.setBusy("");

        return;

    }

    parent.setBusy("");

    // 브라우저 창 다 죽인다.    
    fnServerSessionClose();

} // end of fn_logoff_success

function fnServerSessionClose() {

    /**
     * Flow Logic..
     * 
     *	1. 현재 떠있는 창이 몇개 있는지 확인한다. 
     *	2. 내가 아닌 다른 창은 다 닫는다.
     *	3. 나는 로그인 화면으로 전환한다.
     */

    parent.IPCRENDERER.send('if-browser-close', {
        ACTCD: "A", // 나를 제외한 나머지는 다 죽인다.
        SESSKEY: parent.getSessionKey(),
        BROWSKEY: parent.getBrowserKey()
    });

    oAPP.main.fnDetachBeforeunloadEvent();

    // 현재 세션에서 파생된 Childwindow를 닫는다.
    oAPP.fn.fnChildWindowClose(); // #[ws_fn_02.js]

    if (oAPP.attr._oWorker && oAPP.attr._oWorker.terminate) {
        oAPP.attr._oWorker.terminate();
        delete oAPP.attr._oWorker;
    }

    if (oAPP.attr._oServerWorker && oAPP.attr._oServerWorker) {
        oAPP.attr._oServerWorker.terminate();
        delete oAPP.attr._oServerWorker;
    }

    // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
    // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
    oAPP.main.fnBeforeunload("X");

}

function fnSessionTimeOutDialogOk() {

    // // 로그인페이지로 이동..			
    // parent.onMoveToPage("LOGIN");

    // 브라우저 창 다 죽인다.    
    fnServerSessionClose();

}

// 어플리케이션 생성 후 체인지 모드로 가는 펑션
function onAppCrAndChgMode(sAppID) {

    var oAppInput = sap.ui.getCore().byId("AppNmInput"),
        oChgModeBtn = sap.ui.getCore().byId("appChangeBtn");

    if (!oAppInput && !oChgModeBtn) {
        return;
    }

    sAppID = sAppID.toUpperCase();

    oAppInput.setValue(sAppID);
    oChgModeBtn.firePress();

} // end of onAppCrAndChgMode

// Property Help Popup
function fn_PropHelpPopup(sUrl) {

    // busy 키고 Lock 걸기
    oAPP.common.fnSetBusyLock("X");

    oAPP.fn.fnPropertyHelpPopup(sUrl);

}

async function sendServerExit(oOptions, fnCallback) {

    var sUrl = oOptions.URL,
        oFormData = oOptions.FORMDATA;

    // let oLogInData = parent.getUserInfo();
    // if (oLogInData.HTTP_ONLY == "1") {

    //     sUrl += `?sap-user=${oLogInData.ID}&sap-password=${oLogInData.PW}&sap-client=${oLogInData.CLIENT}&sap-language=${oLogInData.LANGU}`;

    //     // // formdata가 있을 경우
    //     // if (oFormData) {         
    //     //     sUrl += `?sap-user=${oLogInData.ID}&sap-password=${oLogInData.PW}&sap-client=${oLogInData.CLIENT}&sap-language=${oLogInData.LANGU}`;
    //     //     // oFormData.append("sap-user", oLogInData.ID);
    //     //     // oFormData.append("sap-password", oLogInData.PW);
    //     //     // oFormData.append("sap-client", oLogInData.CLIENT);
    //     //     // oFormData.append("sap-language", oLogInData.LANGU);
    //     // } else {
    //     //     // formdate가 없으면 url에 ID,PW를 파라미터로 전송
    //     //     sUrl += `?sap-user=${oLogInData.ID}&sap-password=${oLogInData.PW}&sap-client=${oLogInData.CLIENT}&sap-language=${oLogInData.LANGU}`;
    //     // }

    // }

    parent.setBusy('X');

    if (oFormData && oFormData.get) {
        var Url = sUrl + "?APPID=" + oFormData.get("APPID") + "&SSID=" + oFormData.get("SSID");
        navigator.sendBeacon(Url);
    } else {
        //비콘 날려 
        // var Url = sUrl + "?APPID=" + oFormData.get("APPID") + "&SSID=" + oFormData.get("SSID");

        navigator.sendBeacon(sUrl);
    }

    await oAPP.common.fnSleep(500);

    if (typeof fnCallback === "function") {
        fnCallback();
    }

    return;

    var xhttp = new XMLHttpRequest();

    xhttp.timeout = 30000;
    xhttp.onload = (e) => {
        if (typeof fnCallback === "function") {
            fnCallback(this);
        }
    };
    xhttp.onerror = (e) => {
        if (typeof fnCallback === "function") {
            fnCallback(this);
        }
    };
    xhttp.ontimeout = () => {
        if (typeof fnCallback === "function") {
            fnCallback(this);
        }
    };

    /*
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {

            if (typeof fnCallback === "function") {
                fnCallback(this);
            }

        }
    };
    */

    xhttp.open("POST", sUrl, true);

    xhttp.withCredentials = true;

    if (oFormData instanceof FormData == true) {
        xhttp.send(oFormData);
        return;
    }

    xhttp.send();

};


// zconsole.log = (sConsole) => {

//     const
//         APP = zconsole.APP;

//     // 빌드 상태에서는 실행하지 않음.
//     if (APP.isPackaged) {
//         return;
//     }

//     zconsole.log("[zconsole]: " + sConsole);

// };

// zconsole.error = (sConsole) => {

//     const
//         APP = zconsole.APP;

//     // 빌드 상태에서는 실행하지 않음.
//     if (APP.isPackaged) {
//         return;
//     }

//     zconsole.error("[zconsole]: " + sConsole);

// };

// zconsole.warn = (sConsole) => {

//     const
//         APP = zconsole.APP;

//     // 빌드 상태에서는 실행하지 않음.
//     if (APP.isPackaged) {
//         return;
//     }

//     zconsole.warn("[zconsole]: " + sConsole);

// };