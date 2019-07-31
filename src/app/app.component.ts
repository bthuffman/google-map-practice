import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
 
//Component is a type of directive used to associate a template with a class. 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent
 implements OnInit {
  title: string = 'AGM project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  name: string;
 
  //Any directive, component, and element which is part of component template (i.e. a child of the parent) is accessed as ViewChild. If a parent component wants access to a child component then it uses ViewChild or ContentChild. The @ViewChild decorator is a template querying mechanism that is local to the component and cannot inject anything inside the templates of its child or parent components. 
  @ViewChild('search')
  // ElementRef is a wrapper around a native element inside of a View. Allows you to use Angular templates and data binding to access DOM elements without reference to the native element.
  public searchElementRef: ElementRef;
 
  //The Constructor is a default method of the class that is executed when the class is instantiated and ensures proper initialization of fields in the class and its subclasses. Angular or better Dependency Injector (DI) analyzes the constructor parameters and when it creates a new instance by calling new MyClass() it tries to find providers that match the types of the constructor parameters, resolves them and passes them to the constructor. 
 //specifies what the parameters (injectable services) will be. In this case the constructor is asking for an injected instance of mapsAPILoader and ngZoneand their associated type and metadata. 
// you should use constructor() to setup Dependency Injection and not much else. ngOnInit() is better place to "start" - it's where/when components' bindings are resolved.
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
        this.zoom = 8;
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
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
 
    });
  }
 
}