export interface GroupDayShift {
  initHour: number;
  endHour: number;
}

export interface Group {
  id: string;
  groupName: string;
  price: number;
  monday: GroupDayShift;
  tuesday: GroupDayShift;
  wednesday: GroupDayShift;
  thursday: GroupDayShift;
  friday: GroupDayShift;
  saturday: GroupDayShift;
  sunday: GroupDayShift;
  students?: string[];
}

export class GroupUtils {
  public static generateGroupId(): string {
    return `G-${new Date().getTime().toString()}`;
  }
}
