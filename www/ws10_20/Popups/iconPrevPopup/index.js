/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : iconPrevPopup/index.js
 ************************************************************************/

/************************************************************************
 * Global..
 ************************************************************************/

let oAPP = {};
oAPP.fn = {};
oAPP.msg = {};
oAPP.attr = {};

window.oAPP = oAPP;

let sap,
    jQuery;

const
    REMOTE = require('@electron/remote'),
    CLIPBOARD = REMOTE.clipboard,
    PATH = REMOTE.require('path'),
    FS = REMOTE.require("fs"),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    PATHINFOURL = PATH.join(APPPATH, "Frame", "pathInfo.js"),
    PATHINFO = require(PATHINFOURL),
    WSERR = require(PATHINFO.WSTRYCATCH),
    WSUTIL = require(PATHINFO.WSUTIL),
    CURRWIN = REMOTE.getCurrentWindow(),
    PARWIN = CURRWIN.getParentWindow(),
    IPCRENDERER = require('electron').ipcRenderer,
    zconsole = WSERR(window, document, console);


/************************************************************************
 * IPCRENDERER Events..
 ************************************************************************/
IPCRENDERER.on('if-icon-prev', async (events, oInfo) => {

    let oWebCon = REMOTE.getCurrentWebContents(),
        oWebPref = oWebCon.getWebPreferences();

    oAPP.attr.sServerPath = oInfo.sServerPath; // 서버 경로
    oAPP.attr.sServerHost = oInfo.sServerHost // 서버 호스트 경로
    oAPP.attr.sDefTheme = oInfo.sDefTheme // 기본 테마 정보

    // ws 글로벌 언어 설정정보
    oAPP.attr.WS_LANGU = await WSUTIL.getWsLanguAsync();

    oAPP.fn.fnFrameLoad();

    CURRWIN.setParentWindow(null);

});

/************************************************************************
 * 부모 윈도우 관련 이벤트 --- start 
 ************************************************************************/

// 부모창 닫기 이벤트
oAPP.fn.fnOnParentWindowClosedEvent = () => {

    if (CURRWIN && CURRWIN.isDestroyed()) {
        return;
    }

    CURRWIN.close();

}; // end of oAPP.fn.fnOnParentWindowClosedEvent

/************************************************************************
 * 부모 윈도우 관련 이벤트 --- End
 ************************************************************************/

/************************************************************************
 * 윈도우 관련 이벤트
 ************************************************************************/
window.onbeforeunload = function () {

    if (PARWIN && PARWIN.isDestroyed()) {
        return;
    }

    PARWIN.off("closed", oAPP.fn.fnOnParentWindowClosedEvent);

    PARWIN.focus();

}; // end of window.onbeforeunload

PARWIN.on("closed", oAPP.fn.fnOnParentWindowClosedEvent);




/************************************************************************
 * frame Load 수행 
 ************************************************************************/
oAPP.fn.fnFrameLoad = () => {

    let sServerPath = oAPP.attr.sServerPath,
        sServerHtmlUrl = sServerPath + "/getP13nPreviewHTML",
        oForm = document.getElementById("u4asendform"),
        aParam = [
            { NAME: "LIBRARY", VALUE: "sap.m, sap.f, sap.ui.table" },
            { NAME: "LANGU", VALUE: oAPP.attr.WS_LANGU },
            { NAME: "THEME", VALUE: "sap_horizon" },
            { NAME: "CALLBACKFUNC", VALUE: "parent.oAPP.fn.onFrameLoadSuccess();" },
        ]

    for (var i = 0; i < aParam.length; i++) {

        let oParam = aParam[i],
            oInput = document.createElement("input");

        oInput.setAttribute("type", "hidden");
        oInput.setAttribute("name", oParam.NAME);
        oInput.setAttribute("value", oParam.VALUE);
        oForm.appendChild(oInput);

    }

    oForm.setAttribute("action", sServerHtmlUrl);

    oForm.submit();

}; // end of oAPP.fn.fnFrameLoad

/************************************************************************
 * 서버 부트스트랩 로드 성공 시
 ************************************************************************/
