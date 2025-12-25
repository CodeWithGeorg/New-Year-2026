
export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export enum PageState {
  COUNTDOWN = 'COUNTDOWN',
  REVEALING = 'REVEALING',
  CELEBRATION = 'CELEBRATION'
}
