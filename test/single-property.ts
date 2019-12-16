import { OnChange } from '../src';
import SpyInstance = jest.SpyInstance;

class Person {
    name: string;

    @OnChange('name')
    renamed(name: string): void {
        console.log(name);
    }
}

describe('SingleProperty', () => {

    let person: Person;
    let spy: SpyInstance;

    beforeEach(() => {
        person = new Person();
        spy = jest.spyOn(console, 'log');
    });

    it('should call decorated method on each property change', () => {
        expect(spy).not.toHaveBeenCalled();

        person.name = 'Mark';
        expect(spy).toHaveBeenCalledWith('Mark');

        person.name = 'John';
        expect(spy).toHaveBeenCalledWith('John');
    });
});
