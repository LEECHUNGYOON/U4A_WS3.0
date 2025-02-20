/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnClientEditorPopupOpen.js
 * - file Desc : UI Client Editor Popup
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    const
        C_DLG_ID = "u4aWsClientEditorDialog",
        CLIENT_EDITOR_BIND_ROOT_PATH = "/WS20/CLIENTEDITOR",
        C_JS = "JS",
        C_HTML = "HM",
        C_CODEEDIT_ID = "ClientEditor",
        C_DIALOG_WIDTH = "50%",
        C_DIALOG_HEIGHT = "500px";

    var EDITORDATA = {};

    var APPCOMMON = oAPP.common,
        GfnEditorCallback;

    /************************************************************************
     * Client Editor (HTML, JAVASCRIPT) OPEN
     ************************************************************************/
    oAPP.fn.fnClientEditorPopupOpen = function(OBJTY, OBJID, fnCallback) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        EDITORDATA.OBJTY = OBJTY;
        EDITORDATA.OBJID = OBJID;

        var oBindData = {
            TITLE: "",
            TYPE: "",
            OBJID: OBJID
        }

        // TYPE 에 따라 모델을 초기화 한다.
        switch (OBJTY) {
            case C_JS:

                oBindData.TITLE = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B61", "", "", "", ""); // Javascript Editor
                oBindData.TYPE = "javascript";

                break;

            case C_HTML:

                oBindData.TITLE = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B62", "", "", "", ""); // HTML Editor
                oBindData.TYPE = "html";

                break;

            default:

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
        }


        if (typeof GfnEditorCallback !== "undefined") {
            GfnEditorCallback = undefined;
        }

        // callback function 글로벌 변수로 저장
        GfnEditorCallback = fnCallback;

        APPCOMMON.fnSetModelProperty(CLIENT_EDITOR_BIND_ROOT_PATH, oBindData);

        var oClientEditorDialog = sap.ui.getCore().byId(C_DLG_ID);
        if (oClientEditorDialog) {

            // Dialog 기본 사이즈 적용
            oClientEditorDialog.setContentWidth(C_DIALOG_WIDTH);
            oClientEditorDialog.setContentHeight(C_DIALOG_HEIGHT);

            // Dialog가 열려 있으면 빠져나간다.
            if (oClientEditorDialog.isOpen() == true) {
                
                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
            }

            oClientEditorDialog.open();

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");
            
            return;
        }

        var oContents = oAPP.fn.fnClientEditorPopupContents(),
            oCustomHeader = oAPP.fn.fnGetClientEditorCustomHeader();

        var oClientEditorDialog = new sap.m.Dialog(C_DLG_ID, {

            // Properties
            // title: "{" + CLIENT_EDITOR_BIND_ROOT_PATH + "/TITLE}",
            draggable: true,
            resizable: true,
            contentWidth: C_DIALOG_WIDTH,
            contentHeight: C_DIALOG_HEIGHT,
            // icon: "sap-icon://syntax",
            customHeader: oCustomHeader,

            // Aggregations
            buttons: [
                new sap.m.Button({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C25", "", "", "", ""), // Pretty Print
                    press: oAPP.events.ev_pressClientEditorPrettyPrint
                }).bindProperty("visible", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding),
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: oAPP.events.ev_pressClientEditorSave
                }).bindProperty("visible", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

                new sap.m.Button({
                    type: sap.m.ButtonType.Negative,
                    icon: "sap-icon://delete",
                    press: oAPP.events.ev_pressClientEditorDel
                }).bindProperty("visible", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: function(oEvent) {
                        var oDialog = oEvent.getSource().getParent();
                        oDialog.close();
                    }
                }),
            ],

            content: [
                oContents
            ],

            // Events
            afterOpen: function() {

                // Type에 따라 관련 데이터를 가져온다.
                switch (EDITORDATA.OBJTY) {
                    case C_JS:
                        oAPP.fn.fnGetClientJsData(EDITORDATA);
                        break;

                    case C_HTML:
                        oAPP.fn.fnGetClientHtmlData(EDITORDATA);
                        break;
                }

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

            },
            afterClose: function(oEvent) {

                EDITORDATA = {};

            },
            escapeHandler: function() {
                var oDialog = sap.ui.getCore().byId(C_DLG_ID);
                if (!oDialog) {
                    return;
                }
                oDialog.close();
            }

        }).addStyleClass(C_DLG_ID);

        oClientEditorDialog.open();

    }; // end of oAPP.fn.fnClientEditorPopupOpen

    oAPP.fn.fnGetClientEditorCustomHeader = () => {

        return new sap.m.Toolbar({
            content: [
                new sap.m.ToolbarSpacer(),

                new sap.ui.core.Icon({
                    src: "sap-icon://syntax"
                }),

                new sap.m.Title({
                    text: `{${CLIENT_EDITOR_BIND_ROOT_PATH}/TITLE} -- {${CLIENT_EDITOR_BIND_ROOT_PATH}/OBJID}`
                    // text: "{" + CLIENT_EDITOR_BIND_ROOT_PATH + "/TITLE}"
                }).addStyleClass("sapUiTinyMarginBegin"),

                new sap.m.ToolbarSpacer(),

                new sap.m.Button({
                    icon: "sap-icon://decline",
                    press: function() {

                        var oDialog = sap.ui.getCore().byId(C_DLG_ID);
                        if (oDialog == null) {
                            return;
                        }

                        if (oDialog.isOpen()) {
                            oDialog.close();
                        }

                    }
                })

            ]
        }).attachBrowserEvent("dblclick", (oEvent) => {

            var oToolbar = sap.ui.getCore().byId(oEvent.currentTarget.id);
            if (oToolbar == null || oToolbar instanceof sap.m.Toolbar == false) {
                return;
            }

            var oDialog = oToolbar.getParent();
            if (oDialog instanceof sap.m.Dialog == false) {
                return;
            }

            var sWidth = oDialog.getContentWidth();

            if (sWidth == C_DIALOG_WIDTH) {
                oDialog.setContentWidth("100%");
                oDialog.setContentHeight("100%");
                return;
            }

            oDialog.setContentWidth(C_DIALOG_WIDTH);
            oDialog.setContentHeight(C_DIALOG_HEIGHT);

        });

    }; // end of oAPP.fn.fnGetClientEditorCustomHeader

    /************************************************************************
     * Client Editor (HTML, JAVASCRIPT) Contents UI
     ************************************************************************/
    oAPP.fn.fnClientEditorPopupContents = function() {

        var oCodeEditor = new sap.ui.codeeditor.CodeEditor(C_CODEEDIT_ID, {
            colorTheme: "solarized_dark",
            type: "{" + CLIENT_EDITOR_BIND_ROOT_PATH + "/TYPE}",
            value: "{" + CLIENT_EDITOR_BIND_ROOT_PATH + "/EDITDATA/DATA}",
        }).bindProperty("editable", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding);

        oCodeEditor.addDelegate({
            onAfterRendering: function(oControl) {

                var oEditor = oControl.srcControl,
                    _oAceEditor = oEditor._oEditor;

                if (!_oAceEditor) {
                    return;
                }

                _oAceEditor.setFontSize(20);

            }
        });

        return new sap.m.Page({
            showHeader: false,
            content: [
                oCodeEditor
            ]
        });

    }; // end of oAPP.fn.fnClientEditorPopupContents

    /************************************************************************
     * Getting Client Editor Javascript Data
     ************************************************************************/
    oAPP.fn.fnGetClientJsData = function(EDITORDATA) {
        
        var sEditorDataBindPath = CLIENT_EDITOR_BIND_ROOT_PATH + "/EDITDATA",

            aCliEvt = jQuery.extend(true, [], oAPP.DATA.APPDATA.T_CEVT),

            oFindScript = aCliEvt.find(a => a.OBJID == EDITORDATA.OBJID);

        if (typeof oFindScript === "undefined") {

            EDITORDATA.DATA = "";

            APPCOMMON.fnSetModelProperty(sEditorDataBindPath, EDITORDATA);

            return;
        }

        APPCOMMON.fnSetModelProperty(sEditorDataBindPath, oFindScript);

    }; // end of oAPP.fn.fnGetClientJsData

    /************************************************************************
     * Getting Client Editor HTML Data
     ************************************************************************/
    oAPP.fn.fnGetClientHtmlData = function(EDITORDATA) {

        var sEditorDataBindPath = CLIENT_EDITOR_BIND_ROOT_PATH + "/EDITDATA",

            aCliEvt = jQuery.extend(true, [], oAPP.DATA.APPDATA.T_CEVT),

            oFindScript = aCliEvt.find(a => a.OBJID == EDITORDATA.OBJID);

        if (typeof oFindScript === "undefined") {

            EDITORDATA.DATA = "";

            APPCOMMON.fnSetModelProperty(sEditorDataBindPath, EDITORDATA);

            return;
        }

        APPCOMMON.fnSetModelProperty(sEditorDataBindPath, oFindScript);

    }; // end of oAPP.fn.fnGetClientHtmlData

    /************************************************************************
     * Client Editor (HTML, JAVASCRIPT) Save Event
     ************************************************************************/
    oAPP.events.ev_pressClientEditorSave = function(oEvent) {
        
        if (typeof GfnEditorCallback !== "function") {
            return;
        }

        // Editor에 입력한 값을 구한다.
        var sEditorDataBindPath = CLIENT_EDITOR_BIND_ROOT_PATH + "/EDITDATA",
            oEditorData = APPCOMMON.fnGetModelProperty(sEditorDataBindPath);

        // 서버에서 수집된 Client 이벤트가 있는지 확인한다.
        var iFindIndex = oAPP.DATA.APPDATA.T_CEVT.findIndex(a => a.OBJID == oEditorData.OBJID);

        /******************************************************************
         * Editor에 입력한 값이 없을 경우.
         ******************************************************************/
        if (oEditorData.DATA == "") {

            // 서버에서 수집된 Client 이벤트가 있을 경우
            if (iFindIndex >= 0) {

                // 해당하는 index의 Client 이벤트 데이터를 삭제한다.
                oAPP.DATA.APPDATA.T_CEVT.splice(iFindIndex, 1);

                // 어플리케이션 정보에 변경 플래그 
                parent.setAppChange('X');

            }

            GfnEditorCallback('');

            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "002", "", "", "", ""); // Saved success

            parent.showMessage(sap, 10, "", sMsg);

            return;

        }

        /******************************************************************
         * Editor에 입력한 값이 있을 경우.
         ******************************************************************/
        var oNewEditorData = jQuery.extend(true, {}, oEditorData);

        // 서버에서 수집된 Client 이벤트가 있을 경우
        if (iFindIndex >= 0) {

            // 해당 Array에 업데이트
            oAPP.DATA.APPDATA.T_CEVT[iFindIndex] = oNewEditorData;

        } else {

            // 해당 Array에 신규 추가
            oAPP.DATA.APPDATA.T_CEVT.push(oNewEditorData);

        }

        // 어플리케이션 정보에 변경 플래그 
        parent.setAppChange('X');

        let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "002", "", "", "", ""); // Saved success

        parent.showMessage(sap, 10, "", sMsg);

        GfnEditorCallback('X');

    }; // end of oAPP.events.ev_pressClientEditorSave

    /************************************************************************
     * Client Editor (HTML, JAVASCRIPT) Delete Event
     ************************************************************************/
    oAPP.events.ev_pressClientEditorDel = function(oEvent) {

        var sEditorDataBindPath = CLIENT_EDITOR_BIND_ROOT_PATH + "/EDITDATA",
            oEditorData = APPCOMMON.fnGetModelProperty(sEditorDataBindPath),
            oEditorDeepCp = jQuery.extend(true, {}, oEditorData);

        // 이미 삭제가 되있는 경우는 빠져나간다.
        if (oEditorDeepCp.DATA == "") {
            return;
        }

        oEditorDeepCp.DATA = "";

        APPCOMMON.fnSetModelProperty(sEditorDataBindPath, oEditorDeepCp);

    }; // end of oAPP.events.ev_pressClientEditorDel

    /************************************************************************
     * Client Editor (HTML, JAVASCRIPT) Pretty Print 기능
     ************************************************************************/
    oAPP.events.ev_pressClientEditorPrettyPrint = function() {

        var oCodeEditor = sap.ui.getCore().byId(C_CODEEDIT_ID);
        if (!oCodeEditor) {
            return;
        }

        oCodeEditor.prettyPrint();

    };

})(window, $, oAPP);