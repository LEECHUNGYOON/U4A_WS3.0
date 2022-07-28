/**************************************************************************                                           
 * ws_fn_04.js
 **************************************************************************/
(function(window, $, oAPP) {
    "use strict";

    var PATH = parent.PATH,
        APP = parent.APP,
        APPPATH = parent.APPPATH;

    // REMOTE = parent.REMOTE,
    // REMOTEMAIN = parent.REMOTEMAIN,
    // APPCOMMON = oAPP.common,
    // CURRWIN = REMOTE.getCurrentWindow(),
    // SESSKEY = parent.getSessionKey(),
    // BROWSKEY = parent.getBrowserKey(),
    // IPCMAIN = REMOTE.require('electron').ipcMain;

    /************************************************************************
     * SAP GUI 멀티 로그인 체크
     ************************************************************************/
    oAPP.fn.fnSapGuiMultiLoginCheck = () => {

        return new Promise((resolve, reject) => {

            var sPath = parent.getServerPath() + '/chk_mlogin_of_gui',
                oUserInfo = parent.getUserInfo(),
                sId = oUserInfo.ID.toUpperCase(),
                sPw = oUserInfo.PW,
                sComputerName = parent.COMPUTERNAME;

            var oFormData = new FormData();
            oFormData.append("sap-user", sId);
            oFormData.append("sap-password", sPw);
            oFormData.append("PC_NAME", sComputerName);
            
            sendAjax(
                sPath,
                oFormData,
                (oResult) => { // success

                    if (oResult.RETCD == "E") {

                        reject(oResult);
                        return;
                    }

                    resolve(oResult);

                },
                true, // is Busy
                true, // bIsAsync
                "POST" // meth
            );

        });

    }; // end of oAPP.fn.fnSapGuiMultiLoginCheck

    /************************************************************************
     * SAP GUI 멀티 로그인 체크 성공시
     ************************************************************************/
    oAPP.fn.fnSapGuiMultiLoginCheckThen = function(oResult) {

        var oSettingsPath = PATH.join(APPPATH, "settings") + "\\ws_settings.json",
            oSettings = parent.require(oSettingsPath),
            oVbsInfo = oSettings.vbs,
            sVbsPath = oVbsInfo.rootPath,
            sVbsFileName = oVbsInfo.controllerClassVbs,
            sNewSessionVbs = oVbsInfo.newSessionVbs,
            sAppPath = APP.getPath("userData"),
            sVbsFullPath = PATH.join(sAppPath, sVbsPath, sVbsFileName),
            sNewSessionVbsFullPath = PATH.join(sAppPath, sVbsPath, sNewSessionVbs);

        var oServerInfo = parent.getServerInfo(),
            oAppInfo = parent.getAppInfo(),
            oUserInfo = parent.getUserInfo();

        if (!oAppInfo) {
            return;
        }

        var METHNM = this.METHNM,
            INDEX = this.INDEX,
            TCODE = this.TCODE;

        var aParam = [
            sNewSessionVbsFullPath, // VBS 파일 경로
            oServerInfo.SYSTEMID, // SYSTEM ID  
            oServerInfo.CLIENT, // CLIENT
            oUserInfo.ID.toUpperCase(), // SAP ID    
            oAppInfo.APPID, // Application Name
            (typeof METHNM == "undefined" ? "" : METHNM),
            (typeof INDEX == "undefined" ? "0" : INDEX),
            oAppInfo.IS_EDIT, // Edit or Display Mode
            TCODE || "", // T-CODE
            // oResult.RTVAL, // SAPGUI Multi Login Check Value
            oResult.MAXSS, // 최대 세션창 갯수
        ];

        //1. 이전 GUI 세션창 OPEN 여부 VBS 
        var vbs = parent.SPAWN('cscript.exe', aParam);
        vbs.stdout.on("data", function(data) {});

        //GUI 세션창이 존재하지않다면 ...
        vbs.stderr.on("data", function(data) {

            //VBS 리턴 오류 CODE / MESSAGE 
            var str = data.toString(),
                Tstr = str.split(":"),
                len = Tstr.length - 1;

            if (len !== 0) {

                str = Tstr[len];
                if (str.indexOf("|") != -1) {
                    return;
                }

            }

            var aParam = [
                sVbsFullPath, // VBS 파일 경로
                oServerInfo.SERVERIP, // Server IP
                oServerInfo.SYSTEMID, // SYSTEM ID
                oServerInfo.INSTANCENO, // INSTANCE Number
                oServerInfo.CLIENT, // CLIENT
                oUserInfo.ID.toUpperCase(), // SAP ID    
                oUserInfo.PW, // SAP PW
                oServerInfo.LANGU, // LANGUAGE
                oAppInfo.APPID, // Application Name
                (typeof METHNM == "undefined" ? "" : METHNM),
                (typeof INDEX == "undefined" ? "0" : INDEX),
                oAppInfo.IS_EDIT, // Edit or Display Mode,
                TCODE || "", // T-CODE
                oResult.RTVAL, // SAPGUI Multi Login Check Value
                oResult.MAXSS, // 최대 세션창 갯수
            ];

            var vbs = parent.SPAWN('cscript.exe', aParam);
            vbs.stdout.on("data", function(data) {});
            vbs.stderr.on("data", function(data) {

                //VBS 리턴 오류 CODE / MESSAGE 
                var str = data.toString(),
                    Tstr = str.split(":"),
                    len = Tstr.length - 1;

                if (len !== 0) {

                    str = Tstr[len];

                    if (str.indexOf("|") != -1) {
                        return;
                    }

                }

            });

        });

    }; // end of oAPP.fn.fnSapGuiMultiLoginCheckThen

    /************************************************************************
     * 브라우저에 내장된 세션 정보를 클리어 한다.
     ************************************************************************/
    oAPP.fn.fnClearSessionStorageData = () => {

        var currwin = parent.CURRWIN,
            webcon = currwin.webContents,
            sess = webcon.session;

        sess.clearStorageData([]);

    }; // end of oAPP.fn.fnClearSessionStorageData

    /************************************************************************
     * TCODE Suggestion 구성
     ************************************************************************/
    oAPP.fn.fnOnInitTCodeSuggestion = () => {

        let sSuggName = "tcode";

        var aSuggData = oAPP.fn.fnSuggestionRead(sSuggName);

        if (aSuggData instanceof Array == false) {
            oAPP.fn.fnSuggestionSave(sSuggName, []);

            return;
        }

        oAPP.common.fnSetModelProperty("/SUGG/TCODE", aSuggData);

    }; // end of oAPP.fn.fnOnInitTCodeSuggestion

})(window, $, oAPP);