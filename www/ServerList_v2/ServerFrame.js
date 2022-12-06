/**************************************************************************
 * ServerFrame.js
 **************************************************************************/
(function(window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.data = {};
    oAPP.data.SAPLogon = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.PATH = oAPP.REMOTE.require('path');

    oAPP.fn.fnOnDeviceReady = function() {

        var oWs_frame = document.getElementById("ws_serverframe");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "ServerList.html";

    };

    // sap sound
    oAPP.setSoundMsg = (TYPE) => {

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

    document.addEventListener('deviceready', oAPP.fn.fnOnDeviceReady, false);

    window.oAPP = oAPP;

})(window);