import { Component, OnInit } from '@angular/core';
 
//Component is a type of directive used to associate a template with a class. 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  //printing the value of the counter passed from AppChildComponent
displayCounter(count) {
  console.log(count);
}
}