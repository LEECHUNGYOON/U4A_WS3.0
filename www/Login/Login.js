/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : Login.js
 * - file Desc : WS Login Page
 ************************************************************************/

let oAPP = (function () {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        PATH = parent.PATH,
        REGEDIT = parent.REGEDIT,
        APP = parent.APP,
        USERPATH = APP.getPath("userData"),
        FS = parent.FS,
        require = parent.require;

    let oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.events = {};

    /**
     * Default Browser 기준정보
     *  @ !! 위에서 부터 Default 값 우선 순위 브라우저임!! @@
     */
    oAPP.attr.aDefaultBrowsers = [{
            NAME: "CHROME",
            DESC: "Google Chrome Browser",
            REGPATH: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"
        },
        {
            NAME: "MSEDGE",
            DESC: "Microsoft Edge",
            REGPATH: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe"
        },
        {
            NAME: "IE",
            DESC: "Microsoft Internet Explorer",
            REGPATH: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\IEXPLORE.EXE"
        },
    ];

    oAPP.fn.getDefaultBrowserInfo = () => {
        return oAPP.attr.aDefaultBrowsers;
    };

    // 현재 PC에 설치되어 있는 브라우저 설치 경로를 구한다.
    oAPP.fn.fnCheckIstalledBrowser = () => {

        // Default Browser 정보를 구한다.
        var aDefaultBrowsers = oAPP.fn.getDefaultBrowserInfo(),
            iBrowsCnt = aDefaultBrowsers.length;

        var aPromise = [];

        // Default Browser 기준으로 현재 내 PC에 해당 브라우저가 설치되어 있는지 
        // 레지스트리를 확인하여 설치 경로를 구한다.
        for (var i = 0; i < iBrowsCnt; i++) {

            var oPromise = oAPP.fn.fnGetBrowserInfoPromise(aDefaultBrowsers, i);

            aPromise.push(oPromise);

        }

        Promise.all(aPromise).then((aValues) => {

            parent.setDefaultBrowserInfo(aValues);

        });

    }; // end of fnCheckIstalledBrowser

    /************************************************************************
     * 레지스트리를 확인하여 각 브라우저별 설치 경로를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetBrowserInfoPromise = (aDefaultBrowsers, index) => {

        var oDefBrows = aDefaultBrowsers[index],
            sRegPath = oDefBrows.REGPATH;

        var oProm = new Promise((resolve, reject) => {

            REGEDIT.list(sRegPath, (err, result) => {

                var oRETURN = Object.assign({}, aDefaultBrowsers[index]);

                // 레지스터에 해당 패스가 없을 경우 오류 처리..
                if (err) {

                    resolve(oRETURN);
                    return;

                }

                // 해당 브라우저가 설치 되어있으면 실제 설치된 경로를 매핑한다.
                var sObjKey = Object.keys(result)[0],
                    oPathObj = result[sObjKey],
                    oExePathObj = oPathObj.values[""];

                oRETURN.INSPATH = oExePathObj.value;

                resolve(oRETURN);

            });

        });

        return oProm;

    }; // end of fn_onPromise

    /************************************************************************
     * WS의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetSettingsInfo = () => {

        // Browser Window option
        var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/ws_settings.json"),

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(sSettingsJsonPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of fnGetSettingsInfo

    /************************************************************************
     * WS의 UI5 Bootstrap 정보를 생성한다.
     ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = () => {

        var oSettings = oAPP.fn.fnGetSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            sVersion = oSetting_UI5.version,
            sTestResource = oSetting_UI5.testResource,
            sReleaseResource = `../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
            bIsDev = oSettings.isDev,
            oBootStrap = oSetting_UI5.bootstrap,
            sLangu = navigator.language;

        sLangu = sLangu.toLowerCase().substring(0, 2); // 저장된 언어 값을 0부터 2까지 자르고 소문자로 변환하여 lang에 저장
        sLangu = sLangu.toUpperCase();

        var oScript = document.createElement("script");
        if (oScript == null) {
            return;
        }

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.f, sap.ui.layout");
        oScript.setAttribute("data-sap-ui-theme", "sap_fiori_3");

        // 개발일때와 release 할 때의 Bootstrip 경로 분기
        if (bIsDev) {
            oScript.setAttribute("src", sTestResource);
        } else {
            oScript.setAttribute("src", sReleaseResource);
        }

        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting

    /************************************************************************
     * 로그인 페이지의 form
     ************************************************************************/
    oAPP.fn.fnGetLoginForm = () => {

        return new sap.ui.layout.form.Form({
            editable: true,

            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                labelSpanL: 12,
                labelSpanM: 12,
                labelSpanS: 12
            }),

            formContainers: [
                new sap.ui.layout.form.FormContainer({
                    formElements: [

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: "CLIENT"
                            }),
                            fields: [
                                new sap.m.Input({
                                    type: sap.m.InputType.Number,
                                    value: "{CLIENT}",
                                    width: "100px",
                                    submit: oAPP.events.ev_login
                                })
                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: "ID"
                            }),
                            fields: [

                                new sap.m.SearchField("ws_id", {
                                    value: "{ID}",
                                    showSearchButton: false,
                                    placeholder: "　",
                                    suggest: function (oEvent) {

                                        var sValue = oEvent.getParameter("suggestValue"),
                                            aFilters = [];

                                        if (sValue) {

                                            aFilters = [
                                                new sap.ui.model.Filter([
                                                    new sap.ui.model.Filter("ID", function (sText) {
                                                        return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                                                    }),
                                                ], false)
                                            ];

                                        }

                                        this.getBinding("suggestionItems").filter(aFilters);
                                        this.suggest();

                                    },
                                    search: function (oEvent) {

                                        var bIsPressClearBtn = oEvent.getParameter("clearButtonPressed");
                                        if (bIsPressClearBtn) {
                                            return;
                                        }

                                        var oSuggetionItem = oEvent.getParameter("suggestionItem");
                                        if (oSuggetionItem) {
                                            return;
                                        }

                                        var iKeyCode = event.keyCode;
                                        if (iKeyCode != 13) {
                                            return;
                                        }

                                        oAPP.events.ev_login();

                                    },
                                    enableSuggestions: true,
                                    suggestionItems: {
                                        path: "/LOGIN/IDSUGG",
                                        sorter: "{ path : '/LOGIN/IDSUGG/ID' }",
                                        template: new sap.m.SuggestionItem({
                                            key: "{ID}",
                                            text: "{ID}",
                                        })
                                    }
                                }),

                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: "PASSWORD"
                            }),
                            fields: [
                                new sap.m.Input("ws_pw", {
                                    type: sap.m.InputType.Password,
                                    value: "{PW}",
                                    submit: oAPP.events.ev_login
                                })
                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: "LANGUAGE"
                            }),
                            fields: [
                                new sap.m.Input({
                                    value: "{LANGU}",
                                    submit: oAPP.events.ev_login
                                })
                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: "Remember ID"
                            }),
                            fields: [
                                new sap.m.CheckBox({
                                    selected: "{REMEMBER}"
                                })
                            ]
                        }),

                    ]
                })

            ] // end of formContainers

        });

    }; // end of oAPP.fn.fnGetLoginForm

    /************************************************************************
     * U4A R&D Staff 자동 로그인 버튼
     ************************************************************************/
    oAPP.fn.fnGetStaffLoginButton = () => {

        return [

            new sap.m.Button({
                text: "영선",
                press: function () {
                    oAPP.fn.fnStaffLogin("yshong");
                }
            }),
            new sap.m.Button({
                text: "성호",
                press: function () {
                    oAPP.fn.fnStaffLogin("shhong");
                }
            }).addStyleClass("sapUiTinyMarginBeginEnd"),
            new sap.m.Button({
                text: "은섭",
                press: function () {
                    oAPP.fn.fnStaffLogin("pes");
                }
            }),
            new sap.m.Button({
                text: "청윤",
                press: function () {
                    oAPP.fn.fnStaffLogin("soccerhs");
                }
            }).addStyleClass("sapUiTinyMarginBeginEnd"),

        ];

    }; // end of oAPP.fn.fnGetStaffLoginButton

    /************************************************************************
     * U4A R&D Staff 자동 로그인
     ************************************************************************/
    oAPP.fn.fnStaffLogin = (sStaffID) => {

        var oId = sap.ui.getCore().byId("ws_id"),
            oPw = sap.ui.getCore().byId("ws_pw"),
            oLogInBtn = sap.ui.getCore().byId("ws_loginBtn");

        oId.setValue(sStaffID);

        switch (sStaffID) {
            case "yshong":
                oPw.setValue("1qazxsw2");
                break;

            case "shhong":
                oPw.setValue("2wsxzaq1!");
                break;

            case "pes":
                oPw.setValue("dmstjq8!");
                break;

            case "soccerhs":
                oPw.setValue("cjddbs12");
                break;

        }

        oLogInBtn.firePress();

    }; // end of oAPP.fn.fnStaffLogin

    /************************************************************************
     * 로그인 페이지의 form 영역을 감싸는 Card (sap.f.Card)
     ************************************************************************/
    oAPP.fn.fnGetLoginFormFCard = () => {

        var oForm = oAPP.fn.fnGetLoginForm(),
            aStaffBtns = oAPP.fn.fnGetStaffLoginButton();

        return new sap.f.Card({
            width: "50%",

            header: new sap.f.cards.Header({
                iconSrc: "../img/logo.png",
                title: "U4A Workspace Login",
                iconDisplayShape: sap.m.AvatarShape.Square,

            }),
            content: new sap.m.VBox({
                width: "100%",
                renderType: sap.m.FlexRendertype.Bare,

                layoutData: new sap.m.FlexItemData({
                    styleClass: "sapUiTinyMarginTop"
                }),
                items: [

                    oForm,

                    new sap.m.Button("ws_loginBtn", {
                        text: "LOGIN",
                        width: "100%",
                        type: sap.m.ButtonType.Emphasized,
                        press: oAPP.events.ev_login
                    }),

                    new sap.m.HBox({
                        items: aStaffBtns,
                        layoutData: new sap.m.FlexItemData({
                            styleClass: "sapUiTinyMarginTop"
                        }),
                    })

                ]

            })

        }).addStyleClass("u4aWsLoginFormFcard sapUiContentPadding");

    }; // end of oAPP.fn.fnGetLoginFormFCard

    /************************************************************************
     * 로그인 페이지
     ************************************************************************/
    oAPP.fn.fnGetLoginPage = () => {

        var oFcard = oAPP.fn.fnGetLoginFormFCard();

        return new sap.m.Page({
                showHeader: false,
                showFooter: true,
                backgroundDesign: sap.m.PageBackgroundDesign.Transparent,

                content: [

                    new sap.m.VBox({

                        // properties
                        alignItems: sap.m.FlexAlignItems.Center,
                        renderType: sap.m.FlexRendertype.Bare,
                        alignItems: sap.m.FlexAlignItems.Center,
                        justifyContent: sap.m.FlexJustifyContent.Center,
                        width: "100%",
                        height: "100%",

                        // Aggregations
                        items: [
                            oFcard
                        ]

                    })

                ],
                footer: new sap.m.Toolbar({
                    content: [
                        new sap.m.Text({
                            text: "Copyright 2022. Infocg inc. all rights reserved."
                        }),

                        new sap.m.ToolbarSpacer(),

                        // new sap.m.Text({
                        //     text: "CLIENT: {/LOGIN/CLIENT}"
                        // }),

                        new sap.m.Text({
                            text: "SYSID: {/LOGIN/SYSID}"
                        }),

                    ]
                }).addStyleClass("sapUiSizeCompact")

            })
            .bindElement("/LOGIN")
            .addStyleClass("u4aWsLoginPage");

    }; // end of oAPP.fn.fnGetLoginPage

    /************************************************************************
     * 로그인 페이지 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnOnInitRendering = () => {

        var oApp = new sap.m.App({
            autoFocus: false,
        });

        var oPage = oAPP.fn.fnGetLoginPage();

        oApp.addPage(oPage);
        oApp.placeAt("content");

    }; // end of oAPP.fn.fnOnInitRendering

    /************************************************************************
     * 로그인 페이지 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnOnInitModelBinding = () => {

        var oServerInfo = parent.getServerInfo(),
            bIsRemember = oAPP.fn.fnGetRememberCheck(),
            sRememberId = oAPP.fn.fnGetRememberID();

        var oModelData = {
            CLIENT: oServerInfo.CLIENT,
            ID: sRememberId,
            PW: "",
            LANGU: oServerInfo.LANGU,
            SYSID: oServerInfo.SYSID,
            REMEMBER: bIsRemember,
            IDSUGG: []
        };

        var aIDSugg = oAPP.fn.fnReadIDSuggData();

        oModelData.IDSUGG = aIDSugg;

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            LOGIN: oModelData
        });

        var oCoreModel = sap.ui.getCore().getModel();
        if (oCoreModel == null) {
            sap.ui.getCore().setModel(oJsonModel);
            return;
        }

        oCoreModel.setModel(oJsonModel);

    }; // end of oAPP.fn.fnOnInitModelBinding

    /************************************************************************
     * 로그인 버튼 클릭
     ************************************************************************/
    oAPP.events.ev_login = () => {

        let oCoreModel = sap.ui.getCore().getModel();
        if (oCoreModel == null) {
            return;
        }

        let oLogInData = oCoreModel.getProperty("/LOGIN");
        if (oLogInData == null) {
            return;
        }

        var oResult = oAPP.fn.fnLoginCheck(oLogInData.ID, oLogInData.PW, oLogInData.CLIENT, oLogInData.LANGU);
        if (oResult.RETCD == 'E') {

            // 메시지 처리.. 
            parent.showMessage(null, 99, "E", oResult.MSG);
            return;

        }

        var sServicePath = parent.getServerPath() + "/wsloginchk";

        var oFormData = new FormData();
        oFormData.append("sap-user", oLogInData.ID);
        oFormData.append("sap-password", oLogInData.PW);
        oFormData.append("sap-client", oLogInData.CLIENT);
        oFormData.append("sap-language", oLogInData.LANGU);

        parent.setBusy('X');

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () { // 요청에 대한 콜백
            if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
                if (xhr.status === 200 || xhr.status === 201) {

                    parent.setBusy('');

                    var oResult = JSON.parse(xhr.responseText);
                    if (oResult.TYPE == "E") {

                        // 오류 처리..                   
                        parent.showMessage(null, 99, "E", oResult.MSG);

                        return;
                    }

                    parent.showLoadingPage('X');

                    oAPP.fn.fnOnLoginSuccess(oResult);

                } else {

                    parent.showMessage(null, 99, "E", xhr.responseText);

                }
            }
        };

        xhr.open('POST', sServicePath); // 메소드와 주소 설정
        xhr.send(oFormData); // 요청 전송         

    }; // end of oAPP.events.ev_login

    /************************************************************************
     * 로그인 성공시 
     ************************************************************************/
    oAPP.fn.fnOnLoginSuccess = (oResult) => {

        let oCoreModel = sap.ui.getCore().getModel();
        if (oCoreModel == null) {
            return;
        }

        let oLogInData = oCoreModel.getProperty("/LOGIN");
        if (oLogInData == null) {
            return;
        }

        // ID 저장 체크 박스값 저장
        oAPP.fn.fnSaveRememberCheck(oLogInData.REMEMBER);

        // 로그인 아이디 저장
        oAPP.fn.fnSaveIDSuggData(oLogInData.ID);


        // 로그인 유저의 아이디/패스워드를 암호화해서 저장해둔다.    
        parent.setUserInfo(oLogInData);

        // Metadata 정보 세팅 (서버 호스트명.. 또는 메시지 클래스 데이터 등..)
        if (oResult.META) {
            parent.setMetadata(oResult.META);
        }

        parent.document.body.style.backgroundColor = "#1c2228";

        var oCurrWin = parent.REMOTE.getCurrentWindow();

        oCurrWin.setBackgroundColor("#1c2228");

        parent.onMoveToPage("WS10");

    };

    /************************************************************************
     * 자연스러운 로딩
     ************************************************************************/
    oAPP.fn.fnOnSmoothLoading = () => {

        // var oCurrWin = REMOTE.getCurrentWindow();
        // oCurrWin.show();

        setTimeout(() => {

            // oCurrWin.setOpacity(1.0);

            $('#content').fadeIn(300, 'linear');

        }, 500);

    }; // end of oAPP.fn.fnOnSmoothLoading 

    /************************************************************************
     *---------------------[ U4A WS Login Page Start ] ----------------------
     ************************************************************************/
    oAPP.fn.fnAttachInit = () => {

        sap.ui.getCore().attachInit(() => {

            // 초기값 바인딩
            oAPP.fn.fnOnInitModelBinding();

            // 로그인 페이지 초기 렌더링
            oAPP.fn.fnOnInitRendering();

            fnSetBusy('');

            // 자연스러운 로딩
            oAPP.fn.fnOnSmoothLoading();

            // // 초기값 바인딩
            // fnOnInitBinding();

            // // 브라우저 상단 메뉴 구성
            // fnOnBrowserMenuList();

            // // 초기 로딩 시, 필요한 인스턴스 생성
            // fnOnInitInstanceCreate();

            // // UI5의 필요한 Object 로드
            // fnOnInitUi5LibraryPreload();

            // // 언어별 텍스트 목록 구하기
            // fnLoadLanguClass(navigator.language);

            // // 서버 리스트 개인화 정보 설정
            // fnOnP13nConfig();

            // // 서버 리스트 초기 화면 그리기
            // fnOnInitRendering();

        });

    }; // end of oAPP.fn.fnAttachInit

    oAPP.fn.fnLoginCheck = (ID, PW, CLIENT, LANGU) => {

        var oCheck = {
            RETCD: "S",
            MSG: ""
        };

        if (isEmpty(CLIENT) === true || isBlank(CLIENT) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "Client is Required!";

            return oCheck;

        }

        if (isEmpty(ID) === true || isBlank(ID) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "ID is Required!";

            return oCheck;

        }

        if (isEmpty(PW) === true || isBlank(PW) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "PW is Required!";

            return oCheck;

        }

        if (isEmpty(LANGU) === true || isBlank(LANGU) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "Language is Required!";

            return oCheck;

        }

        return oCheck;

    };


    oAPP.fn.fnGetRememberID = () => {

        var bIsRemember = oAPP.fn.fnGetRememberCheck();
        if (!bIsRemember) {
            return "";
        }

        var aIds = oAPP.fn.fnReadIDSuggData(),
            iIdLength = aIds.length;

        if (iIdLength <= 0) {
            return "";
        }

        return aIds[0].ID;

    };


    oAPP.fn.fnSaveRememberCheck = (bIsRemember) => {

        let sJsonPath = PATH.join(USERPATH, "p13n", "login.json"),
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            oLoginInfo = JSON.parse(sJsonData);

        if (typeof oLoginInfo !== "object") {
            oLoginInfo = {};
        }

        oLoginInfo.bIsRemember = bIsRemember;

        // login.json 파일에 ID Suggestion 정보 저장
        FS.writeFileSync(sJsonPath, JSON.stringify(oLoginInfo));

    };

    oAPP.fn.fnGetRememberCheck = () => {

        let sJsonPath = PATH.join(USERPATH, "p13n", "login.json"),
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            oLoginInfo = JSON.parse(sJsonData);

        if (typeof oLoginInfo != "object" || oLoginInfo.bIsRemember == null) {
            return false;
        }

        return oLoginInfo.bIsRemember;

    }; // end of oAPP.fn.fnGetRememberCheck

    /************************************************************************
     * ID Suggestion Data Save
     ************************************************************************/
    oAPP.fn.fnSaveIDSuggData = (ID) => {

        const iIdSuggMaxCnt = 10;

        let sJsonPath = PATH.join(USERPATH, "p13n", "login.json"),
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            oLoginInfo = JSON.parse(sJsonData);

        if (typeof oLoginInfo !== "object") {
            oLoginInfo = {};
        }

        if (oLoginInfo.aIds == null) {
            oLoginInfo.aIds = [];
            oLoginInfo.aIds.push({
                ID: ID
            });

            // login.json 파일에 ID Suggestion 정보 저장
            FS.writeFileSync(sJsonPath, JSON.stringify(oLoginInfo));

            return;
        }

        let aIds = oLoginInfo.aIds;

        // 저장하려는 ID가 이미 있으면
        // 해당 ID를 Suggestion 최상단에 배치한다. 
        var iFindIndex = aIds.findIndex(a => a.ID == ID);

        // 저장하려는 ID가 이미 있고 Array에 가장 첫번째에 있으면 빠져나간다.    
        if (iFindIndex == 0) {
            return;
        }

        // 저장하려는 ID가 이미 있고 Array에 첫번째가 아니면 
        // 기존 저장된 위치의 ID 정보를 삭제
        if (iFindIndex > 0) {
            aIds.splice(iFindIndex, 1);
        }

        // 저장된 Suggestion 갯수가 iIdSuggMaxCnt 이상이면
        // 마지막거 지우고 최신거를 1번째로 저장한다.
        var iBeforeCnt = aIds.length;

        if (iBeforeCnt >= iIdSuggMaxCnt) {
            aIds.pop();
        }

        // ID를 Array의 가장 첫번째로 넣는다.
        aIds.unshift({
            ID: ID
        });

        oLoginInfo.aIds = aIds;

        // login.json 파일에 ID Suggestion 정보 저장
        FS.writeFileSync(sJsonPath, JSON.stringify(oLoginInfo));

    }; // end of oAPP.fn.fnSaveIDSuggData

    /************************************************************************
     * ID Suggestion Data Read
     ************************************************************************/
    oAPP.fn.fnReadIDSuggData = () => {

        let sJsonPath = PATH.join(USERPATH, "p13n", "login.json"),
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            oLoginInfo = JSON.parse(sJsonData);

        if (typeof oLoginInfo != "object" || oLoginInfo.aIds == null) {
            return [];
        }

        return oLoginInfo.aIds;

    }; // end of oAPP.fn.fnReadIDSuggData

    return oAPP;

})();


function fnSetBusy(bIsShow) {

    var oLoadPg = document.getElementById("u4a_main_load");

    if (!oLoadPg) {
        return;
    }

    if (bIsShow == 'X') {
        oLoadPg.classList.remove("u4a_loadersInactive");
    } else {
        oLoadPg.classList.add("u4a_loadersInactive");
    }

}

fnSetBusy('X');

oAPP.fn.fnLoadBootStrapSetting();

window.onload = () => {

    // Default Browser check
    oAPP.fn.fnCheckIstalledBrowser();

    oAPP.fn.fnAttachInit();

};

document.addEventListener('DOMContentLoaded', function () {

    // parent.fn_onWinMove(false, parent.REMOTE.getCurrentWindow());

    // 브라우저 zoom 레벨을 수정 한 후 로그인 페이지로 이동 시 기본 zoom 레벨 적용
    parent.WEBFRAME.setZoomLevel(0);

    console.log("DOMContentLoaded_1");

});

function isBlank(s) {
    return isEmpty(s.trim());
}

function isEmpty(s) {
    return !s.length;
}