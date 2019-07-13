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
    MatDividerModule,
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

import { MarkdownToHtmlModule } from 'markdown-to-html-pipe';
import { QRCodeModule } from 'angularx-qrcode';

import { FromWeiPipe } from './pipes/from-wei/from-wei.pipe';
import { ToDaiPipe } from './pipes/to-dai/to-dai.pipe';
import { OrderByPipe } from './pipes/order-by/order-by.pipe';
import { TimePipe } from './pipes/time/time.pipe';

import { HomeComponent } from './views/home/home.component';
import { CreateComponent } from './views/create/create.component';
import { HeaderComponent } from './components/header/header.component';
import { DetailsComponent } from './components/details/details.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { NetworkComponent } from './views/network/network.component';
import { ProfileComponent } from './views/profile/profile.component';
import { EditComponent } from './views/edit/edit.component';

import { TransferDialog } from './components/header/header.component';
import { QrcodeDialog } from './components/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    FromWeiPipe,
    ToDaiPipe,
    OrderByPipe,
    HomeComponent,
    CreateComponent,
    HeaderComponent,
    DetailsComponent,
    ToolbarComponent,
    TransferDialog,
    QrcodeDialog,
    TimePipe,
    NetworkComponent,
    ProfileComponent,
    EditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MarkdownToHtmlModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDividerModule,
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
    QRCodeModule,
  ],
  providers: [

  ],
  entryComponents: [
      TransferDialog,
      QrcodeDialog,
  ],
  bootstrap: [
      AppComponent
  ]
})
export class AppModule { }
