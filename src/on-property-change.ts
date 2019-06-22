import { OnPropertyChangeConfig } from "./on-property-change-config";

const valuesCacheKey = Symbol();
const lastCallKey = Symbol();

export function OnPropertyChange(config: OnPropertyChangeConfig): MethodDecorator;
export function OnPropertyChange(...propNames: string[]): MethodDecorator;
export function OnPropertyChange(...args: any[]): MethodDecorator {
    const config = normaliseConfig(args);

    return (target: any, methodName: PropertyKey): void => {
        for (const propName of config.propNames) {
            const originalDescriptor = Object.getOwnPropertyDescriptor(target, propName);

            Object.defineProperty(target, propName, {
                set(value) {
                    if (!this[valuesCacheKey]) {
                        this[valuesCacheKey] = {};
                    }
                    if (!this[lastCallKey]) {
                        this[lastCallKey] = {};
                    }

                    if (this[valuesCacheKey][propName]) {
                        // we don't want to call the callback if previous and current values are equal by reference
                        if (this[valuesCacheKey][propName].currentValue === value) {
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

                    if (shouldCallTargetMethod(target, this, methodName, config)) {
                        callTargetMethod(target, this, methodName, config);
                    }
                },
                get() {
                    if (originalDescriptor) {
                        return originalDescriptor.get.call(this);
                    } else {
                        const cache = this[valuesCacheKey] && this[valuesCacheKey][propName];
                        return cache ? cache.currentValue : undefined;
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
            bulk: false,
            keepHistory: false,
        };
    } else {
        return args[0] as OnPropertyChangeConfig;
    }
}

function shouldCallTargetMethod(clazz: any, instance: any, methodName: PropertyKey, config: OnPropertyChangeConfig): boolean {
    const definedPropNames = Object.keys(instance[valuesCacheKey]);
    const allPropsDefined = config.propNames.every(name => definedPropNames.includes(name));
    if (allPropsDefined) {
        if (config.bulk) {
            const neverCalled = !instance[lastCallKey][methodName];
            return neverCalled || config.propNames.every(p => instance[valuesCacheKey][p].currentValue !== instance[lastCallKey][methodName][p]);
        }
        return true;
    }

    return false;
}

function callTargetMethod(clazz: any, instance: any, methodName: PropertyKey, config: OnPropertyChangeConfig): void {
    const valueMap = instance[valuesCacheKey];
    const mapper = config.keepHistory ? p => valueMap[p] : p => valueMap[p].currentValue;
    const values = config.propNames.map(mapper);

    clazz[methodName].call(instance, ...values);

    instance[lastCallKey][methodName] = config.propNames.reduce((obj, p) => ({ ...obj, [p]: valueMap[p].currentValue }), {});
}
