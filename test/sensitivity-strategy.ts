import { ChangeSensitivityStrategy, OnPropertyChange, PropertyChange } from '../src';

class Point {
    public x: number;
    public y: number;

    @OnPropertyChange({
        propNames: ['x', 'y'],
        keepHistory: true,
        changeSensitivity: ChangeSensitivityStrategy.Bulk,
    })
    public onCoordinatesChange(x: PropertyChange<number>, y: PropertyChange<number>): void {
        console.log(x.currentValue, y.currentValue);
    }
}

describe('Sensitivity strategies', () => {
    describe('Bulk property change detection', () => {
        let point: Point;
        let spy: jest.SpyInstance;

        beforeEach(() => {
            point = new Point();
            spy = jest.spyOn(console, 'log');
        });

        it('should call decorated method only when all properties changed', () => {
            expect(spy).not.toHaveBeenCalled();

            point.y = 10;
            point.x = 10;
            expect(spy).toHaveBeenCalledWith(10, 10);
            expect(spy).toHaveBeenCalledTimes(1);

            point.y = 15;
            expect(spy).toHaveBeenCalledTimes(1);

            point.x = 15;
            expect(spy).toHaveBeenCalledWith(15, 15);
            expect(spy).toHaveBeenCalledTimes(2);
        });

    });
});
