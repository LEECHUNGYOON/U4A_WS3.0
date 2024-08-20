/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : doc/frame.js
 ************************************************************************/

let oAPP = (function (window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.events = {};
    oAPP.common = {};

    // 현재 비지 상태 
    oAPP.attr.isBusy = false;

    oAPP.REMOTE = require('@electron/remote');    
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.APP = oAPP.REMOTE.app;
    oAPP.CURRWIN = oAPP.REMOTE.getCurrentWindow();
    oAPP.BROWSKEY = oAPP.CURRWIN.webContents.getWebPreferences().browserkey;


    /*******************************************************
     * 메시지클래스 텍스트 작업 관련 Object -- start
     *******************************************************/
    const
        REMOTE = oAPP.REMOTE,
        PATH = REMOTE.require('path'),
        CURRWIN = REMOTE.getCurrentWindow(),
        WEBCON = CURRWIN.webContents,
        WEBPREF = WEBCON.getWebPreferences(),
        USERINFO = WEBPREF.USERINFO,
        APP = REMOTE.app,
        APPPATH = APP.getAppPath(),
        LANGU = USERINFO.LANGU,
        SYSID = USERINFO.SYSID;

    // const
    //     WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
    //     WSUTIL = require(WSMSGPATH),
    //     WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

    // oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

    oAPP.WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
    oAPP.WSUTIL = require(oAPP.WSMSGPATH),
    oAPP.WSMSG = new oAPP.WSUTIL.MessageClassText(SYSID, LANGU);

    oAPP.common.fnGetMsgClsText = oAPP.WSMSG.fnGetMsgClsText.bind(oAPP.WSMSG);

    /*******************************************************
     * 메시지클래스 텍스트 작업 관련 Object -- end
     *******************************************************/


    /***********************************************************
     * 브라우저 처음 실행 시 보여지는 Busy Indicator
     ***********************************************************/
    oAPP.setBusyLoading = function (bIsShow) {

        var oLoadPg = document.getElementById("u4a_main_load");

        if (!oLoadPg) {
            return;
        }

        if (bIsShow == 'X') {
            oLoadPg.classList.remove("u4a_loadersInactive");
        } else {
            oLoadPg.classList.add("u4a_loadersInactive");
        }

    };


    /***********************************************************
     * 세션키 구하기
     ***********************************************************/
    oAPP.fn.getSessionKey = function () {

        let oCurrWin = oAPP.REMOTE.getCurrentWindow();
        if (oCurrWin.isDestroyed()) {
            return;
        }

        let oWebCon = oCurrWin.webContents,
            oWebPref = oWebCon.getWebPreferences();

        return oWebPref.partition;

    };

    /***********************************************************
     * Busy 실행 여부 정보 리턴
     ***********************************************************/
    oAPP.fn.getBusy = function(){

        return oAPP.attr.isBusy;

    };



    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-appdocu-info', (events, oInfo) => {

        oAPP.attr.oUserInfo = oInfo.USERINFO;
        oAPP.attr.oThemeInfo = oInfo.oThemeInfo;
        oAPP.attr.oAppInfo = oInfo.APPINFO;
        oAPP.attr.sServerPath = oInfo.SERVPATH;

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "doc.html";

    });

    window.oAPP = oAPP;

    return oAPP;

})(window);