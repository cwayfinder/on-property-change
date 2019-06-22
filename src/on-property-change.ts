import { OnPropertyChangeConfig } from "./on-property-change-config";

const valuesCacheKey = Symbol();
const lastCallKey = Symbol();

export function OnPropertyChange(config: OnPropertyChangeConfig): MethodDecorator;
export function OnPropertyChange(...propNames: string[]): MethodDecorator;
export function OnPropertyChange(...args: any[]): MethodDecorator {
    const config = normaliseConfig(args);

    return (clazz: any, methodName: PropertyKey): void => {
        for (const propertyName of config.propNames) {
            const originalDescriptor = Object.getOwnPropertyDescriptor(clazz, propertyName);

            Object.defineProperty(clazz, propertyName, {
                set(value) {
                    const instance = this;
                    ensureHiddenProps(instance);
                    updateValueCache(instance, propertyName, value);

                    if (originalDescriptor) {
                        originalDescriptor.set.call(instance, value);
                    }

                    if (shouldCallTargetMethod(clazz, instance, methodName, config)) {
                        callTargetMethod(clazz, instance, methodName, config);
                    }
                },
                get() {
                    const instance = this;
                    if (originalDescriptor) {
                        return originalDescriptor.get.call(instance);
                    } else {
                        const cache = instance[valuesCacheKey] && instance[valuesCacheKey][propertyName];
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

function ensureHiddenProps(instance) {
    if (!instance[valuesCacheKey]) {
        instance[valuesCacheKey] = {};
    }
    if (!instance[lastCallKey]) {
        instance[lastCallKey] = {};
    }
}

function updateValueCache(instance, propName, value) {
    if (instance[valuesCacheKey][propName]) {
        instance[valuesCacheKey][propName].firstChange = false;
    } else {
        instance[valuesCacheKey][propName] = { firstChange: true };
    }

    const cache = instance[valuesCacheKey][propName];
    cache.previousValue = cache.currentValue;
    cache.currentValue = value;
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
