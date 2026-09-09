import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; import { MatButtonModule } from '@angular/material/button'; import { MatIconModule } from '@angular/material/icon'; import { MatChipsModule } from '@angular/material/chips';
import { CustomerService } from '../../../core/services/customer.service'; import { AddressResponse } from '../../../core/models/customer.models'; import { ApiErrorService } from '../../../core/services/api-error.service';
@Component({selector:'app-customer-addresses',standalone:true,imports:[RouterLink,MatCardModule,MatButtonModule,MatIconModule,MatChipsModule],templateUrl:'./customer-addresses.component.html',styleUrl:'./customer-addresses.component.css'})
export class CustomerAddressesComponent{
 private readonly service=inject(CustomerService);private readonly errors=inject(ApiErrorService);addresses:AddressResponse[]=[];error='';loading=false;
 ngOnInit():void{this.load();}
 load():void{this.service.getAddresses().subscribe({next:a=>this.addresses=a,error:e=>this.error=this.errors.message(e)});}
 delete(id:number):void{if(!confirm('Delete this address?'))return;this.loading=true;this.service.deleteAddress(id).subscribe({next:()=>{this.loading=false;this.load();},error:e=>{this.loading=false;this.error=this.errors.message(e);}});}
}
