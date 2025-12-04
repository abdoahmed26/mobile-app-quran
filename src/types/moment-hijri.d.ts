declare module 'moment-hijri' {
  import { Moment } from 'moment';
  
  interface MomentHijri extends Moment {
    iYear(): number;
    iYear(year: number): MomentHijri;
    iMonth(): number;
    iMonth(month: number): MomentHijri;
    iDate(): number;
    iDate(date: number): MomentHijri;
    iDaysInMonth(): number;
    format(format?: string): string;
  }
  
  function momentHijri(date?: Date | string | number): MomentHijri;
  
  export = momentHijri;
}
