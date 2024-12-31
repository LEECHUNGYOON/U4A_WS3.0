/**************************************************************************
 * ws_fn_ipc.js
 **************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        IPCRENDERER = parent.IPCRENDERER,
        APPCOMMON = oAPP.common;

    /************************************************************************
     * Electron IPCMAIN의 세션 타임 체크 관련 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_if_session_time = function (event, res) {

        let iSessionTime = oAPP.attr.iSessionTimeout; // 세션 타임아웃 시간        

        let sSessionKey = parent.getSessionKey();
        if (sSessionKey != res) {
            return;
        }

        zconsole.log("시작!! -> " + Math.floor(+new Date() / 1000));

        if (oAPP.attr._oWorker) {

            oAPP.attr._oWorker.postMessage(iSessionTime);

        }

    }; // end of oAPP.fn.fnIpcMain_if_session_time

    /************************************************************************
     *  Electron IPCMAIN의 Exam 팝업에서 샘플 리스트의 WorkBench Move 버튼 실행 시 수행 되는 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_if_exam_move = function (event, res) {

        zconsole.log("fnIpcMain_if_exam_move");

        let oMsg = res,
            MODE = oMsg.MODE,
            sAppID = oMsg.APPID,
            BROWSERKEY = parent.getBrowserKey();

        // 다른 브라우저에서 실행한 이벤트면 리턴 시킨다.
        if (res.BROWSERKEY != BROWSERKEY) {
            return;
        }

        switch (MODE) {
            case "A": // 브라우저 띄우기

                oAPP.fn.fnOnExecApp(sAppID);

                break;

            case "B": // WS 디자인 영역으로 이동

                // onAppCrAndChgMode(sAppID);

                // 샘플에 대한 WS20 페이지 이동
                oAPP.fn.fnExamMoveToPageWs20(sAppID);

                break;
        }

    }; // end of oAPP.fn.fnIpcMain_if_exam_move

    /************************************************************************
     * Error Page Popup의 Table Click Event
     ************************************************************************/
    oAPP.fn.fnIpcMain_errmsg_click = (event, res) => {

        let oRowData = res.oRowData;

        switch (oRowData.GRCOD) {

            case "CLS_SNTX":
            case "METH":
            case "CLSD":
            case "CPRO":
            case "CPUB":
            
            // 2024-07-29 v3.4.2-sp2 
            // 오류 항목 유형 추가
            case "CPRI":

                oAPP.common.execControllerClass(oRowData.OBJID, oRowData.LINE);
                return;

            default:

                oAPP.fn.setSelectTreeItem(oRowData.OBJID, oRowData.UIATK, oRowData.TYPE);
                return;

        }

    }; // end of oAPP.fn.fnIpcMain_errmsg_click

    /************************************************************************
     * Application Import 성공시 타는 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_export_import_IMPORT = (event, res) => {

        debugger;
        
        // 페이지 이동 처리..
        onAppCrAndChgMode(res.APPID);

        // 푸터 메시지
        oAPP.common.fnShowFloatingFooterMsg("S", "WS20", res.RTMSG);

    }; // end of oAPP.fn.fnIpcMain_export_import_IMPORT

    /************************************************************************
     * Application Export 성공시 타는 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_export_import_EXPORT = (event, res) => {

        // oAPP.ipcRenderer.send(`${oAPP.BROWSKEY}--export_import-EXPORT`, { RETCD: "S", RTMSG: Lmsg });

        let sCurrPage = parent.getCurrPage();

        // 푸터 메시지
        oAPP.common.fnShowFloatingFooterMsg(res.RETCD, sCurrPage, res.RTMSG);

    }; // end of oAPP.fn.fnIpcMain_export_import_EXPORT

    /************************************************************************
     * IPC MAIN Attach Event
     ************************************************************************/
    oAPP.fn.fnIpcMain_Attach_Event_Handler = () => {

        oAPP.attr.aSessionKeys = [];

        let BROWSKEY = parent.getBrowserKey();

        // EXAM MOVE 이벤트
        parent.IPCMAIN.on("if-exam-move", oAPP.fn.fnIpcMain_if_exam_move);

        // 여러창일때 나를 제외한 윈도우를 닫고 싶을때 
        parent.IPCMAIN.on('if-browser-close', oAPP.fn.fnIpcMain_if_browser_close);

        // 전체 브라우저에 공통으로 타는 DragEnd 이벤트
        parent.IPCMAIN.on('if-dragEnd', oAPP.fn.fnIpcMain_if_DragEnd);

        // // 여러창일때 나를 제외한 윈도우를 닫고 싶을때 
        // parent.IPCMAIN.on('if-browser-close', oAPP.fn.fnIpcMain_if_browser_close);

        // 브라우저간 IPC 통신
        parent.IPCMAIN.on('if-browser-interconnection', oAPP.fn.fnIpcMain_browser_interconnection);

        // 부모로 부터 접속 환경 정보 구하기
        parent.IPCMAIN.on(`if-get-sys-info-${BROWSKEY}`, oAPP.fn.fnIpcMain_if_get_sys_info);

        // 액션별 명령어 수행
        parent.IPCMAIN.on(`if-send-action-${BROWSKEY}`, oAPP.fn.fnIpcMain_if_send_action);
        
    }; // end of oAPP.fn.fnIpcMain_Attach_Event_Handler

    /************************************************************************
     * IPC MAIN Detach Event
     ************************************************************************/
    oAPP.fn.fnIpcMain_Detach_Event_Handler = () => {

        let BROWSKEY = parent.getBrowserKey();

        // 화면 잠겼을때 세션타임 아웃 이벤트 해제
        parent.IPCMAIN.off('if-session-time', oAPP.fn.fnIpcMain_if_session_time);

        // EXAM MOVE 이벤트 해제
        parent.IPCMAIN.off('if-exam-move', oAPP.fn.fnIpcMain_if_exam_move);

        // DragEnd 이벤트 해제
        parent.IPCMAIN.off('if-dragEnd', oAPP.fn.fnIpcMain_if_DragEnd);

        // 여러창일때 나를 제외한 윈도우를 닫고 싶을때 이벤트 해제 
        parent.IPCMAIN.off('if-browser-close', oAPP.fn.fnIpcMain_if_browser_close);

        // 브라우저간 IPC 통신
        parent.IPCMAIN.off('if-browser-interconnection', oAPP.fn.fnIpcMain_browser_interconnection);

        // 부모로 부터 접속 환경 정보 구하기
        parent.IPCMAIN.off(`if-get-sys-info-${BROWSKEY}`, oAPP.fn.fnIpcMain_if_get_sys_info);
        
        // 부모 자식간 액션별 명령어 수행
        parent.IPCMAIN.off(`if-send-action-${BROWSKEY}`, oAPP.fn.fnIpcMain_if_send_action);

    };

    /************************************************************************
     * 전체 브라우저에 공통으로 타는 DragEnd 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_if_DragEnd = (event, res) => {

        zconsole.log("Fire!! oAPP.fn.fnIpcMain_if_DragEnd");

        oAPP.main.onDragend();

    }; // end of oAPP.fn.fnIpcMain_if_DragEnd

    oAPP.fn.fnIpcMain_if_browser_close = (event, res) => {

        var oCurrWin = parent.CURRWIN,
            sType = res.ACTCD,
            sCurrSessionKey = parent.getSessionKey(),
            sCurrBrowsKey = parent.getBrowserKey();

        if (res.SESSKEY !== sCurrSessionKey) {
            return;
        }

        switch (sType) {

            case "A": // 같은 세션 키를 가진 브라우저 중 나를 제외한 나머지 창을 전부 닫기

                if (sCurrBrowsKey == res.BROWSKEY) {
                    return;
                }

                // onBeforeunload event 해제
                oAPP.main.fnDetachBeforeunloadEvent();

                // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
                // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
                oAPP.main.fnBeforeunload();

                break;


            case "B": // 같은 세션 키를 가진 브라우저 중, 전달받은 키가 나와 같으면 나만 죽인다.

                if (sCurrBrowsKey !== res.BROWSKEY) {
                    return;
                }

                // onBeforeunload event 해제
                oAPP.main.fnDetachBeforeunloadEvent();

                // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
                // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
                oAPP.main.fnBeforeunload();

                oCurrWin.close();

                break;

            case "C": // 같은 세션을 가진 브라우저 중 로그오프가 된 브라우저의 키를 수집한다.

                var aSameBrowsers = oAPP.fn.fnGetSameBrowsersAll(), // #[ws_fn_02.js]
                    iSameBrowserLength = aSameBrowsers.length;

                oAPP.attr.aSessionKeys.push(res.BROWSKEY);

                var iSessionKeyLength = oAPP.attr.aSessionKeys.length;

                zconsole.log(`같은 브라우저 총 갯수 : ${iSameBrowserLength} `);
                zconsole.log(`수집된 키 총 갯수 : ${iSessionKeyLength} `);

                if (iSameBrowserLength != iSessionKeyLength) {
                    return;
                }

                zconsole.log("전체 키 수집!!!");

                // 현재 떠있는 브라우저 갯수와 수집된 브라우저 키의 갯수가 동일 하다면..
                if (iSessionKeyLength == 1) {

                    fn_logoff_success("X");

                    return;

                }

                var aSortKeys = oAPP.attr.aSessionKeys.sort(),
                    sChoiceKey = aSortKeys[0];

                parent.IPCRENDERER.send('if-browser-close', {
                    ACTCD: "A", // 나를 제외한 나머지는 다 죽인다.
                    SESSKEY: parent.getSessionKey(),
                    BROWSKEY: sChoiceKey
                });

                // beforeUnload 이벤트 해제
                oAPP.main.fnDetachBeforeunloadEvent();

                // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
                // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
                oAPP.main.fnBeforeunload();

                // 브라우저에 내장된 세션 정보를 클리어 한다.
                oAPP.fn.fnClearSessionStorageData(); // #[ws_fn_04.js]

                // 현재 세션에서 파생된 Childwindow를 닫는다.
                oAPP.fn.fnChildWindowAllClose();
                // oAPP.fn.fnChildWindowClose();

                if (oAPP.attr._oWorker && oAPP.attr._oWorker.terminate) {
                    oAPP.attr._oWorker.terminate();
                    delete oAPP.attr._oWorker;
                }

                if (oAPP.attr._oServerWorker && oAPP.attr._oServerWorker) {
                    oAPP.attr._oServerWorker.terminate();
                    delete oAPP.attr._oServerWorker;
                }

                let sTitle = "Session Timeout",
                    sDesc = "Please Try Login Again!",
                    sIllustType = "tnt-SessionExpired",
                    sIllustSize = sap.m.IllustratedMessageSize.Dialog;

                oAPP.fn.fnShowIllustMsgDialog(sTitle, sDesc, sIllustType, sIllustSize, fnSessionTimeOutDialogOk);

                break;

            default:
                break;

        }


    };

    /************************************************************************
     * 전체 브라우저에 공통으로 타는 DragEnd 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_cdn_save = function (oEvent, oRes) {

        let BROWSKEY = oRes.BROWSKEY,
            ISCDN = oRes.ISCDN;

        parent.setIsCDN(ISCDN);

        oEvent.reply(`${BROWSKEY}-cdn-save-callback`, {
            RETCD: "S",
            RTMSG: "Success!",
            ISCDN: ISCDN
        });

    }; // end of oAPP.fn.fnIpcMain_cdn_save

    /************************************************************************
     * 전체 브라우저간 통신
     ************************************************************************/
    oAPP.fn.fnIpcMain_browser_interconnection = (oEvent, oRes) => {

        let PRCCD = oRes.PRCCD;

        switch (PRCCD) {
            case "01": // [컨트롤러 클래스 눌렀을 때 팝업] 같은 SYSID & CLIENT에 ILLUST 메시지 팝업 오픈

                oAPP.fn.fnIpcMain_browser_interconnection_01(oRes);

                return;

            case "02": // [컨트롤러 클래스 눌렀을 때 팝업] 같은 SYSID & CLIENT에 ILLUST 메시지 팝업 닫기

                oAPP.fn.fnIpcMain_browser_interconnection_02(oRes);

                return;

            case "03": // [컨트롤러 클래스 눌렀을 때 팝업] 같은 SYSID & CLIENT에 ILLUST 메시지 변경

                oAPP.fn.fnIpcMain_browser_interconnection_03(oRes);

                return;

            case "04": // 전체 윈도우를 강제로 닫을 경우

                oAPP.fn.fnIpcMain_browser_interconnection_04(oRes);

                return;

            default:
                break;
        }

    }; // end of oAPP.fn.fnIpcMain_browser_interconnection

    /************************************************************************
     * 전체 브라우저간 통신
     * **********************************************************************
     * # PRCCD: 01 
     *   - 컨트롤러 클래스 버튼 눌렀을 때, 같은 SYSID & CLIENT에 ILLUST 메시지 팝업 오픈
     ************************************************************************/
    oAPP.fn.fnIpcMain_browser_interconnection_01 = (oRes) => {

        let oServerInfo = parent.getServerInfo(),
            SYSID = oRes.SYSID,
            CLIENT = oRes.CLIENT,
            OPTIONS = oRes.OPTIONS;

        if (oServerInfo.SYSID !== SYSID || oServerInfo.CLIENT !== CLIENT) {
            return;
        }

        APPCOMMON.fnIllustMsgDialogOpen(OPTIONS);

    }; // end of oAPP.fn.fnIpcMain_browser_interconnection_01

    /************************************************************************
     * 전체 브라우저간 통신
     * **********************************************************************
     * # PRCCD: 02 
     *   - 컨트롤러 클래스 버튼 눌렀을 때, 같은 SYSID & CLIENT에 ILLUST 메시지 팝업 닫기
     ************************************************************************/
    oAPP.fn.fnIpcMain_browser_interconnection_02 = (oRes) => {

        let oServerInfo = parent.getServerInfo(),
            SYSID = oRes.SYSID,
            CLIENT = oRes.CLIENT;

        if (oServerInfo.SYSID !== SYSID || oServerInfo.CLIENT !== CLIENT) {
            return;
        }

        APPCOMMON.fnIllustMsgDialogClose();

    }; // end of oAPP.fn.fnIpcMain_browser_interconnection_01

    /************************************************************************
     * 전체 브라우저간 통신
     * **********************************************************************
     * # PRCCD: 03
     *   - 컨트롤러 클래스 버튼 눌렀을 때, 같은 SYSID & CLIENT에 ILLUST 메시지 변경
     ************************************************************************/
    oAPP.fn.fnIpcMain_browser_interconnection_03 = (oRes) => {

        let oServerInfo = parent.getServerInfo(),
            SYSID = oRes.SYSID,
            CLIENT = oRes.CLIENT,
            sMsg = oRes.MSG;

        if (oServerInfo.SYSID !== SYSID || oServerInfo.CLIENT !== CLIENT) {
            return;
        }

        let oIllustMsg = sap.ui.getCore().byId("u4aWsIllustedMsg");

        if (oIllustMsg) {
            oIllustMsg.setDescription(sMsg);
        }

    }; // end of oAPP.fn.fnIpcMain_browser_interconnection_03

    /************************************************************************
     * 전체 브라우저간 통신
     * **********************************************************************
     * # PRCCD: 04
     *   - 전체 브라우저 닫기
     ************************************************************************/
    oAPP.fn.fnIpcMain_browser_interconnection_04 = (oRes) => {

        // onBeforeunload event 해제
        oAPP.main.fnDetachBeforeunloadEvent();

        // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
        // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
        oAPP.main.fnBeforeunload();


    }; // end of oAPP.fn.fnIpcMain_browser_interconnection_04

    /************************************************************************
     * 접속환경 정보 구하기
     ************************************************************************/
    oAPP.fn.fnIpcMain_if_get_sys_info = function(oEvent, oPARAM){    

        let APPPATH     = parent.REMOTE.app.getAppPath();
        let PATHINFOURL = parent.PATH.join(APPPATH, "Frame", "pathInfo.js");
        let PATHINFO    = parent.require(PATHINFOURL);

        let sIpcModulePath = parent.PATH.join(PATHINFO.JS_ROOT, "ipc", "assist", "sys_info_assist.js");
        let oASSIST = parent.require(sIpcModulePath);

        if(!oASSIST[oPARAM.PRCCD]){
            return;
        }

        try {
            
            oASSIST[oPARAM.PRCCD](oEvent, oPARAM);

        } catch (error) {

            console.error("[ws_fn_ipc.js] oAPP.fn.fnIpcMain_if_get_sys_info --- Start");
            console.error(error);            
            console.error("[ws_fn_ipc.js] oAPP.fn.fnIpcMain_if_get_sys_info --- End");

            return;
        }

    }; // end of oAPP.fn.fnIpcMain_if_get_sys_info


    /************************************************************************
     * 액션별 명령어 수행
     ************************************************************************ 
     * @param {} oEvent 
     * @param {Object} oPARAM 
     * {
     *    ACTCD : 명령어 수행할 ACTION CODE
     * }     
     *************************************************************************/
    oAPP.fn.fnIpcMain_if_send_action = async function(oEvent, oPARAM){

        if(typeof oPARAM !== "object"){
            return;
        }

        let APPPATH     = parent.REMOTE.app.getAppPath();
        let PATHINFOURL = parent.PATH.join(APPPATH, "Frame", "pathInfo.js");
        let PATHINFO    = parent.require(PATHINFOURL);

        let sIpcModulePath = parent.PATH.join(PATHINFO.JS_ROOT, "ipc", "assist", "send_action_assist.js");

        let oASSIST = await import(sIpcModulePath);
    
        if(!oASSIST[oPARAM.ACTCD]){
            return;
        }

        try {
            
            oASSIST[oPARAM.ACTCD](oEvent, oPARAM);

        } catch (error) {

            console.error("[ws_fn_ipc.js] oAPP.fn.fnIpcMain_if_send_action --- Start");
            console.error(error);            
            console.error("[ws_fn_ipc.js] oAPP.fn.fnIpcMain_if_send_action --- End");

            return;
        }


    }; // end of oAPP.fn.fnIpcMain_if_send_action

})(window, $, oAPP);