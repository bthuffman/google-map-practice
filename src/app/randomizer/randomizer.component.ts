import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';

@Component({
  selector: 'app-randomizer',
  templateUrl: './randomizer.component.html',
  styleUrls: ['./randomizer.component.css']
})
export class RandomizerComponent implements OnInit{
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

  @ViewChild('search')
  // ElementRef is a wrapper around a native element inside of a View. Allows you to use Angular templates and data binding to access DOM elements without reference to the native element.
  public searchElementRef: ElementRef;
 
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
    
    var defaultBounds = new google.maps.LatLngBounds(
      //TODO move to two objects and set each to a constant variable (lat/long)
      // This is the latitude and longitude of 10 miles 0.14492753623 
      {
        lat:this.latitude-0.14492753623, lng:this.longitude-0.14492753623
      }, 
      {
        lat:this.latitude+0.14492753623, 
      lng:this.longitude+0.14492753623
      }); 
    
    var input = this.searchElementRef.nativeElement; 

    var options = {
      bounds: defaultBounds,
      types: ['establishment']
    };
    //similar to that found in js example but for autocomplete
    let service = new google.maps.places.Autocomplete( input, options);
    
    service.addListener("place_changed", () => {
      this.ngZone.run(() => {
        //get the place result
        let place: google.maps.places.PlaceResult = service.getPlace();

        //verify result
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }

        //set latitude and longitude
        this.latitude = place.geometry.location.lat();
        this.longitude = place.geometry.location.lng();
        this.name = place.name;
        console.log("This is the searched loactions latitude " + this.latitude);
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
        {center: geolocation, radius: position.coords.accuracy});
      service.setBounds(circle.getBounds());
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
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }

  });
}

  valueChanged() { // You can give any function name

      this.counter = this.counter + 1;

      //creating a function named valueChanged which is called on the click event of the button and inside the function event valueChanged is emitted. Passing counter as a parameter.
      this.valueChange.emit(this.counter);
  }
}