/**************************************************************************
 * intro.js
 * ************************************************************************
 * - Application Intro
 **************************************************************************/

(function () {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};

    let REMOTE = require('@electron/remote'),
        REMOTEMAIN = REMOTE.require('@electron/remote/main'),
        APP = REMOTE.app,
        PATH = REMOTE.require('path'),
        APPPATH = APP.getAppPath(),
        USERDATA = APP.getPath("userData"),
        FS = REMOTE.require('fs-extra');

    oAPP.fn.fnOnDeviceReady = function () {

        // 초기 설치(기본 폴더, vbs 옮기기 등등)
        oAPP.fn.setInitInstall(function () {

            setTimeout(function () {

                oAPP.fn.fnOpenServerList();

            }, 3000);

        });

    }; // end of oAPP.fn.fnOnDeviceReady   

    oAPP.fn.fnOpenServerList = function () {

        // Electron Browser Default Options
        var sSettingsJsonPath = PATH.join(APPPATH, '/settings/BrowserWindow/BrowserWindow-settings.json'),
            oBrowserOptions = require(sSettingsJsonPath),
            oBrowserWindow = JSON.parse(JSON.stringify(oBrowserOptions.browserWindow));

        oBrowserWindow.backgroundColor = "#1c2228";
        oBrowserWindow.opacity = 0.0;
        // oBrowserWindow.show = false;

        // 인트로 화면 닫기
        let oCurrWindow = REMOTE.getCurrentWindow();
        oCurrWindow.hide();

        // Server List 화면 오픈
        let oWin = new REMOTE.BrowserWindow(oBrowserWindow);
        REMOTEMAIN.enable(oWin.webContents);

        // 브라우저 상단 메뉴 없애기
        oWin.setMenu(null);

        oWin.loadURL(PATH.join(APPPATH, '/ServerList/ServerFrame.html'));

        // oWin.webContents.openDevTools();

        oWin.webContents.on('did-finish-load', function () {

            oWin.webContents.send('window-id', oWin.id);

            oWin.setOpacity(1.0);

            oCurrWindow.close();

        });

        oWin.on('closed', () => {
            oWin = null;
            oCurrWindow.close();
        });

    };

    /************************************************************************
     * WS 초기 설치
     ************************************************************************
     * 1. WS 구동에 필요한 폴더를 생성 및 파일 복사를 수행
     * 2. 설치 경로는 WS가 설치된 userData
     *    예) C:\Users\[UserName]\AppData\Roaming\com.u4a_ws.app
     ************************************************************************/
    oAPP.fn.setInitInstall = function (fnCallback) {

        var oSettingsPath = PATH.join(APPPATH, "settings", "ws_settings.json"),
            oSettings = require(oSettingsPath),
            aPaths = oSettings.requireFolders, // 필수 폴더 리스트
            aFiles = oSettings.requireFiles, // 필수 파일 리스트
            iFileLength = aFiles.length,
            iPathLength = aPaths.length,
            sAppPath = APP.getPath("userData"); // 앱이 설치된 경로

        var aPromise = [],
            oMkdirOptions = {
                recursive: true, // 상위 폴더까지 자동 생성
                mode: 0o777 // 생성시 권한 부여
            };

        // 필수 폴더를 생성한다.
        for (var i = 0; i < iPathLength; i++) {

            var sPath = aPaths[i],
                sFullPath = PATH.join(sAppPath, sPath);

            if (FS.existsSync(sFullPath)) {
                continue;
            }

            aPromise.push(new Promise(function (resolve, reject) {

                FS.mkdir(sFullPath, oMkdirOptions, function (err) {

                    if (err) {
                        reject(err.toString());
                        return;
                    }

                    resolve();

                });

            }));

        }

        // 필수 파일을 생성한다.
        for (var j = 0; j < iFileLength; j++) {

            var sFileName = aFiles[j],
                sFileFullPath = PATH.join(sAppPath, sFileName);

            if (FS.existsSync(sFileFullPath)) {
                continue;
            }

            aPromise.push(new Promise((resolve, reject) => {

                FS.writeFile(sFileFullPath, JSON.stringify(""), {
                    encoding: "utf8",
                    mode: 0o777 // 올 권한
                }, function (err) {

                    if (err) {
                        reject(err.toString());
                        return;
                    }

                    resolve();

                });

            }));

        }

        let oHelpDocuPromise = oAPP.fn.fnInstallHelpDocument();

        aPromise.push(oHelpDocuPromise);

        // 상위 폴더를 생성 후 끝나면 실행
        Promise.all(aPromise).then(function (values) {
         
            oAPP.fn.copyVbsToLocalFolder(function (oResult) {

                if (oResult.RETCD == 'E') {
                    alert(oResult.MSG);
                    return;
                }

                fnCallback();

            });

        }).catch(function (err) {

            alert(err.toString());

        });

    }; // end of oAPP.fn.setInitInstall    

    /************************************************************************
     * build된 폴더에서 vbs 파일을 로컬 폴더로 복사한다.
     ************************************************************************/
    oAPP.fn.copyVbsToLocalFolder = function (fnCallback) {

        var sVbsFolderPath = PATH.join(APPPATH, "vbs"),
            aVbsFolderList = FS.readdirSync(sVbsFolderPath),
            iFileCount = aVbsFolderList.length;

        if (iFileCount <= 0) {
            return;
        }

        var oResult = {
            RETCD: "",
            MSG: ""
        };

        var aPromise = [];

        for (var i = 0; i < iFileCount; i++) {

            var sFile = aVbsFolderList[i];
            if (!sFile.endsWith(".vbs")) {
                continue;
            }

            var sVbsPath = sVbsFolderPath + "\\" + sFile;

            var oPromise = oAPP.fn.copyVbsPromise(sFile, sVbsPath);

            aPromise.push(oPromise);

        }

        Promise.all(aPromise).then((aValues) => {

            oResult.RETCD = 'S';

            fnCallback(oResult);

        }).catch(function (err) {

            oResult.RETCD = 'E';
            oResult.MSG = err.toString();

            fnCallback(oResult);

        });

    }; // end of oAPP.fn.copyVbsToLocalFolder

    oAPP.fn.copyVbsPromise = function (sFile, sVbsOrigPath) {

        var oSettingsPath = PATH.join(APPPATH, "settings") + "\\ws_settings.json",
            oSettings = require(oSettingsPath),
            sUserDataPath = APP.getPath("userData"),
            sVbsFolderPath = oSettings.vbs.rootPath,
            sVbsFullPath = PATH.join(sUserDataPath, sVbsFolderPath, sFile);

        return new Promise((resolve, reject) => {

            FS.copy(sVbsOrigPath, sVbsFullPath, {
                overwrite: true,
            }).then(function () {

                resolve("X");

            }).catch(function (err) {
                reject(err.toString());
            });

        });

    }; // end of oAPP.fn.copyVbsPromise

    /************************************************************************
     * U4A help document를 로컬에 설치한다.
     ************************************************************************/
    oAPP.fn.fnInstallHelpDocument = () => {

        return new Promise((resolve, reject) => {

            let lf_err = (e) => {
                    reject(err.toString());
                },

                // 파일 압축 풀기 성공 콜백
                lf_FileExtractSuccess = () => {
                    resolve();
                },

                // copy 성공 콜백
                lf_CopySuccess = () => {

                    oAPP.fn.fnCopyHelpDocFileExtract()
                        .then(lf_FileExtractSuccess)
                        .catch(lf_err);
                };

            // help docu file 복사    
            oAPP.fn.fnCopyHelpDocFile()
                .then(lf_CopySuccess)
                .catch(lf_err);

        }); // end of promise

    }; // end of oAPP.fn.fnInstallHelpDocument

    /************************************************************************
     * U4A help document 파일을 로컬에 복사
     ************************************************************************/
    oAPP.fn.fnCopyHelpDocFile = () => {

        return new Promise((resolve, reject) => {

            var oSettingsPath = PATH.join(APPPATH, "settings", "ws_settings.json"),
                oSettings = require(oSettingsPath),
                sHelpDocOriginFile = PATH.join(APPPATH, oSettings.path.u4aHelpDocFilePath),
                sHelpDocTargetPath = PATH.join(USERDATA, oSettings.path.u4aHelpDocFilePath);

            //1. Document File을 복사한다.
            FS.copy(sHelpDocOriginFile, sHelpDocTargetPath, {
                overwrite: true,
            }).then(function () {

                resolve();

            }).catch(function (err) {
                reject(err.toString());
            });

        });

    }; // end of oAPP.fn.fnCopyHelpDocFile

    /************************************************************************
     * U4A help document 파일을 로컬에 복사
     ************************************************************************/
    oAPP.fn.fnCopyHelpDocFileExtract = () => {

        return new Promise((resolve, reject) => {

            let oSettingsPath = PATH.join(APPPATH, "settings", "ws_settings.json"),
                oSettings = require(oSettingsPath),
                sHelpDocFolderPath = PATH.join(USERDATA, oSettings.path.u4aHelpDocFolderPath),
                sHelpDocTargetPath = PATH.join(USERDATA, oSettings.path.u4aHelpDocFilePath);

            let ZIP = require("zip-lib"),
                UNZIP = new ZIP.Unzip({
                    // Called before an item is extracted.
                    onEntry: function (event) {
                        console.log(event.entryCount, event.entryName);
                    }
                });

            UNZIP.extract(sHelpDocTargetPath, sHelpDocFolderPath, {
                    overwrite: true
                })
                .then(function () {

                    resolve();

                }, function (err) {

                    reject(err.toString());

                });

        }); // end of promise

    }; // end of oAPP.fn.fnCopyHelpDocFileExtract

    document.addEventListener('deviceready', oAPP.fn.fnOnDeviceReady, false);

})();