import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; import { MatButtonModule } from '@angular/material/button'; import { MatTableModule } from '@angular/material/table'; import { MatChipsModule } from '@angular/material/chips'; import { MatSelectModule } from '@angular/material/select';
import { VehicleResponse, VehicleStatus } from '../../../core/models/fleet.models'; import { VehicleService } from '../../../core/services/vehicle.service'; import { ApiErrorService } from '../../../core/services/api-error.service';
@Component({selector:'app-vehicle-list',standalone:true,imports:[RouterLink,MatCardModule,MatButtonModule,MatTableModule,MatChipsModule,MatSelectModule],templateUrl:'./vehicle-list.component.html',styleUrl:'./vehicle-list.component.css'})
export class VehicleListComponent{
 private readonly service=inject(VehicleService);private readonly errors=inject(ApiErrorService);vehicles:VehicleResponse[]=[];error='';readonly columns=['registrationNumber','vehicleType','capacityKg','status','actions'];readonly statuses=Object.values(VehicleStatus).filter(v=>typeof v==='number') as number[];
 ngOnInit():void{this.load();}
 load():void{this.service.getAll().subscribe({next:v=>this.vehicles=v,error:e=>this.error=this.errors.message(e)});}
 statusName(s:VehicleStatus):string{return VehicleStatus[s];}
 changeStatus(v:VehicleResponse,s:number):void{this.service.updateStatus(v.id,{status:s as VehicleStatus}).subscribe({next:x=>v.status=x.status,error:e=>this.error=this.errors.message(e)});}
 delete(id:number):void{if(!confirm('Delete this vehicle?'))return;this.service.delete(id).subscribe({next:()=>this.load(),error:e=>this.error=this.errors.message(e)});}
}
