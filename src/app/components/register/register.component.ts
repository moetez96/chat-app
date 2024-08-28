import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from "../../services/auth.service";
import { SignupRequest } from "../../models/SignupRequest";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  submitted = false;
  errorMessage: string | null = null;
  usernameErrorMessage: string | null = null;
  emailErrorMessage: string | null = null;

  constructor(private formBuilder: FormBuilder, private authService: AuthService,
              private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  get form() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    this.usernameErrorMessage = null;
    this.emailErrorMessage = null;
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      return;
    }

    const signupRequest: SignupRequest = {
      username: this.form['username'].value,
      email: this.form['email'].value,
      password: this.form['password'].value,
    };

    this.authService.register(signupRequest).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed', error.status);
        if (error.status === 400) {
          if (error.error.message.includes('Username')) {
            this.usernameErrorMessage = 'The username is already taken or invalid';
          }

          if (error.error.message.includes('Email')) {
            this.emailErrorMessage = 'The email is already in use or invalid';
          }
        } else {
          this.errorMessage = error.error.message || 'An error occurred during registration';
        }
      }
    });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }

    return null;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
