((oAPP) => {
    "use strict";

    /************************************************************************
     * 마우스 휠 이벤트 적용하기 (줌 기능)
     ************************************************************************/
    oAPP.fn.fnAttachMouseWheelEvent = () => {

        var remote = parent.REMOTE;

        var web = remote.getCurrentWebContents();

        oAPP.attr.scale = web.getZoomLevel();

        document.addEventListener('mousewheel', (ev) => {

            if (ev.ctrlKey) {

                oAPP.attr.scale += ev.deltaY * -0.01;
                oAPP.attr.scale = Math.min(Math.max(-10, oAPP.attr.scale), 10);
                // console.log(oAPP.attr.scale);
                web.setZoomLevel(oAPP.attr.scale);

                // zoom 정보 저장
                if (oAPP.attr.zoomSetTimeOut) {
                    clearTimeout(oAPP.attr.zoomSetTimeOut);
                    delete oAPP.attr.zoomSetTimeOut;
                }

                oAPP.attr.zoomSetTimeOut = setTimeout(() => {

                    oAPP.fn.setPersonWinZoom("S");
                    console.log("zoom 저장!!");

                }, 500);

            }

        });

    }; // end of oAPP.fn.fnAttachMouseWheelEvent

    /************************************************************************
     * 화면 보호기 감지 이벤트
     ************************************************************************/
    oAPP.fn.fnAttachPowerMonitorEvent = () => {

        var oPowerMonitor = parent.POWERMONITOR;

        // 대기모드로 전환 감지 이벤트
        oPowerMonitor.addListener('lock-screen', oAPP.fn.fnAttachPowerMonitorLockScreen);

        oPowerMonitor.addListener('unlock-screen', oAPP.fn.fnAttachPowerMonitorUnLockScreen);

    }; // end of oAPP.fn.fnAttachPowerMonitorEvent

    /************************************************************************
     * 화면 보호기 대기모드로 전환될 때 타는 이벤트
     ************************************************************************/
    oAPP.fn.fnAttachPowerMonitorLockScreen = () => {

         // 서버 세션을 체크하고 있는 브라우저일 때만 실행
        if (!oAPP.attr.serverSessionCheckingMe) {
            return;
        }

        // 세션 타임아웃 체크
        oAPP.fn.fnSessionTimeoutCheck();

        console.log("워커가 켜졌다!!");

    }; // end of oAPP.fn.fnAttachPowerMonitorLockScreen

    /************************************************************************
     * 화면 보호기 대기모드가 아닐때 타는 이벤트
     ************************************************************************/
    oAPP.fn.fnAttachPowerMonitorUnLockScreen = () => {

        // 서버 세션을 체크하고 있는 브라우저일 때만 실행
        if (!oAPP.attr.serverSessionCheckingMe) {
            return;
        }

        // 워커가 있을 경우에만 실행
        if (!oAPP.attr._oWorker) {
            return;
        }

        // 워커 종료
        oAPP.attr._oWorker.terminate();

        delete oAPP.attr._oWorker;

        console.log("워커 죽었다!!!!");

    }; // end of oAPP.fn.fnAttachPowerMonitorUnLockScreen


    /************************************************************************/

    // 마우스 휠 이벤트 적용하기 (줌 기능)
    oAPP.fn.fnAttachMouseWheelEvent();

    // 화면 보호기 감지 이벤트
    oAPP.fn.fnAttachPowerMonitorEvent();

})(oAPP);