# @OnPropertyChange
A Typescript decorator to watch class properties changes

## Installation
```
npm install on-property-change --save
```

## Examples

### Listening to a single property
```
class Person {
  name: string;

  @OnPropertyChange('name')
  doStuff() {
      console.log(`Name has been changed:`, this.name);
  }
}
```
##### Usage
```
const p = new Person();
p.name = 'John';
p.name = 'Kyle';
```

##### Console output
```
Name has been changed: John
Name has been changed: Kyle
```

### Listening to multiple properties
The `doStuff` method is called after both properties are initialised
```
class Person {
  public name: string;
  public age: number;

  @OnPropertyChange('name', 'age')
  public doStuff() {
      console.log(`${this.name} is ${this.age} years old`);
  }
}
```
##### Usage
```
const p = new Person();
p.name = 'John';
p.age = 18;
p.age = 22;
```
##### Console output
```
John is 18 years old
John is 22 years old
```
####  Bulk change
It is possible to call the method only when **all the properties** have changed
```
class Point {
  public x: number;
  public y: number;

  @OnPropertyChange({ props: ['x', 'y'], bulk: true })
  public move(): void {
    console.log(`Move to ${this.x}:${this.y}`);
  }
}
```
##### Usage
```
const p = new Point();
p.x = '5';
p.x = '3';  
p.y = 8;   // Move to 3:8
p.y = 16;
p.x = 10;  // Move to 10:16
```
##### Console output
```
Move to 3:8
Move to 10:16
```
### Listening to multiple properties separately
You can have multiple decorated methods with any combinations of properties
```
class Person {
  name: string;
  age: number;

  @OnPropertyChange('name')
  doStuff() {
      console.log('change name')
  }

  @OnPropertyChange('age')
  doStuff2() {
      console.log('change age 1')
  }

  @OnPropertyChange('age')
  doStuff3() {
      console.log('change age 2')
  }
}
```
##### Usage
```
const p = new Person();
p.name = 'John';
p.age = 18;
```

##### Console output
```
change name
change age 1
change age 2
```

### Optional method arguments
The `doStuff` method can have arguments. They are the same values as the class fields.
```
class Person {
  public name: string;
  public age: number;

  @OnPropertyChange('name', 'age')
  public doStuff(name: string, age: number) {
      console.log(`${name} is ${age} years old`);
  }
}
```

### Compare with the previous value
The `history` flag allows you to get the previous value of the property.
```
class Person {
  name: string;

  @OnPropertyChange({ props: ['name'], history: true })
  doStuff(name: PropertyChange<string>) {
      console.log(`User has changed name from ${name.previousValue} to ${name.currentValue}`);
  }
}
```
##### Usage
```
const p = new Person();
p.name = 'John';
p.name = 'Kyle';
```

##### Console output
```
User has changed name from undefined to John
User has changed name from John to Kyle
```

The full metadata looks like this:
```
export interface PropertyChange<T> {
    firstChange: boolean;
    previousValue: T;
    currentValue: T;
}
```

### As a replacement for `ngOnChanges` in Angular projects
```
@Component({
    selector: 'app-person-card',
    templateUrl: './person-card.component.html',
    styleUrls: ['./person-card.component.css']
})
export class PersonCardComponent {
    @Input() name: string;

    @OnPropertyChange('name')
    doStuff() {
        // do stuff
    }
}
```
