const pickUpInput = document.querySelector('#pickUp');
const dropOffInput = document.querySelector('#dropOff');
const searchBtn = document.querySelector('#search');
const startJourneyButton = document.querySelector('#startJourney');

startJourneyButton.addEventListener('click', () => {
  pickUpInput.focus();
});



// Creating Google map

let map, marker, directionsService, directionsRenderer

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  navigator.geolocation.getCurrentPosition(function (position) {

    const myCoordinate = { lat: position.coords.latitude, lng: position.coords.longitude }
    const mapOptions = {
      center: myCoordinate,
      zoom: 15,
      mapTypeId: 'roadmap'
    }

    map = new Map(document.getElementById("map"), mapOptions);

    marker = new google.maps.Marker({
      draggable: true,
      position: myCoordinate,
      map: map,
      animation: google.maps.Animation.DROP
    });

    marker.addListener('dragend', function () {
      const selectedLocation = marker.getPosition();

      // Fetching formatted address with the help of latitude and longitude
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ location: selectedLocation }, function (results, status) {
        if (status === 'OK') {
          if (results[0]) pickUpInput.value = results[0].formatted_address
          else alert('Location not found')
        }
        else alert('Error occured while fetching location')
      })
    });

  })

  let autocompletePickUp = new google.maps.places.Autocomplete(pickUpInput)
  let autocompleteDropOff = new google.maps.places.Autocomplete(dropOffInput)


  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeWeight: 3       // Thickness of the route line
    }
  });

}

searchBtn.addEventListener('click', calculateRoute)

function calculateRoute() {
  const pickUpLocation = pickUpInput.value
  const dropOffLocation = dropOffInput.value

  if (pickUpLocation && dropOffLocation) {

    const request = {
      origin: pickUpLocation,
      destination: dropOffLocation,
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.METRIC
    }

    directionsService.route(request, async function (response, status) {
      if (status === 'OK') {

        marker.setMap(null)
        // Displaying route between pickUp and dropOff Locations
        directionsRenderer.setMap(map);
        directionsRenderer.setDirections(response);

        // Calculating data related to route
        const route = response.routes[0]
        const distance = await route.legs[0].distance.text
        const time = await route.legs[0].duration.text


        document.getElementById('distance').innerText = `Distance: ${distance}`;
        document.getElementById('time').innerText = `Time: ${time}`;

        document.getElementById('meterBox').style.display = 'flex'

      }
      else if (status === 'NOT_FOUND') {
        alert('One or more locations could not be found.');
      } else if (status === 'ZERO_RESULTS') {
        alert('No routes available between the specified locations.');
      }
      else {
        alert('Something went wrong. Please try again')
        directionsRenderer.setDirections({ routes: [] }); // Clear the route if source or destination is empty
      }
    })
  }
}
