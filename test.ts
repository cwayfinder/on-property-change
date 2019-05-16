import { ChangeSensitivityStrategy, OnPropertyChange, PropertyChange } from './src';

class SinglePropertyChangeTest {
  public singleName: string;

  public changedName: string;

  @OnPropertyChange('singleName')
  public onNameChange(singleName: string): void {
    this.changedName = singleName;
  }
}

class BulkPropertyChangeTest {
  public age: number;
  public name: string;

  public changedAge: number;
  public changedName: string;

  @OnPropertyChange({
    propNames: ['name', 'age'],
    keepHistory: true,
    changeSensitivity: ChangeSensitivityStrategy.Bulk,
  })
  public onNameChange(name: PropertyChange<string>, age: PropertyChange<number>): void {
    this.changedName = name.currentValue;
    this.changedAge = age.currentValue;
  }
}

describe('OnPropertyChange', () => {

  describe('Single property change detection', () => {
    let singlePropertyTestClass: SinglePropertyChangeTest;

    beforeEach(() => {
      singlePropertyTestClass = new SinglePropertyChangeTest();
    });

    it('should call decorated method on each property change', function () {

      expect(singlePropertyTestClass.changedName).toBeFalsy();

      singlePropertyTestClass.singleName = 'First';
      expect(singlePropertyTestClass.changedName).toEqual('First');

      singlePropertyTestClass.singleName = 'Change';
      expect(singlePropertyTestClass.changedName).toEqual('Change');
    });

  });
  describe('Bulk property change detection', () => {
    let bulkPropertyTestClass: BulkPropertyChangeTest;

    beforeEach(() => {
      bulkPropertyTestClass = new BulkPropertyChangeTest();
    });

    it('should call decorated method only when all properties changed', function () {

      expect(bulkPropertyTestClass.changedName).toBeFalsy();
      expect(bulkPropertyTestClass.changedAge).toBeFalsy();

      bulkPropertyTestClass.name = 'First';
      bulkPropertyTestClass.age = 10;

      expect(bulkPropertyTestClass.changedName).toEqual('First');
      expect(bulkPropertyTestClass.changedAge).toEqual(10);

      bulkPropertyTestClass.name = 'Second';

      expect(bulkPropertyTestClass.changedName).toEqual('First');
      expect(bulkPropertyTestClass.changedAge).toEqual(10);

      bulkPropertyTestClass.age = 15;

      expect(bulkPropertyTestClass.changedName).toEqual('Second');
      expect(bulkPropertyTestClass.changedAge).toEqual(15);
    });

  });

});