oAPP.fn.onFrameLoadSuccess = () => {

    let oWs_frame = document.getElementById("ws_frame"),

        // content div 생성
        oContentDocu = oWs_frame.contentDocument,
        oContentDiv = oContentDocu.createElement("div");

    oContentDiv.id = "content";
    oContentDiv.style.display = "none";

    oContentDocu.body.appendChild(oContentDiv);

    // sap 오브젝트 상속
    sap = oWs_frame.contentWindow.sap;
    jQuery = $ = oWs_frame.contentWindow.jQuery;

    // css 파일 넣기
    let sCssLinkPath = PATH.join(PATHINFO.POPUP_ROOT, "iconPrevPopup", "index.css"),
        sCssData = FS.readFileSync(sCssLinkPath, "utf-8");

    let oStyle = oContentDocu.createElement("style");
    oStyle.innerHTML = sCssData;

    oContentDocu.head.appendChild(oStyle);

    oAPP.setBusy("X");

    oAPP.fn.attachInit(); // [Async]

}; // end of oAPP.fn.onFrameLoadSuccess


function fnWait() {

    return new Promise((resolve) => {

        setTimeout(() => {
            resolve();
        }, 3000);

    });

}

function fnGetFontAwesomeIcon() {

    return new Promise(async (resolve) => {

        let oSettingInfo = WSUTIL.getWsSettingsInfo(),
            oU4ASettingsInfo = oSettingInfo.U4A,
            oU4AIconsInfo = oU4ASettingsInfo.icons,
            oFwInfo = oU4AIconsInfo.fontAwesome,
            oFwCollNames = oFwInfo.collectionNames,
            oFwList = oFwInfo.fontList;

        // fontawesome 아이콘 추가
        let sUrlRoot = oFwInfo.rootPath,
            sBrandsColName = oFwCollNames.brands,
            sRegularColName = oFwCollNames.regular,
            sSolidColName = oFwCollNames.solid;

        sap.ui.core.IconPool.registerFont({
            collectionName: sRegularColName,
            fontFamily: oFwList.regular,
            fontURI: sUrlRoot,
            lazy: false
        });

        sap.ui.core.IconPool.registerFont({
            collectionName: sBrandsColName,
            fontFamily: oFwList.brands,
            fontURI: sUrlRoot,
            lazy: false
        });

        sap.ui.core.IconPool.registerFont({
            collectionName: sSolidColName,
            fontFamily: oFwList.solid,
            fontURI: sUrlRoot,
            lazy: false
        });

        // 서버가서 관련 Json 가져오기
        let sServerHost = oAPP.attr.sServerHost,
            sFwRoot = `${sServerHost}${oFwInfo.rootPath}`,
            aJsonUrlInfo = [
                { path: `${sFwRoot}/${oFwList.regular}.json`, name: oFwList.regular, collectionName: oFwCollNames.regular },
                { path: `${sFwRoot}/${oFwList.brands}.json`, name: oFwList.brands, collectionName: oFwCollNames.brands },
                { path: `${sFwRoot}/${oFwList.solid}.json`, name: oFwList.solid, collectionName: oFwCollNames.solid },
            ],
            aPromise = [];


        for (var i = 0; i < aJsonUrlInfo.length; i++) {

            let oJsonInfo = aJsonUrlInfo[i],
                oAjaxOptions = {
                    url: oJsonInfo.path,
                    responseType: "json",
                    method: "GET",
                    collectionName: oJsonInfo.collectionName,
                };

            // 서버 호출
            aPromise.push(sendAjaxAsync(oAjaxOptions));

        }

        // 서버 호출 결과
        let aResult = await Promise.all(aPromise),
            iResLength = aResult.length,
            sIconSrcPrefix = "sap-icon://",
            aIcons = [];

        for (var i = 0; i < iResLength; i++) {

            let oResult = aResult[i];

            if (oResult.RETCD == "E") {
                continue;
            }

            let options = oResult.options,
                oIcons = oResult.RTDATA;

            for (var j in oIcons) {

                let oIconInfo = {};
                oIconInfo.ICON_NAME = j;
                oIconInfo.ICON_SRC = `${sIconSrcPrefix}${options.collectionName}/${j}`;
                aIcons.push(oIconInfo);

            }

        }

        let oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty("/ICONS/U4A", aIcons);

        resolve();

    });

} // end of fnGetFontAwesomeIcon

// U4A Icon 관련 설정
function fnU4AIconConfig() {

    return new Promise(async (resolve) => {

        // Font Awesome 아이콘 등록 및 구하기
        await fnGetFontAwesomeIcon();




        resolve();

    });

} // end of fnU4AIconConfig

