import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RoutingConstants } from 'src/app/core/constants/general.constants';
import { FirestoreService } from 'src/app/core/services/firestore.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  loginUser = new FormGroup({
    username: new FormControl(null, [Validators.required]),
    pass: new FormControl(null, [Validators.required]),
  });
  loginUserPassHide = true;

  constructor(
    private firestoreService: FirestoreService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  login() {
    if (!this.loginUser.valid) {
      this.openSnackBar(this.translate.instant('FORM_NOT_VALID'));
      return;
    }

    this.firestoreService
      .login(
        this.loginUser.get('username')?.value,
        this.loginUser.get('pass')?.value
      )
      .subscribe({
        next: (data) => {
          this.loginUser.reset();
          this.router.navigate([RoutingConstants.PATH_EMPTY]);
          this.openSnackBar(this.translate.instant('LOGIN_SUCCESS'));
        },
        error: (error) => {
          console.error(error);
          this.openSnackBar(
            this.translate.instant(error.code.replace('/', '-'))
          );
        },
      });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 5000,
    });
  }
}
