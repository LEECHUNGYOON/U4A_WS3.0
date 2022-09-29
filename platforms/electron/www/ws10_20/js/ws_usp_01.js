(function(window, $, oAPP) {
    "use strict";

    var gfSelectRowUpdate;

    /***************************************************************************************
     * [WS30] USP TREE에서 현재 선택한 Node의 상위 또는 하위 형제 Node의 접힘 펼침 정보를 구한다.
     *************************************************************************************** 
     * @param {sap.ui.table.TreeTable} oTreeTable
     * - 좌측 Usp Tree Instance
     * 
     * @param {Array} aNodes
     * - 현재 선택한 Node의 형제들 정보
     * 
     * @param {Integer} iCurrIndex
     * - 현재 선택한 Node의 Index 정보
     * 
     * @param {Boolean} bIsUp
     * - 현재 선택한 Node의 상위 형제의 펼침 상태 정보를 구할지에 대한 정보
     * - ex) true : 상위 펼침 상태 정보
     *       false: 하위 펼침 상태 정보
     * 
     * @return {Boolean} 
     * - true : 펼침
     * - false: 접힘
     ***************************************************************************************/
    function fnIsExpandedNode(oTreeTable, aNodes, iCurrIndex, bIsUp) {

        var oMoveNode = (bIsUp == true ? aNodes[iCurrIndex - 1] : aNodes[iCurrIndex + 1]),
            aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        for (var i = 0; i < iRowLength; i++) {

            var oRow = aRows[i],
                oRowCtx = oRow.getBindingContext();

            if (!oRowCtx) {
                continue;
            }

            if (oMoveNode.OBJKY !== oRowCtx.getObject("OBJKY")) {
                continue;
            }

            return oTreeTable.isExpanded(i);

        }

    } // end of fnIsExpandedUpNode

    /**************************************************************************
     * [WS30] USP Tree의 위로 이동
     **************************************************************************
     * @param {sap.ui.table.TreeTable} oTreeTable
     * - 좌측 Usp Tree Instance
     * 
     * @param {Integer} pIndex
     * - 현재 선택한 Node의 Index 정보
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveUp = (oTreeTable, pIndex) => {

        var oSelectedCtx = oTreeTable.getContextByIndex(pIndex), // 현재 선택한 Node
            oCtxModel = oSelectedCtx.getModel(),
            sSelectedBindPath = oSelectedCtx.sPath, // 현재 선택한 Node의 바인딩 패스
            oSelectedData = oCtxModel.getProperty(sSelectedBindPath), // 현재 선택한 Node에 바인딩된 데이터
            oResult = oAPP.fn._fnFindModelData(sSelectedBindPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oSelectedData.OBJKY);

        // 현재 선택한 Node가 최상위 일 경우는 빠져나간다.
        if (iFindIndex == 0) {
            return;
        }

        // USPTREE 이전 데이터 수집
        if (!oAPP.attr.oBeforeUspTreeData) {

            oAPP.attr.oBeforeUspTreeData = jQuery.extend(true, [], oCtxModel.getProperty("/WS30/USPTREE"));

        }

        debugger;

        // 상위로 이동하려는 Node의 접힘/펼침 상태를 구한다.
        var bIsMeNodeExpand = oTreeTable.isExpanded(pIndex),
            bIsUpNodeExpand = fnIsExpandedNode(oTreeTable, oResult.Nodes, iFindIndex, true);

        var aItem = oResult.Nodes.splice(iFindIndex, 1),
            oMeItem = aItem[0], // 선택한 Node를 추출
            oUpItem = oResult.Nodes[iFindIndex - 1]; // 선택한 Node의 상위 node를 추출

        // 각 Node 별 펼침 접힘 상태 저장    
        oMeItem._ISEXP = bIsMeNodeExpand;
        oUpItem._ISEXP = bIsUpNodeExpand;

        // 선택한 Node를 이전 위치에서 위로 이동 시킨다.
        oResult.Nodes.splice(iFindIndex - 1, 0, oMeItem);

        // 변경한 정보를 갱신한다.
        oCtxModel.setProperty(oResult.Path, oResult.Nodes);

        // 이동된 Node에 선택 표시를 하기 위한 Tree Table RowUpdated Event 걸기
        gfSelectRowUpdate = ev_uspTreeNodeMoveAndSelectedRowUpdated.bind(this, oMeItem, oUpItem);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    }; // end of oAPP.fn.fnUspTreeNodeMoveUp    

    /**************************************************************************
     * [WS30] USP Tree의 아래로 이동
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveDown = (oTreeTable, pIndex) => {

        debugger;

        var oSelectedCtx = oTreeTable.getContextByIndex(pIndex), // 현재 선택한 Node
            oCtxModel = oSelectedCtx.getModel(),
            sSelectedBindPath = oSelectedCtx.sPath, // 현재 선택한 Node의 바인딩 패스
            oSelectedData = oCtxModel.getProperty(sSelectedBindPath), // 현재 선택한 Node에 바인딩된 데이터
            oResult = oAPP.fn._fnFindModelData(sSelectedBindPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oSelectedData.OBJKY),
            iNodeLength = oResult.Nodes.length;

        // 현재 선택한 Node가 최하위 일 경우는 빠져나간다.
        if (iFindIndex == iNodeLength - 1) {
            return;
        }

        // USPTREE 이전 데이터 수집
        if (!oAPP.attr.oBeforeUspTreeData) {

            oAPP.attr.oBeforeUspTreeData = jQuery.extend(true, [], oCtxModel.getProperty("/WS30/USPTREE"));

        }

        // 하위로 이동하려는 Node의 접힘/펼침 상태를 구한다.
        var bIsMeNodeExpand = oTreeTable.isExpanded(pIndex),
            bIsUpNodeExpand = fnIsExpandedNode(oTreeTable, oResult.Nodes, iFindIndex, false);

        var aItem = oResult.Nodes.splice(iFindIndex, 1),
            oMeItem = aItem[0], // 선택한 Node를 추출
            // oDownItem = oResult.Nodes[iFindIndex + 1]; // 선택한 Node의 하위 node를 추출
            oDownItem = oResult.Nodes[iFindIndex]; // 선택한 Node의 하위 node를 추출

        // 각 Node 별 펼침 접힘 상태 저장    
        oMeItem._ISEXP = bIsMeNodeExpand;
        oDownItem._ISEXP = bIsUpNodeExpand;

        // 선택한 Node를 이전 위치에서 아래로 이동 시킨다.
        oResult.Nodes.splice(iFindIndex + 1, 0, oMeItem);

        // 변경한 정보를 갱신한다.
        oCtxModel.setProperty(oResult.Path, oResult.Nodes);

        // 이동된 Node에 선택 표시를 하기 위한 Tree Table RowUpdated Event 걸기
        gfSelectRowUpdate = ev_uspTreeNodeMoveAndSelectedRowUpdated.bind(this, oMeItem, oDownItem);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    }; // end of oAPP.fn.fnUspTreeNodeMoveDown

    function ev_uspTreeNodeMoveAndSelectedRowUpdated(oMeItem, oMoveItem, oEvent) {

        console.log("attachRowUpdated");

        debugger;

        var oTreeTable = oEvent.getSource(),
            aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        var bIsFind1 = false,
            bIsFind2 = false;

        for (var i = 0; i < iRowLength; i++) {

            var oRow = aRows[i],
                oCtx = oRow.getBindingContext();

            if (!oCtx) {
                continue;
            }

            // Row의 Object Key
            var sOBJKY = oCtx.getObject("OBJKY");

            // 전체 Row를 검색하여 현재 선택한 Node 또는 이동하려는 Node 둘다 같지 않다면 다음 Row로 건너뛴다.
            if (sOBJKY !== oMeItem.OBJKY && sOBJKY !== oMoveItem.OBJKY) {
                continue;
            }

            // 현재 순서의 Row와 선택한 Row가 같을 경우 
            if (sOBJKY === oMeItem.OBJKY) {

                // 이동 전 선택한 Row의 접힘/펼침 상태에 따라 그대로 적용해준다.
                if (oMeItem._ISEXP && oMeItem._ISEXP == true) {
                    oRow.expand(i);
                } else {
                    oRow.collapse(i);
                }

                // 현재 순서의 Row Index를 구한다.
                var iIndex = oRow.getIndex();

                // 현재 순서의 Row에 라인선택 설정
                oTreeTable.setSelectedIndex(iIndex);

                // 현재 선택한 Row를 찾았다는 플래그
                bIsFind1 = true;

            }

            // 현재 순서의 Row와 이동하려는 Row가 같을 경우 
            if (sOBJKY === oMoveItem.OBJKY) {

                // 이동하려는 Row의 접힘/펼침 상태에 따라 그대로 적용해준다.
                if (oMoveItem._ISEXP && oMoveItem._ISEXP == true) {
                    oRow.expand(i);
                } else {
                    oRow.collapse(i);
                }

                // 이동하려는 Row를 찾았다는 플래그
                bIsFind2 = true;
            }

            // 현재 선택한 Row와 이동하려는 Row 둘다 찾은 경우 
            if (bIsFind1 == true && bIsFind2 == true) {

                // RowUpdate 이벤트를 해제 한다.
                oTreeTable.detachRowsUpdated(gfSelectRowUpdate);

                gfSelectRowUpdate = undefined;

                return;

            }

        }

        // 현재 선택한 Row를 찾지 못한 경우
        if (bIsFind1 == false) {

            if (!gfSelectRowUpdate.iRowLength) {
                gfSelectRowUpdate.iRowLength = iRowLength;
            } else {
                gfSelectRowUpdate.iRowLength += iRowLength;
            }

            // 스크롤을 이동하여 다시 찾는다.
            oTreeTable.setFirstVisibleRow(gfSelectRowUpdate.iRowLength);

            setTimeout(() => {
                oTreeTable.fireRowsUpdated(oEvent, oMeItem, oMoveItem);
            }, 0);

        }

    } // end of ev_uspTreeNodeMoveAndSelectedRowUpdated

    /**************************************************************************
     * [WS30] USP Tree의 이전 선택한 UspTree Data 글로벌 변수 초기화
     **************************************************************************/
    oAPP.fn.fnClearOnBeforeSelectUspTreeData = () => {

        if (oAPP.attr.oBeforeUspTreeData) {
            delete oAPP.attr.oBeforeUspTreeData;
        }

    }; // end of oAPP.fn.fnClearOnBeforeSelectUspTreeData

})(window, $, oAPP);