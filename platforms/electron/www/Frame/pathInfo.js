/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : pathInfo.js
 * - file Desc : Path 경로 관리
 ************************************************************************/

/**
 * ## 각종 Path 들
 *  @ 패스 지정 방법..
 *    1. 기존 있는 파일 패스를 만들 경우
 *      - PATH.join(__dirname, '../Login/Login.html') 이와 같은 방식.
 * 
 *    2. 동적으로 개인화 파일 등을 만들때..
 *      - APP.getPath("userData") + "\\경로명"
 */

module.exports = (() => {
    "use strict";

    const
        REMOTE = require('@electron/remote'),
        PATH = REMOTE.require('path'),
        APP = REMOTE.app,
        APPPATH = APP.getAppPath(),
        USERDATA = APP.getPath("userData"),

        POPUP_ROOT = PATH.join(APPPATH, "ws10_20", "Popups");

    return {

        LOGIN: PATH.join(APPPATH, '/Login/Login.html'),
        LOGIN2: PATH.join(APPPATH, '/Login/Login2.html'),
        WS10: PATH.join(APPPATH, '/ws10_20/ws10_20.html'),
        EXTOPEN: PATH.join(APPPATH, '/ws10_20/extopen.html'),
        ERRORPAGE: PATH.join(APPPATH, '/ws10_20/errorpage.html'),
        JQUERYUI: PATH.join(APPPATH, '/js/jquery-ui.min.js'),
        JQUERYUICSS: PATH.join(APPPATH, '/css/jquery-ui.min.css'),
        MSG: PATH.join(APPPATH, '/msg'),
        BROWSERSETTINGS: PATH.join(APPPATH, '/settings/BrowserWindow/BrowserWindow-settings.json'),
        SERVERLIST: PATH.join(APPPATH, '/ServerList/ServerFrame.html'),

        // User Data Paths..
        CLIPBOARD: PATH.join(USERDATA, "clipboard.json"),
        THEME: PATH.join(USERDATA, "p13n", "theme"),
        P13N: PATH.join(USERDATA, "p13n", "p13n.json"),

        // Popup Paths..
        ERRPAGE: PATH.join(POPUP_ROOT, "errPageEditorPopup", "errorPageEditorFrame.html"),
        UIFIND: PATH.join(POPUP_ROOT, "findPopup", "frame.html"),
        RTMCLS: PATH.join(POPUP_ROOT, "runtimeClassNavigator", "frame.html"), // runtime class navigator  
        BINDPOPUP: PATH.join(POPUP_ROOT, "bindPopup", "frame.html"), // bind popup
        TXTSRCH: PATH.join(POPUP_ROOT, "textSearchPopup", "index.html"),
        APPDOCU: PATH.join(POPUP_ROOT, "docPopup", "frame.html"),
        WSOPTS: PATH.join(POPUP_ROOT, "optionPopup", "optionM.html"),
        EDITPOP: PATH.join(POPUP_ROOT, "editorPopup", "editorFrame.html"),
        ERRMSGPOP: PATH.join(POPUP_ROOT, "errMsgPopup", "frame.html"),
        U4ADOCU: PATH.join(POPUP_ROOT, "u4aDocPopup", "frame.html"),
        IMPEXPPOP: PATH.join(POPUP_ROOT, "importExportPopup", "index.html"),
        ABOUTU4APOP: PATH.join(POPUP_ROOT, "aboutU4APopup", "index.html"),

        // Suggestion Json Path..
        EVENTSUGG: PATH.join(USERDATA, "p13n", "events.json")

    };

})();