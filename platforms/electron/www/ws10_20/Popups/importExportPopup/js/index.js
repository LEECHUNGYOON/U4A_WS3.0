const oAPP = {
    common: {},
    onStart: function () {
        this.remote = require('@electron/remote');
        this.ipcRenderer = require('electron').ipcRenderer;
        this.fs = this.remote.require('fs');
        this.path = this.remote.require('path');
        this.oWIN = oAPP.remote.getCurrentWindow();
        this.FilePath = "";
        this.APPID = "";
        this.SERVPATH = "";
        this.BROWSKEY = "";
        this.CURRWIN = this.remote.getCurrentWindow();
        this.SHELL = this.remote.shell;
        this.oIMG = document.getElementById("LOAD_IMG");

        //WS Main 에서 호출받은 기본 I/F Data 
        this.ipcRenderer.on('export_import-INITDATA', (event, IF_DATA) => {

            this.BROWSKEY = IF_DATA.BROWSKEY;
            this.SERVPATH = IF_DATA.SERVPATH;
            this.USERINFO = IF_DATA.USERINFO;

            switch (IF_DATA.PRCCD) {
                case "IMPORT": // U4A Application 등록 
                    oAPP.onIMPORT();
                    break;

                case "EXPORT": // U4A Application 다운
                    oAPP.onEXPORT(IF_DATA.APPID);
                    break;

                default:
                    oAPP.oWIN.close();
                    break;
            }


        });

        /*******************************************************
         * 메시지클래스 텍스트 작업 관련 Object -- start
         *******************************************************/
        const
            REMOTE = oAPP.remote,
            PATH = REMOTE.require('path'),
            CURRWIN = REMOTE.getCurrentWindow(),
            WEBCON = CURRWIN.webContents,
            WEBPREF = WEBCON.getWebPreferences(),
            USERINFO = WEBPREF.USERINFO,
            APP = REMOTE.app,
            APPPATH = APP.getAppPath(),
            LANGU = USERINFO.LANGU,
            SYSID = USERINFO.SYSID,
            PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js"));

        const
            WSUTILPATH = PATH.join(PATHINFO.WSUTIL),
            WSUTIL = require(WSUTILPATH),
            WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

        oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

        /*******************************************************
         * 메시지클래스 텍스트 작업 관련 Object -- end
         *******************************************************/


    },
    onIMPORT: () => {
        //======================================================//
        // U4A Application 등록 
        //======================================================//  

        //로딩 이미지 활성
        oAPP.oIMG.src = "img/flying.gif";
        oAPP.oIMG.style.width = "350px";
        oAPP.oIMG.style.display = "";

        let options = {
            // See place holder 1 in above image
            title: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D36"), // U4A Application Import

            // See place holder 4 in above image
            filters: [{
                name: 'U4A Application',
                extensions: ['u4a', 'U4A']
            }],
            properties: ['openFile']
        };

        //file 선택 팝업 실행 
        oAPP.remote.dialog.showOpenDialog(oAPP.oWIN, options).then(result => {

            if (result.canceled) {
                oAPP.oWIN.close();
                return;
            }

            oAPP.FilePath = result.filePaths[0];

            //upload 
            oAPP.fs.readFile(oAPP.FilePath, null, function (err, data) {

                if (err) {

                    let sErrMsg1 = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "337"), // An error has occurred
                        sErrMsg2 = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "339"); // There is a problem with the uploaded file.
                    sErrMsg2 += " " + oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "338"); // Please try again

                    oAPP.remote.dialog.showErrorBox(sErrMsg1, sErrMsg2);
                    oAPP.oWIN.close();
                    return;

                }

                let oSettings = WSUTIL.getWsSettingsInfo();                

                let sUrlParam = `app_export_import?ACTCD=IMPORT&WSVER=${oSettings.appVersion}&WSPATCH_LEVEL=${oSettings.patch_level}`;

                let sURL = oAPP.path.join(oAPP.SERVPATH, sUrlParam),
                    oformData = new FormData();

                var oBin = new Blob([Buffer.from(data)]);
                oformData.append('files', oBin, oAPP.path.basename(oAPP.FilePath));
                oBin = null;

                // // 로그인 정보가 있을 경우
                // let oLogInData = oAPP.USERINFO;
                // if (oLogInData && oLogInData.HTTP_ONLY == "1") {

                //     sURL += `&sap-user=${oLogInData.ID}&sap-password=${oLogInData.PW}&sap-client=${oLogInData.CLIENT}&sap-language=${oLogInData.LANGU}`;

                // }

                // debugger;

                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {

                    if (xhr.readyState == XMLHttpRequest.DONE) {

                        let sErrMsg1 = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "337"); // An error has occurred

                        try {
                            //서버에서 요청받은 Data 
                            var sData = JSON.parse(xhr.response);

                            //오류 발생?
                            if (sData.RETCD !== "S") {
                                // if (sData.RETCD === "E") {

                                oAPP.remote.dialog.showErrorBox(sErrMsg1, sData.RTMSG);
                                oAPP.oWIN.close();
                                return;
                            }

                        } catch (e) {
                            //오류 발생?

                            let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "340"); // During Application Import, a server response error occurred.

                            oAPP.remote.dialog.showErrorBox(sErrMsg1, sMsg);
                            oAPP.oWIN.close();
                            return;

                        }

                        //정상처리 메시지 
                        oAPP.ipcRenderer.send(`${oAPP.BROWSKEY}--export_import-IMPORT`, {
                            APPID: sData.APPID,
                            RTMSG: sData.RTMSG
                        });

                        //창 종료 
                        setTimeout(() => {
                            oAPP.oWIN.close();
                            return;
                        }, 500);


                    }

                };

                xhr.open('POST', sURL, true);
                xhr.send(oformData);


            });


        }).catch(err => {
            console.log("APP Import Error", err);
            oAPP.oWIN.close();
            return;

        });


    },
    onEXPORT: (APPID) => {
        //======================================================//
        // U4A Application 다운
        //======================================================// 

        if (APPID === "") {

            let sErrMsg1 = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "337"), // An error has occurred
                sErrMsg2 = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "341"); // Select the download target application ID.

            oAPP.remote.dialog.showErrorBox(sErrMsg1, sErrMsg2);
            oAPP.oWIN.close();
            return;

        }

        //로딩 이미지 활성
        oAPP.oIMG.src = "img/flying.gif";
        oAPP.oIMG.style.width = "350px";
        oAPP.oIMG.style.display = "";

        //Application ID 광역 할당 
        oAPP.APPID = APPID;

        let sTitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D37"); // U4A Application Export

        // 디렉토리 선택 팝업 옵션 설정 
        let options = {
            // See place holder 1 in above image
            title: sTitle + " - " + oAPP.APPID,

            // 폴더 
            properties: ['openDirectory', '']
        };

        //file 선택 팝업 실행 
        oAPP.remote.dialog.showOpenDialog(oAPP.oWIN, options).then(result => {

            if (result.canceled) {
                oAPP.oWIN.close();
                return;
            }

            //저장 파일 경로 설정 
            oAPP.FilePath = result.filePaths[0];
            oAPP.FilePath = oAPP.path.join(oAPP.FilePath, `${oAPP.APPID}.U4A`);

            try {
                oAPP.fs.statSync(oAPP.FilePath);
                var IsfileExt = true;
            } catch (error) {
                var IsfileExt = false;

            }

            //기존 파일이 존재한다면 ..
            if (IsfileExt) {

                var LpopMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "342"); // Same file exists Do you ignore the existing file and proceed?
                var Ret = oAPP.remote.dialog.showMessageBoxSync(oAPP.oWIN, {
                    title : sTitle,
                    type: "question",
                    message: LpopMsg,
                    buttons: ['YES', 'NO']
                });
                if (Ret !== 0) {
                    oAPP.oWIN.close();
                    return;
                }

            }

            let oSettings = WSUTIL.getWsSettingsInfo();

            let sURL = oAPP.path.join(oAPP.SERVPATH, `app_export_import?ACTCD=EXPORT&APPID=${oAPP.APPID}`);

            var xhr = new XMLHttpRequest(),
                oformData = new FormData();

            oformData.append('WSVER', oSettings.appVersion);
            oformData.append('WSPATCH_LEVEL', oSettings.patch_level);

            // // 로그인 정보가 있을 경우
            // let oLogInData = oAPP.USERINFO;
            // if (oLogInData && oLogInData.HTTP_ONLY == "1") {
            //     oformData.append("sap-user", oLogInData.ID);
            //     oformData.append("sap-password", oLogInData.PW);
            //     oformData.append("sap-client", oLogInData.CLIENT);
            //     oformData.append("sap-language", oLogInData.LANGU);
            // }

            xhr.onreadystatechange = function () {

                if (xhr.readyState == XMLHttpRequest.DONE) {

                    try {

                        //서버에서 요청받은 Data 
                        var sData = JSON.parse(xhr.response);

                        //오류 발생?
                        if (sData.RETCD === "E") {
                            let sErrMsg1 = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "337"); // An error has occurred                      
                            oAPP.remote.dialog.showErrorBox(sErrMsg1, sData.RTMSG);
                            oAPP.oWIN.close();
                            return;
                        }

                    } catch (e) {

                        if (xhr.getResponseHeader('RETCD') !== "S") {

                            var Lmsg = xhr.getResponseHeader('RTMSG');
                            if (Lmsg == "" || Lmsg == null) {
                                Lmsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "343"); // During the download process there is a critical problem.
                            }

                            let sErrMsg1 = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "337"); // An error has occurred
                            oAPP.remote.dialog.showErrorBox(sErrMsg1, Lmsg);
                            oAPP.oWIN.close();
                            return;
                        }

                        // 응답 메시지 인코딩 여부
                        let ISENCODE = xhr.getResponseHeader("ISENCODE");
                        
                        var Lmsg = xhr.getResponseHeader("RTMSG");

                        // 리턴 메시지를 인코딩해야 할 경우
                        if(ISENCODE === "X"){
                            Lmsg = decodeURIComponent(escape(atob( Lmsg )));
                        }

                        var oBuff = Buffer.from(xhr.response);
                        oAPP.fs.writeFileSync(oAPP.FilePath, oBuff, null, function (err) { });

                        // 파일 다운받은 폴더를 오픈한다.
                        oAPP.SHELL.showItemInFolder(oAPP.FilePath);

                        oAPP.ipcRenderer.send(`${oAPP.BROWSKEY}--export_import-EXPORT`, {
                            RETCD: "S",
                            RTMSG: Lmsg
                        });

                        setTimeout(() => {
                            oAPP.oWIN.close();
                            return;
                        }, 500);

                    }


                }

            };

            xhr.open('POST', sURL, true);
            // xhr.open('GET', sURL, true);
            xhr.responseType = "arraybuffer";
            xhr.send(oformData);


        });

    }


};

//Device ready 
document.addEventListener('DOMContentLoaded', onDeviceReady, false);

function onDeviceReady() {
    oAPP.onStart();

}


window.onbeforeunload = function(){

    oAPP.ipcRenderer.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "BROAD_BUSY", PRCCD: "BUSY_OFF" });    
    oAPP.ipcRenderer.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" });
};