/************************************************************************
 * Attach Init
 ************************************************************************/
oAPP.fn.attachInit = async () => {

    // await fnWait();

    await oAPP.fn.getWsMessageList(); // 반드시 이 위치에!!

    oAPP.fn.fnInitRendering();

    oAPP.fn.fnInitModelBinding();

    // U4A ICON 관련
    await fnU4AIconConfig();

    /**
     * 무조건 맨 마지막에 수행 되어야 함!!
     */

    // 자연스러운 로딩
    sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, function () {

        if (!oAPP.attr.UIUpdated) {

            setTimeout(() => {
                $('#content').fadeIn(300, 'linear');
            }, 300);

            oAPP.attr.UIUpdated = "X";

            oAPP.setBusy("");

            document.getElementById("u4aWsBusyIndicator").style.visibility = "hidden";

        }

    });

}; // end of oAPP.fn.attachInit

/************************************************************************
 * 초기 모델 바인딩
 ************************************************************************/
oAPP.fn.fnInitModelBinding = function () {

    // 현재 버전에서 지원되는 테마 목록
    let aSupportedThemes = sap.ui.getVersionInfo().supportedThemes,
        iThemeLength = aSupportedThemes.length;

    // 테마 정보를 바인딩 구조에 맞게 변경
    let aThemes = [];
    for (var i = 0; i < iThemeLength; i++) {

        let sThemeName = aSupportedThemes[i];

        aThemes.push({
            KEY: sThemeName,
            THEME: sThemeName
        });

    }

    let aUI5Icons = fnGetUI5IconList();

    let oModelData = {
        PRC: {
            MenuSelectedKey: "SAP",
        },
        THEME: {
            THEME_KEY: oAPP.attr.sDefTheme,
            THEME_LIST: aThemes
        },

        ICONS: {
            ICON_LIST: aUI5Icons,
            SAP: aUI5Icons,
            U4A: []
        }
    };


    let oJsonModel = new sap.ui.model.json.JSONModel();
    oJsonModel.setData(oModelData);
    oJsonModel.setSizeLimit(100000);

    sap.ui.getCore().setModel(oJsonModel);

}; // end of oAPP.fn.fnInitModelBinding

/************************************************************************
* 화면 초기 렌더링
************************************************************************/
oAPP.fn.fnInitRendering = function () {

    var oApp = new sap.m.App({
        autoFocus: false,
    }),
        oPage = new sap.m.Page({
            // properties
            showHeader: true,
            enableScrolling: false,
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.Image({
                        width: "25px",
                        src: PATHINFO.WS_LOGO
                    }),
                    new sap.m.Title({
                        text: oAPP.msg.M047 //"Icon List"
                    }),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.MenuButton("hdMenuBtn", {
                        text: "SAP Icons",
                        menu: new sap.m.Menu("hdMenu", {
                            itemSelected: ev_HeaderMenuSelected,
                            items: [
                                new sap.m.MenuItem({
                                    key: "SAP",
                                    text: "SAP Icons"
                                }),
                                new sap.m.MenuItem({
                                    key: "U4A",
                                    text: "U4A Icons"
                                }),
                            ]
                        })
                    }),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://less",
                        press: function () {

                            CURRWIN.setOpacity(0);

                            CURRWIN.setParentWindow(null);

                            setTimeout(() => {

                                CURRWIN.minimize();

                                CURRWIN.setOpacity(1);

                            }, 100);

                        }
                    }),
                    new sap.m.Button("maxWinBtn", {
                        icon: "sap-icon://header",
                        press: function (oEvent) {

                            let bIsMax = CURRWIN.isMaximized();

                            if (bIsMax) {
                                CURRWIN.unmaximize();
                                return;
                            }

                            CURRWIN.maximize();

                        }
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function () {

                            CURRWIN.close();

                        }
                    }),
                ]
            }).addStyleClass("u4aWsBrowserDraggable"),

            content: fnGetMainPageContents()

        }).addStyleClass("u4aWsIconListMainPage");

    oApp.addPage(oPage);

    oApp.placeAt("content");

}; // end of oAPP.fn.fnInitRendering




