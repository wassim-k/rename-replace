import { bootstrapApplication } from '@angular/platform-browser';
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeCheckbox, vsCodeDataGrid, vsCodeDataGridCell, vsCodeDataGridRow, vsCodeRadio, vsCodeRadioGroup, vsCodeTextField } from '@vscode/webview-ui-toolkit';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

provideVSCodeDesignSystem().register(
  vsCodeRadioGroup(),
  vsCodeRadio(),
  vsCodeButton(),
  vsCodeCheckbox(),
  vsCodeDataGrid(),
  vsCodeDataGridCell(),
  vsCodeDataGridRow(),
  vsCodeTextField()
);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
