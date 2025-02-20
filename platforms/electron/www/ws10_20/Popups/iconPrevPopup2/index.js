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

// let sap,
//     jQuery;

const
    require = parent.require,
    REMOTE = require('@electron/remote'),
    CLIPBOARD = REMOTE.clipboard,
    PATH = REMOTE.require('path'),
    FS = REMOTE.require("fs"),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    PATHINFOURL = PATH.join(APPPATH, "Frame", "pathInfo.js"),
    PATHINFO = require(PATHINFOURL),
    WSERR = require(PATHINFO.WSTRYCATCH),
    zconsole = WSERR(window, document, console),
    WSUTIL = require(PATHINFO.WSUTIL),
    CURRWIN = REMOTE.getCurrentWindow(),
    PARWIN = CURRWIN.getParentWindow(),
    IPCRENDERER = require('electron').ipcRenderer;


var options = {
    root: null,
    rootMargin: "0px",
    threshold: 0,
},
    observer = new IntersectionObserver(fnObserverCallback, options);

/************************************************************************
 * IPCRENDERER Events..
 ************************************************************************/
IPCRENDERER.on('if-icon-prev', async (events, oInfo) => {

    return;

    oAPP.attr.sServerPath = oInfo.sServerPath; // 서버 경로
    oAPP.attr.sServerHost = oInfo.sServerHost // 서버 호스트 경로
    oAPP.attr.sDefTheme = oInfo.sDefTheme // 기본 테마 정보
    oAPP.attr.isCallback = oInfo.isCallback;

    // ws 글로벌 언어 설정정보
    oAPP.attr.WS_LANGU = await WSUTIL.getWsLanguAsync();

    oAPP.fn.fnFrameLoad();

    if (oAPP.attr.isCallback === "X") {
        CURRWIN.setParentWindow(PARWIN);
        return;
    }

    CURRWIN.setParentWindow(null);

});

/**
 * 아이콘 리스트 팝업을 콜백으로 실행했을 경우 타는 이벤트 핸들러
 */
IPCRENDERER.on("if-icon-isCallback", function (events, isCallback) {

    oAPP.attr.isCallback = isCallback;

    let oCoreModel = sap.ui.getCore().getModel();
    if (oCoreModel) {
        oCoreModel.setProperty("/PRC/MINI_INVISI", oAPP.attr.isCallback);
    }

    if (oAPP.attr.isCallback === "X") {
        CURRWIN.setParentWindow(PARWIN);
        return;
    }

    CURRWIN.setParentWindow(null);

});

/************************************************************************
 * 부모 윈도우 관련 이벤트 --- start 
 ************************************************************************/

// 부모창 닫기 이벤트
oAPP.fn.fnOnParentWindowClosedEvent = () => {

    if (!CURRWIN || CURRWIN.isDestroyed()) {
        return;
    }

    oAPP.attr.isPressWindowClose = "X";

    CURRWIN.close();

}; // end of oAPP.fn.fnOnParentWindowClosedEvent

/************************************************************************
 * 부모 윈도우 관련 이벤트 --- End
 ************************************************************************/

