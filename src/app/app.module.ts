import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { UrComponent } from './views/ur/ur.component';

// Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from './views/ur/components/dialog/dialog.component';
import { SnacktimeComponent } from './views/ur/ur.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  entryComponents: [
    DialogComponent,
    SnacktimeComponent
  ],
  declarations: [
    AppComponent,
    UrComponent,
    DialogComponent,
    SnacktimeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
