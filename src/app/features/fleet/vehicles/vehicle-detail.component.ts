import { Component, inject } from '@angular/core'; import { DatePipe } from '@angular/common'; import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; import { MatButtonModule } from '@angular/material/button';
import { VehicleService } from '../../../core/services/vehicle.service'; import { VehicleResponse, VehicleStatus } from '../../../core/models/fleet.models'; import { ApiErrorService } from '../../../core/services/api-error.service';
@Component({selector:'app-vehicle-detail',standalone:true,imports:[RouterLink,DatePipe,MatCardModule,MatButtonModule],templateUrl:'./vehicle-detail.component.html',styleUrl:'./vehicle-detail.component.css'})
export class VehicleDetailComponent{private readonly route=inject(ActivatedRoute);private readonly service=inject(VehicleService);private readonly errors=inject(ApiErrorService);vehicle:VehicleResponse|null=null;error='';
ngOnInit():void{const id=Number(this.route.snapshot.paramMap.get('id'));this.service.getById(id).subscribe({next:v=>this.vehicle=v,error:e=>this.error=this.errors.message(e)});}
statusName(s:VehicleStatus):string{return VehicleStatus[s];}
}
