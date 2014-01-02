define(function(require) {
	var viewType = {
		'ShowMoreEvent'             : 'show_more_event',
    	'ViewMyVodListEvent'        : 'view_MyVodList_event',
        'VodPlayBtnClickEvent'      : 'vodPlayBtn_click_event',
        'VodAddBtnClickEvent'       : 'vodAddBtn_click_event',
        'VodDownLoadBtnClickEvent'	: 'vodDownLoadBtn_click_event',
        'SinglePlayEvent'           : 'single_play_event',
        'SingleAddEvent'            : 'single_add_event',
        'ReSortDataEvent'			: 'reSort_data_Event',
        'SelectEvent'				: 'select_Event'
	};

	var dataType = {
		AddListStateChangeEvent : 'addList_stateChange_event',
		DataSortedEvent : 'data_sorted_event',
		FetchedFileSizeEvent : 'fetched_fileSize_event',
		InitPageEvent : 'init_page_event'
	};

	var types = {
		view : viewType,
		data : dataType
	}

	return function ( _type ) {
		return types[_type] || {};
	}
})