import { Component, inject } from '@angular/core'; import { ActivatedRoute, RouterLink } from '@angular/router'; import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card'; import { MatButtonModule } from '@angular/material/button';
import { DriverService } from '../../../core/services/driver.service'; import { DriverResponse } from '../../../core/models/fleet.models'; import { ApiErrorService } from '../../../core/services/api-error.service';
@Component({selector:'app-driver-detail',standalone:true,imports:[RouterLink,DatePipe,MatCardModule,MatButtonModule],templateUrl:'./driver-detail.component.html',styleUrl:'./driver-detail.component.css'})
export class DriverDetailComponent{private readonly route=inject(ActivatedRoute);private readonly service=inject(DriverService);private readonly errors=inject(ApiErrorService);driver:DriverResponse|null=null;error='';
ngOnInit():void{const id=Number(this.route.snapshot.paramMap.get('id'));this.service.getById(id).subscribe({next:d=>this.driver=d,error:e=>this.error=this.errors.message(e)});}
}
