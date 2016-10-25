/*
* Projects: Country Information App
* Author: GHirsch
* Created: 10/13/2016
* Resources: https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/shiny/32/'+ country +'.png, http://api.geonames.org/searchJSON
*/

var APP = APP || (function($) {
	// Global jqwidgets theme setting
	$.jqx.theme = 'light';
	
	var appObj = {};

	appObj.title = 'Country Information Application';
	appObj.version = 1.0;

	appObj.source =
    {
        datatype: 'jsonp',
        datafields: [
            { name: 'countryName', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'population', type: 'float' },
            { name: 'countryCode', type: 'string' },
            { name: 'continentCode', type: 'string' },
            { name: 'timeZoneId', map: 'timezone>timeZoneId' },
            { name: 'lat', type: 'string' },
            { name: 'lng', type: 'string' }
        ],
        url: 'http://api.geonames.org/searchJSON'
    };

    appObj.dataAdapter = new $.jqx.dataAdapter(appObj.source, 
        {
            formatData: function (data) {
                $.extend(data, {
                    featureClass: 'P',
                    style: 'full',
                    maxRows: 1000, // this is the max allowed rows for the free service (http://api.geonames.org/searchJSON)
                    username: 'jqwidgets'
                });
                return data;
            }
        }
    );

    appObj.zoom;
    appObj.latlng = new google.maps.LatLng(38.907815, -77.042728);
    appObj.mapOptions = {
    	zoom: 6,
    	center: appObj.latlng,
    	mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    appObj.map = new google.maps.Map(document.getElementById('map'), appObj.mapOptions);

    appObj.marker = new google.maps.Marker({
    	position: appObj.latlng,
    	map: appObj.map,
    	icon: 'https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/shiny/32/United-States.png'
    });

    appObj.updateMap = function(lat, lng, country) {
		appObj.map.panTo(new google.maps.LatLng(lat, lng));

		var countryIcon = country;

		countryIcon = countryIcon.replace(/(^\s+|[^a-zA-Z0-9 ]+|\s+$)/g,"");   //Removes spaces
	    countryIcon = countryIcon.replace(/\s+/g, "-"); //Adds dash in place of space

		appObj.marker = new google.maps.Marker({
	    	position: new google.maps.LatLng(lat, lng),
	    	map: appObj.map,
	    	icon: {
	    		url: 'https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/shiny/32/'+ countryIcon +'.png',
	    		anchor: new google.maps.Point(16, 48)
	    	}
	    });
    }

    $('#countryGrid').jqxGrid(
    {
        width: '99%',
        source: appObj.dataAdapter,
        columnsresize: true,
        showfilterrow: true,
        filterable: true,
        pageable: true,
        sortable: true,
        altrows: true,
        columns: [
            { text: 'Country Name', datafield: 'countryName', filtertype: 'input' },
            { text: 'City', datafield: 'name', filtertype: 'input' },
            { text: 'Population', datafield: 'population', cellsformat: 'f', filtertype: 'number' },
            { text: 'Country Code', datafield: 'countryCode', filtertype: 'input' },
            { text: 'Date / Time', datafield: 'timeZoneId', filtertype: 'input',
            	cellsrenderer: function(index, datafield, value, defaultvalue, column, rowdata) {
            		var timedate = moment().tz(value),
            			dateformat = timedate.format('YYYY-MM-DD') + " " + timedate.format('HH:mm:ss');

            		return '<div class="jqx-grid-cell-left-align" style="margin-top: 6px;">' + dateformat + '</div>';
            	}
            }
        ]
    });

    $('#countryGrid').on('rowselect', function(e) {
    	var	row = e.args.row, 
    		lat = parseFloat(row.lat),
    		lng = parseFloat(row.lng),
	    	country = row.countryName;

    	appObj.updateMap(lat, lng, country);    	
    });

	console.log('App Running');
    
    return appObj;
    
}($));