/**************************************************************************
 * ServerFrame.js
 **************************************************************************/

(function(window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.data = {};
    oAPP.attr = {};
    oAPP.msg = {};
    oAPP.data.SAPLogon = {};
    oAPP.data.SAPLogon.aSys32MsgServPort = [];

    oAPP.REMOTE = require('@electron/remote');
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.APP = oAPP.REMOTE.app;
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.APPPATH = oAPP.APP.getAppPath();
    oAPP.DIALOG = oAPP.REMOTE.require('electron').dialog;
    oAPP.CURRWIN = oAPP.REMOTE.getCurrentWindow();

    oAPP.IPCRENDERER.on("if-globalSetting-info", (events, oInfo) => {
    
        oAPP.data.GlobalSettings = oInfo;

        oAPP.data.SystemRootPath = process.env.SystemRoot;

        oAPP.fn.fnOnDeviceReady();

    });

    oAPP.fn.setBusyIndicator = function(sIsBusy){

        let _oBusyDom = document.getElementById("u4aWsBusyIndicator");

        if(sIsBusy === "X"){

            document.body.style.pointerEvents = "none";

            _oBusyDom.style.visibility = "visible";

            return;

        }

        document.body.style.pointerEvents = "";

        _oBusyDom.style.visibility = "hidden"; 
        
    };

    oAPP.fn.fnOnDeviceReady = function() {

        var oWs_frame = document.getElementById("ws_serverframe");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "ServerList.html";

    };

    // sap sound
    oAPP.setSoundMsg = (TYPE) => {        

        // 글로벌 사운드 설정값이 X 일 경우에만 수행
        let oSettingInfo = WSUTIL.getWsSettingsInfo();
        if(oSettingInfo.globalSound !== "X"){
            return;
        }     

        const
            PATH = oAPP.PATH,
            APP = oAPP.REMOTE.app,
            APPPATH = APP.getAppPath();

        // var oAudio = new Audio(),
        var oAudio = document.getElementById("u4aWsAudio"),
            sSoundRootPath = PATH.join(APPPATH, "sound", "sap"),
            sAudioPath = "";

        switch (TYPE) {
            case "01": // active
                sAudioPath = PATH.join(sSoundRootPath, 'sapmsg.wav');
                break;

            case "02": // error
                sAudioPath = PATH.join(sSoundRootPath, 'saperror.wav');
                break;

        }

        // 실행 중이면 리턴.
        if (!oAudio.paused) {
            return;
        }

        oAudio.src = "";
        oAudio.src = sAudioPath;
        oAudio.play();

    };

    // document.addEventListener('deviceready', oAPP.fn.fnOnDeviceReady, false);

    window.oAPP = oAPP;

})(window);