if (PARWIN && !PARWIN.isDestroyed()) {
    PARWIN.on("closed", oAPP.fn.fnOnParentWindowClosedEvent);
}

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
        oContWindow = oWs_frame.contentWindow,
        oContentDocu = oWs_frame.contentDocument,
        oContentDiv = oContentDocu.createElement("div");

    oContentDiv.id = "content";
    // oContentDiv.style.display = "none";

    oContentDocu.body.appendChild(oContentDiv);

    // sap 오브젝트 상속
    sap = oContWindow.sap;
    jQuery = $ = oContWindow.jQuery;

    // css 파일 넣기
    let sCssLinkPath = PATH.join(PATHINFO.POPUP_ROOT, "iconPrevPopup", "index.css"),
        sCssData = FS.readFileSync(sCssLinkPath, "utf-8");

    let oStyle = oContentDocu.createElement("style");
    oStyle.innerHTML = sCssData;

    oContentDocu.head.appendChild(oStyle);

    // // 스크립트 오류 감지    
    // let sEvalString = "const require = parent.require,";
    // sEvalString += "REMOTE = require('@electron/remote'), ";
    // sEvalString += "PATH = REMOTE.require('path'),";
    // sEvalString += "APP = REMOTE.app, APPPATH = APP.getAppPath(),";
    // sEvalString += "PATHINFOURL = PATH.join(APPPATH, 'Frame', 'pathInfo.js'),";
    // sEvalString += "PATHINFO = require(PATHINFOURL),";
    // sEvalString += "WSERR = require(PATHINFO.WSTRYCATCH),"
    // sEvalString += "zconsole = WSERR(window, document, console);"

    // oContWindow["___u4a_ws_eval___"](sEvalString);

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


        // 서버에서 가져올 JSON 경로를 설정
        let sFwRoot = oFwInfo.rootPath,
            aJsonUrlInfo = [
                { path: `${sFwRoot}/${oFwList.regular}.json`, name: oFwList.regular, collectionName: oFwCollNames.regular },
                { path: `${sFwRoot}/${oFwList.brands}.json`, name: oFwList.brands, collectionName: oFwCollNames.brands },
                { path: `${sFwRoot}/${oFwList.solid}.json`, name: oFwList.solid, collectionName: oFwCollNames.solid },
            ],
            aPromise = [];

        // 서버가서 관련 Json 가져오기 
        for (var i = 0; i < aJsonUrlInfo.length; i++) {

            let oJsonInfo = aJsonUrlInfo[i],
                oParam = {
                    url: oJsonInfo.path,
                    responseType: "json",
                    method: "GET",
                    collectionName: oJsonInfo.collectionName,
                };

            // 서버 호출
            aPromise.push(getJsonAsync(oJsonInfo.path, oParam));

        }

        // 서버 호출 결과
        let aResult = await Promise.all(aPromise),
            iResLength = aResult.length,
            sIconSrcPrefix = "sap-icon://",
            aIcons = [];

        // 아이콘 정보를 합친다.
        for (var i = 0; i < iResLength; i++) {

            let oResult = aResult[i];

            if (oResult.RETCD == "E") {
                continue;
            }

            let oParam = oResult.PARAM,
                oIcons = oResult.RTDATA;

            for (var j in oIcons) {

                let oIconInfo = {};
                oIconInfo.ICON_NAME = j;
                oIconInfo.ICON_SRC = `${sIconSrcPrefix}${oParam.collectionName}/${j}`;
                aIcons.push(oIconInfo);

            }

        }

        // 메타 정보를 구한다.
        let oGetMeta = await getJsonAsync(oFwInfo.iconMetaJson);

        /**
         * 메타데이터와 아이콘 정보가 있을 경우
         * 아이콘 정보에 연관 키워드 정보를 매핑한다.
         */
        if (oGetMeta.RETCD === "S" && aIcons.length !== 0) {

            let oMetadata = oGetMeta.RTDATA;

            for (var i in oMetadata) {

                let oIconMeta = oMetadata[i],
                    sLabel = oIconMeta.label;

                let oFound = aIcons.find(elem => elem.ICON_NAME === sLabel);
                if (!oFound) {
                    continue;
                }

                let aKeyWords = oIconMeta?.search?.terms || [],
                    iKeyWordLength = aKeyWords.length,
                    sSeparator = "|";

                oFound.KEYWORDS = [];

                for (var i = 0; i < iKeyWordLength; i++) {

                    let sKeyWord = aKeyWords[i];

                    oFound.KEYWORDS.push({
                        NAME: sKeyWord
                    });

                }

                oFound.KEYWORD_STRING = fnGetKeyWordToString(aKeyWords, sSeparator);

            }

        }

        let oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty("/ICONS/U4A", aIcons);

        resolve();

    });

} // end of fnGetFontAwesomeIcon

