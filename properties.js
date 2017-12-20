define(["qlik"], function ( qlik ) {
	//'use strict';

	// Display export check box on property panel or not
const activateExport = true;

	var app = qlik.currApp(this);

	// ****************************************************************************************
	// Properties Definition
	// ****************************************************************************************
	var getMasterObjectList = function () {

		var defer = qlik.Promise.defer();

		app.getAppObjectList( 'masterobject', function ( data ) {
			var masterobject = [];
			var sortedData = data.qAppObjectList.qItems.sort(function ( item1, item2 ) {
				if(item1.qData.rank < item2.qData.rank) return -1
				if(item1.qData.rank > item2.qData.rank) return 1
				return item1.qMeta.title.localeCompare(item2.qMeta.title)
			} );
			sortedData.forEach(function ( item ) {
				masterobject.push( {
					value: item.qInfo.qId,
					label: item.qMeta.title
				} );
			} );
			return defer.resolve( masterobject );
		} );

		return defer.promise;
	};

  //Number of Tabs
  var num_of_tabs = {
		ref : "props.num_of_tabs",
		label	 : "Number of Tabs",
		type : "string",
		defaultValue : "2",
		component : "dropdown",
		options: [{
					value: "1",
					label: "1"
				}, {
					value: "2",
					label: "2"
				}, {
					value: "3",
					label: "3"
				}, {
					value: "4",
					label: "4"
				}, {
					value: "5",
					label: "5"
				}]
	};

  //Chart for Tab1
  var chart_for_tab1 = {
		ref : "props.chart_for_tab1",
		label	 : "Tab 1 Chart",
		component : "dropdown",
		type : "string",
		//defaultValue : "V",
    options: function () {
			return getMasterObjectList().then( function ( items ) {
				return items;
			} );
		}
	};

  //Chart for Tab2
  var chart_for_tab2 = {
		ref : "props.chart_for_tab2",
		label	 : "Tab 2 Chart",
		component : "dropdown",
		type : "string",
		show: function(data) { return data.props.num_of_tabs >= 2; },
    options: function () {
			return getMasterObjectList().then( function ( items ) {
				return items;
			} );
		}
	};

  //Chart for Tab3
	var chart_for_tab3 = {
		ref : "props.chart_for_tab3",
		label	 : "Tab 3 Chart",
		component : "dropdown",
		type : "string",
		show: function(data) { return data.props.num_of_tabs >= 3; },
    options: function () {
			return getMasterObjectList().then( function ( items ) {
				return items;
			} );
		}
	};

  //Chart for Tab4
	var chart_for_tab4 = {
		ref : "props.chart_for_tab4",
		label	 : "Tab 4 Chart",
		component : "dropdown",
		type : "string",
		show: function(data) { return data.props.num_of_tabs >= 4; },
    options: function () {
			return getMasterObjectList().then( function ( items ) {
				return items;
			} );
		}
	};

  //Chart for Tab5
	var chart_for_tab5 = {
		ref : "props.chart_for_tab5",
		label	 : "Tab 5 Chart",
		component : "dropdown",
		type : "string",
		show: function(data) { return data.props.num_of_tabs >= 5; },
    options: function () {
			return getMasterObjectList().then( function ( items ) {
				return items;
			} );
		}
	};

	//Chart Label1
  var label_for_tab1 = {
		ref : "props.label_for_tab1",
		label	 : "Tab 1 Label",
		type : "string",
		defaultValue : "Tab 1"
	};

	//Chart Label2
  var label_for_tab2 = {
		ref : "props.label_for_tab2",
		label	 : "Tab 2 Label",
		type : "string",
		show: function(data) { return data.props.num_of_tabs >= 2; },
		defaultValue : "Tab2"
	};

	//Chart Label3
  var label_for_tab3 = {
		ref : "props.label_for_tab3",
		label	 : "Tab 3 Label",
		type : "string",
		show: function(data) { return data.props.num_of_tabs >= 3; },
		defaultValue : "Tab3"
	};

	//Chart Label4
  var label_for_tab4 = {
		ref : "props.label_for_tab4",
		label	 : "Tab 4 Label",
		type : "string",
		show: function(data) { return data.props.num_of_tabs >= 4; },
		defaultValue : "Tab4"
	};

	//Chart Label5
	var label_for_tab5 = {
		ref : "props.label_for_tab5",
		label	 : "Tab 5 Label",
		type : "string",
		show: function(data) { return data.props.num_of_tabs >= 5; },
		defaultValue : "Tab5"
	};

	//Export Checkbox1
	var export_for_tab1 = {
		ref : "props.export_for_tab1",
		label: "Enable export for Chart 1",
		type : "boolean",
		show: function(data) { return activateExport; },
		defaultValue : false
	};

	//Export Checkbox2
  var export_for_tab2 = {
		ref : "props.export_for_tab2",
		label: "Enable export for Chart 2",
		type : "boolean",
		show: function(data) { return activateExport && data.props.num_of_tabs >= 2; },
		defaultValue : false
	};

	//Export Checkbox3
	var export_for_tab3 = {
		ref : "props.export_for_tab3",
		label	: "Enable export for Chart 3",
		type : "boolean",
		show: function(data) { return activateExport && data.props.num_of_tabs >= 3; },
		defaultValue : false
	};

	//Export Checkbox4
	var export_for_tab4 = {
		ref : "props.export_for_tab4",
		label : "Enable export for Chart 4",
		type : "boolean",
		show: function(data) { return activateExport && data.props.num_of_tabs >= 4; },
		defaultValue : false
	};

	//Export Checkbox5
  var export_for_tab5 = {
		ref : "props.export_for_tab5",
		label : "Enable export for Chart 5",
		type : "boolean",
		show: function(data) { return activateExport && data.props.num_of_tabs >= 5; },
		defaultValue : false
	};

	// ****************************************************************************************
	// Property Panel Definition
	// ****************************************************************************************
	// Settings -Properties
	var myCustomSection = {
		component : "expandable-items",
		label : "Settings",
		items : {
			header1 : {
				type : "items",
				label : "Properties",
				items : {
					num_of_tabs : num_of_tabs,
					chart_for_tab1 : chart_for_tab1,
					label_for_tab1 : label_for_tab1,
					export_for_tab1 : export_for_tab1,
					chart_for_tab2 : chart_for_tab2,
					label_for_tab2 : label_for_tab2,
					export_for_tab2 : export_for_tab2,
					chart_for_tab3 : chart_for_tab3,
					label_for_tab3 : label_for_tab3,
					export_for_tab3 : export_for_tab3,
					chart_for_tab4 : chart_for_tab4,
					label_for_tab4 : label_for_tab4,
					export_for_tab4 : export_for_tab4,
					chart_for_tab5 : chart_for_tab5,
					label_for_tab5 : label_for_tab5,
					export_for_tab5 : export_for_tab5
				}
			}
		}
	};

	//Return values
	return {
		type : "items",
		component : "accordion",
		items : {
			customSection : myCustomSection
		}
	};
});
