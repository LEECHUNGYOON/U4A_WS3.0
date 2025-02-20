/*********************************************************
 * @module - onAfterRendering 이벤트 등록 대상 UI 얻기.
 ********************************************************/
module.exports = function(oTarget){

    if(typeof oTarget === "undefined" || oTarget === null){
		return;
	}
	
	var _oTarget = oTarget;
	
	
	//UI에 onAfterRendering이 존재하지 않는경우.
	//상위 부모의 onAfterRendering을 확인.
	while(typeof _oTarget?.onAfterRendering === "undefined"){
		
		_oTarget = _oTarget.oParent;
        
        //부모를 찾지 못한 경우 exit.
		if(typeof _oTarget === "undefined" || _oTarget === null){
			return;
		}
	}

	var _OBJID = _oTarget._OBJID;
	
	//예외처리 대상 UI에 해당하는건인경우.
	switch(true){
		case typeof _oTarget._oDialog !== "undefined" && _oTarget._oDialog != null:
            //UI 내부에 DIALOG UI가 존재하는경우(sap.m.BusyDialog)
			_oTarget = _oTarget._oDialog;
            
			break;
		
		case typeof _oTarget._oPopover !== "undefined" && _oTarget._oPopover != null:
            //UI 내부에 POPOVER UI가 존재하는경우(sap.m.QuickView)
			_oTarget = _oTarget._oPopover;

			break;
			
		case typeof _oTarget._getMenu === "function" && typeof _oTarget._initAllMenuItems === "function":
			//UI 내부에 MENU UI를 얻는 function이 존재하는경우(sap.m.Menu)

			if (!_oTarget._bIsInitialized) {
				_oTarget._initAllMenuItems();
				_oTarget._bIsInitialized = true;
			}
			
			_oTarget = _oTarget._getMenu();
		
			break;
			
		case typeof _oTarget._getDialog === "function":
            //UI 내부에 dialog UI를 얻는 function이 존재하는경우(sap.m.ViewSettingsDialog)
			_oTarget = _oTarget._getDialog();
		
			break;
			
		case typeof _oTarget._oControl !== "undefined" && _oTarget._oControl !== null:
			//UI 내부에 control UI가 존재하는경우(sap.m.ResponsivePopover)
			_oTarget = _oTarget._oControl;
		
			break;

		case typeof _oTarget.isA === "function" && _oTarget.isA("sap.ui.unified.MenuItemBase") === true:
			//sap.ui.unified.MenuItemBase으로 파생된 UI인경우(sap.ui.unified.MenuItem, sap.ui.unified.MenuTextFieldItem)
			_oTarget = _oTarget.oParent;
		
			break;
		
	}
	
	if(typeof _oTarget === "undefined" || _oTarget === null){
		return;
	}

	_oTarget._OBJID = _OBJID;
	
		
	return _oTarget;

};