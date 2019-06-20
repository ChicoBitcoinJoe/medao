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
    MatSliderModule,
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
    MatRadioModule
} from '@angular/material';

import { FromWeiPipe } from './pipes/from-wei/from-wei.pipe';
import { ToDaiPipe } from './pipes/to-dai/to-dai.pipe';
import { OrderByPipe } from './pipes/order-by/order-by.pipe';

import { HomeComponent } from './views/home/home.component';
import { MedaoComponent } from './views/medao/medao.component';
import { PostComponent } from './components/post/post.component';
import { SendDialog } from './components/medao-highlight/medao-highlight.component';
import { TradeDialog } from './components/medao-highlight/medao-highlight.component';
import { CreateComponent } from './views/create/create.component';
import { SidenavLeftComponent } from './components/sidenav-left/sidenav-left.component';
import { SidenavRightComponent } from './components/sidenav-right/sidenav-right.component';
import { MedaoHeaderComponent } from './components/medao-header/medao-header.component';
import { MedaoHighlightComponent } from './components/medao-highlight/medao-highlight.component';
import { MedaoDetailsComponent } from './components/medao-details/medao-details.component';

@NgModule({
  declarations: [
    AppComponent,
    FromWeiPipe,
    ToDaiPipe,
    OrderByPipe,
    HomeComponent,
    MedaoComponent,
    PostComponent,
    SendDialog,
    TradeDialog,
    CreateComponent,
    SidenavLeftComponent,
    SidenavRightComponent,
    MedaoHeaderComponent,
    MedaoHighlightComponent,
    MedaoDetailsComponent
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
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSnackBarModule,
    MatToolbarModule,
  ],
  providers: [],
  entryComponents: [
      SendDialog,
      TradeDialog
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
