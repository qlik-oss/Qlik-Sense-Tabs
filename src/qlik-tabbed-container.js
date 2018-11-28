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

	var btn,
		app = qlik.currApp(this),
		currActiveTab = null;

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

	function addExportBtn(id, activeTab, chartId, options) {
		
		app.getObject(getPanelId(id, activeTab), chartId, options).then(function(model) {
			var icon,
				table = new qlik.table(model),
				target = $('.tab-contents');
		
			icon = $('<span/>',{
				class: "lui-button__icon  lui-icon  lui-icon--export"
			});
			btn = $('<button/>',{
				id: "export-data-" + activeTab + "-" + id + "",
				class: "lui-button lui-button lui-button",
				title: "Export data"
			})
			.append(icon).on('click touchstart', function (e) {
				e.preventDefault();
				table.exportData({
					download: true
				});
			});
			target.append(btn);
		});
	}

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

	function renderTabContent(id, activeTab, chartId, options) {
		var content = $(TEMPLATE.TABCONTENT),
			objContainer = $(TEMPLATE.QVOBJECT);

		content.attr('id', id);
		content.attr('chart-id', chartId+'-'+activeTab);
		objContainer.attr('id', getPanelId(id, activeTab));
		content.append(objContainer);

		app.getObject(getPanelId(id, activeTab), chartId, options);

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
		beforeDestroy: function () {
			currActiveTab = null;

			if (btn) {
				btn.off();
				btn.remove();
				btn = null;
			}
		},
		paint: function ($element, layout) {
			var self = this;
			var id = layout.qInfo.qId;
			var props = layout.props;
			var tabContent,shouldExport;
			var exportBtn = $element.find('[id^="export-data"]');
			var tabInstructions = $element.find('.tab-instructions');
			var parentElem = $element.parent();
			var extElem = $(TEMPLATE.EXTENSION);
			var hasExtElem = parentElem.find('.tab-row').length > 0;
			var canInteract = this._interactionState === 1;
			var noSelections = this.options.noSelections === true;
			
			var Val = $element.find("ul.lui-tabset li.lui-tab.lui-active").attr("tabnr");
            if (Val != undefined) {
                currActiveTab = Val;
            } else {
                currActiveTab = '1';
			}
				
			var stateChanged = this.previousState && 
				(( this.previousState.canInteract !== canInteract) || ( this.previousState.noSelections !== noSelections));
			
				//Add export button for chart if it does not exist and user has export permissions.
			shouldExport = props['tab'+currActiveTab].export;
			
			//only readd export button if tabs have changed
			addExportButton = shouldExport && (stateChanged || !this.previousState || this.previousState.currActiveTab !== currActiveTab);
			
			this.previousState = {
				'canInteract': canInteract,
				'noSelections': noSelections,
				'currActiveTab': currActiveTab,
			};

			var getObjectOptions = {
				'noInteraction': !canInteract,
				'noSelections': noSelections
			};
			var chartId = props['tab'+ currActiveTab].chart;

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

			tabContent = $element.find('.tab-contents');
			//render chart if not the same id already has been rendered.
			if ((chartId !== "" && tabContent.attr('chart-id') !== chartId+'-'+currActiveTab) || stateChanged) {
				tabContent.remove();
				tabInstructions.remove();
				extElem.append(renderTabContent(id, currActiveTab, chartId, getObjectOptions));
			} else if (!canInteract && chartId === "" && tabInstructions.length < 1) {
				tabContent.remove();
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

			app.getAppLayout().then( function (result) {
				if (addExportButton && result.layout.permissions.exportData) {
					exportBtn.remove();
					addExportBtn(id, currActiveTab, chartId, getObjectOptions);
				} else if (!shouldExport ) {
					exportBtn.remove();
				}
      });
		}
	};
});