import { ChangeSensitivityStrategy } from './change-sensitivity-strategy';
import { OnPropertyChangeConfig } from './on-property-change-config';

export function OnPropertyChange(config: OnPropertyChangeConfig): MethodDecorator;
export function OnPropertyChange(...propNames: string[]): MethodDecorator;
export function OnPropertyChange(...args: any[]): MethodDecorator {
    const config = normaliseConfig(args);
    const valuesCacheKey = Symbol();

    return (target: any, methodName: PropertyKey): void => {
        for (const propName of config.propNames) {
            const originalDescriptor = Object.getOwnPropertyDescriptor(target, propName);

            Object.defineProperty(target, propName, {
                set(value) {
                    if (!this[valuesCacheKey]) {
                        this[valuesCacheKey] = {};
                    }

                    if (this[valuesCacheKey][propName]) {
                        // we don't want to call the callback if previous and current values are equal by reference
                        if (this[valuesCacheKey][propName].currentValue === value &&
                          config.changeSensitivity === ChangeSensitivityStrategy.OnDefined) {
                            this[valuesCacheKey][propName].previousValue = this[valuesCacheKey][propName].currentValue;
                            return;
                        }

                        this[valuesCacheKey][propName].firstChange = false;
                    } else {
                        this[valuesCacheKey][propName] = { firstChange: true };
                    }

                    this[valuesCacheKey][propName].previousValue = this[valuesCacheKey][propName].currentValue;
                    if (originalDescriptor) {
                        originalDescriptor.set.call(this, value);
                    }
                    this[valuesCacheKey][propName].currentValue = value;

                    const definedPropNames = Object.keys(this[valuesCacheKey]);
                    const allPropsDefined = config.propNames.every(name => definedPropNames.includes(name));

                    if (allPropsDefined || config.changeSensitivity === ChangeSensitivityStrategy.Always) {
                        const mapper = config.keepHistory ? p => this[valuesCacheKey][p] : p => this[valuesCacheKey][p].currentValue;
                        const values = config.propNames.map(mapper);

                        if (config.changeSensitivity === ChangeSensitivityStrategy.Bulk) {
                            if  (allKeysChanged(values)) {
                                target[methodName].call(this, ...values);
                            }
                        } else {
                            target[methodName].call(this, ...values);
                        }
                    }
                },
                get() {
                    if (originalDescriptor) {
                        return originalDescriptor.get.call(this);
                    } else {
                        return this[valuesCacheKey][propName].currentValue;
                    }
                },
            });
        }
    };
}

function normaliseConfig(args: any[]): OnPropertyChangeConfig {
    if (typeof args[0] === 'string') {
        return {
            propNames: args,
            changeSensitivity: ChangeSensitivityStrategy.OnDefined,
            keepHistory: false,
        };
    } else {
        return args[0] as OnPropertyChangeConfig;
    }
}

function checkValuesChange(values: any[]): boolean {
    return values.every(value => value.currentValue && value.previousValue !== value.currentValue);
}

function allKeysChanged(values: any[]): boolean {
    return (values.every(v => !v.firstChange) && checkValuesChange(values)) || values.every(v => v.firstChange);
}

