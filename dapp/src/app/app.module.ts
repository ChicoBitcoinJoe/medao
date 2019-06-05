import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
    MatSelectModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
} from '@angular/material';

import { FromWeiPipe } from './pipes/from-wei/from-wei.pipe';
import { ToDaiPipe } from './pipes/to-dai/to-dai.pipe';
import { OrderByPipe } from './pipes/order-by/order-by.pipe';

import { HomeComponent } from './views/home/home.component';
import { MedaoComponent } from './views/medao/medao.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SigninButtonComponent } from './components/signin-button/signin-button.component';
import { MobileViewComponent } from './components/mobile-view/mobile-view.component';
import { DesktopViewComponent } from './components/desktop-view/desktop-view.component';
import { TabletViewComponent } from './components/tablet-view/tablet-view.component';
import { PostComponent } from './components/post/post.component';

@NgModule({
  declarations: [
    AppComponent,
    FromWeiPipe,
    ToDaiPipe,
    OrderByPipe,
    HomeComponent,
    MedaoComponent,
    ToolbarComponent,
    SigninButtonComponent,
    MobileViewComponent,
    DesktopViewComponent,
    TabletViewComponent,
    PostComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
