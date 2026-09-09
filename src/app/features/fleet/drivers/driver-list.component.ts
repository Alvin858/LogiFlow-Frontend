import { Component, inject } from '@angular/core'; import { DatePipe } from '@angular/common'; import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; import { MatButtonModule } from '@angular/material/button'; import { MatTableModule } from '@angular/material/table'; import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DriverResponse } from '../../../core/models/fleet.models'; import { DriverService } from '../../../core/services/driver.service'; import { ApiErrorService } from '../../../core/services/api-error.service';
@Component({selector:'app-driver-list',standalone:true,imports:[RouterLink,DatePipe,MatCardModule,MatButtonModule,MatTableModule,MatSlideToggleModule],templateUrl:'./driver-list.component.html',styleUrl:'./driver-list.component.css'})
export class DriverListComponent{
 private readonly service=inject(DriverService);private readonly errors=inject(ApiErrorService);drivers:DriverResponse[]=[];error='';readonly columns=['name','email','license','expiry','experience','availability','actions'];
 ngOnInit():void{this.load();}load():void{this.service.getAll().subscribe({next:d=>this.drivers=d,error:e=>this.error=this.errors.message(e)});}
 availability(d:DriverResponse,checked:boolean):void{this.service.updateAvailability(d.id,{isAvailable:checked}).subscribe({next:x=>{d.isAvailable=x.isAvailable;},error:e=>this.error=this.errors.message(e)});}
 delete(id:number):void{if(!confirm('Deactivate this driver?'))return;this.service.delete(id).subscribe({next:()=>this.load(),error:e=>this.error=this.errors.message(e)});}
}
