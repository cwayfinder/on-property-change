import { ChangeSensitivityStrategy, OnPropertyChange, PropertyChange } from '../src';

class Point {
    public age: number;
    public name: number;

    @OnPropertyChange({
        propNames: ['name', 'age'],
        keepHistory: true,
        changeSensitivity: ChangeSensitivityStrategy.Bulk,
    })
    public onNameChange(name: PropertyChange<number>, age: PropertyChange<number>): void {
        console.log(name.currentValue, age.currentValue);
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

            point.name = 10;
            point.age = 10;
            expect(spy).toHaveBeenCalledWith(10, 10);
            expect(spy).toHaveBeenCalledTimes(1);

            point.name = 15;
            expect(spy).toHaveBeenCalledTimes(1);

            point.age = 15;
            expect(spy).toHaveBeenCalledWith(15, 15);
            expect(spy).toHaveBeenCalledTimes(2);
        });

    });
});
