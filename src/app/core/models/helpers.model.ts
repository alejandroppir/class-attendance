export interface HelperElement {
 title: string;
 link: string;
}

export interface HelperGroup {
 group: string;
 helpers: Array<HelperElement | HelperGroup>;
}

export type Helper = HelperGroup | HelperElement;

export class HelperUtils {
 public static generateHelperId(): string {
  return `H-${new Date().getTime().toString()}`;
 }
}
