export interface PropertyChange<T> {
    firstChange: boolean;
    previousValue: T;
    currentValue: T;
}
