import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; import { MatButtonModule } from '@angular/material/button';
@Component({selector:'app-access-denied',standalone:true,imports:[RouterLink,MatCardModule,MatButtonModule],templateUrl:'./access-denied.component.html',styleUrl:'./access-denied.component.css'})
export class AccessDeniedComponent {}
