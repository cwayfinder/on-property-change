# @OnPropertyChange
A Typescript decorator to watch class properties changes

## Instalation
```
npm install on-property-change --save
```

## Usage

### Listening to a single property
```
class Person {
  name: string;

  @OnPropertyChange('name') 
  doStuff(name: string) {
      console.log(`Name has been changed:`, name);
  }
}

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
  name: string;
  age: number;

  @OnPropertyChange('name', 'age')
  doStuff(name: string, age: number) {
      console.log(`${name} is ${age} years old`);
  }
}

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

### Listening to multiple properties separately
You can have multiple decorated methods with any combinations of properties
```
class Person {
  name: string;
  age: number;

  @OnPropertyChange('name')
  doStuff(name: string) {
      console.log('change name')
  }
  
  @OnPropertyChange('age')
  doStuff2(age: number) {
      console.log('change age 1')
  }
  
  @OnPropertyChange('age')
  doStuff3(age: number) {
      console.log('change age 2')
  }
}

const p = new Person();
p.name = 'John';
p.age = 18;
```

##### Console output
```
change name
change age 1
change age 1
```

### Compare with the previous value
The `keepHistory` flag allows you to get the previous value of the property.
```
class Person {
  name: string;

  @OnPropertyChange({ propNames: ['name'], keepHistory: true })
  doStuff(name: PropertyChange<string>) {
      console.log(`User has changed name from ${name.previousValue} to ${name.currentValue}`);
  }
}

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
    doStuff(name: string) {
        // do stuff
    }
}
```
