let oAPP = {};
let oHandle = {};
oHandle.UI = {};

/************************************************************************
 * UI5 BootStrap 
 ************************************************************************/
function onLoadBootStrapSetting() {

    var oSettings = oAPP.fnGetSettingsInfo(),
        oSetting_UI5 = oSettings.UI5,
        sVersion = oSetting_UI5.version,
        sTestResource = oSetting_UI5.testResource,
        sReleaseResource = `../../../../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
        bIsDev = oSettings.isDev,
        oBootStrap = oSetting_UI5.bootstrap,
        oUserInfo = oAPP.attr.oUserInfo,
        oThemeInfo = oAPP.attr.oThemeInfo,
        sLangu = oUserInfo.LANGU;

    var oScript = document.createElement("script");
    oScript.id = "sap-ui-bootstrap";

    // 공통 속성 적용
    for (const key in oBootStrap) {
        oScript.setAttribute(key, oBootStrap[key]);
    }

    // 로그인 Language 적용
    oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
    oScript.setAttribute("data-sap-ui-language", sLangu);
    oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.suite.ui.commons, sap.ui.commons, sap.ui.core, sap.ui.layout");

    // 개발일때와 release 할 때의 Bootstrip 경로 분기
    if (bIsDev) {
        oScript.setAttribute("src", sTestResource);
    } else {
        oScript.setAttribute("src", sReleaseResource);
    }

    document.head.appendChild(oScript);

} // end of onLoadBootStrapSetting

document.addEventListener('DOMContentLoaded', () => {

    //electron API 오브젝트 
    oAPP = parent.fn_getParent();

    oAPP.Octokit = oAPP.remote.require("@octokit/core").Octokit;

    //Releases Update data 통신방식 
    oHandle.isCDN = oAPP.fnGetIsCDN();

    var oSettings = oAPP.fnGetSettingsInfo(),
        oGitSettings = oSettings.GITHUB,
        sGitDevKey = oGitSettings.devKey;

    //GITHUB     
    oHandle.DEVKEY = atob(sGitDevKey);
    oHandle.OWNER = oGitSettings.OWNER; //기본값
    oHandle.REPO = oGitSettings.REPO; //폴더명

    //현재 WS3.0 버젼 
    oHandle.curVER = `v${oAPP.APP.getVersion()}`;
    // oHandle.curVER = "v3.0.0";

    var sServerPath = oAPP.fnGetServerPath();

    //SAP 서버 통신 URL     
    oHandle.sapURL = `${sServerPath}/GET_WS_RELEASE_DATA`;

    // UI5 BootStrap 
    onLoadBootStrapSetting();

});

window.addEventListener("load", () => {

    //UI5 Start 
    sap.ui.getCore().attachInit(function () {
        gfn_crtUI_Main();
    });

});

//==================================================================//
// Functions 
//==================================================================//


//Main UI 생성 - TimeLine body 생성 
function gfn_crtUI_Main() {

    let IsFirstRender = false;

    var APP = new sap.m.App({
        busyIndicatorDelay: 1,
        busy: false
    });

    oHandle.UI.PAGE = new sap.m.Page({
        busyIndicatorDelay: 1,
        busy: true,
        title: "U4A WorkSpace 3.0 Releases Notes"
    });
    APP.addPage(oHandle.UI.PAGE);

    var TIMELINE = new sap.suite.ui.commons.Timeline({
        busyIndicatorDelay: 1,
        axisOrientation: "Vertical",
        alignment: "Right",
        growingThreshold: 5,
        busy: true,
        groupBy: "dateTime",
        groupByType: "Year",
        lazyLoading: false,
        noDataText: "No release notes",
        enableDoubleSided: false,
        sortOldestFirst: false,
        showSearch: false,
        width: "100%"
    });

    TIMELINE.addEventDelegate({
        onAfterRendering: function (e) {
            if (IsFirstRender) {
                return;
            }
            IsFirstRender = true;
            gfn_crtUI_Item(sap.ui.getCore().byId(e.srcControl.sId));
        }
    }, this);

    oHandle.UI.PAGE.addContent(TIMELINE);
    oHandle.UI.TIMELINE = TIMELINE;
    APP.placeAt("Content");

}

// 릴리즈 노트 라인 아이템 구성 
function gfn_crtUI_Item(oParent) {

    debugger;
    
    switch (oHandle.isCDN) {
        case "X":
            gfn_crtUI_Item_GITHUB(oParent);
            break;

        case "":
            gfn_crtUI_Item_SAP(oParent);
            break;

    }

}

// 릴리즈 노트 라인 아이템 구성 - SAP 
function gfn_crtUI_Item_SAP(oParent) {
    
    debugger;

    let oformData = new FormData();
    oformData.append('VER', oHandle.curVER);
    oformData.append('ISADM', oAPP.ISADM);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", oHandle.sapURL, true);
    xhr.onreadystatechange = function (oEvent) {

        if (xhr.readyState == XMLHttpRequest.DONE) {

            try {
                
                debugger;

                var T_DATA = JSON.parse(xhr.response);

                for (let i = 0; i < T_DATA.length; i++) {

                    var sLine = T_DATA[i];
                    var LONGTXT = "<br><div style='background:white;'><br>" + sLine.LONGTXT + "<br><br></div>";

                    var Lyear = Number(sLine.ERDAT.substr(0, 4)),
                        Lmon = Number(sLine.ERDAT.substr(4, 2)),
                        Lmon = Lmon - 1,
                        Lday = Number(sLine.ERDAT.substr(6, 2)),
                        Lhour = Number(sLine.ERTIM.substr(0, 2)),
                        Lmin = Number(sLine.ERTIM.substr(2, 2));

                    var oDate = new Date(Lyear, Lmon, Lday, Lhour, Lmin);

                    var Licon = "sap-icon://chevron-phase",
                        Lstat = "None";

                    if (oHandle.curVER === sLine.VERSN) {
                        Licon = "sap-icon://favorite";
                        Lstat = "Information";
                    }

                    var TIMELINEITEM = new sap.suite.ui.commons.TimelineItem({
                        dateTime: oDate,
                        icon: Licon,
                        status: Lstat,
                        userName: sLine.VERSN,
                        userNameClickable: true,
                        filterValue: sLine.VERSN,
                        title: sLine.VRTIL,
                        userPicture: "logo.png"
                    });


                    var HTML = new sap.ui.core.HTML({
                        content: LONGTXT
                    });
                    TIMELINEITEM.setEmbeddedControl(HTML);

                    oParent.addContent(TIMELINEITEM);


                }

                //waiting off
                oHandle.UI.PAGE.setBusy(false);
                oHandle.UI.TIMELINE.setBusy(false);

            } catch (err) {

                //waiting off
                oHandle.UI.PAGE.setBusy(false);
                oHandle.UI.TIMELINE.setBusy(false);

            }

        }

    };

    xhr.send(oformData);

}


// 릴리즈 노트 라인 아이템 구성 - GITHUB
async function gfn_crtUI_Item_GITHUB(oParent) {

    let regex = /[^0-9]/g;
    let LcurVER = Number(oHandle.curVER.replace(regex, ""));

    var octokit = new oAPP.Octokit({
        auth: oHandle.DEVKEY
    });

    var URL = "https://api.github.com/repos/" + oHandle.OWNER + "/" + oHandle.REPO + "/releases";

    var response = await octokit.request(URL, {
        owner: oHandle.OWNER, //기본값
        repo: oHandle.REPO, //github 설치 폴더명

    });

    var len = response.data.length;

    for (let i = 0; i < len; i++) {

        var sLine = response.data[i];

        var LVER = Number(sLine.tag_name.replace(regex, ""));

        if (LVER > LcurVER) {
            continue;
        }

        var LONGTXT = "<br><div style='background:white;'><br>" + sLine.body + "<br><br></div>";

        var oDate = new Date(sLine.published_at);

        var Licon = "sap-icon://heart-2",
            Lstat = "None",
            Ltitle = "";

        if (oHandle.curVER === sLine.tag_name) {
            Licon = "sap-icon://heart";
            Lstat = "Information";
            Ltitle = "Latest";
        }

        var TIMELINEITEM = new sap.suite.ui.commons.TimelineItem({
            dateTime: oDate,
            icon: Licon,
            status: Lstat,
            userName: sLine.tag_name,
            userNameClickable: true,
            filterValue: sLine.tag_name,
            title: sLine.name,
            userPicture: "logo.png"
        });


        var HTML = new sap.ui.core.HTML({
            content: LONGTXT
        });
        TIMELINEITEM.setEmbeddedControl(HTML);

        oParent.addContent(TIMELINEITEM);

    }


    //waiting off
    oHandle.UI.PAGE.setBusy(false);
    oHandle.UI.TIMELINE.setBusy(false);


}