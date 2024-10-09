import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {LoginRequest} from "../../models/LoginRequest";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  usernameErrorMessage: string | null = null;
  passwordErrorMessage: string | null = null;
  errorMessage: string | null = null;
  loading: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }


  get form() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.loading = true;

    this.usernameErrorMessage = null;
    this.passwordErrorMessage = null;
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.loading = false;
      return;
    }

    const loginRequest: LoginRequest = {
      username: this.form['username'].value,
      password: this.form['password'].value
    }

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/messenger']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Login failed', error);
        if (error.status === 400) {
          if (error.error.message.includes('Username')) {
            this.usernameErrorMessage = 'User with this username does not exists';
          }

          if (error.error.message.includes('password')) {
            this.passwordErrorMessage = 'Wrong password';
          }
        } else {

          this.toastr.error('Server error has occurred, Try again later!', 'Error');
          this.errorMessage = error.error.message || 'An error occurred during login';
        }
      },
      complete: () => {
        this.loading = false;
      }
    });

  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
