import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; import { MatFormFieldModule } from '@angular/material/form-field'; import { MatInputModule } from '@angular/material/input'; import { MatButtonModule } from '@angular/material/button';
import { CustomerService } from '../../../core/services/customer.service'; import { ApiErrorService } from '../../../core/services/api-error.service';
@Component({selector:'app-customer-profile-edit',standalone:true,imports:[ReactiveFormsModule,RouterLink,MatCardModule,MatFormFieldModule,MatInputModule,MatButtonModule],templateUrl:'./customer-profile-edit.component.html',styleUrl:'./customer-profile-edit.component.css'})
export class CustomerProfileEditComponent{
 private readonly fb=inject(FormBuilder);private readonly service=inject(CustomerService);private readonly router=inject(Router);private readonly errors=inject(ApiErrorService);
 readonly form=this.fb.nonNullable.group({companyName:['',Validators.required],contactPerson:['',Validators.required],taxNumber:[''],phoneNumber:['']});loading=false;error='';
 ngOnInit():void{this.service.getProfile().subscribe({next:c=>this.form.patchValue({companyName:c.companyName,contactPerson:c.contactPerson,taxNumber:c.taxNumber??'',phoneNumber:c.phoneNumber??''}),error:e=>this.error=this.errors.message(e)});}
 submit():void{if(this.form.invalid){this.form.markAllAsTouched();return;}this.loading=true;this.error='';this.service.updateProfile(this.form.getRawValue()).subscribe({next:()=>{this.loading=false;void this.router.navigate(['/customer/profile']);},error:e=>{this.loading=false;this.error=this.errors.message(e);}});}
}