function fnGetKeyWordToString(aKeyWords, sSeparator) {

    if (!Array.isArray(aKeyWords)) {
        return "";
    }

    let iKeyWordLength = aKeyWords.length;
    if (iKeyWordLength === 0) {
        return "";
    }

    let sKeyWordString = "";
    for (var i = 0; i < iKeyWordLength; i++) {

        let sKeyWord = aKeyWords[i];
        sKeyWordString += sKeyWord + sSeparator;

    }

    return sKeyWordString;

} // end of fnGetKeyWordToString

// U4A Icon 관련 설정
function fnU4AIconConfig() {

    return new Promise(async (resolve) => {

        // Font Awesome 아이콘 등록 및 구하기
        await fnGetFontAwesomeIcon();

        resolve();

    });

} // end of fnU4AIconConfig

/************************************************************************
 * SAP ICON 정보를 구성한다.
 ************************************************************************/
function fnSAPIconConfig() {

    return new Promise(async (resolve) => {

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

        let sUi5Version = sap.ui.version;
        sUi5Version = sUi5Version.replaceAll(".", "");
        sUi5Version = "v" + sUi5Version;

        let oSettingInfo = WSUTIL.getWsSettingsInfo(),
            oUi5Info = oSettingInfo.UI5,
            sServerLibRootPath = oUi5Info.ServerLibraryRootPath,
            sUI5IconTagsJsonPath = oUi5Info.UI5IconTagsJsonPath;

        // let sIconTagJsonUrl = PATH.join(sServerLibRootPath, sUi5Version, sUI5IconTagsJsonPath);
        let sIconTagJsonUrl = "http://www.u4arnd.com:8000/zu4a_imp/openUI5_LIB/v11071/resources/u4a/icons/tags.json?sap-client=800&sap-language=EN&sap-user=soccerhs&sap-password=cjddbs12";

        let oIconTagsResult = await getJsonAsync(sIconTagJsonUrl);
        if (oIconTagsResult.RETCD == "E") {
            resolve();
            return;
        }

        let oIconTags = oIconTagsResult.RTDATA;

        for (var i in oIconTags) {

            let oIconMeta = oIconTags[i],
                oFound = aIcons.find(elem => elem.ICON_NAME === i);

            if (!oFound) {
                continue;
            }

            let aKeyWords = oIconMeta.tags || [],
                iKeyWordLength = aKeyWords.length,
                sSeparator = "|";

            oFound.KEYWORDS = [];

            for (var i = 0; i < iKeyWordLength; i++) {

                let sKeyWord = aKeyWords[i];

                oFound.KEYWORDS.push({
                    NAME: sKeyWord
                });

            }

            oFound.KEYWORD_STRING = fnGetKeyWordToString(aKeyWords, sSeparator);

        }

        let oCoreModel = sap.ui.getCore().getModel();

        oCoreModel.setProperty("/ICONS/ICON_LIST", aIcons);
        oCoreModel.setProperty("/ICONS/SAP", aIcons);

        resolve();

    });

} // end of fnSAPIconConfig

/************************************************************************
 * 현재 브라우저의 이벤트 핸들러
 ************************************************************************/
function _attachCurrentWindowEvents() {

    CURRWIN.on("maximize", () => {

        if (typeof sap === "undefined") {
            return;
        }

        let oMaxBtn = sap.ui.getCore().byId("maxWinBtn");
        if (!oMaxBtn) {
            return;
        }

        oMaxBtn.setIcon("sap-icon://value-help");

    });

    CURRWIN.on("unmaximize", () => {

        if (typeof sap === "undefined") {
            return;
        }

        let oMaxBtn = sap.ui.getCore().byId("maxWinBtn");
        if (!oMaxBtn) {
            return;
        }

        oMaxBtn.setIcon("sap-icon://header");

    });

} // end of _attachCurrentWindowEvents

