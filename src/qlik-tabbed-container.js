/**
 * @license
 * Copyright (c) 2017 Masaki Hamano. All rights reserved.
 * 
 * Copyrights licensed under the terms of the MIT license.
 * Original source <https://github.com/mhamano/Qlik-Sense-Tabs>
 */
define([
	'jquery',
	'qlik',
	'./properties',
	'css!./css/styles.css'
],
function ($, qlik, props, cssContent) {

	var app = qlik.currApp(this);
	var currentVisualization = null;

	var TEMPLATE = {
		TAB: '<li class="lui-tab"></li>',
		TABTEXT: '<span class="lui-tab__text"></span>',
		TABROW: '<ul class="lui-tabset lui-tabset--fill"></ul>',
		TABCONTENT: '<article class="tab-contents"></article>',
		QVOBJECT: '<div class="qvobject viz-without-export"></div>',
		EXTENSION: '<div qv-extension class="tab-row"></div>',
		BLOCK: '<div class="tab-block"></div>'
	};

	function getPanelId(id, idx) {
		return ''+id+'-'+idx;
	}

	function getChartTabId(id, chartId, tabIndex) {
		return '' + id + '_' + chartId + '-' + tabIndex
	}

	function getCurrentChartTabId($el) {
		return $el.find('.tab-contents').attr('chart-id')
	}

	function addExportBtn(id, activeTab, chartId, $el) {
		var icon,
			target = $el.find('.tab-contents');
	
		icon = $('<span/>',{
			class: "lui-button__icon  lui-icon  lui-icon--export"
		});
		var btn = $('<button/>',{
			id: "export-data-" + getChartTabId(id, chartId, activeTab) + "",
			class: "lui-button lui-button lui-button",
			title: "Export data"
		})
		.append(icon).on('click touchstart', function (e) {
			e.preventDefault();
			app.getObject(null, getChartTabId(id, chartId, activeTab), null).then(function(model) {
				var table = new qlik.table(model);
				table.exportData({
					download: true
				});
			});
		});
		target.append(btn);
	};

	function showHelpText() {

		return $('<div/>', {
			class: 'tab-instructions'
		})
		.append( $('<div/>',{
			class: 'title',
			text: 'Follow the instructions below to get started:'
		}))
		.append( $('<ul/>')
			.append( $('<li/>', {
				text: 'Create charts and add them as master items. (You can remove the '+
						'charts from the sheet after you have added them to master items if you please)'
			}))
			.append( $('<li/>', {
				text: 'Drag and drop the "Container with tabs" extension onto the sheet.'
			}))
			.append( $('<li/>', {
				text: 'On the extension property panel, navigate to [Appearance] > [Tabs] Here you can change the number of tabs and assign master items to each tab.'
			}))
		);
	}

	function createTabRow(salt, props, activeTab, backendApi, canInteract) {

		var tabRow = $(TEMPLATE.TABROW),
			nbrTabs = props.num_of_tabs,
			firstTab = null,
			tabToClick = null;
		
		for (var i = 1; i <= nbrTabs; i++) {
			var aTab,
				label = props['tab'+i].label;

			aTab = $(TEMPLATE.TAB)
				.append($(TEMPLATE.TABTEXT).text(label))
				.attr('title', label)
				.attr('tabNr', i)
				.attr('panelid', getPanelId(salt, i));	
				
			if(canInteract) {
				aTab.on('click', function (e) {
					var elem = $(e.currentTarget),
						panelID = elem.attr('panelid'),
						tabContainer = $('#' + salt);

					elem.siblings().removeClass('lui-active');
					elem.addClass('lui-active');
					tabContainer.children('div').removeClass('activated').hide();
					tabContainer.children('#' + panelID).addClass('activated').show();
					qlik.resize('#' + panelID);
				});
			}

			tabRow.append(aTab);
			
			if (firstTab == null) {
				firstTab = aTab;
			}
		}

		//click active tab if it exist, otherwise click first tab.
		tabToClick = tabRow.find(':nth-child('+activeTab+')');
		
		if (tabToClick.length > 0) {
			tabToClick[0].click();
		} else if (firstTab) {
			firstTab.click();
		}
		
		return tabRow;
	}

	function createTabContentContainer(id, activeTab, chartId, options) {
		var content = $(TEMPLATE.TABCONTENT),
			objContainer = $(TEMPLATE.QVOBJECT);

		content.attr('id', id);
		content.attr('chart-id', getChartTabId(id, chartId, activeTab));
		objContainer.attr('id', getPanelId(id, activeTab));
		content.append(objContainer);

		return content;
	}

	function renderTabs(container, elem, id, props, activeTab, backendApi, canInteract) {
		elem.append(createTabRow(id, props, activeTab, backendApi, canInteract));
		container.replaceWith(elem);
	}

	function uppdateTabLabels (parent, props) {
		parent.find('.lui-tab__text').each(function (i, element) {
			var $elem = $(element),
				currentLabel = $elem.text(),
				savedLabel = props['tab'+(i+1)].label;

			if (currentLabel !== savedLabel) {
				$elem.text(savedLabel);
			}
		});
	}

	function destroyCurrentChartTabObject($el) {
		$el.find('.tab-instructions').remove();
		$el.find('.tab-contents').remove();
		if (currentVisualization) {
			currentVisualization.close();
			currentVisualization = null;
		}
	};

	return {
		initialProperties: {
			version : 1.0,
			activeTab: 1
		},
		definition: props,
		support: {
			export: false,
			exportData: false,
			snapshot: false
		},
		paint: function ($element, layout) {
			var id = layout.qInfo.qId;
			var props = layout.props;
			var currActiveTab = null;
			var shouldExport;
			var exportBtn = $element.find('[id^="export-data"]');
			var tabInstructions = $element.find('.tab-instructions');
			var parentElem = $element.parent();
			var extElem = $(TEMPLATE.EXTENSION);
			var hasExtElem = parentElem.find('.tab-row').length > 0;
			var canInteract = this._interactionState === 1;
			var noSelections = this.options && this.options.noSelections === true;
			var canZoom = this.options && this.options.zoomEnabled === true;
			
			var Val = $element.find("ul.lui-tabset li.lui-tab.lui-active").attr("tabnr");
            if (Val != undefined) {
                currActiveTab = Val;
            } else {
                currActiveTab = '1';
			}
			
			shouldExport = props['tab'+currActiveTab].export;

			var stateChanged = this.previousState && 
				(( this.previousState.canInteract !== canInteract) || 
				( this.previousState.noSelections !== noSelections) ||
				(this.previousState.shouldExport !== shouldExport));
			
				//Add export button for chart if it does not exist and user has export permissions.
			
			//only readd export button if tabs have changed
			addExportButton = shouldExport && (stateChanged || !this.previousState || this.previousState.currActiveTab !== currActiveTab);
			
			this.previousState = {
				'canInteract': canInteract,
				'noSelections': noSelections,
				'currActiveTab': currActiveTab,
				'shouldExport': shouldExport,
			};

			var getObjectOptions = {
				'noInteraction': !canInteract,
				'noSelections': noSelections
			};
			var chartId = props['tab'+ currActiveTab].chart;
			var newChartTabId = getChartTabId(id, chartId, currActiveTab);
			var currentChartTabId = getCurrentChartTabId($element);

			//render tab row.
			if (!hasExtElem) {
				parentElem.data('currTabLimit', props.num_of_tabs);
				renderTabs($element, extElem, id, props, currActiveTab, this.backendApi, canInteract);
			} else if (props.num_of_tabs !== parentElem.data('currTabLimit') || stateChanged) {
				parentElem.data('currTabLimit', props.num_of_tabs);
				$element.remove('.lui-tabset');
				renderTabs($element, extElem, id, props, currActiveTab, this.backendApi, canInteract);
			} else {
				extElem = parentElem.find('.tab-row');
				uppdateTabLabels(parentElem, props);
			}

			//render chart if not the same id already has been rendered.
			if ((chartId !== "" && currentChartTabId !== newChartTabId) || stateChanged) {
				destroyCurrentChartTabObject($element);
				extElem.append(createTabContentContainer(id, currActiveTab, chartId, getObjectOptions));

				app.getObjectProperties(chartId).then(function (chartModel) {
					return app.getObjectProperties(newChartTabId).then(function (newChartModel) {
						// Custom object already exists
						return newChartModel;
					}).catch(function () {
						// Custom object doesn't exists, so create it
						return app.createGenericObject({qInfo: {qId: newChartTabId}}).then(function (newChartModel) {
							return newChartModel.copyFrom(chartId).then(function () {
								return newChartModel.getProperties().then(function () {
									return newChartModel;
								});
							});
						});
					}).then(function (newChartModel) {
						if (!chartModel.properties.qStateName) {
							// No qStateName on child, so make it inherit qStateName of this
							newChartModel.properties.qStateName = layout.qStateName || '';
						}

						return newChartModel.setProperties(newChartModel.properties).then(function () {
							return app.visualization.get(newChartTabId).then(function (visualization) {
								currentVisualization = visualization;
								return visualization.show(getPanelId(id, currActiveTab), getObjectOptions).then(function () {
									extElem.find('.qv-object-wrapper').scope().options.zoomEnabled = canZoom;
									exportBtn.remove();
									if (shouldExport && visualization.model.layout.permissions.exportData) {
										addExportBtn(id, currActiveTab, chartId, extElem);
									}
								});
							});
						});
					});
				});
			} else if (!canInteract && chartId === "" && tabInstructions.length < 1) {
				destroyCurrentChartTabObject($element);
				extElem.append(showHelpText());
			}

			//prevent user from making selections in edit mode.
			if (!canInteract && $element.find('.tab-block').length < 1) {
				extElem.append($(TEMPLATE.BLOCK)
					.on('click touchstart', function(e) {
						e.preventDefault();
						return false;
					})
				);
			} else if (canInteract) {
				$element.find('.tab-block').remove();
				$element.find('.tab-instructions').remove();
			}
		}
	};
});