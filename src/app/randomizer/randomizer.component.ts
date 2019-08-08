import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';

@Component({
  selector: 'app-randomizer',
  templateUrl: './randomizer.component.html',
  styleUrls: ['./randomizer.component.css']
})
export class RandomizerComponent implements OnInit {
  //creating an event emitter called valueChange which is emitted to the app component html 
  @Output() valueChange = new EventEmitter();

  title: string = 'AGM project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  name: string;

  //passed as a parameter to the emitted event
  counter = 0;
  randomInput;
  newService;

  // request = {
  //   fields: ['restaurant'],
  //   locationBias: 'IP_BIAS',
  //   query: 'food'
  // }

  request = {
    location: {
      lat: 35.096887,
      lng: -106.654439 
    },
    radius: 50000,
    type: 'restaurant'
  };


  @ViewChild('search')
  // ElementRef is a wrapper around a native element inside of a View. Allows you to use Angular templates and data binding to access DOM elements without reference to the native element.
  public searchElementRef: ElementRef;

  @ViewChild('randomButton')
  // ElementRef is a wrapper around a native element inside of a View. Allows you to use Angular templates and data binding to access DOM elements without reference to the native element.
  public randomElementRef: ElementRef;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { }


  //A lifecycle hook that is called after Angular has initialized all data-bound properties of a directive. Used to  to handle any additional initialization tasks.
  ngOnInit() {
    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {

      //assign geoCoder a new Geocoder object
      this.geoCoder = new google.maps.Geocoder;

      // This is the latitude and longitude of 10 miles 0.14492753623 
      var tenMileLatLong = 0.14492753623;
      var defaultBounds = new google.maps.LatLngBounds(
        {
          lat: this.latitude - tenMileLatLong,
          lng: this.longitude - tenMileLatLong
        },
        {
          lat: this.latitude + tenMileLatLong,
          lng: this.longitude + tenMileLatLong
        });

      var input = this.searchElementRef.nativeElement;

      var options = {
        bounds: defaultBounds,
        types: ['establishment']
      };
      //similar to that found in js example but for autocomplete
      let service = new google.maps.places.Autocomplete(input, options);
      console.log(service);
      //this runs if search in the search box
      service.addListener("place_changed", () => {
        //ngZone is necessary to update the marker position based on the result 
        this.ngZone.run(() => { 
        //get the place result
        let place: google.maps.places.PlaceResult = service.getPlace();
        console.log(place);
        //verify result
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }

        //set latitude and longitude
        this.latitude = place.geometry.location.lat();
        this.longitude = place.geometry.location.lng();
        this.name = place.name;
        console.log("This is the searched locations latitude " + this.latitude);
        console.log("This is the searched locations name " + this.name);
        }); 
      });
      //calls the setCurrentLocation function (see bellow)
      this.setCurrentLocation(service);
    });
  }

  // Get Current Location Coordinates with the limits set to Albuquerque as set in the var options default bounds. 
  private setCurrentLocation(service) {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
        this.getAddress(this.latitude, this.longitude);
        var geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var circle = new google.maps.Circle(
          { center: geolocation, radius: position.coords.accuracy });
        service.setBounds(circle.getBounds());
        console.log(geolocation);
      });
    }
  }

  markerDragEnd($event: MouseEvent) {
    console.log("This is event" + $event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      console.log(results);
      console.log("This is the status " + status);

      if (status === 'OK') {
        if (results[0]) {
          // this.zoom = 12;
          this.address = results[0].formatted_address;
          console.log(this.address);
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }
  //////////////////////////////////////////////////////

  callback(results: google.maps.places.PlaceResult[], status: google.maps.places.PlacesServiceStatus, Component: RandomizerComponent) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      // console.log(This);
      let max = results.length - 1;

      let randomNumber = Math.floor(Math.random() * Math.floor(max));

      let service = results[randomNumber];

      let newPlace: google.maps.places.PlaceResult = service

      console.log(newPlace);
      //verify result
      if (newPlace.geometry === undefined || newPlace.geometry === null) {
        console.log("Breaks here")
        return;
      }

      //set latitude and longitude
      Component.latitude = newPlace.geometry.location.lat();
      Component.longitude = newPlace.geometry.location.lng();
      Component.name = newPlace.name;
      console.log("This is the searched loactions latitude " + Component.latitude);
      console.log("This is the searched locations name " + Component.name);

      Component.getNewAddress(Component.latitude, Component.longitude);
      console.log("Hi callback()");
    }
  }

  valueChanged() { // You can give any function name

    this.counter = this.counter + 1;

    //creating a function named valueChanged which is called on the click event of the button and inside the function event valueChanged is emitted. Passing counter as a parameter.
    this.valueChange.emit(this.counter);

    //get the place result.
    // Callback is function, the anonymous function is used to pass "this" to itself (the Component). This is the highest object in scope, without it this wouldn't refer to the component but would be limited to it's own scope. 
    let newService = new google.maps.places.PlacesService(this.randomElementRef.nativeElement).nearbySearch(this.request,(result, status)=> this.callback(result, status, this))

    console.log(newService);
    console.log("Hi valueChanged()");
  };

  private setNewLocation(newService) {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
        this.getNewAddress(this.latitude, this.longitude);
        var newGeolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var circle = new google.maps.Circle(
          { center: newGeolocation, radius: position.coords.accuracy });
        // newService.setBounds(circle.getBounds());
        console.log(newGeolocation);
        console.log("Hi setNewLocation()");
      });
    }
  }

  getNewAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      console.log(results);
      console.log("This is the status " + status);

      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 16;
          this.address = results[0].formatted_address;
          console.log(this.address);
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
    console.log("Hi getNewAddress()")
  }

}