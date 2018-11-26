define(["qlik"], function (qlik) {
    var KNOWN_CONTAINERS = ['qlik-show-hide-container', 'qlik-tabbed-container'];

    var app = qlik.currApp(this),
        permission = null;

    function exportAllowed() {
        if (!permission) {
            return app.getAppLayout().then(function (result) {
                permission = result.layout.permissions.exportData;
                return permission;
            });
        } else {
            setTimeout(function () {
                permission = null;
            }, 1000);
            return permission;
        }
    }

    getMasterObjectList = function () {
        var defer = qlik.Promise.defer();
        app.getAppObjectList('masterobject', function (data) {
            var sortedData = data.qAppObjectList.qItems.filter(function (item) {
                return KNOWN_CONTAINERS.indexOf(item.qData.visualization) < 0;
            }).sort(function (item1, item2) {
                if (item1.qData.rank < item2.qData.rank) return -1
                if (item1.qData.rank > item2.qData.rank) return 1
                return item1.qMeta.title.localeCompare(item2.qMeta.title)
            });
            var masterobjects = sortedData.map(function (item) {
                return {
                    value: item.qInfo.qId,
                    label: item.qMeta.title
                };
            });

            return defer.resolve(masterobjects);
        });
        return defer.promise;
    }

    function generateItemObject(nbr) {

        return {
            tab: {
                component: "header",
                label: "Tab " + nbr
            },
            label: {
                ref: "props.tab" + nbr + ".label",
                type: "string",
                label: "Label",
                defaultValue: "Tab " + nbr,
                expression: "optional"
            },
            chart: {
                ref: "props.tab" + nbr + ".chart",
                type: "string",
                component: "dropdown",
                label: "Master Object",
                options: function () {
                    return getMasterObjectList();
                }
            },
            export: {
                ref: "props.tab" + nbr + ".export",
                type: "boolean",
                label: "Enable export",
                defaultValue: false,
                show: function (data) {
                    return data.props["tab" + nbr].chart !== "" && exportAllowed();
                }
            }
        };
    }

    var settings = {
        uses: "settings",
        items: {
            general: {
                items: {
                    showTitles: {
                        defaultValue: false
                    },
                    details: {
                        show: false
                    }
                }
            },
            selections: {
                show: false
            },
            tabs: {
                grouped: false,
                type: "items",
                label: "Tabs",
                items: {
                    dropdown: {
                        ref: "props.num_of_tabs",
                        type: "string",
                        label: "Number of Tabs",
                        defaultValue: "2",
                        component: "dropdown",
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
                    },
                    tab1: {
                        type: "items",
                        label: function (data) {
                            return data.props.tab1.label;
                        },
                        items: generateItemObject(1)
                    },
                    tab2: {
                        type: "items",
                        label: function (data) {
                            return data.props.tab2.label;
                        },
                        show: function (data) {
                            return data.props.num_of_tabs >= 2;
                        },
                        items: generateItemObject(2)
                    },
                    tab3: {
                        type: "items",
                        label: function (data) {
                            return data.props.tab3.label;
                        },
                        show: function (data) {
                            return data.props.num_of_tabs >= 3;
                        },
                        items: generateItemObject(3)
                    },
                    tab4: {
                        type: "items",
                        label: function (data) {
                            return data.props.tab4.label;
                        },
                        show: function (data) {
                            return data.props.num_of_tabs >= 4;
                        },
                        items: generateItemObject(4)
                    },
                    tab5: {
                        type: "items",
                        label: function (data) {
                            return data.props.tab5.label;
                        },
                        show: function (data) {
                            return data.props.num_of_tabs >= 5;
                        },
                        items: generateItemObject(5)
                    }
                }
            }
        }
    };

    var about = {
        label: "About",
        component: "items",
        items: {
            header: {
                label: 'Tabbed container',
                style: 'header',
                component: 'text'
            },
            paragraph1: {
                label: 'A container object that can contain several master visualizations. The user chooses which object to show by clicking on a tab.',
                component: 'text'
            },
            paragraph2: {
                label: 'Tabbed container is based upon an extension created by Masaki Hamano at QlikTech International AB.',
                component: 'text'
            }
        }
    };

    return {
        type: "items",
        component: "accordion",
        items: {
            settings: settings,
            about: about
        }
    };
});