function fnGetMainPageContents() {

    let oDynamicPage = fnGetDynamicPage();

    let oIconTabBar = new sap.m.IconTabBar({
        selectedKey: "K1",
        expandable: false,
        expanded: true,
        stretchContentHeight: true,
        applyContentPadding: false,
        backgroundDesign: "Transparent",
        items: [
            new sap.m.IconTabFilter({
                icon: "sap-icon://grid",
                text: "Grid",
                key: "K1"
            }),
            new sap.m.IconTabFilter({
                icon: "sap-icon://list",
                text: "Details",
                key: "K2"
            }),
        ],
        content: [
            oDynamicPage
        ],

        select: ev_iconListIconTabSelectEvent

    });

    return [
        oIconTabBar
    ];

} // end of fnGetMainPageContents

function fnGetDynamicPage() {

    return new sap.f.DynamicPage({
        headerExpanded: true,
        fitContent: true,

        title: new sap.f.DynamicPageTitle({
            expandedContent: [
                new sap.m.HBox({
                    renderType: "Bare",
                    items: [
                        new sap.m.SearchField(),
                        new sap.m.Select({
                            selectedKey: "{/THEME/THEME_KEY}",
                            items: {
                                path: "/THEME/THEME_LIST",
                                template: new sap.ui.core.Item({
                                    key: "{KEY}",
                                    text: "{THEME}"
                                })
                            },

                            layoutData: new sap.m.FlexItemData({
                                styleClass: "sapUiTinyMarginBegin",
                                baseSize: "50%"
                            }),
                            change: ev_themeSelectChangeEvent
                        })
                    ]
                })
            ]
        }),

        content: fnGetDynamicPageContent()

    }).addStyleClass("u4aWsIconListDynamicPage");

}  // end of fnGetDynamicPage


function fnGetDynamicPageContent() {

    jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");

    let oGridListPage = new sap.m.Page("K1", {
        showHeader: false,
        content: [
            new sap.f.GridList({
                growing: true,
                growingScrollToLoad: true,
                growingThreshold: 200,
                customLayout: new sap.ui.layout.cssgrid.GridBoxLayout({
                    boxWidth: "8.125rem"
                }),

                items: {
                    path: "/ICONS/ICON_LIST",
                    template: new sap.f.GridListItem({
                        content: [
                            new sap.m.VBox({
                                direction: "Column",
                                alignItems: "Center",
                                items: [
                                    new sap.ui.core.Icon({
                                        src: "{ICON_SRC}",
                                        size: "2.5rem",
                                        layoutData: new sap.m.FlexItemData({
                                            styleClass: "sapUiTinyMarginTop"
                                        })
                                    }),
                                    new sap.m.Label({
                                        text: "{ICON_NAME}",
                                        textAlign: "Center",
                                        design: "Bold",
                                        width: "6rem"
                                    }),
                                    new sap.m.HBox({
                                        items: [
                                            new sap.m.Button({
                                                icon: "sap-icon://copy",
                                                press: ev_iconClipBoardCopy
                                            })
                                        ]
                                    }),

                                ] // end of VBox items

                            }) // end of VBox
                        ]
                    }) // end of GridListItem   

                } // end of GridList items

            }) // end of GridList

        ] // end of Page Content

    }).addStyleClass("sapUiContentPadding");

    let oTableListPage = new sap.m.Page("K2", {

        showHeader: false,
        content: [

            new sap.ui.table.Table("ListTable", {

                // properties
                selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
                visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                selectionMode: sap.ui.table.SelectionMode.Single,
                minAutoRowCount: 1,
                alternateRowColors: true,
                rowHeight: 50,

                columns: [
                    new sap.ui.table.Column({
                        width: "100px",
                        hAlign: "Center",
                        label: "Icon",
                        template: new sap.ui.core.Icon({
                            src: "{ICON_SRC}",
                            size: "45px"
                        })
                    }),

                    new sap.ui.table.Column({
                        label: "Name",
                        template: new sap.m.Label({
                            design: "Bold",
                            text: "{ICON_NAME}"
                        })
                    }),

                    new sap.ui.table.Column({
                        label: "Code",
                        template: new sap.m.Text({
                            text: "{ICON_SRC}"
                        })
                    }),

                    new sap.ui.table.Column({
                        label: "Copy",
                        template: new sap.m.Button({
                            icon: "sap-icon://copy",
                            press: ev_iconClipBoardCopy
                        })
                    }),

                ],

                rows: {
                    path: "/ICONS/ICON_LIST",
                },

            })

        ]

    }).addStyleClass("sapUiContentPadding");

    return new sap.m.NavContainer("IconListNavCon", {
        autoFocus: false,
        pages: [

            oGridListPage,

            oTableListPage

        ]
    })

} // end of fnGetDynamicPageContent    


