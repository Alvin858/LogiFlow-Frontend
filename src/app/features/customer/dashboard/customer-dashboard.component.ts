import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; import { MatButtonModule } from '@angular/material/button'; import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../core/services/customer.service'; import { ApiErrorService } from '../../../core/services/api-error.service'; import { CustomerResponse } from '../../../core/models/customer.models';
@Component({selector:'app-customer-dashboard',standalone:true,imports:[RouterLink,MatCardModule,MatButtonModule,MatIconModule],templateUrl:'./customer-dashboard.component.html',styleUrl:'./customer-dashboard.component.css'})
export class CustomerDashboardComponent{
 private readonly service=inject(CustomerService);private readonly errors=inject(ApiErrorService);customer:CustomerResponse|null=null;error='';
 ngOnInit():void{this.service.getProfile().subscribe({next:c=>this.customer=c,error:e=>this.error=this.errors.message(e)});}
}
