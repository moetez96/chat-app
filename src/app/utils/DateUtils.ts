export class DateUtils {

  static isToday(date: Date | undefined): boolean {
    if (date) {
      const today = new Date();
      return new Date(date).toDateString() === today.toDateString();
    }
    return false;
  }

  static isSameDay(date1: Date | undefined, date2: Date): boolean {
    if (date1) {
      return new Date(date1).toDateString() === new Date(date2).toDateString();
    }
    return false;
  }
}