/************************************************************************
 * Attach Init
 ************************************************************************/
oAPP.fn.attachInit = async () => {

    // await fnWait();

    // 현재 브라우저의 이벤트 핸들러 
    _attachCurrentWindowEvents();

    await oAPP.fn.getWsMessageList(); // 반드시 이 위치에!!

    oAPP.fn.fnInitRendering();

    oAPP.fn.fnInitModelBinding();

    // SAP ICON 관련 정보 구성
    await fnSAPIconConfig();

    // // U4A ICON 관련 정보 구성
    // await fnU4AIconConfig();

    // /**
    //  * 무조건 맨 마지막에 수행 되어야 함!!
    //  */

    // 자연스러운 로딩
    sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, _fnUIupdatedCallback);

}; // end of oAPP.fn.attachInit

function _fnUIupdatedCallback() {

    // setTimeout(() => {
    //     debugger;

    //     $('#content').fadeIn(300, 'linear');
    // }, 300);

    // oAPP.attr.UIUpdated = "X";

    oAPP.setBusy("");

    document.getElementById("u4aWsBusyIndicator").style.visibility = "hidden";

    sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, _fnUIupdatedCallback);

} // end of _fnUIupdatedCallback

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

    let oModelData = {
        PRC: {
            MenuSelectedKey: "SAP",
            MINI_INVISI: oAPP.attr.isCallback
        },
        THEME: {
            THEME_KEY: oAPP.attr.sDefTheme,
            THEME_LIST: aThemes
        },

        ICONS: {
            ICON_LIST: [],
            SAP: [],
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

    jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");

    var oApp = new sap.m.App({
        autoFocus: false,
    }),
        oGridItems = new sap.f.GridListItem({
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

            ] // end of end of GridListItem content

        }),
        oPage = new sap.m.Page({
            showHeader: false,
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
                                    // icon: "sap-icon://sap-logo-shape",
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

                            CURRWIN.minimize();

                            // CURRWIN.setOpacity(0);

                            // CURRWIN.setParentWindow(null);

                            // setTimeout(() => {

                            //     CURRWIN.minimize();

                            //     CURRWIN.setOpacity(1);

                            // }, 100);

                        }
                    }).bindProperty("visible", "/PRC/MINI_INVISI", function (MINI_INVISI) {

                        return (MINI_INVISI === "X" ? false : true);

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

                            if (CURRWIN.isDestroyed()) {
                                return;
                            }

                            CURRWIN.hide();

                            // 콜백 메소드가 있는지 확인
                            if (oAPP.attr.isCallback !== "X") {
                                return;
                            }

                            // Parent가 존재하는지 확인
                            if (!PARWIN || PARWIN.isDestroyed()) {
                                return;
                            }

                            PARWIN.webContents.send("if-icon-url-callback", { RETCD: "C", RTDATA: "" });

                            CURRWIN.setParentWindow(null);

                        }
                    }),
                ]
            }).addStyleClass("u4aWsBrowserDraggable"),
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
                        template: oGridItems

                    } // end of GridList items

                })
            ] // end of Page Content

        }).addStyleClass("sapUiContentPadding");

    oGridItems.addEventDelegate({
        onAfterRendering: function (oEvent) {       

            var oItem = oEvent.srcControl,
                oItemDOM = oItem.getDomRef();

            if (!oItemDOM) {             
                return;
            }

            observer.unobserve(oItemDOM);

            observer.observe(oItemDOM);

        }
    }); // end of GridListItem   

    oApp.addPage(oPage);

    oApp.placeAt("content");

}; // end of oAPP.fn.fnInitRendering