/************************************************************************
 * UI5의 아이콘 정보를 구한다.
 ************************************************************************/
function fnGetUI5IconList() {

    let aIconNames = sap.ui.core.IconPool.getIconNames(),
        iIconLength = aIconNames.length;

    let aIcons = [];
    for (var i = 0; i < iIconLength; i++) {

        let sIconName = aIconNames[i];

        let oIconInfo = {
            ICON_NAME: sIconName,
            ICON_SRC: `sap-icon://${sIconName}`
        }

        aIcons.push(oIconInfo);

    }

    return aIcons;


} // end of fnGetUI5IconList

/************************************************************************
 * 스크롤 탑으로 올릴것 모음
 ************************************************************************/
function fnSetScrollTop() {

    // Grid Page의 스크롤을 최 상위로 올린다.
    let oGridPage = sap.ui.getCore().byId("K1");
    oGridPage.scrollTo(0);

    // List Table의 스크롤을 최 상위로 올린다.
    let oListTable = sap.ui.getCore().byId("ListTable");
    oListTable.setFirstVisibleRow(0);

} // end of fnSetScrollTop



























/************************************************************************
 * 헤더 메뉴 버튼 클릭 이벤트
 ************************************************************************/
function ev_HeaderMenuSelected(oEvent) {

    let oHdMenuBtn = sap.ui.getCore().byId("hdMenuBtn"),
        oSelectedItem = oEvent.getParameter("item"),
        sSelectedKey = oSelectedItem.getProperty("key"),
        sSelectedTxt = oSelectedItem.getProperty("text");

    oHdMenuBtn.setText(sSelectedTxt);

    let oCoreModel = sap.ui.getCore().getModel(),
        oPrc = oCoreModel.getProperty("/PRC"),
        sBeforeSelectedKey = oPrc.MenuSelectedKey;

    // 이전 선택한 값이 같으면 그냥 빠져나간다
    if (sBeforeSelectedKey == sSelectedKey) {
        return;
    }

    // 스크롤 최 상단으로 이동
    fnSetScrollTop();

    // 출력 모델 클리어
    oCoreModel.setProperty("/ICONS/ICON_LIST", []);

    switch (sSelectedKey) {
        case "SAP":

            let aSapIcons = oCoreModel.getProperty("/ICONS/SAP");

            oCoreModel.setProperty("/ICONS/ICON_LIST", aSapIcons);

            break;

        case "U4A":

            let aU4aIcons = oCoreModel.getProperty("/ICONS/U4A");

            oCoreModel.setProperty("/ICONS/ICON_LIST", aU4aIcons);

            break;

    }

    oCoreModel.setProperty("/PRC/MenuSelectedKey", sSelectedKey);

} // end of ev_HeaderMenuSelected

/************************************************************************
 * 아이콘 탭 바 선택 이벤트
 ************************************************************************/
function ev_iconListIconTabSelectEvent(oEvent) {

    let sPrevKey = oEvent.getParameter("previousKey"),
        sCurrKey = oEvent.getParameter("selectedKey");

    if (sPrevKey === sCurrKey) {
        return;
    }

    


    let oNavi = sap.ui.getCore().byId("IconListNavCon");
    oNavi.to(sCurrKey);

} // end of ev_iconListIconTabSelectEvent

/************************************************************************
 * GridList의 클립보드 복사 버튼 이벤트
 ************************************************************************/
function ev_iconClipBoardCopy(oEvent) {

    let oUI = oEvent.getSource(),
        oCtx = oUI.getBindingContext();

    if (!oCtx) {
        return;
    }

    let oBindData = oCtx.getObject();

    CLIPBOARD.writeText(oBindData.ICON_SRC);

    sap.m.MessageToast.show(oAPP.msg.M031); // Clipboard Copy Success!

} // end of ev_iconClipBoardCopy

/************************************************************************
 * 테마 선택 이벤트
 ************************************************************************/
