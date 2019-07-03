import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatToolbarModule,
} from '@angular/material';

import { FromWeiPipe } from './pipes/from-wei/from-wei.pipe';
import { ToDaiPipe } from './pipes/to-dai/to-dai.pipe';
import { OrderByPipe } from './pipes/order-by/order-by.pipe';
import { TimePipe } from './pipes/time/time.pipe';

import { HomeComponent } from './views/home/home.component';
import { CreateComponent } from './views/create/create.component';
import { MedaoComponent } from './views/medao/medao.component';
import { HeaderComponent } from './components/header/header.component';
import { DetailsComponent } from './components/details/details.component';
import { ContractComponent } from './components/contract/contract.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

import { EditDialog } from './components/header/header.component';
import { TransferDialog } from './components/header/header.component';
import { TradeDialog } from './components/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    FromWeiPipe,
    ToDaiPipe,
    OrderByPipe,
    HomeComponent,
    CreateComponent,
    MedaoComponent,
    HeaderComponent,
    DetailsComponent,
    ContractComponent,
    ToolbarComponent,
    EditDialog,
    TransferDialog,
    TradeDialog,
    TimePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatToolbarModule,
  ],
  providers: [

  ],
  entryComponents: [
      EditDialog,
      TransferDialog,
      TradeDialog,
  ],
  bootstrap: [
      AppComponent
  ]
})
export class AppModule { }