function fnGetMainPageContents() {

    let oDynamicPage = fnGetDynamicPage();

    let oIconTabBar = new sap.m.IconTabBar("iconListTabBar", {
        busyIndicatorDelay: 0,
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

        // select: ev_iconListIconTabSelectEvent

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
                        new sap.m.SearchField({
                            // liveChange: ev_searchFieldLiveChange
                        }),
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
                            // change: ev_themeSelectChangeEvent
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
            new sap.f.GridList("iconGridList", {
                growing: true,
                growingScrollToLoad: true,
                growingThreshold: 200,
                customLayout: new sap.ui.layout.cssgrid.GridBoxLayout({
                    boxWidth: "8.125rem"
                }),

                // growingFinished: ev_gridListGrowingFinished,

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
                                                // press: ev_iconClipBoardCopy
                                            })
                                        ]
                                    }),

                                ] // end of VBox items

                            }) // end of VBox

                        ] // end of end of GridListItem content

                    }).addEventDelegate({
                        onAfterRendering: ev_gridListAfterRendering
                    }) // end of GridListItem   

                } // end of GridList items

            })

        ] // end of Page Content

    }).addStyleClass("sapUiContentPadding");

    let oTableListPage = new sap.m.Page("K2", {

        visible: false,
        showHeader: false,
        content: [

            new sap.ui.table.Table("iconListTable", {

                // properties
                selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
                visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                selectionMode: sap.ui.table.SelectionMode.Single,
                minAutoRowCount: 1,
                alternateRowColors: true,
                rowHeight: 50,
                fixedColumnCount: 1,

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

                    // new sap.ui.table.Column({
                    //     label: "Key Words",
                    //     template: new sap.m.HBox({
                    //         items: {
                    //             path: "KEYWORDS",
                    //             templateShareable: true,
                    //             template: new sap.m.GenericTag({
                    //                 text: "{NAME}"
                    //             }).addStyleClass("sapUiTinyMarginEnd")
                    //         }
                    //     })
                    // }),

                    new sap.ui.table.Column({
                        width: "100px",
                        hAlign: "Center",
                        label: "Copy",
                        template: new sap.m.Button({
                            icon: "sap-icon://copy",
                            // press: ev_iconClipBoardCopy
                        })
                    }),

                ],

                rowSelectionChange: function (oEvent) {

                    var iRowIndex = oEvent.getParameter("rowIndex"),
                        oTable = oEvent.getSource();

                    if (oTable.getSelectedIndex() == -1) {
                        oTable.setSelectedIndex(iRowIndex);
                    }

                },

                rows: {
                    path: "/ICONS/ICON_LIST",
                },

            }).addEventDelegate({
                // ondblclick: ev_iconListTableDblClick
            })

        ]

    }).addStyleClass("sapUiContentPadding");

    return new sap.m.NavContainer("IconListNavCon", {
        autoFocus: false,
        pages: [

            oGridListPage,

            oTableListPage

        ],
        // afterNavigate: ev_iconListPageNavigation
    })

} // end of fnGetDynamicPageContent

/************************************************************************
 * 스크롤 탑으로 올릴것 모음
 ************************************************************************/
function fnSetScrollTop() {

    // Grid Page의 스크롤을 최 상위로 올린다.
    let oGridPage = sap.ui.getCore().byId("K1");
    oGridPage.scrollTo(0);

    // List Table의 스크롤을 최 상위로 올린다.
    let oListTable = sap.ui.getCore().byId("iconListTable");
    oListTable.setFirstVisibleRow(0);

} // end of fnSetScrollTop


