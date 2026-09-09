import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; import { MatButtonModule } from '@angular/material/button';
import { CustomerService } from '../../../core/services/customer.service'; import { CustomerResponse } from '../../../core/models/customer.models'; import { ApiErrorService } from '../../../core/services/api-error.service';
@Component({selector:'app-customer-profile',standalone:true,imports:[RouterLink,MatCardModule,MatButtonModule],templateUrl:'./customer-profile.component.html',styleUrl:'./customer-profile.component.css'})
export class CustomerProfileComponent{private readonly service=inject(CustomerService);private readonly errors=inject(ApiErrorService);customer:CustomerResponse|null=null;error='';
ngOnInit():void{this.service.getProfile().subscribe({next:c=>this.customer=c,error:e=>this.error=this.errors.message(e)});}
}
