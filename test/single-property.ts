import { ChangeSensitivityStrategy, OnPropertyChange, PropertyChange } from '../src';
import SpyInstance = jest.SpyInstance;

class Person {
    name: string;

    @OnPropertyChange('name')
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

        person.name = 'First';
        expect(spy).toHaveBeenCalledWith('First');

        person.name = 'Change';
        expect(spy).toHaveBeenCalledWith('Change');
    });
});
