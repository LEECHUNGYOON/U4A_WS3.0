/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnCssJsLinkAddPopupOpen.js
 * - file Desc : Document의 CSS, JS Link Add Popup
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        C_LINK_ROOT_PATH = "/WS20/LINK",
        C_LINK_LIST_DATA_ROOT_PATH = C_LINK_ROOT_PATH + "/LISTDATA",
        C_DLG_ID = "u4aWsCssJsLinkAddDialog",
        C_LINK_TABLE_ID = "CssJsLinkAddPopupTable";

    var LINK_TYPE = "",
        APPCOMMON = oAPP.common;

    /************************************************************************
     * CSS & JS Link add Popup Open
     ************************************************************************/
    oAPP.fn.fnCssJsLinkAddPopupOpen = function (TYPE) {

        LINK_TYPE = TYPE;

        var oBindData = {
            ADDBTNTXT: "",
            DELBTNTXT: "",
            TABCOLTXT: "",
        };

        let sCSSLinkTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D49"), // CSS Link
            sJSLinkTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D50"), // JS Link
            sMimeUrlTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D51"), // MIME URL
            sAddTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C98"), // Add
            sDelTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D52"); // Del

        // Type에 따라 모델을 초기화 한다.
        switch (TYPE) {
            case "CSS":
                oBindData.ADDBTNTXT = `${sCSSLinkTxt} ${sAddTxt}`; // CSS Link Add
                oBindData.DELBTNTXT = `${sCSSLinkTxt} ${sDelTxt}`; // CSS Link Del
                oBindData.TABCOLTXT = `${sCSSLinkTxt} ${sMimeUrlTxt}`; // CSS Link MIME URL;

                break;

            case "JS":
                oBindData.ADDBTNTXT = `${sJSLinkTxt} ${sAddTxt}`; // "JS Link Add";
                oBindData.DELBTNTXT = `${sJSLinkTxt} ${sDelTxt}`; //"JS Link Del";
                oBindData.TABCOLTXT = `${sJSLinkTxt} ${sMimeUrlTxt}`; //"JS Link MIME URL";

                break;

            default:

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");
                return;
        }

        APPCOMMON.fnSetModelProperty(C_LINK_ROOT_PATH, oBindData);

        var oCssJsLinkAddDlg = sap.ui.getCore().byId(C_DLG_ID);
        if (oCssJsLinkAddDlg) {

            // Dialog가 열려 있으면 빠져나간다.
            if (oCssJsLinkAddDlg.isOpen() == true) {
                
                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");
                return;
            }

            oCssJsLinkAddDlg.open();

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");
            return;

        }

        var oCustomHeader = oAPP.fn.fnCssJsLinkAddPopupCustomHeader(),
            oContents = oAPP.fn.fnCssJsLinkAddPopupContents();

        var oCssJsLinkAddDlg = new sap.m.Dialog(C_DLG_ID, {
            draggable: true,
            resizable: true,
            contentWidth: "600px",
            contentHeight: "500px",
            customHeader: oCustomHeader,
            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: oAPP.events.ev_pressCssJsLinkSave
                }).bindProperty("visible", "/WS20/APP/IS_EDIT", oAPP.fn.fnCssJsLinkAddPopupUiVisibleBinding),

                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: function (oEvent) {
                        var oDialog = oEvent.getSource().getParent();
                        oDialog.close();
                    }
                }),
            ],

            content: [
                oContents
            ],
            afterOpen: function () {

                // 테이블에 체크박스가 체크되어 있다면 전체 해제
                oAPP.fn.fnSetCssJsLinkTableClearSelection();

                // Type에 따라 관련 데이터를 가져온다.
                switch (LINK_TYPE) {
                    case "CSS":
                        oAPP.fn.fnGetCssLinkData();
                        break;

                    case "JS":
                        oAPP.fn.fnGetJsLinkData();
                        break;
                }

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

            },
            afterClose: function (oEvent) {
                // var oDialog = oEvent.getSource();
                // oDialog.destroy();
            },
            escapeHandler: function () {
                var oDialog = sap.ui.getCore().byId(C_DLG_ID);
                if (!oDialog) {
                    return;
                }
                oDialog.close();
            }

        }).addStyleClass(C_DLG_ID);

        oCssJsLinkAddDlg.open();

    }; // end of oAPP.fn.fnCssJsLinkAddPopupOpen    

    /************************************************************************
     * CSS Link 정보를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetCssLinkData = function () {

        var aLinkData = [],
            aSavedLinkData = [];

        aLinkData = jQuery.extend(true, [], oAPP.DATA.APPDATA.T_CSLK);

        var iLinkDataLength = aLinkData.length;

        if (iLinkDataLength >= 0) {

            for (var i = 0; i < iLinkDataLength; i++) {

                var sKey = parent.getRandomKey(10),
                    oLinkData = aLinkData[i];

                oLinkData.KEY = sKey; // row의 내부용 randomKey
                oLinkData.STATUS = 2; // 저장 아이콘

                aSavedLinkData.push(oLinkData);

            }

        }

        APPCOMMON.fnSetModelProperty(C_LINK_LIST_DATA_ROOT_PATH, aSavedLinkData);

    }; // end of oAPP.fn.fnGetCssLinkData

    /************************************************************************
     * JS Link 정보를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetJsLinkData = function () {

        var aLinkData = [],
            aSavedLinkData = [];

        aLinkData = jQuery.extend(true, [], oAPP.DATA.APPDATA.T_JSLK);

        var iLinkDataLength = aLinkData.length;

        if (iLinkDataLength >= 0) {

            for (var i = 0; i < iLinkDataLength; i++) {

                var sKey = parent.getRandomKey(10),
                    oLinkData = aLinkData[i];

                oLinkData.LKEY = i + 1;
                oLinkData.KEY = sKey; // row의 내부용 randomKey
                oLinkData.STATUS = 2; // 저장 아이콘

                aSavedLinkData.push(oLinkData);

            }

        }

        APPCOMMON.fnSetModelProperty(C_LINK_LIST_DATA_ROOT_PATH, aSavedLinkData);

    };

    /************************************************************************
     * CSS & JS Link add Popup의 Header
     ************************************************************************/
    oAPP.fn.fnCssJsLinkAddPopupCustomHeader = function () {

        // Message Class Text
        let sChangeTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02"), // Change
            sDispTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05"), // Display
            sActiveTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B66"), // Activate,
            sInactTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B67"); // Inactivate 

        var oToolbarSpacer = new sap.m.ToolbarSpacer({
            width: "20px"
        });

        return new sap.m.Toolbar({

            content: [
                new sap.m.Title({
                    text: "{/WS20/APP/APPID}"
                }), // APPID

                oToolbarSpacer.clone(),

                new sap.m.Title({
                    // text: "{/WS20/APP/MODETXT}"
                }).bindProperty("text", "/WS20/APP/IS_EDIT", function(IS_EDIT){
                    return IS_EDIT == "X" ? sChangeTxt : sDispTxt;
                }), // Change or Display Text

                oToolbarSpacer.clone(),

                new sap.m.Title({
                    // text: "{/WS20/APP/ISACTTXT}"
                }).bindProperty("text", "/WS20/APP/ACTST", function(ACTST){
                    return ACTST == "A" ? sActiveTxt : sInactTxt;
                }), // Activate or inactivate Text

                new sap.m.ToolbarSpacer(),

                new sap.m.Button({
                    icon: "sap-icon://decline",
                    press: function () {

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
        });

    }; // end of oAPP.fn.fnCssJsLinkAddPopupCustomHeader

    /************************************************************************
     * CSS & JS Link add Popup의 Contents
     ************************************************************************/
    oAPP.fn.fnCssJsLinkAddPopupContents = function () {

        var oTable = oAPP.fn.fnCssJsLinkAddPopupTable();

        return new sap.m.Page({
            showHeader: false,
            content: [
                oTable
            ]
        });

    }; // end of oAPP.fn.fnCssJsLinkAddPopupContents

    /************************************************************************
     * CHANGE or DISPLAY 에 따른 버튼 visible 처리 공통 bind Function
     ************************************************************************/
    oAPP.fn.fnCssJsLinkAddPopupUiVisibleBinding = function (bIsDispMode) {

        if (bIsDispMode == null) {
            return false;
        }

        var bIsDisp = (bIsDispMode == "X" ? true : false);

        return bIsDisp;

    }; // end of oAPP.fn.fnCssJsLinkAddPopupUiVisibleBinding

    /************************************************************************
     * CSS & JS Link add Popup의 Contents
     ************************************************************************/
    oAPP.fn.fnCssJsLinkAddPopupTable = function () {

        //20240903 PES -START.
        //패치정보, 패키징 처리 정보에 따라 inactive 컬럼 활성화 여부 설정.
        var _inactiveVisible = false;

        //v3.4.2 Patch7 정보가 존재하는경우 inactive 컬럼 활성화.
        if(oAPP.common.checkWLOList("C", "UHAK900822") === true){
            _inactiveVisible = true;
        }

        //패키징 처리가 되지 않은경우 컬럼 활성화.
        if(parent.APP.isPackaged === false){
            _inactiveVisible = true;
        }
        //20240903 PES -END.

        return new sap.ui.table.Table(C_LINK_TABLE_ID, {
                // selectionBehavior: sap.ui.table.SelectionBehavior.Row,
                visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                columns: [
                    new sap.ui.table.Column({
                        width: "80px",
                        hAlign: sap.ui.core.HorizontalAlign.Center,
                        label: new sap.m.Label({
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D53"), // Status
                            design: sap.m.LabelDesign.Bold
                        }),
                        template: new sap.ui.core.Icon({}).bindProperty("src", "STATUS", function (sBindValue) {

                            if (!sBindValue) {
                                return;
                            }

                            this.removeStyleClass("u4aWsCssJsLinkAddStatSuccess");
                            this.removeStyleClass("u4aWsCssJsLinkAddStatError");

                            switch (sBindValue) {
                                case 1: // 신규
                                    return "sap-icon://document";

                                case 2: // 저장된 것
                                    this.addStyleClass("u4aWsCssJsLinkAddStatSuccess");
                                    return "sap-icon://color-fill";

                                    // case 3: // 오류
                                    //     this.addStyleClass("u4aWsCssJsLinkAddStatError");
                                    //     return "sap-icon://color-fill";

                                    // default:
                                    //     return;
                            }

                        })
                    }),
                    new sap.ui.table.Column({
                        label: new sap.m.Label({
                            text: "{" + C_LINK_ROOT_PATH + "/TABCOLTXT}",
                            design: sap.m.LabelDesign.Bold
                        }),
                        template: new sap.m.Input({
                                value: "{URL}",
                                valueState: "{VSTAT}",
                                valueStateText: "{VTXT}"
                            })
                            .bindProperty("editable", "/WS20/APP/IS_EDIT", oAPP.fn.fnCssJsLinkAddPopupUiVisibleBinding)

                    }),

                    //20240903 PES -START.
                    //CSS, JS LINK 활성/비활성 처리 기능 추가로
                    //결과리스트 테이블에 비활성 여부 컬럼 추가.
                    new sap.ui.table.Column({
                        hAlign : "Center",
                        width : "80px",
                        visible : _inactiveVisible,
                        label: new sap.m.Label({
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B67"), // Inactive
                            design: sap.m.LabelDesign.Bold
                        }),
                        // template: new sap.m.CheckBox({
                        template: new sap.m.Switch({
                            // selected: {
                                state: {
                                path : "INACTIVE",
                                formatter : function(bSel){
                                    
                                    //기존 INACTIVE 처리 값이 'X' 인경우 체크박스 선택, 그렇지 않은경우 선택 해제.
                                    return bSel === "X" ? true : false;

                                }
                            },
                            // select : function(oEvent){
                            change : function(oEvent){

                                //checkbox UI 정보 얻기.
                                var _oUi = oEvent.oSource || undefined;

                                if(typeof _oUi === "undefined"){
                                    return;
                                }

                                //CSS & JS Link Inactive 체크박스 선택 이벤트.
                                oAPP.events.selectCssJsLinkInactive(_oUi);
                               
                            }
                        })
                        // .bindProperty("editable", "/WS20/APP/IS_EDIT", oAPP.fn.fnCssJsLinkAddPopupUiVisibleBinding)
                        .bindProperty("enabled", "/WS20/APP/IS_EDIT", oAPP.fn.fnCssJsLinkAddPopupUiVisibleBinding)

                    }),
                    //20240903 PES -END.
                ],

                rows: {
                    path: C_LINK_LIST_DATA_ROOT_PATH,
                },
                extension: [
                    new sap.m.OverflowToolbar({
                        content: [
                            new sap.m.Button({
                                text: "{" + C_LINK_ROOT_PATH + "/ADDBTNTXT}",
                                icon: "sap-icon://document",
                                press: oAPP.events.ev_pressCssJsLinkAddTableAddRowBtn
                            }),
                            new sap.m.Button({
                                text: "{" + C_LINK_ROOT_PATH + "/DELBTNTXT}",
                                icon: "sap-icon://delete",
                                press: oAPP.events.ev_pressCssJsLinkAddTableDelRow
                            }),
                            new sap.m.Button({
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A10"), // MIME Repository
                                icon: "sap-icon://picture",
                                press: function () {
                                    oAPP.fn.fnMimeDialogOpener();
                                }
                            }),
                        ]
                    }).bindProperty("visible", "/WS20/APP/IS_EDIT", oAPP.fn.fnCssJsLinkAddPopupUiVisibleBinding)
                ],
            })
            .bindProperty("selectionMode", "/WS20/APP/IS_EDIT", function (bIsMode) {

                var bIsMode = (bIsMode == "X" ? true : false);

                if (bIsMode) {
                    return sap.ui.table.SelectionMode.MultiToggle;
                }

                return sap.ui.table.SelectionMode.None;

            })
            .addStyleClass("sapUiSizeCompact")
            .addStyleClass(C_LINK_TABLE_ID);

    }; // end of oAPP.fn.fnCssJsLinkAddPopupTable

    /************************************************************************
     * CSS & JS Link Popup 닫기 메소드
     ************************************************************************/
    oAPP.fn.fnCssJsLinkPopupClose = function () {

        var oCssJsLinkAddDlg = sap.ui.getCore().byId(C_DLG_ID);
        if (typeof oCssJsLinkAddDlg === "undefined") {
            return;
        }

        oCssJsLinkAddDlg.close();

    }; // end of oAPP.fn.fnCssJsLinkPopupClose

    /************************************************************************
     * CSS, JS Link 테이블에 체크박스가 체크되어 있다면 전체 해제.
     ************************************************************************/
    oAPP.fn.fnSetCssJsLinkTableClearSelection = function () {

        var oCssLinkAddTable = sap.ui.getCore().byId(C_LINK_TABLE_ID);
        if (!oCssLinkAddTable) {
            return;
        }

        // 테이블에 체크박스가 체크되어 있다면 전체 해제
        oCssLinkAddTable.clearSelection();

    }; // end of oAPP.fn.fnSetCssJsLinkTableClearSelection

    /************************************************************************
     * CSS Link 저장
     ************************************************************************/
    oAPP.fn.fnCssLinkSave = function () {

        // 입력한 Link 정보를 구한다.
        var aLinkData = APPCOMMON.fnGetModelProperty(C_LINK_LIST_DATA_ROOT_PATH),
            iLinkDataLength = aLinkData.length;

        // Link 정보가 하나도 없으면 팝업을 그냥 닫는다.
        if (iLinkDataLength <= 0) {

            oAPP.DATA.APPDATA.T_CSLK = [];

            // 팝업 닫기
            oAPP.fn.fnCssJsLinkPopupClose();

            // 어플리케이션 정보에 변경 플래그 
            parent.setAppChange('X');

            // 디자인 영역에 반영
            oAPP.attr.ui.frame.contentWindow.setCSSLink([], true);

            return;

        }

        var sUrlType = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B74"), // CSS Link URL
            sErrTxt = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "014", sUrlType), // & is required entry value.           
            aSaveData = [],
            aSaveDataString = [],
            bIsErr = false;

        for (var i = 0; i < iLinkDataLength; i++) {

            var sUrl = aLinkData[i].URL,
                oLinkData = aLinkData[i];

            oLinkData.VSTAT = sap.ui.core.ValueState.None;
            oLinkData.VTXT = "";

            if (sUrl != "") {

                aSaveData.push({
                    "LKEY": i + 1,
                    "URL": oLinkData.URL,

                    //20240903 PES -START.
                    //INACTIVE 처리 값 매핑.
                    "INACTIVE": oLinkData.INACTIVE

                });

                //20240903 PES -START.
                //INACTIVE 처리건인경우 미리보기 반영할 CSS LINK 수집 SKIP.
                if(oLinkData.INACTIVE === "X"){
                    continue;
                }
                //20240903 PES -END.

                // 디자인 영역에 반영할 Link 정보를 String Table 형태로 수집
                aSaveDataString.push(oLinkData.URL);

                continue;
            }

            bIsErr = true;

            oLinkData.VSTAT = sap.ui.core.ValueState.Error;
            oLinkData.VTXT = sErrTxt;

        }

        APPCOMMON.fnSetModelProperty(C_LINK_LIST_DATA_ROOT_PATH, aLinkData);

        if (bIsErr) {
            aSaveData = [];
            return;
        }

        oAPP.DATA.APPDATA.T_CSLK = aSaveData;

        // 팝업 닫기
        oAPP.fn.fnCssJsLinkPopupClose();

        // 어플리케이션 정보에 변경 플래그 
        parent.setAppChange('X');

        // 디자인 영역에 반영
        oAPP.attr.ui.frame.contentWindow.setCSSLink(aSaveDataString, true);

    }; // end of oAPP.fn.fnCssLinkSave

    /************************************************************************
     * JS Link 저장
     ************************************************************************/
    oAPP.fn.fnJsLinkSave = function () {

        // 입력한 Link 정보를 구한다.
        var aLinkData = APPCOMMON.fnGetModelProperty(C_LINK_LIST_DATA_ROOT_PATH),
            iLinkDataLength = aLinkData.length;

        // Link 정보가 하나도 없으면 팝업을 그냥 닫는다.
        if (iLinkDataLength <= 0) {

            oAPP.DATA.APPDATA.T_JSLK = [];

            // 팝업 닫기
            oAPP.fn.fnCssJsLinkPopupClose();

            // 어플리케이션 정보에 변경 플래그 
            parent.setAppChange('X');

            return;

        }

        var sUrlType = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B75"), // JS Link URL
            sErrTxt = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "014", sUrlType), // & is required entry value.     
            aSaveData = [],
            bIsErr = false;

        for (var i = 0; i < iLinkDataLength; i++) {

            var sUrl = aLinkData[i].URL,
                oLinkData = aLinkData[i];

            oLinkData.VSTAT = sap.ui.core.ValueState.None;
            oLinkData.VTXT = "";

            if (sUrl != "") {

                aSaveData.push({
                    "LKEY": i + 1,
                    "URL": oLinkData.URL,

                    //20240903 PES -START.
                    //INACTIVE 처리 값 매핑.
                    "INACTIVE": oLinkData.INACTIVE

                });

                continue;
            }

            bIsErr = true;

            oLinkData.VSTAT = sap.ui.core.ValueState.Error;
            oLinkData.VTXT = sErrTxt;

        }

        APPCOMMON.fnSetModelProperty(C_LINK_LIST_DATA_ROOT_PATH, aLinkData);

        if (bIsErr) {
            aSaveData = [];
            return;
        }

        oAPP.DATA.APPDATA.T_JSLK = aSaveData;

        // 팝업 닫기
        oAPP.fn.fnCssJsLinkPopupClose();

        // 어플리케이션 정보에 변경 플래그 
        parent.setAppChange('X');

    }; // end of oAPP.fn.fnJsLinkSave

    /************************************************************************
     * CSS & JS Link add Popup의 CSS Link Add 이벤트
     ************************************************************************/
    oAPP.events.ev_pressCssJsLinkAddTableAddRowBtn = function () {

        var sKey = parent.getRandomKey(10),
            oNewRow = {
                LKEY: "",
                KEY: sKey,
                STATUS: 1,
                URL: ""
            };

        //20240903 PES -START.
        //Inactive 필드 추가.
        oNewRow.INACTIVE = "";
        //20240903 PES -END.

        // 테이블에 체크박스가 체크되어 있다면 전체 해제
        oAPP.fn.fnSetCssJsLinkTableClearSelection();

        // 신규 Row를 추가한다.
        var aTableData = APPCOMMON.fnGetModelProperty(C_LINK_LIST_DATA_ROOT_PATH);
        if (!aTableData || aTableData.length <= 0) {
            APPCOMMON.fnSetModelProperty(C_LINK_LIST_DATA_ROOT_PATH, [oNewRow]);
            return;
        }

        aTableData.push(oNewRow);

        APPCOMMON.fnSetModelProperty(C_LINK_LIST_DATA_ROOT_PATH, aTableData);

    }; // end of oAPP.events.ev_pressCssJsLinkAddTableAddRowBtn

    /************************************************************************
     * CSS & JS Link add Popup의 CSS & JS Link Del 이벤트
     ************************************************************************/
    oAPP.events.ev_pressCssJsLinkAddTableDelRow = function (TYPE, oEvent) {

        var oCssLinkAddTable = sap.ui.getCore().byId(C_LINK_TABLE_ID);
        if (!oCssLinkAddTable) {
            return;
        }

        var aSelIdx = oCssLinkAddTable.getSelectedIndices(),
            iSelLenth = aSelIdx.length;

        if (iSelLenth <= 0) {
            return;
        }

        var aTableData = jQuery.extend(true, [], APPCOMMON.fnGetModelProperty(C_LINK_LIST_DATA_ROOT_PATH));

        for (var i = 0; i < iSelLenth; i++) {

            var iSelIdx = aSelIdx[i],
                oCtx = oCssLinkAddTable.getContextByIndex(iSelIdx),
                sKey = oCtx.getObject("KEY"),
                iFindIndex = aTableData.findIndex((DATA) => DATA.KEY == sKey);

            if (iFindIndex < 0) {
                continue;
            }

            aTableData.splice(iFindIndex, 1);
        }

        APPCOMMON.fnSetModelProperty(C_LINK_LIST_DATA_ROOT_PATH, aTableData);

        oCssLinkAddTable.clearSelection();

    }; // end of oAPP.events.ev_pressCssJsLinkAddTableDelRow    

    /************************************************************************
     * CSS & JS Link add Popup의 CSS & JS Link 저장 이벤트
     ************************************************************************/
    oAPP.events.ev_pressCssJsLinkSave = function () {

        switch (LINK_TYPE) {
            case "CSS":

                oAPP.fn.fnCssLinkSave();

                return;

            case "JS":

                oAPP.fn.fnJsLinkSave();

                return;

        }

    }; // end of oAPP.events.ev_pressCssJsLinkSave


    /************************************************************************
     * CSS & JS Link Inactive 체크박스 선택 이벤트.
     ************************************************************************/
    oAPP.events.selectCssJsLinkInactive = function(oUi){
        
        if(typeof oUi === "undefined"){
            return;
        }
        
        //모델 정보 얻기.
        var _oModel = oUi.getModel() || undefined;

        if(typeof _oModel === "undefined"){
            return;
        }

        //이벤트 발생 라인의 context 정보 얻기.
        var _oCtxt = oUi.getBindingContext() || undefined;

        if(typeof _oCtxt === "undefined"){
            return;
        }

        //현재 checkbox 선택 값 얻기.
        // var _sel = oUi.getSelected();
        var _sel = oUi.getState();

        //chechbox를 선택한 경우 'X', 선택하지 않은경우 ''
        var _INACTIVE = _sel === true ? "X" : "";

        //INACTIVE 처리 값 매핑.
        _oModel.setProperty("INACTIVE", _INACTIVE, _oCtxt);

    };

})(window, $, oAPP);