function fnObserverCallback(aObservEntry) {

    // for (var i = 0, l = p1.length; i < l; i++) {

    //     //observer에서 처리 대상 dom 정보 얻기.
    //     var l_target = p1[i].target;

    //     //해당 dom이 보여지는 상태인경우.
    //     if (p1[i].isIntersecting) {

    //         //dom에 해당하는 UI정보 얻기.
    //         var l_ui = sap.ui.getCore().byId(l_target.id);
    //         if (!l_ui) { return; }

    //         //dom 갱신 처리.
    //         l_ui.invalidate();
    //         continue;

    //     }


    //     //해당 dom이 보여지지 않는 상태인경우.

    //     //현재 dom의 width, height정보를 직접 매핑.
    //     l_target.style.width = jQuery(l_target).width();
    //     l_target.style.height = jQuery(l_target).height();

    //     //dom의 child정보가 없다면 하위 로직 skip.
    //     if (l_target.children.length === 0) {
    //         continue;
    //     }


    //     //비동기로 dom의 child 제거 처리.
    //     setTimeout(function () {

    //         let l_dom = this;

    //         jQuery(l_dom).empty();


    //     }.bind(l_target), 0);

    // }














    // return;






    console.warn("콜백!!");

    let iEntryLength = aObservEntry.length;
    if (iEntryLength == 0) {
        return;
    }

    for (var i = 0; i < iEntryLength; i++) {

        let oObservEntry = aObservEntry[i],
            oTarget = oObservEntry.target;

        if (!oTarget) {
            continue;
        }

        //dom에 해당하는 UI정보 얻기.
        var oItem = sap.ui.getCore().byId(oTarget.id);
        if (!oItem) { return; }

        // 해당 요소가 화면에 나오는 경우
        if (oObservEntry.isIntersecting) {

            //dom에 해당하는 UI정보 얻기.
            var l_ui = sap.ui.getCore().byId(oTarget.id);
            if (!l_ui) { return; }

            //dom 갱신 처리.
            l_ui.invalidate();
            continue;

        }

        // let $oTarget = jQuery(oTarget);
        // if ($oTarget.length == 0) {
        //     continue;
        // }

        //현재 dom의 width, height정보를 직접 매핑.
        // oTarget.style.width = $oTarget.width();
        //oTarget.style.height = $oTarget.height();

        let w = jQuery(oTarget).width(),
            h = jQuery(oTarget).height();

        if (w !== 0) {
            oTarget.style.width = w;
        }

        if (h !== 0) {
            oTarget.style.height = h;
        }

        jQuery(oTarget).empty();
        
        // oTarget.style.width = jQuery(oTarget).width();
        // oTarget.style.height = jQuery(oTarget).height();

        //dom의 child정보가 없다면 하위 로직 skip.
        if (oTarget.children.length === 0) {
            continue;
        }

        if (!oItem) { return; }

        // jQuery(oItem.getContent()[0].getItems()[0].getDomRef()).remove();
        // jQuery(oItem.getContent()[0].getItems()[1].getDomRef()).remove();
        // jQuery(oItem.getContent()[0].getItems()[2].getDomRef()).remove();


       

        // return;

        // setTimeout(function () {

        //     let l_dom = this;

        //     jQuery(l_dom).empty();

        //     // let oItem = this;

        //     // oItem.getContent()[0].getItems()[0].setVisible(false);
        //     // oItem.getContent()[0].getItems()[1].setVisible(false);
        //     // oItem.getContent()[0].getItems()[2].setVisible(false);

        // }.bind(oTarget), 0);

        // oItem.getContent()[0].getItems()[0].setVisible(false);
        // oItem.getContent()[0].getItems()[1].setVisible(false);
        // oItem.getContent()[0].getItems()[2].setVisible(false);

        // oItem.setVisible(false);

        // //비동기로 dom의 child 제거 처리.
        // setTimeout(function () {

        //     let $oTarget = jQuery(this);

        //     $oTarget.empty();


        // }.bind(oTarget), 0);

    }

} // end of fnObserverCallback



// function ev_gridListGrowingFinished(oEvent) {

//     let oGridList = oEvent.getSource(),
//         aItems = oGridList.getItems(),
//         iItemLength = aItems.length;

//     if (iItemLength == 0) {
//         return;
//     }

//     for (var i = 0; i < iItemLength; i++) {

//         let oItem = aItems[i],
//             oItemDOM = oItem.getDomRef();

//         if (!oItemDOM) {
//             continue;
//         }

//         observer.unobserve(oItemDOM);

//         //item dom에 observer 구성.
//         observer.observe(oItemDOM);

//     }

