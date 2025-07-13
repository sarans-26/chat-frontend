import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
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
  error:string=""
  success:string=""

  constructor(private auth:AuthService,private router:Router){  }

  registerFormData=new FormGroup({
    name:new FormControl('',[Validators.required,Validators.minLength(3)]),
    password:new FormControl('',[Validators.minLength(6)])
  })
  get f(){//for not wrting each time this.registerFormData.controls
    return this.registerFormData.controls;
  }

  async onSubmit():Promise<void>{
    if(this.registerFormData.invalid){
      this.registerFormData.markAllAsTouched();
      return;
    }

    // console.log(this.f);
    // if(this.registerFormData.invalid){
    //   this.registerFormData.markAllAsTouched();
    //   return;
    // }
    const { name  , password } = this.registerFormData.value;
    if(!name||!password)return;
    // console.log('Registering user:', { name, password });
    try{
      const response= await this.auth.login(name,password);
      this.auth.fetchCurrentUser();
      this.success='done'
      this.router.navigate(['/chat'])
    }catch(e:any){
      this.error=e.error?.message||'Registration failed';
    }

  }



}
