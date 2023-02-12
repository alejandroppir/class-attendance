import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BreakpointFormatterDirective } from './breakpoint-formatter.directive';

@NgModule({
  declarations: [BreakpointFormatterDirective],
  imports: [CommonModule],
  exports: [BreakpointFormatterDirective],
})
export class DirectivesModule {}