// } // end of ev_gridListGrowingFinished

function ev_gridListAfterRendering(oEvent) {

    let oItem = oEvent.srcControl,
        oItemDOM = oItem.getDomRef();

    if (!oItemDOM) {
        return;
    }

    // observer.unobserve(oItemDOM);

    observer.observe(oItemDOM);

} // end of ev_gridListAfterRendering


/************************************************************************
 * 아이콘 리스트 테이블의 더블클릭 이벤트
 ************************************************************************/
function ev_iconListTableDblClick(oEvent) {

    var oTarget = oEvent.target,
        $SelectedRow = $(oTarget).closest(".sapUiTableRow");

    if (!$SelectedRow.length) {
        return;
    }

    var oRow = $SelectedRow[0],

        sRowId1 = oRow.getAttribute("data-sap-ui-related"),
        sRowId2 = oRow.getAttribute("data-sap-ui"),
        sRowId = "";

    if (sRowId1 == null && sRowId2 == null) {
        return;
    }

    if (sRowId1) {
        sRowId = sRowId1;
    }

    if (sRowId2) {
        sRowId = sRowId2;
    }

    var oRow = sap.ui.getCore().byId(sRowId);
    if (!oRow) {
        return;
    }

    // 바인딩 정보가 없으면 빠져나간다.
    if (oRow.isEmpty()) {
        return;
    }

    var oCtx = oRow.getBindingContext(),
        sIconSrc = oCtx.getObject("ICON_SRC");

    // 콜백 여부에 따라 아이콘 url를 리턴
    _sendIconSrc(sIconSrc);

} // end of ev_iconListTableDblClick

/************************************************************************
 * 아이콘 그리드 리스트의 더블클릭 이벤트
 ************************************************************************/
function ev_iconGridListDblClick(oEvent) {

    let oTarget = oEvent.target,
        $SelectedGrid = $(oTarget).closest(".sapMLIB");

    if (!$SelectedGrid.length) {
        return;
    }

    let oGridListItemDOM = $SelectedGrid[0],

        sGridListItemId1 = oGridListItemDOM.getAttribute("data-sap-ui-related"),
        sGridListItemId2 = oGridListItemDOM.getAttribute("data-sap-ui"),
        sGridListItemId = "";

    if (sGridListItemId1 == null && sGridListItemId2 == null) {
        return;
    }

    if (sGridListItemId1) {
        sGridListItemId = sGridListItemId1;
    }

    if (sGridListItemId2) {
        sGridListItemId = sGridListItemId2;
    }

    let oGridListItem = sap.ui.getCore().byId(sGridListItemId);
    if (!oGridListItem) {
        return;
    }

    let oCtx = oGridListItem.getBindingContext();
    if (!oCtx) {
        return;
    }

    let sIconSrc = oCtx.getObject("ICON_SRC");

    // 콜백 여부에 따라 아이콘 url를 리턴
    _sendIconSrc(sIconSrc);

} // end of ev_iconGridListDblClick


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

    // IconTabBar Busy
    _setIconTabBarBusy(true);

    let oPrevPage = sap.ui.getCore().byId(sPrevKey);
    oPrevPage.setVisible(false);

    setTimeout(() => {

        let oNavi = sap.ui.getCore().byId("IconListNavCon");
        oNavi.to(sCurrKey);

    }, 100);

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

    let sIconSrc = oCtx.getObject("ICON_SRC");

    CLIPBOARD.writeText(sIconSrc);

    sap.m.MessageToast.show(oAPP.msg.M031); // Clipboard Copy Success!

    // // 콜백 여부에 따라 아이콘 url를 리턴
    // _sendIconSrc(sIconSrc);

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
 * 페이지 이동 후 발생하는 이벤트
 ************************************************************************/
