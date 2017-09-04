define( [
		'qlik'
		,'./properties'
		,'text!./css/styles.css'
],
function ( qlik, props, cssContent ) {

	$('<style>').html(cssContent).appendTo('head');

	var app = qlik.currApp(this); //App object
	var repeated = 1;	//Rendering repeat count

	/**
	 * createTabContent - Create tab content including a chart
	 *
	 * @param  {Number} tab_id        Tab ID
	 * @param  {String} ext_id     Extension ID
	 * @param  {Boolean} enable_export Flag for enabling export data button
	 * @return {String}               HTML elements of tab content in string
	 */
	function createTabContent(tab_id, ext_id, enable_export) {
		var tab_content = '<section id="panel-' + tab_id + '-' + ext_id + '" class="tab-content">';

		// Display data export button when enabled
		if(enable_export) {
			tab_content +=		'<button class="lui-button lui-button  lui-button" id="export-data-' + tab_id + '-' + ext_id + '" title="Export data" style="display:none;"><span class="lui-button__icon  lui-icon  lui-icon--export"></span></button>';
			tab_content += 		'<div id="viz' + tab_id + '-' + ext_id + '" class="qvobject viz-with-export"></div>';
		} else {
			tab_content += 		'<div id="viz' + tab_id + '-' + ext_id + '" class="qvobject viz-without-export"></div>';
		}

		tab_content += 		'</section>';

		return tab_content;
	};

	/**
	 * createInstruction - Create tab content including instructions
	 *
	 * @param  {Number} tab_id        Tab ID
	 * @param  {String} ext_id     Extension ID
	 * @return {String}           HTML elements of tab content in string
	 */
	function createInstruction(tab_id, ext_id){
		var tab_content = '<section id="panel-' + tab_id + '-' + ext_id + '" class="tab-content">';
		tab_content += 			'<main class="panel-content">';
		tab_content += 			'<div>Please follow the following instructions:</div><br>';
		tab_content +=			'<ul style="padding-left:25px;">';
		tab_content += 				'<li>Create charts and add them to master items. (You can delete the charts after you added them to master items.)</li>';
		tab_content += 				'<li>Drag and drop the "Tabs for Qlik Sense" extension onto the canvas.</li>';
		tab_content += 				'<li>On the extension property panel, navigate to [Settings] > [Properties] and change the "Number of Tabs".</li>';
		tab_content += 				'<li>Select a chart on the drop-down list and modify the label for each tab on the property panel.</li>';
		tab_content += 			'</ul>';
		tab_content += 			'</main>';
		tab_content += 		'</section>';

		return tab_content;
	};

	/**
	 * getChartObject - Retrieve a chart object and insert into a HTML element
	 *
	 * @param  {Number} tab_id        Tab ID
	 * @param  {String} ext_id     Extension ID
	 * @param  {Object} layout    App layout
	 */
	function getChartObject(tab_id, ext_id, layout) {
	  app.getObject( 'viz' + tab_id + '-' + ext_id, eval('layout.props.chart_for_tab' + tab_id));
	};

	/**
	 * createExportEvent - Add excel download event to the button
	 *
	 * @param  {Number} tab_id        Tab ID
	 * @param  {String} ext_id     Extension ID
	 * @param  {Object} layout    App layout
	 */
	function createExportEvent(tab_id, ext_id, layout){
		var object = app.getObject( 'viz' + tab_id + '-' + ext_id, eval('layout.props.chart_for_tab' + tab_id));

		object.then(function(model) {
 			var table = new qlik.table(model);
    	$('#export-data-' + tab_id + '-' + ext_id ).on('click', function(e) {
  		e.preventDefault();
     		table.exportData({download: true});
   		})
		})
	};

	return {
		initialProperties : {
			version : 1.0
		},
	  definition: ( props ),
		support : {
				export: false,
				exportData: false,
				snapshot: false
		},
		paint: function ($element, layout) {
			var num_of_tabs = layout.props.num_of_tabs;
			var ext_id = layout.qInfo.qId; //Get this extension's ID
			var html = '<div qv-extension style="width: 100%; height:100%;">';

			// Create tabs
			html += '<ul class="lui-tabset lui-tabset--fill">';
			for (i=1; i<=num_of_tabs; i++) {
				html += '<li id="li-for-panel-' + i + '-' +  ext_id + '" title="' + eval('layout.props.label_for_tab' + i) + '" class="lui-tab" >';
			  html += 	'<span  class="lui-tab__text">' + eval('layout.props.label_for_tab' + i) + '</span>';
			  html += '</li>';
			}
			html += '</ul>';

			// Create tab contents
			html += '<article class="tab-contents">';
			for (i=1; i<=num_of_tabs; i++) {
				if(eval('layout.props.chart_for_tab' + i)) {
					html += createTabContent(i, ext_id, eval('layout.props.export_for_tab' + i));

					if(eval('layout.props.export_for_tab' + i)) {
						createExportEvent(i, ext_id, layout);
					}
				} else {
					html += createInstruction(i, ext_id, layout);
				}
			}
			html += '</article>';

			html += '</div>';

			//Render html
			$element.html(html);

			// Show panel-1
			$('section#panel-1-' + ext_id).css('height', '100%');
			$('section#panel-1-' + ext_id).addClass('activated');
			$('li#li-for-panel-1-' + ext_id).addClass('lui-active');
			$('button#export-data-1-' + ext_id).show();

			if(repeated == 1){
				qlik.resize();
			}

			// Get tab1 object
			if(layout.props.chart_for_tab1 && repeated > 1) {
			    getChartObject("1", ext_id, layout);
			}

			repeated += 1;

			/**
			 * Triggered when tab is selected
			 */
			$('li[id*="' + ext_id + '"]').on('click', function (e) {
				// Get the selected tab id
				var tab_name = e.currentTarget.id;
				var tab_id = tab_name.replace('li-for-panel-', '').replace('-' + ext_id, '');

				// Hide all tab contents
				$('section[id*=' + ext_id + ']').css('height', '0%');
				$('section[id*=' + ext_id + ']').removeClass('activated');
				$('button[id*=' + ext_id + ']').hide();

				//Display the selected tab contents
				$('#panel-' + tab_id + '-' + ext_id).css('height', '100%');
				$('#panel-' + tab_id + '-' + ext_id).addClass('activated');
				$('button#export-data-' + tab_id + '-' + ext_id).show();

				// Deactivate all tabs
				$('li[id*="' + ext_id + '"]').removeClass('lui-active');

				// Activate the selected tab
				$('li#li-for-panel-' + tab_id + '-' + ext_id).addClass('lui-active');

				// Get chart object on the selected tab
				if(eval('layout.props.chart_for_tab' + tab_id)) {
				  getChartObject(tab_id, ext_id, layout);
				}
			});
		}
	};
});
