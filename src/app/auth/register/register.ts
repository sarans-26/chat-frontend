import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
interface RegisterForm{
  name:string,
  password:string
}
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,NgIf],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerFormData=new FormGroup({
    name:new FormControl('',[Validators.required,Validators.minLength(3)]),
    password:new FormControl('',[Validators.minLength(6)])
  })
  get f(){//for not wrting each time this.registerFormData.controls
    return this.registerFormData.controls;
  }

  onSubmit():void{
    console.log(this.f);
    if(this.registerFormData.invalid){
      this.registerFormData.markAllAsTouched();
      return;
    }
    const { name, password } = this.registerFormData.value;
    console.log('Registering user:', { name, password });

  }



}
