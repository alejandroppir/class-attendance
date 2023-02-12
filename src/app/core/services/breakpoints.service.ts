import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export enum CustomBreakpointStates {
  WebPortrait = 'web-p',
  WebLandscape = 'web-l',
  HandsetPortrait = 'phone-p',
  HandsetLandscape = 'phone-l',
  TabletPortrait = 'tablet-p',
  TabletLandscape = 'tablet-l',
}

@Injectable({
  providedIn: 'root',
})
export class BreakpointsService {
  bpState$: Observable<BreakpointState>;
  constructor(private responsive: BreakpointObserver) {
    this.bpState$ = this.responsive.observe(this.getDetectableBreakpoints());
    this.bpState$.subscribe((breakpointsList) => {
      const currentBreakpoins = this.filterCurrentBreakpoints(
        breakpointsList
      ).map((breakpoint) => breakpoint[0]);
    });
  }

  public filterCurrentBreakpoints(
    breakpointsList: BreakpointState
  ): [string, boolean][] {
    return Object.entries(breakpointsList.breakpoints).filter(
      (breakpoint) => breakpoint[1]
    );
  }

  public breakpointsToCustom(breakpointsList: string[]): string[] {
    return breakpointsList
      .map((breakpoint) => breakpointClassMap.get(breakpoint))
      .filter((item) => item) as string[];
  }

  public getBreakpointClassMap(): Map<string, string> {
    return breakpointClassMap;
  }
  public getDetectableBreakpoints(): string[] {
    return detectableBreakpoints;
  }
}

const breakpointClassMap = new Map<string, string>([
  [Breakpoints.WebPortrait, CustomBreakpointStates.WebPortrait],
  [Breakpoints.WebLandscape, CustomBreakpointStates.WebLandscape],
  [Breakpoints.HandsetPortrait, CustomBreakpointStates.HandsetPortrait],
  [Breakpoints.HandsetLandscape, CustomBreakpointStates.HandsetLandscape],
  [Breakpoints.TabletPortrait, CustomBreakpointStates.TabletPortrait],
  [Breakpoints.TabletLandscape, CustomBreakpointStates.TabletLandscape],
]);

const detectableBreakpoints = [
  Breakpoints.HandsetPortrait,
  Breakpoints.TabletPortrait,
  Breakpoints.WebPortrait,
  Breakpoints.HandsetLandscape,
  Breakpoints.TabletLandscape,
  Breakpoints.WebLandscape,
];