function ev_iconListPageNavigation(oEvent) {

    let oToPage = oEvent.getParameter("to");

    oAPP.attr.oDelegate = {

        onAfterRendering: function (oEvent) {

            let oPage = oEvent.srcControl;

            // IconTabBar Busy
            _setIconTabBarBusy(false);

            // oPage.removeEventDelegate(oAPP.attr.oDelegate);

        }

    };

    // oToPage.addEventDelegate(oAPP.attr.oDelegate);

    oToPage.setVisible(true);

} // end of ev_iconListPageNavigation

/************************************************************************
 * 아이콘 탭바 Busy Indicator
 ************************************************************************/
function ev_searchFieldLiveChange(oEvent) {

    let oSearchField = oEvent.getSource(),
        sSearchValue = oSearchField.getValue();

    let oGridList = sap.ui.getCore().byId("iconGridList"),
        oTable = sap.ui.getCore().byId("iconListTable"),
        oGridListBindingInfo = oGridList.getBinding("items"),
        oTableBindingInfo = oTable.getBinding("rows");

    if (!oGridListBindingInfo || !oTableBindingInfo) {
        return;
    }

    if (sSearchValue === "") {
        oGridListBindingInfo.filter();
        oTableBindingInfo.filter();
        return;
    }

    var aFilters = [];

    aFilters.push(new sap.ui.model.Filter({ path: "KEYWORD_STRING", operator: "Contains", value1: sSearchValue }));
    aFilters.push(new sap.ui.model.Filter({ path: "ICON_SRC", operator: "Contains", value1: sSearchValue }));

    //model 필터 처리.
    oGridListBindingInfo.filter([new sap.ui.model.Filter(aFilters, false)]);
    oTableBindingInfo.filter([new sap.ui.model.Filter(aFilters, false)]);

} // end of ev_searchFieldLiveChange






/************************************************************************
 * [private] 아이콘 탭바 Busy Indicator
 ************************************************************************/
function _setIconTabBarBusy(bIsBusy) {

    let oIconTabBar = sap.ui.getCore().byId("iconListTabBar");
    oIconTabBar.setBusy(bIsBusy);

} // end of _setIconTabBarBusy

/************************************************************************
 * 콜백 여부에 따라 아이콘 url를 리턴
 ************************************************************************/
function _sendIconSrc(sIconSrc) {

    if (oAPP.attr.isCallback === "X") {

        PARWIN.webContents.send("if-icon-url-callback", { RETCD: "S", RTDATA: sIconSrc });

        CURRWIN.hide();

        CURRWIN.setParentWindow(null);

        return;
    }

} // end of _sendIconSrc










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


function getJsonAsync(sUrl, oParam) {

    return new Promise((resolve) => {

        let oResult = jQuery.sap.syncGetJSON(sUrl);
        if (oResult.error) {

            resolve({
                RETCD: "E",
                RTMSG: oResult.error.toString()
            });

            return;
        }

        resolve({
            RETCD: "S",
            RTDATA: oResult.data,
            PARAM: oParam
        });

        return;

    });

}

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
        XHR.onerror = function (oEvent) {

            resolve({ RETCD: "E" });

        };

        // Request Timeout 콜백
        XHR.ontimeout = function (oEvent) {

            resolve({ RETCD: "E" });

        };

        try {
            // FormData가 없으면 GET으로 전송
            XHR.open(oOptions.method, oOptions.url, oOptions.async);

            XHR.withCredentials = oOptions.withCredentials;
            XHR.timeout = 60000; // 1분
            XHR.responseType = oOptions.responseType;

            XHR.send(oOptions.formData);

        } catch (error) {
            resolve({ RETCD: "E" });
            // console.log(error.toString());
        }

    });

} // end of sendAjax


window.onload = function () {

    sap.ui.getCore().attachInit(() => {

        oAPP.fn.attachInit(); // [Async]

    });

};


// window.onbeforeunload = () => {

//     // 브라우저의 닫기 버튼을 누른게 아니라면 종료 하지 않음
//     if (oAPP.attr.isPressWindowClose !== "X") {
//         return false;
//     }


// };
