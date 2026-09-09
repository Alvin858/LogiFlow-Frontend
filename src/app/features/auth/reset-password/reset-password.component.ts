import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; import { MatFormFieldModule } from '@angular/material/form-field'; import { MatInputModule } from '@angular/material/input'; import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service'; import { ApiErrorService } from '../../../core/services/api-error.service';
@Component({selector:'app-reset-password',standalone:true,imports:[ReactiveFormsModule,RouterLink,MatCardModule,MatFormFieldModule,MatInputModule,MatButtonModule],templateUrl:'./reset-password.component.html',styleUrl:'./reset-password.component.css'})
export class ResetPasswordComponent{
 private readonly fb=inject(FormBuilder);private readonly auth=inject(AuthService);private readonly router=inject(Router);private readonly errors=inject(ApiErrorService);
 readonly form=this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],resetToken:['',Validators.required],newPassword:['',[Validators.required,Validators.minLength(8)]]});loading=false;error='';message='';
 submit():void{if(this.form.invalid){this.form.markAllAsTouched();return;}this.loading=true;this.error='';this.auth.resetPassword(this.form.getRawValue()).subscribe({next:r=>{this.loading=false;this.message=r.message;setTimeout(()=>void this.router.navigate(['/auth/login']),900);},error:e=>{this.loading=false;this.error=this.errors.message(e);}});}
}
