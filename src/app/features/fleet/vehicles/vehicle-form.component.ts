import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card'; import { MatFormFieldModule } from '@angular/material/form-field'; import { MatInputModule } from '@angular/material/input'; import { MatSelectModule } from '@angular/material/select'; import { MatButtonModule } from '@angular/material/button';
import { VehicleService } from '../../../core/services/vehicle.service'; import { VehicleStatus } from '../../../core/models/fleet.models'; import { ApiErrorService } from '../../../core/services/api-error.service';
@Component({selector:'app-vehicle-form',standalone:true,imports:[ReactiveFormsModule,RouterLink,MatCardModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatButtonModule],templateUrl:'./vehicle-form.component.html',styleUrl:'./vehicle-form.component.css'})
export class VehicleFormComponent{
 private readonly fb=inject(FormBuilder);private readonly service=inject(VehicleService);private readonly route=inject(ActivatedRoute);private readonly router=inject(Router);private readonly errors=inject(ApiErrorService);
 readonly form=this.fb.nonNullable.group({vehicleType:['',Validators.required],registrationNumber:['',Validators.required],capacityKg:[0,[Validators.required,Validators.min(0.01)]],status:[VehicleStatus.Available,Validators.required],insuranceExpiryDate:[''],fitnessExpiryDate:['']});
 readonly statuses=[VehicleStatus.Available,VehicleStatus.InUse,VehicleStatus.Maintenance,VehicleStatus.Inactive];id:number|null=null;loading=false;error='';get editing():boolean{return this.id!==null;}
 ngOnInit():void{const raw=this.route.snapshot.paramMap.get('id');this.id=raw?Number(raw):null;if(this.id){this.service.getById(this.id).subscribe({next:v=>this.form.patchValue({vehicleType:v.vehicleType,registrationNumber:v.registrationNumber,capacityKg:v.capacityKg,status:v.status,insuranceExpiryDate:v.insuranceExpiryDate?.slice(0,10)??'',fitnessExpiryDate:v.fitnessExpiryDate?.slice(0,10)??''}),error:e=>this.error=this.errors.message(e)});}}
 statusName(s:VehicleStatus):string{return VehicleStatus[s];}
 submit():void{if(this.form.invalid){this.form.markAllAsTouched();return;}this.loading=true;const x=this.form.getRawValue();const req={...x,insuranceExpiryDate:x.insuranceExpiryDate||null,fitnessExpiryDate:x.fitnessExpiryDate||null};const op=this.id?this.service.update(this.id,req):this.service.create(req);op.subscribe({next:()=>{this.loading=false;void this.router.navigate(['/admin/vehicles']);},error:e=>{this.loading=false;this.error=this.errors.message(e);}});}
}
