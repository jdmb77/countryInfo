/*
* Projects: Country Information App
* Author: GHirsch
* Created: 10/13/2016
* Resources: https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/shiny/32/'+ country +'.png, http://api.geonames.org/searchJSON
* http://api.geonames.org/findNearByWeatherJSON
*/

(function ($) {
  // Global jqwidgets theme setting
  $.jqx.theme = 'bootstrap';

  let appObj = {};

  appObj.title = 'World Country Information';
  appObj.version = 1.0;

  // Retrieve country data from geonames api
  appObj.source = {
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

  appObj.dataAdapter = new $.jqx.dataAdapter(appObj.source, {
    formatData: function (data) {
      $.extend(data, {
        featureClass: 'P',
        style: 'full',
        maxRows: 1000, // this is the max allowed rows for the free service (http://api.geonames.org/searchJSON)
        username: 'jqwidgets'
      });
      return data;
    }
  });

  // Initialize map options
  appObj.zoom;
  appObj.latlng = new google.maps.LatLng(38.907815, -77.042728);
  appObj.mapOptions = {
    zoom: 6,
    center: appObj.latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // Create map
  appObj.map = new google.maps.Map(document.getElementById('map'), appObj.mapOptions);

  appObj.contextMenu = google.maps.event.addListener(appObj.map, "rightclick", (e) => {
    let lat = e.latLng.lat();
    let lng = e.latLng.lng();

    $('#navbar').html('<p class="navbar-right navbar-text">' +
      '<span class="glyphicon glyphicon-screenshot"></span> ' + lat + ', ' + lng + '</p>');
  });

  // Update map view 
  appObj.updateMap = (lat, lng, country, countryCode, city, continent, pop) => {
    appObj.map.panTo(new google.maps.LatLng(lat, lng));

    let countryIcon = country;

    if (/\s/.test(countryIcon)) {
      countryIcon = countryIcon.replace(/(^\s+|[^a-zA-Z0-9 ]+|\s+$)/g, "");   //Removes spaces
      countryIcon = countryIcon.replace(/\s+/g, "-"); //Adds dash in place of space
    }

    let iconContent = `<div style="width: 350px;">
			<ul class="list-group">
				<li class="list-group-item">
				<span class="badge">${country}</span>
					<img src="https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/shiny/64/${countryIcon}.png">
				</li>
				<li class="list-group-item">
				<span class="badge">${city}</span>
					City
				</li>
				<li class="list-group-item">
				<span class="badge">${pop}</span>
					Population
				</li>
				<li class="list-group-item">
				<span class="badge">${countryCode}</span>
					Country Code
				</li>
				<li class="list-group-item">
				<span class="badge">${continent}</span>
					Continent
				</li>
				<li class="list-group-item">
				<span class="badge">${lat}</span>
					Latitude
				</li>
				<li class="list-group-item">
				<span class="badge">${lng}</span>
					Longitude
				</li>
			</ul>
		</div>`;

    let infoWindow = new google.maps.InfoWindow({
      content: iconContent
    });

    appObj.marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: appObj.map,
      icon: {
        url: `https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/shiny/32/${countryIcon}.png`,
        anchor: new google.maps.Point(16, 48)
      }
    });

    appObj.marker.addListener('click', () => {
      infoWindow.open(appObj.map, appObj.marker);
    });
  }

  // Get weather information
  appObj.weather = (lat, lng) => {
    appObj.weatherSource = {
      datatype: 'jsonp',
      url: 'http://api.geonames.org/findNearByWeatherJSON',
      data: {
        lat: lat,
        lng: lng,
        username: 'jqwidgets'
      }
    };

    appObj.weatherAdapter = new $.jqx.dataAdapter(appObj.weatherSource, {
      loadComplete: () => {
        let data = appObj.weatherAdapter.records[0];
        let rec = data.weatherObservation;
        let CtoF = rec.temperature * 9 / 5 + 32;

        $('#navbar').html(`<p class="navbar-right navbar-text">
          <span class="glyphicon glyphicon-fire" title="Temperature (F)"></span> ${Math.round(CtoF)}
          <span class="glyphicon glyphicon-tint" title="Humidity"></span> ${rec.humidity}
          <span class="glyphicon glyphicon-cloud" title="Current Condition"></span> ${rec.clouds.toUpperCase()}
          </p>`);
      },
      loadError: (jqXHR, status, error) => {
        console.log(jqXHR, status, error);
      }
    });

    appObj.weatherAdapter.dataBind();
  }

  // Create country data grid
  $('#countryGrid').jqxGrid(
    {
      width: '100%',
      source: appObj.dataAdapter,
      columnsresize: true,
      showfilterrow: true,
      filterable: true,
      pageable: true,
      sortable: true,
      altrows: true,
      ready: () => {
        $('#countryGrid').jqxGrid('selectrow', 0);
      },
      columns: [
        { text: 'Country Name', datafield: 'countryName', filtertype: 'input' },
        { text: 'City', datafield: 'name', filtertype: 'input' },
        { text: 'Population', datafield: 'population', cellsformat: 'f', filtertype: 'number' },
        { text: 'Country Code', datafield: 'countryCode', filtertype: 'input' },
        {
          text: 'Date / Time', datafield: 'timeZoneId', filtertype: 'input',
          cellsrenderer: (index, datafield, value, defaultvalue, column, rowdata) => {
            let timedate = moment().tz(value);
            let dateformat = timedate.format('YYYY-MM-DD') + " " + timedate.format('HH:mm:ss');

            return `<div class="jqx-grid-cell-left-align" style="margin-top: 6px;">${dateformat}</div>`;
          }
        }
      ]
    });

  // Fired upon selecting grid row
  $('#countryGrid').on('rowselect', (e) => {
    let row = e.args.row;
    let lat = parseFloat(row.lat);
    let lng = parseFloat(row.lng);
    let country = row.countryName;
    let countryCode = row.countryCode;
    let city = row.name;
    let continent = row.continentCode;
    let pop = row.population;
    pop = pop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    appObj.updateMap(lat, lng, country, countryCode, city, continent, pop);
    appObj.weather(lat, lng);
  });

  console.log('App Running');

  return appObj;

}($));
