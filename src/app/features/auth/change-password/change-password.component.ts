import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; import { MatFormFieldModule } from '@angular/material/form-field'; import { MatInputModule } from '@angular/material/input'; import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service'; import { ApiErrorService } from '../../../core/services/api-error.service';
@Component({selector:'app-change-password',standalone:true,imports:[ReactiveFormsModule,RouterLink,MatCardModule,MatFormFieldModule,MatInputModule,MatButtonModule],templateUrl:'./change-password.component.html',styleUrl:'./change-password.component.css'})
export class ChangePasswordComponent{
 private readonly fb=inject(FormBuilder);private readonly auth=inject(AuthService);private readonly errors=inject(ApiErrorService);
 readonly form=this.fb.nonNullable.group({currentPassword:['',Validators.required],newPassword:['',[Validators.required,Validators.minLength(8)]]});loading=false;error='';message='';
 submit():void{if(this.form.invalid){this.form.markAllAsTouched();return;}this.loading=true;this.error='';this.auth.changePassword(this.form.getRawValue()).subscribe({next:r=>{this.loading=false;this.message=r.message;this.form.reset();},error:e=>{this.loading=false;this.error=this.errors.message(e);}});}
}