function ev_themeSelectChangeEvent(oEvent) {

    let oPrevSelectedItem = oEvent.getParameter("previousSelectedItem"),
        oSelectedItem = oEvent.getParameter("selectedItem"),

        sPrevKey = oPrevSelectedItem.getProperty("key"),
        sSelectedKey = oSelectedItem.getProperty("key");

    if (sPrevKey === sSelectedKey) {
        return;
    }

    sap.ui.getCore().applyTheme(sSelectedKey);

} // end of ev_themeSelectChangeEvent



/************************************************************************
 * [공통] busy indicator 수행
 ************************************************************************/
oAPP.setBusy = (isBusy) => {

    if (typeof sap === "undefined") {
        return;
    }

    let bIsBusy = (isBusy == "X" ? true : false);

    sap.ui.core.BusyIndicator.iDEFAULT_DELAY_MS = 0;

    if (bIsBusy) {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        sap.ui.core.BusyIndicator.show(0);

        return;
    }

    // 화면 Lock 해제
    sap.ui.getCore().unlock();

    sap.ui.core.BusyIndicator.hide();

}; // end of oAPP.fn.setBusy


/************************************************************************
 * WS 글로벌 메시지 목록 구하기
 ************************************************************************/
oAPP.fn.getWsMessageList = function () {

    return new Promise(async (resolve) => {

        let oSettingInfo = WSUTIL.getWsSettingsInfo(),
            sWsLangu = oSettingInfo.globalLanguage;

        // oAPP.msg.M01 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "021"); // Default Pattern
        // oAPP.msg.M02 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "022"); // Custom Pattern
        // oAPP.msg.M03 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "023"); // Content Type
        // oAPP.msg.M04 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "024"); // Title
        // oAPP.msg.M05 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "025"); // Pretty Print
        // oAPP.msg.M06 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "026"); // Create
        // oAPP.msg.M07 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "027", oAPP.msg.M04); // title is required entry value
        // oAPP.msg.M08 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "028"); // Do you really want to delete the object?
        // oAPP.msg.M09 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "029"); // Delete
        // oAPP.msg.M10 = oAPP.msg.M02 + " " + WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "029"); // Custom Pattern Delete
        // oAPP.msg.M11 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "030"); // Change

        oAPP.msg.M031 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "031"); // Clipboard Copy Success!
        oAPP.msg.M047 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "047"); // Icon List



        // oAPP.msg.M13 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "007"); // Saved success
        // oAPP.msg.M14 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "008"); // Delete success
        // oAPP.msg.M15 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "038"); // YES
        // oAPP.msg.M16 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "039"); // NO


        resolve();

    });

};

function sendAjaxAsync(pOptions, oFormData) {

    return new Promise((resolve) => {

        /**
         * 파라미터 종류
         * 1. url
         * 2. method
         *  - POST, GET
         * 3. responseType
         *  - json
         *  - blob
         *  - arraybuffer
         * 
         * 4. FormData
         * 
         * 5. callback
         *  - success
         *  - fail
         * 
         */


        let oDefOptions = {
            url: "",
            method: "GET",
            responseType: "",
            async: true,
            withCredentials: true,
            formData: oFormData
        };

        if ((typeof oDefOptions.formData === "undefined")) {
            oDefOptions.formData = new FormData();
        }

        if (oDefOptions.formData instanceof FormData == false) {
            oDefOptions.formData = new FormData();
        }

        let oOptions = { ...oDefOptions, ...pOptions };

        var XHR = new XMLHttpRequest();

        XHR.onreadystatechange = function () { // 요청에 대한 콜백
            if (XHR.readyState === XHR.DONE) { // 요청이 완료되면
                if (XHR.status === 200 || XHR.status === 201) {

                    resolve({ RETCD: "S", RTDATA: XHR.response, options: pOptions });

                }
            }
        };

        // 오류 콜백
        XHR.error = function (oEvent) {

            resolve({ RETCD: "E" });

        };

        // Request Timeout 콜백
        XHR.timeout = function (oEvent) {

            resolve({ RETCD: "E" });

        };

        XHR.withCredentials = oOptions.withCredentials;

        // FormData가 없으면 GET으로 전송
        XHR.open(oOptions.method, oOptions.url, oOptions.async);

        XHR.timeout = 60000; // 1분
        XHR.responseType = oOptions.responseType;

        XHR.send(oOptions.formData);

    });

} // end of sendAjax